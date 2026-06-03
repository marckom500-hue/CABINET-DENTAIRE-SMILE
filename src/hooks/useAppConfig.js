import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAppConfig(key, defaultValue = null) {
  const [value, setValue] = useState(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error: err } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', key)
          .single()

        if (err) throw err
        setValue(data?.value || defaultValue)
      } catch (e) {
        setError(e.message)
        setValue(defaultValue)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`config:${key}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'app_config',
        filter: `key=eq.${key}`
      }, (payload) => {
        setValue(payload.new.value)
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [key, defaultValue])

  const updateConfig = async (newValue) => {
    try {
      const { error: err } = await supabase
        .from('app_config')
        .update({ value: newValue.toString() })
        .eq('key', key)

      if (err) throw err
      setValue(newValue)
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }

  return { value, loading, error, updateConfig }
}
