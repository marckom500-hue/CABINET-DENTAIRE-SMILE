///////THEME GROK////

// import { useState } from 'react'
// import { useAuthContext } from '../hooks/AuthContext'

// export default function Login() {
//   const { login } = useAuthContext()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')
//     try {
//       const { error: err } = await login(email, password)
//       if (err) setError('Email ou mot de passe incorrect.')
//     } catch (err) {
//       setError('Connexion impossible. Veuillez réessayer.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
      
//       {/* Background Elements */}
//       <div className="absolute inset-0">
//         <div className="absolute inset-0 bg-[radial-gradient(at_50%_30%,rgba(45,212,191,0.15)_0%,transparent_50%)]" />
//         <div className="absolute inset-0 bg-[radial-gradient(at_20%_70%,rgba(16,185,129,0.12)_0%,transparent_50%)]" />
//       </div>

//       {/* Animated Orbs */}
//       <div className="absolute top-20 left-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse" />
//       <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

//       <div className="relative z-10 w-full max-w-md">
//         <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl p-10">
          
//           {/* Logo */}
//           <div className="flex justify-center mb-8">
//             <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/30 p-3">
//               <img 
//                 src="/SMILE.jpg" 
//                 alt="SMILE" 
//                 className="w-full h-full object-contain"
//               />
//             </div>
//           </div>

//           <div className="text-center mb-10">
//             <h1 className="text-4xl font-bold text-white tracking-tight">Bienvenue</h1>
//             <p className="text-teal-300 mt-2 text-lg">Cabinet Dentaire SMILE</p>
//             <p className="text-slate-400 text-sm mt-1">Dr. Boutchouang & Associés</p>
//           </div>

//           {error && (
//             <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm text-slate-300 mb-2 font-medium">Adresse email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 placeholder="votre@email.com"
//                 className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-2xl px-5 py-4 focus:outline-none focus:border-teal-400 transition-all"
//               />
//             </div>

//             <div>
//               <label className="block text-sm text-slate-300 mb-2 font-medium">Mot de passe</label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   placeholder="••••••••"
//                   className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-2xl px-5 py-4 focus:outline-none focus:border-teal-400 transition-all"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
//                 >
//                   {showPassword ? "🙈" : "👁️"}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-teal-500/40 active:scale-95 disabled:opacity-70"
//             >
//               {loading ? "Connexion en cours..." : "Se Connecter"}
//             </button>
//           </form>

//           <div className="text-center mt-8">
//             <p className="text-slate-400 text-xs">
//               © 2026 Cabinet Dentaire SMILE - Accès sécurisé
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


/////////////THEME CHATGPT///////////////////////
// import { useState } from 'react'
// import { useAuthContext } from '../hooks/AuthContext'

// export default function Login() {
//   const { login } = useAuthContext()

//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     try {
//       const { error: err } = await login(email, password)

//       if (err) {
//         setError('Email ou mot de passe incorrect.')
//       }
//     } catch (err) {
//       console.error('login error:', err)
//       setError('Connexion impossible. Vérifie ta connexion et réessaie.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[#04151f] flex items-center justify-center px-4">
      
//       {/* Background principal */}
//       <div className="absolute inset-0">

//         {/* Dégradé principal */}
//         <div className="absolute inset-0 bg-gradient-to-br from-[#02131d] via-[#052c3b] to-[#031017]" />

//         {/* Glow haut gauche */}
//         <div className="absolute -top-40 -left-32 w-[550px] h-[550px] bg-cyan-500/25 rounded-full blur-3xl animate-pulse" />

//         {/* Glow haut droite */}
//         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />

//         {/* Glow bas centre */}
//         <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-teal-400/20 rounded-full blur-3xl" />

//         {/* Effet violet subtil */}
//         <div className="absolute bottom-10 right-20 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl" />

//         {/* Grille premium */}
//         <div
//           className="absolute inset-0 opacity-[0.06]"
//           style={{
//             backgroundImage: `
//               linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
//               linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
//             `,
//             backgroundSize: '60px 60px',
//           }}
//         />

//         {/* Lumière centrale */}
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_60%)]" />
//       </div>

//       {/* Carte Login */}
//       <div className="relative z-10 w-full max-w-md">

//         <div className="
//           backdrop-blur-2xl
//           bg-white/10
//           border border-white/20
//           shadow-[0_25px_80px_rgba(0,0,0,0.45)]
//           rounded-[32px]
//           p-8 sm:p-10
//         ">

//           {/* Header */}
//           <div className="text-center mb-8">

//             <div className="
//               w-24 h-24
//               mx-auto mb-5
//               rounded-[28px]
//               overflow-hidden
//               border border-white/20
//               bg-white/10
//               shadow-xl
//               flex items-center justify-center
//               backdrop-blur-xl
//             ">
//               <img
//                 src="/SMILE.jpg"
//                 alt="Logo SMILE"
//                 className="w-16 h-16 object-contain"
//               />
//             </div>

//             <h1 className="text-4xl font-extrabold tracking-wide text-white">
//               SMILE
//             </h1>

//             <p className="mt-2 text-sm text-cyan-100/80">
//               Gestion dentaire moderne & sécurisée
//             </p>
//           </div>

//           {/* Error */}
//           {error && (
//             <div
//               className="
//                 mb-6
//                 rounded-2xl
//                 border border-red-400/20
//                 bg-red-500/10
//                 backdrop-blur-md
//                 px-4 py-3
//                 text-sm text-red-200
//               "
//             >
//               {error}
//             </div>
//           )}

//           {/* Formulaire */}
//           <form onSubmit={handleSubmit} className="space-y-5">

//             {/* Email */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="
//                   mb-2 ml-1 block
//                   text-xs font-semibold
//                   uppercase tracking-[0.2em]
//                   text-cyan-100/70
//                 "
//               >
//                 Email
//               </label>

