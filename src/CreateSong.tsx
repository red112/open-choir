import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function CreateSong() {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const [loading, setLoading] = useState(false);

  // 입력값을 저장할 상태 변수들
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [difficulty, setDifficulty] = useState('1'); // 기본값 1
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // ... 기존 state들 아래에 추가
  const [voicePart, setVoicePart] = useState(''); // 성부 선택값 (기본 공백)
  // 선택 가능한 성부 목록 정의
  const VOICE_PARTS = ['남성', '여성', '소프라노', '메조', '알토', '테너', '바리톤', '베이스'];

  // 로그인 체크 (로그인 안 한 사람이 URL로 몰래 들어오는 것 방지)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/'); // 홈으로 쫓아내기
      }
    });
  }, [navigate]);

  // 저장 버튼 눌렀을 때 실행되는 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 화면 새로고침 방지
    
    if (!title || !lyrics) {
      alert('제목과 가사는 필수입니다!');
      return;
    }

    setLoading(true);

    try {
      // 1. 현재 로그인한 사용자 ID 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('사용자 정보를 찾을 수 없습니다.');

      // 2. DB에 데이터 저장 (Insert)
      const { error } = await supabase.from('songs').insert([
        {
          title: title,
          lyrics_content: lyrics,
          difficulty: parseInt(difficulty),
          youtube_url: youtubeUrl,
          created_by: user.id, // 등록자 ID 저장
          play_count: 0,
          voice_part: voicePart // <--- 여기 추가! (선택 안 하면 '' 빈 문자열이 들어감)
        }
      ]);

      if (error) throw error;

      alert('노래가 성공적으로 등록되었습니다! 🎶');
      navigate('/'); // 홈 화면으로 이동

    } catch (error: any) {
      console.error('Error:', error);
      alert('등록 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">새 노래 등록하기 🎤</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 제목 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">노래 제목</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="제목을 입력하세요"
            />
          </div>

          {/* 유튜브 URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL (선택)</label>
            <input 
              type="text" 
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="https://youtu.be/..."
            />
          </div>

          {/* 난이도 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">난이도 (1: 쉬움 ~ 5: 어려움)</label>
            <select 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>Level {num}</option>
              ))}
            </select>
          </div>

        {/* 성부 선택 (Dropdown) */}
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">성부 (선택)</label>
        <select 
            value={voicePart}
            onChange={(e) => setVoicePart(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
            <option value="">선택 안 함 (전체/공통)</option>
            {VOICE_PARTS.map((part) => (
            <option key={part} value={part}>{part}</option>
            ))}
        </select>
        </div>

          {/* 가사 입력 (가장 중요) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              가사 입력 <span className="text-xs text-gray-400">(문제로 안 낼 단어 앞엔 ! 붙이기)</span>
            </label>
            <textarea 
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-64 resize-none"
              placeholder="가사를 입력하세요..."
            ></textarea>
          </div>

          {/* 저장 버튼 */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 text-white font-bold rounded-lg text-lg shadow-md transition
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? '저장 중...' : '등록 완료'}
          </button>

          {/* 취소 버튼 */}
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
          >
            취소
          </button>
        </form>
      </div>
    </div>
  );
}