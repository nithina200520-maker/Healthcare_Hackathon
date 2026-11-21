
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
} from "lucide-react";
import "./index.css";

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

  // Restore the existing login session when the app opens
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Session error:", error.message);
      }

      setSession(data?.session ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRoleSelect = (role) => {
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

  // Real Supabase registration and login
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (selectedRole !== "Patient") {
      setMessage(
        "This role is currently in demo mode. Patient authentication is available."
      );
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
              role: "Patient",
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

        setSession(data.session);
        setMessage("");
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Secure logout through Supabase
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

  // Show dashboard only to authenticated patients
  if (session && session.user.user_metadata?.role === "Patient") {
    return <PatientDashboard onLogout={handleLogout} />;
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

              <div className="role-grid">
                {roles.map((role) => {
                  const Icon = role.icon;

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

            {selectedRole !== "Patient" && (
              <p className="demo-note">
                This role is currently a demonstration interface. Real
                authentication is available for patients.
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
