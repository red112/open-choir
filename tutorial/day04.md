3일차의 소셜 로그인까지 성공적으로 마치신 것을 축하드립니다! 버전 문제까지 스스로 해결하시는 모습이 인상적입니다.

4일차의 목표는 **"페이지 이동(Routing)"**과 **"노래 등록(INSERT)"**입니다.
지금까지는 화면이 하나(`App.tsx`)밖에 없었지만, 이제는 '홈 화면'과 '노래 등록 화면'을 왔다 갔다 해야 합니다.

웹 개발에서는 페이지를 이동할 때 `React Router`라는 표준 라이브러리를 사용합니다. 최신 **v6 (또는 v7)** 버전을 기준으로, 가장 안정적이고 쉬운 방법으로 안내해 드리겠습니다.

---

### [4일차 가이드] 라우터 설정 및 노래 등록 기능 구현

**오늘의 목표:**
1.  **React Router 설치:** 페이지 이동 기능 추가.
2.  **노래 등록 화면(Form) 제작:** 제목, 가사, 난이도 입력받기.
3.  **DB 저장:** 입력한 데이터를 Supabase `songs` 테이블에 저장하기.
4.  **권한 체크:** 로그인한 사람만 등록 버튼이 보이게 하기.

---

#### **Step 1. React Router 설치**

페이지 이동을 담당하는 내비게이션 도구입니다.

1.  VS Code 터미널을 열고 아래 명령어를 입력합니다.
    ```bash
    npm install react-router-dom
    ```

---

#### **Step 2. '노래 등록' 페이지 만들기 (`CreateSong.tsx`)**

`src` 폴더 안에 새로운 파일 `CreateSong.tsx`를 만듭니다.
이 파일이 **사용자가 가사를 입력하는 화면**이 됩니다.

*   **포인트:** 가사 입력창(`textarea`)은 길어질 수 있으므로 스크롤 처리를 하고, 모바일에서 터치하기 편하게 큼직하게 만듭니다.

**`src/CreateSong.tsx` 코드 복사 & 붙여넣기:**

```tsx
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
          play_count: 0
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
```

---

#### **Step 3. 메인 화면(`App.tsx`)에 라우터 연결**

이제 `App.tsx`를 교통 정리해 주는 **관제탑** 역할로 바꿔야 합니다.
기존의 로그인 기능과 목록 보여주는 기능을 유지하되, 페이지를 나누겠습니다.

**`src/App.tsx` 코드 전체 교체:**

```tsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import CreateSong from './CreateSong'; // 방금 만든 페이지 import

// 1. 홈 화면 컴포넌트 (기존 App 기능)
function Home({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<any[]>([]);

  // 노래 목록 불러오기
  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs() {
    // 최신순으로 정렬해서 가져오기
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
            <div key={song.song_id} className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer border border-transparent hover:border-indigo-200">
              <h3 className="font-bold text-lg text-gray-800">{song.title}</h3>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>난이도: Lv.{song.difficulty}</span>
                <span>가사 미리보기: {song.lyrics_content.slice(0, 15)}...</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 2. 전체 앱 라우터 설정 (관제탑)
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
        {/* 기본 주소(/)로 오면 Home 컴포넌트 보여줌 */}
        <Route path="/" element={<Home user={user} />} />
        
        {/* /create 주소로 오면 CreateSong 컴포넌트 보여줌 */}
        <Route path="/create" element={<CreateSong />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

#### **Step 4. 실행 및 테스트**

이제 코딩은 끝났습니다. 잘 작동하는지 확인해 볼까요?

1.  터미널에서 `npm run dev`.
2.  `localhost` (또는 배포된 URL) 접속.
3.  **로그인**을 합니다.
4.  로그인 후 화면 가운데에 생긴 **[➕ 새 노래 등록하기]** 버튼 클릭.
5.  등록 화면으로 이동하나요?
6.  제목, 가사 등을 아무거나 입력하고 **[등록 완료]** 버튼 클릭.
7.  "성공적으로 등록되었습니다!" 알림이 뜨고, 다시 홈 화면으로 돌아와서 **목록에 방금 쓴 글이 보이면 성공**입니다!

---

### **[주의] 에러가 발생한다면? (DB 권한 확인)**

혹시 등록 버튼을 눌렀는데 **"등록 실패: new row violates row-level security policy..."** 라는 에러가 뜬다면, 2일차에 설정한 Supabase 보안 정책(RLS) 문제입니다.

**해결 방법:**
1.  Supabase 대시보드 -> **SQL Editor**.
2.  아래 명령어를 복사해서 실행(Run)하세요. (기존 정책을 확실하게 정리하고 다시 설정합니다.)

```sql
-- 기존 정책이 있다면 삭제 (에러나도 무시 가능)
drop policy if exists "Public Insert" on songs;
drop policy if exists "Public Access" on songs;

-- 1. 누구나 조회 가능 (게임은 해야 하니까)
create policy "Public Access" on songs for select using (true);

-- 2. 로그인한 사용자만 등록(Insert) 가능
create policy "Authenticated Insert" on songs for insert with check (auth.role() = 'authenticated');

