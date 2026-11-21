import { createContext, useContext, useState } from "react";
import { Globe } from "lucide-react";

const LanguageContext = createContext();

export const translations = {
  English: {},
  "ಕನ್ನಡ": {
    // Brand & Common
    "CareBridge": "ಕೇರ್‌ಬ್ರಿಡ್ಜ್",
    "Healthcare, connected": "ಆರೋಗ್ಯ ರಕ್ಷಣೆ, ಸಂಪರ್ಕಿತ",
    "Better care.": "ಉತ್ತಮ ಆರೈಕೆ.",
    "Closer to you.": "ನಿಮಗೆ ಹತ್ತಿರವಾಗಿ.",
    "Your health journey, connected with the people who care. Manage medicines, stay informed and connect with healthcare professionals through one simple platform.":
      "ನಿಮ್ಮ ಆರೋಗ್ಯದ ಹಾದಿ, ಕಾಳಜಿ ವಹಿಸುವ ಜನರೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿದೆ. ಔಷಧಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ, ಮಾಹಿತಿ ಪಡೆದುಕೊಳ್ಳಿ ಮತ್ತು ಒಂದೇ ಸರಳ ವೇದಿಕೆಯ ಮೂಲಕ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ.",
    "Choose your role": "ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "Select how you will use CareBridge to continue": "ಮುಂದುವರಿಯಲು ನೀವು ಕೇರ್‌ಬ್ರಿಡ್ಜ್ ಅನ್ನು ಹೇಗೆ ಬಳಸುತ್ತೀರಿ ಎಂಬುದನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "Continue": "ಮುಂದುವರಿಯಿರಿ",
    "Back": "ಹಿಂದಕ್ಕೆ",
    "Cancel": "ರದ್ದುಮಾಡಿ",
    "Save": "ಉಳಿಸಿ",
    "Submit": "ಸಲ್ಲಿಸಿ",
    "Delete": "ಅಳಿಸಿ",
    "Refresh": "ರಿಫ್ರೆಶ್",
    "Add": "ಸೇರಿಸಿ",
    "Close": "ಮುಚ್ಚಿ",
    "Edit": "ತಿದ್ದುಪಡಿ",
    "Search": "ಹುಡುಕಿ",
    "Filter": "ಫಿಲ್ಟರ್",
    "Status": "ಸ್ಥಿತಿ",
    "Action": "ಕ್ರಿಯೆ",
    "Actions": "ಕ್ರಿಯೆಗಳು",
    "Details": "ವಿವರಗಳು",
    "Date": "ದಿನಾಂಕ",
    "Time": "ಸಮಯ",
    "Loading...": "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    "Saving...": "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
    "Sending...": "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...",
    "Submitting...": "ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
    "Logout": "ಲಾಗ್‌ಔಟ್",
    "Login": "ಲಾಗಿನ್",
    "Register": "ನೋಂದಣಿ",
    "Sign In": "ಸೈನ್ ಇನ್",
    "Sign Up": "ಸೈನ್ ಅಪ್",
    "Signing in...": "ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ...",
    "Registering...": "ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ...",
    "Create account": "ಖಾತೆ ರಚಿಸಿ",
    "Don't have an account? Register": "ಖಾತೆ ಇಲ್ಲವೇ? ನೋಂದಾಯಿಸಿ",
    "Already have an account? Login": "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಆಗಿ",
    "Change role": "ಪಾತ್ರವನ್ನು ಬದಲಾಯಿಸಿ",

    // Roles
    "Patient": "ರೋಗಿ",
    "Caregiver": "ಆರೈಕೆದಾರ",
    "Nurse": "ದಾದಿ (ನರ್ಸ್)",
    "Doctor": "ವೈದ್ಯರು",
    "Hospital": "ಆಸ್ಪತ್ರೆ",
    "Volunteer": "ಸ್ವಯಂಸೇವಕ",
    "Administrator": "ನಿರ್ವಾಹಕರು",
    "Admin": "ನಿರ್ವಾಹಕರು",
    "Track medicines, report concerns and stay connected with your care team.":
      "ಔಷಧಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ಕಾಳಜಿಗಳನ್ನು ವರದಿ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಆರೈಕೆ ತಂಡದೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿರಿ.",
    "Support your loved ones and receive notifications when medicines are missed.":
      "ನಿಮ್ಮ ಪ್ರೀತಿಪಾತ್ರರನ್ನು ಬೆಂಬಲಿಸಿ ಮತ್ತು ಔಷಧಿಗಳು ತಪ್ಪಿದಾಗ ಅಧಿಸೂಚನೆಗಳನ್ನು ಸ್ವೀಕರಿಸಿ.",
    "Monitor patient medication adherence and coordinate with doctors and caregivers.":
      "ರೋಗಿಯ ಔಷಧ ಸೇವನೆಯನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ ಮತ್ತು ವೈದ್ಯರು ಹಾಗೂ ಆರೈಕೆದಾರರೊಂದಿಗೆ ಸಮನ್ವಯ ಸಾಧಿಸಿ.",
    "Review patient concerns, communicate updates and provide medical guidance.":
      "ರೋಗಿಯ ಕಾಳಜಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಅಪ್‌ಡೇಟ್‌ಗಳನ್ನು ಸಂವಹಿಸಿ ಮತ್ತು ವೈದ್ಯಕೀಯ ಮಾರ್ಗದರ್ಶನ ನೀಡಿ.",
    "Coordinate patient care, manage admissions and oversee hospital-linked patients.":
      "ರೋಗಿಗಳ ಆರೈಕೆಯನ್ನು ಸಮನ್ವಯಗೊಳಿಸಿ, ದಾಖಲಾತಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಆಸ್ಪತ್ರೆಗೆ ಲಿಂಕ್ ಆದ ರೋಗಿಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.",
    "Support community health tasks and assist patients with daily care needs.":
      "ಸಮುದಾಯ ಆರೋಗ್ಯ ಕಾರ್ಯಗಳನ್ನು ಬೆಂಬಲಿಸಿ ಮತ್ತು ದೈನಂದಿನ ಆರೈಕೆ ಅಗತ್ಯಗಳೊಂದಿಗೆ ರೋಗಿಗಳಿಗೆ ಸಹಾಯ ಮಾಡಿ.",
    "Manage approvals, monitor system assignments and review platform activity.":
      "ಅನುಮೋದನೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ, ಸಿಸ್ಟಮ್ ನಿಯೋಜನೆಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ ಮತ್ತು ವೇದಿಕೆಯ ಚಟುವಟಿಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    "Manage medicines and health updates": "ಔಷಧಿಗಳು ಮತ್ತು ಆರೋಗ್ಯ ಅಪ್‌ಡೇಟ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
    "Monitor patients and manage care": "ರೋಗಿಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ ಮತ್ತು ಆರೈಕೆಯನ್ನು ನಿರ್ವಹಿಸಿ",
    "Track medicines and patient support": "ಔಷಧಿಗಳು ಮತ್ತು ರೋಗಿಗಳ ಬೆಂಬಲವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    "Coordinate healthcare services": "ಆರೋಗ್ಯ ರಕ್ಷಣಾ ಸೇವೆಗಳನ್ನು ಸಮನ್ವಯಗೊಳಿಸಿ",
    "Support a family member or patient": "ಕುಟುಂಬದ ಸದಸ್ಯ ಅಥವಾ ರೋಗಿಯನ್ನು ಬೆಂಬಲಿಸಿ",
    "Help patients access healthcare": "ರೋಗಿಗಳಿಗೆ ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಪಡೆಯಲು ಸಹಾಯ ಮಾಡಿ",
    "Welcome to CareBridge": "ಕೇರ್‌ಬ್ರಿಡ್ಜ್‌ಗೆ ಸುಸ್ವಾಗತ",
    "Select your role to continue": "ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "Coming soon": "ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ",
    "Administrator approval required": "ನಿರ್ವಾಹಕರ ಅನುಮೋದನೆ ಅಗತ್ಯವಿದೆ",
    "Back to roles": "ಪಾತ್ರಗಳಿಗೆ ಹಿಂದಿರುಗಿ",
    "Patient-focused · Secure by design · Accessible healthcare":
      "ರೋಗಿ-ಕೇಂದ್ರಿತ · ವಿನ್ಯಾಸದಿಂದಲೇ ಸುರಕ್ಷಿತ · ಸುಲಭ ಲಭ್ಯತೆಯ ಆರೋಗ್ಯ ರಕ್ಷಣೆ",
    "accounts require administrator approval before dashboard access.":
      "ಖಾತೆಗಳಿಗೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರವೇಶಿಸುವ ಮೊದಲು ನಿರ್ವಾಹಕರ ಅನುಮೋದನೆ ಅಗತ್ಯವಿದೆ.",
    "Please wait...": "ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...",

    // Form Fields
    "Email": "ಇಮೇಲ್",
    "Email address": "ಇಮೇಲ್ ವಿಳಾಸ",
    "Password": "ಪಾಸ್‌ವರ್ಡ್",
    "Full name": "ಪೂರ್ಣ ಹೆಸರು",
    "Hospital name": "ಆಸ್ಪತ್ರೆಯ ಹೆಸರು",
    "Volunteer name": "ಸ್ವಯಂಸೇವಕರ ಹೆಸರು",
    "Phone number": "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
    "Preferred language": "ಆದ್ಯತೆಯ ಭಾಷೆ",
    "Enter your email": "ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ",
    "Enter your password": "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
    "Enter your full name": "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    "Enter hospital name": "ಆಸ್ಪತ್ರೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    "Enter your name": "ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    "Enter phone number": "ದೂರವಾಣಿ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",

    // Connections
    "Caregiver connections": "ಆರೈಕೆದಾರರ ಸಂಪರ್ಕಗಳು",
    "Patient connections": "ರೋಗಿಗಳ ಸಂಪರ್ಕಗಳು",
    "Connect with someone who can support your care.": "ನಿಮ್ಮ ಆರೈಕೆಯನ್ನು ಬೆಂಬಲಿಸುವ ಯಾರೊಂದಿಗಾದರೂ ಸಂಪರ್ಕ ಸಾಧಿಸಿ.",
    "Review patient connection requests.": "ರೋಗಿಯ ಸಂಪರ್ಕ ವಿನಂತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    "Your CareBridge account ID": "ನಿಮ್ಮ ಕೇರ್‌ಬ್ರಿಡ್ಜ್ ಖಾತೆ ಐಡಿ",
    "Copy ID": "ಐಡಿ ನಕಲಿಸಿ",
    "Share this ID only with the person you want to connect with.": "ನೀವು ಯಾರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಲು ಬಯಸುತ್ತೀರೋ ಅವರೊಂದಿಗೆ ಮಾತ್ರ ಈ ಐಡಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",
    "Enter caregiver account ID": "ಆರೈಕೆದಾರರ ಖಾತೆ ಐಡಿ ನಮೂದಿಸಿ",
    "Paste caregiver UUID": "ಆರೈಕೆದಾರರ UUID ಅನ್ನು ಅಂಟಿಸಿ",
    "Send request": "ವಿನಂತಿ ಕಳುಹಿಸಿ",
    "Your caregivers": "ನಿಮ್ಮ ಆರೈಕೆದಾರರು",
    "Patient requests": "ರೋಗಿಯ ವಿನಂತಿಗಳು",
    "No caregiver connections yet. Send a request using their account ID.": "ಇನ್ನೂ ಯಾವುದೇ ಆರೈಕೆದಾರರ ಸಂಪರ್ಕಗಳಿಲ್ಲ. ಅವರ ಖಾತೆ ಐಡಿ ಬಳಸಿ ವಿನಂತಿ ಕಳುಹಿಸಿ.",
    "No patient connection requests yet.": "ಇನ್ನೂ ಯಾವುದೇ ರೋಗಿ ಸಂಪರ್ಕ ವಿನಂತಿಗಳಿಲ್ಲ.",
    "Accept": "ಸ್ವೀಕರಿಸಿ",
    "Reject": "ತಿರಸ್ಕರಿಸಿ",
    "Connection request sent successfully.": "ಸಂಪರ್ಕ ವಿನಂತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ.",
    "Connection request accepted.": "ಸಂಪರ್ಕ ವಿನಂತಿಯನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ.",
    "Connection request rejected.": "ಸಂಪರ್ಕ ವಿನಂತಿಯನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ.",
    "Your account ID has been copied.": "ನಿಮ್ಮ ಖಾತೆ ಐಡಿಯನ್ನು ನಕಲಿಸಲಾಗಿದೆ.",

    // Patient Dashboard
    "PATIENT DASHBOARD": "ರೋಗಿಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "Good day!": "ಶುಭ ದಿನ!",
    "Here's your health overview for today.": "ಇಂದಿನ ನಿಮ್ಮ ಆರೋಗ್ಯದ ಅವಲೋಕನ ಇಲ್ಲಿದೆ.",
    "Scheduled medicines": "ನಿಗದಿತ ಔಷಧಿಗಳು",
    "Doses taken": "ತೆಗೆದುಕೊಂಡ ಪ್ರಮಾಣಗಳು",
    "Skipped doses": "ಬಿಟ್ಟುಹೋದ ಪ್ರಮಾಣಗಳು",
    "Pending doses": "ಬಾಕಿ ಇರುವ ಪ್ರಮಾಣಗಳು",
    "Missed doses": "ತಪ್ಪಿದ ಪ್ರಮಾಣಗಳು",
    "Today's schedule": "ಇಂದಿನ ವೇಳಾಪಟ್ಟಿ",
    "Today's progress": "ಇಂದಿನ ಪ್ರಗತಿ",
    "Today's skipped doses": "ಇಂದು ಬಿಟ್ಟುಹೋದ ಪ್ರಮಾಣಗಳು",
    "Awaiting action": "ಕ್ರಮಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ",
    "Weekly medicine adherence": "ವಾರದ ಔಷಧ ಸೇವನೆ ನಿಷ್ಠೆ",
    "Your medicine-taking progress over the last 7 days.": "ಕಳೆದ 7 ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಔಷಧ ಸೇವನೆಯ ಪ್ರಗತಿ.",
    "Adherence rate": "ನಿಷ್ಠೆಯ ದರ",
    "Daily adherence": "ದೈನಂದಿನ ನಿಷ್ಠೆ",
    "Medicine schedule": "ಔಷಧ ವೇಳಾಪಟ್ಟಿ",
    "Keep track of your scheduled doses.": "ನಿಮ್ಮ ನಿಗದಿತ ಪ್ರಮಾಣಗಳನ್ನು ಗಮನದಲ್ಲಿಡಿ.",
    "Add a medicine": "ಔಷಧ ಸೇರಿಸಿ",
    "Medicine name": "ಔಷಧದ ಹೆಸರು",
    "Enter medicine name": "ಔಷಧದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    "Scheduled time": "ನಿಗದಿತ ಸಮಯ",
    "Save medicine": "ಔಷಧ ಉಳಿಸಿ",
    "Loading your medicines...": "ನಿಮ್ಮ ಔಷಧಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    "No medicines added yet. Click Add to create your schedule.": "ಇನ್ನೂ ಯಾವುದೇ ಔಷಧಿಗಳನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ. ನಿಮ್ಮ ವೇಳಾಪಟ್ಟಿಯನ್ನು ರಚಿಸಲು 'ಸೇರಿಸಿ' ಕ್ಲಿಕ್ ಮಾಡಿ.",
    "Mark taken": "ತೆಗೆದುಕೊಂಡಂತೆ ಗುರುತಿಸಿ",
    "Skip": "ಬಿಟ್ಟುಬಿಡಿ",
    "Taken": "ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ",
    "Skipped": "ಬಿಡಲಾಗಿದೆ",
    "Missed": "ತಪ್ಪಿದೆ",
    "Upcoming": "ಮುಂಬರುವ",
    "Quick actions": "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು",
    "Contact doctor": "ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ",
    "Report a concern": "ಕಾಳಜಿಯನ್ನು ವರದಿ ಮಾಡಿ",
    "Emergency SOS (112)": "ತುರ್ತು SOS (112)",
    "Emergency call (112)": "ತುರ್ತು ಕರೆ (112)",
    "Call Emergency (112)": "ತುರ್ತು ಕರೆ ಮಾಡಿ (112)",
    "Emergency Assistance Available (Dial 112)": "ತುರ್ತು ವೈದ್ಯಕೀಯ ನೆರವು ಲಭ್ಯವಿದೆ (112 ಗೆ ಡಯಲ್ ಮಾಡಿ)",
    "In a critical or life-threatening situation, connect directly with national emergency responders.":
      "ನಿರ್ಣಾಯಕ ಅಥವಾ ಜೀವಕ್ಕೆ ಅಪಾಯವಿರುವ ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ, ರಾಷ್ಟ್ರೀಯ ತುರ್ತು ಸೇವೆಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕ ಸಾಧಿಸಿ.",
    "EMERGENCY SOS: 112": "ತುರ್ತು SOS: 112",
    "National Emergency Services Hotline": "ರಾಷ್ಟ್ರೀಯ ತುರ್ತು ಸೇವೆಗಳ ಸಹಾಯವಾಣಿ",
    "Are you experiencing a medical emergency?": "ನೀವು ವೈದ್ಯಕೀಯ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ಎದುರಿಸುತ್ತಿದ್ದೀರಾ?",
    "Open Device Dialler (112)": "ಸಾಧನದ ಡಯಲರ್ ತೆರೆಯಿರಿ (112)",
    "Device dialler opened with 112. Please complete the call on your device.":
      "112 ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಸಾಧನದ ಡಯಲರ್ ತೆರೆಯಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಕರೆ ಪೂರ್ಣಗೊಳಿಸಿ.",
    "CareBridge provides health-management support, not medical diagnosis. Follow your healthcare professional's instructions.":
      "ಕೇರ್‌ಬ್ರಿಡ್ಜ್ ಆರೋಗ್ಯ ನಿರ್ವಹಣಾ ಬೆಂಬಲವನ್ನು ನೀಡುತ್ತದೆ, ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ. ನಿಮ್ಮ ವೈದ್ಯರ ಸೂಚನೆಗಳನ್ನು ಅನುಸರಿಸಿ.",

    // Doctor Communication / Concerns
    "Doctor communication": "ವೈದ್ಯರ ಸಂವಹನ",
    "Send a non-emergency health concern to your assigned doctor.": "ನಿಮ್ಮ ನಿಯೋಜಿತ ವೈದ್ಯರಿಗೆ ತುರ್ತು-ಅಲ್ಲದ ಆರೋಗ್ಯ ಕಾಳಜಿಯನ್ನು ಕಳುಹಿಸಿ.",
    "Select assigned doctor": "ನಿಯೋಜಿತ ವೈದ್ಯರನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "Choose a doctor": "ವೈದ್ಯರನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "Subject": "ವಿಷಯ",
    "Example: Question about my medication": "ಉದಾಹರಣೆ: ನನ್ನ ಔಷಧಿಯ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ",
    "Describe your concern": "ನಿಮ್ಮ ಕಾಳಜಿಯನ್ನು ವಿವರಿಸಿ",
    "Submit concern": "ಕಾಳಜಿಯನ್ನು ಸಲ್ಲಿಸಿ",
    "My submitted concerns": "ನಾನು ಸಲ್ಲಿಸಿದ ಕಾಳಜಿಗಳು",
    "Doctor ID": "ವೈದ್ಯರ ಐಡಿ",
    "Doctor's response": "ವೈದ್ಯರ ಪ್ರತಿಕ್ರಿಯೆ",
    "Waiting for your doctor to respond.": "ನಿಮ್ಮ ವೈದ್ಯರು ಪ್ರತಿಕ್ರಿಯಿಸಲು ಕಾಯಲಾಗುತ್ತಿದೆ.",
    "Submitted": "ಸಲ್ಲಿಸಲಾಗಿದೆ",
    "Your concern has been sent to your assigned doctor.": "ನಿಮ್ಮ ಕಾಳಜಿಯನ್ನು ನಿಯೋಜಿತ ವೈದ್ಯರಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.",
    "This feature is for non-emergency communication. It does not provide emergency medical assistance or replace professional medical care.":
      "ಈ ವೈಶಿಷ್ಟ್ಯವು ತುರ್ತು-ಅಲ್ಲದ ಸಂವಹನಕ್ಕಾಗಿ ಮಾತ್ರ. ಇದು ತುರ್ತು ವೈದ್ಯಕೀಯ ನೆರವು ನೀಡುವುದಿಲ್ಲ ಅಥವಾ ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಆರೈಕೆಯನ್ನು ಬದಲಿಸುವುದಿಲ್ಲ.",

    // Doctor Dashboard & Physical Meeting Scheduling
    "DOCTOR DASHBOARD": "ವೈದ್ಯರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "Welcome, Doctor!": "ಸ್ವಾಗತ, ವೈದ್ಯರೇ!",
    "Review concerns from your assigned patients and provide responses.": "ನಿಮ್ಮ ನಿಯೋಜಿತ ರೋಗಿಗಳಿಂದ ಬಂದ ಕಾಳಜಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆಗಳನ್ನು ನೀಡಿ.",
    "Assigned patients": "ನಿಯೋಜಿತ ರೋಗಿಗಳು",
    "Pending concerns": "ಬಾಕಿ ಇರುವ ಕಾಳಜಿಗಳು",
    "Active assignments": "ಸಕ್ರಿಯ ನಿಯೋಜನೆಗಳು",
    "Awaiting response": "ಪ್ರತಿಕ್ರಿಯೆಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ",
    "Responded": "ಪ್ರತಿಕ್ರಿಯಿಸಲಾಗಿದೆ",
    "Scheduled": "ನಿಗದಿಯಾಗಿದೆ",
    "Responses submitted": "ಸಲ್ಲಿಸಿದ ಪ್ರತಿಕ್ರಿಯೆಗಳು",
    "Patient concerns": "ರೋಗಿಯ ಕಾಳಜಿಗಳು",
    "Review patient messages and submit your responses.": "ರೋಗಿಯ ಸಂದೇಶಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಗಳನ್ನು ಸಲ್ಲಿಸಿ.",
    "Schedule physical in-person meeting": "ಭೌತಿಕ ಮುಖಾಮುಖಿ ಭೇಟಿಯನ್ನು ನಿಗದಿಪಡಿಸಿ",
    "Create Physical Meeting Schedule & Send SMS": "ಭೌತಿಕ ಭೇಟಿ ವೇಳಾಪಟ್ಟಿ ರಚಿಸಿ ಮತ್ತು SMS ಕಳುಹಿಸಿ",
    "Physical Meeting Date & Time": "ಭೌತಿಕ ಭೇಟಿಯ ದಿನಾಂಕ ಮತ್ತು ಸಮಯ",
    "Meeting Location / Hospital Clinic": "ಭೇಟಿಯ ಸ್ಥಳ / ಆಸ್ಪತ್ರೆಯ ಕ್ಲಿನಿಕ್",
    "Instructions for Physical Meeting": "ಭೌತಿಕ ಭೇಟಿಗಾಗಿ ಸೂಚನೆಗಳು",
    "Patient phone number": "ರೋಗಿಯ ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
    "Caretaker phone number": "ಆರೈಕೆದಾರರ ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
    "SMS Sent to Patient and Caretaker": "ರೋಗಿ ಮತ್ತು ಆರೈಕೆದಾರರಿಗೆ SMS ಕಳುಹಿಸಲಾಗಿದೆ",
    "In-Person Physical Meeting Scheduled": "ಮುಖಾಮುಖಿ ಭೌತಿಕ ಸಮಾಲೋಚನೆ ನಿಗದಿಯಾಗಿದೆ",
    "Reschedule Meeting": "ಭೇಟಿಯನ್ನು ಮರುನಿಗದಿಪಡಿಸಿ",
    "SMS Dispatched Successfully": "SMS ಯಶಸ್ವಿಯಾಗಿ ರವಾನೆಯಾಗಿದೆ",
    "Physical meeting schedule created and SMS sent to patient & caretaker.":
      "ಭೌತಿಕ ಭೇಟಿ ವೇಳಾಪಟ್ಟಿ ರಚಿಸಲಾಗಿದೆ ಮತ್ತು ರೋಗಿ ಹಾಗೂ ಆರೈಕೆದಾರರಿಗೆ SMS ಕಳುಹಿಸಲಾಗಿದೆ.",
    "Phone number (for SMS notifications)": "ದೂರವಾಣಿ ಸಂಖ್ಯೆ (SMS ಅಧಿಸೂಚನೆಗಳಿಗಾಗಿ)",
    "Enter phone number (e.g. +91 98765 43210)": "ದೂರವಾಣಿ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ (ಉದಾ: +91 98765 43210)",
    "Please enter your phone number to receive SMS updates.": "SMS ಅಪ್‌ಡೇಟ್‌ಗಳನ್ನು ಸ್ವೀಕರಿಸಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ದೂರವಾಣಿ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
    "Your response": "ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆ",
    "Write your response...": "ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಬರೆಯಿರಿ...",
    "Submit response": "ಪ್ರತಿಕ್ರಿಯೆ ಸಲ್ಲಿಸಿ",
    "Close concern": "ಕಾಳಜಿಯನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸಿ",
    "Response submitted successfully.": "ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ.",
    "Concern marked as closed.": "ಕಾಳಜಿಯನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.",
    "Write a response before submitting.": "ಸಲ್ಲಿಸುವ ಮೊದಲು ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಬರೆಯಿರಿ.",
    "Please enter your response before submitting.": "ದಯವಿಟ್ಟು ಸಲ್ಲಿಸುವ ಮೊದಲು ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ನಮೂದಿಸಿ.",
    "This concern has been closed.": "ಈ ಕಾಳಜಿಯನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸಲಾಗಿದೆ.",
    "Patients connected to your doctor account.": "ನಿಮ್ಮ ವೈದ್ಯರ ಖಾತೆಗೆ ಸಂಪರ್ಕ ಹೊಂದಿರುವ ರೋಗಿಗಳು.",
    "Loading patient concerns...": "ರೋಗಿಯ ಕಾಳಜಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    "No concerns received": "ಯಾವುದೇ ಕಾಳಜಿಗಳು ಬಂದಿಲ್ಲ",
    "New concerns from your assigned patients will appear here.": "ನಿಮ್ಮ ನಿಯೋಜಿತ ರೋಗಿಗಳಿಂದ ಹೊಸ ಕಾಳಜಿಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.",
    "CareBridge supports communication and care coordination. It does not replace clinical judgement or emergency medical services.":
      "ಕೇರ್‌ಬ್ರಿಡ್ಜ್ ಸಂವಹನ ಮತ್ತು ಆರೈಕೆ ಸಮನ್ವಯವನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ. ಇದು ಕ್ಲಿನಿಕಲ್ ನಿರ್ಣಯ ಅಥವಾ ತುರ್ತು ವೈದ್ಯಕೀಯ ಸೇವೆಗಳನ್ನು ಬದಲಿಸುವುದಿಲ್ಲ.",

    // AI Medical Report Analyser
    "AI Medical Report Analyser": "AI ವೈದ್ಯಕೀಯ ವರದಿ ವಿಶ್ಲೇಷಕ",
    "Upload or photograph your medical documents for an intelligent, patient-friendly breakdown.":
      "ಬುದ್ಧಿವಂತ ಮತ್ತು ರೋಗಿ-ಸ್ನೇಹಿ ವಿವರಣೆಗಾಗಿ ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಛಾಯಾಚಿತ್ರ ತೆಗೆಯಿರಿ.",
    "Take Photo": "ಫೋಟೋ ತೆಗೆಯಿರಿ",
    "Upload File": "ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "Click or capture a medical report (ECG, X-Ray, Blood Test, Lab Document) to begin":
      "ಪ್ರಾರಂಭಿಸಲು ವೈದ್ಯಕೀಯ ವರದಿಯನ್ನು (ECG, ಎಕ್ಸ್-ರೇ, ರಕ್ತ ಪರೀಕ್ಷೆ, ಲ್ಯಾಬ್ ದಾಖಲೆ) ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "Supports JPG, PNG, WEBP and PDF up to 10MB": "10MB ವರೆಗಿನ JPG, PNG, WEBP ಮತ್ತು PDF ಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ",
    "Remove": "ತೆಗೆದುಹಾಕಿ",
    "Replace": "ಬದಲಾಯಿಸಿ",
    "Analyse Report": "ವರದಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    "Analysing Report...": "ವರದಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    "1. Report Type": "೧. ವರದಿಯ ಪ್ರಕಾರ",
    "2. Summary of the Report": "೨. ವರದಿಯ ಸಾರಾಂಶ",
    "3. Extracted Values & Observations": "೩. ತೆಗೆದ ಮೌಲ್ಯಗಳು ಮತ್ತು ವೀಕ್ಷಣೆಗಳು",
    "Parameter / Test": "ಪ್ಯಾರಾಮೀಟರ್ / ಪರೀಕ್ಷೆ",
    "Result Value": "ಫಲಿತಾಂಶ ಮೌಲ್ಯ",
    "Normal Range": "ಸಾಮಾನ್ಯ ಶ್ರೇಣಿ",
    "4. Explanation in Plain Language": "೪. ಸರಳ ಭಾಷೆಯಲ್ಲಿ ವಿವರಣೆ",
    "5. Values or Findings Needing Attention": "೫. ಗಮನ ಹರಿಸಬೇಕಾದ ಮೌಲ್ಯಗಳು ಅಥವಾ ಸಂಶೋಧನೆಗಳು",
    "6. Questions You Can Ask Your Doctor": "೬. ನಿಮ್ಮ ವೈದ್ಯರಿಗೆ ನೀವು ಕೇಳಬಹುದಾದ ಪ್ರಶ್ನೆಗಳು",
    "Copy Question": "ಪ್ರಶ್ನೆ ನಕಲಿಸಿ",
    "Copied!": "ನಕಲಿಸಲಾಗಿದೆ!",
    "7. Medical Limitations & Safety Disclaimer": "೭. ವೈದ್ಯಕೀಯ ಮಿತಿಗಳು ಮತ್ತು ಸುರಕ್ಷತಾ ಹಕ್ಕುತ್ಯಾಗ",
    "Past Reports & History": "ಹಿಂದಿನ ವರದಿಗಳು ಮತ್ತು ಇತಿಹಾಸ",
    "View Analysis": "ವಿಶ್ಲೇಷಣೆಯನ್ನು ವೀಕ್ಷಿಸಿ",
    "Delete report from storage": "ಸಂಗ್ರಹಣೆಯಿಂದ ವರದಿಯನ್ನು ಅಳಿಸಿ",
    "No reports analyzed yet.": "ಇನ್ನೂ ಯಾವುದೇ ವರದಿಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗಿಲ್ಲ.",

    // Caregiver & Nurse
    "Caregiver connection": "ಆರೈಕೆದಾರರ ಸಂಪರ್ಕ",
    "Connect with family or caregivers to share medication progress.": "ಔಷಧ ಸೇವನೆಯ ಪ್ರಗತಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಕುಟುಂಬ ಅಥವಾ ಆರೈಕೆದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ.",
    "CAREGIVER DASHBOARD": "ಆರೈಕೆದಾರರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "NURSE DASHBOARD": "ದಾದಿಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "Welcome, Caregiver!": "ಸ್ವಾಗತ, ಆರೈಕೆದಾರರೇ!",
    "Welcome, Nurse!": "ಸ್ವಾಗತ, ದಾದಿಯರೇ!",
    "Monitor your assigned patients and their medicine alerts.": "ನಿಮ್ಮ ನಿಯೋಜಿತ ರೋಗಿಗಳು ಮತ್ತು ಅವರ ಔಷಧ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.",
    "Stay informed about the patients you support.": "ನೀವು ಬೆಂಬಲಿಸುವ ರೋಗಿಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿಯುಕ್ತರಾಗಿರಿ.",
    "Patients assigned to your approved nurse account.": "ನಿಮ್ಮ ಅನುಮೋದಿತ ದಾದಿಯ ಖಾತೆಗೆ ನಿಯೋಜಿಸಲಾದ ರೋಗಿಗಳು.",
    "Assigned Patient": "ನಿಯೋಜಿತ ರೋಗಿ",
    "ACTIVE ASSIGNMENT": "ಸಕ್ರಿಯ ನಿಯೋಜನೆ",
    "Total notifications": "ಒಟ್ಟು ಅಧಿಸೂಚನೆಗಳು",
    "All alerts received": "ಸ್ವೀಕರಿಸಿದ ಎಲ್ಲಾ ಎಚ್ಚರಿಕೆಗಳು",
    "Unread notifications": "ಓದದ ಅಧಿಸೂಚನೆಗಳು",
    "Require your attention": "ನಿಮ್ಮ ಗಮನ ಅಗತ್ಯವಿದೆ",
    "Patient alerts": "ರೋಗಿಯ ಎಚ್ಚರಿಕೆಗಳು",
    "Notifications about missed medicine doses.": "ತಪ್ಪಿದ ಔಷಧ ಪ್ರಮಾಣಗಳ ಬಗ್ಗೆ ಅಧಿಸೂಚನೆಗಳು.",
    "No notifications yet": "ಇನ್ನೂ ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ",
    "When an assigned patient misses a medicine dose, their alert will appear here.": "ನಿಯೋಜಿತ ರೋಗಿಯು ಔಷಧ ಪ್ರಮಾಣವನ್ನು ತಪ್ಪಿಸಿದಾಗ, ಅವರ ಎಚ್ಚರಿಕೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.",
    "Read": "ಓದಲಾಗಿದೆ",
    "Unread": "ಓದಲಾಗಿಲ್ಲ",
    "Mark read": "ಓದಿದಂತೆ ಗುರುತಿಸಿ",
    "Verifying nurse approval...": "ದಾದಿಯ ಅನುಮೋದನೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    "Nurse account awaiting approval": "ದಾದಿಯ ಖಾತೆಯು ಅನುಮೋದನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ",
    "Your nurse account has been created, but an administrator has not approved it yet. You will be able to access the Nurse Dashboard after approval.":
      "ನಿಮ್ಮ ದಾದಿ ಖಾತೆಯನ್ನು ರಚಿಸಲಾಗಿದೆ, ಆದರೆ ನಿರ್ವಾಹಕರು ಅದನ್ನು ಇನ್ನೂ ಅನುಮೋದಿಸಿಲ್ಲ. ಅನುಮೋದನೆಯ ನಂತರ ನೀವು ದಾದಿಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಅನ್ನು ಪ್ರವೇಶಿಸಬಹುದು.",
    "Check approval status": "ಅನುಮೋದನೆ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ",
    "Verifying doctor approval...": "ವೈದ್ಯರ ಅನುಮೋದನೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    "Doctor account awaiting approval": "ವೈದ್ಯರ ಖಾತೆಯು ಅನುಮೋದನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ",
    "Your doctor account has been created, but an administrator has not approved it yet. You can access the Doctor Dashboard after approval.":
      "ನಿಮ್ಮ ವೈದ್ಯರ ಖಾತೆಯನ್ನು ರಚಿಸಲಾಗಿದೆ, ಆದರೆ ನಿರ್ವಾಹಕರು ಅದನ್ನು ಇನ್ನೂ ಅನುಮೋದಿಸಿಲ್ಲ. ಅನುಮೋದನೆಯ ನಂತರ ನೀವು ವೈದ್ಯರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಅನ್ನು ಪ್ರವೇಶಿಸಬಹುದು.",
    "Retry": "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    "Notifications": "ಅಧಿಸೂಚನೆಗಳು",
    "Mark all as read": "ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ",
    "No notifications yet.": "ಇನ್ನೂ ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ.",
    "Connected patients": "ಸಂಪರ್ಕಿತ ರೋಗಿಗಳು",
    "Pending connection requests": "ಬಾಕಿ ಇರುವ ಸಂಪರ್ಕ ವಿನಂತಿಗಳು",

    // Volunteer
    "VOLUNTEER DASHBOARD": "ಸ್ವಯಂಸೇವಕರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "Welcome, Volunteer!": "ಸ್ವಾಗತ, ಸ್ವಯಂಸೇವಕರೇ!",
    "Support patients and help make healthcare more accessible through CareBridge.": "ರೋಗಿಗಳಿಗೆ ಬೆಂಬಲ ನೀಡಿ ಮತ್ತು ಕೇರ್‌ಬ್ರಿಡ್ಜ್ ಮೂಲಕ ಆರೋಗ್ಯ ರಕ್ಷಣೆಯನ್ನು ಹೆಚ್ಚು ಸುಲಭವಾಗಿ ತಲುಪುವಂತೆ ಮಾಡಿ.",
    "Support patients with community tasks and care coordination.": "ಸಮುದಾಯ ಕಾರ್ಯಗಳು ಮತ್ತು ಆರೈಕೆ ಸಮನ್ವಯದೊಂದಿಗೆ ರೋಗಿಗಳಿಗೆ ಬೆಂಬಲ ನೀಡಿ.",
    "Assigned Tasks": "ನಿಯೋಜಿತ ಕಾರ್ಯಗಳು",
    "Pending": "ಬಾಕಿ ಇದೆ",
    "In Progress": "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    "Completed": "ಪೂರ್ಣಗೊಂಡಿದೆ",
    "Cancelled": "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
    "Start Task": "ಕಾರ್ಯ ಪ್ರಾರಂಭಿಸಿ",
    "Mark Completed": "ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ",
    "Volunteer account awaiting approval": "ಸ್ವಯಂಸೇವಕರ ಖಾತೆಯು ಅನುಮೋದನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ",
    "Your volunteer account has been created, but an administrator has not approved it yet. Your dashboard will become available after approval.":
      "ನಿಮ್ಮ ಸ್ವಯಂಸೇವಕ ಖಾತೆಯನ್ನು ರಚಿಸಲಾಗಿದೆ, ಆದರೆ ನಿರ್ವಾಹಕರು ಇನ್ನೂ ಅನುಮೋದಿಸಿಲ್ಲ. ಅನುಮೋದನೆಯ ನಂತರ ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲಭ್ಯವಾಗುತ್ತದೆ.",

    // Hospital
    "HOSPITAL DASHBOARD": "ಆಸ್ಪತ್ರೆಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "Welcome, Hospital!": "ಸ್ವಾಗತ, ಆಸ್ಪತ್ರೆ ಸಂಸ್ಥೆ!",
    "Coordinate patient assignments and monitor your hospital's connected patients.":
      "ರೋಗಿಗಳ ನಿಯೋಜನೆಗಳನ್ನು ಸಮನ್ವಯಗೊಳಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಆಸ್ಪತ್ರೆಗೆ ಸಂಪರ್ಕ ಹೊಂದಿರುವ ರೋಗಿಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.",
    "Hospital Patients": "ಆಸ್ಪತ್ರೆಯ ರೋಗಿಗಳು",
    "Manage admissions and care oversight.": "ದಾಖಲಾತಿಗಳು ಮತ್ತು ಆರೈಕೆಯ ಮೇಲ್ವಿಚಾರಣೆಯನ್ನು ನಿರ್ವಹಿಸಿ.",
    "Hospital account awaiting approval": "ಆಸ್ಪತ್ರೆಯ ಖಾತೆಯು ಅನುಮೋದನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ",
    "Your hospital account has been created, but an administrator has not approved it yet. Your dashboard will become available after approval.":
      "ನಿಮ್ಮ ಆಸ್ಪತ್ರೆಯ ಖಾತೆಯನ್ನು ರಚಿಸಲಾಗಿದೆ, ಆದರೆ ನಿರ್ವಾಹಕರು ಅದನ್ನು ಇನ್ನೂ ಅನುಮೋದಿಸಿಲ್ಲ. ಅನುಮೋದನೆಯ ನಂತರ ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲಭ್ಯವಾಗುತ್ತದೆ.",

    // Admin
    "ADMIN DASHBOARD": "ನಿರ್ವಾಹಕರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "CareBridge Admin": "ಕೇರ್‌ಬ್ರಿಡ್ಜ್ ನಿರ್ವಾಹಕ",
    "Account Requests": "ಖಾತೆ ವಿನಂತಿಗಳು",
    "Patient assignment manager": "ರೋಗಿ ನಿಯೋಜನೆ ವ್ಯವಸ್ಥಾಪಕ",
    "User Management Directory": "ಬಳಕೆದಾರರ ನಿರ್ವಹಣಾ ಡೈರೆಕ್ಟರಿ",
    "Activity Logs": "ಚಟುವಟಿಕೆ ದಾಖಲೆಗಳು",
    "Approve": "ಅನುಮೋದಿಸಿ",
    "Suspend account": "ಖಾತೆಯನ್ನು ಅಮಾನತುಗೊಳಿಸಿ",
    "Reactivate account": "ಖಾತೆಯನ್ನು ಮರುಸಕ್ರಿಯಗೊಳಿಸಿ",
    "Platform Analytics": "ವೇದಿಕೆಯ ವಿಶ್ಲೇಷಣೆಗಳು",
    "Registered Patients": "ನೋಂದಾಯಿತ ರೋಗಿಗಳು",
    "Approved Professionals": "ಅನುಮೋದಿತ ವೃತ್ತಿಪರರು",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("carebridge_language");
    return saved === "ಕನ್ನಡ" ? "ಕನ್ನಡ" : "English";
  });

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    localStorage.setItem("carebridge_language", newLang);
  };

  const t = (text) => {
    if (!text || typeof text !== "string") return text;
    if (language === "English") return text;

    const langDict = translations[language];
    if (!langDict) return text;

    // Direct lookup
    if (langDict[text]) return langDict[text];

    // Trimmed lookup
    const trimmed = text.trim();
    if (langDict[trimmed]) return langDict[trimmed];

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return fallback if outside provider
    return {
      language: "English",
      setLanguage: () => {},
      t: (text) => text,
    };
  }
  return context;
}

export function LanguageSelector({ style, className = "language-select" }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        ...style,
      }}
    >
      <Globe size={16} />
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label="Select language"
        style={{
          padding: "5px 10px",
          borderRadius: "8px",
          border: "1px solid #dbe4e8",
          background: "#ffffff",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
          outline: "none",
        }}
      >
        <option value="English">English</option>
        <option value="ಕನ್ನಡ">ಕನ್ನಡ (Kannada)</option>
      </select>
    </div>
  );
}

export default LanguageContext;
