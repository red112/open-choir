2일차 미션 성공을 축하합니다! PC 개발의 "DB 연결"이라는 큰 산을 넘으셨군요.

3일차 목표는 **"사용자 구분(로그인)"**입니다.
PC 프로그램은 혼자 쓰지만, 웹은 여러 사람이 씁니다. 누가 관리자고 누가 일반 회원인지 구분하려면 **로그인(Authentication)** 기능이 필수입니다.

원래는 로그인 시스템을 직접 만들려면 보안(암호화, 세션, 쿠키 등) 때문에 몇 주가 걸리지만, **Supabase**를 쓰면 구글 로그인을 금방 붙일 수 있습니다.

오늘은 조금 복잡한 **"설정(Configuration)"** 작업이 많습니다. (코딩보다 설정이 더 까다로울 수 있습니다. 천천히 따라와 주세요.)

---

### [3일차 가이드] 구글 소셜 로그인 구현

**오늘의 목표:**
1.  **구글 클라우드**에서 "로그인 전용 키(Client ID)" 발급받기.
2.  **Supabase**에 구글 로그인 기능 켜기.
3.  웹사이트에 **"구글로 로그인"** 버튼 만들고 작동 확인하기.

---

#### **Step 1. 구글 클라우드 설정 (가장 복잡한 단계)**

PC 개발에서 외부 라이브러리 라이선스 키를 받는 과정과 비슷합니다. 구글에게 "내 웹사이트에서 네 로그인 기능을 쓸게"라고 허락받는 과정입니다.

