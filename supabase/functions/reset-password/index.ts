// import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
// }

// const jsonResponse = (body: Record<string, unknown>, status = 200) =>
//   new Response(JSON.stringify(body), {
//     status,
//     headers: { ...corsHeaders, "Content-Type": "application/json" },
//   })

// serve(async (req) => {
//   if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })
//   if (req.method !== "POST") return jsonResponse({ error: "Méthode non autorisée" }, 405)

//   try {
//     const supabaseUrl      = Deno.env.get("SUPABASE_URL")
//     const serviceRoleKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

//     if (!supabaseUrl || !serviceRoleKey) {
//       return jsonResponse({ error: "Secrets manquants", supabaseUrl: !!supabaseUrl, serviceRoleKey: !!serviceRoleKey }, 500)
//     }

//     const body = await req.json()
//     const { user_id, email } = body

//     if (!user_id || !email) return jsonResponse({ error: "user_id et email sont requis" }, 400)

//     const response = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "apikey": serviceRoleKey,
//         "Authorization": `Bearer ${serviceRoleKey}`,
//       },
//       body: JSON.stringify({ type: "recovery", email }),
//     })

//     const data = await response.json()

//     // ← Retourne le détail complet pour déboguer
//     if (!response.ok) {
//       return jsonResponse({
//         error: "Erreur API Supabase",
//         status: response.status,
//         detail: data,                  // ← contenu brut de la réponse
//       }, 500)
//     }

//     // const actionLink =
//     //   data?.properties?.action_link ??
//     //   data?.properties?.recovery_link ??
//     //   data?.recovery_link
      
//     const actionLink =
//   data?.action_link ??
//   data?.properties?.action_link ??
//   data?.properties?.recovery_link ??
//   data?.recovery_link

//     if (!actionLink) {
//       return jsonResponse({ error: "Lien absent dans la réponse", data }, 400)
//     }

//     return jsonResponse({ success: true, recovery_link: actionLink })

//   } catch (error: any) {
//     return jsonResponse({ error: error.message ?? "Erreur serveur" }, 500)
//   }
// })

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })
  if (req.method !== "POST") return jsonResponse({ error: "Méthode non autorisée" }, 405)

  try {
    const supabaseUrl    = Deno.env.get("SUPABASE_URL")
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Secrets Supabase manquants" }, 500)
    }

    const { user_id, email } = await req.json()
    if (!user_id || !email) return jsonResponse({ error: "user_id et email sont requis" }, 400)

    // Mot de passe temporaire généré aléatoirement
    const tempPassword = `Tmp${Math.random().toString(36).slice(2, 8).toUpperCase()}!`

    // Mise à jour du mot de passe via l'API Admin Supabase
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ password: tempPassword }),
    })

    const data = await response.json()

    if (!response.ok) {
      return jsonResponse({ error: "Erreur API Supabase", detail: data }, 500)
    }

    return jsonResponse({
      success: true,
      temp_password: tempPassword,
      message: `Mot de passe réinitialisé pour ${email}`,
    })

  } catch (error: any) {
    return jsonResponse({ error: error.message ?? "Erreur serveur" }, 500)
  }
})