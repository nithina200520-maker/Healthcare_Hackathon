
import { useEffect, useState } from "react";
import {
  HeartPulse,
  Hospital,
  Users,
  UserRound,
  RefreshCw,
  LogOut,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function HospitalAccess({ onLogout }) {
  const [checking, setChecking] = useState(true);
  const [hospital, setHospital] = useState(null);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");

  const loadHospitalDashboard = async () => {
    setChecking(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Please log in again.");

      // Verify that this hospital account is approved.
      const { data: hospitalData, error: hospitalError } = await supabase
        .from("authorized_hospitals")
        .select("hospital_id, hospital_name, approved_at")
        .eq("hospital_id", user.id)
        .maybeSingle();

      if (hospitalError) throw hospitalError;

      if (!hospitalData) {
        setHospital(null);
        setPatients([]);
        return;
      }

      setHospital(hospitalData);

      // Load patients assigned to this hospital.
      const { data: patientData, error: patientError } = await supabase
        .from("hospital_patient_links")
        .select("id, patient_id, is_active, created_at")
        .eq("hospital_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (patientError) throw patientError;

      setPatients(patientData || []);
    } catch (err) {
      setError(err.message || "Unable to load the hospital dashboard.");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    loadHospitalDashboard();
  }, []);

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
            <p className="dashboard-eyebrow">HOSPITAL DASHBOARD</p>
            <h1>
              Welcome, {hospital?.hospital_name || "Hospital"}!
            </h1>
            <p>
              Coordinate patient assignments and monitor your hospital's
              connected patients.
            </p>
          </div>

          <div className="dashboard-profile-icon">
            <Hospital size={30} />
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
              onClick={loadHospitalDashboard}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </section>
        )}

        {checking ? (
          <section className="dashboard-panel">
            <p>Verifying hospital approval and loading patients...</p>
          </section>
        ) : !error && !hospital ? (
          <section
            className="dashboard-panel"
            style={{ textAlign: "center", padding: 30 }}
          >
            <div className="login-icon">
              <Clock size={30} />
            </div>

            <h2>Hospital account awaiting approval</h2>

            <p>
              Your hospital account has been created, but an administrator
              has not approved it yet. Your dashboard will become available
              after approval.
            </p>

            <button
              className="continue-button"
              type="button"
              onClick={loadHospitalDashboard}
              style={{ marginTop: 15 }}
            >
              <RefreshCw size={17} />
              Check approval status
            </button>
          </section>
        ) : !error && hospital ? (
          <>
            <section className="dashboard-stats">
              <article className="stat-card">
                <div className="stat-icon">
                  <Users />
                </div>
                <p>Active patients</p>
                <h2>{patients.length}</h2>
                <span>Currently assigned</span>
              </article>

              <article className="stat-card">
                <div className="stat-icon">
                  <Hospital />
                </div>
                <p>Hospital status</p>
                <h2 style={{ fontSize: 22, color: "#167044" }}>
                  Approved
                </h2>
                <span>Authorized account</span>
              </article>
            </section>

            <section className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    <UserRound size={21} />
                    Assigned patients
                  </h2>
                  <p>
                    Patients currently assigned to your hospital.
                  </p>
                </div>

                <button
                  className="small-action"
                  type="button"
                  onClick={loadHospitalDashboard}
                  disabled={checking}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {patients.length === 0 ? (
                <p style={{ color: "#64746f" }}>
                  No patients have been assigned to this hospital yet.
                  Contact the CareBridge administrator.
                </p>
              ) : (
                <div className="medicine-list">
                  {patients.map((patient, index) => (
                    <article
                      className="medicine-item"
                      key={patient.id}
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

                        <p
                          style={{
                            fontSize: 12,
                            overflowWrap: "anywhere",
                          }}
                        >
                          Patient ID: {patient.patient_id}
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

            <p className="dashboard-disclaimer">
              CareBridge supports healthcare coordination. Patient
              assignments should be managed by authorized administrators.
            </p>
          </>
        ) : null}
      </main>
    </div>
  );
}
