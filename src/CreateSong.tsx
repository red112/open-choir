import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

export default function CreateSong() {
  const navigate = useNavigate();
  const { songId } = useParams();
  const isEditMode = Boolean(songId);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [difficulty, setDifficulty] = useState('1');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [voicePart, setVoicePart] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [savedSongId, setSavedSongId] = useState('');
  const [savedSongTitle, setSavedSongTitle] = useState('');
  const [issues, setIssues] = useState<any[]>([]);

  const VOICE_PARTS = ['남성', '여성', '소프라노', '메조', '알토', '테너', '바리톤', '베이스'];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { alert('로그인이 필요한 서비스입니다.'); navigate('/'); }
    });
    if (isEditMode && songId) {
      fetchSongData();
      fetchIssues();
    }
  }, [songId]);

  async function fetchSongData() {
    setDataLoading(true);
    const { data, error } = await supabase.from('songs').select('*').eq('song_id', songId).maybeSingle();
    if (error || !data) { alert('정보 로드 실패'); navigate('/'); }
    else {
      setTitle(data.title); setLyrics(data.lyrics_content);
      setDifficulty(String(data.difficulty)); setYoutubeUrl(data.youtube_url || ''); setVoicePart(data.voice_part || '');
    }
    setDataLoading(false);
  }

  async function fetchIssues() {
    const { data } = await supabase.from('song_issues').select('*').eq('song_id', songId).order('created_at', { ascending: true });
    setIssues(data || []);
  }

  async function deleteIssue(issueId: string) {
    if(!confirm('처리 완료 하셨나요? 삭제합니다.')) return;
    const { error } = await supabase.from('song_issues').delete().eq('issue_id', issueId);
    if (!error) fetchIssues();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !lyrics) { alert('제목, 가사 필수'); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');
      const songData = { title, lyrics_content: lyrics, difficulty: parseInt(difficulty), youtube_url: youtubeUrl, voice_part: voicePart, ...(isEditMode ? {} : { created_by: user.id, play_count: 0 }) };
      
      let res;
      if (isEditMode) res = await supabase.from('songs').update(songData).eq('song_id', songId).select();
      else res = await supabase.from('songs').insert([songData]).select();

      if (res.error) throw res.error;
      const saved = res.data?.[0];
      if(saved) { setSavedSongId(saved.song_id); setSavedSongTitle(saved.title); setShowModal(true); }
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  // [사용됨] savedSongTitle 변수를 사용하여 공유 텍스트 완성
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/game/${savedSongId}`;
    const shareData = {
      title: 'Sing by Heart',
      text: `🎵 [${savedSongTitle}] 가사 암기 게임에 도전해보세요!`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('주소가 복사되었습니다! 카톡방에 붙여넣기 하세요.');
      }
    } catch (err) {
      console.error('공유 실패:', err);
    }
  };

  if (dataLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center relative">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md mb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? '노래 수정하기 ✏️' : '새 노래 등록하기 🎤'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">제목</label><input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-3 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">YouTube URL</label><input type="text" value={youtubeUrl} onChange={e=>setYoutubeUrl(e.target.value)} className="w-full p-3 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">난이도</label><select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="w-full p-3 border rounded-lg bg-white">{[1,2,3,4,5].map(n=><option key={n} value={n}>Level {n}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">성부</label><select value={voicePart} onChange={e=>setVoicePart(e.target.value)} className="w-full p-3 border rounded-lg bg-white"><option value="">선택 안 함</option>{VOICE_PARTS.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">가사</label><textarea value={lyrics} onChange={e=>setLyrics(e.target.value)} className="w-full p-3 border rounded-lg h-64" /></div>
          
          <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">{loading ? '저장 중...' : (isEditMode ? '수정 완료' : '등록 완료')}</button>
          <button type="button" onClick={() => navigate('/')} className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-lg">취소</button>
        </form>

        {/* 수정 요청 목록 */}
        {isEditMode && issues.length > 0 && (
          <div className="mt-10 border-t pt-6">
            <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">🚨 수정 요청 사항 ({issues.length})</h3>
            <div className="space-y-3">
              {issues.map((issue) => (
                <div key={issue.issue_id} className="bg-red-50 p-3 rounded border border-red-100 flex justify-between items-start">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap flex-1">{issue.issue_content}</p>
                  <button onClick={() => deleteIssue(issue.issue_id)} className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-100 ml-2">처리완료/삭제</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-bold mb-4">{isEditMode ? '수정 완료!' : '등록 성공!'}</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate(`/game/${savedSongId}`)} className="bg-indigo-600 text-white py-3 rounded-lg font-bold">바로 게임하기</button>
              <button onClick={handleShare} className="bg-green-500 text-white py-3 rounded-lg font-bold">공유하기</button>
              <button onClick={() => navigate('/')} className="bg-gray-100 text-gray-700 py-3 rounded-lg font-bold">목록으로</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}