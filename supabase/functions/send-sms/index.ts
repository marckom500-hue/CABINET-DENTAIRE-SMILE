import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SMS_GATEWAY_URL = Deno.env.get("SMS_GATEWAY_URL")!
const USERNAME = Deno.env.get("SMS_USERNAME")!
const PASSWORD = Deno.env.get("SMS_PASSWORD")!

serve(async (req) => {
  try {
    const { phoneNumber, message, patientId, appointmentId } = await req.json()

    if (!phoneNumber || !message) {
      return new Response(
        JSON.stringify({ error: "phoneNumber et message sont obligatoires" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const auth = btoa(`${USERNAME}:${PASSWORD}`)

    const smsResponse = await fetch(`${SMS_GATEWAY_URL}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
      },
      body: JSON.stringify({
        textMessage: { text: message },
        phoneNumbers: [phoneNumber]
      }),
    })

    const result = await smsResponse.text()

    // Enregistrement du log
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    await supabase.from("sms_logs").insert({
      patient_id: patientId,
      appointment_id: appointmentId,
      phone_number: phoneNumber,
      message: message,
      status: smsResponse.ok ? "sent" : "failed",
      gateway_response: result
    })

    return new Response(
      JSON.stringify({ success: true, result: result }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})