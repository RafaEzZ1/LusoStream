// src/components/AuthBootstrap.jsx
"use client";
import { useEffect } from "react";
import { initAuthListeners } from "@/lib/supabaseClient";

export default function AuthBootstrap() {
  useEffect(() => { initAuthListeners(); }, []);
  return null;
}
