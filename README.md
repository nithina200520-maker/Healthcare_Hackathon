# CareBridge — Healthcare Coordination Platform

CareBridge is a healthcare coordination platform built for patients, caregivers, and healthcare professionals. It bridges the gap between home care and clinical oversight by connecting **Patients**, **Caregivers**, **Nurses**, **Doctors**, **Hospitals**, and **Volunteers** under an authorized administrative governance model.

---

## 🌟 Key Features & Role Architecture

CareBridge supports six public roles and one private administrative role:

### 1. Patient
* **Daily Medicine Schedule**: View scheduled doses, mark doses as taken or skipped with real-time status updates.
* **30-Minute Grace Period & Missed Alerts**: Automatically calculates missed doses after grace periods and generates real-time alerts.
* **Weekly Adherence Analytics**: Interactive 7-day adherence charts displaying daily percentages and total adherence metrics.
* **Caregiver Connection**: Generate and share account IDs to invite caregivers into the care circle.
* **Doctor Communication**: Send non-emergency health questions and clinical concerns directly to assigned doctors.
* **Emergency SOS (112)**: Prominent red emergency button in navbar, high-priority emergency banner, and quick actions. Opens an emergency confirmation dialog and invokes the native device dialler (`tel:112`) without requiring internet connectivity.
* **AI Medical Report Analyser**: Multimodal AI tool allowing patients to take camera photos or upload medical reports (ECGs, X-rays, blood tests, lab reports in JPG, PNG, PDF <= 10MB), view previews, securely store them in private storage, and receive an AI-powered 7-section plain-language analysis with clinical disclaimers.

### 2. Caregiver
* **Patient Link Management**: Accept or reject patient connection requests.
* **Real-Time Dose Notifications**: Live notification feed alerting caregivers when connected patients miss scheduled medication.
* **Notification Tracking**: Mark alerts as read/unread with real-time Supabase postgres_changes synchronization.

### 3. Nurse
* **Professional Registration & Approval**: Account requires verification before access is granted.
* **Assigned Patient Monitoring**: View all active patient links assigned by the CareBridge Administrator.
* **Medication Alerts**: Receive real-time alerts whenever assigned patients require medication assistance.

### 4. Doctor
* **Professional Registration & Approval**: Account requires verification before access is granted.
* **Patient Case Load**: Monitor active patient assignments linked to the doctor's account.
* **Concern Triage & Responses**: Review patient questions, write and submit clinical responses, and close resolved concerns.
* **Real-time Synchronization**: Instant notification and update of new patient submissions via Supabase Realtime channels.

### 5. Hospital
* **Institutional Registration & Approval**: Institutional account validated by administrators.
* **Facility Patient Oversight**: Monitor and coordinate care for all patients linked to the hospital facility.

### 6. Volunteer
* **Community Health Support**: Approved volunteers assist patients with non-medical care coordination and access.
* **Task Workflow Management**: View assigned tasks and track lifecycle status: **Pending** &rarr; **In Progress** &rarr; **Completed** (with administrative cancellation visibility).

### 7. Administrator (Private System Role)
* **Secure Authorization**: Admin access is verified against `public.authorized_admins` in PostgreSQL, completely separate from public registration.
* **Platform Analytics**: Real-time telemetry on registered patients, approved professionals, pending requests, active assignments, and volunteer tasks.
* **Professional Account Approval**: Review pending registrations for Doctors, Nurses, Hospitals, and Volunteers with one-click Approve or Reject.
* **Assignment Management**: Assign approved Doctors, Nurses, Hospitals, and Volunteers to registered patients; deactivate or reactivate existing links.
* **Volunteer Task Delegation**: Create, assign, and cancel community healthcare volunteer tasks for patients.
* **User Management Directory**: Search, filter by role, and inspect all registered accounts.
* **Account Suspension & Reactivation**: Securely ban/suspend abusive accounts and restore access via Supabase Edge Functions with self-protection and admin immunity guards.
* **Audit & Activity Logs UI**: Real-time, searchable, and filterable immutable audit trail tracking all administrative actions with timestamp, actor, target user, role, and metadata.

