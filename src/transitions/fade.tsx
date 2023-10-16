import React, { useState, useEffect, ReactNode, useRef } from 'react';
import '../styles/fade.css';

interface FadeInFadeOutProps {
    children: ReactNode;
}

const FadeInFadeOut: React.FC<FadeInFadeOutProps> = ({ children }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            {
                threshold: 0.4,
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`fade ${isVisible ? 'fade-in' : 'fade-out'}`}
        >
            {children}
        </div>
    );
};

export default FadeInFadeOut;
