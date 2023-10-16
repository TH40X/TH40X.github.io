// Convertir HHMMSS en secondes
export const timeToSeconds = (time: string): number => {
    const hh = parseInt(time.slice(0, 2), 10);
    const mm = parseInt(time.slice(2, 4), 10);
    const ss = parseInt(time.slice(4, 6), 10);
    return hh * 3600 + mm * 60 + ss;
};

export const timeToString = (time: string): string => {
    const hh = parseInt(time.slice(0, 2), 10);
    const mm = parseInt(time.slice(2, 4), 10);
    const ss = parseInt(time.slice(4, 6), 10);
    return `${hh}:${mm}:${ss}`;
}

export const secondsToString = (seconds: number): string => {
    const hh = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mm = Math.floor((seconds - parseInt(hh) * 3600) / 60).toString().padStart(2, '0');
    const ss = (seconds - parseInt(hh) * 3600 - parseInt(mm) * 60).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}