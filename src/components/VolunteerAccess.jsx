
import { useEffect, useState } from "react";
import {
  HeartPulse,
  HandHeart,
  UserRound,
  RefreshCw,
  LogOut,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Circle,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useLanguage, LanguageSelector } from "../context/LanguageContext";

export default function VolunteerAccess({ onLogout }) {
  const { t } = useLanguage();
  const [checking, setChecking] = useState(true);
  const [volunteer, setVolunteer] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [updatingTask, setUpdatingTask] = useState(null);

  const loadDashboard = async () => {
    setChecking(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error(t("Please log in again."));

      const { data: volunteerData, error: volunteerError } =
        await supabase
          .from("authorized_volunteers")
          .select("volunteer_id, volunteer_name, approved_at")
          .eq("volunteer_id", user.id)
          .maybeSingle();

      if (volunteerError) throw volunteerError;

      if (!volunteerData) {
        setVolunteer(null);
        setTasks([]);
        return;
      }

      setVolunteer(volunteerData);

      const { data: taskData, error: taskError } = await supabase
        .from("volunteer_tasks")
        .select("id, patient_id, task_description, status, created_at")
        .eq("volunteer_id", user.id)
        .order("created_at", { ascending: false });

      if (taskError) throw taskError;

      setTasks(taskData || []);
    } catch (err) {
      setError(err.message || t("Unable to load volunteer dashboard."));
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    setUpdatingTask(taskId);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("volunteer_tasks")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (updateError) throw updateError;

      await loadDashboard();
    } catch (err) {
      setError(err.message || t("Unable to update task."));
    } finally {
      setUpdatingTask(null);
    }
  };

  const pendingCount = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const progressCount = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  return (
    <div className="patient-dashboard">
      <header className="dashboard-navbar">
        <div className="brand">
          <div className="brand-icon">
            <HeartPulse size={24} />
          </div>
          <span>CareBridge</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageSelector />
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={17} />
            {t("Logout")}
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">{t("VOLUNTEER DASHBOARD")}</p>
            <h1>
              {t("Welcome, Volunteer!")}
            </h1>
            <p>
              {t("Support patients and help make healthcare more accessible through CareBridge.")}
            </p>
          </div>

          <div className="dashboard-profile-icon">
            <HandHeart size={30} />
          </div>
        </section>

        {error && (
          <section className="dashboard-panel">
            <p role="alert" style={{ color: "#b42318" }}>
              <ShieldAlert size={17} /> {error}
            </p>

            <button
              className="continue-button"
              type="button"
              onClick={loadDashboard}
            >
              <RefreshCw size={16} />
              {t("Retry")}
            </button>
          </section>
        )}

        {checking ? (
          <section className="dashboard-panel">
            <p>{t("Loading...")}</p>
          </section>
        ) : !error && !volunteer ? (
          <section
            className="dashboard-panel"
            style={{ textAlign: "center", padding: 30 }}
          >
            <div className="login-icon">
              <Clock size={30} />
            </div>

            <h2>{t("Volunteer account awaiting approval")}</h2>

            <p>
              {t("Your volunteer account has been created, but an administrator has not approved it yet. Your dashboard will become available after approval.")}
            </p>

            <button
              className="continue-button"
              type="button"
              onClick={loadDashboard}
              style={{ marginTop: 15 }}
            >
              <RefreshCw size={17} />
              {t("Check approval status")}
            </button>
          </section>
        ) : !error && volunteer ? (
          <>
            <section className="dashboard-stats">
              <article className="stat-card">
                <div className="stat-icon">
                  <Circle />
                </div>
                <p>{t("Pending")}</p>
                <h2>{pendingCount}</h2>
                <span>{t("Waiting to start") || "Waiting to start"}</span>
              </article>

              <article className="stat-card">
                <div className="stat-icon">
                  <LoaderCircle />
                </div>
                <p>{t("In Progress")}</p>
                <h2>{progressCount}</h2>
                <span>{t("Currently working") || "Currently working"}</span>
              </article>

              <article className="stat-card">
                <div className="stat-icon">
                  <CheckCircle2 />
                </div>
                <p>{t("Completed")}</p>
                <h2>{completedCount}</h2>
                <span>{t("Tasks finished") || "Tasks finished"}</span>
              </article>
            </section>

            <section className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    <HandHeart size={21} />
                    {t("Assigned Tasks")}
                  </h2>
                  <p>
                    {t("Support patients with community tasks and care coordination.")}
                  </p>
                </div>

                <button
                  className="small-action"
                  type="button"
                  onClick={loadDashboard}
                  disabled={checking}
                >
                  <RefreshCw size={16} />
                  {t("Refresh")}
                </button>
              </div>

              {tasks.length === 0 ? (
                <p style={{ color: "#64746f" }}>
                  {t("No tasks have been assigned to you yet.") || "No tasks have been assigned to you yet."}
                </p>
              ) : (
                <div className="medicine-list">
                  {tasks.map((task) => (
                    <article
                      className="medicine-item"
                      key={task.id}
                      style={{
                        padding: 14,
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
                        <h3>{task.task_description}</h3>

                        <p
                          style={{
                            fontSize: 12,
                            overflowWrap: "anywhere",
                          }}
                        >
                          Patient ID: {task.patient_id}
                        </p>

                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 12,
                            background:
                              task.status === "Completed"
                                ? "#e8f3ed"
                                : task.status === "In Progress"
                                ? "#fef3eb"
                                : task.status === "Cancelled"
                                ? "#fee4e2"
                                : "#edf2f0",
                            color:
                              task.status === "Completed"
                                ? "#167044"
                                : task.status === "In Progress"
                                ? "#b7791f"
                                : task.status === "Cancelled"
                                ? "#b42318"
                                : "#64746f",
                          }}
                        >
                          {t(task.status) || task.status.toUpperCase()}
                        </span>

                        {task.status === "Cancelled" && (
                          <p style={{ fontSize: 13, color: "#b42318", margin: "8px 0 0" }}>
                            <XCircle size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                            This task was cancelled by the administrator.
                          </p>
                        )}

                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                            marginTop: 12,
                          }}
                        >
                          {task.status === "Pending" && (
                            <button
                              className="continue-button"
                              type="button"
                              disabled={updatingTask === task.id}
                              onClick={() =>
                                updateTaskStatus(task.id, "In Progress")
                              }
                            >
                              {updatingTask === task.id
                                ? t("Updating...") || "Updating..."
                                : t("Start Task")}
                            </button>
                          )}

                          {task.status === "In Progress" && (
                            <button
                              className="continue-button"
                              type="button"
                              disabled={updatingTask === task.id}
                              onClick={() =>
                                updateTaskStatus(task.id, "Completed")
                              }
                            >
                              {updatingTask === task.id
                                ? t("Updating...") || "Updating..."
                                : t("Mark Completed")}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <p className="dashboard-disclaimer">
              {t("Volunteers should follow hospital instructions and must not perform medical procedures or provide medical diagnoses.") || "Volunteers should follow hospital instructions."}
            </p>
          </>
        ) : null}
      </main>
    </div>
  );
}
