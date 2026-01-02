import { useState, useRef } from 'react'; // useEffect 삭제
import * as Tone from 'tone';
import { useTranslation } from 'react-i18next';

export default function Piano() {
    const { t } = useTranslation();
    // 로딩 상태 변수 삭제 (즉시 반응하도록 변경)
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

    // [수정] 소리 재생 함수 (Lazy Initialization)
    const playNote = async (note: string) => {
        // 1. 브라우저 오디오 컨텍스트 시작 (필수)
        await Tone.start();

        // 2. 악기가 없으면 지금 만든다 (첫 터치 시 생성)
        if (!synthRef.current) {
            synthRef.current = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
            }).toDestination();
        }

        // 3. 소리 재생
        if (synthRef.current) {
            synthRef.current.triggerAttackRelease(note, "8n");
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden shadow-2xl relative select-none">
            <div className="bg-gray-800 text-gray-400 text-xs text-center py-1 shrink-0">
                {t('piano.rotate_hint')}
            </div>

            <div className="flex-1 flex relative" style={{ touchAction: 'none' }}>
                {/* 로딩 화면 삭제 (즉시 보여줌) */}

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
        </div>
    );
}