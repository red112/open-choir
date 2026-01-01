import { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import { useTranslation } from 'react-i18next'; // [추가] import

export default function Piano() {
    const { t } = useTranslation(); // [추가] 훅 사용
    const [isLoaded, setIsLoaded] = useState(false);
    const synthRef = useRef<Tone.PolySynth | null>(null);

    // ... (건반 데이터 및 useEffect 로직은 기존과 동일) ...
    const keys = [
        { note: 'C3', type: 'white' }, { note: 'C#3', type: 'black' },
        // ... 중간 생략 ...
        { note: 'C5', type: 'white' },
    ];

    useEffect(() => {
        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
        }).toDestination();
        synthRef.current = synth;
        setIsLoaded(true);
        return () => { synth.dispose(); };
    }, []);

    const playNote = async (note: string) => {
        await Tone.start();
        if (synthRef.current) {
            synthRef.current.triggerAttackRelease(note, "8n");
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden shadow-2xl relative select-none">
            {/* 상단 안내바 (다국어 적용) */}
            <div className="bg-gray-800 text-gray-400 text-xs text-center py-1">
                {t('piano.rotate_hint')}
            </div>

            {/* 건반 영역 */}
            <div className="flex-1 flex relative">
                {keys.map((k) => {
                    if (k.type === 'white') {
                        return (
                            <button
                                key={k.note}
                                className="flex-1 bg-white border border-gray-300 rounded-b-md active:bg-gray-200 active:scale-[0.98] transition-transform origin-top z-10 flex items-end justify-center pb-2"
                                onMouseDown={() => playNote(k.note)}
                                onTouchStart={(e) => { e.preventDefault(); playNote(k.note); }}
                            >
                                <span className="text-gray-400 text-xs font-semibold">{k.note}</span>
                            </button>
                        );
                    }
                    return null;
                })}

                {/* 검은 건반 위치 및 오버레이 로직 (기존과 동일) */}
                {keys.map((k, idx) => {
                    if (k.type !== 'black') return null;
                    const prevWhiteCount = keys.slice(0, idx).filter(x => x.type === 'white').length;
                    const totalWhite = 15;
                    const leftPercent = (prevWhiteCount * (100 / totalWhite)) - (100 / totalWhite / 2.5);

                    return (
                        <button
                            key={k.note}
                            style={{ left: `${leftPercent}%`, width: `${100 / totalWhite * 0.7}%` }}
                            className="absolute top-0 h-[60%] bg-black rounded-b-md z-20 active:bg-gray-800 border-x border-b border-gray-600"
                            onMouseDown={() => playNote(k.note)}
                            onTouchStart={(e) => { e.preventDefault(); playNote(k.note); }}
                        >
                        </button>
                    )
                })}
            </div>
        </div>
    );
}