//               <input
//                 id="email"
//                 type="email"
//                 required
//                 autoComplete="email"
//                 placeholder="exemple@email.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="
//                   w-full
//                   rounded-2xl
//                   border border-white/10
//                   bg-white/10
//                   px-4 py-3
//                   text-sm text-white
//                   placeholder:text-white/40
//                   outline-none
//                   backdrop-blur-xl
//                   transition-all duration-300
//                   focus:border-cyan-400
//                   focus:bg-white/15
//                   focus:ring-4 focus:ring-cyan-400/20
//                 "
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label
//                 htmlFor="password"
//                 className="
//                   mb-2 ml-1 block
//                   text-xs font-semibold
//                   uppercase tracking-[0.2em]
//                   text-cyan-100/70
//                 "
//               >
//                 Mot de passe
//               </label>

//               <div className="relative">

//                 <input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   required
//                   autoComplete="current-password"
//                   placeholder="Votre mot de passe"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="
//                     w-full
//                     rounded-2xl
//                     border border-white/10
//                     bg-white/10
//                     px-4 py-3 pr-12
//                     text-sm text-white
//                     placeholder:text-white/40
//                     outline-none
//                     backdrop-blur-xl
//                     transition-all duration-300
//                     focus:border-emerald-400
//                     focus:bg-white/15
//                     focus:ring-4 focus:ring-emerald-400/20
//                   "
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                   className="
//                     absolute right-4 top-1/2 -translate-y-1/2
//                     text-white/50
//                     transition-all duration-200
//                     hover:text-cyan-300
//                   "
//                 >
//                   {showPassword ? (
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-5 w-5"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                       strokeWidth={1.8}
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
//                       />
//                     </svg>
//                   ) : (
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-5 w-5"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                       strokeWidth={1.8}
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                       />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="
//                 relative
//                 overflow-hidden
//                 w-full
//                 rounded-2xl
//                 bg-gradient-to-r
//                 from-cyan-500
//                 via-teal-500
//                 to-emerald-500
//                 px-4 py-3
//                 text-sm font-bold
//                 text-white
//                 shadow-[0_10px_35px_rgba(16,185,129,0.35)]
//                 transition-all duration-300
//                 hover:scale-[1.02]
//                 hover:shadow-[0_15px_45px_rgba(6,182,212,0.45)]
//                 active:scale-[0.99]
//                 disabled:opacity-60
//               "
//             >
//               <span className="relative z-10">
//                 {loading ? 'Connexion...' : 'Se connecter'}
//               </span>

//               <div className="
//                 absolute inset-0
//                 bg-white/10
//                 opacity-0
//                 hover:opacity-100
//                 transition-opacity duration-300
//               " />
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }



//////THEME DEEPSEEK/////////////

// import { useState } from 'react'
// import { useAuthContext } from '../hooks/AuthContext'

// export default function Login() {
//   const { login } = useAuthContext()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')
//     try {
//       const { error: err } = await login(email, password)
//       if (err) setError('Email ou mot de passe incorrect.')
//     } catch (err) {
//       console.error('login error:', err)
//       setError('Connexion impossible. Vérifie ta connexion et réessaie.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
//       {/* ===== ARRIÈRE-PLAN PRINCIPAL ===== */}
//       <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//         {/* Effet de verre dépoli en superposition */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
//       </div>

//       {/* ===== PARTICULES ANIMÉES ===== */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {[...Array(20)].map((_, i) => (
//           <div
//             key={i}
//             className="absolute rounded-full bg-white/20 animate-pulse"
//             style={{
//               width: Math.random() * 4 + 2 + 'px',
//               height: Math.random() * 4 + 2 + 'px',
//               left: Math.random() * 100 + '%',
//               top: Math.random() * 100 + '%',
//               animationDuration: Math.random() * 5 + 3 + 's',
//               animationDelay: Math.random() * 5 + 's',
//             }}
//           />
//         ))}
//       </div>

//       {/* ===== CERCLES DÉCORATIFS ===== */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-full blur-3xl animate-slow-spin" />
//         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-slow-spin-reverse" />
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-teal-500/10 rounded-full blur-3xl" />
//       </div>

//       {/* ===== GRILLE MODERNE ===== */}
//       <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
//         <div className="absolute inset-0" style={{
//           backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
//                             linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
//           backgroundSize: '50px 50px',
//         }} />
//       </div>

//       {/* ===== CARTE DE CONNEXION ===== */}
//       <div className="relative z-10 w-full max-w-md animate-fade-in-up">
//         <div className="relative backdrop-blur-2xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 overflow-hidden">
//           {/* Effet de brillance sur la carte */}
//           <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
          
//           {/* Bordure lumineuse au survol */}
//           <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 via-purple-400 to-pink-400 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 -z-10" />
          
//           <div className="relative">
//             {/* ===== LOGO ===== */}
//             <div className="flex justify-center mb-6">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-3xl blur-xl opacity-60 animate-pulse" />
//                 <div className="relative w-24 h-24 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl flex items-center justify-center shadow-2xl border border-white/30 backdrop-blur-sm">
//                   <img
//                     src="/SMILE.jpg"
//                     alt="Logo SMILE"
//                     className="w-16 h-16 object-contain drop-shadow-lg"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* ===== TITRE ===== */}
//             <div className="text-center mb-8">
//               <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-teal-200 to-white bg-clip-text text-transparent">
//                 SMILE
//               </h1>
//               <div className="mt-3 inline-block">
//                 <div className="h-[2px] w-12 bg-gradient-to-r from-teal-400 to-transparent mx-auto" />
//               </div>
//               <p className="mt-4 text-sm text-white/60 font-medium">
//                 Gestion dentaire sécurisée
//               </p>
//             </div>

//             {/* ===== MESSAGE D'ERREUR ===== */}
//             {error && (
//               <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-4 py-3 text-sm text-red-200 animate-shake flex items-center gap-2">
//                 <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 {error}
//               </div>
//             )}

//             {/* ===== FORMULAIRE ===== */}
//             <form onSubmit={handleSubmit} className="space-y-5">
//               <div className="group">
//                 <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 ml-1">
//                   Email
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
//                     <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
//                     </svg>
//                   </div>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     placeholder="exemple@email.com"
//                     className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-teal-400 focus:bg-white/15 focus:ring-2 focus:ring-teal-400/30"
//                   />
//                 </div>
//               </div>

