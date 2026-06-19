import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Home, FileText, MessageSquare, Search, ClipboardList,
  BarChart3, Settings, Plus, Bell, HelpCircle, UserCircle,
  Upload, TrendingUp, Clock, MoreVertical, ChevronRight,
  Eye, Download, Trash2, Bot, Sparkles, Target, Menu,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/* ─── Sidebar ────────────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: Home, label: "Home", active: true },
  { icon: FileText, label: "Documents", active: false },
  { icon: MessageSquare, label: "Conversations", active: false },
  { icon: Search, label: "Search", active: false },
  { icon: ClipboardList, label: "Extractions", active: false },
  { icon: BarChart3, label: "Analytics", active: false },
];

function Sidebar({ mobileOpen }: { mobileOpen: boolean }) {
  const [active, setActive] = useState("Home");

  return (
    <nav
      style={{
        position: "fixed" as const, left: 0, top: 0, bottom: 0,
        width: 240, background: "#0A0F1E",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column" as const,
        padding: "32px 0", zIndex: 50,
        fontFamily: "'Inter', sans-serif",
      }}
      className={`dash-sidebar${mobileOpen ? " dash-open" : ""}`}
    >
      {/* Logo */}
      <div className="dash-logo" style={{ padding: "0 24px", marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: "#2563eb", display: "flex", alignItems: "center",
          justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14,
        }}>
          D
        </div>
        <div className="dash-label">
          <h1 style={{ fontWeight: 600, fontSize: 24, lineHeight: "32px", color: "#fff" }}>DocNova</h1>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "rgba(93,98,116,0.7)" }}>
            Document Intelligence
          </p>
        </div>
      </div>

      {/* New Document Button */}
      <div className="dash-newdoc" style={{ padding: "0 24px", marginBottom: 16 }}>
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(37,99,235,0.3)" }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%", height: 44, background: "#2563eb", color: "#fff",
            borderRadius: 8, fontWeight: 600, fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
            transition: "background 0.2s",
          }}
        >
          <Plus size={18} /> <span className="dash-label">New Document</span>
        </motion.button>
      </div>

      {/* Nav Items */}
      <ul style={{ flex: 1, padding: "0 12px", listStyle: "none", margin: 0, display: "flex", flexDirection: "column" as const, gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.label;
          return (
            <li key={item.label}>
              <button
                onClick={() => setActive(item.label)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 12px", borderRadius: 8,
                  background: isActive ? "rgba(37,99,235,0.1)" : "transparent",
                  borderLeft: isActive ? "4px solid #2563eb" : "4px solid transparent",
                  color: isActive ? "#fff" : "rgba(93,98,116,0.7)",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 16, cursor: "pointer", border: "none",
                  fontFamily: "'Inter', sans-serif", textAlign: "left" as const,
                  transition: "all 0.15s",
                  borderLeftWidth: 4,
                  borderLeftStyle: "solid",
                  borderLeftColor: isActive ? "#2563eb" : "transparent",
                }}
              >
                <item.icon size={20} style={{ flexShrink: 0 }} fill={isActive ? "currentColor" : "none"} />
                <span className="dash-label">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Settings */}
      <div style={{ padding: "0 12px" }}>
        <button
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "8px 16px", borderRadius: 8,
            background: "transparent", color: "rgba(93,98,116,0.7)",
            fontSize: 16, cursor: "pointer", border: "none",
            fontFamily: "'Inter', sans-serif", textAlign: "left" as const,
            transition: "all 0.15s",
          }}
        >
          <Settings size={20} /> <span className="dash-label">Settings</span>
        </button>
      </div>
    </nav>
  );
}

/* ─── Top App Bar ─────────────────────────────────────────── */
function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header
      style={{
        position: "fixed" as const, top: 0, right: 0, height: 60,
        left: 240, background: "var(--dn-bg-card)",
        borderBottom: "1px solid var(--dn-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 1.25rem", gap: 12, zIndex: 40,
        fontFamily: "'Inter', sans-serif",
      }}
      className="dash-topbar"
    >
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="dash-hamburger"
        style={{ display: "none", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 8, border: "none", background: "transparent", color: "var(--dn-t2)", cursor: "pointer", flexShrink: 0 }}
      >
        <Menu size={22} />
      </button>
      <div style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 0 }}>
        <div style={{ position: "relative" as const, width: 256 }}>
          <Search size={18} style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            color: "var(--dn-t3)",
          }} />
          <input
            type="text"
            placeholder="Search documents..."
            style={{
              width: "100%", height: 40, paddingLeft: 40, paddingRight: 16,
              borderRadius: 8, border: "1px solid var(--dn-border)",
              background: "var(--dn-bg)", outline: "none",
              fontSize: 14, color: "var(--dn-t1)", fontFamily: "'Inter', sans-serif",
              transition: "border-color 0.2s",
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {[Bell, HelpCircle, UserCircle].map((Icon, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "transparent", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--dn-t3)",
              transition: "color 0.15s, background 0.15s",
            }}
          >
            <Icon size={22} />
          </motion.button>
        ))}
      </div>
    </header>
  );
}

