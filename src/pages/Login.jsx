﻿// import { useState, useEffect, useRef, useCallback } from "react";
// import { useAuthContext } from "../hooks/AuthContext";

// const lerp = (a, b, t) => a + (b - a) * t;
// const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// /* ─────────────────────────────────────────────
//    CANVAS ALLÉGÉ — blobs doux + bulles O₂
//    (throttle 30fps, pas de mouse tracking lourd)
// ───────────────────────────────────────────── */
// function MedicalCanvas() {
//   const canvasRef = useRef(null);
//   const rafRef    = useRef(null);
//   const lastRef   = useRef(0);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx    = canvas.getContext("2d");
//     let W, H;

//     const resize = () => {
//       W = canvas.width  = window.innerWidth;
//       H = canvas.height = window.innerHeight;
//     };
//     resize();
//     window.addEventListener("resize", resize);

//     const blobs = [
//       { x:0.12, y:0.18, vx:0.00018,  vy:0.00012,  r:0.52, cr:[0,188,212],  a:0.11, ph:0   },
//       { x:0.80, y:0.14, vx:-0.00013, vy:0.00015,  r:0.42, cr:[38,198,218], a:0.09, ph:2.5 },
//       { x:0.62, y:0.78, vx:0.00011,  vy:-0.00013, r:0.38, cr:[178,235,242],a:0.12, ph:4.8 },
//       { x:0.08, y:0.70, vx:0.00014,  vy:0.00009,  r:0.36, cr:[224,247,250],a:0.16, ph:1.2 },
//       { x:0.88, y:0.55, vx:-0.00012, vy:-0.00011, r:0.32, cr:[0,150,136],  a:0.07, ph:3.6 },
//     ];

//     const bubbles = Array.from({ length: 22 }, () => ({
//       x:     Math.random() * window.innerWidth,
//       y:     Math.random() * window.innerHeight + window.innerHeight,
//       r:     Math.random() * 14 + 4,
//       speed: Math.random() * 0.3 + 0.12,
//       wobble:      Math.random() * Math.PI * 2,
//       wobbleSpeed: Math.random() * 0.01 + 0.004,
//       alpha: Math.random() * 0.15 + 0.05,
//     }));

//     let t = 0;
//     const FPS = 30;
//     const INTERVAL = 1000 / FPS;

//     const draw = (ts) => {
//       rafRef.current = requestAnimationFrame(draw);
//       if (ts - lastRef.current < INTERVAL) return;
//       lastRef.current = ts;
//       t += 0.01;

//       ctx.clearRect(0, 0, W, H);
//       ctx.fillStyle = "#f8fcfd";
//       ctx.fillRect(0, 0, W, H);

//       // Gradient mesh central
//       const mesh = ctx.createRadialGradient(W*.5, H*.5, 0, W*.5, H*.5, Math.max(W,H)*.7);
//       mesh.addColorStop(0,   "rgba(224,247,250,0.5)");
//       mesh.addColorStop(0.5, "rgba(240,252,254,0.3)");
//       mesh.addColorStop(1,   "rgba(248,253,254,0)");
//       ctx.fillStyle = mesh;
//       ctx.fillRect(0, 0, W, H);

//       // Blobs flottants
//       blobs.forEach(b => {
//         b.x += b.vx * Math.sin(t * 0.5 + b.ph);
//         b.y += b.vy * Math.cos(t * 0.4 + b.ph);
//         if (b.x < 0.04 || b.x > 0.96) b.vx *= -1;
//         if (b.y < 0.04 || b.y > 0.96) b.vy *= -1;
//         b.x = clamp(b.x, 0.04, 0.96);
//         b.y = clamp(b.y, 0.04, 0.96);

//         const pulse  = 1 + 0.07 * Math.sin(t + b.ph);
//         const radius = b.r * Math.min(W, H) * pulse;
//         const gx = b.x * W, gy = b.y * H;
//         const g  = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
//         const [r, gc, bl] = b.cr;
//         g.addColorStop(0,   `rgba(${r},${gc},${bl},${b.a})`);
//         g.addColorStop(0.5, `rgba(${r},${gc},${bl},${b.a * 0.35})`);
//         g.addColorStop(1,   `rgba(${r},${gc},${bl},0)`);
//         ctx.beginPath();
//         ctx.arc(gx, gy, radius, 0, Math.PI * 2);
//         ctx.fillStyle = g;
//         ctx.fill();
//       });

//       // Bulles O₂
//       bubbles.forEach(b => {
//         b.y      -= b.speed;
//         b.wobble += b.wobbleSpeed;
//         const wx  = b.x + Math.sin(b.wobble) * 14;
//         if (b.y < -b.r * 2) { b.y = H + b.r; b.x = Math.random() * W; }

//         const bg = ctx.createRadialGradient(wx - b.r*.3, b.y - b.r*.3, 0, wx, b.y, b.r);
//         bg.addColorStop(0,   `rgba(255,255,255,${b.alpha * 1.7})`);
//         bg.addColorStop(0.4, `rgba(178,235,242,${b.alpha})`);
//         bg.addColorStop(1,   `rgba(0,188,212,${b.alpha * 0.45})`);
//         ctx.beginPath();
//         ctx.arc(wx, b.y, b.r, 0, Math.PI * 2);
//         ctx.fillStyle = bg;
//         ctx.fill();

//         ctx.beginPath();
//         ctx.arc(wx, b.y, b.r, 0, Math.PI * 2);
//         ctx.strokeStyle = `rgba(0,172,193,${b.alpha * 0.5})`;
//         ctx.lineWidth = 0.5;
//         ctx.stroke();

//         // Highlight
//         ctx.beginPath();
//         ctx.arc(wx - b.r*.3, b.y - b.r*.3, b.r*.22, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(255,255,255,${b.alpha * 2.2})`;
//         ctx.fill();
//       });

//       // Vignette bords
//       const vig = ctx.createRadialGradient(W/2, H/2, H*.28, W/2, H/2, H*.92);
//       vig.addColorStop(0, "rgba(230,248,252,0)");
//       vig.addColorStop(1, "rgba(200,240,248,0.2)");
//       ctx.fillStyle = vig;
//       ctx.fillRect(0, 0, W, H);
//     };

//     rafRef.current = requestAnimationFrame(draw);
//     return () => {
//       cancelAnimationFrame(rafRef.current);
//       window.removeEventListener("resize", resize);
//     };
//   }, []);

//   return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, display:"block" }} />;
// }

// /* ─────────────────────────────────────────────
//    MOTIFS DÉCORATIFS AUTOUR DE LA PAGE
//    (purement CSS/SVG, aucun JS = 0 lag)
// ───────────────────────────────────────────── */
// function DecorativePatterns() {
//   // Coins ornementaux
//   const cornerStyle = (pos) => ({
//     position:"absolute", ...pos,
//     width:180, height:180,
//     pointerEvents:"none",
//     opacity:0.55,
//   });

//   // Arcs dentaires en coin
//   const ArcCorner = ({ flip }) => (
//     <svg width="180" height="180" viewBox="0 0 180 180" fill="none"
//       style={{ transform: flip ? "scale(-1,1)" : "none" }}>
//       <path d="M10,170 Q10,10 170,10" stroke="#00acc1" strokeWidth="2" fill="none" strokeDasharray="5 5"/>
//       <path d="M30,170 Q30,30 170,30" stroke="#00838f" strokeWidth="1.5" fill="none" strokeDasharray="4 6"/>
//       <path d="M55,170 Q55,55 170,55" stroke="#4dd0e1" strokeWidth="1.2" fill="none" strokeDasharray="3 8"/>
//       <circle cx="10"  cy="170" r="3" fill="#00acc1"/>
//       <circle cx="30"  cy="170" r="2" fill="#00838f"/>
//       <circle cx="170" cy="10"  r="3" fill="#00acc1"/>
//       <circle cx="170" cy="30"  r="2" fill="#00838f"/>
//     </svg>
//   );

//   // Motif hexagones en bande latérale
//   const HexBand = ({ right }) => (
//     <div style={{
//       position:"absolute",
//       [right ? "right" : "left"]: 0,
//       top:0, bottom:0, width:64,
//       opacity:0.35, pointerEvents:"none",
//       overflow:"hidden",
//     }}>
//       <svg width="64" height="100%" viewBox="0 0 64 800" preserveAspectRatio="xMidYMid slice">
//         {Array.from({length:18}, (_,i) => {
//           const row = i;
//           const offset = row % 2 === 0 ? 0 : 18;
//           return [0,1].map(col => {
//             const cx = col * 36 + offset + 14;
//             const cy = row * 24 + 16;
//             return (
//               <polygon key={`${i}-${col}`}
//                 points={`${cx},${cy-11} ${cx+10},${cy-5} ${cx+10},${cy+5} ${cx},${cy+11} ${cx-10},${cy+5} ${cx-10},${cy-5}`}
//                 fill="none" stroke="#00acc1" strokeWidth="1.5"
//               />
//             );
//           });
//         })}
//       </svg>
//     </div>
//   );

//   // Croix médicales en filigrane (coins opposés)
//   const CrossGrid = ({ pos }) => (
//     <div style={{ position:"absolute", ...pos, opacity:0.4, pointerEvents:"none" }}>
//       <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
//         {[20,50,80,110].map(x =>
//           [20,50,80,110].map(y => (
//             <g key={`${x}-${y}`} transform={`translate(${x},${y})`}>
//               <rect x="-5" y="-2" width="10" height="4" rx="1.5" fill="#00acc1"/>
//               <rect x="-2" y="-5" width="4" height="10" rx="1.5" fill="#00acc1"/>
//             </g>
//           ))
//         )}
//       </svg>
//     </div>
//   );

//   // Lignes de scan horizontales décoratives
//   const ScanLines = () => (
//     <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", opacity:0.08 }}>
//       {Array.from({length:12}, (_,i) => (
//         <div key={i} style={{
//           position:"absolute",
//           top:`${(i+1) * 8}%`,
//           left:0, right:0,
//           height:1,
//           background:"linear-gradient(90deg, transparent 0%, #00acc1 20%, #00838f 50%, #00acc1 80%, transparent 100%)",
//         }}/>
//       ))}
//     </div>
//   );

//   // Cercles concentriques dans les coins
//   const ConcentricCircles = ({ pos }) => (
//     <div style={{ position:"absolute", ...pos, opacity:0.45, pointerEvents:"none" }}>
//       <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
//         {[20,40,60,80,100].map((r,i) => (
//           <circle key={i} cx="0" cy="160" r={r}
//             stroke={i%2===0 ? "#00acc1" : "#00838f"}
//             strokeWidth="1.4" fill="none"
//             strokeDasharray={i%2===0 ? "4 6" : "2 8"}
//           />
//         ))}
//       </svg>
//     </div>
//   );

