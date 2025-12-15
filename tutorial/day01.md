PC 개발 경력이 많으시다면 기본 로직(조건문, 루프, 변수, 객체 등)과 아키텍처 이해도가 높으시기 때문에, **"도구(Toolchain)의 사용법"**과 **"웹의 동작 방식"**만 익히시면 금방 적응하실 수 있습니다.

웹 개발이 처음이신 분을 위해, 복잡한 개념 설명보다는 **"무작정 따라하기"** 식으로 1일 차 목표인 **<개발 환경 구축 및 Hello World 배포>** 과정을 상세히 정리해 드립니다.

이 과정은 PC 개발로 치면, **"Visual Studio 설치 -> 새 프로젝트 생성 -> 'Hello World' 코딩 -> 실행 파일(exe) 생성 -> 다른 컴퓨터에서 실행해보기"**까지의 과정입니다.

---

### [1일차 가이드] 개발 환경 구축 및 첫 웹사이트 배포

**오늘의 목표:** 내 컴퓨터에 개발 도구를 설치하고, 기본 웹사이트를 만들어 전 세계 어디서든 접속 가능한 URL(Vercel)로 배포합니다.

#### **Step 0. 사전 준비 (개발 도구 설치)**

PC 개발에서 컴파일러와 IDE가 필요하듯, 웹 개발에는 다음 도구들이 필수입니다.

