"use client";

import { useEffect, useState } from "react";
import { User as UserIcon, Plus, LogOut, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchApi } from "@/lib/api";
import { Logo } from "./Logo";

type UserProfile = {
  id: string;
  username: string;
};

export function UserSelector({ 
  onUserSelect, 
  activeUser 
}: { 
  onUserSelect: (user: UserProfile | null) => void;
  activeUser: UserProfile | null;
}) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await fetchApi("/users/");
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Connect to Secure_Node failed. Verify backend status.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername) return;
    try {
      const newUser = await fetchApi("/users/", {
        method: "POST",
        body: JSON.stringify({ 
          username: newUsername
        })
      });
      setNewUsername("");
      setShowAddUser(false);
      fetchUsers();
      onUserSelect(newUser);
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  };

  if (!activeUser) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#f8fafc] overflow-hidden">
        {/* Background mesh gradients */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200 blur-[120px] rounded-full" />
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100 blur-[120px] rounded-full" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md space-y-12 z-10"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-white rounded-[2rem] shadow-xl shadow-primary/10 border border-white mb-4">
              <Logo iconOnly className="w-12 h-12" />
            </div>
            <h2 className="text-5xl font-black tracking-tight text-foreground font-heading uppercase">Authorization</h2>
            <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.4em] border-l-2 border-primary pl-4 inline-block leading-none">Verify Core Identity</p>
          </div>

          <div className="grid gap-4">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-xs font-bold uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {users.map(user => (
                <motion.button
                  layout
                  key={user.id}
                  onClick={() => onUserSelect(user)}
                  className="group flex items-center justify-between p-6 bg-white/70 border border-white rounded-[2rem] hover:bg-white transition-all text-left shadow-lg shadow-black/5 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-lg shadow-primary/20">
                      <div className="w-full h-full bg-white rounded-[0.875rem] flex items-center justify-center text-primary font-black text-xl font-heading">
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <span className="text-xl font-black text-foreground block uppercase font-heading">{user.username}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>

            {showAddUser ? (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                onSubmit={handleCreateUser}
                className="p-8 bg-white/80 border border-white rounded-[2.5rem] space-y-6 shadow-2xl backdrop-blur-2xl"
              >
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-primary ml-1 leading-none">Identity ID</label>
                    <input 
                      autoFocus
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      placeholder="ENTER_ID..."
                      className="w-full bg-white/50 border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder-muted-foreground/30 font-bold"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="flex-1 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-muted-foreground hover:bg-black/5 transition-all"
                  >
                    ABORT
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-6 py-4 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20 font-heading"
                  >
                    Initialize_Entity
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.button
                layout
                onClick={() => setShowAddUser(true)}
                className="flex items-center justify-center gap-3 p-8 bg-white/30 border-2 border-dashed border-primary/20 rounded-[2rem] text-primary/60 hover:text-primary hover:border-primary/40 transition-all uppercase text-sm font-black tracking-widest font-heading"
              >
                <Plus className="w-5 h-5" />
                Establish_New_Identity
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-xl sm:rounded-2xl p-1 sm:p-1.5 sm:pr-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-lg shadow-primary/10">
        <div className="w-full h-full bg-white rounded-[0.5rem] sm:rounded-[0.6rem] flex items-center justify-center text-primary font-black text-xs sm:text-sm font-heading">
          {activeUser.username.substring(0, 2).toUpperCase()}
        </div>
      </div>
      <div className="hidden sm:flex flex-col">
        <span className="text-xxs font-black uppercase tracking-[0.2em] text-primary leading-none mb-1">Active_Node</span>
        <span className="text-xs font-black text-foreground leading-none uppercase font-heading">{activeUser.username}</span>
      </div>
    </div>
  );
}
