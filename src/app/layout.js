import "./globals.css";

export const metadata = {
  title: "CortexBridge",
  description: "Inclusive AI learning platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
