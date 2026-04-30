// supabase/functions/send-rappel-rdv/index.ts
// Edge Function Supabase — Envoi de rappels SMS
// Déploiement : supabase functions deploy send-rappel-rdv

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

// Remplace le template avec les vraies données du RDV
function buildMessage(template: string, rdv: any, patient: any): string {
  const date = new Date(rdv.date).toLocaleDateString("fr-FR", {
    weekday: "long", day: "2-digit", month: "long"
  })
  return template
    .replace("{prenom}",   patient.prenom ?? "")
    .replace("{nom}",      patient.nom ?? "")
    .replace("{date}",     date)
    .replace("{heure}",    rdv.heure ?? "")
    .replace("{type_acte}",rdv.type_acte ?? "")
}

// Envoi SMS via Africa's Talking (opérateur Cameroun)
// Remplace cette fonction par Twilio ou Orange SMS selon ton fournisseur
async function sendSMS(telephone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const apiKey   = Deno.env.get("SMS_API_KEY")
  const username = Deno.env.get("SMS_USERNAME") ?? "sandbox"
  const sender   = Deno.env.get("SMS_SENDER_ID") ?? "SMILE"

  if (!apiKey) {
    // Mode simulation (pas de clé API configurée)
    console.log(`[SIMULATION SMS] → ${telephone}: ${message}`)
    return { success: true }
  }

  // Africa's Talking API
  const body = new URLSearchParams({
    username,
    to: telephone,
    message,
    from: sender,
  })

  const response = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      "apiKey": apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    return { success: false, error: text }
  }

  return { success: true }
}

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { rdv_id, mode } = await req.json()

    // Charge la config des rappels
    const { data: config } = await supabase
      .from("rappels_config")
      .select("*")
      .limit(1)
      .single()

    const template = config?.message_template ??
      "Bonjour {prenom}, rappel RDV au Cabinet Dr. Boutchouang le {date} à {heure} ({type_acte})."

    // Mode automatique : envoie les rappels pour tous les RDV de demain
    if (mode === "auto") {
      const demain = new Date()
      demain.setDate(demain.getDate() + 1)
      const demainStr = demain.toISOString().split("T")[0]

      const { data: rdvsDemain } = await supabase
        .from("rendez_vous")
        .select("*, patients(nom, prenom, telephone)")
        .eq("date", demainStr)
        .not("statut", "eq", "annule")

      if (!rdvsDemain?.length) {
        return new Response(JSON.stringify({ sent: 0, message: "Aucun RDV demain" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
      }

      let sent = 0
      const results = []

      for (const rdv of rdvsDemain) {
        const patient = rdv.patients
        if (!patient?.telephone) continue

        const message = buildMessage(template, rdv, patient)
        const result  = await sendSMS(patient.telephone, message)

        // Enregistre dans l'historique
        await supabase.from("rappels_sms").insert({
          rdv_id:  rdv.id,
          statut:  result.success ? "envoye" : "echec",
          message,
          erreur:  result.error ?? null,
        })

        if (result.success) sent++
        results.push({ rdv_id: rdv.id, ...result })
      }

      return new Response(JSON.stringify({ sent, total: rdvsDemain.length, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // Mode manuel : envoie pour un RDV spécifique
    if (!rdv_id) throw new Error("rdv_id requis")

    const { data: rdv, error: rdvErr } = await supabase
      .from("rendez_vous")
      .select("*, patients(nom, prenom, telephone)")
      .eq("id", rdv_id)
      .single()

    if (rdvErr || !rdv) throw new Error("RDV introuvable")

    const patient = rdv.patients
    if (!patient?.telephone) throw new Error("Téléphone patient manquant")

    const message = buildMessage(template, rdv, patient)
    const result  = await sendSMS(patient.telephone, message)

    await supabase.from("rappels_sms").insert({
      rdv_id,
      statut: result.success ? "envoye" : "echec",
      message,
      erreur: result.error ?? null,
    })

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
