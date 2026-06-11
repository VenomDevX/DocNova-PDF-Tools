import { useState } from "react";
import { Link } from "react-router";
import { Eye, EyeOff, ArrowLeft, CheckCircle2, Zap, Shield, FileOutput } from "lucide-react";

export default function AuthPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showForgot, setShowForgot] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const p = e.target.value;
    let strength = 0;
    if (p.length > 0) strength += 1;
    if (p.length >= 8) strength += 1;
    if (p.match(/[a-z]/) && p.match(/[A-Z]/)) strength += 1;
    if (p.match(/\d/) || p.match(/[^a-zA-Z\d]/)) strength += 1;
    setPasswordStrength(p.length === 0 ? 0 : strength);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setShowForgot(false);
    setResetSuccess(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row" style={{ background: "var(--dn-bg)", color: "var(--dn-t1)", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .dn-auth-btn-primary {
          background: #2563eb;
          color: #fff;
          border-radius: 6px;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .dn-auth-btn-primary:hover {
          background: #1d4ed8;
          box-shadow: 0 4px 12px rgba(37,99,235,0.25);
        }
        .dn-auth-btn-primary:active {
          transform: scale(0.98);
          background: #1e40af;
        }
        .dn-auth-btn-primary:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--dn-bg), 0 0 0 4px #3b82f6;
        }

        .dn-auth-btn-social {
          background: var(--dn-bg);
          border: 1px solid var(--dn-border);
          border-radius: 6px;
          color: var(--dn-t1);
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .dn-auth-btn-social:hover {
          background: rgba(37,99,235,0.05);
          border-color: #64748b;
        }
        .dn-auth-btn-social:active {
          transform: scale(0.98);
        }
        .dn-auth-btn-social:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--dn-bg), 0 0 0 4px #3b82f6;
        }

        .dn-auth-btn-skip {
          background: transparent;
          color: var(--dn-t1);
          border: 1px solid var(--dn-border);
          border-radius: 4px;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .dn-auth-btn-skip:hover {
          background: rgba(37,99,235,0.08);
          border-color: #3b82f6;
          color: #1d4ed8;
        }
        .dn-auth-btn-skip:active {
          transform: scale(0.98);
        }
        .dn-auth-btn-skip:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--dn-bg), 0 0 0 4px #3b82f6;
        }

        .dn-auth-tab {
          transition: all 0.15s ease;
          cursor: pointer;
          position: relative;
          color: var(--dn-t3);
        }
        .dn-auth-tab:hover {
          background: rgba(37,99,235,0.04);
        }
        .dn-auth-tab::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #2563eb;
          transform: scaleX(0);
          transition: transform 0.15s ease;
        }
        .dn-auth-tab-active {
          color: #2563eb;
          font-weight: 600;
        }
        .dn-auth-tab-active::after {
          transform: scaleX(1);
        }

        .dn-auth-link {
          transition: all 0.15s ease;
          cursor: pointer;
          color: var(--dn-t3);
        }
        .dn-auth-link:hover {
          text-decoration: underline;
          color: #2563eb !important;
        }
        
        .dn-auth-link-primary {
          transition: all 0.15s ease;
          cursor: pointer;
          color: #2563eb;
        }
        .dn-auth-link-primary:hover {
          text-decoration: underline;
          color: #1d4ed8;
        }

        .dn-auth-icon-btn {
          transition: all 0.15s ease;
          cursor: pointer;
          border-radius: 4px;
          padding: 2px;
          color: var(--dn-t3);
        }
        .dn-auth-icon-btn:hover {
          background: rgba(37,99,235,0.1);
          color: #2563eb !important;
        }

        .dn-auth-checkbox {
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .dn-auth-checkbox:hover {
          border-color: #3b82f6;
        }
        .dn-auth-checkbox:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--dn-bg), 0 0 0 4px #3b82f6;
        }
        .dn-auth-checkbox-label {
          cursor: pointer;
          transition: all 0.15s ease;
          color: var(--dn-t2);
        }
        .dn-auth-checkbox-label:hover {
          color: var(--dn-t1) !important;
        }

        .dn-auth-input {
          background: var(--dn-bg-input);
          border: 1px solid var(--dn-border);
          border-radius: 6px;
          color: var(--dn-t1);
          transition: all 0.15s ease;
        }
        .dn-auth-input:hover {
          border-color: #64748b;
        }
        .dn-auth-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
          outline: none;
        }
      `}</style>

      {/* LEFT PANEL: Brand Side */}
      <div className="hidden md:flex md:w-1/2 flex-col p-[64px] justify-between relative overflow-hidden" style={{ background: "#0A0F1E", color: "#fff" }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
        
        <div className="z-10 flex items-center gap-3">
          <img src="/logo.svg" alt="DocNova Logo" style={{ width: "32px", height: "32px" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>DocNova</h1>
        </div>

        <div className="z-10 max-w-lg mt-24">
          <h2 style={{ fontSize: "36px", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: "16px" }}>Document intelligence built for precision.</h2>
          <p style={{ fontSize: "16px", color: "#94a3b8", marginBottom: "32px", maxWidth: "400px", lineHeight: 1.6 }}>Trusted by enterprise legal, medical, and financial teams to process complex data with surgical accuracy.</p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px" }}>
            <li className="flex items-center gap-3">
              <CheckCircle2 color="#10B981" fill="#10B981" fillOpacity={0.1} />
              <span style={{ fontSize: "16px" }}>Source-cited extractions</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 color="#10B981" fill="#10B981" fillOpacity={0.1} />
              <span style={{ fontSize: "16px" }}>No model training required</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 color="#10B981" fill="#10B981" fillOpacity={0.1} />
              <span style={{ fontSize: "16px" }}>SOC 2 Type II Certified</span>
            </li>
          </ul>
        </div>

        <div className="z-10 max-w-md w-full" style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid #1E293B", borderRadius: "4px", padding: "20px" }}>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0" style={{ color: "#3b82f6" }}>
                <Zap size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0", marginBottom: "2px" }}>Fast PDF compression</h4>
                <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.4 }}>Reduce file size instantly without compromising on document quality.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0" style={{ color: "#10b981" }}>
                <Shield size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0", marginBottom: "2px" }}>Secure document processing</h4>
                <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.4 }}>Files are processed in isolated environments and never permanently stored.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0" style={{ color: "#a855f7" }}>
                <FileOutput size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0", marginBottom: "2px" }}>Free tools, no watermarks</h4>
                <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.4 }}>Access 38+ essential PDF tools with zero watermarks or hidden limits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Auth Form Side */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center p-[24px] overflow-y-auto" style={{ background: "var(--dn-bg)" }}>
        
        {/* Mobile Header */}
        <div className="md:hidden flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <img src="/logo.svg" alt="DocNova Logo" style={{ width: "24px", height: "24px" }} />
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--dn-t1)" }}>DocNova</h1>
          </div>
          <p style={{ fontSize: "14px", color: "var(--dn-t3)", textAlign: "center" }}>Document intelligence built for precision.</p>
        </div>

        <div className="w-full max-w-[400px] shadow-md overflow-hidden" style={{ background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", borderRadius: "6px" }}>
          
          {/* Tabs */}
          {!showForgot && !resetSuccess && (
            <div className="flex" style={{ borderBottom: "1px solid var(--dn-border)", background: "var(--dn-bg-card)" }}>
              <button 
                onClick={() => setTab("signin")}
                className={`flex-1 py-4 text-center text-[12px] tracking-wider dn-auth-tab ${tab === "signin" ? "dn-auth-tab-active" : ""}`}
              >SIGN IN</button>
              <button 
                onClick={() => setTab("signup")}
                className={`flex-1 py-4 text-center text-[12px] tracking-wider dn-auth-tab ${tab === "signup" ? "dn-auth-tab-active" : ""}`}
              >SIGN UP</button>
            </div>
          )}

          <div className="p-[32px]">
            {/* SIGN IN FORM */}
            {!showForgot && !resetSuccess && tab === "signin" && (
              <div className="space-y-[24px]">
                <div className="space-y-[12px]">
                  <button className="w-full h-[40px] flex items-center justify-center gap-2 font-medium dn-auth-btn-social">
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                    Continue with Google
                  </button>
                  <button className="w-full h-[40px] flex items-center justify-center gap-2 font-medium dn-auth-btn-social">
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 21 21">
                      <path d="M1 1h9v9H1z" fill="#f25022"></path>
                      <path d="M1 11h9v9H1z" fill="#00a4ef"></path>
                      <path d="M11 1h9v9h-9z" fill="#7fba00"></path>
                      <path d="M11 11h9v9h-9z" fill="#ffb900"></path>
                    </svg>
                    Continue with Microsoft
                  </button>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t" style={{ borderColor: "var(--dn-border2)" }}></div>
                  <span className="flex-shrink-0 mx-4 text-[12px] text-gray-400">OR</span>
                  <div className="flex-grow border-t" style={{ borderColor: "var(--dn-border2)" }}></div>
                </div>

                <form className="space-y-[16px]" onSubmit={(e) => { e.preventDefault(); window.location.href = "/"; }}>
                  <div>
                    <label className="block text-[12px] font-medium tracking-wider mb-1" style={{ color: "var(--dn-t3)" }}>WORK EMAIL</label>
                    <input type="email" placeholder="name@company.com" className="w-full h-[40px] px-3 focus:outline-none dn-auth-input" style={{ fontSize: "14px" }} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[12px] font-medium tracking-wider" style={{ color: "var(--dn-t3)" }}>PASSWORD</label>
                      <button type="button" onClick={() => setShowForgot(true)} className="text-[12px] dn-auth-link-primary">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full h-[40px] pl-3 pr-10 focus:outline-none dn-auth-input" style={{ fontSize: "14px" }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 dn-auth-icon-btn">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="remember-me" className="dn-auth-checkbox" style={{ width: "16px", height: "16px", borderRadius: "4px" }} />
                    <label htmlFor="remember-me" className="ml-2 text-[14px] dn-auth-checkbox-label">Remember me for 30 days</label>
                  </div>
                  <button type="submit" className="w-full h-[40px] font-medium dn-auth-btn-primary">Sign In</button>
                  
                  <div className="flex flex-col items-center mt-3 gap-1.5 pt-2">
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); sessionStorage.setItem("guestMode", "true"); window.location.href = "/"; }}
                      className="w-full h-[40px] font-medium dn-auth-btn-skip"
                    >
                      Skip for Now
                    </button>
                    <span style={{ fontSize: "12px", color: "var(--dn-t3)" }}>You can create an account later.</span>
                  </div>
                </form>
              </div>
            )}

            {/* SIGN UP FORM */}
            {!showForgot && !resetSuccess && tab === "signup" && (
              <div className="space-y-[24px]">
                <div className="space-y-[12px]">
                  <button className="w-full h-[40px] flex items-center justify-center gap-2 font-medium dn-auth-btn-social">
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                    Sign up with Google
                  </button>
                </div>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t" style={{ borderColor: "var(--dn-border2)" }}></div>
                  <span className="flex-shrink-0 mx-4 text-[12px] text-gray-400">OR</span>
                  <div className="flex-grow border-t" style={{ borderColor: "var(--dn-border2)" }}></div>
                </div>

                <form className="space-y-[16px]" onSubmit={(e) => { e.preventDefault(); window.location.href = "/"; }}>
                  <div>
                    <label className="block text-[12px] font-medium tracking-wider mb-1" style={{ color: "var(--dn-t3)" }}>FULL NAME</label>
                    <input type="text" placeholder="Jane Doe" className="w-full h-[40px] px-3 focus:outline-none dn-auth-input" style={{ fontSize: "14px" }} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium tracking-wider mb-1" style={{ color: "var(--dn-t3)" }}>WORK EMAIL</label>
                    <input type="email" placeholder="name@company.com" className="w-full h-[40px] px-3 focus:outline-none dn-auth-input" style={{ fontSize: "14px" }} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium tracking-wider mb-1" style={{ color: "var(--dn-t3)" }}>PASSWORD</label>
                    <div className="relative mb-2">
                      <input type={showPassword ? "text" : "password"} onChange={handlePasswordChange} placeholder="Create a strong password" className="w-full h-[40px] pl-3 pr-10 focus:outline-none dn-auth-input" style={{ fontSize: "14px" }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 dn-auth-icon-btn">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Strength Indicator */}
                    <div className="flex gap-1 h-[4px] mb-1">
                      {[1, 2, 3, 4].map(level => {
                        let bg = "var(--dn-border2)";
                        if (passwordStrength >= level) {
                          if (passwordStrength === 1) bg = "#ef4444";
                          else if (passwordStrength === 2) bg = "#f59e0b";
                          else if (passwordStrength === 3) bg = "#2563eb";
                          else if (passwordStrength === 4) bg = "#10b981";
                        }
                        return <div key={level} className="flex-1 rounded-full transition-colors" style={{ background: bg }}></div>;
                      })}
                    </div>
                    <div className="text-[12px]" style={{ color: passwordStrength === 0 ? "var(--dn-t3)" : passwordStrength === 1 ? "#ef4444" : passwordStrength === 2 ? "#f59e0b" : passwordStrength === 3 ? "#2563eb" : "#10b981" }}>
                      {passwordStrength === 0 && "Password strength"}
                      {passwordStrength === 1 && "Weak"}
                      {passwordStrength === 2 && "Fair"}
                      {passwordStrength === 3 && "Good"}
                      {passwordStrength === 4 && "Strong"}
                    </div>
                  </div>
                  <button type="submit" className="w-full h-[40px] font-medium mt-2 dn-auth-btn-primary">Create Account</button>
                  
                  <div className="flex flex-col items-center mt-3 gap-1.5 pt-2">
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); sessionStorage.setItem("guestMode", "true"); window.location.href = "/"; }}
                      className="w-full h-[40px] font-medium dn-auth-btn-skip"
                    >
                      Skip for Now
                    </button>
                    <span style={{ fontSize: "12px", color: "var(--dn-t3)" }}>You can create an account later.</span>
                  </div>

                  <p className="text-[12px] text-center mt-4" style={{ color: "var(--dn-t3)" }}>
                    By creating an account, you agree to our <Link to="/terms" className="dn-auth-link-primary">Terms of Service</Link> and <Link to="/privacy" className="dn-auth-link-primary">Privacy Policy</Link>.
                  </p>
                </form>
              </div>
            )}

            {/* FORGOT PASSWORD FORM */}
            {showForgot && !resetSuccess && (
              <div className="space-y-[24px]">
                <button onClick={() => setShowForgot(false)} className="flex items-center gap-2 text-[14px] dn-auth-link">
                  <ArrowLeft size={16} /> Back to Sign In
                </button>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: 600, color: "var(--dn-t1)", marginBottom: "8px" }}>Reset your password</h2>
                  <p style={{ fontSize: "14px", color: "var(--dn-t3)", marginBottom: "24px" }}>Enter your work email and we'll send you a link to reset your password.</p>
                </div>
                <form className="space-y-[16px]" onSubmit={handleReset}>
                  <div>
                    <label className="block text-[12px] font-medium tracking-wider mb-1" style={{ color: "var(--dn-t3)" }}>WORK EMAIL</label>
                    <input type="email" required placeholder="name@company.com" className="w-full h-[40px] px-3 focus:outline-none dn-auth-input" style={{ fontSize: "14px" }} />
                  </div>
                  <button type="submit" className="w-full h-[40px] font-medium dn-auth-btn-primary">Send Reset Link</button>
                </form>
              </div>
            )}

            {/* FORGOT PASSWORD SUCCESS */}
            {resetSuccess && (
              <div className="flex flex-col items-center text-center py-[24px]">
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <CheckCircle2 size={24} color="#2563eb" />
                </div>
                <h2 style={{ fontSize: "24px", fontWeight: 600, color: "var(--dn-t1)", marginBottom: "8px" }}>Check your email</h2>
                <p style={{ fontSize: "14px", color: "var(--dn-t3)", marginBottom: "24px" }}>We've sent a password reset link to your email address. It may take a few minutes to arrive.</p>
                <button onClick={() => { setResetSuccess(false); setShowForgot(false); setTab("signin"); }} className="w-full h-[40px] font-medium dn-auth-btn-social">Return to Sign In</button>
              </div>
            )}

          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex gap-6 text-[12px]">
          <a href="#" className="dn-auth-link">Help Center</a>
          <a href="#" className="dn-auth-link">System Status</a>
        </div>
      </div>
    </div>
  );
}
