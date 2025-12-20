import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import CreateSong from './CreateSong';
import Game from './Game';

// 1. 홈 화면 컴포넌트
function Home({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<any[]>([]);

  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs() {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error) setSongs(data || []);
  }

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  // [수정] 로그아웃 로직 강화
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // 브라우저를 강제로 새로고침하여 상태를 확실하게 초기화
    window.location.reload(); 
  };

  const handleShare = async (e: React.MouseEvent, songId: string, title: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/game/${songId}`;
    const shareData = {
      title: 'Choir Memory Game',
      text: `🎵 [${title}] 가사 암기 게임에 도전해보세요!`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('주소가 복사되었습니다!');
      }
    } catch (err) {
      console.error('공유 실패:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      
      {/* --- [수정] 헤더 영역 (환영 메시지를 여기로 통합) --- */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-6 py-4 border-b bg-white px-4 rounded-xl shadow-sm mt-2">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
           Choir Memory 🎶
        </h1>
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-400">환영합니다!</p>
                <p className="text-sm font-bold text-gray-700">{user.user_metadata.full_name}님</p>
              </div>
              {/* 모바일에서는 이름 대신 로그아웃 버튼만 보이거나 간단하게 처리 */}
              <button 
                onClick={handleLogout} 
                className="text-xs bg-gray-200 text-gray-600 px-3 py-2 rounded hover:bg-gray-300 font-bold transition"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin} 
              className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-bold shadow transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
              구글 로그인
            </button>
          )}
        </div>
      </header>

      {/* 메인 액션 버튼 (로그인 시에만 보임) */}
      <div className="w-full max-w-2xl mb-6">
        {user ? (
          <button 
            onClick={() => navigate('/create')}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl shadow-lg font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <span>➕ 새 노래 등록하기</span>
          </button>
        ) : (
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-center text-sm border border-blue-100">
            👋 로그인하면 새로운 노래를 등록할 수 있습니다.<br/>
            (미등록 사용자도 아래 게임은 할 수 있어요!)
          </div>
        )}
      </div>

      {/* 노래 목록 (로그인 여부와 상관없이 항상 보임) */}
      <div className="w-full max-w-2xl space-y-3 pb-10">
        <h2 className="text-gray-500 text-sm font-medium ml-1 mb-2">등록된 곡 목록</h2>
        {songs.length === 0 ? (
          <div className="text-center text-gray-400 py-10 bg-white rounded-xl border border-dashed">
            아직 등록된 노래가 없습니다.
          </div>
        ) : (
          songs.map((song) => (
            <div 
              key={song.song_id} 
              onClick={() => navigate(`/game/${song.song_id}`)} 
              className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer border border-transparent hover:border-indigo-200 active:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 flex-wrap">
                    {song.title}
                    {song.voice_part && (
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {song.voice_part}
                      </span>
                    )}
                  </h3>
                </div>

                <button
                  onClick={(e) => handleShare(e, song.song_id, song.title)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition -mt-2 -mr-2"
                  title="공유하기"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-1.964 2.25 2.25 0 0 0-3.933 1.964Z" />
                  </svg>
                </button>
              </div>

              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>난이도: Lv.{song.difficulty}</span>
                <span className="truncate max-w-[150px]">
                   {song.lyrics_content.slice(0, 15)}...
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 2. 전체 앱 라우터 설정
export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 로그인 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/create" element={<CreateSong />} />
        <Route path="/game/:songId" element={<Game />} /> 
      </Routes>
    </BrowserRouter>
  );
}