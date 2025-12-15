1일차 성공을 진심으로 축하드립니다! PC 개발 경험 덕분에 문제 해결의 핵심을 아주 잘 짚으셨습니다.

2일차 목표는 **"죽어있는 화면에 생명을 불어넣는 것"**입니다.
지금 만든 웹사이트는 껍데기(HTML/CSS)일 뿐입니다. 이제 **데이터베이스(DB)**를 연결하여 노래 정보를 저장하고 불러오는 기능을 만들어 보겠습니다.

PC 개발로 치면 **"로컬 프로그램에 ODBC나 ADO로 SQL Server를 연결하는 과정"**과 똑같습니다.

---

### [2일차 가이드] 데이터베이스(Supabase) 구축 및 연동

**오늘의 목표:**
1.  클라우드 DB인 **Supabase** 프로젝트 생성.
2.  노래를 저장할 **테이블(Table) 생성**.
3.  내 컴퓨터(React)와 Supabase를 **연결**.
4.  DB에 있는 데이터를 화면에 찍어보기.

---

#### **Step 1. Supabase 프로젝트 생성 (무료 DB 만들기)**

PC 개발에서 SQL Server를 설치하는 과정입니다. 클라우드라 설치 없이 클릭 몇 번이면 됩니다.

1.  **[Supabase 홈페이지](https://supabase.com/)** 접속 후 우측 상단 **"Start your project"** 클릭.
2.  **GitHub 아이디**로 로그인합니다. (Authorize Supabase 클릭)
3.  **"New Project"** 버튼을 클릭합니다.
4.  **Create a new project** 화면에서 설정:
    *   **Organization:** 본인 아이디 선택.
    *   **Name:** `choir-memory-game`
    *   **Database Password:** **[중요]** 강력한 암호 생성 버튼(Generate a password)을 누르고, **반드시 메모장 등에 복사해두세요.** (나중에 DB 접속할 때 필요할 수 있습니다.)
    *   **Region:** `Northeast Asia (Seoul)` **[중요]** 한국이 제일 빠릅니다.
5.  **"Create new project"** 클릭.
    *   *초록색 바가 차오르며 세팅되는 데 약 1~2분 정도 걸립니다.*

---

#### **Step 2. 테이블 만들기 (SQL 실행)**

Supabase는 엑셀처럼 표를 그릴 수도 있지만, 개발자답게 **SQL 쿼리**로 한 방에 만드는 게 제일 깔끔합니다.

1.  Supabase 대시보드 좌측 메뉴바에서 **SQL Editor** 아이콘(문서 모양에 `_ >` 그려진 아이콘)을 클릭합니다.
2.  상단에 **"+ New Query"** 또는 빈 화면을 클릭합니다.
3.  아래 SQL 코드를 **통째로 복사**해서 붙여넣습니다. (어제 설계해 드린 스키마입니다.)

```sql
-- 1. 사용자 프로필 테이블
create table public.profiles (
  id uuid references auth.users not null primary key,
  nickname text not null,
  email text,
  role text default 'member' check (role in ('admin', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 노래 정보 테이블
create table public.songs (
  song_id uuid default gen_random_uuid() primary key,
  title text not null,
  creators text,
  voice_type text,
  difficulty int,
  youtube_url text,
  lyrics_content text not null,
  play_count int default 0,
  best_record_time int,
  best_record_user text,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 보안 정책 (RLS) 활성화 - 이거 안 하면 데이터 조회 안 됨
alter table profiles enable row level security;
alter table songs enable row level security;

-- 4. 테스트용 정책 (일단 누구나 읽고 쓸 수 있게 임시 개방)
create policy "Public Access" on songs for select using (true);
create policy "Public Insert" on songs for insert with check (true);
```

4.  우측 하단(또는 상단)의 **"Run"** 버튼을 클릭합니다.
5.  하단 결과창에 `Success. No rows returned`라고 뜨면 성공입니다!

---

#### **Step 3. 내 프로젝트와 DB 연결하기 (SDK 설치)**

이제 VS Code로 돌아와서 두 시스템을 연결할 **드라이버(라이브러리)**를 설치합니다.

1.  VS Code 터미널(`Ctrl + ~`)을 열고 아래 명령어를 입력합니다.
    ```bash
    npm install @supabase/supabase-js
    ```

2.  **API 키 가져오기:**
    *   다시 Supabase 웹사이트로 갑니다.
    *   좌측 하단 **톱니바퀴 아이콘 (Project Settings)** 클릭.
    *   메뉴 중 **API** 클릭.
    *   두 가지 값을 찾아서 복사 준비를 합니다.
        1.  **Project URL**
        2.  **Project API Key** (이 중 `anon` `public`이라고 적힌 키를 씁니다. `service_role`은 쓰지 마세요.)

3.  **환경 변수 파일(.env) 만들기:**
    *   VS Code 좌측 파일 탐색기에서 **빈 공간 우클릭 -> New File**.
    *   파일 이름을 정확히 **`.env`** 로 만듭니다. (점(.)으로 시작합니다. 확장자 없음)
    *   *주의: `src` 폴더 안이 아니라, `package.json`이 있는 **최상위 폴더**에 만들어야 합니다.*

4.  `.env` 파일 안에 내용을 아래와 같이 적어넣습니다. (값 부분에 아까 복사한 것을 붙여넣으세요.)

    ```env
    VITE_SUPABASE_URL=https://여기에_Project_URL_붙여넣기
    VITE_SUPABASE_KEY=여기에_anon_public_Key_붙여넣기
    ```
    *(팁: `=` 앞뒤로 공백이 없어야 합니다. 따옴표도 필요 없습니다.)*

---

#### **Step 4. 연결 코드 작성 (Client 초기화)**

이제 연결 도구(Client)를 만드는 코드를 작성합니다. PC 개발로 치면 `DBConnection` 객체를 싱글톤으로 만드는 과정입니다.

1.  **`src`** 폴더 안에 **`supabaseClient.ts`** 라는 파일을 새로 만듭니다.
2.  아래 코드를 복사해서 붙여넣습니다.

```typescript
import { createClient } from '@supabase/supabase-js';

// .env 파일에서 키를 가져옵니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL과 Key가 설정되지 않았습니다. .env 파일을 확인하세요.");
}

// 클라이언트를 생성하여 앱 어디서든 쓸 수 있게 내보냅니다.
export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

#### **Step 5. 테스트: DB에 데이터 넣고 불러오기**

제대로 연결됐는지 확인하기 위해, 메인 화면(`App.tsx`)을 수정해서 **"테스트 노래 추가"** 버튼을 만들어보겠습니다.

1.  **`src/App.tsx`** 파일을 열고 내용을 아래 코드로 교체합니다.

```tsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient'; // 방금 만든 연결 도구

function App() {
  const [songs, setSongs] = useState<any[]>([]); // 노래 목록 담을 변수

  // 1. 화면이 켜지면 DB에서 노래 목록을 가져옴 (Select)
  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs() {
    // songs 테이블에서 모든 컬럼(*)을 가져와라
    const { data, error } = await supabase.from('songs').select('*');
    if (error) console.error('에러:', error);
    else setSongs(data || []);
  }

  // 2. 버튼 누르면 DB에 테스트 노래 추가 (Insert)
  async function addTestSong() {
    const newSong = {
      title: '테스트 노래 ' + Math.floor(Math.random() * 100),
      lyrics_content: '테스트 가사입니다. 랄랄라',
      difficulty: 1
    };

    const { error } = await supabase.from('songs').insert([newSong]);
    if (error) alert('추가 실패: ' + error.message);
    else {
      alert('노래가 추가되었습니다!');
      fetchSongs(); // 목록 새로고침
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">DB 연동 테스트</h1>
      
      <button 
        onClick={addTestSong}
        className="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 mb-8"
      >
        DB에 테스트 노래 추가하기
      </button>

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">📜 저장된 노래 목록</h2>
        {songs.length === 0 ? (
          <p className="text-gray-500">데이터가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {songs.map((song) => (
              <li key={song.song_id} className="border-b pb-2">
                🎵 <b>{song.title}</b> <br/>
                <span className="text-sm text-gray-500">{song.lyrics_content}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
```

---

#### **Step 6. 실행 및 확인**

1.  터미널에서 `npm run dev` 실행.
2.  브라우저(`localhost:5173`) 접속.
3.  **"DB에 테스트 노래 추가하기"** 버튼 클릭.
4.  "노래가 추가되었습니다!" 알림이 뜨고, 밑에 목록에 노래가 생기면 **대성공**입니다!

---

### **[중요] 배포 시 주의사항 (Vercel 설정)**

내 컴퓨터(`.env`)에는 키가 있지만, **Vercel 서버는 키를 모릅니다.** (보안상 `.env` 파일은 GitHub에 안 올라가기 때문입니다.)

그래서 GitHub에 코드를 올리기(`push`) 전에, **Vercel에도 키를 등록**해줘야 합니다.

1.  **Vercel 대시보드** -> 해당 프로젝트 -> **Settings** -> **Environment Variables**.
2.  다음 두 개를 각각 추가합니다. (복사해 둔 값 사용)
    *   Key: `VITE_SUPABASE_URL` / Value: `복사한 URL` -> **Add** 클릭.
    *   Key: `VITE_SUPABASE_KEY` / Value: `복사한 Key` -> **Add** 클릭.
3.  이제 VS Code에서 GitHub로 `push` 하시면, 배포된 사이트에서도 DB가 정상 작동합니다.

---

### 요약
오늘 작업을 마치면, **프론트엔드(React)와 백엔드(Supabase DB)가 연결된 완전한 앱**의 구조를 갖추게 됩니다. 이제부터는 이 구조 위에 "가사 입력 폼", "게임 로직" 같은 살을 붙여나가기만 하면 됩니다.

천천히 따라 해보시고, `Step 3`의 키 설정 부분에서 막히거나 에러가 나면 바로 말씀해 주세요!