//   // Dent SVG décorative légère (coins)
//   const ToothDeco = ({ pos, size=52, flip=false }) => (
//     <div style={{ position:"absolute", ...pos, opacity:0.55, pointerEvents:"none",
//       transform: flip ? "scaleX(-1)" : "none" }}>
//       <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
//         <path d="M22 6C18 6 14 10 14 18c0 8 3 16 5 26 2 8 4 14 8 14s6-8 5-8-1 8 3 8 6-6 8-14c2-10 5-18 5-26 0-8-4-12-8-12-4 0-7 3-10 3S26 6 22 6Z"
//           fill="#00acc1"/>
//         <path d="M20 9c-3 2-5 6-5 10 0 6 2 12 4 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
//       </svg>
//     </div>
//   );

//   // Bande ECG en haut
//   const EcgTop = () => (
//     <div style={{ position:"absolute", top:0, left:0, right:0, height:40, pointerEvents:"none", overflow:"hidden", opacity:0.5 }}>
//       <svg width="100%" height="40" viewBox="0 0 1200 40" preserveAspectRatio="none">
//         <path d="M0,20 L300,20 L330,20 L345,5 L358,35 L371,5 L384,35 L397,20 L430,20 L730,20 L760,20 L775,5 L788,35 L801,5 L814,35 L827,20 L860,20 L1200,20"
//           fill="none" stroke="#00acc1" strokeWidth="1.2" strokeLinecap="round"/>
//       </svg>
//     </div>
//   );

//   // Bande ECG en bas
//   const EcgBottom = () => (
//     <div style={{ position:"absolute", bottom:0, left:0, right:0, height:40, pointerEvents:"none", overflow:"hidden", opacity:0.5 }}>
//       <svg width="100%" height="40" viewBox="0 0 1200 40" preserveAspectRatio="none">
//         <path d="M0,20 L200,20 L230,20 L245,5 L260,35 L275,5 L290,35 L305,20 L340,20 L600,20 L630,20 L645,5 L660,35 L675,5 L690,35 L705,20 L740,20 L1200,20"
//           fill="none" stroke="#00838f" strokeWidth="1.2" strokeLinecap="round"/>
//       </svg>
//     </div>
//   );

//   return (
//     <div style={{ position:"fixed", inset:0, zIndex:2, pointerEvents:"none", overflow:"hidden" }}>
//       {/* Coins ornementaux */}
//       <div style={cornerStyle({ top:0, left:0 })}><ArcCorner flip={false}/></div>
//       <div style={cornerStyle({ top:0, right:0 })}><ArcCorner flip={true}/></div>
//       <div style={{ ...cornerStyle({ bottom:0, left:0 }), transform:"scaleY(-1)" }}><ArcCorner flip={false}/></div>
//       <div style={{ ...cornerStyle({ bottom:0, right:0 }), transform:"scale(-1,-1)" }}><ArcCorner flip={false}/></div>

//       {/* Bandes hexagonales latérales */}
//       <HexBand right={false}/>
//       <HexBand right={true}/>

//       {/* Grilles de croix médicales */}
//       <CrossGrid pos={{ top:12, right:80 }}/>
//       <CrossGrid pos={{ bottom:12, left:80 }}/>

//       {/* Cercles concentriques */}
//       <ConcentricCircles pos={{ top:0, left:0 }}/>
//       <ConcentricCircles pos={{ bottom:0, right:0, transform:"rotate(180deg)" }}/>

//       {/* Dents décoratives */}
//       <ToothDeco pos={{ top:"12%", right:18 }} size={48}/>
//       <ToothDeco pos={{ bottom:"14%", left:18 }} size={42} flip/>
//       <ToothDeco pos={{ top:"52%", left:14 }} size={36}/>
//       <ToothDeco pos={{ top:"40%", right:14 }} size={34} flip/>

//       {/* Scan lines */}
//       <ScanLines/>

//       {/* ECG haut et bas */}
//       <EcgTop/>
//       <EcgBottom/>

//       {/* Points déco subtils */}
//       <div style={{ position:"absolute", inset:0, opacity:0.18,
//         backgroundImage:"radial-gradient(circle, #00acc1 1.5px, transparent 1.5px)",
//         backgroundSize:"32px 32px" }}/>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────
//    CROIX MÉDICALES FLOTTANTES (CSS only)
// ───────────────────────────────────────────── */
// function MedicalCrosses() {
//   const crosses = [
//     { x:"7%",  y:"8%",  size:28, op:0.45, delay:0,  dur:8  },
//     { x:"92%", y:"12%", size:20, op:0.4, delay:-3, dur:10 },
//     { x:"4%",  y:"55%", size:16, op:0.38,delay:-5, dur:12 },
//     { x:"94%", y:"65%", size:24, op:0.42,delay:-2, dur:9  },
//     { x:"88%", y:"88%", size:18, op:0.4, delay:-7, dur:11 },
//     { x:"12%", y:"88%", size:22, op:0.42,delay:-4, dur:13 },
//   ];
//   return (
//     <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none" }}>
//       {crosses.map((c, i) => (
//         <div key={i} style={{
//           position:"absolute", left:c.x, top:c.y,
//           transform:"translate(-50%,-50%)",
//           opacity:c.op,
//           animation:`crossFloat ${c.dur}s ease-in-out ${c.delay}s infinite`,
//         }}>
//           <svg width={c.size} height={c.size} viewBox="0 0 24 24">
//             <rect x="9"  y="2"  width="6"  height="20" rx="2" fill="#00acc1"/>
//             <rect x="2"  y="9"  width="20" height="6"  rx="2" fill="#00acc1"/>
//           </svg>
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────
//    PULSE RINGS (CSS only)
// ───────────────────────────────────────────── */
// function PulseRings() {
//   const rings = [
//     { x:"88%", y:"20%", size:260, delay:0,  dur:15, col:"rgba(0,172,193,0.28)" },
//     { x:"10%", y:"75%", size:200, delay:-5, dur:18, col:"rgba(0,150,136,0.25)"},
//     { x:"75%", y:"82%", size:170, delay:-9, dur:13, col:"rgba(38,198,218,0.28)"},
//   ];
//   return (
//     <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none", overflow:"hidden" }}>
//       {rings.map((r, i) => (
//         <div key={i} style={{
//           position:"absolute", left:r.x, top:r.y,
//           width:r.size, height:r.size,
//           transform:"translate(-50%,-50%)",
//           border:`1px solid ${r.col}`,
//           borderRadius:"50%",
//           animation:`ringFloat ${r.dur}s ease-in-out ${r.delay}s infinite`,
//         }}>
//           <div style={{
//             position:"absolute", inset:22,
//             border:`1px solid ${r.col}`,
//             borderRadius:"50%",
//           }}/>
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────
//    CHAMP ANIMÉ
// ───────────────────────────────────────────── */
// function AnimatedField({ id, label, type, value, onChange, placeholder, autoComplete, focused, onFocus, onBlur, suffix, animDelay, icon }) {
//   return (
//     <div style={{ animation:`fieldIn 0.65s cubic-bezier(0.22,1,0.36,1) ${animDelay} both` }}>
//       <label htmlFor={id} style={{
//         display:"flex", alignItems:"center", gap:7,
//         fontFamily:"'DM Sans', sans-serif", fontSize:10, fontWeight:600,
//         letterSpacing:"0.2em", textTransform:"uppercase",
//         color: focused ? "#00838f" : "rgba(84,110,122,0.75)",
//         marginBottom:8, marginLeft:2, transition:"color 0.3s",
//       }}>
//         {icon && <span style={{ opacity: focused ? 1 : 0.5, transition:"opacity 0.3s" }}>{icon}</span>}
//         {label}
//       </label>
//       <div style={{ position:"relative" }}>
//         <input
//           id={id} type={type} value={value}
//           onChange={e => onChange(e.target.value)}
//           onFocus={onFocus} onBlur={onBlur}
//           required autoComplete={autoComplete} placeholder={placeholder}
//           style={{
//             width:"100%",
//             background: focused ? "rgba(224,247,250,0.55)" : "rgba(240,252,254,0.7)",
//             border:`1.5px solid ${focused ? "rgba(0,172,193,0.65)" : "rgba(0,172,193,0.18)"}`,
//             borderRadius:12, padding:"13px 16px",
//             paddingRight: suffix ? 46 : 16,
//             fontFamily:"'DM Sans', sans-serif", fontSize:14,
//             color:"#263238", outline:"none", caretColor:"#00acc1",
//             boxShadow: focused
//               ? "0 0 0 4px rgba(0,172,193,0.1), 0 2px 12px rgba(0,172,193,0.08)"
//               : "0 1px 4px rgba(0,172,193,0.06)",
//             transition:"all 0.28s cubic-bezier(0.4,0,0.2,1)",
//           }}
//         />
//         {suffix}
//         <div style={{
//           position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)",
//           height:2, borderRadius:"0 0 12px 12px",
//           width: focused ? "72%" : "0%",
//           background:"linear-gradient(90deg,#00acc1,#00796b)",
//           transition:"width 0.45s cubic-bezier(0.22,1,0.36,1)",
//           boxShadow: focused ? "0 0 10px rgba(0,172,193,0.5)" : "none",
//         }}/>
//       </div>
//     </div>
//   );
// }

// function EyeIcon({ open }) {
//   return open ? (
//     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
//     </svg>
//   ) : (
//     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
//       <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//     </svg>
//   );
// }

// /* ─────────────────────────────────────────────
//    MODAL CONTACT ADMIN
// ───────────────────────────────────────────── */
// function ContactAdmin() {
//   const ADMIN_EMAIL = "superadmin@smile-dental.fr";
//   const [open,    setOpen]    = useState(false);
//   const [name,    setName]    = useState("");
//   const [subject, setSubject] = useState("");
//   const [message, setMessage] = useState("");
//   const [sent,    setSent]    = useState(false);

//   const handleSend = () => {
//     if (!message.trim()) return;
//     // Construction de l'URL Gmail compose
//     const params = new URLSearchParams({
//       to:      ADMIN_EMAIL,
//       su:      subject || "Demande d'assistance — SMILE Dental",
//       body:    `Bonjour,\n\n${message}\n\n— ${name || "Utilisateur SMILE"}`,
//     });
//     const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
//     window.open(gmailUrl, "_blank", "noopener,noreferrer");
//     setSent(true);
//     setTimeout(() => { setSent(false); setOpen(false); setName(""); setSubject(""); setMessage(""); }, 2200);
//   };

//   const inputStyle = {
//     width:"100%", background:"rgba(240,252,254,0.8)",
//     border:"1.5px solid rgba(0,172,193,0.22)", borderRadius:10,
//     padding:"10px 13px", fontFamily:"'DM Sans',sans-serif",
//     fontSize:13, color:"#263238", outline:"none", caretColor:"#00acc1",
//     transition:"border-color 0.2s, box-shadow 0.2s",
//   };

