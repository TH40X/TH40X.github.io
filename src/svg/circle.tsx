interface Props {
    x: number;
    y: number;
    size: number;
    color: string;
    stroke?: string;
}

export const SvgCircle: React.FC<Props> = ({ x, y, size, color, stroke }) => {
    return (
        <svg
            width={size}
            height={size}
            style={{
                position: "absolute",
                top: `${y - size / 2}px`,
                left: `${x - size / 2}px`,
                pointerEvents: 'none',
                zIndex: 9998,
                transformOrigin: "50% 50%",
            }}
        >
            <circle
                key={size}
                r={size / 2}
                fill={color}
                transform={`translate(${size / 2}, ${size / 2})`}
                stroke={stroke ?? ""}
            />
        </svg>
    )
}