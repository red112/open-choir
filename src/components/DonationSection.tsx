import { useTranslation } from 'react-i18next';

export default function DonationSection() {
    const { t } = useTranslation();
    const bmcLink = "https://www.buymeacoffee.com/singbyhearts";

    return (
        <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200 shadow-sm animate-fade-in-up text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2 whitespace-pre-wrap">
                {t('game.score_high_title')}
            </h3>
            <p className="text-sm text-gray-600 mb-6 whitespace-pre-wrap leading-relaxed">
                {t('game.score_high_desc')}
            </p>

            <a
                href={bmcLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-[#FFDD00] text-gray-900 rounded-full font-bold shadow-md transition-transform hover:scale-105 active:scale-95 border-2 border-[#FFDD00] hover:border-yellow-400 justify-center w-full sm:w-auto"
            >
                <span className="text-2xl group-hover:rotate-12 transition-transform">🍬</span>
                <span>{t('donation.btn_result')}</span>

                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </a>

            <p className="text-xs text-gray-400 mt-3">
                {t('donation.bmc_desc')}
            </p>
        </div>
    );
}