//               <div className="group">
//                 <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 ml-1">
//                   Mot de passe
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
//                     <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                     </svg>
//                   </div>
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     placeholder="Votre mot de passe"
//                     className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 pl-10 pr-12 text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-teal-400 focus:bg-white/15 focus:ring-2 focus:ring-teal-400/30"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-teal-400 transition-colors"
//                     aria-label={showPassword ? 'Masquer' : 'Afficher'}
//                   >
//                     {showPassword ? (
//                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                       </svg>
//                     ) : (
//                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       </svg>
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="relative w-full mt-6 group overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-teal-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
//                 {loading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                     </svg>
//                     Connexion...
//                   </div>
//                 ) : (
//                   'Se connecter'
//                 )}
//               </button>
//             </form>

//             {/* ===== LIEN INFORMATIF ===== */}
//             <div className="mt-8 text-center">
//               <p className="text-xs text-white/30">
//                 Cabinet dentaire sécurisé
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ===== STYLES PERSONNALISÉS ===== */}
//       <style dangerouslySetInnerHTML={{ __html: `
//         @keyframes fade-in-up {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         @keyframes slow-spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes slow-spin-reverse {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(-360deg); }
//         }
//         @keyframes shake {
//           0%, 100% { transform: translateX(0); }
//           10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
//           20%, 40%, 60%, 80% { transform: translateX(2px); }
//         }
//         @keyframes blob {
//           0% { transform: translate(0px, 0px) scale(1); }
//           33% { transform: translate(30px, -50px) scale(1.1); }
//           66% { transform: translate(-20px, 20px) scale(0.9); }
//           100% { transform: translate(0px, 0px) scale(1); }
//         }
//         .animate-fade-in-up {
//           animation: fade-in-up 0.8s ease-out;
//         }
//         .animate-slow-spin {
//           animation: slow-spin 25s linear infinite;
//         }
//         .animate-slow-spin-reverse {
//           animation: slow-spin-reverse 20s linear infinite;
//         }
//         .animate-shake {
//           animation: shake 0.4s ease-in-out;
//         }
//         .animate-blob {
//           animation: blob 7s infinite;
//         }
//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }
//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }
//       ` }} />
//     </div>
//   )
// }

////THEME GEMINI/////////////////
// import { useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { useAuthContext } from '../hooks/AuthContext'

// export default function Login() {
//   const { login } = useAuthContext()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')
//     try {
//       const { error: err } = await login(email, password)
//       if (err) setError('Identifiants invalides')
//     } catch (err) {
//       setError('Erreur de connexion au serveur')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4 relative overflow-hidden">
      
//       {/* BACKGROUND DYNAMIQUE : Particules flottantes */}
//       <div className="absolute inset-0 z-0">
//         {[...Array(5)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute rounded-full mix-blend-screen filter blur-[100px] opacity-20"
//             style={{
//               width: Math.random() * 400 + 200,
//               height: Math.random() * 400 + 200,
//               backgroundColor: i % 2 === 0 ? '#0d9488' : '#3b82f6',
//               top: `${Math.random() * 100}%`,
//               left: `${Math.random() * 100}%`,
//             }}
//             animate={{
//               x: [0, 50, -50, 0],
//               y: [0, -50, 50, 0],
//               scale: [1, 1.2, 0.8, 1],
//             }}
//             transition={{
//               duration: Math.random() * 10 + 10,
//               repeat: Infinity,
//               ease: "linear"
//             }}
//           />
//         ))}
//       </div>

//       <motion.div 
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, ease: "easeOut" }}
//         className="relative z-10 w-full max-w-md"
//       >
//         {/* CARTE GLASSMORPHISM */}
//         <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10 p-8 sm:p-12">
          
//           <div className="text-center mb-10">
//             <motion.div 
//               whileHover={{ rotate: 10, scale: 1.1 }}
//               className="w-20 h-20 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 p-1 shadow-2xl"
//             >
//               <div className="bg-[#0a0f1a] w-full h-full rounded-[1.4rem] flex items-center justify-center overflow-hidden">
//                 <img src="/SMILE.jpg" alt="Logo" className="w-12 h-12 object-contain" />
//               </div>
//             </motion.div>
            
//             <h1 className="text-4xl font-black text-white tracking-tighter mb-1">
//               SMILE <span className="text-teal-400">.</span>
//             </h1>
//             <p className="text-gray-400 text-sm font-medium tracking-widest uppercase opacity-70">
//               Espace Praticien
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* Input Email Animé */}
//             <motion.div whileTap={{ scale: 0.995 }}>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Adresse e-mail"
//                 className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 transition-all duration-300"
//                 required
//               />
//             </motion.div>

//             {/* Input Password Animé */}
//             <motion.div className="relative" whileTap={{ scale: 0.995 }}>
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Mot de passe"
//                 className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 transition-all duration-300"
//                 required
//               />
//               <button 
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-400"
//               >
//                 {showPassword ? "🙈" : "👁️"}
//               </button>
//             </motion.div>

//             {/* Bouton de Soumission avec État de Loading */}
//             <motion.button
//               whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(20, 184, 166, 0.4)" }}
//               whileTap={{ scale: 0.98 }}
//               disabled={loading}
//               className="w-full bg-teal-500 hover:bg-teal-400 text-[#0a0f1a] font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3"
//             >
//               {loading ? (
//                 <div className="w-6 h-6 border-4 border-[#0a0f1a]/30 border-t-[#0a0f1a] rounded-full animate-spin" />
//               ) : (
//                 "Se connecter"
//               )}
//             </motion.button>
//           </form>

//           {/* Message d'erreur animé */}
//           <AnimatePresence>
//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: 'auto' }}
//                 exit={{ opacity: 0, height: 0 }}
//                 className="mt-4 text-red-400 text-center text-sm font-bold"
//               >
//                 {error}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
        
//         <p className="text-center mt-8 text-gray-500 text-xs tracking-widest uppercase">
//           Système sécurisé SMILE v2.0
//         </p>
//       </motion.div>
//     </div>
//   )
// }


//////////THEME CLAUDE CODE////
      ////////THEME N*1//////////////////////////
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useAuthContext } from "../hooks/AuthContext";

