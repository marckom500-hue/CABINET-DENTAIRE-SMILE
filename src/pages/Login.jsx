import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthContext } from "../hooks/AuthContext";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   HELPERS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   BACKGROUND CANVAS â€” bulles Oâ‚‚ + gradient mÃ©dical
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function MedicalCanvas({ mouseRef }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let W, H;

    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    /* Soft gradient blobs â€” couleurs clinique */
    const blobs = [
      { x: 0.12, y: 0.18, vx:  0.00018, vy:  0.00012, r: 0.55, cr: [0,188,212],   a: 0.12, phase: 0   },
      { x: 0.80, y: 0.12, vx: -0.00014, vy:  0.00016, r: 0.45, cr: [38,198,218],  a: 0.10, phase: 2.5 },
      { x: 0.65, y: 0.80, vx:  0.00012, vy: -0.00015, r: 0.40, cr: [178,235,242], a: 0.13, phase: 4.8 },
      { x: 0.08, y: 0.72, vx:  0.00016, vy:  0.00010, r: 0.38, cr: [224,247,250], a: 0.18, phase: 1.2 },
      { x: 0.90, y: 0.55, vx: -0.00013, vy: -0.00012, r: 0.35, cr: [0,150,136],   a: 0.08, phase: 3.6 },
    ];

    /* Bulles Oâ‚‚ */
    const bubbles = Array.from({ length: 38 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight + window.innerHeight,
      r: Math.random() * 18 + 5,
      speed: Math.random() * 0.35 + 0.15,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.012 + 0.005,
      alpha: Math.random() * 0.18 + 0.06,
    }));

    /* MolÃ©cule nodes */
    const nodes = Array.from({ length: 22 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 2.8 + 1.2,
      alpha: Math.random() * 0.25 + 0.08,
    }));

    let t = 0;
    const draw = () => {
      t += 0.007;
      ctx.clearRect(0, 0, W, H);

      /* Fond blanc nacrÃ© */
      ctx.fillStyle = "#f8fcfd";
      ctx.fillRect(0, 0, W, H);

      /* Gradient mesh doux */
      const mesh = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      mesh.addColorStop(0,   "rgba(224,247,250,0.55)");
      mesh.addColorStop(0.5, "rgba(240,252,254,0.35)");
      mesh.addColorStop(1,   "rgba(248,253,254,0)");
      ctx.fillStyle = mesh;
      ctx.fillRect(0, 0, W, H);

      const mx = mouseRef.current.x / W;
      const my = mouseRef.current.y / H;

      /* Blobs couleur */
      blobs.forEach(b => {
        b.x += b.vx * Math.sin(t * 0.6 + b.phase);
        b.y += b.vy * Math.cos(t * 0.45 + b.phase);
        if (b.x < 0.04 || b.x > 0.96) b.vx *= -1;
        if (b.y < 0.04 || b.y > 0.96) b.vy *= -1;
        b.x = clamp(b.x, 0.04, 0.96);
        b.y = clamp(b.y, 0.04, 0.96);

        const dx = mx - b.x, dy = my - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 0.35) { b.x += dx * 0.0006; b.y += dy * 0.0006; }

        const pulse  = 1 + 0.08 * Math.sin(t * 1.1 + b.phase);
        const radius = b.r * Math.min(W, H) * pulse;
        const gx = b.x * W, gy = b.y * H;
        const g  = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
        const [r, gc, bl] = b.cr;
        g.addColorStop(0,   `rgba(${r},${gc},${bl},${b.a})`);
        g.addColorStop(0.5, `rgba(${r},${gc},${bl},${b.a * 0.4})`);
        g.addColorStop(1,   `rgba(${r},${gc},${bl},0)`);
        ctx.beginPath();
        ctx.arc(gx, gy, radius, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      /* MolÃ©cule connections */
      nodes.forEach((n, i) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < -10) n.x = W + 10;
        if (n.x > W + 10) n.x = -10;
        if (n.y < -10) n.y = H + 10;
        if (n.y > H + 10) n.y = -10;

        for (let j = i + 1; j < nodes.length; j++) {
          const q  = nodes[j];
          const ex = n.x - q.x, ey = n.y - q.y;
          const ed = Math.sqrt(ex * ex + ey * ey);
          if (ed < 110) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y); ctx.lineTo(q.x, q.y);
            const a = (1 - ed / 110) * 0.09;
            ctx.strokeStyle = `rgba(0,172,193,${a})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }

        const pa = n.alpha * (0.6 + 0.4 * Math.sin(t * 1.5 + i));
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,150,136,${pa})`;
        ctx.fill();
      });

      /* Bulles Oâ‚‚ montantes */
      bubbles.forEach(b => {
        b.y -= b.speed;
        b.wobble += b.wobbleSpeed;
        const wx = b.x + Math.sin(b.wobble) * 18;

        /* Mouse repulsion */
        const bx = wx, by = b.y;
        const bdx = bx - mouseRef.current.x, bdy = by - mouseRef.current.y;
        const bd  = Math.sqrt(bdx * bdx + bdy * bdy);
        if (bd < 100) { const f = (100 - bd) / 100; b.x += bdx * f * 0.018; }

        if (b.y < -b.r * 2) {
          b.y = H + b.r;
          b.x = Math.random() * W;
        }

        /* Bulle avec reflet interne */
        const bg = ctx.createRadialGradient(wx - b.r * 0.3, b.y - b.r * 0.3, 0, wx, b.y, b.r);
        bg.addColorStop(0,   `rgba(255,255,255,${b.alpha * 1.8})`);
        bg.addColorStop(0.4, `rgba(178,235,242,${b.alpha})`);
        bg.addColorStop(1,   `rgba(0,188,212,${b.alpha * 0.5})`);
        ctx.beginPath();
        ctx.arc(wx, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();

        /* Contour bulle */
        ctx.beginPath();
        ctx.arc(wx, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,172,193,${b.alpha * 0.6})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        /* Reflet highlight */
        ctx.beginPath();
        ctx.arc(wx - b.r * 0.32, b.y - b.r * 0.32, b.r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b.alpha * 2.5})`;
        ctx.fill();
      });

      /* Vignette lÃ©gÃ¨re sur les bords */
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.95);
      vig.addColorStop(0, "rgba(230,248,252,0)");
      vig.addColorStop(1, "rgba(200,240,248,0.22)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, display:"block" }} />;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   CROIX MÃ‰DICALE SVG ANIMÃ‰E (dÃ©cor fond)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function MedicalCrosses() {
  const crosses = [
    { x:"7%",  y:"8%",  size:28, opacity:0.07, delay:0,   dur:8  },
    { x:"92%", y:"12%", size:20, opacity:0.06, delay:-3,  dur:10 },
    { x:"4%",  y:"55%", size:16, opacity:0.055,delay:-5,  dur:12 },
    { x:"94%", y:"65%", size:24, opacity:0.065,delay:-2,  dur:9  },
    { x:"88%", y:"88%", size:18, opacity:0.06, delay:-7,  dur:11 },
    { x:"12%", y:"88%", size:22, opacity:0.065,delay:-4,  dur:13 },
  ];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none" }}>
      {crosses.map((c, i) => (
        <div key={i} style={{
          position:"absolute", left:c.x, top:c.y,
          transform:"translate(-50%,-50%)",
          opacity: c.opacity,
          animation:`crossFloat ${c.dur}s ease-in-out ${c.delay}s infinite`,
        }}>
          <svg width={c.size} height={c.size} viewBox="0 0 24 24" fill="none">
            <rect x="9"  y="2"  width="6"  height="20" rx="2" fill="#00acc1"/>
            <rect x="2"  y="9"  width="20" height="6"  rx="2" fill="#00acc1"/>
          </svg>
        </div>
      ))}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   ICÃ”NES DENTAIRES FLOTTANTES (dent, stÃ©thoscopeâ€¦)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function DentalIcons() {
  const icons = [
    { x:"91%", y:"34%", delay:0,  dur:14, opacity:0.065 },
    { x:"5%",  y:"32%", delay:-5, dur:17, opacity:0.055 },
  ];

  const ToothSVG = ({ size=32 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M20 8 C14 8 8 14 8 22 C8 30 12 36 14 44 C16 52 18 58 22 58 C26 58 28 50 32 50 C36 50 38 58 42 58 C46 58 48 52 50 44 C52 36 56 30 56 22 C56 14 50 8 44 8 C40 8 36 11 32 11 C28 11 24 8 20 8 Z"
        fill="#00acc1" opacity="0.7"/>
      <path d="M22 10 C18 10 13 15 13 22 C13 28 16 34 18 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none" }}>
      {icons.map((ic, i) => (
        <div key={i} style={{
          position:"absolute", left:ic.x, top:ic.y,
          transform:"translate(-50%,-50%)",
          opacity: ic.opacity,
          animation:`iconFloat ${ic.dur}s ease-in-out ${ic.delay}s infinite`,
        }}>
          <ToothSVG size={52} />
        </div>
      ))}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   PULSE RINGS MÃ‰DICAUX
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function PulseRings() {
  const rings = [
    { x:"88%", y:"20%", size:300, delay:0,  dur:15, col:"rgba(0,172,193,0.06)" },
    { x:"10%", y:"75%", size:240, delay:-5, dur:18, col:"rgba(0,150,136,0.055)" },
    { x:"75%", y:"82%", size:200, delay:-9, dur:13, col:"rgba(38,198,218,0.06)" },
  ];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none", overflow:"hidden" }}>
      {rings.map((r, i) => (
        <div key={i} style={{
          position:"absolute", left:r.x, top:r.y,
          width:r.size, height:r.size,
          transform:"translate(-50%,-50%)",
          border:`1px solid ${r.col}`,
          borderRadius:"50%",
          animation:`ringFloat ${r.dur}s ease-in-out ${r.delay}s infinite`,
        }}>
          <div style={{
            position:"absolute", inset:25,
            border:`1px solid ${r.col}`,
            borderRadius:"50%",
            animation:`ringFloat ${r.dur*0.7}s ease-in-out ${r.delay-2}s infinite reverse`,
          }}/>
        </div>
      ))}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   HEARTBEAT LINE (dÃ©coratif bas de page)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function HeartbeatLine() {
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, height:60, zIndex:1, pointerEvents:"none", overflow:"hidden" }}>
      <svg width="100%" height="60" viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path
          d="M0,30 L200,30 L230,30 L245,8 L260,52 L275,8 L290,52 L305,30 L340,30 L1200,30"
          fill="none"
          stroke="rgba(0,172,193,0.18)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0,30 L200,30 L230,30 L245,8 L260,52 L275,8 L290,52 L305,30 L340,30 L1200,30"
          fill="none"
          stroke="rgba(0,150,136,0.12)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="blur(2px)"
        />
      </svg>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   CUSTOM CURSOR mÃ©dical
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function CustomCursor({ mouseRef }) {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const rp      = useRef({ x: window.innerWidth/2, y: window.innerHeight/2 });
  const rafRef  = useRef(null);

  useEffect(() => {
    const animate = () => {
      const { x, y } = mouseRef.current;
      if (dotRef.current)  { dotRef.current.style.left = `${x}px`; dotRef.current.style.top = `${y}px`; }
      rp.current.x = lerp(rp.current.x, x, 0.12);
      rp.current.y = lerp(rp.current.y, y, 0.12);
      if (ringRef.current) { ringRef.current.style.left = `${rp.current.x}px`; ringRef.current.style.top = `${rp.current.y}px`; }
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const base = { position:"fixed", borderRadius:"50%", pointerEvents:"none", zIndex:9999, transform:"translate(-50%,-50%)" };
  return (
    <>
      <div ref={ringRef} style={{ ...base, width:30, height:30, border:"1.5px solid rgba(0,172,193,0.55)", background:"rgba(0,188,212,0.04)" }}/>
      <div ref={dotRef}  style={{ ...base, width:6,  height:6,  background:"#00acc1", boxShadow:"0 0 10px rgba(0,172,193,0.9)" }}/>
    </>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   ANIMATED FIELD
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AnimatedField({ id, label, type, value, onChange, placeholder, autoComplete, focused, onFocus, onBlur, suffix, animDelay, icon }) {
  return (
    <div style={{ animation:`fieldIn 0.65s cubic-bezier(0.22,1,0.36,1) ${animDelay} both` }}>
      <label htmlFor={id} style={{
        display:"flex", alignItems:"center", gap:7,
        fontFamily:"'DM Sans', sans-serif", fontSize:10, fontWeight:600,
        letterSpacing:"0.2em", textTransform:"uppercase",
        color: focused ? "#00838f" : "rgba(84,110,122,0.75)",
        marginBottom:8, marginLeft:2, transition:"color 0.3s",
      }}>
        {icon && <span style={{ opacity: focused ? 1 : 0.5, transition:"opacity 0.3s" }}>{icon}</span>}
        {label}
      </label>
      <div style={{ position:"relative" }}>
        <input
          id={id} type={type} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
          required autoComplete={autoComplete} placeholder={placeholder}
          style={{
            width:"100%",
            background: focused ? "rgba(224,247,250,0.55)" : "rgba(240,252,254,0.7)",
            border:`1.5px solid ${focused ? "rgba(0,172,193,0.65)" : "rgba(0,172,193,0.18)"}`,
            borderRadius:12, padding:"13px 16px",
            paddingRight: suffix ? 46 : 16,
            fontFamily:"'DM Sans', sans-serif", fontSize:14,
            color:"#263238", outline:"none", caretColor:"#00acc1",
            boxShadow: focused
              ? "0 0 0 4px rgba(0,172,193,0.1), 0 2px 12px rgba(0,172,193,0.08)"
              : "0 1px 4px rgba(0,172,193,0.06)",
            transition:"all 0.28s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        {suffix}
        <div style={{
          position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)",
          height:2, borderRadius:"0 0 12px 12px",
          width: focused ? "72%" : "0%",
          background:"linear-gradient(90deg,#00acc1,#00796b)",
          transition:"width 0.45s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: focused ? "0 0 10px rgba(0,172,193,0.5)" : "none",
        }}/>
      </div>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   EYE ICON
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   MAIN â€” LOGIN PAGE
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function Login() {
  const { login } = useAuthContext();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [focused, setFocused]           = useState(null);
  const [tilt, setTilt]                 = useState({ rx:0, ry:0 });
  const [rememberMe, setRememberMe]     = useState(false);
  const mouseRef = useRef({ x: window.innerWidth/2, y: window.innerHeight/2 });
  const cardRef  = useRef(null);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  // Restaurer l'email mÃ©morisÃ©
  useEffect(() => {
    const saved = localStorage.getItem("smile_remember_email");
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  useEffect(() => {
    const onMove = e => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const onCardMove = useCallback(e => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    setTilt({ rx: -dy * 5, ry: dx * 5 });
  }, []);

  const onCardLeave = useCallback(() => setTilt({ rx:0, ry:0 }), []);

  const handleSubmit = async e => {
    e?.preventDefault?.();
    setLoading(true); setError("");
    try {
      const { error: err } = await login(email, password);
      if (err) {
        setError("Email ou mot de passe incorrect.");
      } else {
        if (rememberMe) {
          localStorage.setItem("smile_remember_email", email);
        } else {
          localStorage.removeItem("smile_remember_email");
        }
      }
    } catch {
      setError("Connexion impossible. VÃ©rifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  /* IcÃ´nes champs */
  const EmailIcon = (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  );
  const LockIcon = (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
    </svg>
  );

  return (
    <>
      {/* â”€â”€ Global CSS â”€â”€ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { overflow:hidden; cursor:none; background:#f8fcfd; }

        @keyframes crossFloat {
          0%,100% { transform:translate(-50%,-50%) rotate(0deg) scale(1); }
          33%      { transform:translate(-50%,-50%) rotate(15deg) scale(1.08); }
          66%      { transform:translate(-50%,-50%) rotate(-8deg) scale(0.94); }
        }
        @keyframes iconFloat {
          0%,100% { transform:translate(-50%,-50%) translateY(0px); }
          50%      { transform:translate(-50%,-50%) translateY(-14px); }
        }
        @keyframes ringFloat {
          0%,100% { transform:translate(-50%,-50%) scale(1) rotate(0deg); }
          50%      { transform:translate(-50%,-50%) scale(1.06) rotate(40deg); }
        }
        @keyframes letterReveal {
          from { opacity:0; transform:translateY(18px); filter:blur(5px); }
          to   { opacity:1; transform:translateY(0);    filter:blur(0); }
        }
        @keyframes subtitleIn {
          from { opacity:0; letter-spacing:0.55em; }
          to   { opacity:0.65; letter-spacing:0.26em; }
        }
        @keyframes fieldIn {
          from { opacity:0; transform:translateX(-14px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes topLine {
          from { width:0; }
          to   { width:100%; }
        }
        @keyframes glowBreath {
          0%,100% { opacity:0.35; }
          50%      { opacity:0.55; }
        }
        @keyframes spin {
          to { transform:rotate(360deg); }
        }
        @keyframes shimmerBtn {
          0%       { left:-120%; }
          60%,100% { left:230%; }
        }
        @keyframes badgePop {
          from { opacity:0; transform:scale(0.7) translateY(6px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes lineReveal {
          from { transform:scaleX(0); }
          to   { transform:scaleX(1); }
        }
        input::placeholder { color:rgba(96,125,139,0.45) !important; }
        input:-webkit-autofill, input:-webkit-autofill:focus {
          -webkit-text-fill-color:#263238 !important;
          -webkit-box-shadow:0 0 0px 1000px rgba(224,247,250,0.8) inset !important;
          transition:background-color 5000s;
        }
      `}</style>

      {/* â”€â”€ Curseur â”€â”€ */}
      <CustomCursor mouseRef={mouseRef} />

      {/* â”€â”€ Layers de fond â”€â”€ */}
      <MedicalCanvas mouseRef={mouseRef} />
      <MedicalCrosses />
      <DentalIcons />
      <PulseRings />
      <HeartbeatLine />

      {/* â”€â”€ Layout â”€â”€ */}
      <div style={{
        position:"relative", zIndex:10,
        minHeight:"100vh",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:24,
      }}>
        {/* Carte principale */}
        <div
          ref={cardRef}
          onMouseMove={onCardMove}
          onMouseLeave={onCardLeave}
          style={{
            width:"100%", maxWidth:420,
            opacity: mounted ? 1 : 0,
            transform:`
              perspective(1000px)
              rotateX(${tilt.rx}deg)
              rotateY(${tilt.ry}deg)
              translateY(${mounted ? 0 : 32}px)
              scale(${mounted ? 1 : 0.97})
            `,
            transition:"transform 0.65s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease",
            willChange:"transform",
            position:"relative",
          }}
        >
          {/* Halo mÃ©dical derriÃ¨re la carte */}
          <div style={{
            position:"absolute", inset:-4, borderRadius:34,
            background:"linear-gradient(135deg,rgba(0,188,212,0.3),rgba(0,150,136,0.2),rgba(38,198,218,0.25))",
            filter:"blur(24px)",
            animation:"glowBreath 3.5s ease-in-out infinite",
            zIndex:-1,
          }}/>

          {/* Surface de la carte â€” blanc clinique */}
          <div style={{
            background:"rgba(255,255,255,0.88)",
            backdropFilter:"blur(40px) saturate(180%)",
            WebkitBackdropFilter:"blur(40px) saturate(180%)",
            border:"1.5px solid rgba(0,172,193,0.15)",
            borderRadius:28,
            padding:"46px 40px 42px",
            boxShadow:`
              0 0 0 1px rgba(255,255,255,0.9) inset,
              0 30px 80px rgba(0,120,140,0.12),
              0 8px 24px rgba(0,172,193,0.08)
            `,
            position:"relative", overflow:"hidden",
          }}>
            {/* Reflet interne selon tilt */}
            <div style={{
              position:"absolute", inset:0, borderRadius:28, pointerEvents:"none",
              background:`radial-gradient(ellipse at ${50+tilt.ry*4}% ${50-tilt.rx*4}%, rgba(178,235,242,0.2) 0%, transparent 65%)`,
              transition:"background 0.08s",
            }}/>

            {/* Ligne top tricolore */}
            <div style={{
              position:"absolute", top:0, left:0, right:0, height:3,
              borderRadius:"28px 28px 0 0",
              background:"linear-gradient(90deg,#00acc1 0%,#00838f 40%,#00bcd4 70%,#4dd0e1 100%)",
              animation: mounted ? "topLine 1s cubic-bezier(0.22,1,0.36,1) 0.4s both" : "none",
            }}/>

            {/* â”€â”€ EN-TÃŠTE â”€â”€ */}
            <div style={{ textAlign:"center", marginBottom:38 }}>

              {/* Badge "Cabinet Dentaire" */}
              <div style={{
                display:"inline-flex", alignItems:"center", gap:6,
                background:"rgba(0,172,193,0.08)",
                border:"1px solid rgba(0,172,193,0.2)",
                borderRadius:20, padding:"5px 14px",
                marginBottom:22,
                animation:"badgePop 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both",
              }}>
                {/* Croix mÃ©dicale mini */}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#00838f">
                  <rect x="9" y="2" width="6" height="20" rx="2"/>
                  <rect x="2" y="9" width="20" height="6" rx="2"/>
                </svg>
                <span style={{
                  fontFamily:"'DM Sans', sans-serif", fontSize:10, fontWeight:600,
                  letterSpacing:"0.18em", textTransform:"uppercase", color:"#00838f",
                }}>Cabinet Dentaire SMILE</span>
              </div>

              {/* Logo */}
              <div style={{
                width:108, height:108, borderRadius:"50%",
                background:"rgba(255,255,255,0.94)",
                border:"1.5px solid rgba(0,172,193,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 22px",
                padding:14,
                boxShadow:"0 12px 34px rgba(0,120,140,0.14), 0 0 0 5px rgba(0,172,193,0.06)",
                overflow:"hidden",
                opacity: mounted ? 1 : 0,
                transition:"opacity 0.7s 0.3s",
              }}>
                <img
                  src="/SMILE.jpg"
                  alt="SMILE"
                  style={{
                    width:"100%",
                    height:"100%",
                    objectFit:"contain",
                    display:"block",
                    borderRadius:"50%",
                  }}
                />
              </div>

              {/* Titre SMILE */}
              <div style={{ lineHeight:1, letterSpacing:"0.2em", marginBottom:6 }}>
                {"SMILE".split("").map((ch, i) => (
                  <span key={i} style={{
                    display:"inline-block",
                    fontFamily:"'Cormorant', serif",
                    fontSize:44, fontWeight:600,
                    color:"#006064",
                    textShadow:"0 2px 20px rgba(0,172,193,0.2)",
                    animation:`letterReveal 0.7s cubic-bezier(0.22,1,0.36,1) ${0.35+i*0.09}s both`,
                  }}>{ch}</span>
                ))}
              </div>

              <p style={{
                fontFamily:"'Cormorant', serif", fontStyle:"italic",
                fontSize:14, color:"rgba(0,96,100,0.6)",
                animation:"subtitleIn 1s cubic-bezier(0.22,1,0.36,1) 0.95s both",
              }}>
                Gestion dentaire sÃ©curisÃ©e
              </p>

              {/* SÃ©parateur ornemental */}
              <div style={{ display:"flex", alignItems:"center", gap:8, margin:"18px auto 0", width:140, animation:"fieldIn 0.6s ease 1s both" }}>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(0,172,193,0.3))", transformOrigin:"right", animation:"lineReveal 0.9s ease 1s both" }}/>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(0,172,193,0.5)">
                  <rect x="9" y="2" width="6" height="20" rx="2"/>
                  <rect x="2" y="9" width="20" height="6" rx="2"/>
                </svg>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(0,150,136,0.3),transparent)", transformOrigin:"left", animation:"lineReveal 0.9s ease 1s both" }}/>
              </div>
            </div>

            {/* â”€â”€ ERREUR â”€â”€ */}
            {error && (
              <div style={{
                background:"rgba(229,57,53,0.07)", border:"1px solid rgba(229,57,53,0.18)",
                borderRadius:12, padding:"11px 15px", marginBottom:20,
                fontFamily:"'DM Sans', sans-serif", fontSize:13,
                color:"rgba(183,28,28,0.9)",
                display:"flex", alignItems:"center", gap:8,
              }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(183,28,28,0.8)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                {error}
              </div>
            )}

            {/* â”€â”€ FORMULAIRE â”€â”€ */}
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <AnimatedField
                id="email" label="Adresse email" type="email"
                value={email} onChange={setEmail} placeholder="personnel@gmail.com"
                autoComplete="email" focused={focused==="email"}
                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                animDelay="1.1s" icon={EmailIcon}
              />
              <AnimatedField
                id="password" label="Mot de passe"
                type={showPassword ? "text" : "password"}
                value={password} onChange={setPassword} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                autoComplete="current-password" focused={focused==="password"}
                onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                animDelay="1.22s" icon={LockIcon}
                suffix={
                  <button type="button" onClick={() => setShowPassword(p=>!p)}
                    style={{
                      position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", cursor:"none",
                      color:"rgba(84,110,122,0.55)", display:"flex",
                      alignItems:"center", transition:"color 0.2s", padding:4,
                    }}>
                    <EyeIcon open={showPassword}/>
                  </button>
                }
              />

              {/* Bouton Se connecter */}
              <button
                type="button" onClick={handleSubmit} disabled={loading}
                style={{
                  marginTop:4, width:"100%", padding:"14px 16px",
                  border:"none", borderRadius:13,
                  cursor: loading ? "not-allowed" : "none",
                  fontFamily:"'DM Sans', sans-serif", fontSize:14, fontWeight:600,
                  color:"#fff", letterSpacing:"0.04em",
                  position:"relative", overflow:"hidden",
                  background:"linear-gradient(135deg,#00838f 0%,#00acc1 50%,#00796b 100%)",
                  boxShadow:"0 4px 24px rgba(0,172,193,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset",
                  opacity: loading ? 0.65 : 1,
                  transition:"transform 0.22s, box-shadow 0.3s, opacity 0.3s",
                  animation:"fieldIn 0.65s cubic-bezier(0.22,1,0.36,1) 1.35s both",
                }}
                onMouseEnter={e => { if(!loading){ e.currentTarget.style.transform="translateY(-2px) scale(1.01)"; e.currentTarget.style.boxShadow="0 10px 36px rgba(0,172,193,0.48), 0 0 0 1px rgba(255,255,255,0.2) inset"; }}}
                onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 24px rgba(0,172,193,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset"; }}
                onMouseDown={e => { if(!loading) e.currentTarget.style.transform="scale(0.985)"; }}
                onMouseUp={e => { if(!loading) e.currentTarget.style.transform="translateY(-2px) scale(1.01)"; }}
              >
                {/* Shimmer */}
                <span style={{
                  position:"absolute", top:0, left:"-120%", width:"60%", height:"100%",
                  background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)",
                  transform:"skewX(-20deg)",
                  animation: loading ? "none" : "shimmerBtn 3s ease-in-out 2s infinite",
                }}/>

                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ animation:"spin 0.78s linear infinite" }}>
                      <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Verification
                  </span>
                ) : (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    Se connecter
                  </span>
                )}
              </button>

              {/* â”€â”€ Se souvenir de moi + Aide â”€â”€ */}
              <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fieldIn 0.65s cubic-bezier(0.22,1,0.36,1) 1.42s both" }}>

                {/* Checkbox Se souvenir */}
                <label style={{
                  display:"flex", alignItems:"center", gap:10,
                  cursor:"none", userSelect:"none",
                }}>
                  <div
                    onClick={() => setRememberMe(p => !p)}
                    style={{
                      width:18, height:18, borderRadius:5, flexShrink:0,
                      border:`1.5px solid ${rememberMe ? "#00acc1" : "rgba(0,172,193,0.3)"}`,
                      background: rememberMe ? "linear-gradient(135deg,#00838f,#00acc1)" : "rgba(240,252,254,0.8)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                      boxShadow: rememberMe ? "0 2px 10px rgba(0,172,193,0.35)" : "none",
                      transform: rememberMe ? "scale(1.08)" : "scale(1)",
                    }}
                  >
                    {rememberMe && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontFamily:"'DM Sans', sans-serif", fontSize:13, fontWeight:400,
                    color: rememberMe ? "#00696f" : "rgba(84,110,122,0.7)",
                    transition:"color 0.2s",
                  }}>
                    Se souvenir de moi
                  </span>
                </label>

                {/* Lien aide admin */}
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  padding:"10px 14px",
                  background:"rgba(0,172,193,0.04)",
                  border:"1px solid rgba(0,172,193,0.1)",
                  borderRadius:10,
                }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="rgba(0,131,143,0.6)" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span style={{
                    fontFamily:"'DM Sans', sans-serif", fontSize:12,
                    color:"rgba(84,110,122,0.7)",
                  }}>
                    Besoin d'aide ?{" "}
                  </span>
                  <a
                    href="mailto:marc@gmail.com"
                    style={{
                      fontFamily:"'DM Sans', sans-serif", fontSize:12, fontWeight:600,
                      color:"#00838f", textDecoration:"none",
                      borderBottom:"1px dashed rgba(0,131,143,0.35)",
                      paddingBottom:1,
                      transition:"color 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color="#006064"; e.currentTarget.style.borderBottomStyle="solid"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="#00838f"; e.currentTarget.style.borderBottomStyle="dashed"; }}
                  >
                    Contacter l'administrateur
                  </a>
                </div>

              </div>
            </div>

            {/* Badges de confiance */}
            <div style={{
              display:"flex", justifyContent:"center", gap:16,
              marginTop:24,
              animation:"fieldIn 0.6s ease 1.5s both",
            }}>
              {[
                // { icon:"ðŸ”’", label:"ChiffrÃ© SSL" },
                // { icon:"âš•ï¸", label:"Norme HDS" },
                // { icon:"âœ“",  label:"RGPD" },
              ].map((b, i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:4,
                  background:"rgba(0,172,193,0.06)",
                  border:"1px solid rgba(0,172,193,0.12)",
                  borderRadius:20, padding:"4px 10px",
                }}>
                  <span style={{ fontSize:10 }}>{b.icon}</span>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:600, letterSpacing:"0.1em", color:"rgba(0,96,100,0.6)", textTransform:"uppercase" }}>{b.label}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <p style={{
              marginTop:18, textAlign:"center",
              fontFamily:"'DM Sans', sans-serif", fontSize:11,
              color:"rgba(84,110,122,0.4)", letterSpacing:"0.05em",
              animation:"fieldIn 0.6s ease 1.6s both",
            }}>
               2026 SMILE  Acces reserve aux personnels
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
