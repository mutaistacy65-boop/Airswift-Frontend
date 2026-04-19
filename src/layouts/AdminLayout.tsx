"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(storedUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
  }, [user, loading]);

  if (loading) return <p>Loading...</p>;

  if (!user) {
    router.push("/login");
    return null;
  }

  if (user.role.toLowerCase() !== "admin") {
    router.push("/unauthorized");
    return null;
  }

  return children;
}