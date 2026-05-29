import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const PHONE_REGEX = /^6\d{8}$/

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { email, password, nom, prenom, telephone, role, specialite } = await req.json()

    if (!PHONE_REGEX.test(telephone || '')) {
      return new Response(
        JSON.stringify({ error: 'Numéro invalide : 9 chiffres requis, doit commencer par 6' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // 1. Créer l'utilisateur dans auth.users (API Admin = PAS DE LIMITE)
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nom, prenom, telephone, role, specialite }
    })

    if (createError) throw createError

    // 2. Créer le profil
    const { error: profileError } = await supabase
      .from('users_profiles')
      .insert({
        id: newUser.user.id,
        email,
        nom,
        prenom,
        telephone,
        role,
        actif: true,
        specialite: specialite || null
      })

    if (profileError) throw profileError

    return new Response(
      JSON.stringify({ success: true, userId: newUser.user.id }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})
