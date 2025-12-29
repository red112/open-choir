import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg">

        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">이용약관</h1>
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-indigo-600 font-bold">
            ✕ 닫기
          </button>
        </div>

        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">제1조 (목적)</h2>
            <p>
              본 약관은 'Sing by Hearts'(이하 '서비스')가 제공하는 웹 기반 합창곡 가사 암기 게임 서비스의 이용과 관련하여,
              서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">제2조 (서비스의 제공)</h2>
            <p>본 서비스는 합창 연습을 돕기 위한 보조 도구로써 제공되며, 서비스의 내용 및 기능은 개발자의 사정에 따라 변경되거나 중단될 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">제3조 (저작권 및 게시물)</h2>
            <ul className="list-decimal list-inside ml-2 space-y-1">
              <li>회원이 서비스 내에 게시한 게시물(노래 가사, 제목 등)의 저작권은 해당 게시물의 저작자에게 귀속됩니다.</li>
              <li>회원은 타인의 저작권을 침해하는 내용을 등록해서는 안 되며, 이에 대한 모든 법적 책임은 회원 본인에게 있습니다.</li>
              <li>서비스 제공자는 저작권법 등 관련 법령에 위배되는 게시물에 대해 사전 통지 없이 삭제하거나 등록을 거부할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">제4조 (면책조항)</h2>
            <ul className="list-decimal list-inside ml-2 space-y-1">
              <li>서비스는 천재지변 또는 이에 준하는 불가항력으로 인해 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
              <li>서비스는 회원이 게재한 정보, 자료, 사실의 신뢰도, 정확성 등 내용에 관하여는 책임을 지지 않습니다.</li>
              <li>무료로 제공되는 서비스 이용과 관련하여 관련 법령에 특별한 규정이 없는 한 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">부칙</h2>
            <p>본 약관은 2025년 12월 23일부터 적용됩니다.</p>
          </section>
        </div>

      </div>
    </div>
  );
}