import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PM Manager - Team Project & Task Management",
  description: "Manage your team's projects, tasks, and deadlines with ease. Real-time collaboration, status tracking, and progress analytics.",
};

import dbConnect from "@/lib/db";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  await dbConnect().catch(err => {
    console.error("Database connection failed during layout initialization:", err);
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