1.  **[Google Cloud Console](https://console.cloud.google.com/)**에 접속하고 구글 계정으로 로그인합니다.
2.  **프로젝트 생성:**
    *   좌측 상단 로고 옆의 **[프로젝트 선택]** (또는 My Project) 클릭 -> **[새 프로젝트]** 클릭.
    *   프로젝트 이름: `Choir Memory Game` (아무거나 상관없음) -> **[만들기]** 클릭.
    *   알림창에서 **[프로젝트 선택]**을 눌러 해당 프로젝트로 이동합니다.
3.  **API 및 서비스 이동:**
    *   좌측 햄버거 메뉴(≡) 클릭 -> **[API 및 서비스]** -> **[OAuth 동의 화면]** 클릭.
4.  **OAuth 동의 화면 설정:**
    *   User Type: **[외부(External)]** 선택 -> **[만들기]**.
    *   **앱 정보:**
        *   앱 이름: `Choir Game`
        *   사용자 지원 이메일: 본인 이메일 선택.
    *   **개발자 연락처 정보:** 본인 이메일 입력.
    *   나머지는 다 건너뛰고 맨 아래 **[저장 후 계속]** 버튼을 3번 연속 눌러서 완료합니다. (범위 설정 등은 기본값 사용)
5.  **사용자 인증 정보(Credentials) 만들기:**
    *   좌측 메뉴 **[사용자 인증 정보]** 클릭.
    *   상단 **[+ 사용자 인증 정보 만들기]** -> **[OAuth 클라이언트 ID]** 클릭.
    *   **애플리케이션 유형:** `웹 애플리케이션`.
    *   **이름:** `Supabase Login` (상관없음).
    *   **[중요] 승인된 리디렉션 URI (Authorized redirect URIs):**
        *   여기에 **Supabase 주소**를 넣어야 합니다.
        *   **Supabase 대시보드**를 새 창으로 엽니다.
        *   **Settings (톱니바퀴) -> Authentication -> Providers -> Google** 클릭.
        *   **"Callback URL (for OAuth)"** 라고 적힌 주소(`https://...supabase.co/auth/v1/callback`)를 복사합니다.
        *   다시 구글 클라우드로 와서 **[URI 추가]**를 누르고 붙여넣습니다.
    *   **[만들기]** 클릭.
6.  **키 복사하기:**
    *   화면에 **클라이언트 ID**와 **클라이언트 보안 비밀(Secret)**이 뜹니다. 이 두 개를 메모장에 복사해 두세요.

---

#### **Step 2. Supabase에 키 등록하기**

이제 구글에서 받은 키를 Supabase에 알려줍니다.

1.  **Supabase 대시보드** -> **Authentication** (왼쪽 사람 모양 아이콘) -> **Providers**.
2.  **Google**을 찾아서 클릭합니다.
3.  **Enabled** 스위치를 켭니다 (Enable Google).
4.  **Client ID**와 **Client Secret** 입력창에 아까 구글에서 복사한 값을 붙여넣습니다.
5.  **[Save]** 클릭.

---

#### **Step 3. 로그인 버튼 코딩하기**

이제 설정은 끝났습니다! VS Code로 돌아와서 로그인 버튼을 만들어봅시다.

1.  **`src/App.tsx`** 파일을 엽니다.
2.  기존 내용을 지우고 아래 코드로 교체합니다. (어제 만든 DB 테스트 코드는 일단 지우고 로그인에 집중합니다.)

```tsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState<User | null>(null);

  // 1. 페이지 로드 시 로그인 상태 확인
  useEffect(() => {
    // 현재 로그인된 사용자 정보 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 로그인/로그아웃 상태가 변하면 자동으로 감지하는 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 구글 로그인 함수
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 로컬호스트로 다시 돌아오게 설정 (배포시엔 배포 주소로 변경 필요 - Step 4 참고)
        redirectTo: window.location.origin
      }
    });
  };

  // 3. 로그아웃 함수
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Choir Memory 🎶</h1>

        {user ? (
          // 로그인 성공 시 보여줄 화면
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto overflow-hidden">
              {/* 구글 프로필 사진 표시 */}
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700">
              환영합니다, <br/>
              <span className="text-indigo-600">{user.user_metadata.full_name}</span>님!
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
            >
              로그아웃
            </button>
          </div>
        ) : (
          // 로그인 안 했을 때 보여줄 화면
          <div>
            <p className="text-gray-500 mb-6">서비스를 이용하려면 로그인이 필요합니다.</p>
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded transition shadow-sm"
            >
              {/* 구글 G 로고 SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google 계정으로 로그인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
```

---

#### **Step 4. 실행 및 테스트 (중요!)**

1.  터미널에서 `npm run dev` 실행.
2.  `localhost:5173` 접속.
3.  **[Google 계정으로 로그인]** 버튼 클릭.
4.  구글 로그인 창이 뜨고, 계정을 선택하면...
5.  다시 내 화면으로 돌아와서 "환영합니다, OOO님!" 하고 프로필 사진이 뜨면 **성공**입니다!

---

### **[추가] 실제 배포(Vercel) 시 꼭 해야 할 일**

로컬(내 컴퓨터)에서는 잘 되지만, **Vercel에 배포하면 로그인이 안 될 수 있습니다.** 보안 때문에 "허용된 주소"가 아니면 구글이 차단하기 때문입니다.

배포 후에도 로그인이 되게 하려면:

1.  **Supabase 대시보드** -> **Authentication** -> **URL Configuration**.
2.  **Site URL**에 내 Vercel 주소 (`https://choir-memory-game.vercel.app`)를 입력하고 저장합니다.
3.  **[중요] 구글 클라우드 콘솔**에도 다시 가서 리디렉션 URI를 추가해야 할 수 있습니다. (보통은 Supabase가 알아서 처리해주지만, 만약 `redirect_uri_mismatch` 에러가 나면 구글 콘솔의 리디렉션 URI 목록에 `https://본인프로젝트.supabase.co/auth/v1/callback`이 잘 있는지 다시 확인하세요. 이 주소는 변하지 않습니다.)

---

### 3일차 완료
이제 **"로그인한 사용자만 이용할 수 있는 앱"**의 기초가 완성되었습니다.
관리자, 일반 사용자 구분도 이 로그인 정보를 바탕으로 하게 됩니다.

여기까지 성공하시면 알려주세요.
**4일차**에는 본격적으로 **"노래 등록 화면(Form)"**을 만들고, 텍스트 박스, 난이도 설정 등을 DB에 진짜로 저장하는 기능을 구현하겠습니다.

설정하느라 고생 많으셨습니다! 화이팅!

---
네, **맞습니다!** 정확하게 찾으셨습니다.

구글 클라우드 콘솔 화면 상단에 있는 **[+ 사용자 인증 정보 만들기]** 버튼을 누르면 나오는 메뉴 중 하나가 **[OAuth 클라이언트 ID]**입니다.

사용자가 보신 화면에 **"OAuth 클라이언트 ID 만들기"** (또는 비슷한 문구)가 있다면 그것을 클릭해서 진행하시면 됩니다.

### 진행 순서 요약 (다시 확인)
1.  **[OAuth 클라이언트 ID]** 클릭.
2.  **애플리케이션 유형:** **[웹 애플리케이션]** 선택 (이게 중요합니다).
3.  **이름:** 원하는 대로 입력 (예: `Supabase Login`).
4.  **승인된 리디렉션 URI:** Supabase에서 복사한 `Callback URL` 붙여넣기.
5.  **[만들기]** 클릭.

이렇게 진행하시면 **Client ID**와 **Client Secret** 두 가지 키가 발급될 것입니다. 계속 진행해 주세요!
---
Supabase 대시보드 UI가 기능이 많다 보니 처음엔 찾기 어려우실 수 있습니다.
**Callback URL**을 찾는 정확한 위치를 순서대로 알려드릴게요.

---

### Supabase에서 Callback URL 찾기

1.  **Supabase 대시보드**([supabase.com/dashboard](https://supabase.com/dashboard))에 접속해서 `choir-memory-game` 프로젝트를 클릭합니다.
2.  화면 **왼쪽 끝에 있는 세로 아이콘 메뉴**들을 보세요.
3.  위에서 5~6번째 쯤에 있는 **[Authentication]** 아이콘을 클릭합니다.
    *   *아이콘 모양:* **사람 두 명이 겹쳐있는 모양** (또는 방패 모양)입니다.
4.  Authentication 메뉴가 열리면, **그 바로 옆에 생긴 서브 메뉴** 목록을 봅니다.
5.  **Configuration**이라는 소제목 아래에 있는 **[Providers]**를 클릭합니다.
6.  여러 소셜 로고들(Apple, Azure, Discord 등)이 보일 텐데, 거기서 **[Google]**을 찾아 클릭합니다.
7.  **Google** 설정창이 아래로 펼쳐집니다.
    *   맨 윗부분에 **Callback URL (for OAuth)** 라는 항목이 있습니다.
    *   그 옆에 있는 **종이 두 장 겹친 아이콘(복사 버튼)**을 누르세요.
    *   주소는 대략 `https://영문숫자조합.supabase.co/auth/v1/callback` 처럼 생겼습니다.

---

### 찾은 후 할 일

1.  방금 복사한 URL을 가지고 **Google Cloud Console** 창으로 돌아갑니다.
2.  **"승인된 리디렉션 URI (Authorized redirect URIs)"** 항목에 있는 **[URI 추가]** 버튼을 누릅니다.
3.  나타난 입력칸에 **붙여넣기(Ctrl + V)** 합니다.
4.  **[만들기]** 버튼을 누르면 끝입니다!

혹시 찾기 어려우시면 말씀해주세요!
---
네, **맞습니다! 정확하게 보셨습니다.**

그 스위치가 **"이 프로젝트에서 구글 로그인을 사용하겠다"**는 **전원 스위치**입니다.

1.  **[Enable Sign in with Google]** 스위치를 **ON(켜기)**으로 바꿉니다.
2.  그 아래에 있는 입력창에 아까 구글에서 복사한 **Client ID**와 **Client Secret**을 붙여넣습니다.
3.  마지막으로 우측 하단(또는 상단)의 **[Save]** 버튼을 꼭 눌러주세요.

꼼꼼하게 잘 확인하고 계시네요! 이어서 진행하시면 됩니다.
---
정확한 에러 로그를 주셔서 감사합니다. 이 에러는 **`@supabase/supabase-js` 라이브러리의 버전이 올라가면서 타입(Type)을 가져오는 방식이 변경**되었기 때문에 발생합니다.

기존 v2 초기 버전에서는 `User` 타입을 직접 가져올 수 있었지만, 지금은 `Auth` 관련 타입은 `type` 키워드를 사용해서 가져오도록 명확하게 분리되었습니다.

PC 개발로 비유하면, 클래스(Class)와 인터페이스(Interface)를 `import`하는 방식이 분리된 것과 비슷합니다.

---

### 해결 방법

아주 간단하게 해결할 수 있습니다.

1.  **VS Code**에서 `src/App.tsx` 파일을 엽니다.
2.  파일의 맨 위 **3번째 줄**을 찾습니다.
    *   **기존 코드:** `import { User } from '@supabase/supabase-js';`
3.  이 코드를 아래와 같이 수정해 주세요.

    ```typescript
    // 이렇게 수정하세요!
    import type { User } from '@supabase/supabase-js';
    ```

    *   **달라진 점:** `import` 바로 뒤에 `type`이라는 키워드가 추가되었습니다.

---

### 수정 후 `App.tsx` 코드 (상단 부분)

```tsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js'; // <--- 이 부분만 수정!

function App() {
  const [user, setUser] = useState<User | null>(null);

  // ... 이하 코드는 동일 ...
}
```

이제 파일을 **저장**하고 브라우저를 새로고침하면, 에러 없이 로그인 화면이 정상적으로 나타날 것입니다!

새로운 기술을 배우실 때 이런 버전업에 따른 변경점은 아주 흔하게 겪는 일이니 너무 걱정하지 않으셔도 됩니다. 잘 해결하고 계십니다
---
네, 정확하게 짚으셨습니다. 이것은 **"로그인은 성공했는데, 다시 돌아올 주소(집)를 잘못 찾아간 상황"**입니다.

주소창에 `access_token=...`이 포함된 긴 문자열이 보인다는 것은 구글과 Supabase가 인증을 성공적으로 마치고 "자, 이제 열쇠(Token) 줄게!" 하고 보냈다는 뜻입니다. 그런데 그 도착지가 `vercel.app`(배포된 주소)이 아니라 `localhost:3000`(내 컴퓨터)으로 설정되어 있어서 에러가 난 것입니다.

**Supabase 설정**에서 "이 주소로 돌아와도 돼"라고 허락해주는 목록에 Vercel 주소를 추가하면 바로 해결됩니다.

아래 순서대로 설정을 변경해 주세요.

---

### 해결 방법: Supabase URL 설정 변경

**1. Supabase URL 설정 메뉴로 이동**
1.  Supabase 대시보드 -> 왼쪽 메뉴 **Authentication** (사람 모양 아이콘) 클릭.
2.  서브 메뉴 중 **URL Configuration** 클릭.

**2. Site URL 변경 (기본 주소 수정)**
화면에 **Site URL**이라는 항목이 보일 것입니다. 현재 `http://localhost:3000`으로 되어 있을 텐데, 이것을 **배포된 Vercel 주소**로 바꿔줍니다.

*   **변경 전:** `http://localhost:3000`
*   **변경 후:** `https://choir-memory-game.vercel.app` (본인의 실제 Vercel 주소)

**3. Redirect URLs 추가 (허용 목록 추가)**
바로 아래에 **Redirect URLs**라는 항목이 있습니다. 여기에 Vercel 주소를 명시적으로 추가해야 합니다.

1.  **[Add URL]** 버튼 클릭.
2.  입력창에 본인의 Vercel 주소를 입력: `https://choir-memory-game.vercel.app`
3.  (혹시 모르니 하나 더 추가) 뒤에 빗금(`/`)을 붙인 버전도 추가: `https://choir-memory-game.vercel.app/`
4.  **[Save]** 버튼 클릭.

---

### 확인 사살 (코드 확인)

혹시 `App.tsx` 코드에서 `redirectTo` 부분을 수정하셨거나 고정값으로 넣으셨는지 확인해 주세요.
제가 드린 코드대로 `window.location.origin`이라고 되어 있다면, **코드 수정은 필요 없습니다.**

```typescript
// App.tsx 확인
options: {
  // 이 코드는 '현재 브라우저 주소'를 자동으로 따라갑니다.
  // Vercel에서 접속했으면 Vercel 주소가 되고, Localhost면 Localhost가 됩니다.
  redirectTo: window.location.origin 
}
```

---

### 테스트 방법

1.  설정을 저장했으면, **Vercel 사이트**에서 새로고침을 합니다.
2.  다시 **[Google 계정으로 로그인]** 버튼을 누릅니다.
3.  이제 계정을 선택하면 `localhost`가 아니라 `vercel.app` 화면으로 돌아오면서 "환영합니다!" 메시지가 뜰 것입니다.

이제 정말 다 되었습니다! 로그인 기능까지 완성하신 것을 축하드립니다.
확인되시면 **4일차(노래 등록 기능)**로 넘어가겠습니다.
---



