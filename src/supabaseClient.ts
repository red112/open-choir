import { createClient } from '@supabase/supabase-js';

// .env 파일에서 키를 가져옵니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL과 Key가 설정되지 않았습니다. .env 파일을 확인하세요.");
}

// 클라이언트를 생성하여 앱 어디서든 쓸 수 있게 내보냅니다.
export const supabase = createClient(supabaseUrl, supabaseKey);