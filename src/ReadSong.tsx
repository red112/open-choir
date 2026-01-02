import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { AD_CONFIG } from './adConfig';
import AdBanner from './components/AdBanner';

export default function ReadSong() {
    const { songId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [song, setSong] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
        fetchSong();
    }, [songId]);

    async function fetchSong() {
        const { data, error } = await supabase
            .from('songs')
            .select('*, profiles(nickname)') // 등록자 닉네임 가져오기
            .eq('song_id', songId)
            .single();

        if (error || !data) {
            alert('Error loading song');
            navigate('/');
        } else {
            setSong(data);
        }
        setLoading(false);
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
                {/* 제목 및 정보 */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{song.title}</h1>
                <div className="flex gap-2 text-sm text-gray-500 mb-6">
                    <span>{t('song.level')}{song.difficulty}</span>
                    <span>•</span>
                    <span>{song.voice_part || 'All Parts'}</span>
                    <span>•</span>
                    <span>{t('read.creator')} {song.profiles?.nickname || 'Unknown'}</span>
                </div>

                {/* [중요] 곡 설명 (Description) - 구글이 좋아하는 콘텐츠 */}
                {song.description && (
                    <div className="bg-indigo-50 p-4 rounded-lg mb-6 text-gray-700 leading-relaxed text-sm">
                        <h3 className="font-bold text-indigo-700 mb-1">{t('read.desc_title')}</h3>
                        <p className="whitespace-pre-wrap">{song.description}</p>
                    </div>
                )}

                {/* 유튜브 영상 (있으면) */}
                {song.youtube_url && (
                    <div className="mb-8 aspect-video rounded-lg overflow-hidden bg-black">
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

                {/* 전체 가사 (Text Content) */}
                <div className="text-lg leading-loose text-gray-800 whitespace-pre-wrap font-medium mb-8 border-t pt-6">
                    {song.lyrics_content}
                </div>

                {/* 게임 시작 버튼 (플로팅 대신 하단 고정) */}
                <button
                    onClick={() => navigate(`/game/${songId}`)}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl shadow-lg font-bold text-xl hover:bg-indigo-700 transition transform active:scale-95 flex justify-center items-center gap-2"
                >
                    <span>🎮</span> {t('read.btn_start')}
                </button>

            </div>

            {/* 하단 광고 (콘텐츠 하단) */}
            <div className="w-full max-w-2xl mt-6">
                <AdBanner slot={AD_CONFIG.SLOTS.READ_BOTTOM} />
            </div>
        </div>
    );
}

// 유튜브 URL에서 ID 추출하는 헬퍼 함수
function getYouTubeID(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}