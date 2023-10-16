import { Button, Card, Col, Divider, Modal, Popover, Row, Space, Timeline, Typography } from "antd";
import React, { useState } from "react";
import { Area, AreaChart, Bar, BarChart, Label, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GliderData, GlidersDataIndex } from "../App";
import DataDisplay from "../components/dataDisplay";
import { useWindowWidth } from "../hooks/window-width";
import "../styles/infos.css";
import { colors } from "../utils/colors";
import { loadGlidersDataForChart } from "../utils/glidersData";


const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: 'white', padding: '5px', border: '1px solid black' }}>
                <p style={{ margin: 0, lineHeight: 0, textAlign: "center" }}><Typography.Text strong>{`${label} km/h`}</Typography.Text></p>
                {payload.map((entry: any) => {
                    return (
                        <div key={entry.name}>
                            <p style={{ margin: 0, lineHeight: 1.2, color: entry.color }} key={entry.name}>{`Sink : ${entry.value.toFixed(2)} m/s`}</p>
                            <p style={{ margin: 0, color: entry.color }} key={entry.name}>{`L/D : ${((Number(label) / 3.6) / -Number(entry.value)).toFixed(1)}`}</p>
                        </div>
                    )
                })}
            </div>
        );
    }

    return null;
};

const GliderButton: React.FC<{ allGlidersData: GlidersDataIndex, gliderData: GliderData }> = ({ allGlidersData, gliderData }) => {
    const { isWideScreen } = useWindowWidth();
    const [open, setOpen] = useState(false);

    const subGliders = gliderData.gliders as GliderData[]
    const polarChartData = loadGlidersDataForChart(allGlidersData, ...subGliders.map((glider: GliderData) => glider.name)).filter(d => {
        return Object.keys(d).some(key => key !== "speed" && d[key] !== undefined)
    });


    const bins: Record<string, number> = {};
    gliderData.winRate?.forEach((value) => {
        const bin = Math.floor(value / 0.04);
        const binLabel = `${(bin * 0.04).toFixed(2)} - ${(bin * 0.04 + 0.04).toFixed(2)}`;

        bins[binLabel] = bins[binLabel] ? bins[binLabel] + 1 : 1;
    });

    const winRateChartData = Object.entries(bins).map(([key, value]) => ({ name: key, value }));

    const competitonParticipationChartData = gliderData.competitonParticipation ?? [];
    const compatitionParticipationFirstYear = competitonParticipationChartData[0]?.year;
    const compatitionParticipationLastYear = competitonParticipationChartData[competitonParticipationChartData.length - 1]?.year;

    const handleCancel = () => {
        setOpen(false);
    };

    const showModal = () => {
        setOpen(true);
    }

    return (
        <>

            <Button
                style={{ width: "100%" }}
                onClick={showModal}
            >
                {gliderData.name}
            </Button>

            <Modal
                open={open}
                title={gliderData.name}
                footer={null}
                onCancel={handleCancel}
                width={"80%"}
            >
                <Row>
                    <Col span={isWideScreen ? 11 : 24}>
                        <div style={{ display: 'flex', flexDirection: 'column', width: "100%", height: 350 }}>
                            <div style={{ flex: '1 1 0%', minHeight: 150 }}>
                                <ResponsiveContainer width={"100%"}>
                                    <LineChart data={polarChartData} margin={{ left: -20, right: 30 }}>
                                        <Tooltip content={<CustomTooltip />} />
                                        <XAxis
                                            type="number"
                                            dataKey="speed"
                                            orientation='top'
                                            domain={["dataMin - 10", "dataMax + 10"]}
                                            tick={false}
                                        >
                                            <Label
                                                value={"Speed"}
                                                offset={15}
                                                position="insideTopRight"
                                                fontStyle="italic"
                                                style={{ textAnchor: "end" }}
                                            />
                                        </XAxis>
                                        <YAxis tick={false}>
                                            <Label
                                                value={"Sink rate"}
                                                offset={55}
                                                angle={-90}
                                                position="insideBottomLeft"
                                                fontStyle="italic"
                                                style={{ textAnchor: "start" }}
                                            />
                                        </YAxis>

                                        <Legend formatter={(value => value.split("[")[0])} />

                                        {subGliders.map((glider, index) => {
                                            return (
                                                <Line
                                                    key={index}
                                                    connectNulls
                                                    type="monotone"
                                                    dataKey={glider.name}
                                                    dot={false}
                                                    stroke={colors[index % colors.length]}
                                                />
                                            )
                                        }
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <Divider plain><Typography.Text strong>Specifications</Typography.Text></Divider>

                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 15 }}>
                                <DataDisplay text1="Empty mass" text2="340" />
                                <DataDisplay text1="Max mass" text2="500" />
                                <DataDisplay text1="Max water balast" text2="120" />
                                <DataDisplay text1="Wing area" text2="10.5" />
                                <DataDisplay text1="Wingspan" text2="15" />
                            </div>
                        </div>
                    </Col>

                    <Col lg={2} xs={0} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "1px", height: "90%", backgroundColor: "black" }} />
                    </Col>

                    <Col span={isWideScreen ? 11 : 24} style={{ display: "flex" }}>
                        <div style={{ width: "100%", paddingRight: isWideScreen ? 30 : 0, paddingTop: isWideScreen ? 30 : 0, display: "flex", flexDirection: "column" }}>
                            <Typography.Text strong style={{ width: "100%", textAlign: "center", marginBottom: 20 }}>
                                Glider history
                            </Typography.Text>

                            <div style={{ width: "100%", height: "100%" }}>
                                <Timeline
                                    mode="left"
                                    items={gliderData.history?.map(history => (
                                        { label: history.date, children: history.text }
                                    ))}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col span={isWideScreen ? 12 : 0} style={{ display: "flex", justifyContent: "center" }}>
                        <div style={{ width: "90%", height: "1px", backgroundColor: "black" }} />
                    </Col>
                    <Col span={isWideScreen ? 12 : 0} style={{ display: "flex", justifyContent: "center" }}>
                        <div style={{ width: "90%", height: "1px", backgroundColor: "black" }} />
                    </Col>
                </Row>

                <Row>
                    <Col span={isWideScreen ? 11 : 24} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "100%", height: isWideScreen ? 350 : 250, paddingLeft: isWideScreen ? 20 : 0 }}>
                            <div style={{ width: "100%", height: "90%", display: "flex", flexDirection: "column", paddingTop: 10 }}>
                                <Typography.Text strong style={{ width: "100%", textAlign: "center", marginBottom: 10 }}>
                                    Results of this glider in competiton (data from 1999 to 2023)
                                </Typography.Text>

                                <div style={{ flex: '1 1 0%', minHeight: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={winRateChartData}>
                                            <Bar dataKey="value" fill="#8884d8" />
                                            <XAxis tick={false}>
                                                <Label
                                                    fontSize={16}
                                                    value={"⟸ First place"}
                                                    offset={10}
                                                    position="insideBottomLeft"
                                                    fontStyle="italic"
                                                    style={{ textAnchor: "start" }}
                                                />
                                                <Label
                                                    fontSize={16}
                                                    value={"Last place ⟹"}
                                                    offset={10}
                                                    position="insideBottomRight"
                                                    fontStyle="italic"
                                                    style={{ textAnchor: "end" }}
                                                />
                                            </XAxis>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col span={isWideScreen ? 2 : 0} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "1px", height: "90%", backgroundColor: "black" }} />
                    </Col>

                    <Col span={isWideScreen ? 11 : 24} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "100%", height: isWideScreen ? 350 : 250, paddingRight: isWideScreen ? 20 : 0 }}>
                            <div style={{ width: "100%", height: "90%", display: "flex", flexDirection: "column", paddingTop: 10 }}>
                                <Typography.Text strong style={{ width: "100%", textAlign: "center", marginBottom: 10 }}>
                                    Participation of this glider in competitions from 1999 to 2023
                                </Typography.Text>

                                <div style={{ flex: '1 1 0%', minHeight: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={competitonParticipationChartData} margin={{ left: 15, right: 15 }}>
                                            <Tooltip
                                                formatter={(value, _) => [value, "Competitions participation"]}
                                            />
                                            <Area type="monotone" dataKey="value" stackId="1" fill="blue" stroke="blue" />
                                            <XAxis
                                                dataKey="year"
                                                ticks={[compatitionParticipationFirstYear, compatitionParticipationLastYear]}
                                                interval={0}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Modal >
        </>
    )
}

