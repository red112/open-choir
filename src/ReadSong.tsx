import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { AD_CONFIG } from './adConfig';
import AdBanner from './components/AdBanner';

function getYouTubeID(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export default function ReadSong() {
    const { songId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [song, setSong] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
        fetchSong();
    }, [songId]);

    async function fetchSong() {
        try {
            const { data, error } = await supabase
                .from('songs')
                .select('*, profiles(nickname)')
                .eq('song_id', songId)
                .single();

            if (error) throw error;
            if (!data) { alert('Song not found'); navigate('/'); return; }
            setSong(data);
        } catch (error) { console.error(error); alert('Error'); navigate('/'); }
        finally { setLoading(false); }
    }

    if (loading) return <div className="p-10 text-center">{t('game.loading')}</div>;
    if (!song) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
            <Helmet>
                <title>{song.title} - Sing by Heart</title>
                <meta name="description" content={`Practice lyrics for ${song.title}. ${song.description || ''}`} />
            </Helmet>

            {/* 상단 네비게이션 */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-6">
                <button onClick={() => navigate('/')} className="text-gray-500 hover:text-indigo-600 font-bold">← {t('game.btn_list')}</button>
                {user && (user.id === song.created_by) && (
                    <button onClick={() => navigate(`/edit/${songId}`)} className="text-sm text-blue-600 font-bold hover:underline">{t('read.btn_edit')}</button>
                )}
            </div>

            <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-xl shadow-lg">
                {/* 1. 제목 및 정보 */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{song.title}</h1>
                <div className="flex gap-2 text-sm text-gray-500 mb-6 flex-wrap">
                    <span>{t('song.level')}{song.difficulty}</span>
                    <span>•</span>
                    <span>{song.voice_part || 'All Parts'}</span>
                </div>

                {/* 2. 곡 설명 (최상단 배치 - 콘텐츠임을 강조) */}
                {song.description && (
                    <div className="bg-indigo-50 p-5 rounded-lg mb-6 text-gray-700 leading-relaxed text-base border-l-4 border-indigo-400">
                        <h3 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                            {t('read.desc_title')}
                            {i18n.language !== 'ko' && (
                                <a href={`https://translate.google.com/?sl=auto&tl=${i18n.language}&text=${encodeURIComponent(song.description)}`} target="_blank" rel="noopener noreferrer" className="text-xs font-normal bg-white border border-indigo-200 text-indigo-600 px-2 py-0.5 rounded shadow-sm no-underline ml-auto">Translate</a>
                            )}
                        </h3>
                        <p className="whitespace-pre-wrap">{song.description}</p>
                    </div>
                )}

                {/* 3. 광고 (텍스트 사이에 배치 - 인피드 느낌) */}
                <AdBanner slot={AD_CONFIG.SLOTS.READ_MIDDLE} format="horizontal" className="my-6" />

                {/* 4. 전체 가사 (메인 콘텐츠) */}
                <div className="text-lg leading-loose text-gray-800 whitespace-pre-wrap font-medium mb-8 border-t pt-6">
                    {song.lyrics_content}
                </div>

                {/* 5. 유튜브 영상 */}
                {song.youtube_url && getYouTubeID(song.youtube_url) && (
                    <div className="mb-8 aspect-video rounded-lg overflow-hidden bg-black shadow-md">
                        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeID(song.youtube_url)}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                )}

                {/* 6. 게임 시작 버튼 (맨 아래로 이동 - Call to Action) */}
                <div className="border-t pt-8 mt-4 text-center">
                    <p className="text-gray-500 mb-3 text-sm">가사를 충분히 숙지하셨나요?</p>
                    <button
                        onClick={() => navigate(`/game/${songId}`)}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl shadow-lg font-bold text-xl hover:bg-indigo-700 transition transform active:scale-95 flex justify-center items-center gap-2"
                    >
                        <span>🎮</span> {t('read.btn_start')}
                    </button>
                </div>

            </div>

            {/* 7. 하단 광고 */}
            <div className="w-full max-w-2xl mt-6">
                <AdBanner slot={AD_CONFIG.SLOTS.READ_BOTTOM} />
            </div>
        </div>
    );
}