1.  **Node.js (런타임 환경)**
    *   *개념:* 웹 브라우저 밖에서 자바스크립트를 실행하게 해주는 도구입니다. PC 개발의 JDK나 .NET Framework 런타임과 비슷합니다.
    *   **[설치]:** [Node.js 공식 홈페이지](https://nodejs.org/)에서 **LTS(Long Term Support) 버전**을 다운로드하여 설치합니다. (설치 시 Next만 계속 누르시면 됩니다.)
    *   *확인:* 터미널(cmd 또는 PowerShell)을 열고 `node -v`를 입력해 버전 숫자가 나오면 성공입니다.

2.  **VS Code (에디터/IDE)**
    *   *개념:* 현재 웹 개발의 표준 에디터입니다. Visual Studio보다 가볍습니다.
    *   **[설치]:** [VS Code 공식 홈페이지](https://code.visualstudio.com/)에서 다운로드 및 설치.

3.  **Git (버전 관리)**
    *   **[설치]:** [Git 공식 홈페이지](https://git-scm.com/)에서 설치. (이미 있으시다면 패스)

---

#### **Step 1. 프로젝트 생성 (Vite + React)**

PC 개발에서 "File > New Project"를 하는 과정입니다. 요즘 웹 개발은 터미널 명령어로 프로젝트 뼈대를 만듭니다.

1.  바탕화면이나 작업하고 싶은 폴더에서 **오른쪽 클릭 -> "Open in Terminal"** (또는 VS Code를 열고 `Ctrl + ~` 키로 터미널 열기).
2.  아래 명령어를 입력합니다. (마법사가 실행됩니다.)
    ```bash
    npm create vite@latest
    ```
    *   *설명:* `npm`은 Node Package Manager로, 라이브러리 관리 도구입니다 (NuGet/Maven과 유사). `vite`는 최신 빌드 도구입니다.

3.  **설정 선택 과정 (화살표 키와 엔터로 선택):**
    *   Project name: `choir-memory-game`
    *   Select a framework: **React** (선택)
    *   Select a variant: **TypeScript** (선택)

4.  프로젝트 폴더로 이동하고 라이브러리를 설치합니다.
    ```bash
    cd choir-memory-game
    npm install
    ```
    *   *설명:* `npm install`은 프로젝트에 필요한 외부 라이브러리들을 인터넷에서 다운로드해 `node_modules` 폴더에 넣는 과정입니다.

---

#### **Step 2. 로컬 실행 (내 컴퓨터에서 띄워보기)**

코드를 작성했으면 컴파일하고 실행해봐야겠죠?

1.  터미널에 다음 명령어를 입력합니다.
    ```bash
    npm run dev
    ```
2.  터미널에 `Local: http://localhost:5173/` 같은 주소가 뜹니다.
3.  **Ctrl 키를 누른 채 저 주소를 클릭**하거나, 크롬 브라우저를 켜고 주소창에 입력하세요.
4.  브라우저에 "Vite + React" 로고가 빙글빙글 도는 화면이 나오면 **성공**입니다!

---

#### **Step 3. Tailwind CSS 설치 (디자인 도구)**

웹에서 버튼 색을 바꾸거나 배치를 하려면 CSS를 써야 하는데, `Tailwind CSS`를 쓰면 HTML 태그 안에 `class="bg-red-500"` 처럼 적기만 해도 디자인이 됩니다.

1.  실행 중인 터미널을 종료(`Ctrl + C`)하고, 아래 명령어를 순서대로 입력합니다.
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```
2.  VS Code에서 프로젝트 폴더를 엽니다 (`File > Open Folder`).
3.  파일 목록 중 **`tailwind.config.js`** 파일을 열고 `content` 부분을 아래처럼 수정합니다. (어떤 파일들에 Tailwind를 적용할지 지정하는 것)

    ```javascript
    /** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    }
    ```

4.  **`src/index.css`** 파일을 열고 내용을 **모두 지운 뒤**, 최상단에 아래 3줄을 붙여넣고 저장합니다.

    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

---

#### **Step 4. "Hello World" 코드 수정해보기**

이제 실제로 화면을 바꿔봅시다. React에서는 `App.tsx` 파일이 메인 화면입니다. (C언어의 `main()` 함수가 있는 곳이라 생각하세요.)

1.  **`src/App.tsx`** 파일을 엽니다.
2.  기존 내용을 **싹 다 지우고**, 아래 코드를 붙여넣으세요.

    ```tsx
    function App() {
      return (
        // className="..." 부분이 Tailwind CSS입니다.
        // min-h-screen: 전체 화면 높이 사용
        // flex, justify-center, items-center: 내용을 정가운데 정렬
        // bg-gray-100: 배경색 회색
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
          
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            합창곡 암기 게임 🎶
          </h1>
          
          <p className="text-xl text-gray-700 mb-8">
            개발자님, 웹 개발의 세계에 오신 것을 환영합니다!
          </p>

          <button className="px-6 py-3 bg-indigo-500 text-white rounded-lg shadow-lg hover:bg-indigo-600 transition">
            게임 시작하기 (준비중)
          </button>

        </div>
      )
    }

    export default App
    ```

3.  터미널에 다시 `npm run dev`를 입력하고 브라우저(`localhost:5173`)를 확인해보세요. 화면이 바뀌었나요?

---

#### **Step 5. 전 세계에 배포하기 (GitHub + Vercel)**

내 컴퓨터에서만 되면 의미가 없겠죠? 서버에 올려봅시다. 옛날처럼 FTP로 파일 올리는 게 아니라, **"소스코드를 GitHub에 올리면 자동으로 서버에 배포"**되는 방식을 씁니다.

1.  **GitHub에 코드 올리기**
    *   [GitHub](https://github.com/)에 로그인 후 "New Repository"를 클릭합니다.
    *   Repository name: `choir-memory-game` (Public 선택) -> Create repository.
    *   VS Code 터미널에서 아래 명령어를 차례로 입력합니다. (GitHub 화면에 나오는 명령어 복사해도 됩니다.)
        ```bash
        git init
        git add .
        git commit -m "First Commit"
        git branch -M main
        git remote add origin https://github.com/본인아이디/choir-memory-game.git
        git push -u origin main
        ```

2.  **Vercel로 배포하기**
    *   [Vercel 홈페이지](https://vercel.com/)에 접속하여 "Sign Up" -> **"Continue with GitHub"**로 가입합니다.
    *   대시보드에서 **"Add New..." -> "Project"** 클릭.
    *   방금 만든 `choir-memory-game` 레포지토리 옆의 **"Import"** 버튼 클릭.
    *   설정 건드릴 것 없이 **"Deploy"** 버튼 클릭.

3.  **1~2분 기다리기**
    *   폭죽이 터지는 애니메이션이 나오면 배포 성공입니다!
    *   화면에 생성된 `Domain` (예: `choir-memory-game.vercel.app`)을 클릭해보세요.
    *   이제 이 URL을 스마트폰으로 접속해보세요. 모바일에서도 잘 나오나요?

---

### [1일차 완료]
축하합니다! 👏
배경지식이 없으셔도 **"개발 환경 구축 -> 코딩 -> 형상 관리 -> 클라우드 배포"**의 전체 사이클(CI/CD)을 단 하루 만에 경험하셨습니다.

**다음 단계(2일차) 미리보기:**
*   이제 껍데기뿐인 화면에 '데이터'를 넣어야 합니다.
*   **Supabase(데이터베이스)**를 생성하고 테이블을 만드는 작업을 진행하겠습니다.

오늘 여기까지 성공하셨다면, 이 상태 그대로 두시고 편안히 쉬시면 됩니다. 고생하셨습니다!