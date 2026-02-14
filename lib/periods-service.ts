import { supabase } from "@/lib/supabase/client"

export interface Period {
  id: string
  name: string
}

export async function fetchPeriods(): Promise<Period[]> {
  const { data, error } = await supabase
    .from("periods")
    .select("*")
    .order("name")

  if (error) throw error
  return data ?? []
}
