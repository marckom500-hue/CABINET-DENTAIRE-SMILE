import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useStock() {
  const [stock,   setStock]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase.from('stock').select('*').order('nom_produit')
    setStock(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const ajouterArticle   = async (a)     => { await supabase.from('stock').insert(a); fetch() }
  const modifierArticle  = async (id, a) => { await supabase.from('stock').update(a).eq('id', id); fetch() }
  const supprimerArticle = async (id)    => { await supabase.from('stock').delete().eq('id', id); fetch() }

  return { stock, loading, ajouterArticle, modifierArticle, supprimerArticle }
}
