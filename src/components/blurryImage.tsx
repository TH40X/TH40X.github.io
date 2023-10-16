import React, { useEffect, useRef } from 'react';

interface Props {
    src: string;
    style?: React.CSSProperties;
}

const BlurryImage: React.FC<Props> = ({ src, style }) => {
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const blurValue = (1 - entry.intersectionRatio) * 5;
                    (entry.target as HTMLElement).style.filter = `blur(${blurValue}px)`;
                });
            },
            {
                threshold: Array.from({ length: 101 }, (_, i) => i * 0.01),
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, []);

    return (
        <img ref={imgRef} src={src} alt="blurry image" style={{ ...style }} />
    );
};

export default BlurryImage;
