"use client";

import { useState, useEffect } from "react";
import { User as UserIcon, Settings as SettingsIcon, Clock, Trash2, CheckCircle2, Plus, X, Bot } from "lucide-react";
import { TimezoneSetting } from "@/components/dashboard/TimezoneSetting";
import { fetchApi } from "@/lib/api";
import { User } from "@/types";

interface SettingsViewProps {
  activeUser: User;
  fetchUserProfile: () => void;
  fetchAgenda: () => void;
  handleUserSelect: (user: User | null) => void;
  updateBuffers: (buffers: Record<string, number>) => void;
}

export function SettingsView({
  activeUser,
  fetchUserProfile,
  fetchAgenda,
  handleUserSelect,
  updateBuffers
}: SettingsViewProps) {
  // Buffer editing state
  const [newBufferName, setNewBufferName] = useState("");
  const [newBufferMins, setNewBufferMins] = useState("");
  const [newBufferUnit, setNewBufferUnit] = useState("mins");
  const [editingBufferName, setEditingBufferName] = useState<string | null>(null);
  
  // AI Settings State
  const [aiProvider, setAiProvider] = useState("openai");
  const [aiKey, setAiKey] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [aiUrl, setAiUrl] = useState("");
  const [aiSaved, setAiSaved] = useState(false);

  useEffect(() => {
    setAiProvider(localStorage.getItem("habitbank_ai_provider") || "openai");
    setAiKey(localStorage.getItem("habitbank_ai_key") || "");
    setAiModel(localStorage.getItem("habitbank_ai_model") || "");
    setAiUrl(localStorage.getItem("habitbank_ai_url") || "");
  }, []);

  const saveAiSettings = () => {
    localStorage.setItem("habitbank_ai_provider", aiProvider);
    localStorage.setItem("habitbank_ai_key", aiKey);
    localStorage.setItem("habitbank_ai_model", aiModel);
    localStorage.setItem("habitbank_ai_url", aiUrl);
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-12">
      <h2 className="text-3xl font-black uppercase tracking-tight font-heading">Core Configuration</h2>
      
      <div className="space-y-8">
        <section className="p-8 bg-card border border-border rounded-[2.5rem] space-y-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight font-heading text-foreground">AI Configuration (BYOK)</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Keys are strictly local</p>
            </div>
          </div>
          
          <div className="grid gap-6 pt-6 border-t border-border/50">
            <div className="grid gap-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Provider Engine</label>
              <select 
                value={aiProvider} 
                onChange={e => setAiProvider(e.target.value)} 
                className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-foreground font-black uppercase tracking-widest appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google-gla">Google Gemini</option>
                <option value="custom">Custom / Ollama</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">API Key</label>
              <input 
                type="password" 
                value={aiKey} 
                onChange={e => setAiKey(e.target.value)} 
                placeholder="sk-..."
                className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/30"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Model Name (Optional)</label>
              <input 
                type="text" 
                value={aiModel} 
                onChange={e => setAiModel(e.target.value)} 
                placeholder="e.g. gpt-4o, claude-3-5-sonnet-latest, llama3"
                className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/30"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Base URL (Optional)</label>
              <input 
                type="url" 
                value={aiUrl} 
                onChange={e => setAiUrl(e.target.value)} 
                placeholder="e.g. http://localhost:11434/v1"
                className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/30"
              />
            </div>
            <button 
              onClick={saveAiSettings} 
              className="mt-2 w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl hover:brightness-110 active:scale-95 transition-all"
            >
              {aiSaved ? "Secured Locally" : "Save Credentials"}
            </button>
          </div>
        </section>

        <section className="p-8 bg-card border border-border rounded-3xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <UserIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase tracking-tight font-heading">Identity Profile</h3>
              <p className="text-xxs font-bold text-muted-foreground uppercase tracking-widest">Secure Node: {activeUser.id}</p>
            </div>
          </div>
          
          <div className="grid gap-6 pt-4 border-t border-border">
            <div className="grid gap-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Identity ID</label>
              <div className="p-4 bg-muted/50 border border-border rounded-2xl font-mono text-sm">{activeUser.username}</div>
            </div>
          </div>
        </section>

        <section id="temporal-protocol" className="p-8 bg-card border border-border rounded-3xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <SettingsIcon className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase tracking-tight font-heading">Temporal Protocol</h3>
              <p className="text-xxs font-bold text-muted-foreground uppercase tracking-widest">System timing preferences</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
            <div className="grid gap-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Day Start Hour (0-23)</label>
              <select 
                value={activeUser.day_start_hour}
                onChange={async (e) => {
                  try {
                    await fetchApi(`/users/${activeUser.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ day_start_hour: parseInt(e.target.value) })
                    });
                    fetchUserProfile();
                  } catch (err) { console.error(err); }
                }}
                className="p-4 bg-muted/50 border border-border rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i}>{i}:00 {i < 12 ? 'AM' : 'PM'}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Week Start Day</label>
              <select 
                value={activeUser.week_start_day}
                onChange={async (e) => {
                  try {
                    await fetchApi(`/users/${activeUser.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ week_start_day: parseInt(e.target.value) })
                    });
                    fetchUserProfile();
                  } catch (err) { console.error(err); }
                }}
                className="p-4 bg-muted/50 border border-border rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Surplus Fill Direction</label>
              <select 
                value={activeUser.fill_direction || "start_date"}
                onChange={async (e) => {
                  try {
                    await fetchApi(`/users/${activeUser.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ fill_direction: e.target.value })
                    });
                    fetchUserProfile();
                    fetchAgenda();
                  } catch (err) { console.error(err); }
                }}
                className="p-4 bg-muted/50 border border-border rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="start_date">From Genesis (Oldest First)</option>
                <option value="today">From Today (Closest First)</option>
              </select>
            </div>
            <TimezoneSetting user={activeUser} onUpdate={fetchUserProfile} />
          </div>
        </section>

        <section className="p-8 bg-card border border-border rounded-3xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase tracking-tight font-heading">Temporal Deductions</h3>
              <p className="text-xxs font-bold text-muted-foreground uppercase tracking-widest">Daily capacity buffers</p>
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="grid gap-3">
              {Object.entries(activeUser.daily_buffers).map(([name, seconds]) => {
                const val = Number(seconds);
                const display = val >= 3600 ? `${(val/3600).toFixed(1)} HRS` : val >= 60 ? `${(val/60).toFixed(0)} MINS` : `${val} SECS`;
                return (
                  <div key={name} className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-2xl group">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest">{name}</span>
                      <span className="text-xs font-mono text-primary font-bold">{display}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setEditingBufferName(name);
                          setNewBufferName(name);
                          if (val >= 3600) {
                            setNewBufferMins((val/3600).toString());
                            setNewBufferUnit("hours");
                          } else if (val >= 60) {
                            setNewBufferMins((val/60).toString());
                            setNewBufferUnit("mins");
                          } else {
                            setNewBufferMins(val.toString());
                            setNewBufferUnit("secs");
                          }
                        }}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          const newBuffers = { ...activeUser.daily_buffers };
                          delete newBuffers[name];
                          updateBuffers(newBuffers);
                        }}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col md:flex-row gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <input 
                placeholder="BUFFER_NAME"
                value={newBufferName}
                onChange={(e) => setNewBufferName(e.target.value.toUpperCase())}
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-xs font-mono font-bold focus:ring-1 ring-primary outline-none uppercase"
              />
              <div className="flex gap-2">
                <input 
                  type="number"
                  placeholder="VALUE"
                  value={newBufferMins}
                  onChange={(e) => setNewBufferMins(e.target.value)}
                  className="w-24 bg-background border border-border rounded-xl px-4 py-2 text-xs font-mono w-full focus:ring-1 ring-primary outline-none"
                />
                <select 
                  value={newBufferUnit}
                  onChange={(e) => setNewBufferUnit(e.target.value)}
                  className="bg-background border border-border rounded-xl px-2 py-2 text-xs font-mono font-bold focus:ring-1 ring-primary outline-none"
                >
                  <option value="secs">SECS</option>
                  <option value="mins">MINS</option>
                  <option value="hours">HOURS</option>
                </select>
                <button 
                  onClick={() => {
                    if (newBufferName && newBufferMins) {
                      let val = parseFloat(newBufferMins);
                      if (newBufferUnit === "mins") val *= 60;
                      else if (newBufferUnit === "hours") val *= 3600;
                      
                      const newBuffers = { ...activeUser.daily_buffers };
                      
                      if (editingBufferName && editingBufferName !== newBufferName) {
                        delete newBuffers[editingBufferName];
                      }

                      if (editingBufferName === newBufferName) {
                        newBuffers[newBufferName] = Math.round(val);
                      } else {
                        const existing = newBuffers[newBufferName] || 0;
                        newBuffers[newBufferName] = Math.round(existing + val);
                      }
                      
                      updateBuffers(newBuffers);
                      setNewBufferName("");
                      setNewBufferMins("");
                      setEditingBufferName(null);
                    }
                  }}
                  className="bg-primary text-primary-foreground p-3 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                >
                  {editingBufferName ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
                {editingBufferName && (
                  <button 
                    onClick={() => {
                      setEditingBufferName(null);
                      setNewBufferName("");
                      setNewBufferMins("");
                    }}
                    className="bg-muted text-muted-foreground p-3 rounded-xl hover:bg-muted/80 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="pt-8 flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-destructive">Termination Protocol</h3>
            <p className="text-xxs text-muted-foreground uppercase font-medium">Reset this session and logout</p>
          </div>
          <button 
            onClick={() => handleUserSelect(null)}
            className="px-6 py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-destructive hover:text-white transition-all"
          >
            Terminate_Session
          </button>
        </section>
      </div>
    </div>
  );
}
