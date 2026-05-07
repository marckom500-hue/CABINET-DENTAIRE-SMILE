import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './NotificationsContext'

export function useStock() {
  const [stock,   setStock]   = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotifications()

  const fetchStock = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('stock').select('*').order('nom_produit')
      if (error) {
        console.error('Erreur fetch stock:', error)
        notify({ type: 'error', message: 'Erreur lors du chargement du stock' })
      }
      setStock(data ?? [])
    } catch (err) {
      console.error('Erreur inattendue:', err)
      notify({ type: 'error', message: 'Erreur inattendue lors du chargement' })
    } finally {
      setLoading(false)
    }
  }, [notify])

  // Fetch initial
  useEffect(() => {
    fetchStock()
  }, [fetchStock])

  // Subscription en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('stock-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock' },
        () => {
          // Re-fetch quand un changement est détecté
          fetchStock()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchStock])

  const ajouterArticle = async (a) => {
    const { error } = await supabase.from('stock').insert(a)
    if (error) {
      notify({ type:'error', message:`Article non ajoute : ${error.message}` })
      throw error
    }
    notify({ type:'stock', message:`Article ajoute au stock : ${a.nom_produit}` })
    await fetchStock()
  }

  const modifierArticle = async (id, a) => {
    const { error } = await supabase.from('stock').update(a).eq('id', id)
    if (error) {
      notify({ type:'error', message:`Article non modifie : ${error.message}` })
      throw error
    }
    notify({ type:'stock', message:`Article modifie : ${a.nom_produit}` })
    await fetchStock()
  }

  const supprimerArticle = async (id) => {
    const article = stock.find(a => a.id === id)
    const { error } = await supabase.from('stock').delete().eq('id', id)
    if (error) {
      notify({ type:'error', message:`Article non supprime : ${error.message}` })
      throw error
    }
    notify({ type:'stock', message:`Article supprime${article?.nom_produit ? ` : ${article.nom_produit}` : ''}` })
    await fetchStock()
  }

  return { stock, loading, ajouterArticle, modifierArticle, supprimerArticle }
}
