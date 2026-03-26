"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { User } from "@/types";

export function useUser() {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("habit_bank_user");
    if (saved) {
      try {
        setActiveUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("habit_bank_user");
      }
    }
    setLoading(false);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    if (!activeUser) return;
    try {
      const user = await fetchApi(`/users/${activeUser.id}`);
      setActiveUser(user);
      localStorage.setItem("habit_bank_user", JSON.stringify(user));
    } catch (err) {
      console.error(err);
    }
  }, [activeUser?.id]);

  const handleUserSelect = (user: any) => {
    setActiveUser(user);
    if (user) localStorage.setItem("habit_bank_user", JSON.stringify(user));
    else localStorage.removeItem("habit_bank_user");
  };

  const updateBuffers = async (buffers: Record<string, number>) => {
    if (!activeUser) return;
    try {
      await fetchApi(`/users/${activeUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({ daily_buffers: buffers })
      });
      await fetchUserProfile();
    } catch (err) { 
      console.error(err); 
    }
  };

  useEffect(() => {
    if (activeUser) {
      const browserOffset = -new Date().getTimezoneOffset();
      if (activeUser.timezone_offset === undefined || activeUser.timezone_offset !== browserOffset) {
        fetchApi(`/users/${activeUser.id}`, {
          method: "PATCH",
          body: JSON.stringify({ timezone_offset: browserOffset })
        }).then(() => {
          fetchUserProfile();
        }).catch(err => console.error("Failed to sync timezone", err));
      }
    }
  }, [activeUser?.id, fetchUserProfile]);

  return {
    activeUser,
    loading,
    fetchUserProfile,
    handleUserSelect,
    updateBuffers
  };
}