-- 3. 자기가 쓴 글만 수정/삭제 가능 (나중을 위해)
create policy "User Update" on songs for update using (auth.uid() = created_by);
create policy "User Delete" on songs for delete using (auth.uid() = created_by);
```

이 SQL을 한 번 돌려주시면 권한 문제는 해결됩니다.

---

### 요약
오늘 작업을 통해 **[읽기(Select)]** 뿐만 아니라 **[쓰기(Insert)]** 기능까지 완성했습니다. 웹 개발의 핵심인 CRUD(Create, Read, Update, Delete) 중 절반 이상을 해내신 겁니다.

다음 **5일차**에는 드디어 이 프로젝트의 꽃인 **"게임 화면 및 로직(빈칸 뚫기)"**을 구현하겠습니다. 기대해 주세요!
---
정확하게 원인을 짚어주셨습니다. 에러 메시지가 모든 것을 말해주고 있습니다.

### 원인 설명
**"노래를 저장할 때 `created_by`에 넣으려는 사용자 ID가 `profiles` 테이블에 존재하지 않아서"** 발생한 에러입니다.

2일차에 테이블을 만들 때, `songs` 테이블은 `profiles` 테이블을 참조하도록(Foreign Key) 설정했습니다.
그런데 구글 로그인을 하면 Supabase 내부의 `auth.users`라는 비밀 테이블에는 정보가 생기지만, 우리가 만든 `public.profiles` 테이블에는 자동으로 정보가 들어가지 않습니다. (누가 넣어주지 않았으니까요!)

그래서 DB 입장에서는 **"어? 너 회원 명부(`profiles`)에 없는 사람인데 노래를 등록하려고 해? 안 돼!"** 하고 막은 것입니다.

### 해결 방법 (SQL 실행)

가장 깔끔한 해결책은 **"회원가입(첫 로그인) 시 자동으로 `profiles` 테이블에도 정보를 넣어주는 장치(Trigger)"**를 DB에 심는 것입니다.

**Supabase SQL Editor**를 열고 아래 코드를 복사해서 실행(Run)해 주세요.

```sql
-- 1. 회원가입 시 자동으로 profiles 테이블에 데이터를 넣어주는 함수
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname, email, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'No Name'), 
    new.email,
    'member'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. 위 함수를 동작시키는 트리거 설정 (이제부터 가입하는 사람은 자동 적용)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- [중요] 3. 이미 가입된(로그인 해버린) 선생님 계정을 위해 수동으로 데이터 넣어주기
insert into public.profiles (id, nickname, email, role)
select id, coalesce(raw_user_meta_data->>'full_name', 'No Name'), email, 'member'
from auth.users
where id not in (select id from public.profiles);
```

### 실행 후 확인

1.  위 SQL이 `Success`라고 떴는지 확인합니다.
2.  다시 웹사이트로 돌아가서 **[등록 완료]** 버튼을 눌러보세요.
3.  이제 `profiles` 테이블에 선생님의 정보가 존재하므로, 에러 없이 노래가 등록될 것입니다.

이 문제는 Supabase를 처음 쓸 때 누구나 한 번씩 겪는 "통과의례" 같은 문제입니다. 아주 잘 진행하고 계십니다!
---
정확하게 원인을 짚어주셨습니다. 에러 메시지가 모든 것을 말해주고 있습니다.

### 원인 설명
**"노래를 저장할 때 `created_by`에 넣으려는 사용자 ID가 `profiles` 테이블에 존재하지 않아서"** 발생한 에러입니다.

2일차에 테이블을 만들 때, `songs` 테이블은 `profiles` 테이블을 참조하도록(Foreign Key) 설정했습니다.
그런데 구글 로그인을 하면 Supabase 내부의 `auth.users`라는 비밀 테이블에는 정보가 생기지만, 우리가 만든 `public.profiles` 테이블에는 자동으로 정보가 들어가지 않습니다. (누가 넣어주지 않았으니까요!)

그래서 DB 입장에서는 **"어? 너 회원 명부(`profiles`)에 없는 사람인데 노래를 등록하려고 해? 안 돼!"** 하고 막은 것입니다.

### 해결 방법 (SQL 실행)

가장 깔끔한 해결책은 **"회원가입(첫 로그인) 시 자동으로 `profiles` 테이블에도 정보를 넣어주는 장치(Trigger)"**를 DB에 심는 것입니다.

**Supabase SQL Editor**를 열고 아래 코드를 복사해서 실행(Run)해 주세요.

```sql
-- 1. 회원가입 시 자동으로 profiles 테이블에 데이터를 넣어주는 함수
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname, email, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'No Name'), 
    new.email,
    'member'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. 위 함수를 동작시키는 트리거 설정 (이제부터 가입하는 사람은 자동 적용)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- [중요] 3. 이미 가입된(로그인 해버린) 선생님 계정을 위해 수동으로 데이터 넣어주기
insert into public.profiles (id, nickname, email, role)
select id, coalesce(raw_user_meta_data->>'full_name', 'No Name'), email, 'member'
from auth.users
where id not in (select id from public.profiles);
```

### 실행 후 확인

1.  위 SQL이 `Success`라고 떴는지 확인합니다.
2.  다시 웹사이트로 돌아가서 **[등록 완료]** 버튼을 눌러보세요.
3.  이제 `profiles` 테이블에 선생님의 정보가 존재하므로, 에러 없이 노래가 등록될 것입니다.

이 문제는 Supabase를 처음 쓸 때 누구나 한 번씩 겪는 "통과의례" 같은 문제입니다. 아주 잘 진행하고 계십니다!
---