// /* ─────────────────────────────────────────────
//    HELPERS
// ───────────────────────────────────────────── */
// const lerp = (a, b, t) => a + (b - a) * t;
// const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
// const COLORS = {
//   c1: [0, 210, 190],
//   c2: [80, 120, 255],
//   c3: [200, 80, 255],
//   c4: [0, 180, 255],
// };

// /* ─────────────────────────────────────────────
//    MORPHING GRADIENT CANVAS (background)
// ───────────────────────────────────────────── */
// function MorphCanvas({ mouseRef }) {
//   const canvasRef = useRef(null);
//   const rafRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     let W, H;

//     const resize = () => {
//       W = canvas.width = window.innerWidth;
//       H = canvas.height = window.innerHeight;
//     };
//     resize();
//     window.addEventListener("resize", resize);

//     const blobs = [
//       { x: 0.2, y: 0.3, vx: 0.00025, vy: 0.00018, r: 0.38, color: COLORS.c1, phase: 0 },
//       { x: 0.75, y: 0.2, vx: -0.0002, vy: 0.00022, r: 0.32, color: COLORS.c2, phase: 2.1 },
//       { x: 0.5, y: 0.75, vx: 0.00015, vy: -0.0002, r: 0.35, color: COLORS.c3, phase: 4.2 },
//       { x: 0.85, y: 0.65, vx: -0.00018, vy: -0.00015, r: 0.28, color: COLORS.c4, phase: 1.0 },
//       { x: 0.15, y: 0.75, vx: 0.0002, vy: 0.00012, r: 0.3, color: COLORS.c1, phase: 3.3 },
//     ];

//     let t = 0;
//     const draw = () => {
//       t += 0.008;
//       ctx.clearRect(0, 0, W, H);
//       ctx.fillStyle = "#03060f";
//       ctx.fillRect(0, 0, W, H);

//       const mx = mouseRef.current.x / window.innerWidth;
//       const my = mouseRef.current.y / window.innerHeight;

//       blobs.forEach((b) => {
//         b.x += b.vx * Math.sin(t * 0.7 + b.phase);
//         b.y += b.vy * Math.cos(t * 0.5 + b.phase);
//         if (b.x < 0.05 || b.x > 0.95) b.vx *= -1;
//         if (b.y < 0.05 || b.y > 0.95) b.vy *= -1;
//         b.x = clamp(b.x, 0.05, 0.95);
//         b.y = clamp(b.y, 0.05, 0.95);

//         const dx = mx - b.x, dy = my - b.y;
//         const dist = Math.sqrt(dx * dx + dy * dy);
//         if (dist < 0.4) { b.x += dx * 0.0008; b.y += dy * 0.0008; }

//         const pulse = 1 + 0.12 * Math.sin(t * 1.2 + b.phase);
//         const radius = b.r * Math.min(W, H) * pulse;
//         const gx = b.x * W, gy = b.y * H;
//         const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
//         const [r, g, bl] = b.color;
//         grad.addColorStop(0, `rgba(${r},${g},${bl},0.22)`);
//         grad.addColorStop(0.4, `rgba(${r},${g},${bl},0.1)`);
//         grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);
//         ctx.beginPath();
//         ctx.arc(gx, gy, radius, 0, Math.PI * 2);
//         ctx.fillStyle = grad;
//         ctx.fill();
//       });

//       // Scan sweep
//       const scanY = (t * 55) % H;
//       const sg = ctx.createLinearGradient(0, scanY - 80, 0, scanY + 80);
//       sg.addColorStop(0, "rgba(0,210,190,0)");
//       sg.addColorStop(0.5, "rgba(0,210,190,0.022)");
//       sg.addColorStop(1, "rgba(0,210,190,0)");
//       ctx.fillStyle = sg;
//       ctx.fillRect(0, scanY - 80, W, 160);

//       // Vignette
//       const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9);
//       vig.addColorStop(0, "rgba(0,0,0,0)");
//       vig.addColorStop(1, "rgba(0,0,0,0.7)");
//       ctx.fillStyle = vig;
//       ctx.fillRect(0, 0, W, H);

//       rafRef.current = requestAnimationFrame(draw);
//     };

//     draw();
//     return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
//   }, []);

//   return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, display: "block" }} />;
// }

// /* ─────────────────────────────────────────────
//    PARTICLE + CONNECTION CANVAS
// ───────────────────────────────────────────── */
// function ParticleCanvas({ mouseRef }) {
//   const canvasRef = useRef(null);
//   const rafRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     let W, H;

//     const resize = () => {
//       W = canvas.width = window.innerWidth;
//       H = canvas.height = window.innerHeight;
//     };
//     resize();
//     window.addEventListener("resize", resize);

//     const COUNT = 110;
//     const particles = Array.from({ length: COUNT }, () => ({
//       x: Math.random() * window.innerWidth,
//       y: Math.random() * window.innerHeight,
//       vx: (Math.random() - 0.5) * 0.28,
//       vy: (Math.random() - 0.5) * 0.28,
//       r: Math.random() * 1.5 + 0.4,
//       alpha: Math.random() * 0.45 + 0.2,
//       hue: Math.random() * 60 + 170,
//     }));

//     let t = 0;
//     const draw = () => {
//       t += 0.01;
//       ctx.clearRect(0, 0, W, H);
//       const mx = mouseRef.current.x;
//       const my = mouseRef.current.y;

//       particles.forEach((p, i) => {
//         p.x += p.vx; p.y += p.vy;
//         const dx = p.x - mx, dy = p.y - my;
//         const d = Math.sqrt(dx * dx + dy * dy);
//         if (d < 130) { const f = (130 - d) / 130; p.x += dx * f * 0.022; p.y += dy * f * 0.022; }
//         if (p.x < -5) p.x = W + 5;
//         if (p.x > W + 5) p.x = -5;
//         if (p.y < -5) p.y = H + 5;
//         if (p.y > H + 5) p.y = -5;

//         const pulse = p.alpha * (0.7 + 0.3 * Math.sin(t * 2 + i));
//         ctx.beginPath();
//         ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
//         ctx.fillStyle = `hsla(${p.hue},85%,70%,${pulse})`;
//         ctx.fill();

