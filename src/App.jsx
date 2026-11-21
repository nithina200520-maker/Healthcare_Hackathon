
import PatientDashboard from "./components/PatientDashboard";
import { useState } from "react";
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
  { name: "Patient", description: "Manage medicines and health updates", icon: UserRound },
  { name: "Doctor", description: "Monitor patients and manage care", icon: Stethoscope },
  { name: "Nurse", description: "Track medicines and patient support", icon: ClipboardList },
  { name: "Hospital", description: "Coordinate healthcare services", icon: Hospital },
  { name: "Caregiver", description: "Support a family member or patient", icon: Users },
  { name: "Volunteer", description: "Help patients access healthcare", icon: HandHeart },
];

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [language, setLanguage] = useState("English");
  const [authMode, setAuthMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

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
  setLoggedIn(false);
  setMessage("");
};

  const handleSubmit = (e) => {
  e.preventDefault();

  if (selectedRole === "Patient") {
    setLoggedIn(true);
  } else {
    setMessage("Demo login submitted. Other dashboards will be added next.");
  }
};

   return (
  <>
    {loggedIn && selectedRole === "Patient" ? (
      <PatientDashboard
        onLogout={() => {
          setLoggedIn(false);
          setSelectedRole(null);
        }}
      />
    ) : (
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
            onChange={(e) => setLanguage(e.target.value)}
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
              {selectedRole} {authMode === "login" ? "Login" : "Registration"}
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
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
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
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  authMode === "login" ? "current-password" : "new-password"
                }
                minLength={6}
                required
              />

              <button className="continue-button" type="submit">
                {authMode === "login" ? "Continue" : "Create account"}
                <ArrowRight size={18} />
              </button>
            </form>

            {message && (
              <p className="demo-note" role="status">
                {message}
              </p>
            )}

            <p className="demo-note">
              Demo interface only. No real account is created and no
              authentication is performed yet.
            </p>
          </section>
        )}
            </main>

      <footer>
        <p>
          © 2026 CareBridge · Connecting people through better healthcare
        </p>
      </footer>

           </div>
    )}
  </>
  );
}

export default App;