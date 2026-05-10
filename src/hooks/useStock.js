// import { useState, useEffect, useCallback } from 'react'
// import { supabase } from '../lib/supabase'
// import { useNotifications } from './NotificationsContext'

// export function useStock() {
//   const [stock,   setStock]   = useState([])
//   const [loading, setLoading] = useState(true)
//   const { notify } = useNotifications()

//   const fetchStock = useCallback(async () => {
//     setLoading(true)
//     try {
//       const { data, error } = await supabase.from('stock').select('*').order('nom_produit')
//       if (error) {
//         console.error('Erreur fetch stock:', error)
//         notify({ type: 'error', message: 'Erreur lors du chargement du stock' })
//       }
//       setStock(data ?? [])
//     } catch (err) {
//       console.error('Erreur inattendue:', err)
//       notify({ type: 'error', message: 'Erreur inattendue lors du chargement' })
//     } finally {
//       setLoading(false)
//     }
//   }, [notify])

//   // Fetch initial
//   useEffect(() => {
//     fetchStock()
//   }, [fetchStock])

//   // Subscription en temps réel
//   useEffect(() => {
//     const channel = supabase
//       .channel('stock-changes')
//       .on('postgres_changes', 
//         { event: '*', schema: 'public', table: 'stock' },
//         () => {
//           // Re-fetch quand un changement est détecté
//           fetchStock()
//         }
//       )
//       .subscribe()

//     return () => {
//       supabase.removeChannel(channel)
//     }
//   }, [fetchStock])

//   const ajouterArticle = async (a) => {
//     const { error } = await supabase.from('stock').insert(a)
//     if (error) {
//       notify({ type:'error', message:`Article non ajoute : ${error.message}` })
//       throw error
//     }
//     notify({ type:'stock', message:`Article ajoute au stock : ${a.nom_produit}` })
//     await fetchStock()
//   }

//   const modifierArticle = async (id, a) => {
//     const { error } = await supabase.from('stock').update(a).eq('id', id)
//     if (error) {
//       notify({ type:'error', message:`Article non modifie : ${error.message}` })
//       throw error
//     }
//     notify({ type:'stock', message:`Article modifie : ${a.nom_produit}` })
//     await fetchStock()
//   }

//   const supprimerArticle = async (id) => {
//     const article = stock.find(a => a.id === id)
//     const { error } = await supabase.from('stock').delete().eq('id', id)
//     if (error) {
//       notify({ type:'error', message:`Article non supprime : ${error.message}` })
//       throw error
//     }
//     notify({ type:'stock', message:`Article supprime${article?.nom_produit ? ` : ${article.nom_produit}` : ''}` })
//     await fetchStock()
//   }

//   return { stock, loading, ajouterArticle, modifierArticle, supprimerArticle }
// }



import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './NotificationsContext'

