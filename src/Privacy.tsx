import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg">

        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">개인정보처리방침</h1>
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-indigo-600 font-bold">
            ✕ 닫기
          </button>
        </div>

        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
          <p>
            'Sing by Hearts'(이하 '서비스')는 이용자의 개인정보를 소중히 여기며,
            "개인정보 보호법" 등 관련 법령을 준수하고 있습니다.
          </p>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. 수집하는 개인정보의 항목 및 수집 방법</h2>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><strong>수집 항목:</strong> 이메일 주소, 이름(닉네임), 프로필 사진 URL, 서비스 이용 기록(게임 점수, 등록한 노래 데이터)</li>
              <li><strong>수집 방법:</strong> Google OAuth 소셜 로그인을 통한 자동 수집, 서비스 이용 과정에서 생성</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. 개인정보의 수집 및 이용 목적</h2>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>회원 식별 및 회원 관리</li>
              <li>서비스 제공(노래 등록, 게임 기록 저장, 최근 연습 목록 제공)</li>
              <li>부정 이용 방지 및 비인가 사용 방지</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. 개인정보의 보유 및 이용 기간</h2>
            <p>이용자의 개인정보는 원칙적으로 회원 탈퇴 시 지체 없이 파기합니다. 단, 관계 법령 위반에 따른 수사 조사 등이 진행 중인 경우에는 해당 종료 시까지 보유할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. 쿠키(Cookie)의 운용 및 거부</h2>
            <p>본 서비스는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.</p>
            <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
              <li><strong>Google AdSense:</strong> 광고 게재를 위해 Google 및 파트너사가 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
              <li><strong>로그인 세션:</strong> 자동 로그인 및 세션 유지를 위해 Supabase 인증 쿠키를 사용합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. 개인정보에 관한 민원서비스</h2>
            <p>서비스 이용 중 발생하는 모든 개인정보 보호 관련 문의는 아래 연락처로 문의해 주시기 바랍니다.</p>
            <div className="mt-2 bg-gray-100 p-4 rounded">
              <p><strong>개발자 연락처(이메일):</strong>the.right.minded.one@gmail.com</p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}