//         for (let j = i + 1; j < particles.length; j++) {
//           const q = particles[j];
//           const ex = p.x - q.x, ey = p.y - q.y;
//           const ed = Math.sqrt(ex * ex + ey * ey);
//           if (ed < 88) {
//             ctx.beginPath();
//             ctx.moveTo(p.x, p.y);
//             ctx.lineTo(q.x, q.y);
//             ctx.strokeStyle = `hsla(${(p.hue + q.hue) / 2},75%,65%,${(1 - ed / 88) * 0.11})`;
//             ctx.lineWidth = 0.5;
//             ctx.stroke();
//           }
//         }
//       });

//       rafRef.current = requestAnimationFrame(draw);
//     };

//     draw();
//     return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
//   }, []);

//   return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }} />;
// }

// /* ─────────────────────────────────────────────
//    FLOATING ORBITAL RINGS
// ───────────────────────────────────────────── */
// function FloatingRings() {
//   const rings = [
//     { size: 620, x: "6%", y: "10%", delay: 0, dur: 18, col: "rgba(0,210,190,0.055)" },
//     { size: 430, x: "74%", y: "7%", delay: -6, dur: 22, col: "rgba(80,120,255,0.05)" },
//     { size: 310, x: "88%", y: "62%", delay: -11, dur: 16, col: "rgba(200,80,255,0.055)" },
//     { size: 240, x: "12%", y: "74%", delay: -4, dur: 20, col: "rgba(0,180,255,0.055)" },
//   ];
//   return (
//     <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
//       {rings.map((r, i) => (
//         <div key={i} style={{
//           position: "absolute", left: r.x, top: r.y,
//           width: r.size, height: r.size,
//           transform: "translate(-50%,-50%)",
//           border: `1px solid ${r.col}`,
//           borderRadius: "50%",
//           animation: `ringFloat ${r.dur}s ease-in-out ${r.delay}s infinite`,
//         }}>
//           <div style={{
//             position: "absolute", inset: 28,
//             border: `1px solid ${r.col}`,
//             borderRadius: "50%",
//             animation: `ringFloat ${r.dur * 0.75}s ease-in-out ${r.delay - 2}s infinite reverse`,
//           }} />
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────
//    ANIMATED GRID OVERLAY
// ───────────────────────────────────────────── */
// function AnimatedGrid() {
//   return (
//     <div style={{
//       position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
//       backgroundImage: `linear-gradient(rgba(0,210,190,0.038) 1px,transparent 1px),linear-gradient(90deg,rgba(0,210,190,0.038) 1px,transparent 1px)`,
//       backgroundSize: "58px 58px",
//       animation: "gridDrift 18s linear infinite",
//       maskImage: "radial-gradient(ellipse 65% 65% at 50% 50%, black 20%, transparent 100%)",
//       WebkitMaskImage: "radial-gradient(ellipse 65% 65% at 50% 50%, black 20%, transparent 100%)",
//     }} />
//   );
// }

// /* ─────────────────────────────────────────────
//    CUSTOM CURSOR
// ───────────────────────────────────────────── */
// function CustomCursor({ mouseRef }) {
//   const dotRef = useRef(null);
//   const ringRef = useRef(null);
//   const trailRef = useRef(null);
//   const rp = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
//   const tp = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
//   const rafRef = useRef(null);

//   useEffect(() => {
//     const animate = () => {
//       const { x, y } = mouseRef.current;
//       if (dotRef.current) { dotRef.current.style.left = `${x}px`; dotRef.current.style.top = `${y}px`; }
//       rp.current.x = lerp(rp.current.x, x, 0.13);
//       rp.current.y = lerp(rp.current.y, y, 0.13);
//       tp.current.x = lerp(tp.current.x, x, 0.06);
//       tp.current.y = lerp(tp.current.y, y, 0.06);
//       if (ringRef.current) { ringRef.current.style.left = `${rp.current.x}px`; ringRef.current.style.top = `${rp.current.y}px`; }
//       if (trailRef.current) { trailRef.current.style.left = `${tp.current.x}px`; trailRef.current.style.top = `${tp.current.y}px`; }
//       rafRef.current = requestAnimationFrame(animate);
//     };
//     animate();
//     return () => cancelAnimationFrame(rafRef.current);
//   }, []);

//   const base = { position: "fixed", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, transform: "translate(-50%,-50%)" };
//   return (
//     <>
//       <div ref={trailRef} style={{ ...base, width: 48, height: 48, border: "1px solid rgba(0,210,190,0.18)", background: "rgba(0,210,190,0.03)" }} />
//       <div ref={ringRef} style={{ ...base, width: 28, height: 28, border: "1px solid rgba(0,210,190,0.55)" }} />
//       <div ref={dotRef} style={{ ...base, width: 5, height: 5, background: "#00d2be", boxShadow: "0 0 10px rgba(0,210,190,1)" }} />
//     </>
//   );
// }

