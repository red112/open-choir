import { useEffect } from 'react';
import { AD_CONFIG } from '../adConfig'; // [NEW] 설정 파일 import

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

interface AdBannerProps {
    className?: string;
    slot: string; // 슬롯 ID만 받으면 됨
    format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
}

export default function AdBanner({ className = "", slot, format = 'auto' }: AdBannerProps) {
    useEffect(() => {
        try {
            if (import.meta.env.PROD && window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            console.error("AdSense Error", e);
        }
    }, []);

    return (
        <div className={`w-full text-center my-6 ${className}`}>
            {import.meta.env.DEV ? (
                <div className="bg-gray-100 p-4 rounded text-xs text-gray-400 border border-dashed border-gray-300 mx-auto max-w-md">
                    광고 영역<br />(Slot: {slot})
                </div>
            ) : (
                <ins className="adsbygoogle block"
                    data-ad-client={AD_CONFIG.CLIENT_ID} // [수정] 설정 파일에서 가져옴
                    data-ad-slot={slot}
                    data-ad-format={format}
                    data-full-width-responsive="true"></ins>
            )}
        </div>
    );
}