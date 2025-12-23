import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// 단어 하나하나의 상태를 정의하는 타입
interface WordObj {
  original: string; // 원래 단어
  clean: string;    // 비교용 단어
  isBlank: boolean; // 빈칸 여부
  userInput: string;// 사용자 입력값
  isNewline?: boolean; // 줄바꿈 여부 체크
}

export default function Game() {
  const { songId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [songTitle, setSongTitle] = useState('');
  const [words, setWords] = useState<WordObj[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    fetchGameData();
    timerRef.current = window.setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [songId]);

  async function fetchGameData() {
    try {
      const { data: song, error } = await supabase
        .from('songs')
        .select('*')
        .eq('song_id', songId)
        .single();

      if (error || !song) throw new Error('노래를 불러올 수 없습니다.');

      setSongTitle(song.title);
      
      const lines = song.lyrics_content.split('\n');
      const tempAllWords: WordObj[] = [];

      lines.forEach((line: string, lineIndex: number) => {
        if (!line.trim()) {
          tempAllWords.push({ original: '', clean: '', isBlank: false, userInput: '', isNewline: true });
          return;
        }

        const lineWords = line.trim().split(/\s+/);
        
        lineWords.forEach((word) => {
          tempAllWords.push({
            original: word,
            clean: normalizeText(word),
            isBlank: false,
            userInput: '',
            isNewline: false
          });
        });

        if (lineIndex < lines.length - 1) {
          tempAllWords.push({ original: '', clean: '', isBlank: false, userInput: '', isNewline: true });
        }
      });

      const difficultyRatio = (song.difficulty * 8) / 100;
      
      const candidateIndices = tempAllWords
        .map((w, i) => (!w.isNewline && !w.original.startsWith('!')) ? i : -1)
        .filter(i => i !== -1);

      const targetBlankCount = Math.floor(candidateIndices.length * difficultyRatio);
      const shuffled = candidateIndices.sort(() => 0.5 - Math.random());
      const selectedIndices = new Set(shuffled.slice(0, targetBlankCount));

      const finalWords = tempAllWords.map((w, index) => {
        if (w.isNewline) return w;

        const isExempt = w.original.startsWith('!');
        const realWord = isExempt ? w.original.slice(1) : w.original;
        
        return {
          ...w,
          original: realWord,
          clean: normalizeText(realWord),
          isBlank: selectedIndices.has(index)
        };
      });

      setWords(finalWords);

    } catch (err) {
      alert('오류 발생');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  function normalizeText(text: string) {
    return text.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
  }

  const handleInputChange = (index: number, val: string) => {
    const newWords = [...words];
    newWords[index].userInput = val;
    setWords(newWords);
  };

  // [수정] _currentIndex 로 이름 변경하여 에러 해결
  const handleKeyDown = (e: React.KeyboardEvent, _currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      for (let i = 0; i < inputRefs.current.length; i++) {
        if (inputRefs.current[i] === e.currentTarget) {
           if (i + 1 < inputRefs.current.length) {
             inputRefs.current[i + 1]?.focus();
           } else {
             inputRefs.current[i]?.blur();
           }
           break;
        }
      }
    }
  };

// src/Game.tsx 내부 finishGame 함수

const finishGame = async () => {
  if (timerRef.current) clearInterval(timerRef.current);
  
  let correctCount = 0;
  let totalBlanks = 0;

  words.forEach(w => {
    if (w.isBlank) {
      totalBlanks++;
      if (normalizeText(w.userInput) === w.clean) correctCount++;
    }
  });

  const finalScore = totalBlanks === 0 ? 100 : Math.round((correctCount / totalBlanks) * 100);
  setScore(finalScore);
  setGameState('finished');

  // [수정] DB 함수(RPC) 호출로 변경
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // rpc('함수이름', { 매개변수 })
      await supabase.rpc('update_recent_songs', { song_id: songId });
    }
  } catch (err) {
    console.error('기록 저장 실패:', err);
  }
};

  const handleResultShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: 'Sing By Heart',
      text: `🎵 [${songTitle}] 가사 암기 도전! 제 점수는 ${score}점입니다. 당신도 도전해보세요!`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('주소가 복사되었습니다! 친구에게 공유해보세요.');
      }
    } catch (err) {
      console.error('공유 실패:', err);
    }
  };

  if (loading) return <div className="text-center p-10">로딩 중... ⏳</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-white p-4 rounded-xl shadow-sm mb-4 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
        <h1 className="font-bold text-lg truncate w-2/3">{songTitle}</h1>
        <div className="font-mono text-xl text-indigo-600 font-bold">
          ⏱ {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg text-lg">
        {gameState === 'playing' ? (
          <div className="flex flex-wrap gap-2 items-center leading-loose content-start">
            {words.map((word, idx) => {
              if (word.isNewline) {
                return <div key={idx} className="basis-full h-2"></div>;
              }

              if (!word.isBlank) {
                return <span key={idx} className="text-gray-800">{word.original}</span>;
              } else {
                return (
                  <input
                    key={idx}
                    type="text"
                    ref={el => {
                      const blankIndex = words.slice(0, idx + 1).filter(w => w.isBlank).length - 1;
                      if (el) inputRefs.current[blankIndex] = el;
                    }}
                    value={word.userInput}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="border-b-2 border-indigo-300 bg-indigo-50 text-center text-indigo-900 focus:outline-none focus:border-indigo-600 min-w-[60px] max-w-[120px] px-1 rounded-t"
                    autoCapitalize="off"
                  />
                );
              }
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <h2 className="text-3xl font-bold mb-4">
              {score === 100 ? '🎉 완벽합니다!' : '수고하셨습니다!'}
            </h2>
            <div className="text-6xl font-black text-indigo-600 mb-6">{score}점</div>
            <p className="text-gray-500 mb-8">소요 시간: {Math.floor(timeElapsed / 60)}분 {timeElapsed % 60}초</p>
            
            <div className="flex flex-col gap-3 justify-center w-full max-w-xs mx-auto">
                <div className="flex gap-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 font-bold"
                  >
                    다시 하기
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-bold"
                  >
                    목록으로
                  </button>
                </div>

                <button
                  onClick={handleResultShare}
                  className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-bold flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-1.964 2.25 2.25 0 0 0-3.933 1.964Z" />
                  </svg>
                  친구에게 공유하고 자랑하기
                </button>
            </div>
            
            {score < 100 && (
               <div className="mt-8 text-left bg-red-50 p-4 rounded-lg">
                 <h3 className="font-bold text-red-800 mb-2">💡 오답 체크</h3>
                 <ul className="list-disc list-inside text-sm space-y-1">
                   {words.map((w, i) => (
                     w.isBlank && normalizeText(w.userInput) !== w.clean && (
                       <li key={i} className="text-red-700">
                         정답: <b>{w.original}</b> / 내 입력: <span className="line-through">{w.userInput}</span>
                       </li>
                     )
                   ))}
                 </ul>
               </div>
            )}
          </div>
        )}
      </div>

      {gameState === 'playing' && (
        <div className="fixed bottom-6 w-full max-w-xs px-4">
          <button 
            onClick={finishGame}
            className="w-full bg-indigo-600 text-white py-4 rounded-full shadow-xl text-xl font-bold hover:bg-indigo-700 transition transform active:scale-95"
          >
            채점 하기 ✅
          </button>
        </div>
      )}
    </div>
  );
}