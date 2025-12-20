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
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부 체크

  useEffect(() => {
    fetchSongs();
    if (user) checkUserRole(user.id);
  }, [user]);

  // 관리자 여부 확인 함수
  async function checkUserRole(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (data && data.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  const handleShare = async (e: React.MouseEvent, songId: string, title: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/game/${songId}`;
    const shareData = {
      title: 'Sing By Heart Game',
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

  // [추가] 삭제 기능 함수
  const handleDelete = async (e: React.MouseEvent, songId: string) => {
    e.stopPropagation(); // 카드 클릭 방지
    
    if (!window.confirm('정말로 이 노래를 삭제하시겠습니까? (복구 불가)')) return;

    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('song_id', songId);

      if (error) throw error;

      alert('삭제되었습니다.');
      fetchSongs(); // 목록 새로고침
    } catch (err: any) {
      alert('삭제 실패: 권한이 없거나 오류가 발생했습니다.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      
      {/* 헤더 영역 */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-6 py-4 border-b bg-white px-4 rounded-xl shadow-sm mt-2">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
           Sing By Heart 🎶
        </h1>
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-400">
                  {isAdmin ? '👑 관리자' : '환영합니다!'}
                </p>
                <p className="text-sm font-bold text-gray-700">{user.user_metadata.full_name}님</p>
              </div>
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
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-center text-sm border border-blue-100">
            👋 로그인하면 새로운 노래를 등록할 수 있습니다.<br/>
            (미등록 사용자도 아래 게임은 할 수 있어요!)
          </div>
        )}
      </div>

      {/* 노래 목록 */}
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
              className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer border border-transparent hover:border-indigo-200 active:bg-gray-50 relative group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-8"> {/* 우측 아이콘 공간 확보 */}
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 flex-wrap">
                    {song.title}
                    {song.voice_part && (
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {song.voice_part}
                      </span>
                    )}
                  </h3>
                </div>

                {/* 버튼 그룹 (공유하기 + 삭제하기) */}
                <div className="flex gap-1 absolute top-4 right-4">
                  {/* 공유하기 버튼 */}
                  <button
                    onClick={(e) => handleShare(e, song.song_id, song.title)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                    title="공유하기"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-1.964 2.25 2.25 0 0 0-3.933 1.964Z" />
                    </svg>
                  </button>

                  {/* [추가] 삭제 버튼 (작성자 본인 OR 관리자에게만 보임) */}
                  {user && (user.id === song.created_by || isAdmin) && (
                    <button
                      onClick={(e) => handleDelete(e, song.song_id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                      title="삭제하기"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>
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