//   return (
//     <>
//       {/* Bouton déclencheur */}
//       <div style={{
//         display:"flex", alignItems:"center", justifyContent:"center", gap:6,
//         padding:"10px 14px",
//         background:"rgba(0,172,193,0.04)",
//         border:"1px solid rgba(0,172,193,0.1)",
//         borderRadius:10,
//         animation:"fieldIn 0.65s cubic-bezier(0.22,1,0.36,1) 1.5s both",
//       }}>
//         <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="rgba(0,131,143,0.55)" strokeWidth={2}>
//           <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
//         </svg>
//         <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(84,110,122,0.65)" }}>
//           Besoin d'aide ?
//         </span>
//         <button
//           type="button"
//           onClick={() => setOpen(true)}
//           style={{
//             background:"none", border:"none", cursor:"pointer", padding:0,
//             fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600,
//             color:"#00838f", borderBottom:"1px dashed rgba(0,131,143,0.3)",
//             paddingBottom:1, transition:"color 0.2s",
//           }}
//           onMouseEnter={e => { e.currentTarget.style.color="#006064"; e.currentTarget.style.borderBottomStyle="solid"; }}
//           onMouseLeave={e => { e.currentTarget.style.color="#00838f"; e.currentTarget.style.borderBottomStyle="dashed"; }}
//         >
//           Contacter l'administrateur
//         </button>
//       </div>

//       {/* ── MODAL ── */}
//       {open && (
//         <div
//           onClick={e => { if(e.target === e.currentTarget) setOpen(false); }}
//           style={{
//             position:"fixed", inset:0, zIndex:10000,
//             background:"rgba(0,60,70,0.35)",
//             backdropFilter:"blur(6px)",
//             WebkitBackdropFilter:"blur(6px)",
//             display:"flex", alignItems:"center", justifyContent:"center",
//             padding:20,
//             animation:"fadeIn 0.2s ease both",
//           }}
//         >
//           <style>{`
//             @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
//             @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
//             textarea:focus, input:focus { border-color:rgba(0,172,193,0.6) !important; box-shadow:0 0 0 3px rgba(0,172,193,0.1) !important; }
//           `}</style>
//           <div style={{
//             background:"rgba(255,255,255,0.97)",
//             backdropFilter:"blur(20px)",
//             borderRadius:22,
//             padding:"32px 30px 28px",
//             width:"100%", maxWidth:420,
//             boxShadow:"0 24px 60px rgba(0,100,120,0.18), 0 0 0 1px rgba(0,172,193,0.12)",
//             border:"1.5px solid rgba(0,172,193,0.15)",
//             animation:"slideUp 0.3s cubic-bezier(0.22,1,0.36,1) both",
//             position:"relative",
//           }}>
//             {/* Fermer */}
//             <button
//               onClick={() => setOpen(false)}
//               style={{
//                 position:"absolute", top:14, right:14,
//                 width:30, height:30, borderRadius:"50%",
//                 background:"rgba(0,172,193,0.08)", border:"1px solid rgba(0,172,193,0.15)",
//                 cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
//                 color:"#00838f", transition:"background 0.2s",
//               }}
//               onMouseEnter={e => e.currentTarget.style.background="rgba(0,172,193,0.16)"}
//               onMouseLeave={e => e.currentTarget.style.background="rgba(0,172,193,0.08)"}
//             >
//               <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
//               </svg>
//             </button>

//             {/* En-tête modal */}
//             <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:22 }}>
//               <div style={{
//                 width:40, height:40, borderRadius:12,
//                 background:"linear-gradient(135deg,rgba(0,172,193,0.15),rgba(0,150,136,0.1))",
//                 border:"1px solid rgba(0,172,193,0.2)",
//                 display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
//               }}>
//                 <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#00838f" strokeWidth={1.8}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
//                 </svg>
//               </div>
//               <div>
//                 <h3 style={{ fontFamily:"'Cormorant',serif", fontSize:20, fontWeight:600, color:"#006064", margin:0, lineHeight:1.2 }}>
//                   Contacter l'administrateur
//                 </h3>
//                 <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(84,110,122,0.65)", margin:"3px 0 0", letterSpacing:"0.03em" }}>
//                   {ADMIN_EMAIL}
//                 </p>
//               </div>
//             </div>

//             {/* Formulaire */}
//             {sent ? (
//               <div style={{
//                 textAlign:"center", padding:"28px 0",
//                 display:"flex", flexDirection:"column", alignItems:"center", gap:12,
//               }}>
//                 <div style={{
//                   width:52, height:52, borderRadius:"50%",
//                   background:"linear-gradient(135deg,#00838f,#00acc1)",
//                   display:"flex", alignItems:"center", justifyContent:"center",
//                   boxShadow:"0 4px 18px rgba(0,172,193,0.35)",
//                 }}>
//                   <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
//                   </svg>
//                 </div>
//                 <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, color:"#006064" }}>
//                   Redirection vers Gmail…
//                 </p>
//                 <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(84,110,122,0.6)" }}>
//                   Votre message est prêt à être envoyé.
//                 </p>
//               </div>
//             ) : (
//               <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
//                 <div>
//                   <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(84,110,122,0.7)", display:"block", marginBottom:6 }}>
//                     Votre nom (optionnel)
//                   </label>
//                   <input
//                     type="text" value={name} onChange={e => setName(e.target.value)}
//                     placeholder="Dr. Martin Dupont"
//                     style={inputStyle}
//                   />
//                 </div>
//                 <div>
//                   <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(84,110,122,0.7)", display:"block", marginBottom:6 }}>
//                     Objet
//                   </label>
//                   <input
//                     type="text" value={subject} onChange={e => setSubject(e.target.value)}
//                     placeholder="Problème de connexion"
//                     style={inputStyle}
//                   />
//                 </div>
//                 <div>
//                   <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(84,110,122,0.7)", display:"block", marginBottom:6 }}>
//                     Message <span style={{ color:"#e53935", fontSize:10 }}>*</span>
//                   </label>
//                   <textarea
//                     value={message} onChange={e => setMessage(e.target.value)}
//                     placeholder="Décrivez votre problème…"
//                     rows={4}
//                     style={{ ...inputStyle, resize:"vertical", minHeight:90, lineHeight:1.5 }}
//                   />
//                 </div>

//                 {/* Boutons */}
//                 <div style={{ display:"flex", gap:10, marginTop:4 }}>
//                   <button
//                     type="button" onClick={() => setOpen(false)}
//                     style={{
//                       flex:1, padding:"11px", border:"1.5px solid rgba(0,172,193,0.2)",
//                       borderRadius:11, background:"transparent", cursor:"pointer",
//                       fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500,
//                       color:"rgba(84,110,122,0.8)", transition:"all 0.2s",
//                     }}
//                     onMouseEnter={e => { e.currentTarget.style.background="rgba(0,172,193,0.06)"; e.currentTarget.style.borderColor="rgba(0,172,193,0.35)"; }}
//                     onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="rgba(0,172,193,0.2)"; }}
//                   >
//                     Annuler
//                   </button>
//                   <button
//                     type="button" onClick={handleSend} disabled={!message.trim()}
//                     style={{
//                       flex:2, padding:"11px", border:"none", borderRadius:11,
//                       cursor: message.trim() ? "pointer" : "not-allowed",
//                       background: message.trim()
//                         ? "linear-gradient(135deg,#00838f,#00acc1)"
//                         : "rgba(0,172,193,0.25)",
//                       fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600,
//                       color:"#fff", letterSpacing:"0.03em",
//                       boxShadow: message.trim() ? "0 4px 16px rgba(0,172,193,0.3)" : "none",
//                       transition:"all 0.25s",
//                       display:"flex", alignItems:"center", justifyContent:"center", gap:7,
//                     }}
//                     onMouseEnter={e => { if(message.trim()) e.currentTarget.style.boxShadow="0 6px 22px rgba(0,172,193,0.45)"; }}
//                     onMouseLeave={e => { if(message.trim()) e.currentTarget.style.boxShadow="0 4px 16px rgba(0,172,193,0.3)"; }}
//                   >
//                     <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
//                     </svg>
//                     Ouvrir dans Gmail
//                   </button>
//                 </div>

//                 <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"rgba(84,110,122,0.45)", textAlign:"center", marginTop:2 }}>
//                   Votre message s'ouvrira dans Gmail prêt à envoyer
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// /* ─────────────────────────────────────────────
//    COMPOSANT PRINCIPAL
// ───────────────────────────────────────────── */
// export default function Login() {
//   const { login } = useAuthContext();
//   const [email,        setEmail]        = useState("");
//   const [password,     setPassword]     = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error,        setError]        = useState("");
//   const [loading,      setLoading]      = useState(false);
//   const [mounted,      setMounted]      = useState(false);
//   const [focused,      setFocused]      = useState(null);
//   const [tilt,         setTilt]         = useState({ rx:0, ry:0 });
//   const [rememberMe,   setRememberMe]   = useState(false);
//   const cardRef = useRef(null);

//   useEffect(() => {
//     const t = setTimeout(() => setMounted(true), 100);
//     return () => clearTimeout(t);
//   }, []);

//   useEffect(() => {
//     const saved = localStorage.getItem("smile_remember_email");
//     if (saved) { setEmail(saved); setRememberMe(true); }
//   }, []);

//   // Tilt de carte — léger, limité à la carte uniquement
//   const onCardMove = useCallback(e => {
//     const rect = cardRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
//     const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
//     setTilt({ rx: -dy * 4, ry: dx * 4 });
//   }, []);
//   const onCardLeave = useCallback(() => setTilt({ rx:0, ry:0 }), []);

//   const handleSubmit = async e => {
//     e?.preventDefault?.();
//     setLoading(true); setError("");
//     try {
//       const { error: err } = await login(email, password);
//       if (err) {
//         setError("Email ou mot de passe incorrect.");
//       } else {
//         rememberMe
//           ? localStorage.setItem("smile_remember_email", email)
//           : localStorage.removeItem("smile_remember_email");
//       }
//     } catch {
//       setError("Connexion impossible. Vérifiez votre connexion.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const EmailIcon = (
//     <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
//     </svg>
//   );
//   const LockIcon = (
//     <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
//     </svg>
//   );

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
//         *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
//         body { background:#f8fcfd; overflow:hidden; }

