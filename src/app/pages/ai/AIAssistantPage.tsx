import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, User, Send, Loader2, Sparkles, Paperclip, Mic, FileText, Settings, Shield, RefreshCw, Zap, AlignLeft, Info, HelpCircle, Layers, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { chatWithAI } from "../../../services/pdfApi";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistantPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm DocNova. I can help you summarize complex documents, extract data using OCR, or automate your PDF workflows. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [model, setModel] = useState("gemini-3.5-flash");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const models = [
    { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite" },
  ];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;

    const userMessageContent = input.trim() || (selectedFile ? `[Attached File: ${selectedFile.name}]` : "");
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: userMessageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const fileToSend = selectedFile;
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const responseText = await chatWithAI([...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      })), fileToSend, model);

      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: responseText };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: `Error: ${error.message || "Failed to communicate with AI."}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Shader effect
  useEffect(() => {
    const canvas = document.getElementById('shader-canvas-ANIMATION_2') as HTMLCanvasElement;
    if (!canvas) return;

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    const observer = new ResizeObserver(syncSize);
    observer.observe(canvas);
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    vec2 center = uv - 0.5;
    center.x *= u_resolution.x / u_resolution.y;
    
    // Background base - dynamic based on theme
    ${isDark ? `vec3 color = vec3(0.02, 0.03, 0.08);` : `vec3 color = vec3(0.96, 0.97, 1.0);`}
    
    // Animated gradient glows
    float glow1 = smoothstep(0.8, 0.0, length(center - vec2(sin(u_time * 0.5) * 0.5, cos(u_time * 0.3) * 0.3)));
    float glow2 = smoothstep(0.7, 0.0, length(center - vec2(cos(u_time * 0.4) * 0.6, sin(u_time * 0.6) * 0.4)));
    
    ${isDark ? `
    color += glow1 * vec3(0.0, 0.2, 0.4) * 0.5;
    color += glow2 * vec3(0.3, 0.0, 0.5) * 0.4;
    ` : `
    // Inverse glows for light mode
    color -= glow1 * vec3(0.0, 0.1, 0.2) * 0.15;
    color -= glow2 * vec3(0.1, 0.0, 0.2) * 0.15;
    `}
    
    // Subtle grid lines
    vec2 grid = fract(uv * 40.0 - 0.5);
    float gridLine = smoothstep(0.02, 0.0, grid.x) + smoothstep(0.02, 0.0, grid.y);
    ${isDark ? `color += gridLine * 0.02;` : `color -= gridLine * 0.03;`}
    
    // Mouse interaction glow
    vec2 mouseNorm = u_mouse / u_resolution;
    vec2 mouseDir = uv - mouseNorm;
    mouseDir.x *= u_resolution.x / u_resolution.y;
    float mouseGlow = smoothstep(0.2, 0.0, length(mouseDir));
    ${isDark ? `color += mouseGlow * vec3(0.0, 0.8, 1.0) * 0.15;` : `color -= mouseGlow * vec3(0.0, 0.1, 0.2) * 0.05;`}

    gl_FragColor = vec4(color, 1.0);
}`;
    function cs(type: number, src: string) {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    const prog = gl.createProgram();
    if (!prog) return;
    const vShader = cs(gl.VERTEX_SHADER, vs);
    const fShader = cs(gl.FRAGMENT_SHADER, fs);
    if (!vShader || !fShader) return;
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;
    function render(t: number) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    }
    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, [isDark]);

  return (
    <div className="absolute inset-0 flex flex-col" style={{
      background: "transparent",
      color: "var(--dn-t1)",
      fontFamily: "'Inter', sans-serif"
    }}>
      <style>{`
        .dn-glass-panel {
            background: ${isDark ? "rgba(15, 15, 20, 0.4)" : "rgba(255, 255, 255, 0.5)"};
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)"};
        }
        
        .dn-glass-panel-elevated {
            background: ${isDark ? "rgba(25, 25, 35, 0.6)" : "rgba(255, 255, 255, 0.75)"};
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
            border: 1px solid ${isDark ? "rgba(37, 99, 235, 0.25)" : "rgba(37, 99, 235, 0.15)"};
            border-top: 1px solid ${isDark ? "rgba(37, 99, 235, 0.4)" : "rgba(37, 99, 235, 0.3)"};
            box-shadow: ${isDark ? "0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(37, 99, 235, 0.1)" : "0 20px 40px rgba(37, 99, 235, 0.08), inset 0 1px 0 rgba(37, 99, 235, 0.1)"};
        }

        .dn-glow-text {
            text-shadow: 0 0 20px ${isDark ? "rgba(37, 99, 235, 0.5)" : "rgba(37, 99, 235, 0.2)"};
        }

        .dn-ai-glow-box {
            position: relative;
            background: ${isDark ? "rgba(5, 20, 36, 0.6)" : "rgba(255, 255, 255, 0.65)"};
            backdrop-filter: blur(12px);
            border-radius: 0.75rem;
            z-index: 1;
        }

        .dn-ai-glow-box::before {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: 0.8rem;
            background: linear-gradient(45deg, rgba(37, 99, 235, 0.4), rgba(168, 85, 247, 0.4), rgba(37, 99, 235, 0.1));
            z-index: -1;
            animation: borderRotate 4s linear infinite;
        }

        @keyframes borderRotate {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .dn-custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .dn-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .dn-custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.15)"};
            border-radius: 4px;
        }
        .dn-custom-scrollbar:hover::-webkit-scrollbar-thumb {
            background: ${isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.25)"};
        }
      `}</style>

      {/* Background Shader */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className={`absolute inset-0 w-full h-full ${isDark ? "opacity-60" : "opacity-100"}`} style={{ display: 'block' }}>
          <canvas id="shader-canvas-ANIMATION_2" style={{ display: 'block', width: '100%', height: '100%' }} width="1280" height="1024"></canvas>
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden w-full relative z-10 pt-[60px]">

        {/* Center Panel: Chat Canvas */}
        <section className="flex-1 flex flex-col relative min-w-0 px-4 md:px-8 pt-6 pb-4 mx-auto w-full max-w-4xl h-full">

          {messages.length === 1 ? (
            <div className="flex-1 flex flex-col items-center justify-center mb-8 w-full max-w-3xl mx-auto">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="w-16 h-16 mb-6 relative flex items-center justify-center">
                <div className="absolute inset-0 w-full h-full" id="animated-svg-ANIMATION_3" style={{ display: 'block' }}>
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient cx="50%" cy="50%" id="glow" r="50%">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8">
                          <animate attributeName="stop-opacity" dur="3s" repeatCount="indefinite" values="0.8;0.4;0.8"></animate>
                        </stop>
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0"></stop>
                      </radialGradient>
                      <filter id="blur">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="8"></feGaussianBlur>
                      </filter>
                    </defs>
                    <circle cx="100" cy="100" fill="url(#glow)" filter="url(#blur)" r="80">
                      <animateTransform additive="sum" attributeName="transform" dur="4s" repeatCount="indefinite" type="scale" values="1;1.1;1"></animateTransform>
                    </circle>
                    <circle cx="100" cy="100" fill="#2563eb" r="40">
                      <animate attributeName="r" dur="2s" repeatCount="indefinite" values="40;42;40"></animate>
                    </circle>
                    <path d="M100 70 L108 92 L130 100 L108 108 L100 130 L92 108 L70 100 L92 92 Z" fill="white"></path>
                  </svg>
                </div>
              </motion.div>

              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-2xl md:text-3xl font-bold text-[var(--dn-t1)] mb-3 text-center tracking-tight">
                How can I help you today?
              </motion.h1>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm md:text-base text-[var(--dn-t3)] text-center max-w-lg mb-10 leading-relaxed">
                I'm DocNova, your intelligent co-pilot. I can summarize, convert, extract OCR data, or explain your PDF workflows.
              </motion.p>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <button onClick={() => setInput("Summarize my PDF file")} className="p-4 rounded-2xl dn-glass-panel bg-[var(--dn-bg-card)] border border-[var(--dn-border)] shadow-sm hover:shadow-md hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shadow-sm">
                      <FileText size={18} />
                    </div>
                    <span className="font-semibold text-[var(--dn-t1)] text-sm">Summarize</span>
                  </div>
                  <p className="text-xs text-[var(--dn-t3)] leading-relaxed">Get instant insights and extract key data from long PDFs</p>
                </button>
                <button onClick={() => setInput("Convert my PDF to Word")} className="p-4 rounded-2xl dn-glass-panel bg-[var(--dn-bg-card)] border border-[var(--dn-border)] shadow-sm hover:shadow-md hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shadow-sm">
                      <RefreshCw size={18} />
                    </div>
                    <span className="font-semibold text-[var(--dn-t1)] text-sm">Convert Format</span>
                  </div>
                  <p className="text-xs text-[var(--dn-t3)] leading-relaxed">Seamlessly transform PDF files into editable formats</p>
                </button>
                <button onClick={() => setInput("Help me edit this PDF")} className="p-4 rounded-2xl dn-glass-panel bg-[var(--dn-bg-card)] border border-[var(--dn-border)] shadow-sm hover:shadow-md hover:border-green-500/50 hover:bg-green-500/5 transition-all text-left group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-500 shadow-sm">
                      <Zap size={18} />
                    </div>
                    <span className="font-semibold text-[var(--dn-t1)] text-sm">Edit & Modify</span>
                  </div>
                  <p className="text-xs text-[var(--dn-t3)] leading-relaxed">Merge, split, or rearrange pages instantly</p>
                </button>
                <button onClick={() => setInput("How to secure my document?")} className="p-4 rounded-2xl dn-glass-panel bg-[var(--dn-bg-card)] border border-[var(--dn-border)] shadow-sm hover:shadow-md hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-left group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 shadow-sm">
                      <Shield size={18} />
                    </div>
                    <span className="font-semibold text-[var(--dn-t1)] text-sm">Protect & Secure</span>
                  </div>
                  <p className="text-xs text-[var(--dn-t3)] leading-relaxed">Add passwords and redact sensitive information</p>
                </button>
              </motion.div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto dn-custom-scrollbar px-2 md:px-6 space-y-6 mb-6">
              <AnimatePresence>
                {messages.map((msg, index) => {
                  if (index === 0) return null; // Skip the default welcome message

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${msg.role === "user" ? "bg-blue-600" : "bg-[var(--dn-bg-subtle)] border border-[var(--dn-border2)]"}`}>
                        {msg.role === "user" ? <User size={16} color="#fff" /> : <Sparkles size={16} className="text-blue-500" />}
                      </div>

                      <div className={`
                        p-4 text-[15px] leading-relaxed max-w-[85%] whitespace-pre-wrap shadow-sm
                        ${msg.role === "user"
                          ? "bg-[var(--dn-bg-card)] border border-[var(--dn-border)] text-[var(--dn-t1)] rounded-2xl rounded-tr-sm shadow-md"
                          : "bg-transparent text-[var(--dn-t1)]"
                        }
                      `}>
                        {msg.content}
                      </div>
                    </motion.div>
                  )
                })}

                {isLoading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[var(--dn-bg-subtle)] border border-[var(--dn-border2)] flex items-center justify-center shrink-0 mt-1">
                      <Sparkles size={16} className="text-blue-500" />
                    </div>
                    <div className="p-4 flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}

          {/* Input Area Container */}
          <div className="w-full mx-auto mt-auto shrink-0 relative z-20 max-w-3xl">
            {/* Quick Suggestion Chips - Only show when chat is active */}
            {messages.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <button onClick={() => setInput("Summarize a PDF")} className="px-4 py-1.5 rounded-full bg-[var(--dn-bg-card)] backdrop-blur-md border border-[var(--dn-border)] text-[12px] font-medium text-[var(--dn-t2)] hover:text-[var(--dn-t1)] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all shadow-sm hover:shadow-md">Summarize a PDF</button>
                <button onClick={() => setInput("Explain PDF tools")} className="px-4 py-1.5 rounded-full bg-[var(--dn-bg-card)] backdrop-blur-md border border-[var(--dn-border)] text-[12px] font-medium text-[var(--dn-t2)] hover:text-[var(--dn-t1)] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all shadow-sm hover:shadow-md">Explain PDF tools</button>
                <button onClick={() => setInput("Convert a document")} className="px-4 py-1.5 rounded-full bg-[var(--dn-bg-card)] backdrop-blur-md border border-[var(--dn-border)] text-[12px] font-medium text-[var(--dn-t2)] hover:text-[var(--dn-t1)] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all shadow-sm hover:shadow-md hidden sm:inline-block">Convert a document</button>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="dn-glass-panel rounded-2xl p-3 flex flex-col gap-2 relative group shadow-2xl border border-[var(--dn-border)] bg-[var(--dn-bg-card)]/90">
              {selectedFile && (
                <div className="flex items-center gap-2 bg-[var(--dn-bg-subtle)] border border-[var(--dn-border2)] rounded-lg px-3 py-1.5 mb-1 self-start ml-1">
                  <FileText size={14} className="text-blue-500" />
                  <span className="text-xs text-[var(--dn-t1)] max-w-[200px] truncate font-medium">{selectedFile.name}</span>
                  <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-[var(--dn-t3)] hover:text-red-400 ml-1 p-0.5 rounded-full hover:bg-red-500/10 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                className="w-full bg-transparent border-none focus:ring-0 text-[var(--dn-t1)] text-[15px] resize-none py-2 px-3 dn-custom-scrollbar placeholder:text-[var(--dn-t3)]/70 leading-relaxed"
                placeholder="Ask DocNova about documents, formatting, PDF tools, OCR, or workflows..."
                rows={1}
                style={{ outline: "none", minHeight: "44px", maxHeight: "200px" }}
              />

              <div className="flex items-center justify-between w-full pt-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedFile(file);
                    }}
                  />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-2 transition-colors rounded-xl hover:bg-[var(--dn-border2)] shrink-0 ${selectedFile ? 'text-blue-500 bg-blue-500/10' : 'text-[var(--dn-t3)] hover:text-[var(--dn-t1)]'}`}>
                    <Paperclip size={18} />
                  </button>

                  {/* Custom AI Model Selector */}
                  <div className="relative flex items-center" ref={modelDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                      className="flex items-center gap-2 bg-transparent border border-transparent hover:border-[var(--dn-border2)] hover:bg-[var(--dn-bg-subtle)] focus:border-[var(--dn-border)] focus:bg-[var(--dn-bg-subtle)] text-[var(--dn-t2)] font-medium text-[12px] rounded-lg pl-3 pr-2 py-1.5 outline-none transition-all cursor-pointer"
                    >
                      <Sparkles size={14} className="text-blue-500" />
                      <span>{models.find(m => m.id === model)?.name || "Gemini 3.5 Flash"}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 text-[var(--dn-t3)] ${isModelDropdownOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                    </button>

                    <AnimatePresence>
                      {isModelDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full left-0 mb-2 w-[180px] bg-[var(--dn-bg)]/95 backdrop-blur-md border border-[var(--dn-border2)] shadow-2xl rounded-xl overflow-hidden z-50"
                        >
                          <div className="py-1.5 flex flex-col">
                            {models.map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setModel(m.id);
                                  setIsModelDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-[12px] transition-colors flex items-center justify-between ${model === m.id ? 'bg-blue-500/10 text-blue-500 font-medium' : 'text-[var(--dn-t2)] hover:bg-[var(--dn-bg-subtle)] hover:text-[var(--dn-t1)]'}`}
                              >
                                <span>{m.name}</span>
                                {model === m.id && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" className="p-2 text-[var(--dn-t3)] hover:text-[var(--dn-t1)] transition-colors rounded-xl hover:bg-[var(--dn-border2)]">
                    <Mic size={18} />
                  </button>
                  <button
                    type="submit"
                    disabled={(!input.trim() && !selectedFile) || isLoading}
                    className={`p-2 rounded-xl transition-all ${(!input.trim() && !selectedFile) || isLoading ? 'bg-[var(--dn-bg-subtle)] text-[var(--dn-t4)] cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}
                  >
                    <Send size={18} className={(!input.trim() && !selectedFile) || isLoading ? '' : 'translate-x-0.5 -translate-y-0.5'} />
                  </button>
                </div>
              </div>
            </form>

            <div className="text-center mt-4">
              <p className="text-[11px] text-[var(--dn-t4)]">DocNova can make mistakes. Consider verifying important information.</p>
            </div>
          </div>
        </section>

        {/* Right Panel: AI Capabilities */}
        <aside className="w-72 flex-shrink-0 border-l border-[var(--dn-border2)] bg-[var(--dn-bg-subtle)]/60 backdrop-blur-3xl p-6 hidden xl:flex flex-col z-10 overflow-y-auto dn-custom-scrollbar">
          <h3 className="text-base md:text-lg text-[var(--dn-t1)] font-semibold mb-6 flex items-center gap-2">
            <Zap className="text-purple-500" size={20} />
            AI Capabilities
          </h3>

          <ul className="space-y-5 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[1px] before:bg-[var(--dn-border2)]/60">
            <li className="relative pl-8">
              <div className="absolute left-[7.5px] top-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
              <span className="text-sm text-[var(--dn-t1)] font-medium block mb-1">Understand documents</span>
              <span className="text-xs text-[var(--dn-t3)] block leading-tight">Extract key data and summaries from any PDF</span>
            </li>
            <li className="relative pl-8">
              <div className="absolute left-[7.5px] top-1.5 w-2 h-2 rounded-full bg-[var(--dn-bg)] border border-[var(--dn-border2)]"></div>
              <span className="text-sm text-[var(--dn-t1)] font-medium block mb-1">Explain tools</span>
              <span className="text-xs text-[var(--dn-t3)] block leading-tight">Get step-by-step guidance on complex formatting</span>
            </li>
            <li className="relative pl-8">
              <div className="absolute left-[7.5px] top-1.5 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
              <span className="text-sm text-[var(--dn-t1)] font-medium block mb-1">Recommend workflows</span>
              <span className="text-xs text-[var(--dn-t3)] block leading-tight">Automate repetitive document tasks</span>
            </li>
            <li className="relative pl-8">
              <div className="absolute left-[7.5px] top-1.5 w-2 h-2 rounded-full bg-[var(--dn-bg)] border border-[var(--dn-border2)]"></div>
              <span className="text-sm text-[var(--dn-t1)] font-medium block mb-1">PDF conversion</span>
              <span className="text-xs text-[var(--dn-t3)] block leading-tight">Seamlessly transform formats without losing structure</span>
            </li>
            <li className="relative pl-8">
              <div className="absolute left-[7.5px] top-1.5 w-2 h-2 rounded-full bg-[var(--dn-bg)] border border-[var(--dn-border2)]"></div>
              <span className="text-sm text-[var(--dn-t1)] font-medium block mb-1">Security guidance</span>
              <span className="text-xs text-[var(--dn-t3)] block leading-tight">Learn how to redact and protect sensitive info</span>
            </li>
          </ul>

          <div className="mt-auto pt-8">
            <div className="p-4 rounded-xl dn-glass-panel bg-gradient-to-b from-transparent to-blue-500/5 border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-xs text-[var(--dn-t1)] font-semibold uppercase tracking-wider">System Status</span>
              </div>
              <p className="text-xs text-[var(--dn-t3)]">All AI models operational. Latency &lt; 50ms.</p>
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}
