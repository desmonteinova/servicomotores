"use client"

import { useEffect, useState } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export function useSupabaseSync() {
  const [isOnline, setIsOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      if (!isSupabaseConfigured()) {
        setIsOnline(false)
        setIsLoading(false)
        return
      }

      try {
        const { error } = await supabase!.from("lotes").select("count").limit(1)
        setIsOnline(!error)
      } catch {
        setIsOnline(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  return { isOnline, isLoading, isConfigured: isSupabaseConfigured() }
}
