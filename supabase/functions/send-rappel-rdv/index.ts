import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const jsonResponse = (body: Record<string, unknown>, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function normalizeCameroonPhone(value: string): string {
  const digits = value.replace(/[^\d+]/g, "")

  if (digits.startsWith("+237")) return digits.slice(1)
  if (digits.startsWith("00237")) return digits.slice(2)
  if (digits.startsWith("237")) return digits
  if (digits.startsWith("0")) return `237${digits.slice(1)}`

  return `237${digits}`
}

function buildMessage(template: string, rdv: any, patient: any): string {
  return template
    .replaceAll("{prenom}", patient.prenom || "")
    .replaceAll("{nom}", patient.nom || "")
    .replaceAll("{date}", rdv.date || "")
    .replaceAll("{heure}", rdv.heure || "")
    .replaceAll("{type_acte}", rdv.type_acte || "")
}

function summarizeGatewayError(status: number | null, response: string, url: string | null): string {
  if (status === 502 && response.includes("ngrok")) {
    return `Ngrok n'arrive pas a joindre le serveur SMS local (${url}). Verifiez que le serveur tourne encore sur le port 8080 et que le tunnel ngrok est actif.`
  }

  if (response.trim().startsWith("<!DOCTYPE html") || response.trim().startsWith("<html")) {
    return `Reponse HTML inattendue du fournisseur SMS${status ? ` HTTP ${status}` : ""}. Verifiez l'URL et le serveur SMS.`
  }

  return response || "Aucune reponse du fournisseur SMS"
}

async function sendGatewaySms(phone: string, message: string) {
  const gatewayUrl = Deno.env.get("SMS_GATEWAY_URL")
  const gatewayPath = Deno.env.get("SMS_GATEWAY_PATH")
  const username = Deno.env.get("SMS_USERNAME")
  const password = Deno.env.get("SMS_PASSWORD")

  if (!gatewayUrl || !username || !password) {
    return {
      success: false,
      status: null,
      url: null,
      response: "Configuration SMS incomplete: SMS_GATEWAY_URL, SMS_USERNAME ou SMS_PASSWORD manquant",
    }
  }

  if (Deno.env.get("SMS_SIMULATION") === "true") {
    console.log(`[SIMULATION SMS] -> ${phone}: ${message}`)
    return {
      success: true,
      status: 200,
      url: "simulation",
      response: "Simulation: SMS non envoye reellement",
    }
  }

  const auth = btoa(`${username}:${password}`)
  const baseUrl = gatewayUrl.replace(/\/+$/, "")
  const gatewayOrigin = (() => {
    try {
      return new URL(baseUrl).origin
    } catch {
      return baseUrl
    }
  })()
  const customUrl = gatewayPath
    ? `${baseUrl}/${gatewayPath.replace(/^\/+/, "")}`
    : null
  const formats = [
    ...(customUrl ? [{ url: customUrl, body: { textMessage: { text: message }, phoneNumbers: [phone] } }] : []),
    { url: baseUrl, body: { textMessage: { text: message }, phoneNumbers: [phone] } },
    { url: `${baseUrl}/3rdparty/v1/messages`, body: { textMessage: { text: message }, phoneNumbers: [phone] } },
    { url: `${baseUrl}/3rdparty/v1/message`, body: { textMessage: { text: message }, phoneNumbers: [phone] } },
    { url: `${baseUrl}/message`, body: { message, phoneNumbers: [phone] } },
    { url: `${baseUrl}/messages`, body: { message, phoneNumbers: [phone] } },
    { url: `${baseUrl}/send`, body: { text: message, numbers: [phone] } },
    { url: `${baseUrl}/api/message`, body: { message, phoneNumbers: [phone] } },
    { url: `${baseUrl}/api/messages`, body: { message, phoneNumbers: [phone] } },
    { url: `${gatewayOrigin}/3rdparty/v1/messages`, body: { textMessage: { text: message }, phoneNumbers: [phone] } },
    { url: `${gatewayOrigin}/3rdparty/v1/message`, body: { textMessage: { text: message }, phoneNumbers: [phone] } },
    { url: `${gatewayOrigin}/message`, body: { message, phoneNumbers: [phone] } },
    { url: `${gatewayOrigin}/messages`, body: { message, phoneNumbers: [phone] } },
    { url: `${gatewayOrigin}/send`, body: { text: message, numbers: [phone] } },
    { url: `${gatewayOrigin}/api/message`, body: { message, phoneNumbers: [phone] } },
    { url: `${gatewayOrigin}/api/messages`, body: { message, phoneNumbers: [phone] } },
  ]
  const uniqueFormats = formats.filter((format, index) => {
    return formats.findIndex((item) => item.url === format.url) === index
  })

  let lastStatus: number | null = null
  let lastUrl: string | null = null
  let lastResponse = "Aucune reponse du fournisseur SMS"
  const attempts: string[] = []

  for (const format of uniqueFormats) {
    try {
      lastUrl = format.url
      attempts.push(format.url)
      const response = await fetch(format.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(format.body),
      })

      lastStatus = response.status
      lastResponse = await response.text()

      if (response.ok) {
        return {
          success: true,
          status: response.status,
          url: format.url,
          response: lastResponse,
        }
      }

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          status: response.status,
          url: format.url,
          response: `Authentification refusee par le fournisseur SMS sur ${format.url}. Verifiez SMS_USERNAME et SMS_PASSWORD.${lastResponse ? ` Reponse: ${summarizeGatewayError(response.status, lastResponse, format.url)}` : ""}`,
        }
      }
    } catch (error) {
      lastResponse = error instanceof Error ? error.message : String(error)
    }
  }

  return {
    success: false,
    status: lastStatus,
    url: lastUrl,
    response: lastResponse
      ? summarizeGatewayError(lastStatus, lastResponse, lastUrl)
      : `Endpoint SMS introuvable. URLs testees: ${attempts.join(", ")}`,
  }
}