// /* ─────────────────────────────────────────────
//    ANIMATED INPUT FIELD
// ───────────────────────────────────────────── */
// function AnimatedField({ id, label, type, value, onChange, placeholder, autoComplete, focused, onFocus, onBlur, suffix, animDelay }) {
//   return (
//     <div style={{ animation: `fieldIn 0.65s cubic-bezier(0.22,1,0.36,1) ${animDelay} both` }}>
//       <label htmlFor={id} style={{
//         display: "flex", alignItems: "center", gap: 8,
//         fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600,
//         letterSpacing: "0.22em", textTransform: "uppercase",
//         color: focused ? "rgba(0,210,190,0.95)" : "rgba(110,140,185,0.65)",
//         marginBottom: 8, marginLeft: 2, transition: "color 0.3s",
//       }}>
//         <span style={{
//           display: "inline-block",
//           width: focused ? 18 : 10, height: 1,
//           background: focused ? "rgba(0,210,190,0.8)" : "rgba(110,140,185,0.3)",
//           transition: "all 0.3s",
//         }} />
//         {label}
//       </label>
//       <div style={{ position: "relative" }}>
//         <input
//           id={id} type={type} value={value}
//           onChange={e => onChange(e.target.value)}
//           onFocus={onFocus} onBlur={onBlur}
//           required autoComplete={autoComplete} placeholder={placeholder}
//           style={{
//             width: "100%",
//             background: focused ? "rgba(0,210,190,0.05)" : "rgba(255,255,255,0.035)",
//             border: `1px solid ${focused ? "rgba(0,210,190,0.5)" : "rgba(255,255,255,0.075)"}`,
//             borderRadius: 13, padding: "13px 16px",
//             paddingRight: suffix ? 46 : 16,
//             fontFamily: "'Outfit', sans-serif", fontSize: 14,
//             color: "rgba(215,230,255,0.95)", outline: "none",
//             caretColor: "#00d2be",
//             boxShadow: focused ? "0 0 0 3px rgba(0,210,190,0.09), 0 0 24px rgba(0,210,190,0.06)" : "none",
//             transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
//           }}
//         />
//         {suffix}
//         {/* Bottom glow bar */}
//         <div style={{
//           position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
//           height: 2, borderRadius: "0 0 13px 13px",
//           width: focused ? "75%" : "0%",
//           background: "linear-gradient(90deg,#00d2be,#5078ff,#c850ff)",
//           transition: "width 0.45s cubic-bezier(0.22,1,0.36,1)",
//           boxShadow: focused ? "0 0 12px rgba(0,210,190,0.5)" : "none",
//         }} />
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────
//    EYE ICON
// ───────────────────────────────────────────── */
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
//    MAIN COMPONENT
// ───────────────────────────────────────────── */
// export default function Login() {
//   const { login } = useAuthContext();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [focused, setFocused] = useState(null);
//   const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
//   const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
//   const cardRef = useRef(null);

//   useEffect(() => {
//     const t = setTimeout(() => setMounted(true), 100);
//     return () => clearTimeout(t);
//   }, []);

//   useEffect(() => {
//     const onMove = e => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
//     window.addEventListener("mousemove", onMove);
//     return () => window.removeEventListener("mousemove", onMove);
//   }, []);

//   const onCardMove = useCallback(e => {
//     const rect = cardRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
//     const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
//     setTilt({ rx: -dy * 7, ry: dx * 7 });
//   }, []);

//   const onCardLeave = useCallback(() => setTilt({ rx: 0, ry: 0 }), []);

//   const handleSubmit = async e => {
//     e?.preventDefault?.();
//     setLoading(true); setError("");
//     try {
//       const { error: err } = await login(email, password);
//       if (err) setError("Email ou mot de passe incorrect.");
//     } catch {
//       setError("Connexion impossible. Vérifiez votre connexion.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {/* ── Global CSS ── */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Outfit:wght@300;400;500;600&display=swap');
//         *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
//         body { overflow:hidden; cursor:none; background:#03060f; }

//         @keyframes ringFloat {
//           0%,100% { transform:translate(-50%,-50%) scale(1) rotate(0deg); }
//           33%      { transform:translate(-50%,-50%) scale(1.06) rotate(55deg); }
//           66%      { transform:translate(-50%,-50%) scale(0.95) rotate(115deg); }
//         }
//         @keyframes gridDrift {
//           from { background-position:0 0; }
//           to   { background-position:58px 58px; }
//         }
//         @keyframes letterIn {
//           from { opacity:0; transform:translateY(22px) skewY(4deg); filter:blur(8px); }
//           to   { opacity:1; transform:translateY(0) skewY(0); filter:blur(0); }
//         }
//         @keyframes subtitleIn {
//           from { opacity:0; letter-spacing:0.7em; }
//           to   { opacity:0.5; letter-spacing:0.28em; }
//         }
//         @keyframes fieldIn {
//           from { opacity:0; transform:translateX(-18px); }
//           to   { opacity:1; transform:translateX(0); }
//         }
//         @keyframes topLine {
//           from { width:0; opacity:0; }
//           to   { width:100%; opacity:1; }
//         }
//         @keyframes lineReveal {
//           from { transform:scaleX(0); }
//           to   { transform:scaleX(1); }
//         }
//         @keyframes glowPulse {
//           0%,100% { opacity:0.45; transform:scale(1); }
//           50%      { opacity:0.75; transform:scale(1.04); }
//         }
//         @keyframes spin {
//           to { transform:rotate(360deg); }
//         }
//         @keyframes shimmerBtn {
//           0%     { left:-120%; }
//           60%,100% { left:220%; }
//         }
//         input::placeholder { color: rgba(70,95,140,0.55) !important; }
//         input:-webkit-autofill, input:-webkit-autofill:focus {
//           -webkit-text-fill-color: rgba(215,230,255,0.95) !important;
//           -webkit-box-shadow: 0 0 0px 1000px rgba(4,8,20,0.98) inset !important;
//           transition: background-color 5000s;
//         }
//       `}</style>

//       {/* ── Curseur personnalisé ── */}
//       <CustomCursor mouseRef={mouseRef} />

//       {/* ── Backgrounds ── */}
//       <MorphCanvas mouseRef={mouseRef} />
//       <ParticleCanvas mouseRef={mouseRef} />
//       <FloatingRings />
//       <AnimatedGrid />

//       {/* ── Layout ── */}
//       <div style={{
//         position: "relative", zIndex: 10,
//         minHeight: "100vh",
//         display: "flex", alignItems: "center", justifyContent: "center",
//         padding: 24,
//       }}>
//         {/* 3-D tilt card */}
//         <div
//           ref={cardRef}
//           onMouseMove={onCardMove}
//           onMouseLeave={onCardLeave}
//           style={{
//             width: "100%", maxWidth: 415,
//             opacity: mounted ? 1 : 0,
//             transform: `
//               perspective(950px)
//               rotateX(${tilt.rx}deg)
//               rotateY(${tilt.ry}deg)
//               translateY(${mounted ? 0 : 36}px)
//               scale(${mounted ? 1 : 0.96})
//             `,
//             transition: "transform 0.65s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease",
//             willChange: "transform",
//             position: "relative",
//           }}
//         >
//           {/* Outer glow halo */}
//           <div style={{
//             position: "absolute", inset: -3, borderRadius: 32,
//             background: "linear-gradient(135deg,rgba(0,210,190,0.45),rgba(80,120,255,0.35),rgba(200,80,255,0.35))",
//             filter: "blur(22px)",
//             animation: "glowPulse 3.2s ease-in-out infinite",
//             zIndex: -1,
//           }} />

