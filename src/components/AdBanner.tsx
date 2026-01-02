import { useEffect } from 'react';
import { AD_CONFIG } from '../adConfig';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

interface AdBannerProps {
    className?: string;
    slot: string;
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
        // [수정] 기본 margin 제거 (className으로 제어)
        <div className={`w-full text-center ${className}`}>
            {import.meta.env.DEV ? (
                // [수정] 개발용 박스 높이를 내용물에 맞춤 (너무 크지 않게)
                <div className="bg-gray-100 p-2 rounded text-xs text-gray-400 border border-dashed border-gray-300 mx-auto max-w-md">
                    광고 ({format})<br />Slot: {slot}
                </div>
            ) : (
                <ins className="adsbygoogle block"
                    data-ad-client={AD_CONFIG.CLIENT_ID}
                    data-ad-slot={slot}
                    data-ad-format={format}
                    data-full-width-responsive="true"></ins>
            )}
        </div>
    );
}