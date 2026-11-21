
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
} from "lucide-react";

function formatTime(time) {
  const [hours, minutes] = time.split(":");
  const hour = Number(hours);
  const period = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minutes} ${period}`;
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

function getScheduledDateTime(time) {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  ).toISOString();
}

function PatientDashboard({ onLogout }) {
  const [medicines, setMedicines] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newMedicineTime, setNewMedicineTime] = useState("08:00");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  // Fetch medicines and today's dose history
  useEffect(() => {
    async function loadMedicines() {
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
            .select("id, name, scheduled_time")
            .eq("patient_id", user.id)
            .eq("is_active", true)
            .order("scheduled_time");

        if (medicineError) throw medicineError;

        const { start, end } = getTodayRange();

        const { data: logData, error: logError } =
          await supabase
            .from("dose_logs")
            .select("medicine_id, status")
            .eq("patient_id", user.id)
            .gte("scheduled_for", start)
            .lt("scheduled_for", end);

        if (logError) throw logError;

        const updatedMedicines = (medicineData || []).map(
          (medicine) => {
            const log = (logData || []).find(
              (item) => item.medicine_id === medicine.id
            );

            return {
              id: medicine.id,
              name: medicine.name,
              time: medicine.scheduled_time.slice(0, 5),
              status: log ? log.status : "Upcoming",
            };
          }
        );

        setMedicines(updatedMedicines);
      } catch (err) {
        setError(err.message || "Unable to load medicines.");
      } finally {
        setLoading(false);
      }
    }

    loadMedicines();
  }, []);

  const takenCount = medicines.filter(
    (medicine) => medicine.status === "Taken"
  ).length;

  const skippedCount = medicines.filter(
    (medicine) => medicine.status === "Skipped"
  ).length;

  const pendingCount = medicines.filter(
    (medicine) =>
      medicine.status !== "Taken" &&
      medicine.status !== "Skipped"
  ).length;

  // Add medicine to Supabase
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
        .select("id, name, scheduled_time")
        .single();

      if (insertError) throw insertError;

      setMedicines((previous) =>
        [
          ...previous,
          {
            id: data.id,
            name: data.name,
            time: data.scheduled_time.slice(0, 5),
            status: "Upcoming",
          },
        ].sort((a, b) => a.time.localeCompare(b.time))
      );

      setNewMedicineName("");
      setNewMedicineTime("08:00");
      setShowAddForm(false);
    } catch (err) {
      setError(err.message || "Could not save medicine.");
    } finally {
      setSaving(false);
    }
  };

  // Record Taken or Skipped in dose_logs
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
        scheduled_for: getScheduledDateTime(medicine.time),
        status,
      };

      if (status === "Taken") {
        log.taken_at = new Date().toISOString();
      }

      const { error: logError } = await supabase
        .from("dose_logs")
        .insert(log);

      if (logError) throw logError;

      setMedicines((previous) =>
        previous.map((item) =>
          item.id === medicine.id
            ? { ...item, status }
            : item
        )
      );
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
            <p className="dashboard-eyebrow">PATIENT DASHBOARD</p>
            <h1>Good day!</h1>
            <p>Here's your health overview for today.</p>
          </div>

          <div className="dashboard-profile-icon">
            <HeartPulse size={30} />
          </div>
        </section>

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

          {error && (
            <p style={{ color: "#b42318", padding: "10px" }}>
              {error}
            </p>
          )}

          {showAddForm && (
            <form className="add-medicine-form" onSubmit={addMedicine}>
              <h3>Add a medicine</h3>

              <label htmlFor="medicine-name">Medicine name</label>
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

              <label htmlFor="medicine-time">Scheduled time</label>
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
              <p>No medicines added yet. Click Add to create your schedule.</p>
            ) : (
              medicines.map((medicine) => (
                <article className="medicine-item" key={medicine.id}>
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
                        <CheckCircle2 size={15} /> Taken
                      </span>
                    ) : medicine.status === "Skipped" ? (
                      <span className="status-skipped">
                        <XCircle size={15} /> Skipped
                      </span>
                    ) : (
                      <>
                        <span className="status-pending">
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
          CareBridge provides health-management support, not medical diagnosis.
          Follow your healthcare professional's instructions.
        </p>
      </main>
    </div>
  );
}

export default PatientDashboard;
