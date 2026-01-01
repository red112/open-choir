import { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import { useTranslation } from 'react-i18next';

export default function Piano() {
    const { t } = useTranslation();
    const [isLoaded, setIsLoaded] = useState(false);
    const synthRef = useRef<Tone.PolySynth | null>(null);

    // 건반 데이터 (C3 ~ C5)
    const keys = [
        { note: 'C3', type: 'white' }, { note: 'C#3', type: 'black' },
        { note: 'D3', type: 'white' }, { note: 'D#3', type: 'black' },
        { note: 'E3', type: 'white' },
        { note: 'F3', type: 'white' }, { note: 'F#3', type: 'black' },
        { note: 'G3', type: 'white' }, { note: 'G#3', type: 'black' },
        { note: 'A3', type: 'white' }, { note: 'A#3', type: 'black' },
        { note: 'B3', type: 'white' },
        { note: 'C4', type: 'white' }, { note: 'C#4', type: 'black' },
        { note: 'D4', type: 'white' }, { note: 'D#4', type: 'black' },
        { note: 'E4', type: 'white' },
        { note: 'F4', type: 'white' }, { note: 'F#4', type: 'black' },
        { note: 'G4', type: 'white' }, { note: 'G#4', type: 'black' },
        { note: 'A4', type: 'white' }, { note: 'A#4', type: 'black' },
        { note: 'B4', type: 'white' },
        { note: 'C5', type: 'white' },
    ];

    useEffect(() => {
        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
        }).toDestination();

        synthRef.current = synth;
        setIsLoaded(true);

        return () => {
            synth.dispose();
        };
    }, []);

    const playNote = async (note: string) => {
        await Tone.start();
        if (synthRef.current) {
            // 8n 길이만큼 소리 재생 (짧게 끊어침)
            synthRef.current.triggerAttackRelease(note, "8n");
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden shadow-2xl relative select-none">
            {/* 안내바 */}
            <div className="bg-gray-800 text-gray-400 text-xs text-center py-1 shrink-0">
                {t('piano.rotate_hint')}
            </div>

            {/* 건반 영역 (남은 높이 100% 차지) */}
            <div className="flex-1 flex relative" style={{ touchAction: 'none' }}>

                {!isLoaded ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white z-50">
                        Loading...
                    </div>
                ) : (
                    <>
                        {/* 흰 건반 */}
                        {keys.map((k) => {
                            if (k.type === 'white') {
                                return (
                                    <button
                                        key={k.note}
                                        // h-full로 높이 꽉 채움, active 시 색상 변경
                                        className="flex-1 h-full bg-white border-r border-b border-gray-300 rounded-b-sm active:bg-gray-200 transition-colors z-10 flex items-end justify-center pb-4"
                                        // [수정] onPointerDown 하나로 통일 (모바일/PC 모두 대응)
                                        onPointerDown={(e) => {
                                            e.preventDefault(); // 텍스트 선택 등 기본 동작 방지
                                            playNote(k.note);
                                        }}
                                    >
                                        <span className="text-gray-400 text-xs font-semibold select-none">{k.note}</span>
                                    </button>
                                );
                            }
                            return null;
                        })}

                        {/* 검은 건반 오버레이 */}
                        {keys.map((k, idx) => {
                            if (k.type !== 'black') return null;

                            // 흰 건반 갯수 기반 위치 계산
                            const prevWhiteCount = keys.slice(0, idx).filter(x => x.type === 'white').length;
                            const totalWhite = 15;
                            // 위치 미세 조정
                            const leftPercent = (prevWhiteCount * (100 / totalWhite)) - (100 / totalWhite / 2);

                            return (
                                <button
                                    key={k.note}
                                    // top-0 부터 높이 60%까지 차지
                                    style={{ left: `${leftPercent}%`, width: `${100 / totalWhite * 0.6}%` }}
                                    className="absolute top-0 h-[60%] bg-black rounded-b-md z-20 active:bg-gray-700 border-x border-b border-gray-800 shadow-md"
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        playNote(k.note);
                                    }}
                                >
                                </button>
                            )
                        })}
                    </>
                )}
            </div>
        </div>
    );
}