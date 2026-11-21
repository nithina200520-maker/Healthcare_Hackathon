
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import {
  HeartPulse,
  Pill,
  CheckCircle2,
  Clock,
  AlertCircle,
  CalendarDays,
  MessageCircle,
  Phone,
  Plus,
  LogOut,
  XCircle,
  X,
  TrendingUp,
} from "lucide-react";

function formatTime(time) {
  const [hours, minutes] = time.split(":");
  const hour = Number(hours);
  const period = hour >= 12 ? "PM" : "AM";

  return `${hour % 12 || 12}:${minutes} ${period}`;
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getScheduledDateTime(date, time) {
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes
  ).toISOString();
}

function getDateRange() {
  const today = new Date();

  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 6
  );

  const end = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function getTodayRange() {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function getEmptyDay(date) {
  return {
    date: getDateKey(date),
    label: date.toLocaleDateString("en-IN", {
      weekday: "short",
    }),
    taken: 0,
    missed: 0,
    skipped: 0,
    pending: 0,
    total: 0,
    percentage: 0,
  };
}

function PatientDashboard({ onLogout }) {
  const [medicines, setMedicines] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newMedicineTime, setNewMedicineTime] = useState("08:00");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const takenCount = medicines.filter(
    (medicine) => medicine.status === "Taken"
  ).length;

  const skippedCount = medicines.filter(
    (medicine) => medicine.status === "Skipped"
  ).length;

  const missedCount = medicines.filter(
    (medicine) => medicine.status === "Missed"
  ).length;

  const pendingCount = medicines.filter(
    (medicine) =>
      medicine.status === "Pending" ||
      medicine.status === "Upcoming"
  ).length;

  const weeklyTotal = weeklyStats.reduce(
    (total, day) => total + day.total,
    0
  );

  const weeklyTaken = weeklyStats.reduce(
    (total, day) => total + day.taken,
    0
  );

  const weeklyMissed = weeklyStats.reduce(
    (total, day) => total + day.missed,
    0
  );

  const weeklySkipped = weeklyStats.reduce(
    (total, day) => total + day.skipped,
    0
  );

  const weeklyPending = weeklyStats.reduce(
    (total, day) => total + day.pending,
    0
  );

  const weeklyPercentage =
    weeklyTotal > 0
      ? Math.round((weeklyTaken / weeklyTotal) * 100)
      : 0;

  // Load medicines and seven days of dose logs
  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("Please log in again.");

        const { data: medicineData, error: medicineError } =
          await supabase
            .from("medicines")
            .select("id, name, scheduled_time, created_at")
            .eq("patient_id", user.id)
            .eq("is_active", true)
            .order("scheduled_time");

        if (medicineError) throw medicineError;

        const { start, end } = getDateRange();

        const fetchLogs = async () => {
          const { data, error } = await supabase
            .from("dose_logs")
            .select("medicine_id, scheduled_for, status")
            .eq("patient_id", user.id)
            .gte("scheduled_for", start)
            .lt("scheduled_for", end);

          if (error) throw error;

          return data || [];
        };

        let logData = await fetchLogs();

        const now = Date.now();
        const today = new Date();

        const missedLogs = [];

        // Automatically create today's missed-dose records
        for (const medicine of medicineData || []) {
          const scheduledFor = getScheduledDateTime(
            today,
            medicine.scheduled_time.slice(0, 5)
          );

          const scheduledTimestamp = new Date(
            scheduledFor
          ).getTime();

          const alreadyLogged = logData.some(
            (log) =>
              log.medicine_id === medicine.id &&
              new Date(log.scheduled_for).getTime() ===
                scheduledTimestamp
          );

          const gracePeriodPassed =
            now >= scheduledTimestamp + 30 * 60 * 1000;

          if (!alreadyLogged && gracePeriodPassed) {
            missedLogs.push({
              patient_id: user.id,
              medicine_id: medicine.id,
              scheduled_for: scheduledFor,
              status: "Missed",
            });
          }
        }

        if (missedLogs.length > 0) {
          const { error: insertError } = await supabase
            .from("dose_logs")
            .upsert(missedLogs, {
              onConflict:
                "patient_id,medicine_id,scheduled_for",
              ignoreDuplicates: true,
            });

          if (insertError) throw insertError;

          logData = await fetchLogs();
        }

        // Prepare today's medicine list
        const updatedMedicines = (medicineData || []).map(
          (medicine) => {
            const scheduledFor = getScheduledDateTime(
              today,
              medicine.scheduled_time.slice(0, 5)
            );

            const scheduledTimestamp = new Date(
              scheduledFor
            ).getTime();

            const log = logData.find(
              (item) =>
                item.medicine_id === medicine.id &&
                new Date(item.scheduled_for).getTime() ===
                  scheduledTimestamp
            );

            let status = "Upcoming";

            if (log) {
              status = log.status;
            } else if (scheduledTimestamp <= now) {
              status =
                now >= scheduledTimestamp + 30 * 60 * 1000
                  ? "Missed"
                  : "Pending";
            }

            return {
              id: medicine.id,
              name: medicine.name,
              time: medicine.scheduled_time.slice(0, 5),
              created_at: medicine.created_at,
              status,
            };
          }
        );

        setMedicines(updatedMedicines);

        // Calculate seven-day adherence
        const days = [];

        for (let offset = 6; offset >= 0; offset--) {
          const date = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - offset
          );

          const day = getEmptyDay(date);
          const dateKey = getDateKey(date);

          for (const medicine of medicineData || []) {
            // Do not count a medicine on days before it was created
            if (
              medicine.created_at &&
              new Date(medicine.created_at) >
                new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                  23,
                  59,
                  59,
                  999
                )
            ) {
              continue;
            }

            const scheduledFor = getScheduledDateTime(
              date,
              medicine.scheduled_time.slice(0, 5)
            );

            const scheduledTimestamp = new Date(
              scheduledFor
            ).getTime();

            // Exclude doses that have not become due yet
            if (scheduledTimestamp > now) {
              continue;
            }

            const log = logData.find(
              (item) =>
                item.medicine_id === medicine.id &&
                new Date(item.scheduled_for).getTime() ===
                  scheduledTimestamp
            );

            day.total++;

            if (log?.status === "Taken") {
              day.taken++;
            } else if (log?.status === "Skipped") {
              day.skipped++;
            } else if (log?.status === "Missed") {
              day.missed++;
            } else if (
              now >= scheduledTimestamp + 30 * 60 * 1000
            ) {
              // Calculate an unlogged past dose as missed
              // without inserting a historical database record
              day.missed++;
            } else {
              day.pending++;
            }
          }

          day.percentage =
            day.total > 0
              ? Math.round((day.taken / day.total) * 100)
              : 0;

          days.push(day);
        }

        setWeeklyStats(days);
      } catch (err) {
        setError(err.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // Add a new medicine
  const addMedicine = async (event) => {
    event.preventDefault();

    const name = newMedicineName.trim();

    if (!name) return;

    setSaving(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Please log in again.");

      const { data, error: insertError } = await supabase
        .from("medicines")
        .insert({
          patient_id: user.id,
          name,
          scheduled_time: newMedicineTime,
        })
        .select("id, name, scheduled_time, created_at")
        .single();

      if (insertError) throw insertError;

      setMedicines((previous) =>
        [
          ...previous,
          {
            id: data.id,
            name: data.name,
            time: data.scheduled_time.slice(0, 5),
            created_at: data.created_at,
            status: "Upcoming",
          },
        ].sort((a, b) => a.time.localeCompare(b.time))
      );

      setNewMedicineName("");
      setNewMedicineTime("08:00");
      setShowAddForm(false);

      // Refresh weekly statistics after adding a medicine
      window.location.reload();
    } catch (err) {
      setError(err.message || "Could not save medicine.");
    } finally {
      setSaving(false);
    }
  };

  // Update a dose status
  const updateDoseStatus = async (medicine, status) => {
    if (
      medicine.status === "Taken" ||
      medicine.status === "Skipped"
    ) {
      return;
    }

    setActionId(medicine.id);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Please log in again.");

      const log = {
        patient_id: user.id,
        medicine_id: medicine.id,
        scheduled_for: getScheduledDateTime(
          new Date(),
          medicine.time
        ),
        status,
        taken_at:
          status === "Taken"
            ? new Date().toISOString()
            : null,
      };

      const { error: logError } = await supabase
        .from("dose_logs")
        .upsert(log, {
          onConflict:
            "patient_id,medicine_id,scheduled_for",
        });

      if (logError) throw logError;

      setMedicines((previous) =>
        previous.map((item) =>
          item.id === medicine.id
            ? { ...item, status }
            : item
        )
      );

      // Reload to update weekly adherence statistics
      window.location.reload();
    } catch (err) {
      setError(err.message || "Could not update dose status.");
    } finally {
      setActionId(null);
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
              PATIENT DASHBOARD
            </p>
            <h1>Good day!</h1>
            <p>Here's your health overview for today.</p>
          </div>

          <div className="dashboard-profile-icon">
            <HeartPulse size={30} />
          </div>
        </section>

        {/* Today's summary */}
        <section className="dashboard-stats">
          <article className="stat-card">
            <div className="stat-icon"><Pill /></div>
            <p>Scheduled medicines</p>
            <h2>{medicines.length}</h2>
            <span>Today's schedule</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon"><CheckCircle2 /></div>
            <p>Doses taken</p>
            <h2>{takenCount}/{medicines.length}</h2>
            <span>Today's progress</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon"><AlertCircle /></div>
            <p>Skipped doses</p>
            <h2>{skippedCount}</h2>
            <span>Today's skipped doses</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon"><Clock /></div>
            <p>Pending doses</p>
            <h2>{pendingCount}</h2>
            <span>Awaiting action</span>
          </article>
        </section>

        {missedCount > 0 && (
          <div className="status-missed">
            <AlertCircle size={18} />
            {missedCount} dose(s) have passed their 30-minute
            grace period.
          </div>
        )}

        {error && (
          <p
            role="alert"
            style={{ color: "#b42318", padding: "10px" }}
          >
            {error}
          </p>
        )}

        {/* Seven-day adherence dashboard */}
        <section
          className="dashboard-panel"
          style={{ marginBottom: "24px" }}
        >
          <div className="panel-heading">
            <div>
              <h2>
                <TrendingUp size={21} />
                Weekly medicine adherence
              </h2>
              <p>Your medicine-taking progress over the last 7 days.</p>
            </div>
          </div>

          {loading ? (
            <p>Calculating your weekly progress...</p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: "12px",
                  margin: "18px 0",
                }}
              >
                <div style={summaryCardStyle}>
                  <span style={summaryLabelStyle}>Adherence rate</span>
                  <strong style={{ fontSize: "28px", color: "#087f68" }}>
                    {weeklyPercentage}%
                  </strong>
                </div>

                <div style={summaryCardStyle}>
                  <span style={summaryLabelStyle}>Doses taken</span>
                  <strong style={{ fontSize: "28px", color: "#087f68" }}>
                    {weeklyTaken}
                  </strong>
                </div>

                <div style={summaryCardStyle}>
                  <span style={summaryLabelStyle}>Missed doses</span>
                  <strong style={{ fontSize: "28px", color: "#b42318" }}>
                    {weeklyMissed}
                  </strong>
                </div>

                <div style={summaryCardStyle}>
                  <span style={summaryLabelStyle}>Skipped doses</span>
                  <strong style={{ fontSize: "28px", color: "#b7791f" }}>
                    {weeklySkipped}
                  </strong>
                </div>
              </div>

              <div style={{ marginTop: "24px" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>
                  Daily adherence
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    gap: "8px",
                    alignItems: "end",
                    minHeight: "155px",
                  }}
                >
                  {weeklyStats.map((day) => (
                    <div
                      key={day.date}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "7px",
                        minWidth: 0,
                      }}
                    >
                      <strong style={{ fontSize: "12px" }}>
                        {day.total > 0 ? `${day.percentage}%` : "—"}
                      </strong>

                      <div
                        style={{
                          width: "100%",
                          maxWidth: "42px",
                          height: "100px",
                          background: "#edf2f0",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "flex-end",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          title={`${day.taken} taken out of ${day.total} due doses`}
                          style={{
                            width: "100%",
                            height: `${day.percentage}%`,
                            minHeight:
                              day.percentage > 0 ? "4px" : "0",
                            background: "#087f68",
                            borderRadius: "8px",
                            transition: "height 0.3s ease",
                          }}
                        />
                      </div>

                      <span
                        style={{
                          fontSize: "12px",
                          color: "#64746f",
                        }}
                      >
                        {day.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px",
                  marginTop: "20px",
                  fontSize: "13px",
                  color: "#53635e",
                }}
              >
                <span>🟢 Taken: {weeklyTaken}</span>
                <span>🔴 Missed: {weeklyMissed}</span>
                <span>🟠 Skipped: {weeklySkipped}</span>
                <span>🟡 Pending: {weeklyPending}</span>
              </div>

              <p
                style={{
                  fontSize: "12px",
                  color: "#77847f",
                  marginTop: "16px",
                  lineHeight: 1.5,
                }}
              >
                Adherence rate = doses taken divided by doses due.
                Future doses are excluded. Historical unlogged doses
                after their grace period are counted as missed in
                this report.
              </p>

              {weeklyTotal === 0 && (
                <p style={{ color: "#64746f", marginTop: "12px" }}>
                  No doses were due during this period yet.
                </p>
              )}
            </>
          )}
        </section>

        {/* Medicine schedule */}
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <CalendarDays size={21} />
                Medicine schedule
              </h2>
              <p>Keep track of your scheduled doses.</p>
            </div>

            <button
              className="small-action"
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? <X size={17} /> : <Plus size={17} />}
              {showAddForm ? "Cancel" : "Add"}
            </button>
          </div>

          {showAddForm && (
            <form
              className="add-medicine-form"
              onSubmit={addMedicine}
            >
              <h3>Add a medicine</h3>

              <label htmlFor="medicine-name">
                Medicine name
              </label>

              <input
                id="medicine-name"
                type="text"
                placeholder="Enter medicine name"
                value={newMedicineName}
                onChange={(event) =>
                  setNewMedicineName(event.target.value)
                }
                required
                maxLength={80}
              />

              <label htmlFor="medicine-time">
                Scheduled time
              </label>

              <input
                id="medicine-time"
                type="time"
                value={newMedicineTime}
                onChange={(event) =>
                  setNewMedicineTime(event.target.value)
                }
                required
              />

              <button
                className="save-medicine-button"
                type="submit"
                disabled={saving}
              >
                <Plus size={17} />
                {saving ? "Saving..." : "Save medicine"}
              </button>
            </form>
          )}

          <div className="medicine-list">
            {loading ? (
              <p>Loading your medicines...</p>
            ) : medicines.length === 0 ? (
              <p>
                No medicines added yet. Click Add to create
                your schedule.
              </p>
            ) : (
              medicines.map((medicine) => (
                <article
                  className="medicine-item"
                  key={medicine.id}
                >
                  <div className="medicine-icon">
                    <Pill size={21} />
                  </div>

                  <div className="medicine-info">
                    <h3>{medicine.name}</h3>
                    <p>
                      <Clock size={14} />
                      {formatTime(medicine.time)}
                    </p>
                  </div>

                  <div className="medicine-action">
                    {medicine.status === "Taken" ? (
                      <span className="status-taken">
                        <CheckCircle2 size={15} />
                        Taken
                      </span>
                    ) : medicine.status === "Skipped" ? (
                      <span className="status-skipped">
                        <XCircle size={15} />
                        Skipped
                      </span>
                    ) : (
                      <>
                        <span
                          className={
                            medicine.status === "Missed"
                              ? "status-missed"
                              : "status-pending"
                          }
                        >
                          {medicine.status === "Missed" && (
                            <AlertCircle size={15} />
                          )}
                          {medicine.status}
                        </span>

                        <div className="medicine-buttons">
                          <button
                            className="taken-button"
                            type="button"
                            disabled={actionId === medicine.id}
                            onClick={() =>
                              updateDoseStatus(medicine, "Taken")
                            }
                          >
                            {actionId === medicine.id
                              ? "Saving..."
                              : "Mark taken"}
                          </button>

                          <button
                            className="skip-button"
                            type="button"
                            disabled={actionId === medicine.id}
                            onClick={() =>
                              updateDoseStatus(medicine, "Skipped")
                            }
                          >
                            Skip
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="dashboard-quick-actions">
          <h2>Quick actions</h2>

          <div className="quick-action-grid">
            <button type="button">
              <MessageCircle size={22} />
              <span>Contact doctor</span>
            </button>

            <button type="button">
              <AlertCircle size={22} />
              <span>Report a concern</span>
            </button>

            <button type="button">
              <Phone size={22} />
              <span>Emergency call</span>
            </button>
          </div>
        </section>

        <p className="dashboard-disclaimer">
          CareBridge provides health-management support, not
          medical diagnosis. Follow your healthcare
          professional's instructions.
        </p>
      </main>
    </div>
  );
}

const summaryCardStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "16px",
  background: "#f7fbfa",
  border: "1px solid #e1ece8",
  borderRadius: "12px",
};

const summaryLabelStyle = {
  fontSize: "13px",
  color: "#64746f",
};

export default PatientDashboard;
