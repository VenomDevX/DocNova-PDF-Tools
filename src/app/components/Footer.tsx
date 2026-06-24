import { useState } from "react";
import { Link } from "react-router";
import { Github, Linkedin, Globe, Check, ArrowUp, Loader2 } from "lucide-react";

const PORTFOLIO_URL = "https://www.venomdevx.dev";
const GITHUB_URL = "https://github.com/venom-parth";
const LINKEDIN_URL = "https://www.linkedin.com/in/parth-sharma-b96661245/";

/** Link to a feature that isn't built yet — clearly disabled, never a silent dead click. */
function ComingSoonLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      className="dn-foot-link inline-flex items-center gap-1.5 bg-transparent border-none p-0 text-[14px] opacity-55 cursor-not-allowed text-left"
      style={{ color: "rgba(255,255,255,0.75)" }}
    >
      {label}
      <span className="rounded px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>Soon</span>
    </button>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="col-span-1 flex flex-col gap-4">
      <h3 className="text-[16px] font-semibold text-white">{title}</h3>
      <ul className="flex flex-col gap-3">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="dn-foot-link text-[14px]" style={{ color: "rgba(255,255,255,0.75)" }}>
        {children}
      </Link>
    </li>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = () => {
    if (loading) return;
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setLoading(true);
    // Simulate a request; swap for a real API call when the backend endpoint exists.
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
    }, 800);
  };

  const trust = ["52+ Tools", "Secure Processing", "Auto File Deletion", "No Watermarks"];

  return (
    <footer
      className="w-full mt-auto font-sans"
      style={{
        background: "linear-gradient(180deg, #020817, #071129)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <style>{`
        .dn-foot-link { transition: color 0.2s ease, transform 0.2s ease; }
        .dn-foot-link:hover:not(:disabled) { color: #3B82F6 !important; }
        .dn-foot-social { transition: color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease; }
        .dn-foot-social:hover { color: #3B82F6; border-color: rgba(59,130,246,0.5); box-shadow: 0 0 18px rgba(59,130,246,0.35); transform: translateY(-2px); }
        .dn-foot-subscribe { transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease; }
        .dn-foot-subscribe:hover:not(:disabled) { background: #1d4ed8; box-shadow: 0 6px 18px rgba(37,99,235,0.4); }
        .dn-foot-subscribe:active:not(:disabled) { transform: scale(0.98); }
        .dn-foot-top { transition: color 0.2s ease, border-color 0.2s ease, transform 0.2s ease; }
        .dn-foot-top:hover { color: #3B82F6; border-color: rgba(59,130,246,0.5); }
        .dn-foot-top:hover svg { transform: translateY(-3px); }
        .dn-foot-top svg { transition: transform 0.2s ease; }
      `}</style>

      {/* Main grid */}
      <div className="mx-auto max-w-[1280px] px-6 md:px-[40px] pt-[80px] pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-y-12 gap-x-12">
        {/* Branding + newsletter */}
        <div className="lg:col-span-2 flex flex-col gap-5 items-center text-center md:items-start md:text-left">
          <Link to="/" className="group flex items-center gap-2">
            <svg className="w-7 h-7 text-[#3B82F6] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <span className="text-[22px] font-bold tracking-tight text-white">DocNova</span>
          </Link>

          <p className="max-w-sm text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            Convert, edit, organize, OCR, secure, and manage documents with powerful AI and professional PDF tools.
          </p>

          {/* Trust row */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {trust.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
              >
                <Check size={12} className="text-[#22c55e]" /> {t}
              </span>
            ))}
          </div>

          {/* Newsletter */}
          <div className="mt-3 w-full max-w-sm flex flex-col gap-2">
            <label className="text-[13px] font-medium text-white" htmlFor="newsletter">Subscribe to our newsletter</label>
            {subscribed ? (
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}>
                <Check size={15} /> Thanks for subscribing! We'll be in touch.
              </div>
            ) : (
              <>
                <div
                  className="flex items-center gap-2 rounded-xl p-1.5 transition-all focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${emailError ? "#ef4444" : "rgba(255,255,255,0.08)"}` }}
                >
                  <input
                    className="w-full border-none bg-transparent px-3 py-1.5 text-[14px] text-white outline-none placeholder:text-[rgba(255,255,255,0.4)]"
                    id="newsletter"
                    placeholder="Enter your email address"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSubscribe(); }}
                  />
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="dn-foot-subscribe inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: "#2563eb" }}
                  >
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Subscribing</> : "Subscribe"}
                  </button>
                </div>
                {emailError && <span className="text-[11px]" style={{ color: "#ef4444" }}>Please enter a valid email address.</span>}
              </>
            )}
          </div>
        </div>

        {/* Product */}
        <FooterColumn title="Product">
          <FooterLink to="/ai-tools">AI Tools</FooterLink>
          <FooterLink to="/convert">Convert</FooterLink>
          <FooterLink to="/organize">Organize</FooterLink>
          <FooterLink to="/edit">Edit</FooterLink>
          <FooterLink to="/ocr">OCR</FooterLink>
          <FooterLink to="/secure">Secure</FooterLink>
        </FooterColumn>

        {/* Resources */}
        <FooterColumn title="Resources">
          <FooterLink to="/pricing">Pricing</FooterLink>
          <FooterLink to="/contact">Help Center</FooterLink>
          <li><ComingSoonLink label="Blog" /></li>
          <li><ComingSoonLink label="API" /></li>
        </FooterColumn>

        {/* Company */}
        <FooterColumn title="Company">
          <FooterLink to="/about">About</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/terms">Terms of Service</FooterLink>
          <FooterLink to="/privacy">Cookie Policy</FooterLink>
        </FooterColumn>

        {/* Developer */}
        <FooterColumn title="Developer">
          <li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="dn-foot-link text-[14px]" style={{ color: "rgba(255,255,255,0.75)" }}>GitHub</a></li>
          <li><a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="dn-foot-link text-[14px]" style={{ color: "rgba(255,255,255,0.75)" }}>LinkedIn</a></li>
          <li><a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" className="dn-foot-link text-[14px]" style={{ color: "rgba(255,255,255,0.75)" }}>Portfolio</a></li>
        </FooterColumn>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-5 px-6 md:px-[40px] py-6 md:flex-row md:justify-between">
          {/* Copyright + developer credit */}
          <div className="flex flex-col items-center md:items-start gap-1 order-2 md:order-1">
            <p className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
              © {new Date().getFullYear()} DocNova. All rights reserved.
            </p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Built by Parth Sharma</p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3 order-1 md:order-2">
            {[
              { label: "GitHub", href: GITHUB_URL, Icon: Github },
              { label: "LinkedIn", href: LINKEDIN_URL, Icon: Linkedin },
              { label: "Portfolio", href: PORTFOLIO_URL, Icon: Globe },
            ].map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="dn-foot-social flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.03)" }}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

          {/* Back to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="dn-foot-top order-3 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.03)" }}
          >
            Back to Top <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
