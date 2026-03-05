"use client";

import { JSX, useState } from "react";
import { Button } from "./ui/button";

export default function LogoutButton(): JSX.Element {
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });

      if (response.ok) {
        localStorage.removeItem("auth_token");
        localStorage.clear();
        window.location.replace("/");
      } else {
        setError("Logout failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Logout
    </Button>
  );
}