async function sendAfricasTalkingSms(phone: string, message: string) {
  const apiKey = Deno.env.get("SMS_API_KEY")
  const username = Deno.env.get("SMS_USERNAME") ?? "sandbox"
  const sender = Deno.env.get("SMS_SENDER_ID") ?? "SMILE"

  if (!apiKey) {
    return {
      success: false,
      status: null,
      url: null,
      response: "Configuration SMS incomplete: SMS_GATEWAY_URL ou SMS_API_KEY manquant",
    }
  }

  const body = new URLSearchParams({
    username,
    to: phone.startsWith("+") ? phone : `+${phone}`,
    message,
    from: sender,
  })

  try {
    const response = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    })

    const responseText = await response.text()

    return {
      success: response.ok,
      status: response.status,
      url: "https://api.africastalking.com/version1/messaging",
      response: responseText,
    }
  } catch (error) {
    return {
      success: false,
      status: null,
      url: "https://api.africastalking.com/version1/messaging",
      response: error instanceof Error ? error.message : String(error),
    }
  }
}

async function sendSms(phone: string, message: string) {
  if (Deno.env.get("SMS_SIMULATION") === "true") {
    console.log(`[SIMULATION SMS] -> ${phone}: ${message}`)
    return {
      success: true,
      status: 200,
      url: "simulation",
      response: "Simulation: SMS non envoye reellement",
    }
  }

  if (Deno.env.get("SMS_GATEWAY_URL")) {
    return sendGatewaySms(phone, message)
  }

  return sendAfricasTalkingSms(phone, message)
}