---

## 🛠 Technology Stack

* **Frontend**: React 19, Vite 8, Lucide React icons
* **Styling**: Responsive custom CSS architecture (`index.css`)
* **Backend / Database**: Supabase (PostgreSQL 17)
* **Authentication**: Supabase Auth (Email & Password, Session management, Role-based metadata)
* **Row-Level Security (RLS)**: Enforced across all tables in the `public` schema
* **Serverless Functions**: Supabase Edge Functions (Deno / TypeScript)
* **Linter**: Oxlint

---

## 🚀 Installation & Local Development

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or pnpm
* Supabase CLI (optional, for local Edge Function testing)

### 1. Clone the repository
```bash
git clone https://github.com/nithina200520-maker/Healthcare_Hackathon.git
cd Healthcare_Hackathon/carebridge
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the `carebridge/` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_or_publishable_key
```

> **Security Note**: Never commit `.env`, `.env.local`, or any service-role secrets to Git.

### 4. Run the development server
```bash
npm run dev
```

### 5. Build for production & lint
```bash
npm run build
npm run lint
```

---

## 🗄 Database Schema & Setup

### Tables
* `public.profiles` (`id`, `full_name`, `phone`, `preferred_language`, `created_at`)
* `public.authorized_admins` (`admin_id`, `admin_name`, `created_at`)
* `public.authorized_doctors` (`doctor_id`, `approved_at`)
* `public.authorized_nurses` (`nurse_id`, `approved_at`)
* `public.authorized_hospitals` (`hospital_id`, `hospital_name`, `approved_at`)
* `public.authorized_volunteers` (`volunteer_id`, `volunteer_name`, `approved_at`)
* `public.account_requests` (`user_id`, `full_name`, `role`, `status`, `created_at`)
* `public.medicines` (`id`, `patient_id`, `name`, `scheduled_time`, `is_active`, `created_at`)
* `public.dose_logs` (`id`, `patient_id`, `medicine_id`, `scheduled_for`, `status`, `taken_at`)
* `public.caregiver_links` (`id`, `patient_id`, `caregiver_id`, `status`, `created_at`)
* `public.notifications` (`id`, `recipient_id`, `patient_id`, `title`, `message`, `is_read`, `created_at`)
* `public.patient_concerns` (`id`, `patient_id`, `doctor_id`, `subject`, `message`, `response`, `reviewed_by`, `status`, `created_at`, `updated_at`)
* `public.doctor_patient_links` (`id`, `doctor_id`, `patient_id`, `is_active`, `created_at`)
* `public.nurse_patient_links` (`id`, `nurse_id`, `patient_id`, `is_active`, `created_at`)
* `public.hospital_patient_links` (`id`, `hospital_id`, `patient_id`, `is_active`, `created_at`)
* `public.volunteer_tasks` (`id`, `volunteer_id`, `patient_id`, `task_description`, `status`, `created_at`, `updated_at`)
* `public.admin_activity_logs` (`id`, `admin_id`, `action`, `target_user_id`, `target_role`, `details`, `created_at`)
* `public.medical_reports` (`id`, `patient_id`, `file_name`, `file_path`, `file_size`, `mime_type`, `report_type`, `status`, `analysis`, `created_at`, `updated_at`)
* Storage Bucket: `medical-reports` (Private, 10MB limit, RLS scoped to `auth.uid() = patient_id`)

### Applying Database Migrations
Migrations are located in `carebridge/supabase/migrations/`:
* `20261122_audit_logging_and_volunteer_task.sql`: Updates `admin_create_volunteer_task` with audit logging and adds `admin_get_activity_logs` RPC.
* `20261122_medical_reports_and_storage.sql`: Creates `public.medical_reports` table, enables RLS policies, provisions private `medical-reports` storage bucket, and configures storage object RLS policies.

To apply via the Supabase Dashboard:
1. Open the Supabase Project Dashboard.
2. Navigate to the **SQL Editor**.
3. Open `supabase/migrations/20261122_medical_reports_and_storage.sql` and click **Run**.

---

