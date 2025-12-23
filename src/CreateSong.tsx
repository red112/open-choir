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

  const VOICE_PARTS = ['남성', '여성', '소프라노', '메조', '알토', '테너', '바리톤', '베이스'];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/');
      }
    });

    if (isEditMode && songId) {
      fetchSongData();
    }
  }, [songId]);

  async function fetchSongData() {
    setDataLoading(true);
    // .single() 대신 .maybeSingle() 사용 (데이터 없어도 에러 안 남)
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('song_id', songId)
      .maybeSingle();

    if (error || !data) {
      console.error(error);
      alert('노래 정보를 불러올 수 없습니다.');
      navigate('/');
    } else {
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
        ...(isEditMode ? {} : { created_by: user.id, play_count: 0 }) 
      };

      let data;
      let error;

      if (isEditMode) {
        // [수정] .select()만 호출하고 결과 배열에서 꺼내는 방식으로 변경
        const res = await supabase
          .from('songs')
          .update(songData)
          .eq('song_id', songId)
          .select();
        
        data = res.data;
        error = res.error;
      } else {
        // [등록]
        const res = await supabase
          .from('songs')
          .insert([songData])
          .select();
          
        data = res.data;
        error = res.error;
      }

      if (error) throw error;
      
      // 배열이 비어있는지 확인 (RLS 문제 등)
      if (!data || data.length === 0) {
        throw new Error('저장은 되었으나 데이터를 반환받지 못했습니다. 목록에서 확인해주세요.');
      }

      const savedItem = data[0]; // 배열의 첫 번째 요소 사용

      setSavedSongId(savedItem.song_id);
      setSavedSongTitle(savedItem.title);
      setShowModal(true); 

    } catch (error: any) {
      console.error('Error:', error);
      alert('작업 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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

  if (dataLoading) return <div className="p-10 text-center">데이터 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center relative">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
              {[1, 2, 3, 4, 5].map(num => (<option key={num} value={num}>Level {num}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">성부</label>
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center animate-fade-in-up">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {isEditMode ? '수정이 완료되었습니다!' : '노래 등록 성공!'}
            </h3>
            <p className="text-gray-500 mb-6">이제 무엇을 하시겠습니까?</p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate(`/game/${savedSongId}`)}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 shadow"
              >
                🎮 바로 게임하기
              </button>
              
              <button 
                onClick={handleShare}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 shadow flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-1.964 2.25 2.25 0 0 0-3.933 1.964Z" />
                </svg>
                친구에게 공유하기
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200"
              >
                목록으로 이동
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}