//         @keyframes crossFloat {
//           0%,100% { transform:translate(-50%,-50%) rotate(0deg)   scale(1); }
//           33%      { transform:translate(-50%,-50%) rotate(12deg)  scale(1.07); }
//           66%      { transform:translate(-50%,-50%) rotate(-7deg)  scale(0.95); }
//         }
//         @keyframes ringFloat {
//           0%,100% { transform:translate(-50%,-50%) scale(1)    rotate(0deg); }
//           50%      { transform:translate(-50%,-50%) scale(1.05) rotate(35deg); }
//         }
//         @keyframes letterReveal {
//           from { opacity:0; transform:translateY(16px); filter:blur(4px); }
//           to   { opacity:1; transform:translateY(0);    filter:blur(0); }
//         }
//         @keyframes subtitleIn {
//           from { opacity:0; letter-spacing:0.55em; }
//           to   { opacity:0.65; letter-spacing:0.26em; }
//         }
//         @keyframes fieldIn {
//           from { opacity:0; transform:translateX(-12px); }
//           to   { opacity:1; transform:translateX(0); }
//         }
//         @keyframes topLine {
//           from { width:0; }
//           to   { width:100%; }
//         }
//         @keyframes glowBreath {
//           0%,100% { opacity:0.3; }
//           50%      { opacity:0.5; }
//         }
//         @keyframes spin {
//           to { transform:rotate(360deg); }
//         }
//         @keyframes shimmerBtn {
//           0%       { left:-120%; }
//           60%,100% { left:230%; }
//         }
//         @keyframes badgePop {
//           from { opacity:0; transform:scale(0.75) translateY(5px); }
//           to   { opacity:1; transform:scale(1)    translateY(0); }
//         }
//         @keyframes lineReveal {
//           from { transform:scaleX(0); }
//           to   { transform:scaleX(1); }
//         }
//         @keyframes smileDraw {
//           from { stroke-dashoffset:120; opacity:0; }
//           to   { stroke-dashoffset:0;   opacity:1; }
//         }
//         input::placeholder { color:rgba(96,125,139,0.45) !important; }
//         input:-webkit-autofill, input:-webkit-autofill:focus {
//           -webkit-text-fill-color:#263238 !important;
//           -webkit-box-shadow:0 0 0px 1000px rgba(224,247,250,0.85) inset !important;
//           transition:background-color 5000s;
//         }
//       `}</style>

//       {/* ── Fond canvas (30fps, allégé) ── */}
//       <MedicalCanvas />

//       {/* ── Motifs décoratifs CSS/SVG (0 JS) ── */}
//       <DecorativePatterns />
//       <MedicalCrosses />
//       <PulseRings />

//       {/* ── Contenu ── */}
//       <div style={{
//         position:"relative", zIndex:10,
//         minHeight:"100vh",
//         display:"flex", alignItems:"center", justifyContent:"center",
//         padding:"24px",
//       }}>
//         <div
//           ref={cardRef}
//           onMouseMove={onCardMove}
//           onMouseLeave={onCardLeave}
//           style={{
//             width:"100%", maxWidth:430,
//             opacity: mounted ? 1 : 0,
//             transform:`
//               perspective(1000px)
//               rotateX(${tilt.rx}deg)
//               rotateY(${tilt.ry}deg)
//               translateY(${mounted ? 0 : 28}px)
//               scale(${mounted ? 1 : 0.97})
//             `,
//             transition:"transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.65s ease",
//             willChange:"transform",
//             position:"relative",
//           }}
//         >
//           {/* Halo derrière la carte */}
//           <div style={{
//             position:"absolute", inset:-4, borderRadius:34,
//             background:"linear-gradient(135deg,rgba(0,188,212,0.28),rgba(0,150,136,0.18),rgba(38,198,218,0.22))",
//             filter:"blur(22px)",
//             animation:"glowBreath 3.5s ease-in-out infinite",
//             zIndex:-1,
//           }}/>

//           {/* Surface carte */}
//           <div style={{
//             background:"rgba(255,255,255,0.9)",
//             backdropFilter:"blur(36px) saturate(170%)",
//             WebkitBackdropFilter:"blur(36px) saturate(170%)",
//             border:"1.5px solid rgba(0,172,193,0.14)",
//             borderRadius:28,
//             padding:"44px 38px 40px",
//             boxShadow:"0 0 0 1px rgba(255,255,255,0.92) inset, 0 28px 70px rgba(0,120,140,0.11), 0 6px 20px rgba(0,172,193,0.07)",
//             position:"relative", overflow:"hidden",
//           }}>

//             {/* Reflet tilt interne */}
//             <div style={{
//               position:"absolute", inset:0, borderRadius:28, pointerEvents:"none",
//               background:`radial-gradient(ellipse at ${50+tilt.ry*4}% ${50-tilt.rx*4}%, rgba(178,235,242,0.18) 0%, transparent 60%)`,
//               transition:"background 0.1s",
//             }}/>

//             {/* Pattern émail hexagonal carte */}
//             <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.06, pointerEvents:"none", borderRadius:28 }}>
//               <defs>
//                 <pattern id="enamel" x="0" y="0" width="20" height="23" patternUnits="userSpaceOnUse">
//                   <polygon points="10,1 19,6 19,17 10,22 1,17 1,6" fill="none" stroke="#00acc1" strokeWidth="1.5"/>
//                 </pattern>
//               </defs>
//               <rect width="100%" height="100%" fill="url(#enamel)"/>
//             </svg>

//             {/* Ligne colorée top */}
//             <div style={{
//               position:"absolute", top:0, left:0, right:0, height:3,
//               borderRadius:"28px 28px 0 0",
//               background:"linear-gradient(90deg,#00acc1,#00838f 40%,#00bcd4 70%,#4dd0e1)",
//               animation: mounted ? "topLine 1s cubic-bezier(0.22,1,0.36,1) 0.4s both" : "none",
//             }}/>

//             {/* ── EN-TÊTE ── */}
//             <div style={{ textAlign:"center", marginBottom:36 }}>

//               {/* Badge */}
//               <div style={{
//                 display:"inline-flex", alignItems:"center", gap:6,
//                 background:"rgba(0,172,193,0.08)",
//                 border:"1px solid rgba(0,172,193,0.2)",
//                 borderRadius:20, padding:"5px 14px", marginBottom:20,
//                 animation:"badgePop 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both",
//               }}>
//                 <svg width="10" height="10" viewBox="0 0 24 24" fill="#00838f">
//                   <rect x="9" y="2" width="6" height="20" rx="2"/>
//                   <rect x="2" y="9" width="20" height="6" rx="2"/>
//                 </svg>
//                 <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#00838f" }}>
//                   Cabinet Dentaire SMILE
//                 </span>
//               </div>

//               {/* Logo circulaire */}
//               <div style={{
//                 width:100, height:100, borderRadius:"50%",
//                 background:"rgba(255,255,255,0.95)",
//                 border:"1.5px solid rgba(0,172,193,0.22)",
//                 display:"flex", alignItems:"center", justifyContent:"center",
//                 margin:"0 auto 20px", padding:12,
//                 boxShadow:"0 10px 30px rgba(0,120,140,0.13), 0 0 0 5px rgba(0,172,193,0.06)",
//                 overflow:"hidden",
//                 opacity: mounted ? 1 : 0,
//                 transition:"opacity 0.7s 0.3s",
//               }}>
//                 <img src="/SMILE.jpg" alt="SMILE"
//                   style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:"50%" }}/>
//               </div>

//               {/* Titre lettre par lettre */}
//               <div style={{ lineHeight:1, letterSpacing:"0.22em", marginBottom:5 }}>
//                 {"SMILE".split("").map((ch, i) => (
//                   <span key={i} style={{
//                     display:"inline-block",
//                     fontFamily:"'Cormorant', serif", fontSize:44, fontWeight:600,
//                     color:"#006064",
//                     textShadow:"0 2px 18px rgba(0,172,193,0.18)",
//                     animation:`letterReveal 0.65s cubic-bezier(0.22,1,0.36,1) ${0.35+i*0.09}s both`,
//                   }}>{ch}</span>
//                 ))}
//               </div>

//               <p style={{
//                 fontFamily:"'Cormorant', serif", fontStyle:"italic",
//                 fontSize:14, color:"rgba(0,96,100,0.6)",
//                 animation:"subtitleIn 0.95s cubic-bezier(0.22,1,0.36,1) 0.95s both",
//               }}>
//                 Gestion dentaire sécurisée
//               </p>

//               {/* Courbe sourire */}
//               <div style={{ margin:"12px auto 0", width:120, animation:"fieldIn 0.6s ease 0.9s both" }}>
//                 <svg width="120" height="26" viewBox="0 0 120 26" fill="none">
//                   <path d="M10,7 Q60,25 110,7" stroke="rgba(0,172,193,0.4)" strokeWidth="2"
//                     strokeLinecap="round" fill="none"
//                     style={{ strokeDasharray:120, animation:"smileDraw 1.2s cubic-bezier(0.22,1,0.36,1) 1s both" }}/>
//                   <circle cx="10"  cy="7"  r="2.5" fill="rgba(0,172,193,0.45)"/>
//                   <circle cx="110" cy="7"  r="2.5" fill="rgba(0,150,136,0.45)"/>
//                   <circle cx="60"  cy="23" r="2"   fill="rgba(77,208,225,0.55)"/>
//                 </svg>
//               </div>

//               {/* Séparateur */}
//               <div style={{ display:"flex", alignItems:"center", gap:8, margin:"14px auto 0", width:130, animation:"fieldIn 0.6s ease 1s both" }}>
//                 <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(0,172,193,0.3))", transformOrigin:"right", animation:"lineReveal 0.8s ease 1s both" }}/>
//                 <svg width="11" height="11" viewBox="0 0 24 24" fill="rgba(0,172,193,0.5)">
//                   <rect x="9" y="2" width="6" height="20" rx="2"/>
//                   <rect x="2" y="9" width="20" height="6" rx="2"/>
//                 </svg>
//                 <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(0,150,136,0.3),transparent)", transformOrigin:"left", animation:"lineReveal 0.8s ease 1s both" }}/>
//               </div>
//             </div>

//             {/* ── ERREUR ── */}
//             {error && (
//               <div style={{
//                 background:"rgba(229,57,53,0.07)", border:"1px solid rgba(229,57,53,0.18)",
//                 borderRadius:11, padding:"11px 14px", marginBottom:18,
//                 fontFamily:"'DM Sans',sans-serif", fontSize:13,
//                 color:"rgba(183,28,28,0.9)",
//                 display:"flex", alignItems:"center", gap:8,
//               }}>
//                 <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(183,28,28,0.8)" strokeWidth={2}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
//                 </svg>
//                 {error}
//               </div>
//             )}

//             {/* ── FORMULAIRE ── */}
//             <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

//               <AnimatedField id="email" label="Adresse email" type="email"
//                 value={email} onChange={setEmail} placeholder="personnel@cabinet.fr"
//                 autoComplete="email" focused={focused==="email"}
//                 onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
//                 animDelay="1.1s" icon={EmailIcon}
//               />

