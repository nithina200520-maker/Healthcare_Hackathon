import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Camera,
  Upload,
  X,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Info,
  Copy,
  Check,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext";

export default function MedicalReportAnalyser() {
  const { t, language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [error, setError] = useState("");
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [currentReportId, setCurrentReportId] = useState(null);

  // Past reports history
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const loadReportsHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data, error: fetchError } = await supabase
        .from("medical_reports")
        .select("id, file_name, file_path, file_size, mime_type, report_type, status, analysis, created_at")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load reports history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Load report history on mount
  useEffect(() => {
    loadReportsHistory();
  }, [loadReportsHistory]);

  const validateAndSetFile = (file) => {
    setError("");
    if (!file) return;

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`File size exceeds 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`);
      return;
    }

    // Validate mime type
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "application/pdf",
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Unsupported format. Please upload a JPG, JPEG, PNG, WEBP image or a PDF document.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null); // PDF preview placeholder
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // strip data URL prefix (e.g. "data:image/jpeg;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyse = async () => {
    if (!selectedFile) {
      setError("Please select or capture a medical report first.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalysisStep("Authenticating session...");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to analyze medical reports.");
      }

      // Step 1: Upload to private Supabase Storage
      setAnalysisStep("Securely uploading report to private storage...");
      const timestamp = Date.now();
      const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `${user.id}/${timestamp}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("medical-reports")
        .upload(storagePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // Step 2: Insert record into public.medical_reports
      setAnalysisStep("Saving report record...");
      const { data: reportRecord, error: insertError } = await supabase
        .from("medical_reports")
        .insert({
          patient_id: user.id,
          file_name: selectedFile.name,
          file_path: storagePath,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Database error: ${insertError.message}`);
      }

      setCurrentReportId(reportRecord.id);

      // Step 3: Convert file to Base64 for fast direct transmission to AI model
      setAnalysisStep("Preparing multimodal AI analysis...");
      const base64Data = await fileToBase64(selectedFile);

      // Step 4: Invoke Edge Function
      setAnalysisStep("AI vision model analyzing report findings...");
      const { data: edgeData, error: fnError } = await supabase.functions.invoke(
        "analyze-medical-report",
        {
          body: {
            reportId: reportRecord.id,
            storagePath: storagePath,
            mimeType: selectedFile.type,
            fileBase64: base64Data,
            language: language,
          },
        }
      );

      if (fnError) {
        let msg = fnError.message || "Failed to analyze report.";
        try {
          const res = await fnError.context?.json();
          if (res?.error) msg = res.error;
        } catch {
          // keep fallback
        }
        throw new Error(msg);
      }

      if (edgeData?.error) {
        throw new Error(edgeData.error);
      }

      if (!edgeData?.analysis) {
        throw new Error("The AI model did not return a valid analysis structure.");
      }

      setCurrentAnalysis(edgeData.analysis);
      setAnalysisStep("");
      await loadReportsHistory();
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.message || "Unable to complete medical report analysis. Please try again.");
    } finally {
      setAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const handleDeleteReport = async (report) => {
    if (!window.confirm(`Are you sure you want to delete "${report.file_name}" and its analysis? This cannot be undone.`)) {
      return;
    }

    setDeletingId(report.id);
    try {
      // Delete from storage
      if (report.file_path) {
        await supabase.storage.from("medical-reports").remove([report.file_path]);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("medical_reports")
        .delete()
        .eq("id", report.id);

      if (dbError) throw dbError;

      if (currentReportId === report.id) {
        setCurrentAnalysis(null);
        setCurrentReportId(null);
      }

      setHistory((prev) => prev.filter((r) => r.id !== report.id));
    } catch (err) {
      alert(`Could not delete report: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewHistoricalAnalysis = (report) => {
    if (report.analysis && Object.keys(report.analysis).length > 0) {
      setCurrentAnalysis(report.analysis);
      setCurrentReportId(report.id);
      window.scrollTo({ top: document.getElementById("ai-report-analyser")?.offsetTop - 40, behavior: "smooth" });
    }
  };

  const copyQuestionToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // ignore
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "High":
        return { label: t("High"), bg: "#fee4e2", color: "#b42318" };
      case "Low":
        return { label: t("Low"), bg: "#fef3eb", color: "#b7791f" };
      case "Attention":
        return { label: t("Attention"), bg: "#fff1f0", color: "#cf1322" };
      case "Normal":
        return { label: t("Normal"), bg: "#e8f3ed", color: "#167044" };
      default:
        return { label: status ? t(status) : t("Observed"), bg: "#f1f5f9", color: "#475569" };
    }
  };

  return (
    <section className="dashboard-panel" id="ai-report-analyser" style={{ marginTop: 24, marginBottom: 24 }}>
      <div className="panel-heading">
        <div>
          <h2>
            <Sparkles size={22} style={{ color: "#087f68" }} /> {t("AI Medical Report Analyser")}
          </h2>
          <p>
            {t("Upload or photograph your medical documents for an intelligent, patient-friendly breakdown.")}
          </p>
        </div>
      </div>

      {/* PRIVACY & MEDICAL SAFETY NOTICE */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "12px 16px",
          background: "#f0f7f5",
          border: "1px solid #d4e8e1",
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 13,
          color: "#28443d",
        }}
      >
        <Info size={18} style={{ color: "#087f68", flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Medical Privacy & Safety Guarantee:</strong> Uploaded reports are stored in a private, encrypted
          Supabase bucket accessible only by your authenticated account. The AI provides educational guidance to help
          you discuss findings with your doctor; it never replaces licensed medical diagnosis.
        </div>
      </div>

      {/* UPLOAD & CAMERA CONTROLS */}
      {!selectedFile && !analyzing && (
        <div
          style={{
            border: "2px dashed #bfe0d6",
            borderRadius: 12,
            padding: "30px 20px",
            textAlign: "center",
            background: "#f9fcfa",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#e8f5f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              color: "#087f68",
            }}
          >
            <FileText size={26} />
          </div>

          <h3 style={{ margin: "0 0 6px", fontSize: 17 }}>Upload Your Medical Report</h3>
          <p style={{ color: "#64746f", fontSize: 14, maxWidth: 480, margin: "0 auto 20px" }}>
            Accepts ECG, Blood test, Lipid profile, X-ray reports, or general lab summaries. Supports JPG, JPEG, PNG,
            and PDF documents up to 10MB.
          </p>

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="report-file-upload"
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="report-camera-capture"
          />

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className="continue-button"
              onClick={() => cameraInputRef.current?.click()}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px" }}
            >
              <Camera size={18} />
              {t("Take Photo")}
            </button>

            <button
              type="button"
              className="small-action"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 20px",
                background: "#ffffff",
                border: "1px solid #ccd9d5",
                fontWeight: 600,
              }}
            >
              <Upload size={18} />
              {t("Upload File")}
            </button>
          </div>
        </div>
      )}

      {/* SELECTED FILE PREVIEW & ACTIONS */}
      {selectedFile && !analyzing && (
        <div
          style={{
            border: "1px solid #d5dfda",
            borderRadius: 12,
            padding: 18,
            background: "#ffffff",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 8,
                  background: "#e8f3ed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#167044",
                }}
              >
                <FileCheck size={22} />
              </div>
              <div>
                <strong style={{ fontSize: 15, display: "block" }}>{selectedFile.name}</strong>
                <span style={{ fontSize: 12, color: "#64746f" }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || "Document"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="small-action"
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: 13 }}
              >
                {t("Replace")}
              </button>

              <button
                type="button"
                className="small-action"
                onClick={handleRemoveFile}
                style={{ fontSize: 13, color: "#b42318" }}
              >
                <X size={15} /> {t("Remove")}
              </button>
            </div>
          </div>

          {/* Image preview if image */}
          {previewUrl && (
            <div
              style={{
                maxHeight: 280,
                overflow: "hidden",
                borderRadius: 8,
                background: "#f7faf8",
                textAlign: "center",
                marginBottom: 18,
                border: "1px solid #e7ece9",
              }}
            >
              <img
                src={previewUrl}
                alt="Medical Report Preview"
                style={{ maxWidth: "100%", maxHeight: 280, objectFit: "contain" }}
              />
            </div>
          )}

          {/* Action button */}
          <button
            type="button"
            className="continue-button"
            onClick={handleAnalyse}
            style={{
              width: "100%",
              padding: "13px 20px",
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Sparkles size={18} />
            {t("Analyse Report")}
          </button>
        </div>
      )}

      {/* ANALYSIS IN PROGRESS */}
      {analyzing && (
        <div
          style={{
            padding: 30,
            textAlign: "center",
            background: "#f7fbf9",
            borderRadius: 12,
            border: "1px solid #bfe0d6",
            marginBottom: 20,
          }}
        >
          <RefreshCw
            size={36}
            style={{
              color: "#087f68",
              animation: "spin 1.5s linear infinite",
              margin: "0 auto 14px",
            }}
          />
          <h3 style={{ margin: "0 0 6px", fontSize: 17 }}>Analysing Medical Document</h3>
          <p style={{ color: "#087f68", fontWeight: 600, fontSize: 14, margin: "0 0 8px" }}>
            {analysisStep || "Extracting clinical findings..."}
          </p>
          <p style={{ color: "#64746f", fontSize: 13, maxWidth: 450, margin: "0 auto" }}>
            Please wait while the multimodal AI model parses your report parameters, reference ranges, and observations.
          </p>
        </div>
      )}

      {/* ERROR MESSAGE WITH RETRY */}
      {error && (
        <div
          role="alert"
          style={{
            padding: "14px 18px",
            background: "#fee4e2",
            border: "1px solid #fecdca",
            borderRadius: 10,
            color: "#b42318",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <strong>Analysis Error:</strong> {error}
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button
              type="button"
              className="continue-button"
              onClick={handleAnalyse}
              style={{ fontSize: 13, padding: "6px 14px" }}
            >
              Retry Analysis
            </button>

            <button
              type="button"
              className="small-action"
              onClick={handleRemoveFile}
              style={{ fontSize: 13, padding: "6px 14px" }}
            >
              Upload Different File
            </button>
          </div>
        </div>
      )}

      {/* AI ANALYSIS RESULTS DISPLAY */}
      {currentAnalysis && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #d5dfda",
            borderRadius: 12,
            padding: 22,
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              paddingBottom: 14,
              borderBottom: "1px solid #e7ece9",
              marginBottom: 18,
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 16,
                  background: "#e8f3ed",
                  color: "#167044",
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                AI ANALYSIS COMPLETE
              </span>
              <h3 style={{ margin: 0, fontSize: 19 }}>
                {currentAnalysis.report_type || "Medical Report Explanation"}
              </h3>
            </div>

            <button
              type="button"
              className="small-action"
              onClick={() => {
                setCurrentAnalysis(null);
                handleRemoveFile();
              }}
              style={{ fontSize: 13 }}
            >
              New Analysis
            </button>
          </div>

          {/* UNREADABLE WARNING IF APPLICABLE */}
          {currentAnalysis.is_unreadable && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                background: "#fffbe6",
                border: "1px solid #ffe58f",
                borderRadius: 8,
                color: "#d48806",
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Notice:</strong> This document appeared partially unreadable, blurry, or cropped. The
                interpretation may be incomplete. Please consider uploading a clearer, higher-resolution image.
              </div>
            </div>
          )}

          {/* SECTION 1 & 2: REPORT TYPE & SUMMARY */}
          <div style={{ marginBottom: 20 }}>
            <h4
              style={{
                fontSize: 14,
                textTransform: "uppercase",
                color: "#64746f",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              {t("1 & 2. Report Overview & Summary")}
            </h4>
            <div
              style={{
                background: "#f8faf9",
                padding: "14px 16px",
                borderRadius: 8,
                border: "1px solid #e9efec",
                fontSize: 15,
                lineHeight: 1.6,
                color: "#1e293b",
              }}
            >
              {currentAnalysis.summary}
            </div>
          </div>

          {/* SECTION 3: EXTRACTED VALUES AND OBSERVATIONS */}
          {currentAnalysis.extracted_values && currentAnalysis.extracted_values.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4
                style={{
                  fontSize: 14,
                  textTransform: "uppercase",
                  color: "#64746f",
                  letterSpacing: 0.5,
                  marginBottom: 8,
                }}
              >
                {t("3. Extracted Values & Observations")}
              </h4>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                    background: "#ffffff",
                    border: "1px solid #e7ece9",
                    borderRadius: 8,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f1f5f3", textAlign: "left" }}>
                      <th style={{ padding: "10px 14px", borderBottom: "1px solid #d5dfda" }}>{t("Parameter / Test")}</th>
                      <th style={{ padding: "10px 14px", borderBottom: "1px solid #d5dfda" }}>{t("Result Value")}</th>
                      <th style={{ padding: "10px 14px", borderBottom: "1px solid #d5dfda" }}>{t("Normal Range")}</th>
                      <th style={{ padding: "10px 14px", borderBottom: "1px solid #d5dfda" }}>{t("Status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAnalysis.extracted_values.map((item, idx) => {
                      const badge = getStatusBadge(item.status);
                      return (
                        <tr key={idx} style={{ borderBottom: "1px solid #eef2f0" }}>
                          <td style={{ padding: "10px 14px", fontWeight: 600 }}>{item.parameter}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <strong>{item.value}</strong> {item.unit && <small style={{ color: "#64746f" }}>{item.unit}</small>}
                          </td>
                          <td style={{ padding: "10px 14px", color: "#64746f" }}>
                            {item.reference_range || "Standard"}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 700,
                                background: badge.bg,
                                color: badge.color,
                              }}
                            >
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 4: EXPLANATION IN SIMPLE LANGUAGE */}
          <div style={{ marginBottom: 20 }}>
            <h4
              style={{
                fontSize: 14,
                textTransform: "uppercase",
                color: "#64746f",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              {t("4. Explanation in Plain Language")}
            </h4>
            <div
              style={{
                background: "#f0f8f5",
                padding: "14px 16px",
                borderRadius: 8,
                border: "1px solid #d1eae1",
                fontSize: 14,
                lineHeight: 1.6,
                color: "#1e3a32",
              }}
            >
              {currentAnalysis.simple_explanation}
            </div>
          </div>

          {/* SECTION 5: FINDINGS THAT MAY NEED MEDICAL ATTENTION */}
          {currentAnalysis.attention_findings && currentAnalysis.attention_findings.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4
                style={{
                  fontSize: 14,
                  textTransform: "uppercase",
                  color: "#b42318",
                  letterSpacing: 0.5,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <AlertTriangle size={16} /> {t("5. Values or Findings Needing Attention")}
              </h4>

              <div
                style={{
                  background: "#fff9f9",
                  border: "1px solid #fedcd8",
                  borderRadius: 8,
                  padding: "14px 16px",
                }}
              >
                <ul style={{ margin: 0, paddingLeft: 20, color: "#912018", fontSize: 14, lineHeight: 1.6 }}>
                  {currentAnalysis.attention_findings.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 6: QUESTIONS THE PATIENT CAN ASK THEIR DOCTOR */}
          {currentAnalysis.doctor_questions && currentAnalysis.doctor_questions.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4
                style={{
                  fontSize: 14,
                  textTransform: "uppercase",
                  color: "#087f68",
                  letterSpacing: 0.5,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <HelpCircle size={16} /> {t("6. Questions You Can Ask Your Doctor")}
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {currentAnalysis.doctor_questions.map((question, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "10px 14px",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  >
                    <span>{question}</span>
                    <button
                      type="button"
                      className="small-action"
                      onClick={() => copyQuestionToClipboard(question, idx)}
                      style={{ padding: "4px 8px", fontSize: 12 }}
                      title={t("Copy Question")}
                    >
                      {copiedIndex === idx ? <Check size={14} color="#167044" /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7: AI LIMITATIONS AND DISCLAIMER */}
          <div
            style={{
              padding: "14px 16px",
              background: "#fafafa",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              fontSize: 12,
              lineHeight: 1.5,
              color: "#64746f",
            }}
          >
            <strong>{t("7. Medical Limitations & Safety Disclaimer")}:</strong>{" "}
            {currentAnalysis.disclaimer ||
              "This analysis is AI-generated for educational guidance only. It does not replace professional clinical evaluation, diagnosis, or treatment. Always discuss these findings with your qualified physician."}
          </div>
        </div>
      )}

      {/* PAST REPORTS HISTORY */}
      <div style={{ marginTop: 20 }}>
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            background: "transparent",
            border: "none",
            borderTop: "1px solid #e7ece9",
            paddingTop: 16,
            cursor: "pointer",
            color: "#475569",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={17} />
            {t("Past Reports & History")} ({history.length})
          </span>
          {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showHistory && (
          <div style={{ marginTop: 14 }}>
            {historyLoading ? (
              <p style={{ color: "#64746f", fontSize: 14 }}>{t("Loading...")}</p>
            ) : history.length === 0 ? (
              <p style={{ color: "#64746f", fontSize: 14 }}>{t("No reports analyzed yet.")}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {history.map((report) => (
                  <article
                    key={report.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12,
                      padding: "12px 16px",
                      border: "1px solid #e7ece9",
                      borderRadius: 8,
                      background: currentReportId === report.id ? "#f0f8f5" : "#ffffff",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 14, display: "block" }}>
                        {report.report_type || report.file_name}
                      </strong>
                      <span style={{ fontSize: 12, color: "#64746f" }}>
                        Uploaded {new Date(report.created_at).toLocaleDateString()} · {(report.file_size / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {report.analysis && (
                        <button
                          type="button"
                          className="continue-button"
                          onClick={() => handleViewHistoricalAnalysis(report)}
                          style={{ fontSize: 12, padding: "5px 12px" }}
                        >
                          {t("View Analysis")}
                        </button>
                      )}

                      <button
                        type="button"
                        className="small-action"
                        disabled={deletingId === report.id}
                        onClick={() => handleDeleteReport(report)}
                        style={{ fontSize: 12, color: "#b42318", padding: "5px 10px" }}
                        title={t("Delete report from storage")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
