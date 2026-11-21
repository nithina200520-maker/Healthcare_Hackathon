
import { useState } from "react";
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

const initialMedicines = [
  { id: 1, name: "Morning medicine", time: "8:00 AM", status: "Taken" },
  { id: 2, name: "Afternoon medicine", time: "2:00 PM", status: "Pending" },
  { id: 3, name: "Night medicine", time: "9:00 PM", status: "Upcoming" },
];

function formatTime(time) {
  const [hours, minutes] = time.split(":");
  const hour = Number(hours);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
}

function PatientDashboard({ onLogout }) {
  const [medicines, setMedicines] = useState(initialMedicines);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newMedicineTime, setNewMedicineTime] = useState("08:00");

  const takenCount = medicines.filter(
    (medicine) => medicine.status === "Taken"
  ).length;

  const skippedCount = medicines.filter(
    (medicine) => medicine.status === "Skipped"
  ).length;

  const pendingCount = medicines.filter(
    (medicine) =>
      medicine.status === "Pending" || medicine.status === "Upcoming"
  ).length;

  const markTaken = (id) => {
    setMedicines((previous) =>
      previous.map((medicine) =>
        medicine.id === id && medicine.status !== "Taken" &&
        medicine.status !== "Skipped"
          ? { ...medicine, status: "Taken" }
          : medicine
      )
    );
  };

  const markSkipped = (id) => {
    setMedicines((previous) =>
      previous.map((medicine) =>
        medicine.id === id && medicine.status !== "Taken" &&
        medicine.status !== "Skipped"
          ? { ...medicine, status: "Skipped" }
          : medicine
      )
    );
  };

  const addMedicine = (event) => {
    event.preventDefault();

    const name = newMedicineName.trim();

    if (!name) return;

    const newMedicine = {
      id: Date.now(),
      name,
      time: formatTime(newMedicineTime),
      status: "Upcoming",
    };

    setMedicines((previous) =>
      [...previous, newMedicine].sort((a, b) => {
        const toMinutes = (time) => {
          const [clock, period] = time.split(" ");
          let [hours, minutes] = clock.split(":").map(Number);

          if (period === "PM" && hours !== 12) hours += 12;
          if (period === "AM" && hours === 12) hours = 0;

          return hours * 60 + minutes;
        };

        return toMinutes(a.time) - toMinutes(b.time);
      })
    );

    setNewMedicineName("");
    setNewMedicineTime("08:00");
    setShowAddForm(false);
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

          {showAddForm && (
            <form className="add-medicine-form" onSubmit={addMedicine}>
              <h3>Add a medicine</h3>

              <label htmlFor="medicine-name">Medicine name</label>
              <input
                id="medicine-name"
                type="text"
                placeholder="Enter medicine name"
                value={newMedicineName}
                onChange={(event) => setNewMedicineName(event.target.value)}
                required
                maxLength={80}
              />

              <label htmlFor="medicine-time">Scheduled time</label>
              <input
                id="medicine-time"
                type="time"
                value={newMedicineTime}
                onChange={(event) => setNewMedicineTime(event.target.value)}
                required
              />

              <button className="save-medicine-button" type="submit">
                <Plus size={17} />
                Save medicine
              </button>
            </form>
          )}

          <div className="medicine-list">
            {medicines.map((medicine) => (
              <article className="medicine-item" key={medicine.id}>
                <div className="medicine-icon">
                  <Pill size={21} />
                </div>

                <div className="medicine-info">
                  <h3>{medicine.name}</h3>
                  <p>
                    <Clock size={14} />
                    {medicine.time}
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
                          onClick={() => markTaken(medicine.id)}
                          type="button"
                        >
                          Mark taken
                        </button>

                        <button
                          className="skip-button"
                          onClick={() => markSkipped(medicine.id)}
                          type="button"
                        >
                          Skip
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </article>
            ))}
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