//               <AnimatedField id="password" label="Mot de passe"
//                 type={showPassword ? "text" : "password"}
//                 value={password} onChange={setPassword} placeholder="••••••••••"
//                 autoComplete="current-password" focused={focused==="password"}
//                 onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
//                 animDelay="1.2s" icon={LockIcon}
//                 suffix={
//                   <button type="button" onClick={() => setShowPassword(p => !p)}
//                     style={{
//                       position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
//                       background:"none", border:"none", cursor:"pointer",
//                       color:"rgba(84,110,122,0.55)", display:"flex", alignItems:"center",
//                       transition:"color 0.2s", padding:4,
//                     }}>
//                     <EyeIcon open={showPassword}/>
//                   </button>
//                 }
//               />

//               {/* ── Se souvenir de moi ── */}
//               <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", animation:"fieldIn 0.65s cubic-bezier(0.22,1,0.36,1) 1.3s both" }}>
//                 <label style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", userSelect:"none" }}>
//                   <div
//                     onClick={() => setRememberMe(p => !p)}
//                     style={{
//                       width:18, height:18, borderRadius:5, flexShrink:0,
//                       border:`1.5px solid ${rememberMe ? "#00acc1" : "rgba(0,172,193,0.3)"}`,
//                       background: rememberMe ? "linear-gradient(135deg,#00838f,#00acc1)" : "rgba(240,252,254,0.9)",
//                       display:"flex", alignItems:"center", justifyContent:"center",
//                       cursor:"pointer",
//                       transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
//                       boxShadow: rememberMe ? "0 2px 10px rgba(0,172,193,0.3)" : "none",
//                       transform: rememberMe ? "scale(1.08)" : "scale(1)",
//                     }}
//                   >
//                     {rememberMe && (
//                       <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//                         <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
//                       </svg>
//                     )}
//                   </div>
//                   <span style={{
//                     fontFamily:"'DM Sans',sans-serif", fontSize:13,
//                     color: rememberMe ? "#00696f" : "rgba(84,110,122,0.7)",
//                     transition:"color 0.2s",
//                   }}>
//                     Se souvenir de moi
//                   </span>
//                 </label>
//               </div>

//               {/* ── Bouton connexion ── */}
//               <button
//                 type="button" onClick={handleSubmit} disabled={loading}
//                 style={{
//                   marginTop:2, width:"100%", padding:"14px 16px",
//                   border:"none", borderRadius:13, cursor: loading ? "not-allowed" : "pointer",
//                   fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600,
//                   color:"#fff", letterSpacing:"0.04em",
//                   position:"relative", overflow:"hidden",
//                   background:"linear-gradient(135deg,#00838f 0%,#00acc1 50%,#00796b 100%)",
//                   boxShadow:"0 4px 22px rgba(0,172,193,0.32), 0 0 0 1px rgba(255,255,255,0.14) inset",
//                   opacity: loading ? 0.65 : 1,
//                   transition:"transform 0.2s, box-shadow 0.28s, opacity 0.3s",
//                   animation:"fieldIn 0.65s cubic-bezier(0.22,1,0.36,1) 1.4s both",
//                 }}
//                 onMouseEnter={e => { if(!loading){ e.currentTarget.style.transform="translateY(-2px) scale(1.01)"; e.currentTarget.style.boxShadow="0 10px 32px rgba(0,172,193,0.45), 0 0 0 1px rgba(255,255,255,0.18) inset"; }}}
//                 onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 22px rgba(0,172,193,0.32), 0 0 0 1px rgba(255,255,255,0.14) inset"; }}
//                 onMouseDown={e => { if(!loading) e.currentTarget.style.transform="scale(0.987)"; }}
//                 onMouseUp={e => { if(!loading) e.currentTarget.style.transform="translateY(-2px) scale(1.01)"; }}
//               >
//                 <span style={{
//                   position:"absolute", top:0, left:"-120%", width:"60%", height:"100%",
//                   background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)",
//                   transform:"skewX(-20deg)",
//                   animation: loading ? "none" : "shimmerBtn 3s ease-in-out 2s infinite",
//                 }}/>
//                 {loading ? (
//                   <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"spin 0.78s linear infinite" }}>
//                       <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
//                     </svg>
//                     Vérification…
//                   </span>
//                 ) : (
//                   <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
//                     <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
//                     </svg>
//                     Accès sécurisé
//                   </span>
//                 )}
//               </button>

//               {/* ── Lien aide admin ── */}
//               <ContactAdmin />

//             </div>

//             {/* ── Badges confiance ── */}
//             <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:22, animation:"fieldIn 0.6s ease 1.6s both" }}>
//               {[
//                 { svg: <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#00838f" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>, label:"SSL" },
//                 { svg: <svg width="11" height="11" viewBox="0 0 24 24" fill="#00838f"><rect x="9" y="2" width="6" height="20" rx="2"/><rect x="2" y="9" width="20" height="6" rx="2"/></svg>, label:"HDS" },
//                 { svg: <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#00838f" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>, label:"RGPD" },
//               ].map((b, i) => (
//                 <div key={i} style={{
//                   display:"flex", alignItems:"center", gap:5,
//                   background:"rgba(0,172,193,0.06)",
//                   border:"1px solid rgba(0,172,193,0.12)",
//                   borderRadius:20, padding:"4px 10px",
//                 }}>
//                   {b.svg}
//                   <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:600, letterSpacing:"0.1em", color:"rgba(0,96,100,0.65)", textTransform:"uppercase" }}>{b.label}</span>
//                 </div>
//               ))}
//             </div>

//             {/* Footer */}
//             <p style={{
//               marginTop:16, textAlign:"center",
//               fontFamily:"'DM Sans',sans-serif", fontSize:11,
//               color:"rgba(84,110,122,0.38)", letterSpacing:"0.05em",
//               animation:"fieldIn 0.6s ease 1.7s both",
//             }}>
//               © 2026 SMILE Dental · Accès réservé aux personnels
//             </p>

//           </div>
//         </div>
//       </div>
//     </>
//   );
// }



import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthContext } from "../hooks/AuthContext";

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ─────────────────────────────────────────────
   CANVAS ALLÉGÉ — blobs doux + bulles O₂
   (throttle 30fps, pas de mouse tracking lourd)