//           {/* Card surface */}
//           <div style={{
//             background: "rgba(5,9,22,0.74)",
//             backdropFilter: "blur(42px) saturate(210%)",
//             WebkitBackdropFilter: "blur(42px) saturate(210%)",
//             border: "1px solid rgba(255,255,255,0.085)",
//             borderRadius: 28,
//             padding: "46px 40px 42px",
//             boxShadow: "0 0 0 1px rgba(0,210,190,0.06) inset, 0 50px 110px rgba(0,0,0,0.6)",
//             position: "relative", overflow: "hidden",
//           }}>
//             {/* Mouse-tracking inner highlight */}
//             <div style={{
//               position: "absolute", inset: 0, borderRadius: 28, pointerEvents: "none",
//               background: `radial-gradient(ellipse at ${50 + tilt.ry * 3.5}% ${50 - tilt.rx * 3.5}%, rgba(0,210,190,0.065) 0%, transparent 65%)`,
//               transition: "background 0.08s",
//             }} />

//             {/* Top shimmer line */}
//             <div style={{
//               position: "absolute", top: 0, left: 0, right: 0, height: 2,
//               borderRadius: "28px 28px 0 0",
//               background: "linear-gradient(90deg,transparent 0%,#00d2be 25%,#5078ff 55%,#c850ff 75%,transparent 100%)",
//               animation: mounted ? "topLine 1.1s cubic-bezier(0.22,1,0.36,1) 0.4s both" : "none",
//             }} />

//             {/* ── HEADER ── */}
//             <div style={{ textAlign: "center", marginBottom: 42 }}>
//               {/* Logo */}
//               <div style={{
//                 width: 70, height: 70, borderRadius: 22,
//                 background: "rgba(255,255,255,0.05)",
//                 border: "1px solid rgba(255,255,255,0.11)",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 margin: "0 auto 26px",
//                 boxShadow: "0 0 35px rgba(0,210,190,0.22), 0 0 70px rgba(0,210,190,0.08)",
//                 overflow: "hidden",
//                 opacity: mounted ? 1 : 0,
//                 transition: "opacity 0.7s 0.25s",
//                 animation: "glowPulse 4s ease-in-out 1s infinite",
//               }}>
//                 <img src="/SMILE.jpg" alt="SMILE" style={{ width: 50, height: 50, objectFit: "contain" }} />
//               </div>

//               {/* Staggered letters */}
//               <div style={{ lineHeight: 1, marginBottom: 4, letterSpacing: "0.22em" }}>
//                 {"SMILE".split("").map((ch, i) => (
//                   <span key={i} style={{
//                     display: "inline-block",
//                     fontFamily: "'Playfair Display', serif",
//                     fontSize: 46, fontWeight: 700, color: "#fff",
//                     textShadow: "0 0 50px rgba(0,210,190,0.45)",
//                     animation: `letterIn 0.75s cubic-bezier(0.22,1,0.36,1) ${0.3 + i * 0.09}s both`,
//                   }}>{ch}</span>
//                 ))}
//               </div>

//               <p style={{
//                 fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 400,
//                 textTransform: "uppercase", color: "rgba(150,175,215,0.5)",
//                 animation: "subtitleIn 1s cubic-bezier(0.22,1,0.36,1) 0.95s both",
//               }}>
//                 Gestion dentaire sécurisée
//               </p>

//               {/* Decorative divider */}
//               <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px auto 0", width: 160, animation: "fieldIn 0.6s ease 1s both" }}>
//                 <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,210,190,0.35))", transformOrigin: "right", animation: "lineReveal 0.9s ease 1s both" }} />
//                 <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(0,210,190,0.7)", boxShadow: "0 0 10px rgba(0,210,190,0.9)" }} />
//                 <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(80,120,255,0.35),transparent)", transformOrigin: "left", animation: "lineReveal 0.9s ease 1s both" }} />
//               </div>
//             </div>

//             {/* ── ERROR ── */}
//             {error && (
//               <div style={{
//                 background: "rgba(255,55,75,0.08)", border: "1px solid rgba(255,55,75,0.2)",
//                 borderRadius: 12, padding: "11px 15px", marginBottom: 20,
//                 fontFamily: "'Outfit', sans-serif", fontSize: 13,
//                 color: "rgba(255,145,155,0.95)",
//               }}>{error}</div>
//             )}

//             {/* ── FORM ── */}
//             <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//               <AnimatedField
//                 id="email" label="Adresse email" type="email"
//                 value={email} onChange={setEmail} placeholder="exemple@clinic.com"
//                 autoComplete="email" focused={focused === "email"}
//                 onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
//                 animDelay="1.1s"
//               />

//               <AnimatedField
//                 id="password" label="Mot de passe"
//                 type={showPassword ? "text" : "password"}
//                 value={password} onChange={setPassword} placeholder="••••••••••"
//                 autoComplete="current-password" focused={focused === "password"}
//                 onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
//                 animDelay="1.22s"
//                 suffix={
//                   <button type="button" onClick={() => setShowPassword(p => !p)}
//                     style={{
//                       position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
//                       background: "none", border: "none", cursor: "none",
//                       color: "rgba(100,130,180,0.65)", display: "flex",
//                       alignItems: "center", transition: "color 0.2s", padding: 4,
//                     }}>
//                     <EyeIcon open={showPassword} />
//                   </button>
//                 }
//               />

