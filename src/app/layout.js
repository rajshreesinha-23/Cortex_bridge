import "./globals.css";
import VoiceCommandNavigator from "./components/VoiceCommandNavigator";
import QuickActionsBar from "./components/QuickActionsBar";

export const metadata = {
  title: "CortexBridge",
  description: "Inclusive AI learning platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <VoiceCommandNavigator />
        <QuickActionsBar />
      </body>
    </html>
  );
}
