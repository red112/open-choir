import { useEffect } from 'react';

// 구글 애드센스용 타입 정의
declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

interface AdBannerProps {
    className?: string;
}

export default function AdBanner({ className = "" }: AdBannerProps) {
    useEffect(() => {
        // 실제 광고 스크립트가 로드된 후에만 실행 (에러 방지)
        try {
            if (window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            console.error("AdSense Error", e);
        }
    }, []);

    return (
        <div className={`w-full text-center my-4 ${className}`}>
            <ins className="adsbygoogle block"
                data-ad-client="ca-pub-3527723699056757"
                data-ad-slot="2762733359"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>
    );
}