/* ─── Stat Card ───────────────────────────────────────────── */
function StatCard({ title, value, trend, trendLabel, icon: Icon, iconBg, iconColor }: {
  title: string; value: string; trend: string; trendLabel: string;
  icon: typeof FileText; iconBg: string; iconColor: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
      style={{
        background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)",
        borderRadius: 16, padding: 24,
        boxShadow: "0 4px 6px -1px rgba(10,15,30,0.1), 0 2px 4px -2px rgba(10,15,30,0.05)",
        display: "flex", flexDirection: "column" as const, gap: 16,
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{
            fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
            textTransform: "uppercase" as const, color: "var(--dn-t3)", marginBottom: 4,
          }}>
            {title}
          </p>
          <p style={{ fontSize: 36, lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: 700, color: "var(--dn-t1)" }}>
            {value}
          </p>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: iconBg, display: "flex", alignItems: "center",
          justifyContent: "center", color: iconColor,
        }}>
          <Icon size={20} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
        <span style={{ color: "#10B981", fontWeight: 600, display: "flex", alignItems: "center" }}>
          <TrendingUp size={16} style={{ marginRight: 4 }} /> {trend}
        </span>
        <span style={{ color: "var(--dn-t3)" }}>{trendLabel}</span>
      </div>
    </motion.div>
  );
}

/* ─── Documents Table ─────────────────────────────────────── */
const DOCUMENTS = [
  { name: "Patient_Record_2024.pdf", type: "PDF", status: "Ready", statusColor: "#10B981", date: "Dec 15, 2024", size: "2.4 MB" },
  { name: "Legal_Contract_Draft.pdf", type: "PDF", status: "Processing", statusColor: "#F59E0B", date: "Dec 14, 2024", size: "1.8 MB" },
  { name: "Financial_Report_Q4.xlsx", type: "XLSX", status: "Ready", statusColor: "#10B981", date: "Dec 13, 2024", size: "3.2 MB" },
  { name: "Research_Paper_v3.pdf", type: "PDF", status: "Ready", statusColor: "#10B981", date: "Dec 12, 2024", size: "5.1 MB" },
  { name: "Medical_Imaging_Report.pdf", type: "PDF", status: "Error", statusColor: "#EF4444", date: "Dec 11, 2024", size: "8.7 MB" },
];

function DocumentsTable() {
  return (
    <div style={{
      background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)",
      borderRadius: 16, overflow: "hidden",
      boxShadow: "0 4px 6px -1px rgba(10,15,30,0.1), 0 2px 4px -2px rgba(10,15,30,0.05)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 24px", borderBottom: "1px solid var(--dn-border)",
      }}>
        <div>
          <h3 style={{ fontWeight: 600, fontSize: 20, lineHeight: "28px", color: "var(--dn-t1)" }}>
            Recent Documents
          </h3>
          <p style={{ fontSize: 14, color: "var(--dn-t3)", marginTop: 2 }}>
            Your most recently uploaded and processed documents
          </p>
        </div>
        <Link to="#" style={{ textDecoration: "none" }}>
          <motion.span
            whileHover={{ scale: 1.02 }}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              color: "#2563eb", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            View all <ChevronRight size={16} />
          </motion.span>
        </Link>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" as const }}>
        <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
          <thead>
            <tr style={{ background: "var(--dn-bg-alt)" }}>
              {["Document", "Status", "Date", "Size", "Actions"].map((h) => (
                <th key={h} style={{
                  padding: "12px 24px", textAlign: "left" as const,
                  fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
                  textTransform: "uppercase" as const, color: "var(--dn-t3)",
                  borderBottom: "1px solid var(--dn-border)",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DOCUMENTS.map((doc, i) => (
              <motion.tr
                key={i}
                whileHover={{ background: "var(--dn-bg-alt)" }}
                style={{
                  borderBottom: i < DOCUMENTS.length - 1 ? "1px solid var(--dn-border)" : "none",
                  transition: "background 0.15s",
                }}
              >
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: doc.type === "PDF" ? "rgba(37,99,235,0.1)" : "rgba(16,185,129,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: doc.type === "PDF" ? "#2563eb" : "#10B981",
                    }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: "var(--dn-t1)" }}>{doc.name}</p>
                      <p style={{ fontSize: 12, color: "var(--dn-t4)" }}>{doc.type}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 999,
                    background: `${doc.statusColor}15`, color: doc.statusColor,
                    fontSize: 12, fontWeight: 600,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", background: doc.statusColor,
                    }} />
                    {doc.status}
                  </span>
                </td>
                <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--dn-t3)" }}>
                  {doc.date}
                </td>
                <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--dn-t3)" }}>
                  {doc.size}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[Eye, Download, Trash2].map((ActionIcon, j) => (
                      <motion.button
                        key={j}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: "transparent", border: "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", color: "var(--dn-t3)",
                          transition: "color 0.15s",
                        }}
                      >
                        <ActionIcon size={16} />
                      </motion.button>
                    ))}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Activity Feed ───────────────────────────────────────── */
