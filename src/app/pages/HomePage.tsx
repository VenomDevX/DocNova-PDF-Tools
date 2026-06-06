import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion, useInView, AnimatePresence } from "motion/react";
import {
  ArrowRight, Play, Zap, Shield, Globe,
  Star, ChevronDown, FileStack, Upload, Settings, Download,
  ScanLine, Lock, FileOutput,
  PenLine,
  Users, Award, TrendingUp, Sparkles,
} from "lucide-react";
import { toolsList } from "../data/tools";

function AnimatedBg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <style>{`
        @keyframes blob1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(80px,-60px) scale(1.15)}66%{transform:translate(-40px,40px) scale(0.9)}}
        @keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-60px,50px) scale(1.1)}66%{transform:translate(70px,-30px) scale(0.95)}}
        @keyframes blob3{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(40px,60px) scale(1.08)}66%{transform:translate(-60px,-50px) scale(1.12)}}
        @keyframes float1{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-18px) rotate(2deg)}}
        @keyframes float2{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(-2deg)}}
        @keyframes float3{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(1deg)}}
        @keyframes shimmerText{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(59,130,246,0.2)}50%{box-shadow:0 0 50px rgba(59,130,246,0.45)}}
        @keyframes spinSlow{to{transform:rotate(360deg)}}
        @keyframes pulseBd{0%,100%{border-color:rgba(59,130,246,0.3)}50%{border-color:rgba(59,130,246,0.7)}}
      `}</style>
      <div style={{position:"absolute",top:"-20%",left:"-10%",width:"700px",height:"700px",borderRadius:"50%",background:"radial-gradient(circle,rgba(29,78,216,0.12) 0%,transparent 65%)",animation:"blob1 18s ease-in-out infinite"}}/>
      <div style={{position:"absolute",top:"10%",right:"-15%",width:"600px",height:"600px",borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,0.09) 0%,transparent 65%)",animation:"blob2 22s ease-in-out infinite"}}/>
      <div style={{position:"absolute",bottom:"-10%",left:"30%",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,rgba(37,99,235,0.07) 0%,transparent 65%)",animation:"blob3 26s ease-in-out infinite"}}/>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(59,130,246,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.025) 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>
    </div>
  );
}

function FloatingCard({ animName, style, title, tag, lineCount }: { animName:string; style:React.CSSProperties; title:string; tag:string; lineCount:number }) {
  return (
    <div style={{ position:"absolute", padding:"1.25rem", borderRadius:"16px", background:"var(--dn-doc-bg)", border:"1px solid var(--dn-doc-border)", backdropFilter:"blur(16px)", animation:`${animName} ease-in-out infinite`, boxShadow:"var(--dn-doc-front-shad)", ...style }}>
      <div style={{display:"flex",alignItems:"center",gap:"0.35rem",marginBottom:"0.75rem"}}>
        <div style={{width:"7px",height:"7px",borderRadius:"50%",background:"#ef4444"}}/>
        <div style={{width:"7px",height:"7px",borderRadius:"50%",background:"#f59e0b"}}/>
        <div style={{width:"7px",height:"7px",borderRadius:"50%",background:"#22c55e"}}/>
        <span style={{marginLeft:"auto",fontSize:"0.6rem",color:"#60a5fa",padding:"0.12rem 0.4rem",borderRadius:"999px",background:"rgba(59,130,246,0.15)"}}>{tag}</span>
      </div>
      <div style={{color:"var(--dn-t1)",fontWeight:700,fontSize:"0.82rem",marginBottom:"0.5rem"}}>{title}</div>
      {Array.from({length:lineCount}).map((_,i)=>(
        <div key={i} style={{height:"5px",borderRadius:"3px",background:i===0?"linear-gradient(90deg,#3b82f6,#60a5fa)":"var(--dn-doc-line)",marginBottom:"0.35rem",width:i===0?"100%":`${72-i*10}%`}}/>
      ))}
    </div>
  );
}

