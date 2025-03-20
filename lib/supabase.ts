import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ccksuhajgovjpftoyfif.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNja3N1aGFqZ292anBmdG95ZmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDk1NDksImV4cCI6MjA1ODA4NTU0OX0.i_Z6rBuoIQO655Hg6MHe-9bJ_BVmtDAAYJ72-f7mLuA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
