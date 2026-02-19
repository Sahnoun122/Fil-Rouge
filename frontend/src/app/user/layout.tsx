"use client";

import { useAuth } from "@/src/hooks/useAuth";

export default function UserDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>User Dashboard</h1>
      <p>Welcome: {user?.fullName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
