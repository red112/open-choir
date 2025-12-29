import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 추가

export default function CreateSong() {
  const navigate = useNavigate();
  const { t } = useTranslation(); // 훅
  const { songId } = useParams();
  const isEditMode = Boolean(songId);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [difficulty, setDifficulty] = useState('1');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [voicePart, setVoicePart] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [savedSongId, setSavedSongId] = useState('');
  const [savedSongTitle, setSavedSongTitle] = useState('');
  const [issues, setIssues] = useState<any[]>([]);

  const VOICE_PARTS = ['남성', '여성', '소프라노', '메조', '알토', '테너', '바리톤', '베이스'];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { alert(t('app.login_required')); navigate('/'); }
    });
    if (isEditMode && songId) {
      fetchSongData();
      fetchIssues();
    }
  }, [songId]);

  async function fetchSongData() {
    setDataLoading(true);
    const { data, error } = await supabase.from('songs').select('*').eq('song_id', songId).maybeSingle();
    if (error || !data) { alert('Load Failed'); navigate('/'); }
    else {
      setTitle(data.title); setLyrics(data.lyrics_content);
      setDifficulty(String(data.difficulty)); setYoutubeUrl(data.youtube_url || ''); setVoicePart(data.voice_part || '');
    }
    setDataLoading(false);
  }

  async function fetchIssues() {
    const { data } = await supabase.from('song_issues').select('*').eq('song_id', songId).order('created_at', { ascending: true });
    setIssues(data || []);
  }

  async function deleteIssue(issueId: string) {
    if (!confirm(t('song.delete_confirm'))) return;
    const { error } = await supabase.from('song_issues').delete().eq('issue_id', issueId);
    if (!error) fetchIssues();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !lyrics) { alert(t('create.alert_req')); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');
      const songData = { title, lyrics_content: lyrics, difficulty: parseInt(difficulty), youtube_url: youtubeUrl, voice_part: voicePart, ...(isEditMode ? {} : { created_by: user.id, play_count: 0 }) };

      let res;
      if (isEditMode) res = await supabase.from('songs').update(songData).eq('song_id', songId).select();
      else res = await supabase.from('songs').insert([songData]).select();

      if (res.error) throw res.error;
      const saved = res.data?.[0];
      if (saved) { setSavedSongId(saved.song_id); setSavedSongTitle(saved.title); setShowModal(true); }
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/game/${savedSongId}`;
    const shareData = { title: t('app.title'), text: `🎵 [${savedSongTitle}] ${t('game.share_msg', { title: savedSongTitle, score: '' })}`, url: shareUrl };
    try { if (navigator.share) await navigator.share(shareData); else { await navigator.clipboard.writeText(shareUrl); alert(t('game.copy_complete')); } } catch (err) { console.error(err); }
  };

  if (dataLoading) return <div>{t('game.loading')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center relative">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md mb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? t('create.title_edit') : t('create.title_new')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">{t('create.input_title')}</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">{t('create.input_youtube')}</label><input type="text" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} className="w-full p-3 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">{t('create.input_difficulty')}</label><select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full p-3 border rounded-lg bg-white">{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Level {n}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">{t('create.input_part')}</label><select value={voicePart} onChange={e => setVoicePart(e.target.value)} className="w-full p-3 border rounded-lg bg-white"><option value="">{t('create.part_none')}</option>{VOICE_PARTS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">{t('create.input_lyrics')} <span className="text-xs text-gray-400">{t('create.lyrics_hint')}</span></label><textarea value={lyrics} onChange={e => setLyrics(e.target.value)} className="w-full p-3 border rounded-lg h-64" /></div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">{loading ? t('create.btn_saving') : (isEditMode ? t('create.title_edit') : t('create.btn_save'))}</button>
          <button type="button" onClick={() => navigate('/')} className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-lg">{t('create.btn_cancel')}</button>
        </form>

        {isEditMode && issues.length > 0 && (
          <div className="mt-10 border-t pt-6">
            <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">{t('create.issues_title')} ({issues.length})</h3>
            <div className="space-y-3">
              {issues.map((issue) => (
                <div key={issue.issue_id} className="bg-red-50 p-3 rounded border border-red-100 flex justify-between items-start">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap flex-1">{issue.issue_content}</p>
                  <button onClick={() => deleteIssue(issue.issue_id)} className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-100 ml-2">{t('create.btn_resolve')}</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-bold mb-4">{isEditMode ? t('create.success_edit') : t('create.success_new')}</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate(`/game/${savedSongId}`)} className="bg-indigo-600 text-white py-3 rounded-lg font-bold">{t('create.modal_game')}</button>
              <button onClick={handleShare} className="bg-green-500 text-white py-3 rounded-lg font-bold">{t('create.modal_share')}</button>
              <button onClick={() => navigate('/')} className="bg-gray-100 text-gray-700 py-3 rounded-lg font-bold">{t('create.modal_list')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}