import { useCallback, useEffect, useRef, useState } from 'react';
import { transcribe, aiErrorMessage } from '../../ai/aiClient';

// Dictée vocale : MediaRecorder → proxy → Whisper (Groq). 60 s max par prise.
const MAX_SECONDS = 60;

export const dictationSupported = () => (
    typeof window !== 'undefined' && !!window.MediaRecorder && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
);

export default function useDictation(onText) {
    const [state, setState] = useState('idle'); // idle | recording | transcribing
    const [error, setError] = useState('');
    const recorderRef = useRef(null);
    const timerRef = useRef(null);
    const onTextRef = useRef(onText);
    onTextRef.current = onText;

    const cleanup = () => {
        clearTimeout(timerRef.current);
        const rec = recorderRef.current;
        if (rec && rec.stream) rec.stream.getTracks().forEach((t) => t.stop());
        recorderRef.current = null;
    };

    useEffect(() => cleanup, []);

    const stop = useCallback(() => {
        const rec = recorderRef.current;
        if (rec && rec.state !== 'inactive') rec.stop();
    }, []);

    const start = useCallback(async () => {
        setError('');
        if (!dictationSupported()) {
            setError("La dictée n'est pas prise en charge par ce navigateur.");
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((m) => window.MediaRecorder.isTypeSupported(m));
            const rec = new window.MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
            const chunks = [];
            rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
            rec.onstop = async () => {
                const type = rec.mimeType || mime || 'audio/webm';
                cleanup();
                const blob = new Blob(chunks, { type });
                if (blob.size < 1200) { setState('idle'); return; } // clic trop bref
                setState('transcribing');
                try {
                    const text = await transcribe(blob);
                    if (text) onTextRef.current(text);
                    else setError("Je n'ai rien entendu. Réessayez.");
                } catch (e) {
                    setError(aiErrorMessage(e));
                } finally {
                    setState('idle');
                }
            };
            recorderRef.current = rec;
            rec.start();
            setState('recording');
            timerRef.current = setTimeout(stop, MAX_SECONDS * 1000);
        } catch (e) {
            cleanup();
            setState('idle');
            setError(e && e.name === 'NotAllowedError' ? "Autorisez l'accès au micro pour utiliser la dictée." : 'Micro indisponible.');
        }
    }, [stop]);

    const toggle = useCallback(() => {
        if (state === 'recording') stop();
        else if (state === 'idle') start();
    }, [state, start, stop]);

    return { state, error, toggle, supported: dictationSupported() };
}
