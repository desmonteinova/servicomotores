import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey && supabaseUrl.includes("supabase.co"))
}

export const testSupabaseConnection = async () => {
  if (!supabase) {
    return false
  }

  try {
    const { data, error } = await supabase.from("lotes").select("count", { count: "exact", head: true })

    if (error) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

export const getEnvironmentInfo = () => {
  return {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    url: supabaseUrl || "Não configurada",
    keyPreview: supabaseKey ? supabaseKey.substring(0, 20) + "..." : "Não configurada",
    isConfigured: isSupabaseConfigured(),
  }
}
