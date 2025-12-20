축하드립니다! 이제 데이터 구조까지 탄탄하게 잡혔으니, 이 프로젝트의 하이라이트인 **"실제 게임 플레이"** 기능을 구현할 차례입니다.

5일차는 코드가 조금 깁니다. 하지만 겁먹지 마세요! **"가사를 쪼개서(Parsing) -> 빈칸을 뚫고(Logic) -> 화면에 뿌려주는(UI)"** 과정일 뿐입니다.

---

### [5일차 가이드] 게임 플레이 및 빈칸 채우기 로직

**오늘의 목표:**
1.  **라우터 연결:** 목록에서 노래를 클릭하면 게임 화면으로 이동하게 하기.
2.  **게임 로직 구현:** 난이도에 따라 랜덤하게 빈칸 뚫기.
3.  **플레이 기능:** 빈칸 입력, 엔터 키로 이동(Auto-jump).
4.  **채점 기능:** 정답 확인(Fuzzy Matching) 및 점수 계산.

---

#### **Step 1. 게임 화면용 파일 만들기 (`src/Game.tsx`)**

`src` 폴더에 `Game.tsx` 파일을 만들고 아래 코드를 **통째로 복사해서 붙여넣으세요.**
(주석에 각 코드의 역할을 상세히 적어두었습니다.)

```tsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// 단어 하나하나의 상태를 정의하는 타입
interface WordObj {
  original: string; // 원래 단어 (정답)
  clean: string;    // 비교용 단어 (특수문자 제거됨)
  isBlank: boolean; // 빈칸 여부
  userInput: string;// 사용자가 입력한 값
}

export default function Game() {
  const { songId } = useParams(); // URL에서 songId 가져오기
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [songTitle, setSongTitle] = useState('');
  const [words, setWords] = useState<WordObj[]>([]); // 가사 데이터
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0); // 소요 시간 (초)
  
  // 포커스 이동을 위한 Ref 배열 (빈칸들만 담음)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    fetchGameData();
    // 타이머 시작
    timerRef.current = window.setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [songId]);

  // 1. DB에서 노래 정보 가져오기 & 문제 출제
  async function fetchGameData() {
    try {
      const { data: song, error } = await supabase
        .from('songs')
        .select('*')
        .eq('song_id', songId)
        .single();

      if (error || !song) throw new Error('노래를 불러올 수 없습니다.');

      setSongTitle(song.title);
      
      // --- 여기가 핵심 로직: 가사 파싱 및 빈칸 생성 ---
      const rawWords = song.lyrics_content.split(/\s+/); // 공백 기준으로 단어 쪼개기
      const difficultyRatio = (song.difficulty * 8) / 100; // 난이도 1=8%, 5=40%
      
      // 빈칸으로 만들 개수 계산
      const targetBlankCount = Math.floor(rawWords.length * difficultyRatio);
      
      // !로 시작하지 않는(문제 낼 수 있는) 단어들의 인덱스 찾기
      const candidateIndices = rawWords
        .map((w: string, i: number) => w.startsWith('!') ? -1 : i)
        .filter((i: number) => i !== -1);

      // 랜덤하게 섞어서 잘라내기 (빈칸 당첨된 인덱스들)
      const shuffled = candidateIndices.sort(() => 0.5 - Math.random());
      const selectedIndices = new Set(shuffled.slice(0, targetBlankCount));

      // 최종 단어 객체 배열 생성
      const processedWords: WordObj[] = rawWords.map((word: string, index: number) => {
        const isExempt = word.startsWith('!');
        const realWord = isExempt ? word.slice(1) : word; // ! 제거
        
        return {
          original: realWord,
          clean: normalizeText(realWord),
          isBlank: selectedIndices.has(index),
          userInput: ''
        };
      });

      setWords(processedWords);
    } catch (err) {
      alert('오류 발생');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  // 비교를 위해 특수문자 제거, 소문자 변환하는 함수 (Fuzzy Matching Helper)
  function normalizeText(text: string) {
    return text.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
  }

  // 입력값 변경 처리
  const handleInputChange = (index: number, val: string) => {
    const newWords = [...words];
    newWords[index].userInput = val;
    setWords(newWords);
  };

  // 엔터키 누르면 다음 빈칸으로 이동 (UX)
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // 현재 빈칸의 다음 빈칸을 찾음
      let nextInputIndex = -1;
      let currentFound = false;
      
      // inputRefs에 저장된 순서대로 탐색
      for (let i = 0; i < inputRefs.current.length; i++) {
        if (inputRefs.current[i] === e.currentTarget) {
           // 다음 요소가 있으면 포커스
           if (i + 1 < inputRefs.current.length) {
             inputRefs.current[i + 1]?.focus();
           }
           break;
        }
      }
    }
  };

  // 채점 및 결과 보기
  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    let correctCount = 0;
    let totalBlanks = 0;

    words.forEach(w => {
      if (w.isBlank) {
        totalBlanks++;
        // 유연한 정답 인정 로직 (Fuzzy Matching)
        if (normalizeText(w.userInput) === w.clean) {
          correctCount++;
        }
      }
    });

    const finalScore = totalBlanks === 0 ? 100 : Math.round((correctCount / totalBlanks) * 100);
    setScore(finalScore);
    setGameState('finished');
  };

  if (loading) return <div className="text-center p-10">로딩 중... ⏳</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* 상단바: 제목 및 타이머 */}
      <div className="w-full max-w-2xl bg-white p-4 rounded-xl shadow-sm mb-4 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
        <h1 className="font-bold text-lg truncate w-2/3">{songTitle}</h1>
        <div className="font-mono text-xl text-indigo-600 font-bold">
          ⏱ {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* 게임 영역 (가사) */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg leading-loose text-lg">
        {gameState === 'playing' ? (
          <div className="flex flex-wrap gap-2 items-center">
            {words.map((word, idx) => {
              if (!word.isBlank) {
                // 빈칸이 아닌 단어
                return <span key={idx} className="text-gray-800">{word.original}</span>;
              } else {
                // 빈칸인 단어 (Input)
                return (
                  <input
                    key={idx}
                    type="text"
                    // ref 연결: 빈칸 순서대로 배열에 넣음
                    ref={el => {
                      // 실제 빈칸들만 순서대로 ref 배열에 쌓이게 하는 트릭
                      const blankIndex = words.slice(0, idx + 1).filter(w => w.isBlank).length - 1;
                      if (el) inputRefs.current[blankIndex] = el;
                    }}
                    value={word.userInput}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="border-b-2 border-indigo-300 bg-indigo-50 text-center text-indigo-900 focus:outline-none focus:border-indigo-600 min-w-[60px] max-w-[120px] px-1 rounded-t"
                    placeholder=""
                    autoCapitalize="off"
                  />
                );
              }
            })}
          </div>
        ) : (
          // 결과 화면
          <div className="text-center py-10">
            <h2 className="text-3xl font-bold mb-4">
              {score === 100 ? '🎉 완벽합니다!' : '수고하셨습니다!'}
            </h2>
            <div className="text-6xl font-black text-indigo-600 mb-6">{score}점</div>
            <p className="text-gray-500 mb-8">소요 시간: {Math.floor(timeElapsed / 60)}분 {timeElapsed % 60}초</p>
            
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 font-bold"
              >
                다시 하기
              </button>
              <button 
                onClick={() => navigate('/')}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-bold"
              >
                목록으로
              </button>
            </div>
            
            {/* 오답 노트 (틀린 것만 보여주기) */}
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

      {/* 하단 완료 버튼 (플레이 중에만 보임) */}
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
```

---

#### **Step 2. 라우터 설정 (`App.tsx`)**

이제 사용자가 목록에서 노래를 클릭하면 위 게임 화면으로 넘어가도록 길을 뚫어줍니다.

