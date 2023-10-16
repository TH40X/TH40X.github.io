
import { UploadOutlined } from '@ant-design/icons';
import { Button, Cascader, Col, Row, Typography } from "antd";
import { DefaultOptionType } from "antd/es/select";
import React, { useEffect, useState } from "react";
import { CartesianGrid, ComposedChart, Label, Legend, Line, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import { GlidersDataIndex } from "../App";
import { loadGlidersDataForChart, transformDataToOptions } from "../utils/glidersData";
import { polynomialInterpolation } from "../utils/maths";
import { calculateAngleDifference, calculateDirection2, gpsDistance, parseLatitude, parseLongitude } from '../utils/spacial';
import { timeToSeconds } from "../utils/time";
import { useWindowWidth } from '../hooks/window-width';


const thermalMargin = 20
const varioBuffer = 30

interface FlightSegment {
    type: string;
    data: FlightSingleData[];
}

export interface FlightSingleData {
    time: number;
    lat: number;
    lon: number;
    fixValidity: string;
    pressAlt: number;
    gnssAlt: number;
}

export interface SpeedAndVario {
    speed: number; // en km/h
    vario: number; // en mètres par seconde
};

interface SpiralInfo {
    startTime: number;
    center: { lat: number, lon: number };
    minSpeed: number;
    maxSpeed: number;
}

interface WindInfo {
    timestamp: number;
    windDirection: number;
    windSpeed: number;
}

export function createWindInterpolator(windData: WindInfo[]) {
    return function interpolateWind(targetSeconds: number): WindInfo | null {
        const sortedWindData = [...windData].sort((a, b) => a.timestamp - b.timestamp);

        let before: WindInfo | null = null;
        let after: WindInfo | null = null;

        for (let i = 0; i < sortedWindData.length; i++) {
            const currentSeconds = sortedWindData[i].timestamp;
            if (currentSeconds <= targetSeconds) {
                before = sortedWindData[i];
            }
            if (currentSeconds >= targetSeconds) {
                after = sortedWindData[i];
                break;
            }
        }

        // Si on a des données avant et après, on interpole
        if (before && after) {
            const t = (targetSeconds - before.timestamp) / (after.timestamp - before.timestamp);
            const interpolatedWindSpeed = before.windSpeed + t * (after.windSpeed - before.windSpeed);
            const interpolatedWindDirection = before.windDirection + t * (after.windDirection - before.windDirection);

            return {
                timestamp: targetSeconds,
                windSpeed: interpolatedWindSpeed,
                windDirection: interpolatedWindDirection,
            };
        }

        // Si on a seulement un point de donnée avant ou après, on utilise celui-ci
        return before ?? after;
    };
}


function calculateWindDeviation(phases: FlightSegment[]): WindInfo[] {
    const windInfos: WindInfo[] = [];

    const spiralPhases = phases.filter(phase => phase.type === "spiral");

    spiralPhases.forEach(spiralPhase => {
        const spiralData = calculateSpiralsForSinglePhase(spiralPhase);

        if (spiralData.length < 2) return;

        const firstSpiral = spiralData[0];
        const lastSpiral = spiralData[spiralData.length - 1];

        const windDirection = calculateDirection2(firstSpiral.center, lastSpiral.center)

        const distance = gpsDistance(firstSpiral.center.lat, firstSpiral.center.lon, lastSpiral.center.lat, lastSpiral.center.lon);
        const timeDiff = lastSpiral.startTime - firstSpiral.startTime;

        const windSpeed = distance / timeDiff * 3.6;

        const avgMinSpeed = spiralData.reduce((acc, point) => acc + point.minSpeed, 0) / spiralData.length;
        const avgMaxSpeed = spiralData.reduce((acc, point) => acc + point.maxSpeed, 0) / spiralData.length;
        const windFromDeltaSpeed = (avgMaxSpeed - avgMinSpeed) / 2;

        const meanWindSpeed = (windSpeed + windFromDeltaSpeed) / 2;

        const middleTime = firstSpiral.startTime + (timeDiff / 2);

        windInfos.push({
            timestamp: middleTime,
            windDirection,
            windSpeed: meanWindSpeed,
        });
    });

    return windInfos;
}



function calculateSpiralsForSinglePhase(spiralPhase: FlightSegment): SpiralInfo[] {
    const spirals: SpiralInfo[] = [];

    let totalAngle = 0;
    let currentSpiral: FlightSingleData[] = [];
    let minSpeed = Infinity;
    let maxSpeed = -Infinity;

    const { data } = spiralPhase;

    if (data.length < 3) return [];

    for (let i = 0; i < data.length - 2; i++) {
        const angleDiff = calculateAngleDifference(data[i], data[i + 1], data[i + 2]);
        totalAngle += angleDiff;
        currentSpiral.push(data[i]);

        // Calcul de la vitesse (vous pouvez remplacer ceci par une propriété de vitesse si disponible)
        const speed = gpsDistance(data[i].lat, data[i].lon, data[i + 1].lat, data[i + 1].lon) /
            (data[i + 1].time - data[i].time) * 3.6;
        minSpeed = Math.min(minSpeed, speed);
        maxSpeed = Math.max(maxSpeed, speed);

        if (Math.abs(totalAngle) >= 2 * Math.PI) {
            const centerLat = currentSpiral.reduce((acc, point) => acc + point.lat, 0) / currentSpiral.length;
            const centerLon = currentSpiral.reduce((acc, point) => acc + point.lon, 0) / currentSpiral.length;

            spirals.push({
                startTime: currentSpiral[0].time,
                center: { lat: centerLat, lon: centerLon },
                minSpeed,
                maxSpeed
            });

            // Réinitialiser pour la prochaine spirale
            currentSpiral = [];
            totalAngle = 0;
            minSpeed = Infinity;
            maxSpeed = -Infinity;
        }
    };

    return spirals;
}

function detectFlightPhases(flightData: FlightSingleData[]): FlightSegment[] {
    const thresholdIn = 1.5 * Math.PI;
    const thresholdOut = 0.5 * Math.PI;
    const maxDurationForTurn = 30;
    const phases: { type: string, data: FlightSingleData[] }[] = [];

    const angleDeltas: number[] = [];
    for (let k = 1; k < flightData.length - 1; k++) {
        angleDeltas.push(calculateAngleDifference(flightData[k - 1], flightData[k], flightData[k + 1]));
    }

    let i = 0
    let j = 1;
    let inThermal = false;
    let delta = angleDeltas[i];
    let currentData: FlightSingleData[] = [];

    while (j < flightData.length - 1) {
        while (j < flightData.length - 1 && (flightData[j].time - flightData[i].time) <= maxDurationForTurn) {
            // tant que la durée entre le point i et le point j est inférieure à 30 secondes, on continue à ajouter des points
            delta += angleDeltas[j];
            currentData.push(flightData[j]);
            j++;
        }

        // ici, l'écart entre i et j est supérieur à 30 secondes

        const absoluteDelta = Math.abs(delta);
        if (absoluteDelta > thresholdIn && !inThermal) {
            // si le delta est supérieur à 1.5 * PI, on considère que le planeur est dans une thermique
            if (currentData.length > 0) {
                phases.push({
                    type: 'transition',
                    data: currentData
                });
            }
            currentData = [];
            inThermal = true;

        } else if (absoluteDelta < thresholdOut && inThermal) {
            phases.push({
                type: 'spiral',
                data: currentData
            });
            currentData = [];
            inThermal = false;
        }

        while (i < j && (flightData[j].time - flightData[i].time) > maxDurationForTurn) {
            delta -= angleDeltas[i];
            i++;
        }
    }

    // Gérer les points restants
    if (currentData.length > 0) {
        phases.push({
            type: inThermal ? 'spiral' : 'transition',
            data: currentData
        });
    }

    // renvoies les phases sans la premiere :
    return phases.slice(1)
}

function computeSpeedAndVario(data: FlightSegment[], N: number, wind: ((targetSeconds: number) => WindInfo | null) | null): SpeedAndVario[] {
    const result: SpeedAndVario[] = [];

    data.filter(segment => segment.type === "transition").map(segment => segment.data).forEach(data => {
        const startTime = data[0].time + thermalMargin;
        const endTime = data[data.length - 1].time - thermalMargin;

        const filteredData = data.filter(point => {
            const pointTime = point.time;
            return pointTime >= startTime && pointTime <= endTime;
        });

        for (let i = 1; i < filteredData.length; i++) {
            const start = Math.max(0, i - N); data
            const end = Math.min(filteredData.length - 1, i + N);

            let cumulativeDistance = 0;
            let cumulativeTime = 0;

            for (let j = start; j < end; j++) {
                const prev = filteredData[j];
                const current = filteredData[j + 1];

                // Calcul de la distance entre deux points
                const distance = gpsDistance(prev.lat, prev.lon, current.lat, current.lon);

                cumulativeDistance += distance;
                cumulativeTime += current.time - prev.time;
            }

            // Vitesse moyenne lissée
            const speed = cumulativeDistance / cumulativeTime * 3.6;

            // Calcul du vario lissé
            const altDiff = filteredData[end].gnssAlt - filteredData[start].gnssAlt;
            const vario = altDiff / (cumulativeTime);

            const glideDirection = Math.atan2(filteredData[i].lat - filteredData[i - 1].lat, filteredData[i].lon - filteredData[i - 1].lon);

            // Obtenir l'info sur le vent
            const windInfo = wind ? wind(filteredData[i].time) : null

            if (windInfo) {
                const windDirectionRad = windInfo.windDirection; // Convertir en radians
                const theta = windDirectionRad - glideDirection;

                // Calcul de la composante du vent parallèle à la direction du planeur
                const windParallelComponent = windInfo.windSpeed * Math.cos(theta);

                // Ajout de cette composante à la vitesse du planeur
                const speedWithWind = speed - windParallelComponent;

                result.push({ speed: Math.round(speedWithWind), vario });
            } else {
                result.push({ speed: Math.round(speed), vario });
            }
        }
    });

    return result;
}

function gliderPolar(gliderData: { speed: number, [key: string]: number }[], gliderName: string): { speed: number, gliderPolar: number }[] {

    const result: { speed: number, gliderPolar: number }[] = gliderData.map(
        polar => ({ speed: polar.speed, gliderPolar: polar[gliderName] })
    )

    return result
}

function averageVarioForSpeed(data: SpeedAndVario[],): SpeedAndVario[] {
    const speedGroups: { [key: number]: number[] } = {};

    // Grouper les données par vitesse
    data.forEach(item => {
        if (!speedGroups[item.speed]) {
            speedGroups[item.speed] = [];
        }
        speedGroups[item.speed].push(item.vario);
    });

    // Calculer le vario moyen pour chaque vitesse
    const result: { speed: number, vario: number }[] = Object.keys(speedGroups).map(speed => {
        const variometers = speedGroups[Number(speed)];
        const averageVario = variometers.reduce((sum, vario) => sum + vario, 0) / variometers.length;
        return {
            speed: Number(speed),
            vario: averageVario
        };
    });

    return result;
}

const filter = (inputValue: string, path: DefaultOptionType[]) => {
    return path.some(
        (option) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
    );
}

const getInterpolatedPolar = (data: { speed: number, vario: number }[]) => {
    const minSpeed = Math.min(...data.map(d => d.speed));
    const maxSpeed = Math.max(...data.map(d => d.speed));

    const polarInterpolator = polynomialInterpolation(data)

    const interpolatedData: { speed: number, interpolatedPolar: number }[] = [];

    for (let speed = minSpeed; speed <= maxSpeed; speed++) {
        const interpolatedPolar = polarInterpolator(speed);
        interpolatedData.push({ speed, interpolatedPolar });
    }

    return interpolatedData;
}

const mergeData = (interpolatedData: { speed: number, interpolatedPolar: number }[], gliderPolarData: { speed: number, gliderPolar: number }[], data: { speed: number, vario: number }[]) => {
    const mergedData: { speed: number, vario?: number, gliderPolar?: number, interpolatedPolar?: number }[] = [];

    let speed = Math.min(interpolatedData[0]?.speed ?? 0, gliderPolarData[0]?.speed ?? 0);
    const maxSpeed = Math.max(interpolatedData[interpolatedData.length - 1]?.speed ?? 0, gliderPolarData[gliderPolarData.length - 1]?.speed ?? 0);

    for (speed; speed <= maxSpeed; speed++) {
        const interpolatedPolar = interpolatedData.find(d => d.speed === speed)?.interpolatedPolar ?? undefined;
        const gliderPolar = gliderPolarData.find(d => d.speed === speed)?.gliderPolar ?? undefined;
        const vario = data.find(d => d.speed === speed)?.vario ?? undefined;

        mergedData.push({ speed, vario, gliderPolar, interpolatedPolar })
    }

    return mergedData;
}

function removeTakeoffLanding(data: FlightSingleData[]): FlightSingleData[] {
    // tant que la vitesse est inférieure à 20 m/s, on considère que le planeur est au sol
    let i = 0;
    while (gpsDistance(data[i].lat, data[i].lon, data[i + 1].lat, data[i + 1].lon) / (data[i + 1].time - data[i].time) < 20) {
        i++;
    }

    let j = data.length - 1;
    while (gpsDistance(data[j].lat, data[j].lon, data[j - 1].lat, data[j - 1].lon) / (data[j].time - data[j - 1].time) < 20) {
        j--;
    }

    return data.slice(i, j);
}

const renderSmallDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.vario !== null && payload.vario !== undefined) {
        return <circle cx={cx} cy={cy} r={2} />;
    } else {
        return <></>
    }
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: 'white', padding: '5px', border: '1px solid black' }}>
                <p style={{ margin: 0, lineHeight: 0, textAlign: "center" }}><Typography.Text strong>{`${label} km/h`}</Typography.Text></p>
                {payload.map((entry: any) => {
                    if (entry.name === "Vol") {
                        return
                    }
                    return (
                        <div key={entry.name}>
                            <p style={{ margin: 0, lineHeight: 1.2, color: entry.color }} key={entry.name}>{`${entry.name} : ${entry.value.toFixed(2)} m/s`}</p>
                            <p style={{ margin: 0, color: entry.color }} key={entry.name}>{`L/D : ${((Number(label) / 3.6) / -Number(entry.value)).toFixed(1)}`}</p>
                        </div>
                    )
                })}
            </div>
        );
    }

    return null;
};

