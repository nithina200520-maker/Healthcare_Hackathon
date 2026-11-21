
import "./index.css";
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
  const [selectedRole, setSelectedRole] = useState(null);
  const [language, setLanguage] = useState("English");

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon"><HeartPulse size={25} /></div>
          <span>CareBridge</span>
        </div>

        <div className="language-select">
          <Globe size={17} />
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option>English</option>
            <option>ಕನ್ನಡ</option>
            <option>हिन्दी</option>
            <option>తెలుగు</option>
          </select>
        </div>
      </header>

      <main className="main-content">
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

        {!selectedRole ? (
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
                    onClick={() => setSelectedRole(role.name)}
                  >
                    <div className="role-icon"><Icon size={23} /></div>
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
        ) : (
          <section className="login-section">
            <button className="back-button" onClick={() => setSelectedRole(null)}>
              ← Back to roles
            </button>

            <div className="login-icon"><HeartPulse size={30} /></div>
            <h2>{selectedRole} Login</h2>
            <p className="login-description">
              Continue to your CareBridge {selectedRole.toLowerCase()} account.
            </p>

            <form onSubmit={(e) => e.preventDefault()}>
              <label>Email address</label>
              <input type="email" placeholder="Enter your email" required />

              <label>Password</label>
              <input type="password" placeholder="Enter your password" required />

              <button className="continue-button" type="submit">
                Continue <ArrowRight size={18} />
              </button>
            </form>

            <p className="demo-note">
              Demo interface only. Account authentication will be added later.
            </p>
          </section>
        )}
      </main>

      <footer>
        <p>© 2026 CareBridge · Connecting people through better healthcare</p>
      </footer>
    </div>
  );
}

export default App;
