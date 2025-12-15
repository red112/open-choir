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