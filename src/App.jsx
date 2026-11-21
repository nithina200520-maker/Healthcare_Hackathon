import HospitalAccess from "./components/HospitalAccess";
import { useEffect, useState } from "react";
import PatientDashboard from "./components/PatientDashboard";
import { supabase } from "./lib/supabase";

import {
  HeartPulse,
  UserRound,
  Stethoscope,
  ClipboardList,
  Hospital,
  Users,
  HandHeart,
  ArrowRight,
  ShieldCheck,
  Globe,
  ArrowLeft,
  Bell,
  CheckCircle2,
  RefreshCw,
  LogOut,
  AlertCircle,
  Copy,
  UserPlus,
  Link2,
  XCircle,
  Clock,
  ShieldAlert,
  MessageSquare,
  Send,
  Reply,
  FileText,
} from "lucide-react";

import "./index.css";

// --------------------------------------------------
// ROLE CONFIGURATION
// --------------------------------------------------

const roles = [
  {
    name: "Patient",
    description: "Manage medicines and health updates",
    icon: UserRound,
  },
  {
    name: "Doctor",
    description: "Monitor patients and manage care",
    icon: Stethoscope,
  },
  {
    name: "Nurse",
    description: "Track medicines and patient support",
    icon: ClipboardList,
  },
  {
    name: "Hospital",
    description: "Coordinate healthcare services",
    icon: Hospital,
  },
  {
    name: "Caregiver",
    description: "Support a family member or patient",
    icon: Users,
  },
  {
    name: "Volunteer",
    description: "Help patients access healthcare",
    icon: HandHeart,
  },
];

const ENABLED_ROLES = [
  "Patient",
  "Caregiver",
  "Nurse",
  "Doctor",
  "Hospital",
];

// --------------------------------------------------
// PATIENT / CAREGIVER CONNECTIONS
// --------------------------------------------------

