interface Props {
    x: number;
    y: number;
    angle: number;
    size: number;
    color: string;
    stroke?: string;
}

export const SvgGlider: React.FC<Props> = ({ x, y, angle, size, color, stroke }) => {
    const svgPath = "M 0 0 C -4 1 -12 34 -11 68 C -46 68 -150 70 -204 75 C -228 79 -237 81 -253 90 C -255 91 -255 97 -255 103 C -254 95 -253 96 -251 95 C -228 91 -223 92 -204 92 C -25 95 -10 91 -7 96 C -4 114 -4 175 -3 215 C -18 216 -39 219 -39 223 L -39 227 C -23 229 -17 229 -2 229 C -1 229 -1 233 0 236 L 0 236 C 1 233 1 229 2 229 C 17 229 23 229 39 227 L 39 223 C 39 219 18 216 3 215 C 4 175 4 114 7 96 C 10 91 25 95 204 92 C 223 92 228 91 251 95 C 253 96 254 95 255 103 C 255 97 255 91 253 90 C 237 81 228 79 204 75 C 150 70 46 68 11 68 C 12 34 4 1 0 0"
    const width = 510;
    const height = 236;

    const displayWidth = size
    const displayHeight = displayWidth * (height / width);

    return (
        <svg
            width={displayWidth}
            height={displayHeight}
            style={{
                position: 'absolute',
                top: `${y}px`,
                left: `${x - displayWidth / 2}px`,
                pointerEvents: 'none',
                transform: `rotate(${angle + 90}deg)`,
                transformOrigin: "50% 0%",
                zIndex: 9999,
            }}
        >
            <path
                d={svgPath}
                transform={`scale(${displayWidth / width}) translate(${width / 2}, 0)`}
                fill={color}
                stroke={stroke ?? ""}
                strokeWidth={2}
            />
        </svg >
    )
}