**1. `Game` 컴포넌트 import 추가**
`App.tsx` 파일 맨 위에 다음 줄을 추가하세요.
```tsx
import Game from './Game';
```

**2. `Home` 컴포넌트 수정 (목록 클릭 이벤트)**
`App.tsx` 안에 있는 `Home` 컴포넌트에서 노래 목록을 보여주는 부분(`map`)을 찾습니다.
`div`에 `onClick`을 달아서 이동하도록 수정합니다.

```tsx
// 수정 전
<div key={song.song_id} className="...">
  {/* 내용 */}
</div>

// 수정 후: onClick 이벤트 추가
<div 
  key={song.song_id} 
  onClick={() => navigate(`/game/${song.song_id}`)} // 클릭하면 게임 페이지로 이동!
  className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer border border-transparent hover:border-indigo-200 active:bg-gray-50"
>
  {/* 내용은 그대로 두세요 */}
  <div className="flex justify-between items-start">
     {/* ... */}
  </div>
</div>
```

**3. `Routes` 설정 추가**
`App.tsx` 맨 아래 `App` 컴포넌트의 `Routes` 사이에 새 길을 추가합니다.

```tsx
<Routes>
  <Route path="/" element={<Home user={user} />} />
  <Route path="/create" element={<CreateSong />} />
  {/* 여기 추가! :id 부분은 변수처럼 쓰입니다 */}
  <Route path="/game/:songId" element={<Game />} /> 
</Routes>
```

---

#### **Step 3. 실행 및 테스트**

이제 모든 준비가 끝났습니다!

1.  **메인 화면:** 등록해 둔 노래 목록이 보입니다.
2.  **클릭:** 노래를 하나 클릭합니다.
3.  **게임 화면:**
    *   가사 중간중간에 파란색 **빈칸(Input)**이 뚫려있나요?
    *   빈칸에 정답을 입력하고 **Enter 키**를 쳐보세요. 커서가 다음 빈칸으로 톡! 하고 넘어가나요? (이게 모바일에서 아주 편합니다.)
    *   일부러 대소문자를 틀리거나(God -> god), 뒤에 쉼표를 빼고 입력해보세요.
4.  **채점 하기:**
    *   하단 버튼을 누르면 점수가 나오나요?
    *   아까 대소문자 틀리게 쓴 것도 **정답**으로 인정되었나요? (Fuzzy Matching 성공!)
    *   100점이 아니면 아래에 **오답 노트**가 뜨나요?

---

### **[5일차 완료]**
드디어 핵심 기능인 게임 플레이까지 완성했습니다! 🎉
이제 선생님의 웹사이트는 **"회원가입 -> 노래 등록 -> 게임 플레이 -> 결과 확인"**이 가능한 **완전한 서비스**가 되었습니다.

정말 고생 많으셨습니다. 여기까지 문제없이 되셨다면, 다음 단계(마지막)는 **"디자인 다듬기"**와 **"주변에 자랑하기(배포)"** 뿐입니다.

테스트해보시고 어떠신지 소감이나 수정하고 싶은 부분이 있다면 말씀해 주세요!
---
네, 합창곡은 가사의 호흡과 줄바꿈이 암기에 정말 중요하죠!
기존 코드는 모든 단어를 한 줄로 이어 붙이도록 되어 있었는데, **"원래 가사의 줄바꿈 형태를 그대로 유지"**하도록 로직을 수정해 드리겠습니다.

기존 `Game.tsx` 파일에서 **두 가지 부분(데이터 파싱 로직, 화면 렌더링)**만 수정하면 됩니다.

---

### 수정된 `src/Game.tsx` 코드

아래 코드는 기존 `Game.tsx`의 전체 내용을 수정한 버전입니다. 그대로 덮어쓰시면 됩니다.
*(주요 변경점: 줄바꿈을 나타내는 'newline' 객체를 데이터 사이에 심어서, 화면에서 줄을 강제로 바꾸도록 처리했습니다.)*

```tsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// 단어 하나하나의 상태를 정의하는 타입
interface WordObj {
  original: string; // 원래 단어
  clean: string;    // 비교용 단어
  isBlank: boolean; // 빈칸 여부
  userInput: string;// 사용자 입력값
  isNewline?: boolean; // [NEW] 줄바꿈 여부 체크
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
      
      // 1. [수정] 줄바꿈을 유지하기 위한 파싱 로직 변경
      const lines = song.lyrics_content.split('\n'); // 엔터 기준으로 줄 나누기
      const tempAllWords: WordObj[] = [];

      lines.forEach((line: string, lineIndex: number) => {
        // 빈 줄이면 줄바꿈만 추가
        if (!line.trim()) {
          tempAllWords.push({ original: '', clean: '', isBlank: false, userInput: '', isNewline: true });
          return;
        }

        const lineWords = line.trim().split(/\s+/); // 줄 내에서 단어 나누기
        
        lineWords.forEach((word) => {
          tempAllWords.push({
            original: word,
            clean: normalizeText(word),
            isBlank: false, // 일단 false로 초기화
            userInput: '',
            isNewline: false
          });
        });

        // 마지막 줄이 아니면 줄바꿈 객체 추가
        if (lineIndex < lines.length - 1) {
          tempAllWords.push({ original: '', clean: '', isBlank: false, userInput: '', isNewline: true });
        }
      });

      // 2. 빈칸 뚫기 로직 (줄바꿈 객체는 제외하고 계산)
      const difficultyRatio = (song.difficulty * 8) / 100;
      
      // 실제 단어들의 인덱스만 모음 (!로 시작하는 단어 제외, 줄바꿈 제외)
      const candidateIndices = tempAllWords
        .map((w, i) => (!w.isNewline && !w.original.startsWith('!')) ? i : -1)
        .filter(i => i !== -1);

      const targetBlankCount = Math.floor(candidateIndices.length * difficultyRatio);
      const shuffled = candidateIndices.sort(() => 0.5 - Math.random());
      const selectedIndices = new Set(shuffled.slice(0, targetBlankCount));

      // 3. 최종 데이터 확정
      const finalWords = tempAllWords.map((w, index) => {
        if (w.isNewline) return w; // 줄바꿈은 그대로

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

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // 다음 빈칸 찾기 (inputRefs 순회)
      for (let i = 0; i < inputRefs.current.length; i++) {
        if (inputRefs.current[i] === e.currentTarget) {
           if (i + 1 < inputRefs.current.length) {
             inputRefs.current[i + 1]?.focus();
           } else {
             inputRefs.current[i]?.blur(); // 마지막이면 키보드 닫기
           }
           break;
        }
      }
    }
  };

  const finishGame = () => {
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
              // [수정] 줄바꿈 객체(isNewline)를 만나면 강제로 줄을 바꿈 (w-full)
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
                      // ref 배열 인덱싱 로직 (빈칸인 것만 순서대로 담기)
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
          // 결과 화면 (이전과 동일)
          <div className="text-center py-10">
            <h2 className="text-3xl font-bold mb-4">
              {score === 100 ? '🎉 완벽합니다!' : '수고하셨습니다!'}
            </h2>
            <div className="text-6xl font-black text-indigo-600 mb-6">{score}점</div>
            <p className="text-gray-500 mb-8">소요 시간: {Math.floor(timeElapsed / 60)}분 {timeElapsed % 60}초</p>
            
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 font-bold"
              >
                다시 하기
              </button>
              <button 
                onClick={() => navigate('/')}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-bold"
              >
                목록으로
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
```

### 적용 후 확인 포인트
1.  노래 등록 시 가사를 입력했던 **엔터(줄바꿈) 위치** 그대로 게임 화면에서도 줄이 바뀌는지 확인하세요.
2.  가사 사이사이에 **빈 줄**을 넣었다면, 게임 화면에서도 빈 공간(`h-2`)이 잘 표현되는지 확인해 보세요. (합창에서 1절, 2절 구분할 때 빈 줄을 많이 쓰니까요.)