export function useStock() {
  const [stock,     setStock]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [commandes, setCommandes] = useState([])
  const [loadingCommandes, setLoadingCommandes] = useState(false)
  const { notify } = useNotifications()

  // ─── STOCK ──────────────────────────────────────────────────────────────────

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

  useEffect(() => { fetchStock() }, [fetchStock])

  // Subscription temps réel sur stock
  useEffect(() => {
    const channel = supabase
      .channel('stock-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock' }, () => fetchStock())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchStock])

  const ajouterArticle = async (a) => {
    const { error } = await supabase.from('stock').insert(a)
    if (error) {
      notify({ type: 'error', message: `Article non ajouté : ${error.message}` })
      throw error
    }
    notify({ type: 'stock', message: `Article ajouté au stock : ${a.nom_produit}` })
    await fetchStock()
  }

  const modifierArticle = async (id, a) => {
    const { error } = await supabase.from('stock').update(a).eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Article non modifié : ${error.message}` })
      throw error
    }
    notify({ type: 'stock', message: `Article modifié : ${a.nom_produit}` })
    await fetchStock()
  }

  const supprimerArticle = async (id) => {
    const article = stock.find(a => a.id === id)
    const { error } = await supabase.from('stock').delete().eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Article non supprimé : ${error.message}` })
      throw error
    }
    notify({ type: 'stock', message: `Article supprimé${article?.nom_produit ? ` : ${article.nom_produit}` : ''}` })
    await fetchStock()
  }

  // ─── COMMANDES ──────────────────────────────────────────────────────────────

  const fetchCommandes = useCallback(async () => {
    setLoadingCommandes(true)
    try {
      const { data, error } = await supabase
        .from('commandes')
        .select(`
          *,
          commande_lignes (*)
        `)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Erreur fetch commandes:', error)
        notify({ type: 'error', message: 'Erreur lors du chargement des commandes' })
      }
      setCommandes(data ?? [])
    } catch (err) {
      console.error('Erreur inattendue commandes:', err)
    } finally {
      setLoadingCommandes(false)
    }
  }, [notify])

  useEffect(() => { fetchCommandes() }, [fetchCommandes])

  // Subscription temps réel sur commandes
  useEffect(() => {
    const channel = supabase
      .channel('commandes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commandes' }, () => fetchCommandes())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commande_lignes' }, () => fetchCommandes())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchCommandes])

  /**
   * Valider une commande :
   * 1. Créer la ligne dans `commandes`
   * 2. Insérer toutes les lignes dans `commande_lignes`
   * @param {Array} lignes - [{ articleId, nom_produit, quantite, seuil, qteACommander }]
   */
  const validerCommande = async (lignes) => {
    if (!lignes || lignes.length === 0) return

    // 1. Créer la commande
    const { data: commande, error: errCommande } = await supabase
      .from('commandes')
      .insert({ statut: 'en_attente' })
      .select()
      .single()

    if (errCommande) {
      notify({ type: 'error', message: `Erreur création commande : ${errCommande.message}` })
      throw errCommande
    }

    // 2. Insérer les lignes
    const lignesInsert = lignes.map(l => ({
      commande_id:       commande.id,
      stock_id:          l.articleId,
      nom_produit:       l.nom_produit,
      quantite_actuelle: l.quantite,
      seuil:             l.seuil,
      qte_commandee:     l.qteACommander,
    }))

    const { error: errLignes } = await supabase.from('commande_lignes').insert(lignesInsert)
    if (errLignes) {
      notify({ type: 'error', message: `Erreur enregistrement lignes : ${errLignes.message}` })
      throw errLignes
    }

    notify({ type: 'stock', message: `Commande enregistrée (${lignes.length} article${lignes.length > 1 ? 's' : ''})` })
    await fetchCommandes()
    return commande
  }

  /**
   * Marquer une commande comme reçue + mettre à jour les quantités en stock
   * @param {string} commandeId
   * @param {Array}  lignes  - lignes de la commande (depuis commandes state)
   */
  const marquerRecu = async (commandeId, lignes) => {
    // 1. Mettre à jour chaque article en stock (quantite += qte_commandee)
    for (const ligne of lignes) {
      const articleActuel = stock.find(a => a.id === ligne.stock_id)
      if (!articleActuel) continue

      const nouvelleQte = articleActuel.quantite + ligne.qte_commandee
      const { error } = await supabase
        .from('stock')
        .update({ quantite: nouvelleQte })
        .eq('id', ligne.stock_id)

      if (error) {
        notify({ type: 'error', message: `Erreur mise à jour ${ligne.nom_produit} : ${error.message}` })
        throw error
      }
    }

    // 2. Marquer la commande comme reçue
    const { error: errStatut } = await supabase
      .from('commandes')
      .update({ statut: 'recue', recu_le: new Date().toISOString() })
      .eq('id', commandeId)

    if (errStatut) {
      notify({ type: 'error', message: `Erreur mise à jour statut : ${errStatut.message}` })
      throw errStatut
    }

    notify({ type: 'stock', message: 'Commande marquée comme reçue · Stock mis à jour' })
    await Promise.all([fetchStock(), fetchCommandes()])
  }

  return {
    // Stock
    stock, loading,
    ajouterArticle, modifierArticle, supprimerArticle,
    // Commandes
    commandes, loadingCommandes,
    validerCommande, marquerRecu,
  }
}
