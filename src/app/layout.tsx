import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trainings App",
  description: "Deine Strava-Trainings übersichtlich an einem Ort.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
