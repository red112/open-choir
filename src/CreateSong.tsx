import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate, useParams } from 'react-router-dom'; // useParams 추가

export default function CreateSong() {
  const navigate = useNavigate();
  const { songId } = useParams(); // URL에서 songId (수정 모드일 때만 존재)
  const isEditMode = Boolean(songId); // 수정 모드인지 확인하는 플래그

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false); // 데이터 불러오는 중

  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [difficulty, setDifficulty] = useState('1');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [voicePart, setVoicePart] = useState('');
  
  const VOICE_PARTS = ['남성', '여성', '소프라노', '메조', '알토', '테너', '바리톤', '베이스'];

  // 1. 초기화 및 수정 모드일 때 데이터 불러오기
  useEffect(() => {
    // 로그인 체크
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/');
      }
    });

    // 수정 모드라면 기존 데이터 Fetch
    if (isEditMode && songId) {
      fetchSongData();
    }
  }, [songId]);

  async function fetchSongData() {
    setDataLoading(true);
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('song_id', songId)
      .single();

    if (error || !data) {
      alert('노래 정보를 불러올 수 없습니다.');
      navigate('/');
    } else {
      // 받아온 데이터로 Form 채우기
      setTitle(data.title);
      setLyrics(data.lyrics_content);
      setDifficulty(String(data.difficulty));
      setYoutubeUrl(data.youtube_url || '');
      setVoicePart(data.voice_part || '');
    }
    setDataLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !lyrics) {
      alert('제목과 가사는 필수입니다!');
      return;
    }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('사용자 정보를 찾을 수 없습니다.');

      const songData = {
        title: title,
        lyrics_content: lyrics,
        difficulty: parseInt(difficulty),
        youtube_url: youtubeUrl,
        voice_part: voicePart,
        // created_by는 수정 시에는 업데이트하지 않음 (보안)
        ...(isEditMode ? {} : { created_by: user.id, play_count: 0 }) 
      };

      let error;

      if (isEditMode) {
        // [수정 모드] Update 실행
        const result = await supabase
          .from('songs')
          .update(songData)
          .eq('song_id', songId);
        error = result.error;
      } else {
        // [등록 모드] Insert 실행
        const result = await supabase
          .from('songs')
          .insert([songData]);
        error = result.error;
      }

      if (error) throw error;

      alert(isEditMode ? '수정되었습니다!' : '노래가 등록되었습니다! 🎶');
      navigate('/');

    } catch (error: any) {
      console.error('Error:', error);
      alert('작업 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <div className="p-10 text-center">데이터 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditMode ? '노래 수정하기 ✏️' : '새 노래 등록하기 🎤'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">노래 제목</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="제목을 입력하세요" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL (선택)</label>
            <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://youtu.be/..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">난이도 (1: 쉬움 ~ 5: 어려움)</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
              {[1, 2, 3, 4, 5].map(num => (<option key={num} value={num}>Level {num}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">성부 (선택)</label>
            <select value={voicePart} onChange={(e) => setVoicePart(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">선택 안 함 (전체/공통)</option>
              {VOICE_PARTS.map((part) => (<option key={part} value={part}>{part}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">가사 입력 <span className="text-xs text-gray-400">(!로 시작하면 빈칸 제외)</span></label>
            <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-64 resize-none" placeholder="가사를 입력하세요..."></textarea>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-4 text-white font-bold rounded-lg text-lg shadow-md transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {loading ? '저장 중...' : (isEditMode ? '수정 완료' : '등록 완료')}
          </button>

          <button type="button" onClick={() => navigate('/')} className="w-full py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">취소</button>
        </form>
      </div>
    </div>
  );
}