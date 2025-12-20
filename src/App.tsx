import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState<User | null>(null);

  // 1. 페이지 로드 시 로그인 상태 확인
  useEffect(() => {
    // 현재 로그인된 사용자 정보 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 로그인/로그아웃 상태가 변하면 자동으로 감지하는 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 구글 로그인 함수
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 로컬호스트로 다시 돌아오게 설정 (배포시엔 배포 주소로 변경 필요 - Step 4 참고)
        redirectTo: window.location.origin
      }
    });
  };

  // 3. 로그아웃 함수
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Choir Memory 🎶</h1>

        {user ? (
          // 로그인 성공 시 보여줄 화면
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto overflow-hidden">
              {/* 구글 프로필 사진 표시 */}
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700">
              환영합니다, <br/>
              <span className="text-indigo-600">{user.user_metadata.full_name}</span>님!
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
            >
              로그아웃
            </button>
          </div>
        ) : (
          // 로그인 안 했을 때 보여줄 화면
          <div>
            <p className="text-gray-500 mb-6">서비스를 이용하려면 로그인이 필요합니다.</p>
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded transition shadow-sm"
            >
              {/* 구글 G 로고 SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google 계정으로 로그인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;