function HeroSection() {
  const [mx, setMx] = useState(50);
  const [my, setMy] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if(!rect) return;
      setMx(((e.clientX - rect.left) / rect.width) * 100);
      setMy(((e.clientY - rect.top) / rect.height) * 100);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section ref={ref} style={{position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:"var(--dn-bg)",padding:"100px 1.5rem 5rem",transition:"var(--dn-transition)"}}>
      <AnimatedBg/>
      <div style={{position:"absolute",width:"700px",height:"700px",borderRadius:"50%",background:`radial-gradient(circle at ${mx}% ${my}%, rgba(59,130,246,0.07) 0%, transparent 55%)`,pointerEvents:"none",top:"50%",left:"50%",transform:"translate(-50%,-50%)",transition:"background 0.05s"}}/>
      <style>{`.hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;max-width:1200px;margin:0 auto;width:100%;position:relative;z-index:1} .hero-cards{position:relative;height:480px} @media(max-width:860px){.hero-grid{grid-template-columns:1fr!important} .hero-cards{display:none!important}}`}</style>
      <div className="hero-grid">
        <div>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:"0.45rem",padding:"0.32rem 0.85rem",borderRadius:"999px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.25)",color:"#93c5fd",fontSize:"0.76rem",fontWeight:600,marginBottom:"1.5rem"}}>
              <Sparkles size={11}/> 38 PDF Tools · Always Free
            </div>
          </motion.div>
          <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.1}}
            style={{fontSize:"clamp(2.5rem,5.5vw,4rem)",fontWeight:900,letterSpacing:"-0.04em",lineHeight:1.08,marginBottom:"1.25rem",color:"var(--dn-t1)"}}>
            All your PDF tools<br/>in one{" "}
            <span style={{background:"linear-gradient(135deg,#3b82f6,#60a5fa,#93c5fd,#60a5fa)",backgroundSize:"300% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmerText 4s linear infinite"}}>powerful</span>{" "}place.
          </motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.2}}
            style={{color:"var(--dn-t3)",fontSize:"clamp(0.95rem,2vw,1.1rem)",lineHeight:1.75,maxWidth:"500px",marginBottom:"2rem"}}>
            Convert, merge, split, compress, edit, and secure PDFs instantly. No registration. No watermarks. No limits.
          </motion.p>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.3}} style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",marginBottom:"2.5rem"}}>
            <Link to="/tools" style={{textDecoration:"none"}}>
              <motion.div whileHover={{scale:1.04}} whileTap={{scale:0.97}}
                style={{padding:"0.875rem 1.75rem",borderRadius:"14px",background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",color:"#fff",fontWeight:700,fontSize:"1rem",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.5rem",animation:"glowPulse 3s ease-in-out infinite"}}>
                Start Converting <ArrowRight size={18}/>
              </motion.div>
            </Link>
            <Link to="/tools" style={{textDecoration:"none"}}>
              <motion.div whileHover={{scale:1.03,borderColor:"rgba(59,130,246,0.45)"}} whileTap={{scale:0.97}}
                style={{padding:"0.875rem 1.5rem",borderRadius:"14px",background:"var(--dn-bg-subtle)",border:"1px solid var(--dn-border)",color:"var(--dn-t2)",fontWeight:600,fontSize:"1rem",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.5rem",transition:"border-color 0.2s"}}>
                <Play size={15} fill="currentColor"/> Explore Tools
              </motion.div>
            </Link>
          </motion.div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}} style={{display:"flex",gap:"1.5rem",flexWrap:"wrap"}}>
            {[{icon:Shield,text:"Files deleted in 1hr"},{icon:Zap,text:"No sign-up needed"},{icon:Globe,text:"Free forever"}].map(({icon:Icon,text})=>(
              <div key={text} style={{display:"flex",alignItems:"center",gap:"0.4rem",color:"var(--dn-t4)",fontSize:"0.78rem"}}>
                <Icon size={12} color="#3b82f6"/> {text}
              </div>
            ))}
          </motion.div>
        </div>
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.7,delay:0.2}}>
          <div className="hero-cards">
            <FloatingCard animName="float1 5s" style={{top:"5%",right:"5%",width:"190px",zIndex:3}} title="Invoice.pdf" tag="PDF" lineCount={4}/>
            <FloatingCard animName="float2 6.5s" style={{top:"32%",left:"0%",width:"180px",zIndex:2}} title="Report.docx" tag="WORD" lineCount={3}/>
            <FloatingCard animName="float3 7s" style={{bottom:"8%",right:"12%",width:"170px",zIndex:2}} title="Data.xlsx" tag="EXCEL" lineCount={4}/>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"110px",height:"110px",borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,0.2),rgba(29,78,216,0.08) 60%,transparent)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(59,130,246,0.3)",animation:"pulseBd 3s ease-in-out infinite",zIndex:4}}>
              <Sparkles size={36} color="#3b82f6" strokeWidth={1.5} style={{animation:"spinSlow 12s linear infinite"}}/>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Stats */}
      <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{delay:0.6}}
        style={{position:"absolute",bottom:"2rem",left:"50%",transform:"translateX(-50%)",display:"flex",gap:0,borderRadius:"18px",background:"var(--dn-bg-card)",border:"1px solid var(--dn-border)",backdropFilter:"blur(20px)",overflow:"hidden",boxShadow:"var(--dn-shadow)",whiteSpace:"nowrap"}}>
        {[{val:"38+",label:"Tools"},{val:"∞",label:"Files"},{val:"0$",label:"Catch"},{val:"1hr",label:"Auto-delete"}].map((s,i)=>(
          <div key={s.val} style={{padding:"1rem 1.6rem",textAlign:"center",borderRight:i<3?"1px solid var(--dn-border)":"none"}}>
            <div style={{fontSize:"1.35rem",fontWeight:900,letterSpacing:"-0.04em",background:"linear-gradient(135deg,#3b82f6,#60a5fa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{s.val}</div>
            <div style={{fontSize:"0.68rem",color:"var(--dn-t4)",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:"0.1rem"}}>{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function CategoriesSection() {
  const cats = [
    {path:"/convert",label:"Convert PDF",desc:"PDF ↔ Word, Excel, PPT, Images",color:"#3b82f6",grad:"linear-gradient(135deg,#1e3a8a,#2563eb)",count:11,icon:FileOutput},
    {path:"/organize",label:"Organize PDF",desc:"Merge, Split, Rotate, Compress",color:"#8b5cf6",grad:"linear-gradient(135deg,#2e1065,#6d28d9)",count:9,icon:FileStack},
    {path:"/edit",label:"Edit PDF",desc:"Annotate, Watermark, Redact",color:"#f59e0b",grad:"linear-gradient(135deg,#451a03,#b45309)",count:10,icon:PenLine},
    {path:"/secure",label:"Secure PDF",desc:"Lock, Unlock, Encrypt, Protect",color:"#ef4444",grad:"linear-gradient(135deg,#450a0a,#dc2626)",count:6,icon:Lock},
    {path:"/ocr",label:"OCR Tools",desc:"AI text from PDFs & images",color:"#06b6d4",grad:"linear-gradient(135deg,#083344,#0891b2)",count:2,icon:ScanLine},
  ];
  const ref = useRef(null);
  const inView = useInView(ref, {once:true,margin:"-100px"});

  return (
    <section ref={ref} style={{padding:"5rem 1.5rem",background:"var(--dn-bg-alt)",transition:"var(--dn-transition)"}}>
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>
        <motion.div initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}} style={{textAlign:"center",marginBottom:"3rem"}}>
          <div style={{display:"inline-block",padding:"0.3rem 0.8rem",borderRadius:"999px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",color:"#60a5fa",fontSize:"0.7rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem"}}>Tool Categories</div>
          <h2 style={{fontSize:"clamp(2rem,4vw,3rem)",fontWeight:900,letterSpacing:"-0.04em",color:"var(--dn-t1)",marginBottom:"0.75rem"}}>Everything you need for PDFs</h2>
          <p style={{color:"var(--dn-t3)",fontSize:"1rem",maxWidth:"520px",margin:"0 auto",lineHeight:1.7}}>38 professional tools across 5 categories. No watermarks. No limits.</p>
        </motion.div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"1rem"}}>
          {cats.map((cat,i)=>(
            <motion.div key={cat.path} initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:i*0.08,duration:0.4}}>
              <Link to={cat.path} style={{textDecoration:"none"}}>
                <motion.div whileHover={{y:-5,boxShadow:`0 12px 40px ${cat.color}20`}}
                  style={{padding:"1.75rem",borderRadius:"20px",background:"var(--dn-bg-card)",border:"1px solid var(--dn-border)",cursor:"pointer",transition:"border-color 0.2s",boxShadow:"var(--dn-shadow)"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${cat.color}35`;}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--dn-border)";}}>
                  <div style={{width:"48px",height:"48px",borderRadius:"14px",background:cat.grad,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1rem",boxShadow:`0 4px 16px ${cat.color}30`}}>
                    <cat.icon size={22} color="#fff"/>
                  </div>
                  <div style={{color:"var(--dn-t1)",fontWeight:700,fontSize:"1rem",letterSpacing:"-0.02em",marginBottom:"0.3rem"}}>{cat.label}</div>
                  <div style={{color:"var(--dn-t4)",fontSize:"0.8rem",lineHeight:1.5,marginBottom:"0.75rem"}}>{cat.desc}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{padding:"0.2rem 0.6rem",borderRadius:"999px",background:`${cat.color}15`,color:cat.color,fontSize:"0.7rem",fontWeight:600}}>{cat.count} tools</span>
                    <ArrowRight size={14} color={cat.color}/>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PopularToolsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, {once:true,margin:"-80px"});
  const displayed = toolsList.filter(t=>t.popular||t.badge).slice(0,9);

  return (
    <section ref={ref} style={{padding:"5rem 1.5rem",background:"var(--dn-bg)",transition:"var(--dn-transition)"}}>
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>
        <motion.div initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}} style={{textAlign:"center",marginBottom:"3rem"}}>
          <div style={{display:"inline-block",padding:"0.3rem 0.8rem",borderRadius:"999px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",color:"#60a5fa",fontSize:"0.7rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem"}}>Most Used</div>
          <h2 style={{fontSize:"clamp(2rem,4vw,3rem)",fontWeight:900,letterSpacing:"-0.04em",color:"var(--dn-t1)",marginBottom:"0.75rem"}}>Popular tools</h2>
          <p style={{color:"var(--dn-t3)",fontSize:"1rem",lineHeight:1.7}}>The most used tools by millions of users every day.</p>
        </motion.div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"1rem"}}>
          {displayed.map((tool,i)=>(
            <motion.div key={tool.id} initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:i*0.06,duration:0.4}}>
              <Link to={`/tools/${tool.id}`} style={{textDecoration:"none"}}>
                <motion.div whileHover={{y:-5,scale:1.02}} whileTap={{scale:0.98}}
                  style={{padding:"1.5rem",borderRadius:"20px",background:"var(--dn-bg-card)",border:"1px solid var(--dn-border)",cursor:"pointer",position:"relative",overflow:"hidden",boxShadow:"var(--dn-shadow)",transition:"border-color 0.2s"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${tool.color}30`;}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--dn-border)";}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:`linear-gradient(90deg,transparent,${tool.color}50,transparent)`}}/>
                  <div style={{position:"absolute",top:0,right:0,width:"80px",height:"80px",background:`radial-gradient(circle at top right,${tool.cardTint},transparent 70%)`,pointerEvents:"none"}}/>
                  {tool.badge&&<div style={{position:"absolute",top:"1rem",right:"1rem",padding:"0.15rem 0.5rem",borderRadius:"999px",background:`${tool.color}20`,border:`1px solid ${tool.color}35`,color:tool.color,fontSize:"0.6rem",fontWeight:700,textTransform:"uppercase"}}>{tool.badge}</div>}
                  <div style={{width:"44px",height:"44px",borderRadius:"12px",background:tool.iconGrad,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1rem",boxShadow:`0 4px 14px ${tool.color}30`}}>
                    <tool.icon size={20} color="#fff"/>
                  </div>
                  <div style={{color:"var(--dn-t1)",fontWeight:700,fontSize:"1rem",letterSpacing:"-0.02em",marginBottom:"0.35rem"}}>{tool.label}</div>
                  <div style={{color:"var(--dn-t4)",fontSize:"0.82rem",lineHeight:1.65,marginBottom:"1rem"}}>{tool.desc}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{padding:"0.3rem 0.8rem",borderRadius:"999px",background:`${tool.color}15`,border:`1px solid ${tool.color}25`,color:tool.color,fontSize:"0.74rem",fontWeight:600,display:"flex",alignItems:"center",gap:"0.25rem"}}>
                      {tool.action} <ArrowRight size={10}/>
                    </span>
                    <span style={{color:"var(--dn-t4)",fontSize:"0.7rem"}}>{tool.accepts.split(",").slice(0,2).join(", ")}</span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{opacity:0}} animate={inView?{opacity:1}:{}} transition={{delay:0.5}} style={{textAlign:"center",marginTop:"2rem"}}>
          <Link to="/tools" style={{textDecoration:"none"}}>
            <motion.div whileHover={{scale:1.03}} whileTap={{scale:0.97}} style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",padding:"0.75rem 1.75rem",borderRadius:"12px",background:"var(--dn-bg-card)",border:"1px solid var(--dn-border)",color:"var(--dn-t2)",fontWeight:600,cursor:"pointer",fontSize:"0.9rem",boxShadow:"var(--dn-shadow)"}}>
              View all 38 tools <ArrowRight size={15}/>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, {once:true,margin:"-80px"});
  const steps = [
    {num:"01",icon:Upload,title:"Upload your file",desc:"Drag & drop or click to select. Supports PDF, DOCX, XLSX, PPTX, JPG, PNG, WEBP and more.",color:"#3b82f6"},
    {num:"02",icon:Settings,title:"Choose your tool",desc:"Select from 38 tools. Configure settings like page range, password, OCR language, or output format.",color:"#8b5cf6"},
    {num:"03",icon:Download,title:"Download instantly",desc:"Processing happens in seconds. Download your file immediately. Files are auto-deleted after 1 hour.",color:"#06b6d4"},
  ];
  return (
    <section ref={ref} style={{padding:"5rem 1.5rem",background:"var(--dn-bg-alt)",transition:"var(--dn-transition)"}}>
      <div style={{maxWidth:"1100px",margin:"0 auto"}}>
        <motion.div initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}} style={{textAlign:"center",marginBottom:"3.5rem"}}>
          <div style={{display:"inline-block",padding:"0.3rem 0.8rem",borderRadius:"999px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",color:"#60a5fa",fontSize:"0.7rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem"}}>How it works</div>
          <h2 style={{fontSize:"clamp(2rem,4vw,3rem)",fontWeight:900,letterSpacing:"-0.04em",color:"var(--dn-t1)"}}>Three steps to done</h2>
        </motion.div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1.5rem"}}>
          {steps.map((step,i)=>(
            <motion.div key={step.num} initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:i*0.15}}>
              <div style={{padding:"2rem",borderRadius:"24px",background:"var(--dn-bg-card)",border:"1px solid var(--dn-border)",position:"relative",overflow:"hidden",boxShadow:"var(--dn-shadow)"}}>
                <div style={{position:"absolute",top:"-0.5rem",right:"1rem",fontSize:"6rem",fontWeight:900,color:"var(--dn-step-num)",letterSpacing:"-0.05em",lineHeight:1,userSelect:"none"}}>{step.num}</div>
                <div style={{width:"52px",height:"52px",borderRadius:"15px",background:`${step.color}18`,border:`1px solid ${step.color}30`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1.25rem"}}>
                  <step.icon size={24} color={step.color}/>
                </div>
                <div style={{color:"var(--dn-t1)",fontWeight:700,fontSize:"1.1rem",letterSpacing:"-0.02em",marginBottom:"0.6rem"}}>{step.title}</div>
                <div style={{color:"var(--dn-t3)",fontSize:"0.875rem",lineHeight:1.75}}>{step.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  const ref = useRef(null);
  const inView = useInView(ref, {once:true,margin:"-80px"});
  const features = [
    {icon:Zap,title:"Lightning Fast",desc:"Optimized processing engine delivers results in seconds. Batch conversion included.",color:"#f59e0b"},
    {icon:Shield,title:"Privacy First",desc:"Files are processed in isolated environments and permanently deleted after 1 hour.",color:"#22c55e"},
    {icon:Globe,title:"Works Everywhere",desc:"No installation. No plugins. Works on Mac, Windows, iOS, and Android browsers.",color:"#3b82f6"},
    {icon:Award,title:"No Watermarks",desc:"All core tools are free with zero watermarks, no hidden fees, no registration walls.",color:"#8b5cf6"},
    {icon:TrendingUp,title:"38+ Tools",desc:"The most comprehensive PDF toolkit. Convert, organize, edit, secure, and OCR.",color:"#06b6d4"},
    {icon:Users,title:"Trusted by Millions",desc:"Over 5 million people use DocNova every month for their document workflows.",color:"#f472b6"},
  ];
  return (
    <section ref={ref} style={{padding:"5rem 1.5rem",background:"var(--dn-bg)",transition:"var(--dn-transition)"}}>
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>
        <motion.div initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}} style={{textAlign:"center",marginBottom:"3rem"}}>
          <div style={{display:"inline-block",padding:"0.3rem 0.8rem",borderRadius:"999px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",color:"#60a5fa",fontSize:"0.7rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem"}}>Why DocNova</div>
          <h2 style={{fontSize:"clamp(2rem,4vw,3rem)",fontWeight:900,letterSpacing:"-0.04em",color:"var(--dn-t1)",marginBottom:"0.75rem"}}>Built different. Built better.</h2>
          <p style={{color:"var(--dn-t3)",fontSize:"1rem",maxWidth:"520px",margin:"0 auto",lineHeight:1.7}}>DocNova isn't just another PDF tool. It's the complete document platform for modern workflows.</p>
        </motion.div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"1rem"}}>
          {features.map((f,i)=>(
            <motion.div key={f.title} initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:i*0.08}}>
              <motion.div whileHover={{y:-4}} style={{padding:"1.75rem",borderRadius:"20px",background:"var(--dn-bg-card)",border:"1px solid var(--dn-border)",boxShadow:"var(--dn-shadow)"}}>
                <div style={{width:"44px",height:"44px",borderRadius:"13px",background:`${f.color}15`,border:`1px solid ${f.color}25`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1rem"}}><f.icon size={20} color={f.color}/></div>
                <div style={{color:"var(--dn-t1)",fontWeight:700,fontSize:"1rem",letterSpacing:"-0.02em",marginBottom:"0.5rem"}}>{f.title}</div>
                <div style={{color:"var(--dn-t3)",fontSize:"0.875rem",lineHeight:1.7}}>{f.desc}</div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, {once:true,margin:"-80px"});
  const testimonials = [
    {name:"Sarah K.",role:"Freelance Designer",text:"DocNova replaced 5 different PDF tools I was paying for. The quality is incredible and it's free.",stars:5},
    {name:"Marcus T.",role:"Legal Assistant",text:"The PDF lock, unlock and redact tools are exactly what I need for confidential legal documents.",stars:5},
    {name:"Priya M.",role:"Student",text:"OCR on scanned textbook pages is a game-changer. Converts in seconds and the text is perfect.",stars:5},
    {name:"James R.",role:"Project Manager",text:"Merge and compress PDFs daily. No file size limits, no watermarks. DocNova is essential.",stars:5},
    {name:"Aiko N.",role:"UX Researcher",text:"The UI is gorgeous — actually enjoyable to use. Something no other PDF tool has managed.",stars:5},
    {name:"Carlos B.",role:"Teacher",text:"I use Word to PDF and PDF to Word constantly for lesson materials. Flawless conversion every time.",stars:5},
  ];
  return (
    <section ref={ref} style={{padding:"5rem 1.5rem",background:"var(--dn-bg-alt)",transition:"var(--dn-transition)"}}>
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>
        <motion.div initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}} style={{textAlign:"center",marginBottom:"3rem"}}>
          <div style={{display:"inline-block",padding:"0.3rem 0.8rem",borderRadius:"999px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",color:"#60a5fa",fontSize:"0.7rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem"}}>Testimonials</div>
          <h2 style={{fontSize:"clamp(2rem,4vw,3rem)",fontWeight:900,letterSpacing:"-0.04em",color:"var(--dn-t1)"}}>Loved by millions</h2>
        </motion.div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"1rem"}}>
          {testimonials.map((t,i)=>(
            <motion.div key={t.name} initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:i*0.08}}>
              <div style={{padding:"1.5rem",borderRadius:"20px",background:"var(--dn-bg-card)",border:"1px solid var(--dn-border)",boxShadow:"var(--dn-shadow)"}}>
                <div style={{display:"flex",gap:"0.2rem",marginBottom:"0.75rem"}}>
                  {Array.from({length:t.stars}).map((_,j)=><Star key={j} size={13} fill="#f59e0b" color="#f59e0b"/>)}
                </div>
                <div style={{color:"var(--dn-t2)",fontSize:"0.9rem",lineHeight:1.7,marginBottom:"1rem"}}>"{t.text}"</div>
                <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                  <div style={{width:"34px",height:"34px",borderRadius:"50%",background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:"0.85rem"}}>{t.name[0]}</div>
                  <div>
                    <div style={{color:"var(--dn-t1)",fontWeight:600,fontSize:"0.85rem"}}>{t.name}</div>
                    <div style={{color:"var(--dn-t4)",fontSize:"0.72rem"}}>{t.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number|null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, {once:true,margin:"-80px"});
  const faqs = [
    {q:"Is DocNova really free?",a:"Yes. All core tools — convert, merge, split, compress, rotate — are free with zero watermarks and no registration required."},
    {q:"Are my files safe and private?",a:"Files are uploaded over 256-bit SSL, processed in isolated temporary environments, and permanently deleted within 1 hour. We never read, store, or share your documents."},
    {q:"What file formats are supported?",a:"PDF, DOCX, DOC, XLSX, XLS, PPTX, PPT, JPG, JPEG, PNG, and WEBP. Each tool accepts formats relevant to its function."},
    {q:"Is there a file size limit?",a:"Free tier supports files up to 100MB. For larger files or batch processing, a Pro plan is planned for the future."},
    {q:"Do I need to install anything?",a:"No. DocNova works entirely in your browser. No downloads, no plugins, no accounts needed."},
    {q:"How accurate is the OCR?",a:"We use Tesseract OCR with AI preprocessing. For clearly scanned documents accuracy typically exceeds 98%. 50+ languages supported."},
    {q:"Can I use DocNova on mobile?",a:"Yes. DocNova is fully responsive and works on iOS Safari, Android Chrome, and all modern mobile browsers."},
  ];
  return (
    <section ref={ref} style={{padding:"5rem 1.5rem",background:"var(--dn-bg)",transition:"var(--dn-transition)"}}>
      <div style={{maxWidth:"800px",margin:"0 auto"}}>
        <motion.div initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}} style={{textAlign:"center",marginBottom:"3rem"}}>
          <div style={{display:"inline-block",padding:"0.3rem 0.8rem",borderRadius:"999px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",color:"#60a5fa",fontSize:"0.7rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem"}}>FAQ</div>
          <h2 style={{fontSize:"clamp(2rem,4vw,3rem)",fontWeight:900,letterSpacing:"-0.04em",color:"var(--dn-t1)"}}>Common questions</h2>
        </motion.div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.65rem"}}>
          {faqs.map((faq,i)=>(
            <motion.div key={i} initial={{opacity:0,y:10}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:i*0.06}}>
              <div onClick={()=>setOpen(open===i?null:i)} style={{padding:"1.25rem 1.5rem",borderRadius:"16px",background:"var(--dn-bg-card)",border:`1px solid ${open===i?"rgba(59,130,246,0.3)":"var(--dn-border)"}`,cursor:"pointer",boxShadow:"var(--dn-shadow)",transition:"border-color 0.2s"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem"}}>
                  <span style={{color:"var(--dn-t1)",fontWeight:600,fontSize:"0.95rem"}}>{faq.q}</span>
                  <ChevronDown size={17} color="var(--dn-t4)" style={{flexShrink:0,transition:"transform 0.3s",transform:open===i?"rotate(180deg)":"rotate(0)"}}/>
                </div>
                <AnimatePresence>
                  {open===i&&(
                    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}} style={{overflow:"hidden"}}>
                      <div style={{paddingTop:"0.875rem",color:"var(--dn-t3)",fontSize:"0.9rem",lineHeight:1.75}}>{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, {once:true,margin:"-80px"});
  return (
    <section ref={ref} style={{padding:"5rem 1.5rem",background:"var(--dn-bg-alt)",transition:"var(--dn-transition)"}}>
      <div style={{maxWidth:"900px",margin:"0 auto"}}>
        <motion.div initial={{opacity:0,scale:0.97}} animate={inView?{opacity:1,scale:1}:{}} transition={{duration:0.5}}>
          <div style={{padding:"3.5rem",borderRadius:"32px",background:"var(--dn-cta-bg)",border:"1px solid var(--dn-cta-border)",boxShadow:"var(--dn-cta-shad)",textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:"-60px",left:"50%",transform:"translateX(-50%)",width:"300px",height:"300px",borderRadius:"50%",background:"var(--dn-cta-blob)",filter:"blur(60px)",pointerEvents:"none"}}/>
            <div style={{position:"relative"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:"0.45rem",padding:"0.32rem 0.85rem",borderRadius:"999px",background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",color:"#93c5fd",fontSize:"0.76rem",fontWeight:600,marginBottom:"1.5rem"}}>
                <Sparkles size={11}/> Ready to get started?
              </div>
              <h2 style={{fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:900,letterSpacing:"-0.04em",color:"var(--dn-t1)",marginBottom:"1rem",lineHeight:1.1}}>
                Start working smarter<br/>with your documents.
              </h2>
              <p style={{color:"var(--dn-cta-t2)",fontSize:"1rem",lineHeight:1.7,marginBottom:"2rem",maxWidth:"480px",margin:"0 auto 2rem"}}>
                Join millions of users who trust DocNova. No sign up. No credit card. No limits.
              </p>
              <div style={{display:"flex",gap:"0.75rem",justifyContent:"center",flexWrap:"wrap"}}>
                <Link to="/tools" style={{textDecoration:"none"}}>
                  <motion.div whileHover={{scale:1.05,boxShadow:"0 0 40px rgba(59,130,246,0.5)"}} whileTap={{scale:0.97}}
                    style={{padding:"0.9rem 2rem",borderRadius:"14px",background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",color:"#fff",fontWeight:700,fontSize:"1rem",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"0.5rem"}}>
                    Start for Free <ArrowRight size={18}/>
                  </motion.div>
                </Link>
                <Link to="/about" style={{textDecoration:"none"}}>
                  <motion.div whileHover={{scale:1.03}} whileTap={{scale:0.97}}
                    style={{padding:"0.9rem 1.5rem",borderRadius:"14px",background:"var(--dn-bg-subtle)",border:"1px solid var(--dn-border)",color:"var(--dn-t2)",fontWeight:600,fontSize:"1rem",cursor:"pointer"}}>
                    Learn more
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"var(--dn-bg)",transition:"var(--dn-transition)"}}>
      <HeroSection/>
      <CategoriesSection/>
      <PopularToolsSection/>
      <HowItWorksSection/>
      <WhySection/>
      <TestimonialsSection/>
      <FAQSection/>
      <CTASection/>
    </div>
  );
}