//               {/* ── CTA Button ── */}
//               <button
//                 type="button" onClick={handleSubmit} disabled={loading}
//                 style={{
//                   marginTop: 4, width: "100%", padding: "14px 16px",
//                   border: "none", borderRadius: 14, cursor: loading ? "not-allowed" : "none",
//                   fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
//                   color: "#fff", letterSpacing: "0.04em", position: "relative", overflow: "hidden",
//                   background: "linear-gradient(135deg,#00b8a9 0%,#3d5eee 50%,#9030d0 100%)",
//                   boxShadow: "0 4px 30px rgba(0,180,170,0.32), 0 0 0 1px rgba(255,255,255,0.08) inset",
//                   opacity: loading ? 0.6 : 1,
//                   transition: "transform 0.22s, box-shadow 0.3s, opacity 0.3s",
//                   animation: "fieldIn 0.65s cubic-bezier(0.22,1,0.36,1) 1.34s both",
//                 }}
//                 onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px) scale(1.01)"; e.currentTarget.style.boxShadow = "0 10px 44px rgba(0,180,170,0.48), 0 0 0 1px rgba(255,255,255,0.13) inset"; }}}
//                 onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 30px rgba(0,180,170,0.32), 0 0 0 1px rgba(255,255,255,0.08) inset"; }}
//                 onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "scale(0.984)"; }}
//                 onMouseUp={e => { if (!loading) e.currentTarget.style.transform = "translateY(-2px) scale(1.01)"; }}
//               >
//                 {/* shimmer sweep */}
//                 <span style={{
//                   position: "absolute", top: 0, left: "-120%", width: "60%", height: "100%",
//                   background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)",
//                   transform: "skewX(-20deg)",
//                   animation: loading ? "none" : "shimmerBtn 3s ease-in-out 2s infinite",
//                 }} />
//                 {loading ? (
//                   <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.78s linear infinite" }}>
//                       <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
//                     </svg>
//                     Vérification en cours…
//                   </span>
//                 ) : "Se connecter →"}
//               </button>
//             </div>

//             {/* Footer */}
//             <p style={{
//               marginTop: 30, textAlign: "center",
//               fontFamily: "'Outfit', sans-serif", fontSize: 11,
//               color: "rgba(70,95,140,0.45)", letterSpacing: "0.06em",
//               animation: "fieldIn 0.6s ease 1.5s both",
//             }}>
//               © 2026 SMILE · Accès réservé aux professionnels
//             </p>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

///////////THEME N*2////////////////
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthContext } from "../hooks/AuthContext";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ─────────────────────────────────────────────
   BACKGROUND CANVAS — bulles O₂ + gradient médical
───────────────────────────────────────────── */
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

    /* Soft gradient blobs — couleurs clinique */
    const blobs = [
      { x: 0.12, y: 0.18, vx:  0.00018, vy:  0.00012, r: 0.55, cr: [0,188,212],   a: 0.12, phase: 0   },
      { x: 0.80, y: 0.12, vx: -0.00014, vy:  0.00016, r: 0.45, cr: [38,198,218],  a: 0.10, phase: 2.5 },
      { x: 0.65, y: 0.80, vx:  0.00012, vy: -0.00015, r: 0.40, cr: [178,235,242], a: 0.13, phase: 4.8 },
      { x: 0.08, y: 0.72, vx:  0.00016, vy:  0.00010, r: 0.38, cr: [224,247,250], a: 0.18, phase: 1.2 },
      { x: 0.90, y: 0.55, vx: -0.00013, vy: -0.00012, r: 0.35, cr: [0,150,136],   a: 0.08, phase: 3.6 },
    ];

    /* Bulles O₂ */
    const bubbles = Array.from({ length: 38 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight + window.innerHeight,
      r: Math.random() * 18 + 5,
      speed: Math.random() * 0.35 + 0.15,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.012 + 0.005,
      alpha: Math.random() * 0.18 + 0.06,
    }));

    /* Molécule nodes */
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

      /* Fond blanc nacré */
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

      /* Molécule connections */
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

      /* Bulles O₂ montantes */
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

      /* Vignette légère sur les bords */
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

/* ─────────────────────────────────────────────
   CROIX MÉDICALE SVG ANIMÉE (décor fond)
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   ICÔNES DENTAIRES FLOTTANTES (dent, stéthoscope…)
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   PULSE RINGS MÉDICAUX
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   HEARTBEAT LINE (décoratif bas de page)
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   CUSTOM CURSOR médical
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   ANIMATED FIELD
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

/* ─────────────────────────────────────────────
   EYE ICON
───────────────────────────────────────────── */
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
   MAIN — LOGIN PAGE
───────────────────────────────────────────── */
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

  // Restaurer l'email mémorisé
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
      setError("Connexion impossible. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  /* Icônes champs */
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
      {/* ── Global CSS ── */}
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

      {/* ── Curseur ── */}
      <CustomCursor mouseRef={mouseRef} />

      {/* ── Layers de fond ── */}
      <MedicalCanvas mouseRef={mouseRef} />
      <MedicalCrosses />
      <DentalIcons />
      <PulseRings />
      <HeartbeatLine />

      {/* ── Layout ── */}
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
          {/* Halo médical derrière la carte */}
          <div style={{
            position:"absolute", inset:-4, borderRadius:34,
            background:"linear-gradient(135deg,rgba(0,188,212,0.3),rgba(0,150,136,0.2),rgba(38,198,218,0.25))",
            filter:"blur(24px)",
            animation:"glowBreath 3.5s ease-in-out infinite",
            zIndex:-1,
          }}/>

          {/* Surface de la carte — blanc clinique */}
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

            {/* ── EN-TÊTE ── */}
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
                {/* Croix médicale mini */}
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
                Gestion dentaire sécurisée
              </p>

              {/* Séparateur ornemental */}
              <div style={{ display:"flex", alignItems:"center", gap:8, margin:"18px auto 0", width:140, animation:"fieldIn 0.6s ease 1s both" }}>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(0,172,193,0.3))", transformOrigin:"right", animation:"lineReveal 0.9s ease 1s both" }}/>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(0,172,193,0.5)">
                  <rect x="9" y="2" width="6" height="20" rx="2"/>
                  <rect x="2" y="9" width="20" height="6" rx="2"/>
                </svg>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(0,150,136,0.3),transparent)", transformOrigin:"left", animation:"lineReveal 0.9s ease 1s both" }}/>
              </div>
            </div>

            {/* ── ERREUR ── */}
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

            {/* ── FORMULAIRE ── */}
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
                value={password} onChange={setPassword} placeholder="••••••••••"
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

              {/* ── Se souvenir de moi + Aide ── */}
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
                // { icon:"🔒", label:"Chiffré SSL" },
                // { icon:"⚕️", label:"Norme HDS" },
                // { icon:"✓",  label:"RGPD" },
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
              © 2026 SMILE  · Accès réservé aux personnels
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
