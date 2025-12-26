// src/Game.tsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

interface WordObj { original: string; clean: string; isBlank: boolean; userInput: string; isNewline?: boolean; }

export default function Game() {
  const { songId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [songTitle, setSongTitle] = useState('');
  const [words, setWords] = useState<WordObj[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [reportText, setReportText] = useState(''); // [NEW] 수정 요청 내용

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    fetchGameData();
    timerRef.current = window.setInterval(() => { setTimeElapsed((prev) => prev + 1); }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [songId]);

  async function fetchGameData() {
    try {
      const { data: song, error } = await supabase.from('songs').select('*').eq('song_id', songId).single();
      if (error || !song) throw new Error('Load failed');
      setSongTitle(song.title);
      
      const lines = song.lyrics_content.split('\n');
      const tempAllWords: WordObj[] = [];
      lines.forEach((line: string, lineIndex: number) => {
        if (!line.trim()) { tempAllWords.push({ original: '', clean: '', isBlank: false, userInput: '', isNewline: true }); return; }
        const lineWords = line.trim().split(/\s+/);
        lineWords.forEach((word) => { tempAllWords.push({ original: word, clean: normalizeText(word), isBlank: false, userInput: '', isNewline: false }); });
        if (lineIndex < lines.length - 1) tempAllWords.push({ original: '', clean: '', isBlank: false, userInput: '', isNewline: true });
      });

      const difficultyRatio = (song.difficulty * 8) / 100;
      const candidateIndices = tempAllWords.map((w, i) => (!w.isNewline && !w.original.startsWith('!')) ? i : -1).filter(i => i !== -1);
      const targetBlankCount = Math.floor(candidateIndices.length * difficultyRatio);
      const shuffled = candidateIndices.sort(() => 0.5 - Math.random());
      const selectedIndices = new Set(shuffled.slice(0, targetBlankCount));

      setWords(tempAllWords.map((w, index) => {
        if (w.isNewline) return w;
        const isExempt = w.original.startsWith('!');
        const realWord = isExempt ? w.original.slice(1) : w.original;
        return { ...w, original: realWord, clean: normalizeText(realWord), isBlank: selectedIndices.has(index) };
      }));
    } catch (err) { navigate('/'); } finally { setLoading(false); }
  }

  function normalizeText(text: string) { return text.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ""); }
  const handleInputChange = (index: number, val: string) => { const newWords = [...words]; newWords[index].userInput = val; setWords(newWords); };
  const handleKeyDown = (e: React.KeyboardEvent, _currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      for (let i = 0; i < inputRefs.current.length; i++) {
        if (inputRefs.current[i] === e.currentTarget) {
           if (i + 1 < inputRefs.current.length) inputRefs.current[i + 1]?.focus();
           else inputRefs.current[i]?.blur();
           break;
        }
      }
    }
  };

  const finishGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    let correctCount = 0; let totalBlanks = 0;
    words.forEach(w => { if (w.isBlank) { totalBlanks++; if (normalizeText(w.userInput) === w.clean) correctCount++; } });
    const finalScore = totalBlanks === 0 ? 100 : Math.round((correctCount / totalBlanks) * 100);
    setScore(finalScore);
    setGameState('finished');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.rpc('update_recent_songs', { song_id: songId });
    } catch (err) { console.error('기록 저장 실패:', err); }
  };
  
  const handleResultShare = async () => {
     const shareUrl = window.location.href;
     const shareData = { title: 'Sing by Heart', text: `🎵 [${songTitle}] 가사 암기 도전! 제 점수는 ${score}점입니다.`, url: shareUrl };
     if (navigator.share) await navigator.share(shareData);
     else { await navigator.clipboard.writeText(shareUrl); alert('복사됨'); }
  };

  // [NEW] 수정 요청 등록
  const handleSubmitReport = async () => {
    if (!reportText.trim()) return alert('내용을 입력해주세요.');
    
    // 갯수 제한 체크
    const { count } = await supabase.from('song_issues').select('*', { count: 'exact', head: true }).eq('song_id', songId);
    if (count !== null && count >= 5) return alert('수정 요청이 너무 많습니다. (최대 5개)');

    const { error } = await supabase.from('song_issues').insert({ song_id: songId, issue_content: reportText });
    if (error) alert('등록 실패');
    else { alert('수정 요청이 등록되었습니다. 작성자가 확인 후 반영할 것입니다.'); setReportText(''); }
  };

  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-white p-4 rounded-xl shadow-sm mb-4 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
        <h1 className="font-bold text-lg truncate w-2/3">{songTitle}</h1>
        <div className="font-mono text-xl text-indigo-600 font-bold">⏱ {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</div>
      </div>
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg text-lg">
        {gameState === 'playing' ? (
          <div className="flex flex-wrap gap-2 items-center leading-loose content-start">
            {words.map((word, idx) => {
              if (word.isNewline) return <div key={idx} className="basis-full h-2"></div>;
              if (!word.isBlank) return <span key={idx} className="text-gray-800">{word.original}</span>;
              return <input key={idx} type="text" ref={el => { const blankIndex = words.slice(0, idx + 1).filter(w => w.isBlank).length - 1; if (el) inputRefs.current[blankIndex] = el; }} value={word.userInput} onChange={(e) => handleInputChange(idx, e.target.value)} onKeyDown={(e) => handleKeyDown(e, idx)} className="border-b-2 border-indigo-300 bg-indigo-50 text-center text-indigo-900 focus:outline-none min-w-[60px] max-w-[120px] px-1 rounded-t" autoCapitalize="off" />;
            })}
          </div>
        ) : (
          <div className="text-center py-5">
            <h2 className="text-3xl font-bold mb-4">{score === 100 ? '🎉 완벽합니다!' : '수고하셨습니다!'}</h2>
            <div className="text-6xl font-black text-indigo-600 mb-6">{score}점</div>
            
            {/* [수정] 결과 상세 보기: 전체 텍스트에서 정답/오답 표시 */}
            <div className="text-left bg-gray-50 p-4 rounded-lg mb-8 leading-loose">
               <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">📖 결과 상세 보기</h3>
               <div className="flex flex-wrap gap-1">
                 {words.map((w, i) => {
                   if (w.isNewline) return <div key={i} className="basis-full h-1"></div>;
                   if (!w.isBlank) return <span key={i} className="text-gray-500">{w.original}</span>;
                   
                   const isCorrect = normalizeText(w.userInput) === w.clean;
                   return (
                     <span key={i} className={`font-bold ${isCorrect ? 'text-blue-600' : 'text-red-500'}`}>
                       {isCorrect ? w.original : <>{w.userInput || '(공백)'} <span className="text-xs text-gray-400 font-normal">({w.original})</span></>}
                     </span>
                   );
                 })}
               </div>
            </div>

            <div className="flex flex-col gap-3 justify-center w-full max-w-xs mx-auto mb-10">
                <div className="flex gap-3"><button onClick={() => window.location.reload()} className="flex-1 bg-indigo-500 text-white py-3 rounded-lg font-bold">다시 하기</button><button onClick={() => navigate('/')} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold">목록으로</button></div>
                <button onClick={handleResultShare} className="w-full bg-green-500 text-white py-3 rounded-lg font-bold">공유하기</button>
            </div>

            {/* [NEW] 수정 요청 폼 */}
            <div className="border-t pt-6 text-left">
              <h4 className="text-sm font-bold text-gray-600 mb-2">🚨 가사 오류 신고 / 수정 요청</h4>
              <textarea 
                value={reportText} 
                onChange={(e) => setReportText(e.target.value)} 
                placeholder="틀린 부분이나 수정할 내용을 적어주세요. (100자 이내)"
                maxLength={100}
                className="w-full p-2 border rounded text-sm h-20 mb-2"
              ></textarea>
              <button onClick={handleSubmitReport} className="w-full bg-gray-200 text-gray-700 py-2 rounded text-sm hover:bg-gray-300">수정 요청 보내기</button>
            </div>
          </div>
        )}
      </div>
      {gameState === 'playing' && <div className="fixed bottom-6 w-full max-w-xs px-4"><button onClick={finishGame} className="w-full bg-indigo-600 text-white py-4 rounded-full shadow-xl text-xl font-bold">채점 하기 ✅</button></div>}
      <div className={`w-full max-w-2xl mt-6 p-4 bg-gray-100 rounded text-center text-xs text-gray-400 ${gameState === 'playing' ? 'mb-24' : 'mb-6'}`}><p className="mb-2">광고 영역</p><div style={{ minHeight: '100px', background: '#eee' }}></div></div>
    </div>
  );
}