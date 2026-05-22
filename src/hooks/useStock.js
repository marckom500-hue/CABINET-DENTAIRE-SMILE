import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './NotificationsContext'

export function useStock() {
  const [stock,     setStock]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [commandes, setCommandes] = useState([])
  const [loadingCommandes, setLoadingCommandes] = useState(false)
  const { notify } = useNotifications()

  // â”€â”€â”€ STOCK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // Subscription temps rÃ©el sur stock
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
      notify({ type: 'error', message: `Article non ajoutÃ© : ${error.message}` })
      throw error
    }
    notify({ type: 'stock', message: `Article ajoutÃ© au stock : ${a.nom_produit}` })
    await fetchStock()
  }

  const modifierArticle = async (id, a) => {
    const { error } = await supabase.from('stock').update(a).eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Article non modifiÃ© : ${error.message}` })
      throw error
    }
    notify({ type: 'stock', message: `Article modifiÃ© : ${a.nom_produit}` })
    await fetchStock()
  }

  const supprimerArticle = async (id) => {
    const article = stock.find(a => a.id === id)
    const { error } = await supabase.from('stock').delete().eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Article non supprimÃ© : ${error.message}` })
      throw error
    }
    notify({ type: 'stock', message: `Article supprimÃ©${article?.nom_produit ? ` : ${article.nom_produit}` : ''}` })
    await fetchStock()
  }

  // â”€â”€â”€ COMMANDES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // Subscription temps rÃ©el sur commandes
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
   * 1. CrÃ©er la ligne dans `commandes`
   * 2. InsÃ©rer toutes les lignes dans `commande_lignes`
   * @param {Array} lignes - [{ articleId, nom_produit, quantite, seuil, qteACommander }]
   */
  const validerCommande = async (lignes) => {
    if (!lignes || lignes.length === 0) return

    // 1. CrÃ©er la commande
    const { data: commande, error: errCommande } = await supabase
      .from('commandes')
      .insert({ statut: 'en_attente' })
      .select()
      .single()

    if (errCommande) {
      notify({ type: 'error', message: `Erreur crÃ©ation commande : ${errCommande.message}` })
      throw errCommande
    }

    // 2. InsÃ©rer les lignes
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

    notify({ type: 'stock', message: `Commande enregistrÃ©e (${lignes.length} article${lignes.length > 1 ? 's' : ''})` })
    await fetchCommandes()
    return commande
  }

  /**
   * Marquer une commande comme reÃ§ue + mettre Ã  jour les quantitÃ©s en stock
   * @param {string} commandeId
   * @param {Array}  lignes  - lignes de la commande (depuis commandes state)
   */
  const marquerRecu = async (commandeId, lignes) => {
    // 1. Mettre Ã  jour chaque article en stock (quantite += qte_commandee)
    for (const ligne of lignes) {
      const articleActuel = stock.find(a => a.id === ligne.stock_id)
      if (!articleActuel) continue

      const nouvelleQte = articleActuel.quantite + ligne.qte_commandee
      const { error } = await supabase
        .from('stock')
        .update({ quantite: nouvelleQte })
        .eq('id', ligne.stock_id)

      if (error) {
        notify({ type: 'error', message: `Erreur mise Ã  jour ${ligne.nom_produit} : ${error.message}` })
        throw error
      }
    }

    // 2. Marquer la commande comme reÃ§ue
    const { error: errStatut } = await supabase
      .from('commandes')
      .update({ statut: 'recue', recu_le: new Date().toISOString() })
      .eq('id', commandeId)

    if (errStatut) {
      notify({ type: 'error', message: `Erreur mise Ã  jour statut : ${errStatut.message}` })
      throw errStatut
    }

    notify({ type: 'stock', message: 'Commande marquÃ©e comme reÃ§ue Â· Stock mis Ã  jour' })
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
