import { useCallback, useEffect, useState } from "react";
import { SvgCircle } from "../svg/circle";
import { SvgGlider } from "../svg/glider";

export const GliderFollower: React.FC<{ gliderSize: number }> = ({ gliderSize }) => {
    const [mousePosition, setMousePosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [svgPosition, setSvgPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [lastMouseEvent, setLastMouseEvent] = useState<MouseEvent | null>(null);
    const [currentAngle, setCurrentAngle] = useState(180);
    const [pathPositions, setPathPositions] = useState<({ x1: number; y1: number; x2: number; y2: number } | undefined)[]>([]);

    const smoothingSpeed = 0.02;
    const smoothingAngle = 0.04;
    let animationFrameId: number;

    const normalizeAngle = (angle: number) => {
        if (angle > 180) {
            angle -= 360;
        } else if (angle < -180) {
            angle += 360;
        }

        return angle;
    }

    const updatePosition = () => {
        const diffX = mousePosition.x - svgPosition.x;
        const diffY = mousePosition.y - svgPosition.y;

        const targetAngle = Math.atan2(diffY, diffX) * (180 / Math.PI);
        const angleDiff = normalizeAngle(targetAngle - currentAngle);

        const newAngle = normalizeAngle(currentAngle + angleDiff * smoothingAngle);
        setCurrentAngle(newAngle);

        const distance = Math.sqrt(diffX * diffX + diffY * diffY);

        if (distance > 25) {
            const speed = smoothingSpeed * (distance - 20);

            const angleRad = (newAngle) * (Math.PI / 180);
            const moveX = Math.cos(angleRad) * speed;
            const moveY = Math.sin(angleRad) * speed;

            const newX = svgPosition.x + moveX;
            const newY = svgPosition.y + moveY;
            setSvgPosition({ x: newX, y: newY });


            const rightWingYLocal = displayWidth * .47;
            const rightWingXLocal = displayHeight * -.6;

            const rightWingOffsetX = rightWingXLocal * Math.cos(angleRad) - rightWingYLocal * Math.sin(angleRad);
            const rightWingOffsetY = rightWingXLocal * Math.sin(angleRad) + rightWingYLocal * Math.cos(angleRad);

            const rightWingGlobalX = newX + rightWingOffsetX;
            const rightWingGlobalY = newY + rightWingOffsetY;

            const leftWingYLocal = displayWidth * -.47;
            const leftWingXLocal = displayHeight * -.6;

            const leftWingOffsetX = leftWingXLocal * Math.cos(angleRad) - leftWingYLocal * Math.sin(angleRad);
            const leftWingOffsetY = leftWingXLocal * Math.sin(angleRad) + leftWingYLocal * Math.cos(angleRad);

            const leftWingGlobalX = newX + leftWingOffsetX;
            const leftWingGlobalY = newY + leftWingOffsetY;

            if (speed > 2) {
                setPathPositions(prevPositions => {
                    const newPositions = [...prevPositions, { x1: rightWingGlobalX, y1: rightWingGlobalY, x2: leftWingGlobalX, y2: leftWingGlobalY }];
                    if (newPositions.length > 20) {
                        newPositions.shift();
                    }
                    return newPositions;
                });
            } else {
                setPathPositions(prevPositions => {
                    const newPositions = [...prevPositions];
                    if (newPositions.length > 0) {
                        newPositions.shift();
                    }
                    return newPositions;
                });
            }
        }
    };




    const handleMouseMoveOrScroll = useCallback((event: MouseEvent | Event) => {
        let mouseX, mouseY;

        if (event instanceof MouseEvent) {
            setLastMouseEvent(event);
            mouseX = event.clientX;
            mouseY = event.clientY;
        } else {
            if (lastMouseEvent) {
                mouseX = lastMouseEvent.clientX;
                mouseY = lastMouseEvent.clientY;
            } else {
                mouseX = 0;
                mouseY = 0;
            }
        }

        const targetX = mouseX + window.scrollX
        const targetY = mouseY + window.scrollY

        setMousePosition({ x: targetX, y: targetY });
    }, [lastMouseEvent])

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMoveOrScroll);
        window.addEventListener('scroll', handleMouseMoveOrScroll);
        animationFrameId = requestAnimationFrame(updatePosition);

        return () => {
            document.removeEventListener('mousemove', handleMouseMoveOrScroll);
            window.removeEventListener('scroll', handleMouseMoveOrScroll);
            cancelAnimationFrame(animationFrameId);
        };
    }, [svgPosition, mousePosition, pathPositions]);

    const width = 510;
    const height = 236;

    const displayWidth = gliderSize;
    const displayHeight = displayWidth * (height / width);

    return (
        <>
            {pathPositions.map((position, index) => {
                const size = index / 4
                if (position === undefined) {
                    return null
                } else {
                    return (
                        <>
                            <SvgCircle x={position.x1} y={position.y1} size={size} color="white" stroke="#001529" />

                            <SvgCircle x={position.x2} y={position.y2} size={size} color="white" stroke="#001529" />
                        </>
                    )
                }
            })}

            <SvgGlider x={svgPosition.x} y={svgPosition.y} angle={currentAngle} size={displayWidth} color="white" stroke="#001529" />
        </>
    );
}