import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { AD_CONFIG } from './adConfig';
import AdBanner from './components/AdBanner';

// 유튜브 URL ID 추출 헬퍼 함수
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

            if (!data) {
                alert('Song not found');
                navigate('/');
                return;
            }

            setSong(data);
        } catch (error) {
            console.error("Error fetching song:", error);
            alert('Error loading song');
            navigate('/');
        } finally {
            setLoading(false);
        }
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
                <button onClick={() => navigate('/')} className="text-gray-500 hover:text-indigo-600 font-bold">
                    ← {t('game.btn_list')}
                </button>
                {user && (user.id === song.created_by) && (
                    <button onClick={() => navigate(`/edit/${songId}`)} className="text-sm text-blue-600 font-bold hover:underline">
                        {t('read.btn_edit')}
                    </button>
                )}
            </div>

            <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-xl shadow-lg">
                {/* 1. 제목 및 정보 */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{song.title}</h1>
                <div className="flex gap-2 text-sm text-gray-500 mb-4 flex-wrap">
                    <span>{t('song.level')}{song.difficulty}</span>
                    <span>•</span>
                    <span>{song.voice_part || 'All Parts'}</span>
                    {/* [삭제됨] 등록자 정보 표시 제거 */}
                </div>

                {/* 2. 곡 설명 */}
                {song.description && (
                    <div className="bg-indigo-50 p-4 rounded-lg mb-6 text-gray-700 leading-relaxed text-sm relative group">
                        <h3 className="font-bold text-indigo-700 mb-1 flex items-center gap-2">
                            {t('read.desc_title')}

                            {/* 번역 버튼 */}
                            {i18n.language !== 'ko' && (
                                <a
                                    href={`https://translate.google.com/?sl=auto&tl=${i18n.language}&text=${encodeURIComponent(song.description)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-normal bg-white border border-indigo-200 text-indigo-600 px-2 py-0.5 rounded shadow-sm hover:bg-indigo-50 no-underline flex items-center gap-1"
                                    title="Translate with Google"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                                    </svg>
                                    Translate
                                </a>
                            )}
                        </h3>
                        <p className="whitespace-pre-wrap">{song.description}</p>
                    </div>
                )}

                {/* 3. 게임 시작 버튼 */}
                <button
                    onClick={() => navigate(`/game/${songId}`)}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl shadow-lg font-bold text-xl hover:bg-indigo-700 transition transform active:scale-95 flex justify-center items-center gap-2 mb-6"
                >
                    <span>🎮</span> {t('read.btn_start')}
                </button>

                {/* 4. 전체 가사 */}
                <div className="text-lg leading-loose text-gray-800 whitespace-pre-wrap font-medium mb-4 border-t pt-4 mt-2">
                    {song.lyrics_content}
                </div>

                {/* 5. [광고 1] 중간 삽입 (가사 끝난 후) */}
                <AdBanner
                    slot={AD_CONFIG.SLOTS.READ_MIDDLE}
                    format="horizontal"
                    className="my-4"
                />

                {/* 6. 유튜브 영상 */}
                {song.youtube_url && getYouTubeID(song.youtube_url) && (
                    <div className="mt-4 aspect-video rounded-lg overflow-hidden bg-black shadow-md">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${getYouTubeID(song.youtube_url)}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

            </div>

            {/* 7. [광고 2] 하단 삽입 */}
            <div className="w-full max-w-2xl mt-6">
                <AdBanner slot={AD_CONFIG.SLOTS.READ_BOTTOM} className="my-4" />
            </div>
        </div>
    );
}