function ConnectionPanel({ role }) {
  const [userId, setUserId] = useState("");
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const loadConnections = async () => {
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

      const column =
        role === "Patient" ? "patient_id" : "caregiver_id";

      const { data, error: linkError } = await supabase
        .from("caregiver_links")
        .select("id, patient_id, caregiver_id, status, created_at")
        .eq(column, user.id)
        .order("created_at", { ascending: false });

      if (linkError) throw linkError;

      setConnections(data || []);
    } catch (err) {
      setError(err.message || "Unable to load connections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, [role]);

  const sendRequest = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const targetId = userId.trim();

    if (!targetId) {
      setError("Enter the caregiver's account ID.");
      return;
    }

    if (targetId === currentUserId) {
      setError("You cannot connect your account to itself.");
      return;
    }

    setSaving(true);

    try {
      const { error: insertError } = await supabase
        .from("caregiver_links")
        .insert({
          patient_id: currentUserId,
          caregiver_id: targetId,
          status: "pending",
        });

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error(
            "A connection request already exists for this account."
          );
        }

        if (insertError.code === "23503") {
          throw new Error(
            "This account ID was not found. Ask the caregiver to check their ID."
          );
        }

        throw insertError;
      }

      setMessage("Connection request sent successfully.");
      setUserId("");
      await loadConnections();
    } catch (err) {
      setError(err.message || "Could not send the request.");
    } finally {
      setSaving(false);
    }
  };

  const respondToRequest = async (connectionId, status) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("caregiver_links")
        .update({ status })
        .eq("id", connectionId)
        .eq("status", "pending");

      if (updateError) throw updateError;

      setMessage(
        status === "accepted"
          ? "Connection request accepted."
          : "Connection request rejected."
      );

      await loadConnections();
    } catch (err) {
      setError(err.message || "Unable to update the request.");
    } finally {
      setSaving(false);
    }
  };

  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(currentUserId);
      setMessage("Your account ID has been copied.");
    } catch {
      setError("Could not copy automatically. Select and copy your ID.");
    }
  };

  return (
    <section className="dashboard-panel" style={{ marginBottom: 24 }}>
      <div className="panel-heading">
        <div>
          <h2>
            <Link2 size={21} />
            {role === "Patient"
              ? "Caregiver connections"
              : "Patient connections"}
          </h2>
          <p>
            {role === "Patient"
              ? "Connect with someone who can support your care."
              : "Review patient connection requests."}
          </p>
        </div>

        <button
          className="small-action"
          type="button"
          onClick={loadConnections}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div
        style={{
          background: "#f3f8f6",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <p style={{ margin: "0 0 8px", fontWeight: 600 }}>
          Your CareBridge account ID
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <code style={{ overflowWrap: "anywhere", fontSize: 13, flex: 1 }}>
            {currentUserId || "Loading account ID..."}
          </code>

          <button
            className="small-action"
            type="button"
            onClick={copyUserId}
            disabled={!currentUserId}
          >
            <Copy size={15} />
            Copy ID
          </button>
        </div>

        <p style={{ fontSize: 12, color: "#64746f", marginBottom: 0 }}>
          Share this ID only with the person you want to connect with.
        </p>
      </div>

      {role === "Patient" && (
        <form onSubmit={sendRequest} style={{ marginBottom: 22 }}>
          <label
            htmlFor="caregiver-id"
            style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
          >
            Enter caregiver account ID
          </label>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              id="caregiver-id"
              type="text"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Paste caregiver UUID"
              required
              style={{ flex: 1, minWidth: 200 }}
            />

            <button
              className="continue-button"
              type="submit"
              disabled={saving || !currentUserId}
            >
              <UserPlus size={17} />
              {saving ? "Sending..." : "Send request"}
            </button>
          </div>
        </form>
      )}

      {message && (
        <p role="status" style={{ color: "#167044", marginBottom: 12 }}>
          {message}
        </p>
      )}

      {error && (
        <p role="alert" style={{ color: "#b42318", marginBottom: 12 }}>
          {error}
        </p>
      )}

      <h3 style={{ marginBottom: 12 }}>
        {role === "Patient" ? "Your caregivers" : "Patient requests"}
      </h3>

      {loading ? (
        <p>Loading connections...</p>
      ) : connections.length === 0 ? (
        <p style={{ color: "#64746f", padding: "12px 0" }}>
          {role === "Patient"
            ? "No caregiver connections yet. Send a request using their account ID."
            : "No patient connection requests yet."}
        </p>
      ) : (
        <div className="medicine-list">
          {connections.map((connection) => {
            const otherUserId =
              role === "Patient"
                ? connection.caregiver_id
                : connection.patient_id;

            return (
              <article
                className="medicine-item"
                key={connection.id}
                style={{
                  padding: 14,
                  marginBottom: 10,
                  border: "1px solid #e7ece9",
                  borderRadius: 10,
                }}
              >
                <div className="medicine-icon">
                  <Users size={20} />
                </div>

                <div className="medicine-info" style={{ flex: 1 }}>
                  <h3>{role === "Patient" ? "Caregiver" : "Patient"}</h3>
                  <p style={{ fontSize: 12, overflowWrap: "anywhere" }}>
                    Account ID: {otherUserId}
                  </p>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color:
                        connection.status === "accepted"
                          ? "#167044"
                          : connection.status === "rejected"
                            ? "#b42318"
                            : "#b7791f",
                    }}
                  >
                    {connection.status.toUpperCase()}
                  </span>
                </div>

                {role === "Caregiver" &&
                  connection.status === "pending" && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="taken-button"
                        disabled={saving}
                        onClick={() =>
                          respondToRequest(connection.id, "accepted")
                        }
                      >
                        <CheckCircle2 size={15} />
                        Accept
                      </button>

                      <button
                        type="button"
                        className="skip-button"
                        disabled={saving}
                        onClick={() =>
                          respondToRequest(connection.id, "rejected")
                        }
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

// --------------------------------------------------
// PATIENT DOCTOR COMMUNICATION
// --------------------------------------------------

function PatientConcernPanel() {
  const [assignments, setAssignments] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const loadData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Please log in again.");

      setCurrentUserId(user.id);

      const [assignmentResult, concernResult] = await Promise.all([
        supabase
          .from("doctor_patient_links")
          .select("id, doctor_id, patient_id, is_active")
          .eq("patient_id", user.id)
          .eq("is_active", true),

        supabase
          .from("patient_concerns")
          .select(
            "id, patient_id, doctor_id, subject, message, response, status, created_at, updated_at"
          )
          .eq("patient_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (assignmentResult.error) throw assignmentResult.error;
      if (concernResult.error) throw concernResult.error;

      setAssignments(assignmentResult.data || []);
      setConcerns(concernResult.data || []);
    } catch (err) {
      setError(err.message || "Unable to load doctor communication.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let channel = null;

    const start = async () => {
      await loadData();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) return;

      channel = supabase
        .channel(`patient-concerns-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "patient_concerns",
            filter: `patient_id=eq.${user.id}`,
          },
          () => loadData(false)
        )
        .subscribe();
    };

    start();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const submitConcern = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!selectedDoctor) {
      setError("Select an assigned doctor.");
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setError("Enter both a subject and your concern.");
      return;
    }

    setSaving(true);

    try {
      const { error: insertError } = await supabase
        .from("patient_concerns")
        .insert({
          patient_id: currentUserId,
          doctor_id: selectedDoctor,
          subject: subject.trim(),
          message: message.trim(),
          status: "Pending",
        });

      if (insertError) throw insertError;

      setSubject("");
      setMessage("");
      setNotice("Your concern has been sent to your assigned doctor.");
      await loadData(false);
    } catch (err) {
      setError(err.message || "Unable to submit your concern.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dashboard-panel" style={{ marginBottom: 24 }}>
      <div className="panel-heading">
        <div>
          <h2>
            <MessageSquare size={21} />
            Doctor communication
          </h2>
          <p>Send a non-emergency health concern to your assigned doctor.</p>
        </div>

        <button
          className="small-action"
          type="button"
          onClick={() => loadData()}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <p role="alert" style={{ color: "#b42318", marginBottom: 12 }}>
          {error}
        </p>
      )}

      {notice && (
        <p role="status" style={{ color: "#167044", marginBottom: 12 }}>
          {notice}
        </p>
      )}

      <form onSubmit={submitConcern} style={{ marginBottom: 25 }}>
        <label
          htmlFor="assigned-doctor"
          style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
        >
          Select assigned doctor
        </label>

        <select
          id="assigned-doctor"
          value={selectedDoctor}
          onChange={(event) => setSelectedDoctor(event.target.value)}
          required
          style={{ width: "100%", marginBottom: 15 }}
        >
          <option value="">Choose a doctor</option>
          {assignments.map((assignment) => (
            <option key={assignment.id} value={assignment.doctor_id}>
              Doctor — {assignment.doctor_id}
            </option>
          ))}
        </select>

        {assignments.length === 0 && !loading && (
          <p style={{ color: "#b7791f", fontSize: 13 }}>
            No doctor has been assigned to your account yet. Contact the
            CareBridge administrator.
          </p>
        )}

        <label
          htmlFor="concern-subject"
          style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
        >
          Subject
        </label>

        <input
          id="concern-subject"
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Example: Question about my medication"
          maxLength={150}
          required
          style={{ width: "100%", marginBottom: 15 }}
        />

        <label
          htmlFor="concern-message"
          style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
        >
          Describe your concern
        </label>

        <textarea
          id="concern-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write your question or concern..."
          rows={4}
          maxLength={3000}
          required
          style={{
            width: "100%",
            resize: "vertical",
            marginBottom: 15,
          }}
        />

        <button
          className="continue-button"
          type="submit"
          disabled={saving || loading || assignments.length === 0}
        >
          <Send size={17} />
          {saving ? "Sending..." : "Submit concern"}
        </button>
      </form>

      <h3 style={{ marginBottom: 12 }}>My submitted concerns</h3>

      {loading ? (
        <p>Loading your concerns...</p>
      ) : concerns.length === 0 ? (
        <p style={{ color: "#64746f" }}>
          You have not submitted any concerns yet.
        </p>
      ) : (
        <div className="medicine-list">
          {concerns.map((concern) => (
            <article
              key={concern.id}
              className="medicine-item"
              style={{
                display: "block",
                padding: 15,
                marginBottom: 12,
                border: "1px solid #e7ece9",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <h3>{concern.subject}</h3>

                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color:
                      concern.status === "Responded"
                        ? "#167044"
                        : concern.status === "Closed"
                          ? "#64746f"
                          : "#b7791f",
                  }}
                >
                  {concern.status.toUpperCase()}
                </span>
              </div>

              <p style={{ marginTop: 10 }}>{concern.message}</p>

              <p
                style={{
                  fontSize: 12,
                  color: "#64746f",
                  overflowWrap: "anywhere",
                }}
              >
                Doctor ID: {concern.doctor_id}
              </p>

              {concern.response ? (
                <div
                  style={{
                    background: "#f0f8f4",
                    padding: 14,
                    borderRadius: 9,
                    marginTop: 12,
                  }}
                >
                  <h4 style={{ marginBottom: 8 }}>
                    <Reply size={16} /> Doctor's response
                  </h4>
                  <p style={{ margin: 0 }}>{concern.response}</p>
                </div>
              ) : (
                <p style={{ color: "#b7791f", fontSize: 13 }}>
                  Waiting for your doctor to respond.
                </p>
              )}

              <p style={{ fontSize: 12, color: "#77847f", marginTop: 10 }}>
                Submitted: {new Date(concern.created_at).toLocaleString("en-IN")}
              </p>
            </article>
          ))}
        </div>
      )}

      <p className="dashboard-disclaimer">
        This feature is for non-emergency communication. It does not provide
        emergency medical assistance or replace professional medical care.
      </p>
    </section>
  );
}

// --------------------------------------------------
// PATIENT DASHBOARD
// --------------------------------------------------

function PatientHome({ onLogout }) {
  return (
    <>
      <div className="patient-dashboard">
        <main className="dashboard-content">
          <ConnectionPanel role="Patient" />
          <PatientConcernPanel />
        </main>
      </div>

      <PatientDashboard onLogout={onLogout} />
    </>
  );
}

// --------------------------------------------------
// SHARED CAREGIVER / NURSE NOTIFICATION DASHBOARD
// --------------------------------------------------

function NotificationDashboard({ onLogout, role }) {
  const [notifications, setNotifications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState("");

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  const loadDashboard = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Please log in again.");

      setCurrentUserId(user.id);

      const { data: notificationData, error: notificationError } =
        await supabase
          .from("notifications")
          .select(
            "id, title, message, is_read, created_at, patient_id"
          )
          .eq("recipient_id", user.id)
          .order("created_at", { ascending: false });

      if (notificationError) throw notificationError;

      setNotifications(notificationData || []);

      if (role === "Nurse") {
        const { data: assignmentData, error: assignmentError } =
          await supabase
            .from("nurse_patient_links")
            .select("id, patient_id, is_active, created_at")
            .eq("nurse_id", user.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        if (assignmentError) throw assignmentError;

        setAssignments(assignmentData || []);
      }
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    let channel = null;
    let cancelled = false;

    loadDashboard();

    const setupRealtime = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user || cancelled) return;

      channel = supabase
        .channel(`${role.toLowerCase()}-notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${user.id}`,
          },
          () => loadDashboard(false)
        )
        .subscribe();

      if (cancelled && channel) {
        supabase.removeChannel(channel);
      }
    };

    setupRealtime();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [role]);

  const markAsRead = async (notificationId) => {
    setUpdatingId(notificationId);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("recipient_id", currentUserId);

      if (updateError) throw updateError;

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notificationId
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch (err) {
      setError(err.message || "Could not update notification.");
    } finally {
      setUpdatingId(null);
    }
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
            <p className="dashboard-eyebrow">
              {role.toUpperCase()} DASHBOARD
            </p>
            <h1>Welcome, {role}!</h1>
            <p>
              {role === "Nurse"
                ? "Monitor your assigned patients and their medicine alerts."
                : "Stay informed about the patients you support."}
            </p>
          </div>

          <div className="dashboard-profile-icon">
            {role === "Nurse" ? (
              <ClipboardList size={30} />
            ) : (
              <Users size={30} />
            )}
          </div>
        </section>

        {role === "Caregiver" && <ConnectionPanel role="Caregiver" />}

        {role === "Nurse" && (
          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  <UserRound size={21} />
                  Assigned patients
                </h2>
                <p>Patients assigned to your approved nurse account.</p>
              </div>
              <span style={{ fontWeight: 700 }}>{assignments.length}</span>
            </div>

            {loading ? (
              <p>Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <p style={{ color: "#64746f" }}>
                No active patients have been assigned to your account yet.
                Contact the CareBridge administrator.
              </p>
            ) : (
              <div className="medicine-list">
                {assignments.map((assignment, index) => (
                  <article
                    className="medicine-item"
                    key={assignment.id}
                    style={{
                      padding: 14,
                      marginBottom: 10,
                      border: "1px solid #e7ece9",
                      borderRadius: 10,
                    }}
                  >
                    <div className="medicine-icon">
                      <UserRound size={20} />
                    </div>

                    <div className="medicine-info" style={{ flex: 1 }}>
                      <h3>Assigned Patient {index + 1}</h3>
                      <p style={{ fontSize: 12, overflowWrap: "anywhere" }}>
                        Patient ID: {assignment.patient_id}
                      </p>
                      <span
                        style={{
                          color: "#167044",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        ACTIVE ASSIGNMENT
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="dashboard-stats">
          <article className="stat-card">
            <div className="stat-icon">
              <Bell />
            </div>
            <p>Total notifications</p>
            <h2>{notifications.length}</h2>
            <span>All alerts received</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon">
              <AlertCircle />
            </div>
            <p>Unread notifications</p>
            <h2>{unreadCount}</h2>
            <span>Require your attention</span>
          </article>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <Bell size={21} />
                Patient alerts
              </h2>
              <p>Notifications about missed medicine doses.</p>
            </div>

            <button
              className="small-action"
              type="button"
              onClick={() => loadDashboard()}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {error && (
            <p role="alert" style={{ color: "#b42318", padding: 10 }}>
              {error}
            </p>
          )}

          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "35px 15px", color: "#64746f" }}>
              <Bell size={35} />
              <h3>No notifications yet</h3>
              <p>
                When an assigned patient misses a medicine dose, their alert
                will appear here.
              </p>
            </div>
          ) : (
            <div className="medicine-list">
              {notifications.map((notification) => (
                <article
                  className="medicine-item"
                  key={notification.id}
                  style={{
                    background: notification.is_read ? "#ffffff" : "#fff9ed",
                    border: "1px solid #e7ece9",
                    borderRadius: 10,
                    padding: 15,
                    marginBottom: 12,
                  }}
                >
                  <div className="medicine-icon">
                    <AlertCircle size={21} />
                  </div>

                  <div className="medicine-info" style={{ flex: 1 }}>
                    <h3>{notification.title}</h3>
                    <p>{notification.message}</p>
                    <p
                      style={{
                        fontSize: 12,
                        overflowWrap: "anywhere",
                        marginTop: 6,
                      }}
                    >
                      Patient ID: {notification.patient_id}
                    </p>
                    <span
                      style={{
                        display: "block",
                        fontSize: 12,
                        color: "#77847f",
                        marginTop: 8,
                      }}
                    >
                      {new Date(notification.created_at).toLocaleString("en-IN")}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        color: notification.is_read ? "#64746f" : "#b7791f",
                      }}
                    >
                      {notification.is_read ? "Read" : "Unread"}
                    </span>
                  </div>

                  {!notification.is_read && (
                    <button
                      className="taken-button"
                      type="button"
                      disabled={updatingId === notification.id}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle2 size={15} />
                      {updatingId === notification.id ? "Saving..." : "Mark read"}
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="dashboard-disclaimer">
          CareBridge provides health-management support, not medical diagnosis.
          Contact healthcare professionals for medical advice.
        </p>
      </main>
    </div>
  );
}

// --------------------------------------------------
// NURSE APPROVAL CHECK
// --------------------------------------------------

function NurseAccess({ onLogout }) {
  const [checking, setChecking] = useState(true);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");

  const checkApproval = async () => {
    setChecking(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Please log in again.");

      const { data, error: approvalError } = await supabase
        .from("authorized_nurses")
        .select("nurse_id")
        .eq("nurse_id", user.id)
        .maybeSingle();

      if (approvalError) throw approvalError;

      setApproved(Boolean(data));
    } catch (err) {
      setError(err.message || "Unable to verify nurse approval.");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkApproval();
  }, []);

  if (checking) {
    return (
      <div className="app">
        <main className="main-content">
          <p>Verifying nurse approval...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <main className="main-content">
          <ShieldAlert size={40} />
          <h2>Unable to verify account</h2>
          <p>{error}</p>
          <button className="continue-button" onClick={checkApproval}>
            Retry
          </button>
          <button className="logout-button" style={{ marginTop: 12 }} onClick={onLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </main>
      </div>
    );
  }

  if (!approved) {
    return (
      <div className="app">
        <main className="main-content" style={{ textAlign: "center", maxWidth: 550 }}>
          <div className="login-icon">
            <Clock size={30} />
          </div>
          <h2>Nurse account awaiting approval</h2>
          <p>
            Your nurse account has been created, but an administrator has not
            approved it yet. You will be able to access the Nurse Dashboard
            after approval.
          </p>
          <button className="continue-button" onClick={checkApproval} style={{ marginTop: 20 }}>
            <RefreshCw size={17} />
            Check approval status
          </button>
          <button className="logout-button" style={{ marginTop: 12 }} onClick={onLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </main>
      </div>
    );
  }

  return <NotificationDashboard role="Nurse" onLogout={onLogout} />;
}

// --------------------------------------------------
// DOCTOR DASHBOARD
// --------------------------------------------------

function DoctorDashboard({ onLogout }) {
  const [concerns, setConcerns] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const loadDoctorData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Please log in again.");

      setCurrentUserId(user.id);

      const [concernResult, assignmentResult] = await Promise.all([
        supabase
          .from("patient_concerns")
          .select(
            "id, patient_id, doctor_id, subject, message, response, status, created_at, updated_at"
          )
          .eq("doctor_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("doctor_patient_links")
          .select("id, patient_id, doctor_id, is_active, created_at")
          .eq("doctor_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);

      if (concernResult.error) throw concernResult.error;
      if (assignmentResult.error) throw assignmentResult.error;

      setConcerns(concernResult.data || []);
      setAssignments(assignmentResult.data || []);
    } catch (err) {
      setError(err.message || "Unable to load doctor dashboard.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let channel = null;

    const start = async () => {
      await loadDoctorData();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) return;

      channel = supabase
        .channel(`doctor-concerns-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "patient_concerns",
            filter: `doctor_id=eq.${user.id}`,
          },
          () => loadDoctorData(false)
        )
        .subscribe();
    };

    start();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

const saveResponse = async (concern) => {
  const responseText = (
    responses[concern.id] ?? concern.response ?? ""
  ).trim();

  if (!responseText) {
    setError("Write a response before submitting.");
    return;
  }

  setSavingId(concern.id);
  setError("");
  setNotice("");

  try {
    const { data, error: updateError } = await supabase
      .from("patient_concerns")
      .update({
        response: responseText,
        status: "Responded",
        reviewed_by: currentUserId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", concern.id)
      .eq("doctor_id", currentUserId)
      .select()
      .single();

    if (updateError) throw updateError;

    if (!data) {
      throw new Error(
        "No concern was updated. Check your doctor assignment and database permissions."
      );
    }

    // Update the screen immediately
    setConcerns((previous) =>
      previous.map((item) =>
        item.id === concern.id ? data : item
      )
    );

    setResponses((previous) => ({
      ...previous,
      [concern.id]: data.response,
    }));

    setNotice("Response submitted successfully.");
  } catch (err) {
    console.error("Doctor response error:", err);
    setError(err.message || "Unable to save your response.");
  } finally {
    setSavingId(null);
  }
};


  const closeConcern = async (concern) => {
    setSavingId(concern.id);
    setError("");
    setNotice("");

    try {
      const { error: updateError } = await supabase
        .from("patient_concerns")
        .update({
          status: "Closed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", concern.id)
        .eq("doctor_id", currentUserId);

      if (updateError) throw updateError;

      setNotice("Concern marked as closed.");
      await loadDoctorData(false);
    } catch (err) {
      setError(err.message || "Unable to close concern.");
    } finally {
      setSavingId(null);
    }
  };

  const pendingCount = concerns.filter((item) => item.status === "Pending").length;
  const respondedCount = concerns.filter((item) => item.status === "Responded").length;

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
            <p className="dashboard-eyebrow">DOCTOR DASHBOARD</p>
            <h1>Welcome, Doctor!</h1>
            <p>Review concerns from your assigned patients and provide responses.</p>
          </div>

          <div className="dashboard-profile-icon">
            <Stethoscope size={30} />
          </div>
        </section>

        <section className="dashboard-stats">
          <article className="stat-card">
            <div className="stat-icon">
              <Users />
            </div>
            <p>Assigned patients</p>
            <h2>{assignments.length}</h2>
            <span>Active assignments</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon">
              <MessageSquare />
            </div>
            <p>Pending concerns</p>
            <h2>{pendingCount}</h2>
            <span>Awaiting response</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon">
              <CheckCircle2 />
            </div>
            <p>Responded</p>
            <h2>{respondedCount}</h2>
            <span>Responses submitted</span>
          </article>
        </section>

        {error && (
          <p role="alert" style={{ color: "#b42318", padding: 10 }}>
            {error}
          </p>
        )}

        {notice && (
          <p role="status" style={{ color: "#167044", padding: 10 }}>
            {notice}
          </p>
        )}

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <Users size={21} />
                Assigned patients
              </h2>
              <p>Patients connected to your doctor account.</p>
            </div>

            <button
              className="small-action"
              type="button"
              onClick={() => loadDoctorData()}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <p style={{ color: "#64746f" }}>
              No patients have been assigned to your account. Contact the
              CareBridge administrator.
            </p>
          ) : (
            <div className="medicine-list">
              {assignments.map((assignment, index) => (
                <article
                  className="medicine-item"
                  key={assignment.id}
                  style={{
                    padding: 14,
                    marginBottom: 10,
                    border: "1px solid #e7ece9",
                    borderRadius: 10,
                  }}
                >
                  <div className="medicine-icon">
                    <UserRound size={20} />
                  </div>
                  <div className="medicine-info" style={{ flex: 1 }}>
                    <h3>Patient {index + 1}</h3>
                    <p style={{ fontSize: 12, overflowWrap: "anywhere" }}>
                      Patient ID: {assignment.patient_id}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <MessageSquare size={21} />
                Patient concerns
              </h2>
              <p>Review patient messages and submit your responses.</p>
            </div>

            <button
              className="small-action"
              type="button"
              onClick={() => loadDoctorData()}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading patient concerns...</p>
          ) : concerns.length === 0 ? (
            <div style={{ textAlign: "center", padding: "35px 15px", color: "#64746f" }}>
              <FileText size={35} />
              <h3>No concerns received</h3>
              <p>New concerns from your assigned patients will appear here.</p>
            </div>
          ) : (
            <div className="medicine-list">
              {concerns.map((concern) => (
                <article
                  className="medicine-item"
                  key={concern.id}
                  style={{
                    display: "block",
                    padding: 16,
                    marginBottom: 14,
                    border: "1px solid #e7ece9",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <h3>{concern.subject}</h3>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color:
                          concern.status === "Responded"
                            ? "#167044"
                            : concern.status === "Closed"
                              ? "#64746f"
                              : "#b7791f",
                      }}
                    >
                      {concern.status.toUpperCase()}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 12,
                      color: "#64746f",
                      overflowWrap: "anywhere",
                    }}
                  >
                    Patient ID: {concern.patient_id}
                  </p>

                  <div
                    style={{
                      background: "#f7f9f8",
                      padding: 14,
                      borderRadius: 9,
                      marginTop: 12,
                    }}
                  >
                    <p style={{ margin: 0 }}>{concern.message}</p>
                  </div>

                  <p style={{ fontSize: 12, color: "#77847f", marginTop: 10 }}>
                    Received: {new Date(concern.created_at).toLocaleString("en-IN")}
                  </p>

                  {concern.status !== "Closed" && (
                    <>
                      <label
                        htmlFor={`response-${concern.id}`}
                        style={{
                          display: "block",
                          fontWeight: 600,
                          marginTop: 14,
                          marginBottom: 8,
                        }}
                      >
                        Your response
                      </label>

                      <textarea
                        id={`response-${concern.id}`}
                        rows={3}
                        maxLength={3000}
                        value={responses[concern.id] ?? concern.response ?? ""}
                        onChange={(event) =>
                          setResponses((previous) => ({
                            ...previous,
                            [concern.id]: event.target.value,
                          }))
                        }
                        placeholder="Write your response..."
                        style={{
                          width: "100%",
                          resize: "vertical",
                          marginBottom: 10,
                        }}
                      />

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          className="continue-button"
                          type="button"
                          disabled={savingId === concern.id}
                          onClick={() => saveResponse(concern)}
                        >
                          <Reply size={16} />
                          {savingId === concern.id
                            ? "Saving..."
                            : "Submit response"}
                        </button>

                        {concern.status === "Responded" && (
                          <button
                            className="small-action"
                            type="button"
                            disabled={savingId === concern.id}
                            onClick={() => closeConcern(concern)}
                          >
                            <CheckCircle2 size={16} />
                            Close concern
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {concern.status === "Closed" && (
                    <p style={{ color: "#64746f", fontWeight: 600 }}>
                      This concern has been closed.
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="dashboard-disclaimer">
          CareBridge supports communication and care coordination. It does not
          replace clinical judgement or emergency medical services.
        </p>
      </main>
    </div>
  );
}

// --------------------------------------------------
// DOCTOR APPROVAL CHECK
// --------------------------------------------------

function DoctorAccess({ onLogout }) {
  const [checking, setChecking] = useState(true);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");

  const checkApproval = async () => {
    setChecking(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Please log in again.");

      const { data, error: approvalError } = await supabase
        .from("authorized_doctors")
        .select("doctor_id")
        .eq("doctor_id", user.id)
        .maybeSingle();

      if (approvalError) throw approvalError;

      setApproved(Boolean(data));
    } catch (err) {
      setError(err.message || "Unable to verify doctor approval.");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkApproval();
  }, []);

  if (checking) {
    return (
      <div className="app">
        <main className="main-content">
          <p>Verifying doctor approval...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <main className="main-content">
          <ShieldAlert size={40} />
          <h2>Unable to verify account</h2>
          <p>{error}</p>
          <button className="continue-button" onClick={checkApproval}>
            Retry
          </button>
          <button className="logout-button" style={{ marginTop: 12 }} onClick={onLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </main>
      </div>
    );
  }

  if (!approved) {
    return (
      <div className="app">
        <main className="main-content" style={{ textAlign: "center", maxWidth: 550 }}>
          <div className="login-icon">
            <Clock size={30} />
          </div>
          <h2>Doctor account awaiting approval</h2>
          <p>
            Your doctor account has been created, but an administrator has not
            approved it yet. You can access the Doctor Dashboard after approval.
          </p>
          <button className="continue-button" onClick={checkApproval} style={{ marginTop: 20 }}>
            <RefreshCw size={17} />
            Check approval status
          </button>
          <button className="logout-button" style={{ marginTop: 12 }} onClick={onLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </main>
      </div>
    );
  }

  return <DoctorDashboard onLogout={onLogout} />;
}

// --------------------------------------------------
// MAIN APP
// --------------------------------------------------

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null);
  const [language, setLanguage] = useState("English");
  const [authMode, setAuthMode] = useState("login");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error("Session error:", error.message);

      if (mounted) {
        setSession(data?.session ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleRoleSelect = (role) => {
    if (!ENABLED_ROLES.includes(role)) {
      setMessage(
        `${role} accounts are not enabled yet. This role will require administrator approval.`
      );
      return;
    }

    setSelectedRole(role);
    setAuthMode("login");
    setMessage("");
    setFullName("");
    setEmail("");
    setPassword("");
  };

  const handleBack = () => {
    setSelectedRole(null);
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!ENABLED_ROLES.includes(selectedRole)) {
      setMessage("This account role is not enabled.");
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: selectedRole,
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          setSession(data.session);
          setMessage("Account created successfully!");
        } else {
          setMessage(
            "Registration successful! Check your email to confirm your account, then log in."
          );
          setAuthMode("login");
          setPassword("");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        const actualRole = data.user?.user_metadata?.role;

        if (actualRole !== selectedRole) {
          await supabase.auth.signOut();

          throw new Error(
            `This account is registered as ${actualRole || "another role"}. Select the correct role to log in.`
          );
        }

        setSession(data.session);
        setMessage("");
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
    } else {
      setSession(null);
      setSelectedRole(null);
      setEmail("");
      setPassword("");
      setMessage("");
    }

    setAuthLoading(false);
  };

  if (loading) {
    return (
      <div className="app">
        <main className="main-content">
          <p>Loading CareBridge...</p>
        </main>
      </div>
    );
  }

  if (session) {
    const role = session.user.user_metadata?.role;

    if (role === "Patient") {
      return <PatientHome onLogout={handleLogout} />;
    }

    if (role === "Caregiver") {
      return <NotificationDashboard role="Caregiver" onLogout={handleLogout} />;
    }

    if (role === "Nurse") {
      return <NurseAccess onLogout={handleLogout} />;
    }

    if (role === "Doctor") {
      return <DoctorAccess onLogout={handleLogout} />;
    }
    if (role === "Hospital") {
  return <HospitalAccess onLogout={handleLogout} />;
}

    return (
      <div className="app">
        <main className="main-content">
          <h2>Account role not enabled</h2>
          <p>
            This account does not have an enabled dashboard. Contact the
            administrator.
          </p>
          <button
            className="continue-button"
            onClick={handleLogout}
            disabled={authLoading}
          >
            Logout
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <HeartPulse size={25} />
          </div>
          <span>CareBridge</span>
        </div>

        <div className="language-select">
          <Globe size={17} />
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            aria-label="Select language"
          >
            <option value="English">English</option>
            <option value="ಕನ್ನಡ">ಕನ್ನಡ</option>
            <option value="हिन्दी">हिन्दी</option>
            <option value="తెలుగు">తెలుగు</option>
          </select>
        </div>
      </header>

      <main className="main-content">
        {!selectedRole ? (
          <>
            <section className="welcome-section">
              <div className="welcome-tag">
                <HeartPulse size={15} />
                Healthcare, connected
              </div>

              <h1>
                Better care.
                <br />
                <span>Closer to you.</span>
              </h1>

              <p className="welcome-description">
                Your health journey, connected with the people who care.
                Manage medicines, stay informed and connect with healthcare
                professionals through one simple platform.
              </p>

              <div className="trust-note">
                <ShieldCheck size={18} />
                Patient-focused · Secure by design · Accessible healthcare
              </div>
            </section>

            <section className="role-section">
              <div className="section-heading">
                <div>
                  <h2>Welcome to CareBridge</h2>
                  <p>Select your role to continue</p>
                </div>
              </div>

              {message && (
                <p className="demo-note" role="status">
                  {message}
                </p>
              )}

              <div className="role-grid">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const enabled = ENABLED_ROLES.includes(role.name);

                  return (
                    <button
                      className="role-card"
                      key={role.name}
                      onClick={() => handleRoleSelect(role.name)}
                    >
                      <div className="role-icon">
                        <Icon size={23} />
                      </div>

                      <div className="role-details">
                        <h3>{role.name}</h3>
                        <p>{role.description}</p>

                        {!enabled && <small>Coming soon</small>}

                        {["Nurse", "Doctor", "Hospital"].includes(role.name) && (
  <small>Administrator approval required</small>
)}
                      </div>

                      <ArrowRight className="role-arrow" size={19} />
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <section className="login-section">
            <button className="back-button" onClick={handleBack}>
              <ArrowLeft size={17} />
              Back to roles
            </button>

            <div className="login-icon">
              <HeartPulse size={30} />
            </div>

            <h2>
              {selectedRole}{" "}
              {authMode === "login" ? "Login" : "Registration"}
            </h2>

            <p className="login-description">
              {authMode === "login"
                ? `Welcome back. Sign in to your CareBridge ${selectedRole.toLowerCase()} account.`
                : `Create your CareBridge ${selectedRole.toLowerCase()} account.`}
            </p>

           {["Nurse", "Doctor", "Hospital"].includes(selectedRole) && (
              <p className="demo-note">
                {selectedRole} accounts require administrator approval before
                dashboard access.
              </p>
            )}

            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === "login" ? "active" : ""}
                onClick={() => {
                  setAuthMode("login");
                  setMessage("");
                }}
              >
                Login
              </button>

              <button
                type="button"
                className={authMode === "register" ? "active" : ""}
                onClick={() => {
                  setAuthMode("register");
                  setMessage("");
                }}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {authMode === "register" && (
                <>
                  <label htmlFor="fullName">Full name</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </>
              )}

              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  authMode === "login" ? "current-password" : "new-password"
                }
                minLength={6}
                required
              />

              <button
                className="continue-button"
                type="submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Continue"
                    : "Create account"}
                {!authLoading && <ArrowRight size={18} />}
              </button>
            </form>

            {message && (
              <p className="demo-note" role="status">
                {message}
              </p>
            )}
          </section>
        )}
      </main>

      <footer>
        <p>
          © 2026 CareBridge · Connecting people through better healthcare
        </p>
      </footer>
    </div>
  );
}

export default App;
