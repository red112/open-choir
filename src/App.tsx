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