const ACTIVITIES = [
  { icon: Upload, text: "Patient_Record_2024.pdf uploaded", time: "2 minutes ago", color: "#2563eb" },
  { icon: Bot, text: 'Data extraction completed for "Legal Contract"', time: "15 minutes ago", color: "#10B981" },
  { icon: MessageSquare, text: "New conversation started with Research Paper", time: "1 hour ago", color: "#8B5CF6" },
  { icon: Sparkles, text: "AI analysis generated 12 key insights", time: "2 hours ago", color: "#F59E0B" },
  { icon: Download, text: "Financial_Report_Q4.xlsx exported", time: "3 hours ago", color: "#06B6D4" },
];

function ActivityFeed() {
  return (
    <div style={{
      background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)",
      borderRadius: 16, padding: 24, flex: 1,
      boxShadow: "0 4px 6px -1px rgba(10,15,30,0.1), 0 2px 4px -2px rgba(10,15,30,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontWeight: 600, fontSize: 20, lineHeight: "28px", color: "var(--dn-t1)" }}>
          Recent Activity
        </h3>
        <button style={{
          background: "none", border: "none", color: "var(--dn-t3)",
          cursor: "pointer", display: "flex",
        }}>
          <MoreVertical size={20} />
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
        {ACTIVITIES.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${a.color}15`, display: "flex", alignItems: "center",
              justifyContent: "center", color: a.color, flexShrink: 0,
            }}>
              <a.icon size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, color: "var(--dn-t1)", lineHeight: 1.5 }}>{a.text}</p>
              <p style={{ fontSize: 12, color: "var(--dn-t4)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <Clock size={12} /> {a.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Conversations ───────────────────────────────────────── */
const CONVERSATIONS = [
  { title: "Patient Record Analysis", messages: 12, lastMsg: "What are the prescribed medications?", time: "5m ago", avatar: "PR" },
  { title: "Legal Contract Review", messages: 8, lastMsg: "Summarize Section 4.2 liability clauses", time: "1h ago", avatar: "LC" },
  { title: "Research Paper Discussion", messages: 24, lastMsg: "Compare methodology with Smith et al.", time: "3h ago", avatar: "RP" },
];

function ConversationsList() {
  return (
    <div style={{
      background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)",
      borderRadius: 16, padding: 24, flex: 1,
      boxShadow: "0 4px 6px -1px rgba(10,15,30,0.1), 0 2px 4px -2px rgba(10,15,30,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontWeight: 600, fontSize: 20, lineHeight: "28px", color: "var(--dn-t1)" }}>
          Active Conversations
        </h3>
        <Link to="#" style={{ textDecoration: "none" }}>
          <span style={{
            display: "flex", alignItems: "center", gap: 4,
            color: "#2563eb", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            View all <ChevronRight size={16} />
          </span>
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
        {CONVERSATIONS.map((conv, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -1, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
            style={{
              padding: 16, borderRadius: 12,
              border: "1px solid var(--dn-border)",
              background: "var(--dn-bg)",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#2563eb", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#fff", fontWeight: 600,
                fontSize: 13, flexShrink: 0,
              }}>
                {conv.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "var(--dn-t1)" }}>{conv.title}</p>
                  <span style={{ fontSize: 12, color: "var(--dn-t4)", flexShrink: 0 }}>{conv.time}</span>
                </div>
                <p style={{
                  fontSize: 13, color: "var(--dn-t3)", marginTop: 4,
                  overflow: "hidden" as const, textOverflow: "ellipsis" as const,
                  whiteSpace: "nowrap" as const,
                }}>
                  {conv.lastMsg}
                </p>
              </div>
            </div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                padding: "2px 8px", borderRadius: 999,
                background: "rgba(37,99,235,0.1)", color: "#2563eb",
                fontSize: 11, fontWeight: 600,
              }}>
                {conv.messages} messages
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif", background: "var(--dn-bg)",
      minHeight: "100vh", transition: "var(--dn-transition)",
    }}>
      <style>{`
        /* Desktop (>=1025px): full sidebar */
        .dash-sidebar { display: flex !important; transition: transform 0.25s ease; }
        .dash-topbar { left: 240px !important; }
        .dash-main { margin-left: 240px; }
        .dash-hamburger { display: none; }
        .dash-backdrop { display: none; }

        /* Tablet (769-1024px): icon-only strip */
        @media (max-width: 1024px) and (min-width: 769px) {
          .dash-sidebar { width: 72px !important; align-items: center; }
          .dash-sidebar .dash-label { display: none !important; }
          .dash-sidebar .dash-logo { padding: 0 !important; justify-content: center; }
          .dash-sidebar .dash-newdoc { padding: 0 12px !important; }
          .dash-topbar { left: 72px !important; }
          .dash-main { margin-left: 72px !important; }
        }

        /* Mobile (<=768px): off-canvas drawer toggled by hamburger */
        @media (max-width: 768px) {
          .dash-sidebar { transform: translateX(-100%); }
          .dash-sidebar.dash-open { transform: translateX(0); box-shadow: 0 0 40px rgba(0,0,0,0.5); }
          .dash-topbar { left: 0 !important; }
          .dash-main { margin-left: 0 !important; }
          .dash-hamburger { display: flex !important; }
          .dash-backdrop { display: block; }
        }
      `}</style>

      {/* Drawer backdrop (mobile only) */}
      {mobileOpen && (
        <div
          className="dash-backdrop"
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 49 }}
        />
      )}

      <Sidebar mobileOpen={mobileOpen} />
      <TopBar onMenuClick={() => setMobileOpen(true)} />

      {/* Main Content */}
      <main
        className="dash-main"
        style={{
          paddingTop: 60, padding: "60px 2.5rem 2.5rem",
          maxWidth: 1440, width: "100%",
          display: "flex", flexDirection: "column" as const, gap: 32,
          minHeight: "100vh",
        }}
      >
        {/* Section 1: Welcome */}
        <section style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap" as const, gap: 16,
          paddingTop: 16,
        }}>
          <div>
            <h2 style={{ fontWeight: 600, fontSize: 24, lineHeight: "32px", color: "var(--dn-t1)" }}>
              Good morning, Jane.
            </h2>
            <p style={{ fontSize: 14, color: "var(--dn-t3)", marginTop: 4 }}>
              You have 3 documents processing and 2 conversations active.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(37,99,235,0.3)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              height: 44, padding: "0 24px", background: "#2563eb", color: "#fff",
              borderRadius: 8, fontWeight: 600, fontSize: 14,
              display: "flex", alignItems: "center", gap: 8,
              border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
              boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
            }}
          >
            <Upload size={18} /> Upload Document
          </motion.button>
        </section>

        {/* Section 2: Stats */}
        <section style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 24,
        }}>
          <StatCard
            title="Total Documents" value="127" trend="↑ 8" trendLabel="this week"
            icon={FileText} iconBg="var(--dn-bg-alt)" iconColor="#2563eb"
          />
          <StatCard
            title="Conversations" value="43" trend="↑ 3" trendLabel="this week"
            icon={MessageSquare} iconBg="rgba(0,120,140,0.1)" iconColor="#00788c"
          />
          <StatCard
            title="Data Extractions" value="89" trend="↑ 12" trendLabel="this week"
            icon={ClipboardList} iconBg="rgba(139,92,246,0.1)" iconColor="#8B5CF6"
          />
          <StatCard
            title="Accuracy Rate" value="98.5%" trend="↑ 0.3%" trendLabel="this month"
            icon={Target} iconBg="rgba(16,185,129,0.1)" iconColor="#10B981"
          />
        </section>

        {/* Section 3: Documents Table */}
        <DocumentsTable />

        {/* Section 4: Activity + Conversations */}
        <section style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }} className="dash-bottom-grid">
          <ActivityFeed />
          <ConversationsList />
        </section>
      </main>

      <style>{`
        .dash-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 960px) {
          .dash-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