## ⚡ Supabase Edge Functions

### 1. `admin-manage-user`
The `admin-manage-user` function handles account suspension and reactivation using the Supabase Auth Admin API (`updateUserById`).
* **Source**: `supabase/functions/admin-manage-user/index.ts`
* **Features**:
  * Authenticates caller with their user session token.
  * Verifies caller exists in `public.authorized_admins`.
  * Prevents admins from suspending their own accounts or other authorized admins.
  * Sets ban duration to `876000h` (suspend) or `none` (reactivate).
  * Automatically records audit entries (`ACCOUNT_SUSPENDED`, `ACCOUNT_REACTIVATED`) into `public.admin_activity_logs`.

### 2. `analyze-medical-report`
The `analyze-medical-report` function uses vision AI to analyze uploaded medical documents (ECGs, X-rays, blood reports, lab summaries).
* **Source**: `supabase/functions/analyze-medical-report/index.ts`
* **Features**:
  * Authenticates the caller and verifies ownership in `public.medical_reports`.
  * Fetches file from private Supabase Storage (`medical-reports`) or uses direct payload transmission.
  * Calls **Google Gemini 3.8 Flash** (`gemini-3.8-flash`) with fallback to **OpenAI GPT-4o-mini** (`gpt-4o-mini`).
  * Enforces medical safety rules: informational only, never prescribes or diagnoses, flags unreadable documents.
  * Returns structured JSON across 7 clinical sections:
    1. Report Type
    2. Summary of the Report
    3. Extracted Values and Observations (with abnormal flags)
    4. Simple Language Explanation
    5. Findings Needing Attention
    6. Doctor Discussion Questions
    7. Medical Disclaimers & Limitations
  * Persists analysis and detected report type into `public.medical_reports`.

### Configuring Edge Function Secrets
In your Supabase Dashboard:
1. Go to **Project Settings** &rarr; **Edge Functions** &rarr; **Secrets**.
2. Add the following secrets:
   * `GEMINI_API_KEY`: Your Google Gemini API Key (recommended for multimodal image and PDF analysis)
   * `OPENAI_API_KEY`: *(Optional fallback)* Your OpenAI API Key
   * `SUPABASE_URL`: Pre-configured in hosted projects
   * `SUPABASE_SERVICE_ROLE_KEY`: Pre-configured in hosted projects

### Edge Function Deployment
```bash
# Login to Supabase CLI
npx supabase login

# Link your project
npx supabase link --project-ref your_project_ref

# Deploy the function
npx supabase functions deploy admin-manage-user --no-verify-jwt
```

Ensure the following Edge Function Secrets are configured:
* `SUPABASE_URL`
* `SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY`

---

## 🧪 Demonstration & Testing Workflow

1. **Patient Workflow**:
   * Register or log in as a **Patient**.
   * Add a scheduled medicine (e.g. "Paracetamol 500mg at 09:00").
   * Mark the dose as Taken or Skipped and view the 7-day Adherence Chart update immediately.
   * View caregiver invitation account ID.
2. **Professional Registration & Admin Approval**:
   * Register as a **Doctor**, **Nurse**, **Hospital**, or **Volunteer**.
   * Notice the account status displays "Awaiting Administrator Approval".
   * Log in with an Admin account.
   * Under **Account Requests**, review the registration and click **Approve**.
   * Log back into the professional account &mdash; the full dashboard is now unlocked.
3. **Care Coordination & Assignments**:
   * In Admin Dashboard, navigate to **Patient assignment manager**.
   * Assign the approved Doctor, Nurse, or Hospital to a Patient.
   * Create a Volunteer Task (e.g. "Assist patient with transportation to cardiology checkup").
   * The Volunteer can log in to view the task, start it ("In Progress"), and mark it "Completed".
4. **Audit Trail Verification**:
   * In the Admin Dashboard, click the **Activity Logs** tab.
   * Notice that every account approval, suspension, assignment creation, and volunteer task creation is immutably logged with actor, target user, category, and timestamps.
   * Filter by Category (Accounts, Assignments, Volunteers), Date, or Search.
