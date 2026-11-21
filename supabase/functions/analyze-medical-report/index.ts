import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ExtractedValue {
  parameter: string;
  value: string;
  unit?: string;
  reference_range?: string;
  status?: "Normal" | "High" | "Low" | "Attention" | "Unknown";
}

interface AnalysisResult {
  report_type: string;
  summary: string;
  is_unreadable?: boolean;
  extracted_values: ExtractedValue[];
  simple_explanation: string;
  attention_findings: string[];
  doctor_questions: string[];
  disclaimer: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const respond = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return respond({ error: "Missing Authorization header" }, 401);
    }

    // Authenticate user with their session JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });

    const {
      data: { user: caller },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !caller) {
      return respond({ error: "Invalid or expired login session." }, 401);
    }

    const { reportId, storagePath, mimeType, fileBase64 } = await req.json();

    if (!reportId || !storagePath) {
      return respond({ error: "Missing reportId or storagePath in request body." }, 400);
    }

    // Admin client for backend storage retrieval and report update
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Verify report ownership
    const { data: report, error: reportError } = await adminClient
      .from("medical_reports")
      .select("*")
      .eq("id", reportId)
      .maybeSingle();

    if (reportError || !report) {
      return respond({ error: "Medical report record not found." }, 404);
    }

    if (report.patient_id !== caller.id) {
      return respond({ error: "Forbidden: You do not have permission to access this report." }, 403);
    }

    // Update status to analyzing
    await adminClient
      .from("medical_reports")
      .update({ status: "analyzing", updated_at: new Date().toISOString() })
      .eq("id", reportId);

    // Retrieve file base64
    let base64Data = fileBase64;
    let effectiveMime = mimeType || report.mime_type || "image/jpeg";

    if (!base64Data) {
      const { data: fileBlob, error: downloadError } = await adminClient.storage
        .from("medical-reports")
        .download(storagePath);

      if (downloadError || !fileBlob) {
        throw new Error(`Failed to download report file from private storage: ${downloadError?.message || "File not found"}`);
      }

      effectiveMime = fileBlob.type || effectiveMime;
      const arrayBuffer = await fileBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      base64Data = btoa(binary);
    }

    // Check for AI Provider API Keys
    const geminiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!geminiKey && !openaiKey) {
      await adminClient
        .from("medical_reports")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", reportId);

      return respond(
        {
          error:
            "AI Provider API key is not configured in Supabase Edge Function secrets. Please configure GEMINI_API_KEY (or OPENAI_API_KEY) in the Supabase Dashboard to enable AI analysis.",
          code: "AI_KEY_MISSING",
        },
        503
      );
    }

    const clinicalSystemPrompt = `
You are an expert healthcare AI assistant for CareBridge, a healthcare coordination platform.
Your task is to analyze the provided medical report (such as Blood Test, ECG, X-Ray, Lab Report, or Medical Document) and provide a clear, patient-friendly, and medically cautious breakdown.

STRICT MEDICAL SAFETY RULES:
1. INFORMATIONAL ONLY: This analysis is for patient education and preparation for doctor consultation. It is NOT a medical diagnosis, clinical opinion, or prescription.
2. NEVER prescribe medications or suggest modifying prescribed treatments.
3. NEVER guarantee a report is normal or abnormal without uncertainty.
4. FOR UNCLEAR / BLURRY / ROTATED / PARTIAL IMAGES: Clearly explain that the document is partially or fully unreadable and prompt the patient to upload a clearer, properly lit image. Set "is_unreadable" to true if text/readings cannot be reliably deciphered.
5. DO NOT INVENT or assume missing parameters, names, or values.
6. FOR BLOOD / LAB REPORTS: Extract visible test names, results, standard reference ranges, and units. Identify whether values fall within standard normal bounds or are Elevated / Low.
7. FOR ECG TRACINGS: Provide cautious observations strictly from visible printed measurements (heart rate, PR interval, QRS duration, QT interval, rhythm label). State explicitly that a cardiologist or licensed doctor must interpret the actual waveform.
8. FOR X-RAYS & RADIOLOGY: Provide a cautious description of visible structures and typed radiologist notes. Explicitly state that a radiologist must interpret diagnostic images.
9. FOR POTENTIAL CONCERNS: Highlight values or findings that may warrant professional clinical attention, advising appropriate scheduling with their doctor. If symptoms are severe or life-threatening (e.g. severe chest pain, sudden numbness), advise contacting emergency services (112) immediately.

OUTPUT FORMAT REQUIREMENTS:
You MUST respond with valid JSON adhering strictly to this schema:
{
  "report_type": "string (e.g. Complete Blood Count (CBC), Lipid Profile, 12-Lead ECG, Chest X-Ray)",
  "summary": "string (concise overview of what this report is and the general picture)",
  "is_unreadable": false,
  "extracted_values": [
    {
      "parameter": "string (e.g. Hemoglobin, Total Cholesterol, Fasting Blood Glucose, Heart Rate)",
      "value": "string (e.g. 14.2, 220, 95, 72)",
      "unit": "string (e.g. g/dL, mg/dL, bpm)",
      "reference_range": "string (e.g. 13.0 - 17.0, < 200, 70 - 100)",
      "status": "Normal | High | Low | Attention | Unknown"
    }
  ],
  "simple_explanation": "string (explanation in simple, empathetic, plain language that a patient without medical training can understand)",
  "attention_findings": [
    "string (bullet points of findings or out-of-range parameters that the patient should discuss with their doctor)"
  ],
  "doctor_questions": [
    "string (specific, practical questions the patient can ask their doctor during their next visit)"
  ],
  "disclaimer": "This analysis is AI-generated for educational guidance only. It does not replace professional clinical evaluation, diagnosis, or treatment. Always discuss these findings with your qualified physician."
}
`;

    let analysisResult: AnalysisResult;

    if (geminiKey) {
      // Call Google Gemini API (gemini-3.8-flash)
      const model = "gemini-3.8-flash";
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

      const geminiBody = {
        contents: [
          {
            parts: [
              {
                text: clinicalSystemPrompt,
              },
              {
                inline_data: {
                  mime_type: effectiveMime,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.2,
        },
      };

      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", response.status, errorText);
        throw new Error(`AI Provider (Gemini) returned error ${response.status}: ${errorText}`);
      }

      const geminiJson = await response.json();
      const rawText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("No response content generated by AI vision model.");
      }

      analysisResult = JSON.parse(rawText);
    } else {
      // Call OpenAI API
      const openaiUrl = "https://api.openai.com/v1/chat/completions";
      const openaiBody = {
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: clinicalSystemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Please analyze this medical document following the strict JSON schema." },
              {
                type: "image_url",
                image_url: {
                  url: `data:${effectiveMime};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
      };

      const response = await fetch(openaiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify(openaiBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error:", response.status, errorText);
        throw new Error(`AI Provider (OpenAI) returned error ${response.status}: ${errorText}`);
      }

      const openaiJson = await response.json();
      const rawText = openaiJson.choices?.[0]?.message?.content;
      if (!rawText) {
        throw new Error("No response content generated by AI vision model.");
      }

      analysisResult = JSON.parse(rawText);
    }

    // Fallback disclaimer guarantee
    if (!analysisResult.disclaimer) {
      analysisResult.disclaimer =
        "This analysis is AI-generated for educational guidance only. It does not replace professional clinical evaluation, diagnosis, or treatment. Always discuss these findings with your qualified physician.";
    }

    // Persist completed analysis in database
    const { error: updateError } = await adminClient
      .from("medical_reports")
      .update({
        status: "completed",
        report_type: analysisResult.report_type || "General Medical Report",
        analysis: analysisResult,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (updateError) {
      console.error("Failed to update medical_reports table:", updateError);
    }

    return respond({
      success: true,
      reportId,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error("ANALYSIS FUNCTION ERROR:", error);
    return respond(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred during medical report analysis.",
      },
      500
    );
  }
});
