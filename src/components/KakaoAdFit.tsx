import { useEffect, useRef } from 'react';

interface KakaoAdFitProps {
    unit: string;   // 광고단위 ID
    width: string;  // 너비 (예: "320")
    height: string; // 높이 (예: "50" 또는 "100")
    disabled?: boolean;
}

export default function KakaoAdFit({ unit, width, height, disabled = false }: KakaoAdFitProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (disabled || !containerRef.current) return;

        const container = containerRef.current;

        // 기존 광고가 있다면 제거 (중복 방지)
        container.innerHTML = '';

        // 1. ins 태그 생성
        const ins = document.createElement('ins');
        ins.className = 'kakao_ad_area';
        ins.style.display = 'none';
        ins.setAttribute('data-ad-unit', unit);
        ins.setAttribute('data-ad-width', width);
        ins.setAttribute('data-ad-height', height);

        // 2. script 태그 생성
        const script = document.createElement('script');
        script.async = true;
        script.type = 'text/javascript';
        script.src = '//t1.daumcdn.net/kas/static/ba.min.js';

        // 3. DOM에 추가
        container.appendChild(ins);
        container.appendChild(script);

    }, [unit, width, height, disabled]);

    if (disabled) return null;

    return <div ref={containerRef} className="flex justify-center my-4" />;
}