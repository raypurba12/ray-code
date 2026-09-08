import { useEffect, useRef, useState } from 'react';

/**
 * Types out lines of code character-by-character, like a live terminal.
 * Respects prefers-reduced-motion by rendering instantly.
 */
export function useTypedCode(lines: string[], speedMs = 26, lineDelayMs = 320) {
    const [output, setOutput] = useState<string[]>(() => lines.map(() => ''));
    const [done, setDone] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const snapshot = useRef<string[]>(lines.map(() => ''));

    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            setOutput(lines);
            setDone(true);
            return;
        }

        let lineIndex = 0;
        let charIndex = 0;

        const step = () => {
            const current = lines[lineIndex];
            if (charIndex <= current.length) {
                snapshot.current[lineIndex] = current.slice(0, charIndex);
                setOutput([...snapshot.current]);
                charIndex++;
                timer.current = setTimeout(step, speedMs + Math.random() * 22);
            } else if (lineIndex < lines.length - 1) {
                lineIndex++;
                charIndex = 0;
                timer.current = setTimeout(step, lineDelayMs);
            } else {
                setDone(true);
            }
        };

        timer.current = setTimeout(step, 450);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [lines, speedMs, lineDelayMs]);

    return { output, done };
}
