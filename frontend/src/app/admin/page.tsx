"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  Star, 
  Trash2, 
  Check, 
  Plus, 
  Layers, 
  LayoutDashboard,
  MessageSquare,
  Eye,
  EyeOff,
  ShieldCheck,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [activeTab, setActiveTab] = useState<"waitlist" | "testimonials" | "feedback">("waitlist");
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [newT, setNewT] = useState({
    author_name: "",
    author_title: "",
    content: "",
    rating: 5,
    is_published: false
  });
  const [newToken, setNewToken] = useState("");

  // Check for existing token
  useEffect(() => {
    const token = localStorage.getItem("habit_bank_admin_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Verify token with backend
      await fetchApi("/admin/verify", {
        headers: { "X-Admin-Token": adminToken }
      });
      localStorage.setItem("habit_bank_admin_token", adminToken);
      setIsAuthenticated(true);
    } catch (err) {
      alert("Invalid Admin Token");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("habit_bank_admin_token");
    setIsAuthenticated(false);
  };

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      if (activeTab === "waitlist") {
        const data = await fetchApi("/waitlist/");
        setWaitlist(data);
      } else if (activeTab === "testimonials") {
        const data = await fetchApi("/testimonials/all");
        setTestimonials(data);
      } else if (activeTab === "feedback") {
        const data = await fetchApi("/feedback/");
        setFeedback(data);
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message.includes("Unauthorized")) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <motion.form 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={handleLogin}
          className="w-full max-w-md bg-card border border-border p-12 rounded-[3rem] shadow-2xl space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-6 h-6 text-background" />
            </div>
            <h1 className="text-2xl font-black uppercase font-heading tracking-tight">Admin Terminal</h1>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Protocol access required</p>
          </div>

          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="ADMIN_SECRET_KEY"
              value={adminToken}
              onChange={e => setAdminToken(e.target.value)}
              className="w-full p-5 bg-muted border border-border rounded-2xl text-center font-mono text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all"
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary text-background rounded-2xl text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              {loading ? "AUTHENTICATING..." : "INITIALIZE_SESSION"}
            </button>
          </div>
          <div className="text-center">
            <a href="/" className="text-xxs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">← Return_to_Public</a>
          </div>
        </motion.form>
      </div>
    );
  }

  const deleteLead = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetchApi(`/waitlist/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const togglePublish = async (id: string, current: boolean) => {
    try {
      await fetchApi(`/testimonials/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_published: !current })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetchApi(`/testimonials/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const addTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi("/testimonials/", {
        method: "POST",
        body: JSON.stringify(newT)
      });
      setShowAddTestimonial(false);
      setNewT({ author_name: "", author_title: "", content: "", rating: 5, is_published: false });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetchApi(`/feedback/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mini Sidebar */}
      <aside className="w-64 border-r border-border p-8 space-y-8 bg-card/30 backdrop-blur-xl flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-foreground text-background rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">Admin_Node</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab("waitlist")}
            className={cn(
              "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "waitlist" ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            Waitlist_Leads
          </button>
          <button 
            onClick={() => setActiveTab("testimonials")}
            className={cn(
              "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "testimonials" ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Social_Proof
          </button>
          <button 
            onClick={() => setActiveTab("feedback")}
            className={cn(
              "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "feedback" ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground"
            )}
          >
            <Layers className="w-4 h-4" />
            Feed_Payloads
          </button>
        </nav>

        <div className="space-y-4 pt-8 border-t border-border">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all"
          >
            <Check className="w-4 h-4" />
            Deactivate_Session
          </button>
          <a href="/" className="block text-center text-xxs font-black uppercase tracking-widest text-primary hover:underline">← Return_to_Public</a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black uppercase font-heading tracking-tight">
              {activeTab === "waitlist" ? "Waitlist Management" : activeTab === "testimonials" ? "Testimonial Registry" : "User Feedback"}
            </h1>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">
              {activeTab === "waitlist" ? `${waitlist.length} active leads captured` : activeTab === "testimonials" ? `${testimonials.length} reviews in system` : `${feedback.length} user submissions`}
            </p>
          </div>

          {activeTab === "testimonials" && (
            <button 
              onClick={() => setShowAddTestimonial(true)}
              className="px-6 py-3 bg-primary text-background rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Testimonial
            </button>
          )}
        </header>

        {activeTab === "waitlist" && (
          <div className="grid gap-4">
            {waitlist.map(lead => (
              <div key={lead.id} className="p-6 bg-card border border-border rounded-3xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">{lead.email}</h3>
                  <p className="text-xxs text-muted-foreground uppercase tracking-widest mt-1">Joined: {new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => deleteLead(lead.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "testimonials" && (
          <div className="grid gap-4">
            {testimonials.map(t => (
              <div key={t.id} className="p-6 bg-card border border-border rounded-3xl flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold">{t.author_name}</h3>
                    <span className="text-xxs bg-muted px-2 py-0.5 rounded uppercase font-bold text-muted-foreground">{t.author_title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 italic">"{t.content}"</p>
                  <div className="flex items-center gap-1 mt-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("w-3 h-3", i < t.rating ? "fill-primary text-primary" : "text-muted")} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => togglePublish(t.id, t.is_published)}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      t.is_published ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {t.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteTestimonial(t.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="grid gap-4">
            {feedback.map(f => (
              <div key={f.id} className="p-6 bg-card border border-border rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight">{f.user_username}</h3>
                      <p className="text-xxs text-muted-foreground font-bold uppercase tracking-widest">{format(new Date(f.created_at), "MMM d, yyyy @ h:mm a")}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteFeedback(f.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 bg-muted/30 border border-border/50 rounded-2xl">
                  <p className="text-sm font-medium leading-relaxed italic text-foreground/80">"{f.content}"</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Testimonial Modal */}
      <AnimatePresence>
        {showAddTestimonial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddTestimonial(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[3rem] p-12 shadow-2xl space-y-8"
            >
              <h2 className="text-2xl font-black uppercase font-heading tracking-tight">Register Proof</h2>
              <form onSubmit={addTestimonial} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Author Name</label>
                    <input 
                      required
                      value={newT.author_name}
                      onChange={e => setNewT({...newT, author_name: e.target.value})}
                      className="w-full p-4 bg-muted border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Author Title</label>
                    <input 
                      required
                      value={newT.author_title}
                      onChange={e => setNewT({...newT, author_title: e.target.value})}
                      className="w-full p-4 bg-muted border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Testimonial Content</label>
                  <textarea 
                    required
                    value={newT.content}
                    onChange={e => setNewT({...newT, content: e.target.value})}
                    className="w-full p-4 bg-muted border border-border rounded-2xl text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Rating (1-5)</label>
                  <select 
                    value={newT.rating}
                    onChange={e => setNewT({...newT, rating: parseInt(e.target.value)})}
                    className="w-full p-4 bg-muted border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" onClick={() => setShowAddTestimonial(false)}
                    className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-muted/80 transition-all"
                  >
                    Abort_Process
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary text-background rounded-2xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all"
                  >
                    Finalize_Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
