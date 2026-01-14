import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import { AD_CONFIG } from './adConfig'; // [삭제] 사용 안 함
// import AdBanner from './components/AdBanner'; // [삭제] 사용 안 함
import KakaoAdFit from './components/KakaoAdFit';
import CreateSong from './CreateSong';
import ReadSong from './ReadSong';
import Game from './Game';
import Piano from './Piano';
import Terms from './Terms';
import Privacy from './Privacy';
import Guide from './Guide';
import About from './About';

// 1. 홈 화면 컴포넌트
function Home({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [songs, setSongs] = useState<any[]>([]);
  const [recentSongs, setRecentSongs] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'my' | 'piano'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSongs();
    if (user) {
      checkUserRole(user.id);
      fetchRecentSongs(user.id);
    } else {
      setRecentSongs([]);
    }
  }, [user]);

  async function checkUserRole(userId: string) {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data && data.role === 'admin') setIsAdmin(true);
  }

  async function fetchSongs() {
    const { data, error } = await supabase.from('songs').select('*, song_issues(count)').order('created_at', { ascending: false });
    if (!error) setSongs(data || []);
  }

  async function fetchRecentSongs(userId: string) {
    const { data: profileData, error: profileError } = await supabase.from('profiles').select('recent_songs').eq('id', userId).single();
    if (profileError || !profileData || !profileData.recent_songs) { setRecentSongs([]); return; }
    const songIds = profileData.recent_songs;
    const { data: songsData, error: songsError } = await supabase.from('songs').select('*, song_issues(count)').in('song_id', songIds);
    if (songsError || !songsData) return;
    const sortedSongs = songIds.map((id: string) => songsData.find((song) => song.song_id === id)).filter(Boolean);
    setRecentSongs(sortedSongs);
  }

  const getDisplaySongs = () => {
    let targetList: any[] = [];
    if (activeTab === 'recent') targetList = recentSongs;
    else if (activeTab === 'my') targetList = songs.filter(s => user && s.created_by === user.id);
    else targetList = songs;

    if (searchTerm.trim() !== '') {
      const lowerTerm = searchTerm.toLowerCase();
      targetList = targetList.filter(song => song.title.toLowerCase().includes(lowerTerm) || song.lyrics_content.toLowerCase().includes(lowerTerm));
    }
    if (activeTab === 'recent') return targetList;
    return [...targetList].sort((a, b) => { return sortOrder === 'asc' ? a.title.localeCompare(b.title, 'ko') : b.title.localeCompare(a.title, 'ko'); });
  };

  const handleLogin = async () => { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); };
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.reload(); };

  const handleShare = async (e: React.MouseEvent, songId: string, title: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/read/${songId}`;
    const shareData = { title: t('app.title'), text: `🎵 [${title}] ${t('game.share_msg', { title: '', score: '' })}`, url: shareUrl };
    try { if (navigator.share) await navigator.share(shareData); else { await navigator.clipboard.writeText(shareUrl); alert(t('game.copy_complete')); } } catch (err) { console.error(err); }
  };

  const handleDelete = async (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    if (!window.confirm(t('song.delete_confirm'))) return;
    try { const { error } = await supabase.from('songs').delete().eq('song_id', songId); if (error) throw error; alert(t('song.deleted')); fetchSongs(); } catch (err) { alert(t('song.delete_fail')); }
  };

  const handleOpenYoutube = (e: React.MouseEvent, url: string) => { e.stopPropagation(); window.open(url, '_blank', 'noopener,noreferrer'); };
  const handleEdit = (e: React.MouseEvent, songId: string) => { e.stopPropagation(); navigate(`/edit/${songId}`); };
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'ko' ? 'en' : 'ko');

  const displayList = getDisplaySongs();

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col items-center overflow-hidden">

      {activeTab !== 'piano' && (
        <div className="w-full flex flex-col items-center px-4 pt-4 shrink-0">
          <header className="w-full max-w-2xl flex justify-between items-center mb-2 py-4 px-2 border-b bg-white rounded-xl shadow-sm">
            <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
              {t('app.title')} 🎶
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={toggleLang} className="text-xs font-bold px-2 py-1 border rounded bg-white hover:bg-gray-50">{i18n.language === 'ko' ? 'EN' : 'KO'}</button>
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 hidden sm:inline text-right leading-tight">
                    {isAdmin ? `👑 ${t('app.admin')}` : t('app.welcome')}<br />
                    <b>{user.user_metadata.full_name}</b>
                  </span>
                  <button onClick={handleLogout} className="text-xs bg-gray-200 text-gray-600 px-3 py-2 rounded hover:bg-gray-300 font-bold transition">{t('app.logout')}</button>
                </div>
              ) : (
                <button onClick={handleLogin} className="text-sm bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 font-bold shadow transition">{t('app.login')}</button>
              )}
            </div>
          </header>

          <nav className="w-full max-w-2xl flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => navigate('/about')} className="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 font-medium hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm">{t('app.nav_about')}</button>
            <button onClick={() => navigate('/guide')} className="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 font-medium hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm">{t('app.nav_guide')}</button>
          </nav>

          <div className="w-full max-w-2xl bg-white p-4 rounded-xl shadow-sm mb-4 border border-indigo-100">
            <h2 className="text-sm font-bold text-indigo-800 mb-1">Sing by Heart에 오신 것을 환영합니다! 👋</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              합창단, 성가대를 위한 <b>가사 암기 트레이닝 서비스</b>입니다.<br />
              아래 목록에서 연습할 곡을 선택하여 가사를 학습하고, 빈칸 채우기 게임을 통해 암기력을 테스트해 보세요.<br />
              (로그인하시면 나만의 연습 기록을 관리할 수 있습니다.)
            </p>
          </div>

          <div className="w-full max-w-2xl mb-4">
            {user ? (
              <button onClick={() => navigate('/create')} className="w-full bg-indigo-600 text-white py-4 rounded-xl shadow-lg font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"><span>➕ {t('app.new_song')}</span></button>
            ) : (
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-center text-sm border border-blue-100">👋 {t('app.login_guide')}</div>
            )}
          </div>
        </div>
      )}

      <div className={`w-full max-w-2xl flex border-b border-gray-300 mb-2 shrink-0 ${activeTab === 'piano' ? 'px-0 mt-2' : 'px-4'}`}>
        <button onClick={() => setActiveTab('all')} className={`flex-1 py-3 text-center font-bold text-sm transition ${activeTab === 'all' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>{t('app.tab_all')} ({songs.length})</button>
        <button onClick={() => setActiveTab('recent')} className={`flex-1 py-3 text-center font-bold text-sm transition ${activeTab === 'recent' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>{t('app.tab_recent')} ({user ? recentSongs.length : 0})</button>
        <button onClick={() => setActiveTab('my')} className={`flex-1 py-3 text-center font-bold text-sm transition ${activeTab === 'my' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>{t('app.tab_my')}</button>
        <button onClick={() => setActiveTab('piano')} className={`flex-1 py-3 text-center font-bold text-sm transition ${activeTab === 'piano' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>🎹 {t('app.tab_piano')}</button>
      </div>

      <div className={`flex-1 min-h-0 relative ${activeTab === 'piano' ? 'w-full' : 'w-full max-w-2xl px-4'}`}>

        {activeTab === 'piano' ? (
          <div className="w-full h-full pb-0 bg-black">
            <Piano />
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto pb-4 scrollbar-hide">
            <div className="w-full flex gap-2 mb-4">
              <div className="flex-1 relative">
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('app.search_placeholder')} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              </div>
              {activeTab !== 'recent' && (
                <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 px-3 py-2 rounded border border-gray-200 bg-white whitespace-nowrap">{sortOrder === 'asc' ? t('app.sort_asc') : t('app.sort_desc')}</button>
              )}
            </div>

            <div className="space-y-3 pb-10">
              {(activeTab === 'recent' || activeTab === 'my') && !user && <div className="text-center py-10 bg-white rounded-xl border border-dashed"><p className="text-gray-500 mb-2">{t('app.login_required')}</p><button onClick={handleLogin} className="text-sm text-indigo-600 font-bold hover:underline">{t('app.go_login')}</button></div>}
              {user && displayList.length === 0 && <div className="text-center text-gray-400 py-10 bg-white rounded-xl border border-dashed">{t('app.empty_list')}</div>}

              {/* [수정] index 파라미터 삭제 (사용 안 함) */}
              {displayList.map((song) => {
                const hasIssues = song.song_issues && song.song_issues[0] && song.song_issues[0].count > 0;
                return (
                  <div key={song.song_id}>
                    <div onClick={() => navigate(`/read/${song.song_id}`)} className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer border border-transparent hover:border-indigo-200 active:bg-gray-50 relative group">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-32">
                          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 flex-wrap">
                            {song.title}
                            {song.voice_part && <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">{song.voice_part}</span>}
                          </h3>
                        </div>
                        <div className="flex gap-1 absolute top-4 right-4">
                          {song.youtube_url && (
                            <button onClick={(e) => handleOpenYoutube(e, song.youtube_url)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full" title={t('song.youtube')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg></button>
                          )}
                          <button onClick={(e) => handleShare(e, song.song_id, song.title)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full" title={t('song.share')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-1.964 2.25 2.25 0 0 0-3.933 1.964Z" /></svg></button>
                          {user && (user.id === song.created_by || isAdmin) && (
                            <>
                              <button onClick={(e) => handleEdit(e, song.song_id)} className={`p-2 rounded-full ${hasIssues ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`} title={hasIssues ? t('song.edit_req') : t('song.edit')}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                              </button>
                              <button onClick={(e) => handleDelete(e, song.song_id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full" title={t('song.delete')}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mt-2"><span>{t('song.level')}{song.difficulty}</span><span className="truncate max-w-[150px]">{song.lyrics_content.slice(0, 15)}...</span></div>
                    </div>
                    {/* [NEW] 목록 맨 하단 광고 */}
                    <div className="mt-4 mb-20 flex justify-center">
                      {/* 본인의 하단 광고 단위 ID(320x50)를 넣으세요 */}
                      <KakaoAdFit unit="DAN-K8l4lZeykkMpLEtE" width="320" height="50" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/create" element={<CreateSong />} />
        <Route path="/edit/:songId" element={<CreateSong />} />
        <Route path="/read/:songId" element={<ReadSong />} />
        <Route path="/game/:songId" element={<Game />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}