───────────────────────────────────────────── */
function MedicalCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const lastRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let W, H;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const blobs = [
      { x:0.12, y:0.18, vx:0.00018,  vy:0.00012,  r:0.52, cr:[0,188,212],  a:0.11, ph:0   },
      { x:0.80, y:0.14, vx:-0.00013, vy:0.00015,  r:0.42, cr:[38,198,218], a:0.09, ph:2.5 },
      { x:0.62, y:0.78, vx:0.00011,  vy:-0.00013, r:0.38, cr:[178,235,242],a:0.12, ph:4.8 },
      { x:0.08, y:0.70, vx:0.00014,  vy:0.00009,  r:0.36, cr:[224,247,250],a:0.16, ph:1.2 },
      { x:0.88, y:0.55, vx:-0.00012, vy:-0.00011, r:0.32, cr:[0,150,136],  a:0.07, ph:3.6 },
    ];

    const bubbles = Array.from({ length: 22 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight + window.innerHeight,
      r:     Math.random() * 14 + 4,
      speed: Math.random() * 0.3 + 0.12,
      wobble:      Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.01 + 0.004,
      alpha: Math.random() * 0.15 + 0.05,
    }));

    let t = 0;
    const FPS = 30;
    const INTERVAL = 1000 / FPS;

    const draw = (ts) => {
      rafRef.current = requestAnimationFrame(draw);
      if (ts - lastRef.current < INTERVAL) return;
      lastRef.current = ts;
      t += 0.01;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#f8fcfd";
      ctx.fillRect(0, 0, W, H);

      // Gradient mesh central
      const mesh = ctx.createRadialGradient(W*.5, H*.5, 0, W*.5, H*.5, Math.max(W,H)*.7);
      mesh.addColorStop(0,   "rgba(224,247,250,0.5)");
      mesh.addColorStop(0.5, "rgba(240,252,254,0.3)");
      mesh.addColorStop(1,   "rgba(248,253,254,0)");
      ctx.fillStyle = mesh;
      ctx.fillRect(0, 0, W, H);

      // Blobs flottants
      blobs.forEach(b => {
        b.x += b.vx * Math.sin(t * 0.5 + b.ph);
        b.y += b.vy * Math.cos(t * 0.4 + b.ph);
        if (b.x < 0.04 || b.x > 0.96) b.vx *= -1;
        if (b.y < 0.04 || b.y > 0.96) b.vy *= -1;
        b.x = clamp(b.x, 0.04, 0.96);
        b.y = clamp(b.y, 0.04, 0.96);

        const pulse  = 1 + 0.07 * Math.sin(t + b.ph);
        const radius = b.r * Math.min(W, H) * pulse;
        const gx = b.x * W, gy = b.y * H;
        const g  = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
        const [r, gc, bl] = b.cr;
        g.addColorStop(0,   `rgba(${r},${gc},${bl},${b.a})`);
        g.addColorStop(0.5, `rgba(${r},${gc},${bl},${b.a * 0.35})`);
        g.addColorStop(1,   `rgba(${r},${gc},${bl},0)`);
        ctx.beginPath();
        ctx.arc(gx, gy, radius, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Bulles O₂
      bubbles.forEach(b => {
        b.y      -= b.speed;
        b.wobble += b.wobbleSpeed;
        const wx  = b.x + Math.sin(b.wobble) * 14;
        if (b.y < -b.r * 2) { b.y = H + b.r; b.x = Math.random() * W; }

        const bg = ctx.createRadialGradient(wx - b.r*.3, b.y - b.r*.3, 0, wx, b.y, b.r);
        bg.addColorStop(0,   `rgba(255,255,255,${b.alpha * 1.7})`);
        bg.addColorStop(0.4, `rgba(178,235,242,${b.alpha})`);
        bg.addColorStop(1,   `rgba(0,188,212,${b.alpha * 0.45})`);
        ctx.beginPath();
        ctx.arc(wx, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(wx, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,172,193,${b.alpha * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Highlight
        ctx.beginPath();
        ctx.arc(wx - b.r*.3, b.y - b.r*.3, b.r*.22, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b.alpha * 2.2})`;
        ctx.fill();
      });

      // Vignette bords
      const vig = ctx.createRadialGradient(W/2, H/2, H*.28, W/2, H/2, H*.92);
      vig.addColorStop(0, "rgba(230,248,252,0)");
      vig.addColorStop(1, "rgba(200,240,248,0.2)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, display:"block" }} />;
}

/* ─────────────────────────────────────────────
   MOTIFS DÉCORATIFS AUTOUR DE LA PAGE
   (purement CSS/SVG, aucun JS = 0 lag)
───────────────────────────────────────────── */
function DecorativePatterns() {
  // Coins ornementaux
  const cornerStyle = (pos) => ({
    position:"absolute", ...pos,
    width:180, height:180,
    pointerEvents:"none",
    opacity:0.55,
  });

  // Arcs dentaires en coin
  const ArcCorner = ({ flip }) => (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none"
      style={{ transform: flip ? "scale(-1,1)" : "none" }}>
      <path d="M10,170 Q10,10 170,10" stroke="#00acc1" strokeWidth="2" fill="none" strokeDasharray="5 5"/>
      <path d="M30,170 Q30,30 170,30" stroke="#00838f" strokeWidth="1.5" fill="none" strokeDasharray="4 6"/>
      <path d="M55,170 Q55,55 170,55" stroke="#4dd0e1" strokeWidth="1.2" fill="none" strokeDasharray="3 8"/>
      <circle cx="10"  cy="170" r="3" fill="#00acc1"/>
      <circle cx="30"  cy="170" r="2" fill="#00838f"/>
      <circle cx="170" cy="10"  r="3" fill="#00acc1"/>
      <circle cx="170" cy="30"  r="2" fill="#00838f"/>
    </svg>
  );

  // Motif hexagones en bande latérale
  const HexBand = ({ right }) => (
    <div style={{
      position:"absolute",
      [right ? "right" : "left"]: 0,
      top:0, bottom:0, width:64,
      opacity:0.35, pointerEvents:"none",
      overflow:"hidden",
    }}>
      <svg width="64" height="100%" viewBox="0 0 64 800" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:18}, (_,i) => {
          const row = i;
          const offset = row % 2 === 0 ? 0 : 18;
          return [0,1].map(col => {
            const cx = col * 36 + offset + 14;
            const cy = row * 24 + 16;
            return (
              <polygon key={`${i}-${col}`}
                points={`${cx},${cy-11} ${cx+10},${cy-5} ${cx+10},${cy+5} ${cx},${cy+11} ${cx-10},${cy+5} ${cx-10},${cy-5}`}
                fill="none" stroke="#00acc1" strokeWidth="1.5"
              />
            );
          });
        })}
      </svg>
    </div>
  );

  // Croix médicales en filigrane (coins opposés)
  const CrossGrid = ({ pos }) => (
    <div style={{ position:"absolute", ...pos, opacity:0.4, pointerEvents:"none" }}>
      <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
        {[20,50,80,110].map(x =>
          [20,50,80,110].map(y => (
            <g key={`${x}-${y}`} transform={`translate(${x},${y})`}>
              <rect x="-5" y="-2" width="10" height="4" rx="1.5" fill="#00acc1"/>
              <rect x="-2" y="-5" width="4" height="10" rx="1.5" fill="#00acc1"/>
            </g>
          ))
        )}
      </svg>
    </div>
  );

  // Lignes de scan horizontales décoratives
  const ScanLines = () => (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", opacity:0.08 }}>
      {Array.from({length:12}, (_,i) => (
        <div key={i} style={{
          position:"absolute",
          top:`${(i+1) * 8}%`,
          left:0, right:0,
          height:1,
          background:"linear-gradient(90deg, transparent 0%, #00acc1 20%, #00838f 50%, #00acc1 80%, transparent 100%)",
        }}/>
      ))}
    </div>
  );

  // Cercles concentriques dans les coins
  const ConcentricCircles = ({ pos }) => (
    <div style={{ position:"absolute", ...pos, opacity:0.45, pointerEvents:"none" }}>
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
        {[20,40,60,80,100].map((r,i) => (
          <circle key={i} cx="0" cy="160" r={r}
            stroke={i%2===0 ? "#00acc1" : "#00838f"}
            strokeWidth="1.4" fill="none"
            strokeDasharray={i%2===0 ? "4 6" : "2 8"}
          />
        ))}
      </svg>
    </div>
  );

  // Dent SVG décorative légère (coins)
  const ToothDeco = ({ pos, size=52, flip=false }) => (
    <div style={{ position:"absolute", ...pos, opacity:0.55, pointerEvents:"none",
      transform: flip ? "scaleX(-1)" : "none" }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M22 6C18 6 14 10 14 18c0 8 3 16 5 26 2 8 4 14 8 14s6-8 5-8-1 8 3 8 6-6 8-14c2-10 5-18 5-26 0-8-4-12-8-12-4 0-7 3-10 3S26 6 22 6Z"
          fill="#00acc1"/>
        <path d="M20 9c-3 2-5 6-5 10 0 6 2 12 4 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
      </svg>
    </div>
  );

  // Bande ECG en haut
  const EcgTop = () => (
    <div style={{ position:"absolute", top:0, left:0, right:0, height:40, pointerEvents:"none", overflow:"hidden", opacity:0.5 }}>
      <svg width="100%" height="40" viewBox="0 0 1200 40" preserveAspectRatio="none">
        <path d="M0,20 L300,20 L330,20 L345,5 L358,35 L371,5 L384,35 L397,20 L430,20 L730,20 L760,20 L775,5 L788,35 L801,5 L814,35 L827,20 L860,20 L1200,20"
          fill="none" stroke="#00acc1" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    </div>
  );

  // Bande ECG en bas
  const EcgBottom = () => (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:40, pointerEvents:"none", overflow:"hidden", opacity:0.5 }}>
      <svg width="100%" height="40" viewBox="0 0 1200 40" preserveAspectRatio="none">
        <path d="M0,20 L200,20 L230,20 L245,5 L260,35 L275,5 L290,35 L305,20 L340,20 L600,20 L630,20 L645,5 L660,35 L675,5 L690,35 L705,20 L740,20 L1200,20"
          fill="none" stroke="#00838f" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:2, pointerEvents:"none", overflow:"hidden" }}>
      {/* Coins ornementaux */}
      <div style={cornerStyle({ top:0, left:0 })}><ArcCorner flip={false}/></div>
      <div style={cornerStyle({ top:0, right:0 })}><ArcCorner flip={true}/></div>
      <div style={{ ...cornerStyle({ bottom:0, left:0 }), transform:"scaleY(-1)" }}><ArcCorner flip={false}/></div>
      <div style={{ ...cornerStyle({ bottom:0, right:0 }), transform:"scale(-1,-1)" }}><ArcCorner flip={false}/></div>

      {/* Bandes hexagonales latérales */}
      <HexBand right={false}/>
      <HexBand right={true}/>

      {/* Grilles de croix médicales */}
      <CrossGrid pos={{ top:12, right:80 }}/>
      <CrossGrid pos={{ bottom:12, left:80 }}/>

      {/* Cercles concentriques */}
      <ConcentricCircles pos={{ top:0, left:0 }}/>
      <ConcentricCircles pos={{ bottom:0, right:0, transform:"rotate(180deg)" }}/>

      {/* Dents décoratives */}
      <ToothDeco pos={{ top:"12%", right:18 }} size={48}/>
      <ToothDeco pos={{ bottom:"14%", left:18 }} size={42} flip/>
      <ToothDeco pos={{ top:"52%", left:14 }} size={36}/>
      <ToothDeco pos={{ top:"40%", right:14 }} size={34} flip/>

      {/* Scan lines */}
      <ScanLines/>

      {/* ECG haut et bas */}
      <EcgTop/>
      <EcgBottom/>

      {/* Points déco subtils */}
      <div style={{ position:"absolute", inset:0, opacity:0.18,
        backgroundImage:"radial-gradient(circle, #00acc1 1.5px, transparent 1.5px)",
        backgroundSize:"32px 32px" }}/>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CROIX MÉDICALES FLOTTANTES (CSS only)
───────────────────────────────────────────── */
function MedicalCrosses() {
  const crosses = [
    { x:"7%",  y:"8%",  size:28, op:0.45, delay:0,  dur:8  },
    { x:"92%", y:"12%", size:20, op:0.4, delay:-3, dur:10 },
    { x:"4%",  y:"55%", size:16, op:0.38,delay:-5, dur:12 },
    { x:"94%", y:"65%", size:24, op:0.42,delay:-2, dur:9  },
    { x:"88%", y:"88%", size:18, op:0.4, delay:-7, dur:11 },
    { x:"12%", y:"88%", size:22, op:0.42,delay:-4, dur:13 },
  ];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none" }}>
      {crosses.map((c, i) => (
        <div key={i} style={{
          position:"absolute", left:c.x, top:c.y,
          transform:"translate(-50%,-50%)",
          opacity:c.op,
          animation:`crossFloat ${c.dur}s ease-in-out ${c.delay}s infinite`,
        }}>
          <svg width={c.size} height={c.size} viewBox="0 0 24 24">
            <rect x="9"  y="2"  width="6"  height="20" rx="2" fill="#00acc1"/>
            <rect x="2"  y="9"  width="20" height="6"  rx="2" fill="#00acc1"/>
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PULSE RINGS (CSS only)
───────────────────────────────────────────── */
function PulseRings() {
  const rings = [
    { x:"88%", y:"20%", size:260, delay:0,  dur:15, col:"rgba(0,172,193,0.28)" },
    { x:"10%", y:"75%", size:200, delay:-5, dur:18, col:"rgba(0,150,136,0.25)"},
    { x:"75%", y:"82%", size:170, delay:-9, dur:13, col:"rgba(38,198,218,0.28)"},
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
            position:"absolute", inset:22,
            border:`1px solid ${r.col}`,
            borderRadius:"50%",
          }}/>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHAMP ANIMÉ
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   MODAL CONTACT ADMIN
───────────────────────────────────────────── */
function ContactAdmin() {
  const ADMIN_EMAIL = "superadmin@smile-dental.fr";
  const [open,    setOpen]    = useState(false);
  const [name,    setName]    = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent,    setSent]    = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    // Construction de l'URL Gmail compose
    const params = new URLSearchParams({
      to:      ADMIN_EMAIL,
      su:      subject || "Demande d'assistance — SMILE Dental",
      body:    `Bonjour,\n\n${message}\n\n— ${name || "Utilisateur SMILE"}`,
    });
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
    setSent(true);
    setTimeout(() => { setSent(false); setOpen(false); setName(""); setSubject(""); setMessage(""); }, 2200);
  };

  const inputStyle = {
    width:"100%", background:"rgba(240,252,254,0.8)",
    border:"1.5px solid rgba(0,172,193,0.22)", borderRadius:10,
    padding:"10px 13px", fontFamily:"'DM Sans',sans-serif",
    fontSize:13, color:"#263238", outline:"none", caretColor:"#00acc1",
    transition:"border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <>
      {/* Bouton déclencheur */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"center", gap:6,
        padding:"10px 14px",
        background:"rgba(0,172,193,0.04)",
        border:"1px solid rgba(0,172,193,0.1)",
        borderRadius:10,
        animation:"fieldIn 0.65s cubic-bezier(0.22,1,0.36,1) 1.5s both",
      }}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="rgba(0,131,143,0.55)" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(84,110,122,0.65)" }}>
          Besoin d'aide ?
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            background:"none", border:"none", cursor:"pointer", padding:0,
            fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600,
            color:"#00838f", borderBottom:"1px dashed rgba(0,131,143,0.3)",
            paddingBottom:1, transition:"color 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color="#006064"; e.currentTarget.style.borderBottomStyle="solid"; }}
          onMouseLeave={e => { e.currentTarget.style.color="#00838f"; e.currentTarget.style.borderBottomStyle="dashed"; }}
        >
          Contacter l'administrateur
        </button>
      </div>

      {/* ── MODAL ── */}
      {open && (
        <div
          onClick={e => { if(e.target === e.currentTarget) setOpen(false); }}
          style={{
            position:"fixed", inset:0, zIndex:10000,
            background:"rgba(0,60,70,0.35)",
            backdropFilter:"blur(6px)",
            WebkitBackdropFilter:"blur(6px)",
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:20,
            animation:"fadeIn 0.2s ease both",
          }}
        >
          <style>{`
            @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
            @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
            textarea:focus, input:focus { border-color:rgba(0,172,193,0.6) !important; box-shadow:0 0 0 3px rgba(0,172,193,0.1) !important; }
          `}</style>
          <div style={{
            background:"rgba(255,255,255,0.97)",
            backdropFilter:"blur(20px)",
            borderRadius:22,
            padding:"32px 30px 28px",
            width:"100%", maxWidth:420,
            boxShadow:"0 24px 60px rgba(0,100,120,0.18), 0 0 0 1px rgba(0,172,193,0.12)",
            border:"1.5px solid rgba(0,172,193,0.15)",
            animation:"slideUp 0.3s cubic-bezier(0.22,1,0.36,1) both",
            position:"relative",
          }}>
            {/* Fermer */}
            <button
              onClick={() => setOpen(false)}
              style={{
                position:"absolute", top:14, right:14,
                width:30, height:30, borderRadius:"50%",
                background:"rgba(0,172,193,0.08)", border:"1px solid rgba(0,172,193,0.15)",
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                color:"#00838f", transition:"background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(0,172,193,0.16)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(0,172,193,0.08)"}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            {/* En-tête modal */}
            <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:22 }}>
              <div style={{
                width:40, height:40, borderRadius:12,
                background:"linear-gradient(135deg,rgba(0,172,193,0.15),rgba(0,150,136,0.1))",
                border:"1px solid rgba(0,172,193,0.2)",
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
              }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#00838f" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <h3 style={{ fontFamily:"'Cormorant',serif", fontSize:20, fontWeight:600, color:"#006064", margin:0, lineHeight:1.2 }}>
                  Contacter l'administrateur
                </h3>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(84,110,122,0.65)", margin:"3px 0 0", letterSpacing:"0.03em" }}>
                  {ADMIN_EMAIL}
                </p>
              </div>
            </div>

            {/* Formulaire */}
            {sent ? (
              <div style={{
                textAlign:"center", padding:"28px 0",
                display:"flex", flexDirection:"column", alignItems:"center", gap:12,
              }}>
                <div style={{
                  width:52, height:52, borderRadius:"50%",
                  background:"linear-gradient(135deg,#00838f,#00acc1)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 4px 18px rgba(0,172,193,0.35)",
                }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, color:"#006064" }}>
                  Redirection vers Gmail…
                </p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(84,110,122,0.6)" }}>
                  Votre message est prêt à être envoyé.
                </p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
                <div>
                  <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(84,110,122,0.7)", display:"block", marginBottom:6 }}>
                    Votre nom (optionnel)
                  </label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Dr. Martin Dupont"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(84,110,122,0.7)", display:"block", marginBottom:6 }}>
                    Objet
                  </label>
                  <input
                    type="text" value={subject} onChange={e => setSubject(e.target.value)}
                    placeholder="Problème de connexion"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(84,110,122,0.7)", display:"block", marginBottom:6 }}>
                    Message <span style={{ color:"#e53935", fontSize:10 }}>*</span>
                  </label>
                  <textarea
                    value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Décrivez votre problème…"
                    rows={4}
                    style={{ ...inputStyle, resize:"vertical", minHeight:90, lineHeight:1.5 }}
                  />
                </div>

                {/* Boutons */}
                <div style={{ display:"flex", gap:10, marginTop:4 }}>
                  <button
                    type="button" onClick={() => setOpen(false)}
                    style={{
                      flex:1, padding:"11px", border:"1.5px solid rgba(0,172,193,0.2)",
                      borderRadius:11, background:"transparent", cursor:"pointer",
                      fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500,
                      color:"rgba(84,110,122,0.8)", transition:"all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(0,172,193,0.06)"; e.currentTarget.style.borderColor="rgba(0,172,193,0.35)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="rgba(0,172,193,0.2)"; }}
                  >
                    Annuler
                  </button>
                  <button
                    type="button" onClick={handleSend} disabled={!message.trim()}
                    style={{
                      flex:2, padding:"11px", border:"none", borderRadius:11,
                      cursor: message.trim() ? "pointer" : "not-allowed",
                      background: message.trim()
                        ? "linear-gradient(135deg,#00838f,#00acc1)"
                        : "rgba(0,172,193,0.25)",
                      fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600,
                      color:"#fff", letterSpacing:"0.03em",
                      boxShadow: message.trim() ? "0 4px 16px rgba(0,172,193,0.3)" : "none",
                      transition:"all 0.25s",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                    }}
                    onMouseEnter={e => { if(message.trim()) e.currentTarget.style.boxShadow="0 6px 22px rgba(0,172,193,0.45)"; }}
                    onMouseLeave={e => { if(message.trim()) e.currentTarget.style.boxShadow="0 4px 16px rgba(0,172,193,0.3)"; }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                    Ouvrir dans Gmail
                  </button>
                </div>

                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"rgba(84,110,122,0.45)", textAlign:"center", marginTop:2 }}>
                  Votre message s'ouvrira dans Gmail prêt à envoyer
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   COMPOSANT PRINCIPAL
───────────────────────────────────────────── */
export default function Login() {
  const { login } = useAuthContext();
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [mounted,      setMounted]      = useState(false);
  const [focused,      setFocused]      = useState(null);
  const [tilt,         setTilt]         = useState({ rx:0, ry:0 });
  const [rememberMe,   setRememberMe]   = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("smile_remember_email");
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  // Tilt de carte — léger, limité à la carte uniquement
  const onCardMove = useCallback(e => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    setTilt({ rx: -dy * 4, ry: dx * 4 });
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
        rememberMe
          ? localStorage.setItem("smile_remember_email", email)
          : localStorage.removeItem("smile_remember_email");
      }
    } catch {
      setError("Connexion impossible. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#f8fcfd; overflow:hidden; }

        @keyframes crossFloat {
          0%,100% { transform:translate(-50%,-50%) rotate(0deg)   scale(1); }
          33%      { transform:translate(-50%,-50%) rotate(12deg)  scale(1.07); }
          66%      { transform:translate(-50%,-50%) rotate(-7deg)  scale(0.95); }
        }
        @keyframes ringFloat {
          0%,100% { transform:translate(-50%,-50%) scale(1)    rotate(0deg); }
          50%      { transform:translate(-50%,-50%) scale(1.05) rotate(35deg); }
        }
        @keyframes letterReveal {
          from { opacity:0; transform:translateY(16px); filter:blur(4px); }
          to   { opacity:1; transform:translateY(0);    filter:blur(0); }
        }
        @keyframes subtitleIn {
          from { opacity:0; letter-spacing:0.3em; }
          to   { opacity:1;  letter-spacing:0.06em; }
        }
        @keyframes fieldIn {
          from { opacity:0; transform:translateX(-12px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes topLine {
          from { width:0; }
          to   { width:100%; }
        }
        @keyframes glowBreath {
          0%,100% { opacity:0.3; }
          50%      { opacity:0.5; }
        }
        @keyframes spin {
          to { transform:rotate(360deg); }
        }
        @keyframes shimmerBtn {
          0%       { left:-120%; }
          60%,100% { left:230%; }
        }
        @keyframes badgePop {
          from { opacity:0; transform:scale(0.75) translateY(5px); }
          to   { opacity:1; transform:scale(1)    translateY(0); }
        }
        @keyframes lineReveal {
          from { transform:scaleX(0); }
          to   { transform:scaleX(1); }
        }
        @keyframes smileDraw {
          from { stroke-dashoffset:120; opacity:0; }
          to   { stroke-dashoffset:0;   opacity:1; }
        }
        input::placeholder { color:rgba(96,125,139,0.45) !important; }
        input:-webkit-autofill, input:-webkit-autofill:focus {
          -webkit-text-fill-color:#263238 !important;
          -webkit-box-shadow:0 0 0px 1000px rgba(224,247,250,0.85) inset !important;
          transition:background-color 5000s;
        }
      `}</style>

      {/* ── Fond canvas (30fps, allégé) ── */}
      <MedicalCanvas />

      {/* ── Motifs décoratifs CSS/SVG (0 JS) ── */}
      <DecorativePatterns />
      <MedicalCrosses />
      <PulseRings />

      {/* ── Contenu ── */}
      <div style={{
        position:"relative", zIndex:10,
        minHeight:"100vh",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"24px",
      }}>
        <div
          ref={cardRef}
          onMouseMove={onCardMove}
          onMouseLeave={onCardLeave}
          style={{
            width:"100%", maxWidth:430,
            opacity: mounted ? 1 : 0,
            transform:`
              perspective(1000px)
              rotateX(${tilt.rx}deg)
              rotateY(${tilt.ry}deg)
              translateY(${mounted ? 0 : 28}px)
              scale(${mounted ? 1 : 0.97})
            `,
            transition:"transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.65s ease",
            willChange:"transform",
            position:"relative",
          }}
        >
          {/* Halo derrière la carte */}
          <div style={{
            position:"absolute", inset:-4, borderRadius:34,
            background:"linear-gradient(135deg,rgba(0,188,212,0.28),rgba(0,150,136,0.18),rgba(38,198,218,0.22))",
            filter:"blur(22px)",
            animation:"glowBreath 3.5s ease-in-out infinite",
            zIndex:-1,
          }}/>

          {/* Surface carte */}
          <div style={{
            background:"rgba(255,255,255,0.9)",
            backdropFilter:"blur(36px) saturate(170%)",
            WebkitBackdropFilter:"blur(36px) saturate(170%)",
            border:"1.5px solid rgba(0,172,193,0.14)",
            borderRadius:28,
            padding:"44px 38px 40px",
            boxShadow:"0 0 0 1px rgba(255,255,255,0.92) inset, 0 28px 70px rgba(0,120,140,0.11), 0 6px 20px rgba(0,172,193,0.07)",
            position:"relative", overflow:"hidden",
          }}>

            {/* Reflet tilt interne */}
            <div style={{
              position:"absolute", inset:0, borderRadius:28, pointerEvents:"none",
              background:`radial-gradient(ellipse at ${50+tilt.ry*4}% ${50-tilt.rx*4}%, rgba(178,235,242,0.18) 0%, transparent 60%)`,
              transition:"background 0.1s",
            }}/>

            {/* Pattern émail hexagonal carte */}
            <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.06, pointerEvents:"none", borderRadius:28 }}>
              <defs>
                <pattern id="enamel" x="0" y="0" width="20" height="23" patternUnits="userSpaceOnUse">
                  <polygon points="10,1 19,6 19,17 10,22 1,17 1,6" fill="none" stroke="#00acc1" strokeWidth="1.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#enamel)"/>
            </svg>

            {/* Ligne colorée top */}
            <div style={{
              position:"absolute", top:0, left:0, right:0, height:3,
              borderRadius:"28px 28px 0 0",
              background:"linear-gradient(90deg,#00acc1,#00838f 40%,#00bcd4 70%,#4dd0e1)",
              animation: mounted ? "topLine 1s cubic-bezier(0.22,1,0.36,1) 0.4s both" : "none",
            }}/>

            {/* ── EN-TÊTE ── */}
            <div style={{ textAlign:"center", marginBottom:36 }}>

              {/* Badge */}
              <div style={{
                // display:"inline-flex", alignItems:"center", gap:6,
                // background:"rgba(0,172,193,0.08)",
                // border:"1px solid rgba(0,172,193,0.2)",
                // borderRadius:20, padding:"5px 14px", marginBottom:20,
                // animation:"badgePop 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both",
              }}>
                {/* <svg width="10" height="10" viewBox="0 0 24 24" fill="#00838f">
                  <rect x="9" y="2" width="6" height="20" rx="2"/>
                  <rect x="2" y="9" width="20" height="6" rx="2"/>
                </svg> */}
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#00838f" }}>
                  {/* Cabinet Dentaire SMILE */}
                </span>
              </div>

              {/* Logo circulaire */}
              <div style={{
                width:100, height:100, borderRadius:"50%",
                background:"rgba(255,255,255,0.95)",
                border:"1.5px solid rgba(0,172,193,0.22)",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 20px", padding:12,
                boxShadow:"0 10px 30px rgba(0,120,140,0.13), 0 0 0 5px rgba(0,172,193,0.06)",
                overflow:"hidden",
                opacity: mounted ? 1 : 0,
                transition:"opacity 0.7s 0.3s",
              }}>
                <img src="/SMILE.jpg" alt="SMILE"
                  style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:"50%" }}/>
              </div>

              {/* Titre lettre par lettre */}
              <div style={{ lineHeight:1, letterSpacing:"0.22em", marginBottom:5 }}>
                {"SMILE".split("").map((ch, i) => (
                  <span key={i} style={{
                    display:"inline-block",
                    fontFamily:"'Cormorant', serif", fontSize:44, fontWeight:600,
                    color:"#006064",
                    textShadow:"0 2px 18px rgba(0,172,193,0.18)",
                    animation:`letterReveal 0.65s cubic-bezier(0.22,1,0.36,1) ${0.35+i*0.09}s both`,
                  }}>{ch}</span>
                ))}
              </div>

              <p style={{
                fontFamily:"'Times New Roman', Times, serif",
                fontStyle:"italic",
                fontWeight:600,
                fontSize:16,
                color:"#006064",
                letterSpacing:"0.06em",
                textShadow:"0 1px 8px rgba(0,172,193,0.18)",
                animation:"subtitleIn 0.95s cubic-bezier(0.22,1,0.36,1) 0.95s both",
              }}>
                Gestion dentaire sécurisée
              </p>

              {/* Courbe sourire */}
              <div style={{ margin:"12px auto 0", width:120, animation:"fieldIn 0.6s ease 0.9s both" }}>
                <svg width="120" height="26" viewBox="0 0 120 26" fill="none">
                  <path d="M10,7 Q60,25 110,7" stroke="rgba(0,172,193,0.4)" strokeWidth="2"
                    strokeLinecap="round" fill="none"
                    style={{ strokeDasharray:120, animation:"smileDraw 1.2s cubic-bezier(0.22,1,0.36,1) 1s both" }}/>
                  <circle cx="10"  cy="7"  r="2.5" fill="rgba(0,172,193,0.45)"/>
                  <circle cx="110" cy="7"  r="2.5" fill="rgba(0,150,136,0.45)"/>
                  <circle cx="60"  cy="23" r="2"   fill="rgba(77,208,225,0.55)"/>
                </svg>
              </div>

              {/* Séparateur */}
              <div style={{ display:"flex", alignItems:"center", gap:8, margin:"14px auto 0", width:130, animation:"fieldIn 0.6s ease 1s both" }}>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(0,172,193,0.3))", transformOrigin:"right", animation:"lineReveal 0.8s ease 1s both" }}/>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="rgba(0,172,193,0.5)">
                  <rect x="9" y="2" width="6" height="20" rx="2"/>
                  <rect x="2" y="9" width="20" height="6" rx="2"/>
                </svg>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(0,150,136,0.3),transparent)", transformOrigin:"left", animation:"lineReveal 0.8s ease 1s both" }}/>
              </div>
            </div>

            {/* ── ERREUR ── */}
            {error && (
              <div style={{
                background:"rgba(229,57,53,0.07)", border:"1px solid rgba(229,57,53,0.18)",
                borderRadius:11, padding:"11px 14px", marginBottom:18,
                fontFamily:"'DM Sans',sans-serif", fontSize:13,
                color:"rgba(183,28,28,0.9)",
                display:"flex", alignItems:"center", gap:8,
              }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(183,28,28,0.8)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                {error}
              </div>
            )}

            {/* ── FORMULAIRE ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

              <AnimatedField id="email" label="Adresse email" type="email"
                value={email} onChange={setEmail} placeholder="personnel@cabinet.com"
                autoComplete="email" focused={focused==="email"}
                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                animDelay="1.1s" icon={EmailIcon}
              />

              <AnimatedField id="password" label="Mot de passe"
                type={showPassword ? "text" : "password"}
                value={password} onChange={setPassword} placeholder="••••••••••"
                autoComplete="current-password" focused={focused==="password"}
                onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                animDelay="1.2s" icon={LockIcon}
                suffix={
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    style={{
                      position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", cursor:"pointer",
                      color:"rgba(84,110,122,0.55)", display:"flex", alignItems:"center",
                      transition:"color 0.2s", padding:4,
                    }}>
                    <EyeIcon open={showPassword}/>
                  </button>
                }
              />

              {/* ── Se souvenir de moi ── */}
              <div style={{ display:"flex", alignItems:"center", animation:"fieldIn 0.65s cubic-bezier(0.22,1,0.36,1) 1.3s both" }}>
                <label htmlFor="rememberMe" style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", userSelect:"none" }}>
                  {/* Checkbox natif caché, visuellement remplacé */}
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ position:"absolute", opacity:0, width:0, height:0, pointerEvents:"none" }}
                  />
                  {/* Visuel custom */}
                  <div
                    aria-hidden="true"
                    style={{
                      width:20, height:20, borderRadius:6, flexShrink:0,
                      border:`2px solid ${rememberMe ? "#00acc1" : "rgba(0,172,193,0.35)"}`,
                      background: rememberMe
                        ? "linear-gradient(135deg,#00838f,#00acc1)"
                        : "rgba(240,252,254,0.9)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                      boxShadow: rememberMe ? "0 2px 12px rgba(0,172,193,0.35)" : "inset 0 1px 3px rgba(0,0,0,0.06)",
                      transform: rememberMe ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {rememberMe && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight: rememberMe ? 500 : 400,
                    color: rememberMe ? "#006064" : "rgba(84,110,122,0.75)",
                    transition:"color 0.2s, font-weight 0.2s",
                  }}>
                    Se souvenir de moi
                  </span>
                </label>
              </div>

              {/* ── Bouton connexion ── */}
              <button
                type="button" onClick={handleSubmit} disabled={loading}
                style={{
                  marginTop:2, width:"100%", padding:"14px 16px",
                  border:"none", borderRadius:13, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600,
                  color:"#fff", letterSpacing:"0.04em",
                  position:"relative", overflow:"hidden",
                  background:"linear-gradient(135deg,#00838f 0%,#00acc1 50%,#00796b 100%)",
                  boxShadow:"0 4px 22px rgba(0,172,193,0.32), 0 0 0 1px rgba(255,255,255,0.14) inset",
                  opacity: loading ? 0.65 : 1,
                  transition:"transform 0.2s, box-shadow 0.28s, opacity 0.3s",
                  animation:"fieldIn 0.65s cubic-bezier(0.22,1,0.36,1) 1.4s both",
                }}
                onMouseEnter={e => { if(!loading){ e.currentTarget.style.transform="translateY(-2px) scale(1.01)"; e.currentTarget.style.boxShadow="0 10px 32px rgba(0,172,193,0.45), 0 0 0 1px rgba(255,255,255,0.18) inset"; }}}
                onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 22px rgba(0,172,193,0.32), 0 0 0 1px rgba(255,255,255,0.14) inset"; }}
                onMouseDown={e => { if(!loading) e.currentTarget.style.transform="scale(0.987)"; }}
                onMouseUp={e => { if(!loading) e.currentTarget.style.transform="translateY(-2px) scale(1.01)"; }}
              >
                <span style={{
                  position:"absolute", top:0, left:"-120%", width:"60%", height:"100%",
                  background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)",
                  transform:"skewX(-20deg)",
                  animation: loading ? "none" : "shimmerBtn 3s ease-in-out 2s infinite",
                }}/>
                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"spin 0.78s linear infinite" }}>
                      <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Vérification…
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

              {/* ── Lien aide admin ── */}
              <ContactAdmin />

            </div>

            {/* ── Badges confiance ── */}
            <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:22, animation:"fieldIn 0.6s ease 1.6s both" }}>
              {[
                // { svg: <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#00838f" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>, label:"SSL" },
                // { svg: <svg width="11" height="11" viewBox="0 0 24 24" fill="#00838f"><rect x="9" y="2" width="6" height="20" rx="2"/><rect x="2" y="9" width="20" height="6" rx="2"/></svg>, label:"HDS" },
                // { svg: <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#00838f" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>, label:"RGPD" },
              ].map((b, i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:5,
                  background:"rgba(0,172,193,0.06)",
                  border:"1px solid rgba(0,172,193,0.12)",
                  borderRadius:20, padding:"4px 10px",
                }}>
                  {b.svg}
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:600, letterSpacing:"0.1em", color:"rgba(0,96,100,0.65)", textTransform:"uppercase" }}>{b.label}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <p style={{
              marginTop:16, textAlign:"center",
              fontFamily:"'DM Sans',sans-serif", fontSize:11,
              color:"rgba(84,110,122,0.38)", letterSpacing:"0.05em",
              animation:"fieldIn 0.6s ease 1.7s both",
            }}>
              © 2026 SMILE Dental · Accès réservé aux personnels
            </p>

          </div>
        </div>
      </div>
    </>
  );
}