async function sendSmsWithRetry(phone: string, message: string, maxRetries = 3): Promise<any> {
  const maxAttempts = maxRetries + 1
  let lastError: any = null

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await sendSms(phone, message)
      if (result.success) {
        return { ...result, attempts: attempt + 1 }
      }
      lastError = result

      // Retry seulement pour les erreurs temporaires (502, 503, 504, timeout)
      const isTemporaryError = result.status === 502 || result.status === 503 || result.status === 504 || result.response?.includes("timeout")
      if (!isTemporaryError || attempt === maxAttempts - 1) {
        return { ...result, attempts: attempt + 1 }
      }

      // Backoff exponentiel: 2s, 4s, 8s
      const delayMs = Math.pow(2, attempt + 1) * 1000
      console.log(`[SMS RETRY] Tentative ${attempt + 1}/${maxAttempts - 1}, attente ${delayMs}ms...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts - 1) {
        const delayMs = Math.pow(2, attempt + 1) * 1000
        console.log(`[SMS RETRY] Erreur: ${error}, attente ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }

  return lastError
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Methode non autorisee" }, 405)
  }

  try {
    const { rdv_id, mode } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    const { data: config } = await supabase
      .from("rappels_config")
      .select("*")
      .limit(1)
      .single()

    const template = config?.message_template || "Bonjour {prenom}, rappel de votre RDV le {date} a {heure}."

    async function sendForRdv(rdv: any) {
      const patient = rdv.patients

      if (!patient?.telephone) {
        return {
          success: false,
          statut: "echec",
          rdv_id: rdv.id,
          error: "Numero de telephone manquant",
        }
      }

      const message = buildMessage(template, rdv, patient)
      const phone = normalizeCameroonPhone(patient.telephone.toString())
      const smsResult = await sendSmsWithRetry(phone, message, 3)
      const statut = smsResult.success ? "envoye" : "echec_permanent"
      const smsError = smsResult.success
        ? null
        : `Echec fournisseur SMS${smsResult.status ? ` HTTP ${smsResult.status}` : ""}: ${smsResult.response}`

      await supabase.from("rappels_sms").insert({
        rdv_id: rdv.id,
        statut,
        message,
        erreur: smsError ? smsError.substring(0, 500) : null,
        tentatives: smsResult.attempts || 1,
      })

      return {
        success: smsResult.success,
        statut,
        rdv_id: rdv.id,
        message,
        phone,
        error: smsError,
        sms_error: smsError,
        gateway_status: smsResult.status,
        gateway_response: smsResult.response,
        gateway_url: smsResult.url,
        attempts: smsResult.attempts,
      }
    }

    if (mode === "auto") {
      if (config?.actif === false || config?.envoi_auto === false) {
        return jsonResponse({ success: true, sent: 0, skipped: true, message: "Rappels automatiques desactives" })
      }

      const delaiHeures = config?.delai_heures ?? 24
      const targetDate = new Date(Date.now() + delaiHeures * 60 * 60 * 1000)
      const targetDateStr = targetDate.toISOString().split("T")[0]

      const { data: rdvs, error } = await supabase
        .from("rendez_vous")
        .select("*, patients(nom, prenom, telephone)")
        .eq("date", targetDateStr)
        .not("statut", "eq", "annule")

      if (error) {
        return jsonResponse({ success: false, error: error.message }, 400)
      }

      const results = []

      for (const rdv of rdvs ?? []) {
        const { data: existing } = await supabase
          .from("rappels_sms")
          .select("id")
          .eq("rdv_id", rdv.id)
          .eq("statut", "envoye")
          .limit(1)
          .maybeSingle()

        if (existing) {
          results.push({ success: true, skipped: true, rdv_id: rdv.id, message: "Rappel deja envoye" })
          continue
        }

        results.push(await sendForRdv(rdv))
      }

      return jsonResponse({
        success: true,
        sent: results.filter((result) => result.success && !result.skipped).length,
        total: rdvs?.length ?? 0,
        date: targetDateStr,
        results,
      })
    }

    if (!rdv_id) {
      return jsonResponse({ success: false, error: "rdv_id est requis" }, 400)
    }

    const { data: rdv, error: rdvError } = await supabase
      .from("rendez_vous")
      .select("*, patients(nom, prenom, telephone)")
      .eq("id", rdv_id)
      .single()

    if (rdvError || !rdv) {
      return jsonResponse({ success: false, error: "RDV non trouve" }, 404)
    }

    const patient = rdv.patients
    if (!patient?.telephone) {
      return jsonResponse({ success: false, error: "Numero de telephone manquant" }, 400)
    }

    const message = buildMessage(template, rdv, patient)
    const phone = normalizeCameroonPhone(patient.telephone.toString())
    const smsResult = await sendSmsWithRetry(phone, message, 3)
    const statut = smsResult.success ? "envoye" : "echec_permanent"
    const smsError = smsResult.success
      ? null
      : `Echec fournisseur SMS${smsResult.status ? ` HTTP ${smsResult.status}` : ""}: ${smsResult.response}`

    await supabase.from("rappels_sms").insert({
      rdv_id,
      statut,
      message,
      erreur: smsError ? smsError.substring(0, 500) : null,
      tentatives: smsResult.attempts || 1,
    })

    return jsonResponse({
      success: smsResult.success,
      statut,
      message,
      phone,
      error: smsError,
      sms_error: smsError,
      gateway_status: smsResult.status,
      gateway_response: smsResult.response,
      gateway_url: smsResult.url,
      attempts: smsResult.attempts,
    })
  } catch (error: any) {
    console.error("Erreur send-rappel-rdv:", error)
    return jsonResponse({ success: false, error: error.message }, 500)
  }
})