export const FlightAnalysisPage: React.FC<{ glidersData: GlidersDataIndex }> = ({ glidersData }) => {
    const { isWideScreen } = useWindowWidth()
    const [flightData, setFlightData] = useState<SpeedAndVario[]>([]);
    const [graphData, setGraphData] = useState<{ speed: number, vario?: number, gliderPolar?: number, interpolatedPolar?: number }[]>([]);
    const [gliderName, setGliderName] = useState<string>("");
    const [file, setFile] = useState<any | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const options = React.useCallback(() => {
        return transformDataToOptions(glidersData);
    }, [glidersData]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const reader = new FileReader();

        const files = e.target.files;
        if (files && files.length > 0) {
            const selectedFile = files[0];
            reader.onload = e => {
                if (typeof e.target?.result === 'string') {
                    handleFileRead(e.target.result);
                }
            };
            reader.readAsText(selectedFile);
            setFile(file);
        }
    };

    const handleFileRead = (content: string) => {
        const lines = content.split('\n');
        const newFlightData: FlightSingleData[] = [];

        lines.forEach(line => {
            if (line.startsWith('B')) {
                const time = timeToSeconds(line.slice(1, 7));
                const lat = parseLatitude(line.slice(7, 15));
                const lon = parseLongitude(line.slice(15, 24));
                const fixValidity = line[24];
                const pressAlt = parseInt(line.slice(25, 30), 10);
                const gnssAlt = parseInt(line.slice(30, 35), 10);

                newFlightData.push({ time, lat, lon, fixValidity, pressAlt, gnssAlt });
            }
        });

        const flightWithoutTakeoffLanding = removeTakeoffLanding(newFlightData);
        const flightSegments = detectFlightPhases(flightWithoutTakeoffLanding)
        const wind = calculateWindDeviation(flightSegments);
        const interpolateWind = createWindInterpolator(wind);

        const speedAndVario = computeSpeedAndVario(flightSegments, varioBuffer, interpolateWind);

        setFlightData(speedAndVario);
    };

    useEffect(() => {
        const gliderData = loadGlidersDataForChart(glidersData, gliderName)
        const gliderPolarData = gliderPolar(gliderData, gliderName)

        const data = averageVarioForSpeed(flightData)

        const dataInterpolatedPolar = getInterpolatedPolar(flightData)

        const mergedData = mergeData(dataInterpolatedPolar, gliderPolarData, data)

        setGraphData(mergedData);
    }, [flightData, gliderName]);

    const handleGliderChange = (gliderName: string) => {
        setGliderName(gliderName);
    };

    const dataMin = Math.floor(Math.min(...graphData.map(d => d.vario ?? -3), ...graphData.map(d => d.gliderPolar ?? -3)))
    const dataMax = 1 //Math.floor(Math.max(...graphData.map(d => d.vario ?? 1), 1))

    const xMax = Math.floor(Math.max(...graphData.map(d => (d.vario || d.gliderPolar) ? d.speed : 200))) + 20

    return (
        <div style={{ padding: isWideScreen ? '0 50px' : "0 10px" }}>
            <Row>
                <Col lg={6} xs={24}>
                    <Typography.Title level={3} style={{ textAlign: "center" }}>Flight Polar Analysis</Typography.Title>
                    <input
                        type="file"
                        id="fileInput"
                        style={{ display: 'none' }}
                        onChange={handleFileInput}
                    />
                    <Button
                        style={{
                            width: '100%',
                            height: '100px',
                            margin: '10px 0',
                            borderWidth: '3px',
                            borderRadius: '15px',
                            backgroundColor: 'inherit',
                            borderStyle: 'dotted',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                        }}
                        onClick={() => document.getElementById('fileInput')?.click()}
                    >
                        <span>
                            <UploadOutlined />
                        </span>
                        <span>
                            {'Import a flight'}
                        </span>
                    </Button>

                    <Cascader
                        style={{ width: "100%", marginBottom: 30, height: 50 }}
                        expandTrigger="hover"
                        options={options()}
                        placeholder="Select glider to display"
                        showSearch={{ filter }}
                        onClear={() => handleGliderChange("")}
                        onChange={(value) => handleGliderChange(String(value[value.length - 1]))}
                        displayRender={(labels) => labels[labels.length - 1]}
                    />

                    <Typography.Paragraph type="secondary" style={{ textAlign: "justify" }}>
                        <Typography.Text type="secondary" underline>Description:</Typography.Text>
                        <br style={{ marginBottom: 7 }} />
                        the following graph shows the glider's average sink rate for each speed. The interpolation curve gives an idea of the flight polar, but often differs greatly from the glider's theoretical polar. Indeed, the tendency is to slow down in rising air mass, and accelerate in falling air mass, so the flight polar is skewed in this way.
                    </Typography.Paragraph>
                </Col>

                <Col lg={18} xs={24}>
                    <ResponsiveContainer width={"100%"} height={isWideScreen ? 700 : 500}>
                        <ComposedChart data={graphData} margin={{ top: 40, right: 10, bottom: 10, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" fill="#fcfbfb" />

                            <Legend width={350} align='right' />

                            <Tooltip content={<CustomTooltip />} />

                            <XAxis
                                type="number"
                                dataKey="speed"
                                orientation='top'
                                domain={[0, xMax]}
                                stroke=''
                                allowDataOverflow
                            >
                                <Label
                                    value={"Speed (km/h)"}
                                    offset={-10}
                                    position="insideTopRight"
                                    fontStyle="italic"
                                    style={{ textAnchor: "end" }}
                                />
                            </XAxis>
                            <YAxis
                                domain={[dataMin, dataMax]}
                                ticks={Array.from({ length: dataMax - dataMin + 1 }, (_, i) => i + dataMin)}
                                allowDataOverflow
                            >
                                <Label
                                    value={"Sink rate (m/s)"}
                                    offset={35}
                                    angle={-90}
                                    position="insideBottomLeft"
                                    fontStyle="italic"
                                    style={{ textAnchor: "start" }}
                                />
                            </YAxis>


                            {
                                graphData.some(item => item.vario !== undefined) &&
                                <Scatter name="Flight data" dataKey="vario" shape={renderSmallDot} />
                            }
                            {
                                graphData.some(item => item.gliderPolar !== undefined) &&
                                <Line type="monotone" name="Selected polar" dataKey="gliderPolar" stroke="#ff7300" dot={false} />
                            }
                            {
                                graphData.some(item => item.interpolatedPolar !== undefined) &&
                                <Line type="monotone" name="Calculated flight polar" dataKey="interpolatedPolar" stroke="#387908" dot={false} />
                            }
                            <ReferenceLine y={0} stroke="grey" />

                        </ComposedChart>
                    </ResponsiveContainer>
                </Col>
            </Row>
        </div>
    );
}