const ManufacturerData: React.FC<{ allGlidersData: GlidersDataIndex, manufacturer: string }> = ({ allGlidersData: glidersData, manufacturer }) => {
    const { isWideScreen } = useWindowWidth();
    const manufacturerDescription = glidersData[manufacturer]?.description;
    const gliderData = glidersData[manufacturer];

    return (
        <>
            <Card title={manufacturer} bordered={false} style={{ minWidth: isWideScreen ? 400 : 200, flex: 1, margin: isWideScreen ? 20 : 10 }}>
                <Typography.Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}>
                    {manufacturerDescription}
                </Typography.Paragraph>
                <Divider plain>Gliders</Divider>
                <div style={{ display: "flex", flexWrap: 'wrap' }}>
                    {gliderData.gliders?.map((glider) => {
                        if (glider.isGlider) {
                            return (
                                <div style={{ width: "calc(50% - 6px)", margin: 3 }}>
                                    <GliderButton allGlidersData={glidersData} gliderData={glider} />
                                </div>
                            )
                        } else {
                            return (
                                <Popover
                                    zIndex={999}
                                    placement="right"
                                    trigger="click"
                                    content={
                                        <Space direction="vertical">
                                            {glider.gliders?.map((subGlider) => (
                                                <GliderButton allGlidersData={glidersData} gliderData={subGlider} />
                                            ))}
                                        </Space>
                                    }
                                >
                                    <Button
                                        style={{ width: "calc(50% - 6px)", margin: 3 }}
                                    >
                                        {glider.name}
                                    </Button>
                                </Popover>
                            )
                        }
                    })}
                </div>
            </Card >

        </>
    )
}

export const InfosPage: React.FC<{ glidersData: GlidersDataIndex }> = ({ glidersData }) => {
    const { isWideScreen } = useWindowWidth();
    return (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", padding: isWideScreen ? '0 50px' : "0 0px" }}>
            {Object.keys(glidersData).map((manufacturer) => (
                <ManufacturerData allGlidersData={glidersData} manufacturer={manufacturer} />
            ))}
        </div>

    )
}