
import { useEffect, useState, useMemo } from "react";
import {
  HeartPulse,
  ShieldCheck,
  Users,
  UserRound,
  RefreshCw,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  UserPlus,
  ClipboardList,
  Hospital,
  Stethoscope,
  HandHeart,
  Ban,
  RotateCcw,
  Activity,
  UserCheck,
  TrendingUp,
  Search,
  Phone,
  CalendarDays,
  Languages,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const ROLES = ["Doctor", "Nurse", "Hospital", "Volunteer"];

const DIRECTORY_ROLES = [
  "All",
  "Patient",
  "Caregiver",
  "Doctor",
  "Nurse",
  "Hospital",
  "Volunteer",
];

const TABLES = {
  Doctor: { table: "doctor_patient_links" },
  Nurse: { table: "nurse_patient_links" },
  Hospital: { table: "hospital_patient_links" },
};

// ANALYTICS CARD COMPONENT (Defined outside render to prevent recreation)
function MetricCard({ icon: Icon, label, value, description }) {
  return (
    <article className="stat-card">
      <div className="stat-icon">
        <Icon />
      </div>
      <p>{label}</p>
      <h2>{value ?? 0}</h2>
      <span>{description}</span>
    </article>
  );
}

export default function AdminAccess({ onLogout }) {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState("Pending");

  // Navigation tab: 'all' | 'analytics' | 'directory' | 'approvals' | 'assignments' | 'logs'
  const [activeTab, setActiveTab] = useState("all");

  const [users, setUsers] = useState([]);

  // User directory
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryRole, setDirectoryRole] = useState("All");
  const [directoryActionId, setDirectoryActionId] = useState(null);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [assignments, setAssignments] = useState({
    Doctor: [],
    Nurse: [],
    Hospital: [],
    Volunteer: [],
  });

  const [selectedRole, setSelectedRole] = useState("Doctor");
  const [professionalId, setProfessionalId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentProcessingId, setAssignmentProcessingId] = useState(null);

  // Activity logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState("");
  const [logCategoryFilter, setLogCategoryFilter] = useState("All");
  const [logDateFilter, setLogDateFilter] = useState("All");
  const [logSearch, setLogSearch] = useState("");
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 10;

  // LOAD ANALYTICS
  const loadAnalytics = async () => {
    setAnalyticsLoading(true);

    try {
      const { data, error } = await supabase.rpc("admin_get_analytics");
      if (error) throw error;
      setAnalytics(data);
    } catch (err) {
      setError(err.message || "Unable to load analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // LOAD USER DIRECTORY
  const loadUserDirectory = async () => {
    setDirectoryLoading(true);

    try {
      const { data, error } = await supabase.rpc(
        "admin_get_user_directory"
      );

      if (error) throw error;
      setDirectoryUsers(data || []);
    } catch (err) {
      setError(err.message || "Unable to load user directory.");
    } finally {
      setDirectoryLoading(false);
    }
  };

  // LOAD ACTIVITY LOGS
  const loadActivityLogs = async () => {
    setLogsLoading(true);
    setLogsError("");

    try {
      // First attempt server-side RPC for resolved display names
      const { data, error: rpcError } = await supabase.rpc(
        "admin_get_activity_logs",
        {
          p_limit: 200,
          p_offset: 0,
        }
      );

      if (!rpcError && data) {
        setLogs(data);
      } else {
        // Fallback to direct table select
        const { data: directData, error: directError } = await supabase
          .from("admin_activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);

        if (directError) throw directError;
        setLogs(directData || []);
      }
    } catch (err) {
      setLogsError(err.message || "Unable to load activity logs.");
    } finally {
      setLogsLoading(false);
    }
  };

  // LOAD ASSIGNMENTS
  const loadAssignments = async () => {
    const results = {
      Doctor: [],
      Nurse: [],
      Hospital: [],
      Volunteer: [],
    };

    for (const role of ["Doctor", "Nurse", "Hospital"]) {
      const { data, error } = await supabase
        .from(TABLES[role].table)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      results[role] = data || [];
    }

    const { data: volunteerData, error: volunteerError } = await supabase
      .from("volunteer_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (volunteerError) throw volunteerError;

    results.Volunteer = volunteerData || [];
    setAssignments(results);
  };

  // LOAD ADMIN DASHBOARD
  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Please log in again.");

      setCurrentUserId(user.id);

      const { data: adminData, error: adminError } = await supabase
        .from("authorized_admins")
        .select("admin_id, admin_name")
        .eq("admin_id", user.id)
        .maybeSingle();

      if (adminError) throw adminError;

      if (!adminData) {
        setAdmin(null);
        setRequests([]);
        return;
      }

      setAdmin(adminData);

      const { data: requestData, error: requestError } = await supabase
        .from("account_requests")
        .select("user_id, full_name, role, status, created_at")
        .order("created_at", { ascending: false });

      if (requestError) throw requestError;
      setRequests(requestData || []);

      const { data: userData, error: userError2 } =
        await supabase.rpc("admin_list_assignment_users");

      if (userError2) throw userError2;
      setUsers(userData || []);

      await Promise.all([
        loadAssignments(),
        loadAnalytics(),
        loadUserDirectory(),
        loadActivityLogs(),
      ]);
    } catch (err) {
      setError(err.message || "Unable to load Admin Dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ACCOUNT APPROVAL
  const reviewRequest = async (userId, decision) => {
    if (
      !window.confirm(
        `Are you sure you want to ${decision.toLowerCase()} this account?`
      )
    ) return;

    setProcessingId(userId);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.rpc("review_account_request", {
        p_user_id: userId,
        p_decision: decision,
      });

      if (error) throw error;

      setSuccess(`Account ${decision.toLowerCase()} successfully.`);
      await Promise.all([loadDashboard(), loadActivityLogs()]);
    } catch (err) {
      setError(err.message || "Unable to review account.");
    } finally {
      setProcessingId(null);
    }
  };

  // SUSPEND OR REACTIVATE USER
  const manageUserAccount = async (user, action) => {
    const isSuspending = action === "suspend";

    if (user.user_id === currentUserId) {
      setError("You cannot suspend or manage your own account.");
      return;
    }

    if (user.is_admin) {
      setError("Authorized Admin accounts cannot be managed here.");
      return;
    }

    const confirmation = isSuspending
      ? `Suspend ${user.full_name || "this user"}'s account? They will lose access to CareBridge until reactivated.`
      : `Reactivate ${user.full_name || "this user"}'s account?`;

    if (!window.confirm(confirmation)) return;

    setDirectoryActionId(user.user_id);
    setError("");
    setSuccess("");

    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-manage-user",
        {
          body: {
            userId: user.user_id,
            action,
          },
        }
      );

      if (error) {
        let message = error.message || "Account operation failed.";

        try {
          const response = await error.context?.json();
          if (response?.error) message = response.error;
        } catch {
          // Keep the original error message.
        }

        throw new Error(message);
      }

      if (data?.error) throw new Error(data.error);

      setSuccess(
        data?.message ||
          (isSuspending
            ? "User suspended successfully."
            : "User reactivated successfully.")
      );

      await Promise.all([loadUserDirectory(), loadActivityLogs()]);
    } catch (err) {
      setError(err.message || "Unable to update user account.");
    } finally {
      setDirectoryActionId(null);
    }
  };

  // CREATE ASSIGNMENT
  const createAssignment = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!professionalId || !patientId) {
      setError("Select both a professional and a patient.");
      return;
    }

    setAssignmentLoading(true);

    try {
      let result;

      if (selectedRole === "Volunteer") {
        if (!taskDescription.trim()) {
          throw new Error("Enter a volunteer task description.");
        }

        result = await supabase.rpc("admin_create_volunteer_task", {
          p_volunteer_id: professionalId,
          p_patient_id: patientId,
          p_task_description: taskDescription.trim(),
        });
      } else {
        result = await supabase.rpc("admin_create_assignment", {
          p_role: selectedRole,
          p_professional_id: professionalId,
          p_patient_id: patientId,
        });
      }

      if (result.error) throw result.error;

      setSuccess(
        selectedRole === "Volunteer"
          ? "Volunteer task created successfully."
          : `${selectedRole} assigned successfully.`
      );

      setProfessionalId("");
      setPatientId("");
      setTaskDescription("");

      await Promise.all([
        loadAssignments(),
        loadAnalytics(),
        loadActivityLogs(),
      ]);
    } catch (err) {
      setError(err.message || "Unable to create assignment.");
    } finally {
      setAssignmentLoading(false);
    }
  };

  // DEACTIVATE, REACTIVATE OR CANCEL
  const updateAssignment = async (role, assignmentId, action) => {
    const confirmation =
      action === "Deactivate"
        ? "Are you sure you want to deactivate this assignment?"
        : action === "Reactivate"
        ? "Are you sure you want to reactivate this assignment?"
        : "Are you sure you want to cancel this volunteer task?";

    if (!window.confirm(confirmation)) return;

    setAssignmentProcessingId(assignmentId);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.rpc("admin_update_assignment", {
        p_role: role,
        p_assignment_id: assignmentId,
        p_action: action,
      });

      if (error) throw error;

      setSuccess(
        action === "Cancel"
          ? "Volunteer task cancelled successfully."
          : `${role} assignment ${action.toLowerCase()}d successfully.`
      );

      await Promise.all([
        loadAssignments(),
        loadAnalytics(),
        loadActivityLogs(),
      ]);
    } catch (err) {
      setError(err.message || "Unable to update assignment.");
    } finally {
      setAssignmentProcessingId(null);
    }
  };

  // COUNTS
  const pendingCount = requests.filter(
    (r) => r.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (r) => r.status === "Approved"
  ).length;

  const rejectedCount = requests.filter(
    (r) => r.status === "Rejected"
  ).length;

  const filteredRequests =
    filter === "All"
      ? requests
      : requests.filter((r) => r.status === filter);

  const professionals = users.filter(
    (u) => u.role === selectedRole
  );

  const patients = users.filter((u) => u.role === "Patient");

  const findName = (id) => {
    const user = users.find((u) => u.user_id === id);
    return user?.full_name || id;
  };

  // FILTER USER DIRECTORY
  const filteredDirectoryUsers = directoryUsers.filter((user) => {
    const matchesRole =
      directoryRole === "All" || user.role === directoryRole;

    const search = directorySearch.trim().toLowerCase();

    const matchesSearch =
      !search ||
      (user.full_name || "").toLowerCase().includes(search) ||
      (user.phone || "").toLowerCase().includes(search) ||
      (user.user_id || "").toLowerCase().includes(search);

    return matchesRole && matchesSearch;
  });

  // ACCOUNT STATUS
  const isUserSuspended = (user) => {
    if (!user.banned_until) return false;
    return new Date(user.banned_until) > new Date();
  };

  // SAFE NAME RESOLUTION FOR AUDIT LOGS
  const resolveTargetName = (log) => {
    if (log.target_name && log.target_name !== "User") return log.target_name;
    if (log.details?.full_name) return log.details.full_name;
    if (log.details?.email) return log.details.email;
    const foundInDirectory = directoryUsers.find((u) => u.user_id === log.target_user_id);
    if (foundInDirectory?.full_name) return foundInDirectory.full_name;
    const foundInUsers = users.find((u) => u.user_id === log.target_user_id);
    if (foundInUsers?.full_name) return foundInUsers.full_name;
    return log.target_user_id ? `User (${log.target_user_id.slice(0, 8)})` : "System";
  };

  const resolveAdminName = (log) => {
    if (log.admin_name && log.admin_name !== "CareBridge Admin") return log.admin_name;
    if (log.admin_id === admin?.admin_id) return admin.admin_name || "CareBridge Administrator";
    const found = directoryUsers.find((u) => u.user_id === log.admin_id);
    if (found?.full_name) return found.full_name;
    return log.admin_id ? `Admin (${log.admin_id.slice(0, 8)})` : "Administrator";
  };

  // ACTION BADGE STYLING AND LABELS
  const getActionBadge = (action) => {
    switch (action) {
      case "ACCOUNT_REQUEST_APPROVED":
        return {
          label: "Account Approved",
          icon: CheckCircle2,
          bg: "#e8f3ed",
          color: "#167044",
          border: "#bfe5ce",
        };
      case "ACCOUNT_REQUEST_REJECTED":
        return {
          label: "Account Rejected",
          icon: XCircle,
          bg: "#fee4e2",
          color: "#b42318",
          border: "#fecdca",
        };
      case "ACCOUNT_SUSPENDED":
        return {
          label: "Account Suspended",
          icon: Ban,
          bg: "#fff1f0",
          color: "#cf1322",
          border: "#ffa39e",
        };
      case "ACCOUNT_REACTIVATED":
        return {
          label: "Account Reactivated",
          icon: RotateCcw,
          bg: "#f6ffed",
          color: "#389e0d",
          border: "#b7eb8f",
        };
      case "ASSIGNMENT_CREATED":
        return {
          label: "Assignment Created",
          icon: UserPlus,
          bg: "#e6f4ff",
          color: "#0958d9",
          border: "#91caff",
        };
      case "ASSIGNMENT_DEACTIVATE":
        return {
          label: "Assignment Deactivated",
          icon: Ban,
          bg: "#fffbe6",
          color: "#d48806",
          border: "#ffe58f",
        };
      case "ASSIGNMENT_REACTIVATE":
        return {
          label: "Assignment Reactivated",
          icon: RotateCcw,
          bg: "#e8f3ed",
          color: "#167044",
          border: "#bfe5ce",
        };
      case "VOLUNTEER_TASK_CREATED":
        return {
          label: "Volunteer Task Created",
          icon: HandHeart,
          bg: "#e6fffb",
          color: "#08979c",
          border: "#87e8de",
        };
      case "VOLUNTEER_TASK_CANCELLED":
        return {
          label: "Volunteer Task Cancelled",
          icon: XCircle,
          bg: "#f5f5f5",
          color: "#595959",
          border: "#d9d9d9",
        };
      default:
        return {
          label: (action || "Activity").replace(/_/g, " "),
          icon: Activity,
          bg: "#f0f5ff",
          color: "#1d39c4",
          border: "#adc6ff",
        };
    }
  };

  // FILTERED ACTIVITY LOGS
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category filter
      if (logCategoryFilter === "Accounts") {
        if (!log.action?.startsWith("ACCOUNT_")) return false;
      } else if (logCategoryFilter === "Assignments") {
        if (!log.action?.startsWith("ASSIGNMENT_")) return false;
      } else if (logCategoryFilter === "Volunteers") {
        if (!log.action?.startsWith("VOLUNTEER_")) return false;
      }

      // Date filter
      if (logDateFilter !== "All") {
        const logDate = new Date(log.created_at);
        const today = new Date();
        if (logDateFilter === "Today") {
          const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          if (logDate < startOfToday) return false;
        } else if (logDateFilter === "7days") {
          const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (logDate < sevenDaysAgo) return false;
        } else if (logDateFilter === "30days") {
          const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (logDate < thirtyDaysAgo) return false;
        }
      }

      // Search filter
      if (logSearch.trim()) {
        const query = logSearch.trim().toLowerCase();
        const actionText = (log.action || "").toLowerCase();
        const target = resolveTargetName(log).toLowerCase();
        const adminText = resolveAdminName(log).toLowerCase();
        const targetId = (log.target_user_id || "").toLowerCase();
        const adminId = (log.admin_id || "").toLowerCase();
        const role = (log.target_role || "").toLowerCase();
        const detailsText = JSON.stringify(log.details || {}).toLowerCase();

        if (
          !actionText.includes(query) &&
          !target.includes(query) &&
          !adminText.includes(query) &&
          !targetId.includes(query) &&
          !adminId.includes(query) &&
          !role.includes(query) &&
          !detailsText.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [logs, logCategoryFilter, logDateFilter, logSearch, directoryUsers, users, admin]);

  const totalLogPages = Math.max(1, Math.ceil(filteredLogs.length / logsPerPage));
  const paginatedLogs = useMemo(() => {
    const start = (logPage - 1) * logsPerPage;
    return filteredLogs.slice(start, start + logsPerPage);
  }, [filteredLogs, logPage, logsPerPage]);

  // REFRESH
  const refreshAssignments = async () => {
    setError("");
    setSuccess("");

    try {
      await Promise.all([loadAssignments(), loadAnalytics()]);
      setSuccess("Assignments and analytics refreshed.");
    } catch (err) {
      setError(err.message || "Unable to refresh dashboard.");
    }
  };

  const refreshAnalytics = async () => {
    setError("");
    setSuccess("");
    await loadAnalytics();
    setSuccess("Analytics refreshed successfully.");
  };

  const refreshDirectory = async () => {
    setError("");
    setSuccess("");
    await loadUserDirectory();
    setSuccess("User directory refreshed successfully.");
  };

  const refreshLogs = async () => {
    setError("");
    setSuccess("");
    await loadActivityLogs();
    setSuccess("Activity logs refreshed successfully.");
  };

  return (
    <div className="patient-dashboard">
      <header className="dashboard-navbar">
        <div className="brand">
          <div className="brand-icon">
            <HeartPulse size={24} />
          </div>
          <span>CareBridge</span>
        </div>

        <button className="logout-button" onClick={onLogout}>
          <LogOut size={17} />
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">ADMINISTRATION</p>
            <h1>Welcome, {admin?.admin_name || "Administrator"}!</h1>
            <p>
              Manage accounts, analytics, professional approvals and patient
              assignments.
            </p>
          </div>

          <div className="dashboard-profile-icon">
            <ShieldCheck size={30} />
          </div>
        </section>

        {error && (
          <section className="dashboard-panel">
            <p role="alert" style={{ color: "#b42318" }}>
              <ShieldAlert size={17} /> {error}
            </p>
          </section>
        )}

        {success && (
          <section className="dashboard-panel">
            <p style={{ color: "#167044" }}>
              <CheckCircle2 size={17} /> {success}
            </p>
          </section>
        )}

        {loading ? (
          <section className="dashboard-panel">
            Loading administrator dashboard...
          </section>
        ) : !admin ? (
          <section className="dashboard-panel">
            <h2>Administrator access required</h2>
            <p>This account is not an authorized administrator.</p>
          </section>
        ) : (
          <>
            {/* ADMIN SECTION TABS */}
            <nav
              aria-label="Admin Navigation Tabs"
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 20,
                background: "#f4f8f6",
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid #e2ebe6",
              }}
            >
              {[
                { id: "all", label: "All Sections", icon: Activity },
                { id: "analytics", label: "Analytics", icon: TrendingUp },
                { id: "directory", label: "User Directory", icon: Users, badge: directoryUsers.length },
                { id: "approvals", label: "Account Requests", icon: UserCheck, badge: pendingCount > 0 ? pendingCount : null },
                { id: "assignments", label: "Assignments", icon: ClipboardList },
                { id: "logs", label: "Activity Logs", icon: History, badge: logs.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "none",
                      background: isActive ? "#087f68" : "transparent",
                      color: isActive ? "#ffffff" : "#455a53",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge !== null && (
                      <span
                        style={{
                          padding: "2px 7px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                          background: isActive ? "rgba(255,255,255,0.25)" : "#e2ece7",
                          color: isActive ? "#ffffff" : "#176b45",
                        }}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ADMIN ANALYTICS */}
            {(activeTab === "all" || activeTab === "analytics") && (
            <section className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    <Activity size={21} /> Platform Analytics
                  </h2>
                  <p>Live overview of CareBridge activity.</p>
                </div>

                <button
                  className="small-action"
                  type="button"
                  onClick={refreshAnalytics}
                  disabled={analyticsLoading}
                >
                  <RefreshCw size={16} />
                  {analyticsLoading ? "Loading..." : "Refresh Analytics"}
                </button>
              </div>

              {!analytics ? (
                <p>
                  {analyticsLoading
                    ? "Loading analytics..."
                    : "Analytics are currently unavailable. Try refreshing."}
                </p>
              ) : (
                <>
                  <h3 style={{ marginTop: 20 }}>
                    <Users size={18} /> Registered Patients
                  </h3>

                  <section className="dashboard-stats">
                    <MetricCard icon={UserRound} label="Patients" value={analytics.patients} description="Registered patient accounts" />
                    <MetricCard icon={Stethoscope} label="Doctors" value={analytics.doctors} description="Approved doctors" />
                    <MetricCard icon={HeartPulse} label="Nurses" value={analytics.nurses} description="Approved nurses" />
                    <MetricCard icon={Hospital} label="Hospitals" value={analytics.hospitals} description="Approved hospitals" />
                    <MetricCard icon={HandHeart} label="Volunteers" value={analytics.volunteers} description="Approved volunteers" />
                  </section>

                  <h3 style={{ marginTop: 24 }}>
                    <UserCheck size={18} /> Account Requests
                  </h3>

                  <section className="dashboard-stats">
                    <MetricCard icon={Clock} label="Pending" value={analytics.pending_requests} description="Awaiting review" />
                    <MetricCard icon={CheckCircle2} label="Approved" value={analytics.approved_requests} description="Approved requests" />
                    <MetricCard icon={XCircle} label="Rejected" value={analytics.rejected_requests} description="Rejected requests" />
                  </section>

                  <h3 style={{ marginTop: 24 }}>
                    <ClipboardList size={18} /> Professional Assignments
                  </h3>

                  <section className="dashboard-stats">
                    <MetricCard icon={Stethoscope} label="Doctor Active" value={analytics.doctor_active} description="Active doctor links" />
                    <MetricCard icon={Activity} label="Doctor Inactive" value={analytics.doctor_inactive} description="Inactive doctor links" />
                    <MetricCard icon={HeartPulse} label="Nurse Active" value={analytics.nurse_active} description="Active nurse links" />
                    <MetricCard icon={Activity} label="Nurse Inactive" value={analytics.nurse_inactive} description="Inactive nurse links" />
                    <MetricCard icon={Hospital} label="Hospital Active" value={analytics.hospital_active} description="Active hospital links" />
                    <MetricCard icon={Activity} label="Hospital Inactive" value={analytics.hospital_inactive} description="Inactive hospital links" />
                  </section>

                  <h3 style={{ marginTop: 24 }}>
                    <HandHeart size={18} /> Volunteer Task Statistics
                  </h3>

                  <section className="dashboard-stats">
                    <MetricCard icon={Clock} label="Pending Tasks" value={analytics.volunteer_pending} description="Tasks waiting to start" />
                    <MetricCard icon={TrendingUp} label="In Progress" value={analytics.volunteer_in_progress} description="Ongoing tasks" />
                    <MetricCard icon={CheckCircle2} label="Completed" value={analytics.volunteer_completed} description="Completed tasks" />
                    <MetricCard icon={XCircle} label="Cancelled" value={analytics.volunteer_cancelled} description="Cancelled tasks" />
                  </section>
                </>
              )}
            </section>
            )}

            {/* USER MANAGEMENT */}
            {(activeTab === "all" || activeTab === "directory") && (
            <section className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    <Users size={21} /> User Management
                  </h2>
                  <p>
                    View, search, suspend and reactivate registered accounts.
                  </p>
                </div>

                <button
                  className="small-action"
                  type="button"
                  onClick={refreshDirectory}
                  disabled={directoryLoading || directoryActionId !== null}
                >
                  <RefreshCw size={16} />
                  {directoryLoading ? "Loading..." : "Refresh Users"}
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                  marginTop: 20,
                  marginBottom: 18,
                }}
              >
                <div>
                  <label htmlFor="directory-search">Search users</label>
                  <div style={{ position: "relative" }}>
                    <Search
                      size={18}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 13,
                        color: "#64746f",
                      }}
                    />
                    <input
                      id="directory-search"
                      type="text"
                      value={directorySearch}
                      onChange={(e) => setDirectorySearch(e.target.value)}
                      placeholder="Search name, phone or user ID"
                      style={{
                        ...fieldStyle,
                        paddingLeft: 38,
                        marginBottom: 0,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="directory-role">Filter by role</label>
                  <select
                    id="directory-role"
                    value={directoryRole}
                    onChange={(e) => setDirectoryRole(e.target.value)}
                    style={{ ...fieldStyle, marginBottom: 0 }}
                  >
                    {DIRECTORY_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role === "All" ? "All roles" : role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 16,
                  color: "#64746f",
                  fontSize: 14,
                }}
              >
                <span>
                  Showing <strong>{filteredDirectoryUsers.length}</strong> of{" "}
                  <strong>{directoryUsers.length}</strong> users
                </span>
                <span>
                  Total registered accounts: {directoryUsers.length}
                </span>
              </div>

              {directoryLoading && directoryUsers.length === 0 ? (
                <p>Loading registered users...</p>
              ) : filteredDirectoryUsers.length === 0 ? (
                <div
                  style={{
                    padding: 20,
                    textAlign: "center",
                    background: "#f7faf8",
                    borderRadius: 10,
                  }}
                >
                  <Users size={28} color="#64746f" />
                  <p style={{ marginBottom: 0 }}>
                    No users match your search or selected role.
                  </p>
                </div>
              ) : (
                <div className="medicine-list">
                  {filteredDirectoryUsers.map((user) => {
                    const suspended = isUserSuspended(user);
                    const isSelf = user.user_id === currentUserId;
                    const protectedAccount = user.is_admin || isSelf;
                    const processing =
                      directoryActionId === user.user_id;

                    return (
                      <article
                        className="medicine-item"
                        key={user.user_id}
                        style={{
                          padding: 15,
                          marginBottom: 12,
                          border: "1px solid #e7ece9",
                          borderRadius: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        <div className="medicine-icon">
                          <UserRound size={21} />
                        </div>

                        <div
                          className="medicine-info"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            <h3 style={{ margin: 0 }}>
                              {user.full_name || "Unnamed User"}
                            </h3>

                            <span
                              style={{
                                padding: "5px 10px",
                                borderRadius: 20,
                                background: "#e8f3ed",
                                color: "#176b45",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              {user.role}
                            </span>
                          </div>

                          <p style={{ marginTop: 12 }}>
                            <Phone size={15} />{" "}
                            {user.phone || "Phone not provided"}
                          </p>

                          <p>
                            <Languages size={15} />{" "}
                            {user.preferred_language || "Language not specified"}
                          </p>

                          <p>
                            <CalendarDays size={15} /> Registered:{" "}
                            {user.registered_at
                              ? new Date(user.registered_at).toLocaleString()
                              : "Not available"}
                          </p>

                          <p
                            style={{
                              fontSize: 12,
                              color: "#64746f",
                              overflowWrap: "anywhere",
                            }}
                          >
                            User ID: {user.user_id}
                          </p>

                          <div style={{ marginTop: 12 }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "6px 11px",
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 700,
                                background: suspended ? "#fee4e2" : "#e8f3ed",
                                color: suspended ? "#b42318" : "#176b45",
                              }}
                            >
                              {suspended ? "SUSPENDED" : "ACTIVE"}
                            </span>

                            {user.is_admin && (
                              <span
                                style={{
                                  display: "inline-block",
                                  marginLeft: 7,
                                  padding: "6px 11px",
                                  borderRadius: 20,
                                  background: "#e9e8ff",
                                  color: "#4338a8",
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                ADMIN
                              </span>
                            )}

                            {isSelf && (
                              <span
                                style={{
                                  display: "inline-block",
                                  marginLeft: 7,
                                  padding: "6px 11px",
                                  borderRadius: 20,
                                  background: "#f1f5f9",
                                  color: "#475569",
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                YOUR ACCOUNT
                              </span>
                            )}
                          </div>

                          {!protectedAccount && (
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                                marginTop: 14,
                              }}
                            >
                              {suspended ? (
                                <button
                                  type="button"
                                  className="continue-button"
                                  disabled={processing || directoryActionId !== null}
                                  onClick={() =>
                                    manageUserAccount(user, "reactivate")
                                  }
                                >
                                  <RotateCcw size={16} />
                                  {processing ? "Processing..." : "Reactivate Account"}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="small-action"
                                  disabled={processing || directoryActionId !== null}
                                  onClick={() =>
                                    manageUserAccount(user, "suspend")
                                  }
                                >
                                  <Ban size={16} />
                                  {processing ? "Processing..." : "Suspend Account"}
                                </button>
                              )}
                            </div>
                          )}

                          {protectedAccount && (
                            <p
                              style={{
                                fontSize: 13,
                                color: "#64746f",
                                marginTop: 12,
                              }}
                            >
                              This account is protected from account management.
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
            )}

            {/* ACCOUNT REQUESTS */}
            {(activeTab === "all" || activeTab === "approvals") && (
              <>
                <section className="dashboard-stats">
                  <MetricCard icon={Clock} label="Pending Requests" value={pendingCount} description="Awaiting review" />
                  <MetricCard icon={CheckCircle2} label="Approved" value={approvedCount} description="Authorized accounts" />
                  <MetricCard icon={XCircle} label="Rejected" value={rejectedCount} description="Declined requests" />
                </section>

                <section className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    <Users size={21} /> Account requests
                  </h2>
                  <p>Review professional registrations.</p>
                </div>

                <button
                  className="small-action"
                  type="button"
                  onClick={loadDashboard}
                  disabled={loading}
                >
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                {["Pending", "Approved", "Rejected", "All"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={
                      filter === status ? "continue-button" : "small-action"
                    }
                    onClick={() => setFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {filteredRequests.length === 0 ? (
                <p>No requests found.</p>
              ) : (
                <div className="medicine-list">
                  {filteredRequests.map((request) => (
                    <article
                      className="medicine-item"
                      key={request.user_id}
                      style={{
                        padding: 15,
                        marginBottom: 12,
                        border: "1px solid #e7ece9",
                        borderRadius: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <div className="medicine-icon">
                        <UserRound size={20} />
                      </div>

                      <div className="medicine-info" style={{ flex: 1 }}>
                        <h3>{request.full_name || request.role}</h3>
                        <p>Role: <strong>{request.role}</strong></p>
                        <p style={{ fontSize: 12, overflowWrap: "anywhere" }}>
                          User ID: {request.user_id}
                        </p>
                        <strong>{request.status.toUpperCase()}</strong>

                        {request.status === "Pending" && (
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              marginTop: 12,
                            }}
                          >
                            <button
                              className="continue-button"
                              type="button"
                              disabled={processingId === request.user_id}
                              onClick={() =>
                                reviewRequest(request.user_id, "Approved")
                              }
                            >
                              <CheckCircle2 size={16} /> Approve
                            </button>

                            <button
                              className="small-action"
                              type="button"
                              disabled={processingId === request.user_id}
                              onClick={() =>
                                reviewRequest(request.user_id, "Rejected")
                              }
                            >
                              <XCircle size={16} /> Reject
                            </button>
                          </div>
                        )}

                        {processingId === request.user_id && (
                          <p>Processing...</p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
            </>
            )}

            {/* ASSIGNMENTS */}
            {(activeTab === "all" || activeTab === "assignments") && (
            <>
            {/* ASSIGNMENT CREATION */}
            <section className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    <UserPlus size={21} /> Patient assignment manager
                  </h2>
                  <p>
                    Assign approved professionals to registered patients.
                  </p>
                </div>
              </div>

              <form onSubmit={createAssignment}>
                <label>Professional role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setProfessionalId("");
                    setPatientId("");
                  }}
                  style={fieldStyle}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>

                <label>Choose {selectedRole}</label>
                <select
                  value={professionalId}
                  onChange={(e) => setProfessionalId(e.target.value)}
                  style={fieldStyle}
                  required
                >
                  <option value="">Select {selectedRole}</option>
                  {professionals.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.user_id.slice(0, 8)})
                    </option>
                  ))}
                </select>

                <label>Choose Patient</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  style={fieldStyle}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.user_id.slice(0, 8)})
                    </option>
                  ))}
                </select>

                {selectedRole === "Volunteer" && (
                  <>
                    <label>Task description</label>
                    <textarea
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="Describe the task for the volunteer..."
                      required
                      rows={3}
                      style={fieldStyle}
                    />
                  </>
                )}

                <button
                  className="continue-button"
                  type="submit"
                  disabled={assignmentLoading}
                >
                  <UserPlus size={17} />
                  {assignmentLoading
                    ? "Creating..."
                    : selectedRole === "Volunteer"
                    ? "Create Volunteer Task"
                    : "Create Assignment"}
                </button>

                {professionals.length === 0 && (
                  <p style={{ color: "#b7791f", marginTop: 10 }}>
                    No approved {selectedRole} accounts available.
                  </p>
                )}

                {patients.length === 0 && (
                  <p style={{ color: "#b7791f", marginTop: 10 }}>
                    No registered Patient accounts available.
                  </p>
                )}
              </form>
            </section>

            {/* ASSIGNMENT OVERVIEW */}
            <section className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    <ClipboardList size={21} /> Assignment overview
                  </h2>
                  <p>
                    View, deactivate, reactivate or cancel assignments.
                  </p>
                </div>

                <button
                  className="small-action"
                  type="button"
                  onClick={refreshAssignments}
                  disabled={assignmentProcessingId !== null}
                >
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>

              {ROLES.map((role) => (
                <div key={role} style={{ marginTop: 20 }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {role === "Doctor" && <Stethoscope size={18} />}
                    {role === "Nurse" && <HeartPulse size={18} />}
                    {role === "Hospital" && <Hospital size={18} />}
                    {role === "Volunteer" && <HandHeart size={18} />}
                    {role} ({assignments[role].length})
                  </h3>

                  {assignments[role].length === 0 ? (
                    <p style={{ color: "#64746f" }}>No records found.</p>
                  ) : (
                    assignments[role].map((item) => {
                      const professionalId =
                        role === "Doctor"
                          ? item.doctor_id
                          : role === "Nurse"
                          ? item.nurse_id
                          : role === "Hospital"
                          ? item.hospital_id
                          : item.volunteer_id;

                      const isVolunteer = role === "Volunteer";
                      const isActive = item.is_active;
                      const isCancelled = item.status === "Cancelled";
                      const isProcessing = assignmentProcessingId === item.id;

                      return (
                        <article
                          key={item.id}
                          className="medicine-item"
                          style={{
                            padding: 14,
                            marginBottom: 10,
                            border: "1px solid #e7ece9",
                            borderRadius: 10,
                            alignItems: "flex-start",
                          }}
                        >
                          <div className="medicine-info" style={{ flex: 1 }}>
                            <strong>{findName(professionalId)}</strong>
                            <p>Patient: {findName(item.patient_id)}</p>

                            {isVolunteer && (
                              <p>Task: {item.task_description}</p>
                            )}

                            <p>
                              Status:{" "}
                              <strong>
                                {isVolunteer
                                  ? item.status
                                  : isActive
                                  ? "Active"
                                  : "Inactive"}
                              </strong>
                            </p>

                            <p style={{ fontSize: 12, color: "#64746f" }}>
                              Created:{" "}
                              {item.created_at
                                ? new Date(item.created_at).toLocaleString()
                                : "Not available"}
                            </p>

                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                                marginTop: 12,
                              }}
                            >
                              {!isVolunteer && (
                                <button
                                  type="button"
                                  className={isActive ? "small-action" : "continue-button"}
                                  disabled={isProcessing}
                                  onClick={() =>
                                    updateAssignment(
                                      role,
                                      item.id,
                                      isActive ? "Deactivate" : "Reactivate"
                                    )
                                  }
                                >
                                  {isActive ? <Ban size={16} /> : <RotateCcw size={16} />}
                                  {isActive ? "Deactivate" : "Reactivate"}
                                </button>
                              )}

                              {isVolunteer && !isCancelled && (
                                <button
                                  type="button"
                                  className="small-action"
                                  disabled={isProcessing}
                                  onClick={() =>
                                    updateAssignment("Volunteer", item.id, "Cancel")
                                  }
                                >
                                  <XCircle size={16} /> Cancel Task
                                </button>
                              )}

                              {isProcessing && (
                                <span style={{ fontSize: 13 }}>Updating...</span>
                              )}

                              {isVolunteer && isCancelled && (
                                <span
                                  style={{
                                    color: "#b42318",
                                    fontSize: 13,
                                    fontWeight: 600,
                                  }}
                                >
                                  Task cancelled
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              ))}
            </section>
            </>
            )}

            {/* ADMIN ACTIVITY & AUDIT LOGS */}
            {(activeTab === "all" || activeTab === "logs") && (
              <section className="dashboard-panel" id="admin-activity-logs">
                <div className="panel-heading">
                  <div>
                    <h2>
                      <History size={21} /> Activity & Audit Logs
                    </h2>
                    <p>
                      Immutable, verified record of administrative actions, account approvals,
                      assignments, and account access changes.
                    </p>
                  </div>

                  <button
                    className="small-action"
                    type="button"
                    onClick={refreshLogs}
                    disabled={logsLoading}
                  >
                    <RefreshCw size={16} />
                    {logsLoading ? "Loading..." : "Refresh Logs"}
                  </button>
                </div>

                {/* FILTERS & SEARCH BAR */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 12,
                    marginTop: 20,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <label htmlFor="log-category-filter">Filter by Category</label>
                    <select
                      id="log-category-filter"
                      value={logCategoryFilter}
                      onChange={(e) => {
                        setLogCategoryFilter(e.target.value);
                        setLogPage(1);
                      }}
                      style={{ ...fieldStyle, marginBottom: 0 }}
                    >
                      <option value="All">All Categories ({logs.length})</option>
                      <option value="Accounts">Account Actions (Approvals & Suspensions)</option>
                      <option value="Assignments">Professional Assignments</option>
                      <option value="Volunteers">Volunteer Tasks</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="log-date-filter">Filter by Date</label>
                    <select
                      id="log-date-filter"
                      value={logDateFilter}
                      onChange={(e) => {
                        setLogDateFilter(e.target.value);
                        setLogPage(1);
                      }}
                      style={{ ...fieldStyle, marginBottom: 0 }}
                    >
                      <option value="All">All Time</option>
                      <option value="Today">Today</option>
                      <option value="7days">Past 7 Days</option>
                      <option value="30days">Past 30 Days</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="log-search-query">Search Activity Logs</label>
                    <div style={{ position: "relative" }}>
                      <Search
                        size={18}
                        style={{
                          position: "absolute",
                          left: 12,
                          top: 13,
                          color: "#64746f",
                        }}
                      />
                      <input
                        id="log-search-query"
                        type="text"
                        value={logSearch}
                        onChange={(e) => {
                          setLogSearch(e.target.value);
                          setLogPage(1);
                        }}
                        placeholder="Search action, name, email or UUID..."
                        style={{
                          ...fieldStyle,
                          paddingLeft: 38,
                          marginBottom: 0,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* LOG COUNT & ACTIVE FILTER BADGES */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 16,
                    color: "#64746f",
                    fontSize: 14,
                  }}
                >
                  <span>
                    Showing{" "}
                    <strong>
                      {filteredLogs.length === 0
                        ? 0
                        : (logPage - 1) * logsPerPage + 1}{" "}
                      - {Math.min(logPage * logsPerPage, filteredLogs.length)}
                    </strong>{" "}
                    of <strong>{filteredLogs.length}</strong> activity record{filteredLogs.length === 1 ? "" : "s"}
                  </span>

                  {(logCategoryFilter !== "All" || logDateFilter !== "All" || logSearch) && (
                    <button
                      type="button"
                      className="small-action"
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => {
                        setLogCategoryFilter("All");
                        setLogDateFilter("All");
                        setLogSearch("");
                        setLogPage(1);
                      }}
                    >
                      Reset Filters
                    </button>
                  )}
                </div>

                {/* ERROR STATE */}
                {logsError && (
                  <div
                    style={{
                      padding: 14,
                      background: "#fee4e2",
                      borderRadius: 8,
                      color: "#b42318",
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <ShieldAlert size={18} />
                    <span style={{ flex: 1 }}>{logsError}</span>
                    <button
                      type="button"
                      className="small-action"
                      onClick={refreshLogs}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* LOADING STATE */}
                {logsLoading && logs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 15px", color: "#64746f" }}>
                    <p>Loading activity logs from database...</p>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div
                    style={{
                      padding: "35px 20px",
                      textAlign: "center",
                      background: "#f7faf8",
                      borderRadius: 10,
                      border: "1px dashed #ccd9d5",
                    }}
                  >
                    <History size={32} color="#64746f" style={{ marginBottom: 10 }} />
                    <h3 style={{ margin: "0 0 6px" }}>No activity logs found</h3>
                    <p style={{ color: "#64746f", maxWidth: 500, margin: "0 auto", fontSize: 14 }}>
                      {logs.length === 0
                        ? "Administrative activities will appear here when accounts are approved, assignments are managed, or users are suspended/reactivated."
                        : "No logs match your search criteria. Try selecting different filters or clearing your search."}
                    </p>
                  </div>
                ) : (
                  <div className="medicine-list">
                    {paginatedLogs.map((log) => {
                      const badge = getActionBadge(log.action);
                      const ActionIcon = badge.icon;
                      const targetName = resolveTargetName(log);
                      const adminName = resolveAdminName(log);
                      const details = log.details || {};

                      return (
                        <article
                          key={log.id || log.log_id}
                          className="medicine-item"
                          style={{
                            display: "block",
                            padding: 16,
                            marginBottom: 12,
                            border: "1px solid #e7ece9",
                            borderRadius: 10,
                            background: "#ffffff",
                          }}
                        >
                          {/* Top row: Action badge, role badge, timestamp */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 10,
                              marginBottom: 12,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  padding: "5px 12px",
                                  borderRadius: 16,
                                  background: badge.bg,
                                  color: badge.color,
                                  border: `1px solid ${badge.border}`,
                                  fontSize: 13,
                                  fontWeight: 700,
                                }}
                              >
                                <ActionIcon size={15} />
                                {badge.label}
                              </span>

                              {log.target_role && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: 14,
                                    background: "#e8f3ed",
                                    color: "#176b45",
                                    fontSize: 12,
                                    fontWeight: 600,
                                  }}
                                >
                                  {log.target_role}
                                </span>
                              )}
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                color: "#77847f",
                                fontSize: 13,
                              }}
                            >
                              <Clock size={14} />
                              <span>
                                {log.created_at
                                  ? new Date(log.created_at).toLocaleString()
                                  : "Recently"}
                              </span>
                            </div>
                          </div>

                          {/* Main row: Actors (Admin -> Target) */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                              gap: 14,
                              padding: "12px 14px",
                              background: "#f9fbfa",
                              borderRadius: 8,
                              marginBottom: 12,
                            }}
                          >
                            <div>
                              <span style={{ fontSize: 12, color: "#64746f", textTransform: "uppercase", fontWeight: 700 }}>
                                Performed By
                              </span>
                              <div style={{ fontWeight: 600, color: "#1e293b", marginTop: 2 }}>
                                {adminName}
                              </div>
                              {log.admin_id && (
                                <span style={{ fontSize: 11, color: "#8a9792", overflowWrap: "anywhere" }}>
                                  ID: {log.admin_id}
                                </span>
                              )}
                            </div>

                            <div>
                              <span style={{ fontSize: 12, color: "#64746f", textTransform: "uppercase", fontWeight: 700 }}>
                                Target Account
                              </span>
                              <div style={{ fontWeight: 600, color: "#1e293b", marginTop: 2 }}>
                                {targetName}
                              </div>
                              {log.target_user_id && (
                                <span style={{ fontSize: 11, color: "#8a9792", overflowWrap: "anywhere" }}>
                                  ID: {log.target_user_id}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Details and Metadata */}
                          {details && Object.keys(details).length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8,
                                fontSize: 13,
                              }}
                            >
                              {details.task_description && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    background: "#f1f5f9",
                                    borderRadius: 6,
                                    color: "#334155",
                                  }}
                                >
                                  <strong>Task:</strong> {details.task_description}
                                </span>
                              )}

                              {details.decision && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    background: details.decision === "Approved" ? "#e8f3ed" : "#fee4e2",
                                    borderRadius: 6,
                                    color: details.decision === "Approved" ? "#167044" : "#b42318",
                                    fontWeight: 600,
                                  }}
                                >
                                  Decision: {details.decision}
                                </span>
                              )}

                              {details.email && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    background: "#f1f5f9",
                                    borderRadius: 6,
                                    color: "#334155",
                                  }}
                                >
                                  Email: {details.email}
                                </span>
                              )}

                              {details.professional_id && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    background: "#f1f5f9",
                                    borderRadius: 6,
                                    color: "#334155",
                                  }}
                                >
                                  Professional: {findName(details.professional_id)}
                                </span>
                              )}

                              {details.volunteer_id && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    background: "#f1f5f9",
                                    borderRadius: 6,
                                    color: "#334155",
                                  }}
                                >
                                  Volunteer: {findName(details.volunteer_id)}
                                </span>
                              )}

                              {details.action && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    background: "#f1f5f9",
                                    borderRadius: 6,
                                    color: "#334155",
                                  }}
                                >
                                  Action: {details.action}
                                </span>
                              )}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}

                {/* PAGINATION CONTROLS */}
                {totalLogPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12,
                      marginTop: 20,
                      paddingTop: 16,
                      borderTop: "1px solid #e7ece9",
                    }}
                  >
                    <button
                      type="button"
                      className="small-action"
                      disabled={logPage <= 1}
                      onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>

                    <span style={{ fontSize: 14, color: "#64746f" }}>
                      Page <strong>{logPage}</strong> of <strong>{totalLogPages}</strong>
                    </span>

                    <button
                      type="button"
                      className="small-action"
                      disabled={logPage >= totalLogPages}
                      onClick={() => setLogPage((p) => Math.min(totalLogPages, p + 1))}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const fieldStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  marginBottom: "16px",
  border: "1px solid #d5dfda",
  borderRadius: "8px",
  fontSize: "14px",
  background: "#fff",
};
