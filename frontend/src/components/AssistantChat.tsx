"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Volume2 } from 'lucide-react';
import { AgendaItem } from '@/types';

export function AssistantChat({ activeUser, agenda }: { activeUser: any, agenda: any }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string, toolCall?: any}[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListen = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
      setInput(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    if (isListening) recognition.stop();
    else recognition.start();
  };

  const speak = (text: string) => {
    if (!voiceMode || !('speechSynthesis' in window) || !text.trim()) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: "user", content: input }];
    setMessages(newMsgs);
    setInput("");

    const provider = localStorage.getItem("habitbank_ai_provider") || "openai";
    const apiKey = localStorage.getItem("habitbank_ai_key") || "";
    const aiModel = localStorage.getItem("habitbank_ai_model") || "";
    const aiUrl = localStorage.getItem("habitbank_ai_url") || "";

    if (!apiKey && provider !== "custom") {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Missing API Key. Please configure your BYOK settings in the Core Configuration tab." }]);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AI-Provider": provider,
          "X-AI-Key": apiKey,
          "X-AI-Model": aiModel,
          "X-AI-Url": aiUrl
        },
        body: JSON.stringify({ user_id: activeUser.id, messages: newMsgs })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      // Add empty assistant message to stream into
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.type === 'text') {
                aiText += data.content;
                setMessages(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length-1];
                  if (last?.role === "assistant" && !last.toolCall) {
                    last.content = aiText;
                  } else {
                    updated.push({ role: "assistant", content: aiText });
                  }
                  return updated;
                });
              } else if (data.type === 'tool') {
                // Render generative UI card
                setMessages(prev => [...prev, { role: "assistant", content: "", toolCall: data }]);
              } else if (data.type === 'error') {
                setMessages(prev => [...prev, { role: "assistant", content: `⚠️ Error: ${data.content}` }]);
              }
            } catch (e) {
              console.error("Failed to parse SSE chunk", e);
            }
          }
        }
      }
      speak(aiText);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Failed to connect to AI Ledger Engine." }]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-card rounded-[3rem] border border-border overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-card to-transparent pointer-events-none z-10 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground font-heading">Neural Ledger Assistant</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Interactive AI Terminal</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pt-24 space-y-8 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
            <Mic className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Voice or Text Command</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.toolCall ? (
              <div className="bg-background border border-border shadow-xl p-6 rounded-[2rem] w-full max-w-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Send className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground font-heading">
                    {msg.toolCall.name.replace(/_/g, ' ')}
                  </h3>
                </div>
                
                <div className="space-y-3 mb-6 bg-muted/30 p-4 rounded-2xl">
                  {Object.entries(msg.toolCall.args).map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{k}</span>
                      <span className="text-sm font-black text-foreground font-mono">{String(v)}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
                  Execute Command
                </button>
              </div>
            ) : msg.content ? (
              <div className={`p-5 rounded-[2rem] max-w-[85%] text-sm sm:text-base font-bold shadow-md ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                  : 'bg-background border border-border text-foreground rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            ) : null}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-card border-t border-border/50 flex items-center gap-4 relative z-20">
        <button 
          onClick={() => setVoiceMode(!voiceMode)} 
          className={`p-4 rounded-2xl transition-all ${voiceMode ? 'bg-primary/10 text-primary shadow-inner border border-primary/20' : 'bg-background text-muted-foreground border border-border'}`}
          title="Toggle Text-to-Speech (TTS)"
        >
          <Volume2 className="w-5 h-5" />
        </button>
        <button 
          onClick={toggleListen} 
          className={`p-4 rounded-2xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-background text-muted-foreground border border-border hover:text-foreground'}`}
          title="Dictate (STT)"
        >
          <Mic className="w-5 h-5" />
        </button>
        
        <div className="flex-1 relative">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Command the ledger..." 
            className="w-full bg-background border border-border rounded-[2rem] pl-6 pr-16 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-bold"
          />
          <button 
            onClick={sendMessage} 
            disabled={!input.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
