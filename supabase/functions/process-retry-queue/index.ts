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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Methode non autorisee" }, 405)
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    // Récupérer les rappels en attente de retry
    const { data: pendingRetries, error: queryError } = await supabase
      .rpc("get_pending_retries")

    if (queryError) {
      console.error("Erreur requête retry queue:", queryError)
      return jsonResponse({ success: false, error: queryError.message }, 400)
    }

    if (!pendingRetries || pendingRetries.length === 0) {
      return jsonResponse({
        success: true,
        processed: 0,
        message: "Aucun rappel en attente de renvoi",
      })
    }

    const results = []

    for (const retry of pendingRetries) {
      try {
        // Appeler la fonction send-rappel-rdv pour renvoyer le SMS
        const sendResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-rappel-rdv`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            },
            body: JSON.stringify({ rdv_id: retry.rdv_id }),
          }
        )

        const sendResult = await sendResponse.json()

        if (sendResult.success) {
          // Marquer comme succès
          await supabase.rpc("mark_sms_success", {
            p_rappel_sms_id: retry.rappel_sms_id,
          })

          results.push({
            retry_id: retry.id,
            status: "success",
            message: "SMS renvoyé avec succès",
          })
        } else {
          // Décrémenter les tentatives restantes
          const newAttempts = retry.tentatives_restantes - 1

          if (newAttempts > 0) {
            // Reprogrammer pour plus tard
            const nextRetry = new Date()
            nextRetry.setMinutes(nextRetry.getMinutes() + 10 * (4 - newAttempts)) // 10min, 20min, 30min

            await supabase
              .from("rappels_retry_queue")
              .update({
                tentatives_restantes: newAttempts,
                prochain_retry: nextRetry.toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", retry.id)

            results.push({
              retry_id: retry.id,
              status: "rescheduled",
              attempts_left: newAttempts,
              next_retry: nextRetry.toISOString(),
              error: sendResult.error,
            })
          } else {
            // Marquer comme échec permanent
            await supabase
              .from("rappels_sms")
              .update({ statut: "echec_permanent" })
              .eq("id", retry.rappel_sms_id)

            await supabase
              .from("rappels_retry_queue")
              .delete()
              .eq("id", retry.id)

            // Créer une notification pour l'admin
            await supabase
              .from("rappels_notifications")
              .insert({
                type: "sms_failed",
                rdv_id: retry.rdv_id,
                patient_id: retry.patient_id,
                message: `Échec définitif du rappel SMS pour ${retry.telephone}: ${sendResult.error}`,
              })

            results.push({
              retry_id: retry.id,
              status: "failed_permanent",
              message: "Échec permanent, notification créée",
            })
          }
        }
      } catch (error) {
        console.error(`Erreur traitement retry ${retry.id}:`, error)
        results.push({
          retry_id: retry.id,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return jsonResponse({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error: any) {
    console.error("Erreur process-retry-queue:", error)
    return jsonResponse({ success: false, error: error.message }, 500)
  }
})
