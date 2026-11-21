
import { useEffect, useState } from "react";
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
  ListChecks,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const ROLES = ["Doctor", "Nurse", "Hospital", "Volunteer"];

const TABLES = {
  Doctor: { table: "doctor_patient_links" },
  Nurse: { table: "nurse_patient_links" },
  Hospital: { table: "hospital_patient_links" },
};

export default function AdminAccess({ onLogout }) {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState("Pending");

  const [users, setUsers] = useState([]);
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
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Unable to review account.");
    } finally {
      setProcessingId(null);
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

      await Promise.all([loadAssignments(), loadAnalytics()]);
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

      await Promise.all([loadAssignments(), loadAnalytics()]);
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
    await loadAnalytics();
    if (analytics) setSuccess("Analytics refreshed successfully.");
  };

  // ANALYTICS CARD
  const MetricCard = ({ icon: Icon, label, value, description }) => (
    <article className="stat-card">
      <div className="stat-icon">
        <Icon />
      </div>
      <p>{label}</p>
      <h2>{value ?? 0}</h2>
      <span>{description}</span>
    </article>
  );

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
            {/* ADMIN ANALYTICS */}
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
                    <MetricCard
                      icon={UserRound}
                      label="Patients"
                      value={analytics.patients}
                      description="Registered patient accounts"
                    />
                    <MetricCard
                      icon={Stethoscope}
                      label="Doctors"
                      value={analytics.doctors}
                      description="Approved doctors"
                    />
                    <MetricCard
                      icon={HeartPulse}
                      label="Nurses"
                      value={analytics.nurses}
                      description="Approved nurses"
                    />
                    <MetricCard
                      icon={Hospital}
                      label="Hospitals"
                      value={analytics.hospitals}
                      description="Approved hospitals"
                    />
                    <MetricCard
                      icon={HandHeart}
                      label="Volunteers"
                      value={analytics.volunteers}
                      description="Approved volunteers"
                    />
                  </section>

                  <h3 style={{ marginTop: 24 }}>
                    <UserCheck size={18} /> Account Requests
                  </h3>

                  <section className="dashboard-stats">
                    <MetricCard
                      icon={Clock}
                      label="Pending"
                      value={analytics.pending_requests}
                      description="Awaiting review"
                    />
                    <MetricCard
                      icon={CheckCircle2}
                      label="Approved"
                      value={analytics.approved_requests}
                      description="Approved requests"
                    />
                    <MetricCard
                      icon={XCircle}
                      label="Rejected"
                      value={analytics.rejected_requests}
                      description="Rejected requests"
                    />
                  </section>

                  <h3 style={{ marginTop: 24 }}>
                    <ClipboardList size={18} /> Professional Assignments
                  </h3>

                  <section className="dashboard-stats">
                    <MetricCard
                      icon={Stethoscope}
                      label="Doctor Active"
                      value={analytics.doctor_active}
                      description="Active doctor links"
                    />
                    <MetricCard
                      icon={Activity}
                      label="Doctor Inactive"
                      value={analytics.doctor_inactive}
                      description="Inactive doctor links"
                    />
                    <MetricCard
                      icon={HeartPulse}
                      label="Nurse Active"
                      value={analytics.nurse_active}
                      description="Active nurse links"
                    />
                    <MetricCard
                      icon={Activity}
                      label="Nurse Inactive"
                      value={analytics.nurse_inactive}
                      description="Inactive nurse links"
                    />
                    <MetricCard
                      icon={Hospital}
                      label="Hospital Active"
                      value={analytics.hospital_active}
                      description="Active hospital links"
                    />
                    <MetricCard
                      icon={Activity}
                      label="Hospital Inactive"
                      value={analytics.hospital_inactive}
                      description="Inactive hospital links"
                    />
                  </section>

                  <h3 style={{ marginTop: 24 }}>
                    <HandHeart size={18} /> Volunteer Task Statistics
                  </h3>

                  <section className="dashboard-stats">
                    <MetricCard
                      icon={Clock}
                      label="Pending Tasks"
                      value={analytics.volunteer_pending}
                      description="Tasks waiting to start"
                    />
                    <MetricCard
                      icon={TrendingUp}
                      label="In Progress"
                      value={analytics.volunteer_in_progress}
                      description="Ongoing tasks"
                    />
                    <MetricCard
                      icon={CheckCircle2}
                      label="Completed"
                      value={analytics.volunteer_completed}
                      description="Completed tasks"
                    />
                    <MetricCard
                      icon={XCircle}
                      label="Cancelled"
                      value={analytics.volunteer_cancelled}
                      description="Cancelled tasks"
                    />
                  </section>
                </>
              )}
            </section>

            {/* ACCOUNT REQUEST SUMMARY */}
            <section className="dashboard-stats">
              <MetricCard
                icon={Clock}
                label="Pending Requests"
                value={pendingCount}
                description="Awaiting review"
              />
              <MetricCard
                icon={CheckCircle2}
                label="Approved"
                value={approvedCount}
                description="Authorized accounts"
              />
              <MetricCard
                icon={XCircle}
                label="Rejected"
                value={rejectedCount}
                description="Declined requests"
              />
            </section>

            {/* ACCOUNT APPROVALS */}
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
                        <p>
                          Role: <strong>{request.role}</strong>
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            overflowWrap: "anywhere",
                          }}
                        >
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
                    <option key={role} value={role}>
                      {role}
                    </option>
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
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
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
                      const isProcessing =
                        assignmentProcessingId === item.id;

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
                          <div
                            className="medicine-info"
                            style={{ flex: 1 }}
                          >
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

                            <p
                              style={{
                                fontSize: 12,
                                color: "#64746f",
                              }}
                            >
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
                                  className={
                                    isActive
                                      ? "small-action"
                                      : "continue-button"
                                  }
                                  disabled={isProcessing}
                                  onClick={() =>
                                    updateAssignment(
                                      role,
                                      item.id,
                                      isActive ? "Deactivate" : "Reactivate"
                                    )
                                  }
                                >
                                  {isActive ? (
                                    <Ban size={16} />
                                  ) : (
                                    <RotateCcw size={16} />
                                  )}
                                  {isActive ? "Deactivate" : "Reactivate"}
                                </button>
                              )}

                              {isVolunteer && !isCancelled && (
                                <button
                                  type="button"
                                  className="small-action"
                                  disabled={isProcessing}
                                  onClick={() =>
                                    updateAssignment(
                                      "Volunteer",
                                      item.id,
                                      "Cancel"
                                    )
                                  }
                                >
                                  <XCircle size={16} />
                                  Cancel Task
                                </button>
                              )}

                              {isProcessing && (
                                <span style={{ fontSize: 13 }}>
                                  Updating...
                                </span>
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
