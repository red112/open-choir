import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
export default function About() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
            {/* 상단 네비게이션 */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-8 py-4">
                <h1 className="text-xl font-bold text-indigo-600 cursor-pointer" onClick={() => navigate('/')}>
                    {t('app.title')} 🎶
                </h1>
                <button onClick={() => navigate('/')} className="text-gray-500 hover:text-indigo-600 font-bold">
                    ✕
                </button>
            </div>

            {/* 본문 콘텐츠 */}
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">

                {/* 히어로 섹션 */}
                <div className="bg-indigo-600 p-10 text-center">
                    <div className="text-6xl mb-4">💖</div>
                    <h2 className="text-2xl font-bold text-white mb-2">{t('about.title')}</h2>
                    <p className="text-indigo-100 opacity-90">{t('about.subtitle')}</p>
                </div>

                <div className="p-8 space-y-10 text-gray-700 leading-relaxed text-lg">

                    {/* 섹션 1 */}
                    <section>
                        <h3 className="text-xl font-bold text-indigo-800 mb-3 flex items-center gap-2">
                            {t('about.sec1_title')}
                        </h3>
                        <p className="text-gray-600">
                            <Trans i18nKey="about.sec1_desc">
                                Text <b className="text-gray-900">Bold</b> Text
                            </Trans>
                        </p>
                    </section>

                    {/* 섹션 2 */}
                    <section className="bg-orange-50 p-6 rounded-xl border-l-4 border-orange-400">
                        <h3 className="text-lg font-bold text-orange-800 mb-2">
                            {t('about.sec2_title')}
                        </h3>
                        <p className="text-sm md:text-base text-gray-700">
                            <Trans i18nKey="about.sec2_desc">
                                Text <b className="text-gray-900">Bold</b> Text <b className="text-orange-700">Color</b>
                            </Trans>
                        </p>
                    </section>

                    {/* 섹션 3 */}
                    <section>
                        <h3 className="text-xl font-bold text-indigo-800 mb-3 flex items-center gap-2">
                            {t('about.sec3_title')}
                        </h3>
                        <p className="text-gray-600">
                            <Trans i18nKey="about.sec3_desc">
                                Text <b className="text-gray-900">Bold</b> Text <b className="text-indigo-600">Color</b>
                            </Trans>
                        </p>
                    </section>

                    {/* 섹션 4 */}
                    <section>
                        <h3 className="text-xl font-bold text-indigo-800 mb-3">
                            {t('about.sec4_title')}
                        </h3>
                        <p className="text-gray-600">
                            <Trans i18nKey="about.sec4_desc">
                                Text <b className="text-indigo-600">Bold</b> Text
                            </Trans>
                        </p>
                    </section>

                </div>

                {/* 하단 배너 */}
                <div className="bg-gray-100 p-8 text-center">
                    <p className="text-gray-500 mb-4 font-medium">{t('about.banner_text')}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-indigo-700 transition"
                    >
                        {t('about.btn_action')}
                    </button>
                </div>
            </div>

            {/* 푸터 */}
            <footer className="mt-12 text-center text-xs text-gray-400 space-y-2 pb-8">
                <p>&copy; 2025 Sing by Hearts. All rights reserved.</p>
                <div className="flex justify-center gap-4">
                    <span onClick={() => navigate('/terms')} className="cursor-pointer hover:underline">Terms</span>
                    <span className="text-gray-300">|</span>
                    <span onClick={() => navigate('/privacy')} className="cursor-pointer hover:underline">Privacy</span>
                </div>
            </footer>
        </div>
    );
}