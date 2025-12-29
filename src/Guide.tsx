import { useNavigate } from 'react-router-dom';

export default function Guide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* 상단 네비게이션 */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8 py-4">
        <h1 className="text-xl font-bold text-indigo-600 cursor-pointer" onClick={() => navigate('/')}>
          Sing by Hearts 🎶
        </h1>
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-indigo-600 font-bold">
          ✕ 닫기
        </button>
      </div>

      {/* 본문 콘텐츠 */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">

        {/* 헤더 이미지 영역 (센스있는 이모지로 대체) */}
        <div className="bg-indigo-600 p-8 text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-3xl font-bold text-white mb-2">가사 암기의 신(神)이 되는 법</h2>
          <p className="text-indigo-100">Sing by Hearts 200% 활용 가이드</p>
        </div>

        <div className="p-6 space-y-8 text-gray-700 leading-relaxed">

          {/* 서문 */}
          <section className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-500 shadow-sm">
            <h3 className="font-bold text-lg text-indigo-800 mb-2">"악보만 은혜받고 있진 않나요?" 🤔</h3>
            <p className="font-medium text-gray-700 leading-relaxed">
              아직도 콩나물(악보) 감옥에 갇혀 지휘자님 얼굴 한번 제대로 못 보고 계신가요?<br /><br />

              🎵 <b>성가대원 왈:</b> 고개를 푹 숙이고 부르니 성도들이 받아야 할 <b>'은혜'</b>가 죄다 <b>악보 위로만 쏟아진다는</b> 슬픈 전설이... (악보만 성령 충만! 😭)<br /><br />

              🎵 <b>합창단원 왈:</b> 혹시 지휘자님 쳐다보는 게 부끄러우신가요? (설마... 싫어하시는 건 아니죠? 👀)
              다들 지휘를 안 보니 결국 <b>지휘자님이 여러분 노래 속도에 맞춰 지휘를 하는 기이한 주객전도</b> 상황까지!<br /><br />

              이제 제발 고개를 드세요! <b>Sing by Hearts</b>로 가사를 완벽히 외우고, 악보 탈출 넘버원! 지휘자와 눈빛을 교환하며 진짜 <b>'합창'</b>을 만들어봅시다.
            </p>
          </section>

          {/* Step 1 */}
          <section>
            <h3 className="text-xl font-bold text-indigo-700 flex items-center gap-2 mb-3">
              <span className="bg-indigo-100 px-2 py-1 rounded text-sm">STEP 1</span>
              3초 만에 입장하기 🚀
            </h3>
            <p>
              복잡한 회원가입? 저희는 그런 거 딱 질색입니다. 가지고 계신 <b>구글 아이디</b>로 딱 3초면 입장 완료!<br />
              로그인하시면 '내가 등록한 노래'를 수정할 수 있고, '최근 연습한 곡'이 자동 저장됩니다.
            </p>
          </section>

          {/* Step 2 */}
          <section>
            <h3 className="text-xl font-bold text-indigo-700 flex items-center gap-2 mb-3">
              <span className="bg-indigo-100 px-2 py-1 rounded text-sm">STEP 2</span>
              나만의 연습곡 만들기 ✍️
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li><b>복붙의 마법:</b> 가사 텍스트를 <code className="bg-gray-100 px-1 rounded">Ctrl+C</code>, <code className="bg-gray-100 px-1 rounded">Ctrl+V</code> 하세요. 줄바꿈도 유지됩니다.</li>
              <li><b>난이도 조절:</b> 1단계(병아리)부터 5단계(암기왕)까지 설정 가능합니다.</li>
              <li><b>성부 선택:</b> 소프라노, 테너... 내 파트를 표시하면 단원들이 찾기 쉬워집니다.</li>
              <li className="bg-yellow-50 p-2 rounded border border-yellow-200 text-yellow-800">
                <b>✨ 꿀팁 (느낌표 !):</b> 빈칸으로 뚫리면 안 되는 단어(예: <code className="font-bold">!1절</code>, <code className="font-bold">!후렴</code>) 앞에는 <b>느낌표(!)</b>를 붙여주세요. 그 단어는 항상 보여집니다.
              </li>
            </ul>
          </section>

          {/* Step 3 */}
          <section>
            <h3 className="text-xl font-bold text-indigo-700 flex items-center gap-2 mb-3">
              <span className="bg-indigo-100 px-2 py-1 rounded text-sm">STEP 3</span>
              빈칸 격파 게임 🎮
            </h3>
            <p className="mb-2">
              가사 사이사이 뚫린 파란 빈칸을 기억력으로 채워주세요.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li><b>쾌속 진행:</b> 정답 입력 후 <code className="bg-gray-100 px-1 rounded">Enter</code>를 치면 다음 빈칸으로 <b>자동 점프</b>합니다.</li>
              <li><b>관대한 심판:</b> 대소문자? 쉼표? 틀려도 괜찮아요. 철자만 맞으면 <b>정답(O)</b> 인정!</li>
            </ul>
          </section>

          {/* Step 4 */}
          <section>
            <h3 className="text-xl font-bold text-indigo-700 flex items-center gap-2 mb-3">
              <span className="bg-indigo-100 px-2 py-1 rounded text-sm">STEP 4</span>
              동네방네 자랑하기 📢
            </h3>
            <p>
              "이번 주 찬양곡 이거예요!" 단톡방에 링크 하나만 던지세요.
              앱 설치 없이 클릭 한 번이면 누구나 바로 게임을 시작할 수 있습니다.
              100점 맞은 화면을 공유해서 은근슬쩍 암기력을 뽐내보세요.
            </p>
          </section>

        </div>

        {/* 하단 액션 버튼 */}
        <div className="bg-gray-50 p-6 text-center border-t">
          <p className="text-gray-600 mb-4">준비 되셨나요? 이제 시작해 보세요!</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition transform hover:scale-105"
          >
            지금 바로 도전하기
          </button>
        </div>
      </div>

      {/* 저작권 및 개인정보 링크 (SEO 및 애드센스용) */}
      <footer className="mt-12 text-center text-xs text-gray-400 space-y-2 pb-8">
        <p>&copy; 2025 Sing by Hearts. All rights reserved.</p>
        <div className="flex justify-center gap-4">
          {/* navigate를 사용하여 이동하도록 수정 */}
          <span onClick={() => navigate('/terms')} className="cursor-pointer hover:underline hover:text-gray-600">
            이용약관
          </span>
          <span className="text-gray-300">|</span>
          <span onClick={() => navigate('/privacy')} className="cursor-pointer hover:underline hover:text-gray-600">
            개인정보처리방침
          </span>
        </div>
      </footer>
    </div>
  );
}