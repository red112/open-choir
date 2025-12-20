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

  // 노래 목록 불러오기
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

  // 로그인 처리
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // [추가] 공유하기 기능 함수
  const handleShare = async (e: React.MouseEvent, songId: string, title: string) => {
    e.stopPropagation(); // 카드 클릭(게임 이동) 이벤트 방지
    
    const shareUrl = `${window.location.origin}/game/${songId}`;
    const shareData = {
      title: 'Choir Memory Game',
      text: `🎵 [${title}] 가사 암기 게임에 도전해보세요!`,
      url: shareUrl,
    };

    try {
      // 모바일 공유하기 지원 시
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // PC 등 미지원 시 클립보드 복사
        await navigator.clipboard.writeText(shareUrl);
        alert('주소가 복사되었습니다! 원하는 곳에 붙여넣기 하세요.');
      }
    } catch (err) {
      console.error('공유 실패:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* 상단 헤더 */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-8 py-4 border-b">
        <h1 className="text-2xl font-bold text-indigo-600">Choir Memory 🎶</h1>
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm hidden sm:inline">{user.user_metadata.full_name}님</span>
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">로그아웃</button>
            </div>
          ) : (
            <button onClick={handleLogin} className="text-sm bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600">
              구글 로그인
            </button>
          )}
        </div>
      </header>

      {/* 메인 액션 버튼 */}
      <div className="w-full max-w-2xl mb-6">
        {user ? (
          <button 
            onClick={() => navigate('/create')}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl shadow-lg font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <span>➕ 새 노래 등록하기</span>
          </button>
        ) : (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-center text-sm">
            로그인하면 노래를 등록하고 기록을 저장할 수 있습니다.
          </div>
        )}
      </div>

      {/* 노래 목록 */}
      <div className="w-full max-w-2xl space-y-3">
        {songs.length === 0 ? (
          <div className="text-center text-gray-400 py-10">등록된 노래가 없습니다.</div>
        ) : (
          songs.map((song) => (
            <div 
              key={song.song_id} 
              onClick={() => navigate(`/game/${song.song_id}`)} 
              className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer border border-transparent hover:border-indigo-200 active:bg-gray-50"
            >
              {/* 상단 영역: 제목, 성부배지, 공유버튼 */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 flex-wrap">
                    {song.title}
                    {/* 성부 정보가 있으면 배지로 표시 */}
                    {song.voice_part && (
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {song.voice_part}
                      </span>
                    )}
                  </h3>
                </div>

                {/* 공유하기 버튼 (아이콘) */}
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

              {/* 하단 영역: 난이도, 가사 미리보기 */}
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
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