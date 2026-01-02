import { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import { useTranslation } from 'react-i18next';

export default function Piano() {
    const { t } = useTranslation();
    // [수정] isLoaded 변수를 사용하기 위해 필요한 상태
    const [isLoaded, setIsLoaded] = useState(false);
    const synthRef = useRef<Tone.PolySynth | null>(null);

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
        setIsLoaded(true); // Synth 초기화 완료 시 true로 변경

        return () => {
            synth.dispose();
        };
    }, []);

    const playNote = async (note: string) => {
        await Tone.start();
        if (synthRef.current) {
            synthRef.current.triggerAttackRelease(note, "8n");
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden shadow-2xl relative select-none">
            {/* 안내바 */}
            <div className="bg-gray-800 text-gray-400 text-xs text-center py-1 shrink-0">
                {t('piano.rotate_hint')}
            </div>

            {/* 건반 영역 */}
            {/* [핵심 수정] isLoaded 상태에 따라 로딩 표시/건반 표시 */}
            {isLoaded ? (
                <div className="flex-1 flex relative">
                    {/* 흰 건반 */}
                    {keys.map((k) => {
                        if (k.type === 'white') {
                            return (
                                <button
                                    key={k.note}
                                    className="flex-1 h-full bg-white border-r border-b border-gray-300 rounded-b-sm active:bg-gray-200 transition-colors z-10 flex items-end justify-center pb-4"
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        playNote(k.note);
                                    }}
                                >
                                    <span className="text-gray-400 text-xs font-semibold select-none">{k.note}</span>
                                </button>
                            );
                        }
                        return null;
                    })}

                    {/* 검은 건반 */}
                    {keys.map((k, idx) => {
                        if (k.type !== 'black') return null;
                        const prevWhiteCount = keys.slice(0, idx).filter(x => x.type === 'white').length;
                        const totalWhite = 15;
                        const leftPercent = (prevWhiteCount * (100 / totalWhite)) - (100 / totalWhite / 2);

                        return (
                            <button
                                key={k.note}
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
                </div>
            ) : (
                // [수정] isLoaded가 false일 때만 로딩 메시지 표시
                <div className="absolute inset-0 flex items-center justify-center text-white z-50 text-lg">
                    🎹 Loading...
                </div>
            )}
        </div>
    );
}