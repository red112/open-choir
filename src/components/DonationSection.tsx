import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DonationSection() {
    const { t } = useTranslation();
    const [showToss, setShowToss] = useState(false); // 토스 QR 보임 여부 상태
    const bmcLink = "https://www.buymeacoffee.com/singbyhearts";

    return (
        <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200 shadow-sm animate-fade-in-up text-center transition-all duration-300">

            {/* 1. 칭찬 문구 */}
            <h3 className="text-lg font-bold text-gray-800 mb-2 whitespace-pre-wrap">
                {t('game.score_high_title')}
            </h3>
            <p className="text-sm text-gray-600 mb-6 whitespace-pre-wrap leading-relaxed">
                {t('game.score_high_desc')}
            </p>

            {/* 2. BMC 버튼 (메인) */}
            <a
                href={bmcLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-[#FFDD00] text-gray-900 rounded-full font-bold shadow-md transition-transform hover:scale-105 active:scale-95 border-2 border-[#FFDD00] hover:border-yellow-400 justify-center w-full sm:w-auto"
            >
                <span className="text-2xl group-hover:rotate-12 transition-transform">🍬</span>
                <span>{t('donation.btn_result')}</span>

                {/* 반짝이는 효과 */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </a>

            <p className="text-xs text-gray-400 mt-2 mb-6">
                {t('donation.bmc_desc')}
            </p>

            {/* 3. 구분선 */}
            <div className="border-t border-yellow-200 w-full my-4"></div>

            {/* 4. 토스 QR 토글 버튼 (서브) */}
            <button
                onClick={() => setShowToss(!showToss)}
                className="text-xs text-gray-500 hover:text-indigo-600 underline flex items-center justify-center w-full gap-1 transition-colors"
            >
                {showToss ? '▲ QR코드 접기' : `▼ ${t('donation.toss_btn')}`}
            </button>

            {/* 5. 토스 QR 이미지 영역 (선택 시 열림) */}
            {showToss && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 flex flex-col items-center animate-fade-in shadow-inner">
                    <img
                        src="/toss_qr.png"
                        alt="Toss QR Code"
                        className="w-32 h-32 object-contain mb-2"
                    />
                    <p className="text-xs text-gray-400">{t('donation.toss_guide')}</p>
                </div>
            )}
        </div>
    );
}