import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Cascader, Col, ColorPicker, Divider, Row, Typography } from "antd";
import { Color } from 'antd/es/color-picker';
import { DefaultOptionType } from "antd/es/select";
import React, { useEffect } from 'react';
import { CartesianGrid, Label, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlidersDataIndex } from '../App';
import { colors } from '../utils/colors';
import { loadGlidersDataForChart, transformDataToOptions } from '../utils/glidersData';
import "../styles/compare.css"
import { useWindowWidth } from '../hooks/window-width';

const filter = (inputValue: string, path: DefaultOptionType[]) => {
    const leafOption = path[path.length - 1];
    return (
        !leafOption.children &&
        (leafOption.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );
};


const CustomTooltip = ({ active, payload, label }: any) => {
    const { isWideScreen } = useWindowWidth()
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: 'white', padding: '5px', border: '1px solid black', fontSize: isWideScreen ? 14 : 12 }}>
                <p style={{ margin: 0, lineHeight: 0, textAlign: "center" }}><Typography.Text strong>{`${label} km/h`}</Typography.Text></p>
                {payload.map((entry: any) => {
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

export const GlidersComparePage: React.FC<{ glidersData: GlidersDataIndex }> = ({ glidersData }) => {
    const { isWideScreen } = useWindowWidth()
    const [data, setData] = React.useState<any[]>([]);
    const [gliderId, setGliderId] = React.useState<number>(1);
    const [glidersInput, setGlidersInput] = React.useState<{ [id: number]: { gliderName: string, color: string } }>({});

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const options = React.useCallback(() => {
        return transformDataToOptions(glidersData);
    }, [glidersData]);

    const handleAddGlider = () => {
        setGliderId(prevId => prevId + 1);
        setGlidersInput(prevState => ({
            ...prevState,
            [gliderId]: {
                gliderName: "",
                color: colors[gliderId % colors.length]
            }
        }));
    }

    const handleDeleteGlider = (id: number) => {
        setGlidersInput(prevState => {
            const newState = { ...prevState };
            delete newState[id];
            return newState;
        });
    };


    const handleColorChange = (id: number, color: Color) => {
        setGlidersInput(prevState => ({
            ...prevState,
            [id]: {
                ...prevState[id],
                color: color.toHexString()
            }
        }));
    };


    const renderColorPicker = (index: number) => (
        <ColorPicker
            value={glidersInput[index].color}
            onChange={(color) => handleColorChange(index, color)}
            disabledAlpha
            presets={[
                {
                    label: 'Color list',
                    colors: colors,
                },
            ]}
            panelRender={(_, { components: { Presets } }) => (
                <div
                    style={{
                        display: 'flex',
                        width: 250,
                    }}
                >
                    <Presets />
                </div>
            )}
        />
    );

    const handleGliderChange = (id: number, gliderName: string) => {
        setGlidersInput(prevState => ({
            ...prevState,
            [id]: {
                ...prevState[id],
                gliderName
            }
        }));
    };


    useEffect(() => {
        const data = loadGlidersDataForChart(glidersData, ...Object.values(glidersInput).map(glider => glider.gliderName));
        setData(data);
    }, [glidersInput])

    useEffect(() => {
        handleAddGlider();
    }, []);

    const minValue = Math.floor(Object.keys(glidersInput).reduce((min, id) => {
        const gliderName = glidersInput[Number(id)].gliderName;
        const gliderData = data.map(item => item[gliderName]).filter(Number.isFinite);
        const localMin = Math.min(...gliderData);
        return localMin < min ? localMin : min;
    }, -3));

    return (
        <div style={{ padding: isWideScreen ? '0 50px' : "0 10px" }}>
            <Row>
                <Col lg={6} xs={24}>
                    <Typography.Title level={3} style={{ textAlign: "center" }}>Gliders comparison</Typography.Title>
                    {Object.keys(glidersInput).map(id => {
                        return (
                            <div key={id} style={{ display: 'flex', alignItems: 'flex-start' }}>
                                {renderColorPicker(Number(id))}

                                <div
                                    style={{ width: 'calc(100% - 60px)', marginRight: "8px", marginBottom: 15 }}
                                >
                                    <Cascader
                                        style={{ width: "100%" }}
                                        expandTrigger="click"
                                        allowClear={false}
                                        options={options()}
                                        placeholder="Select glider"
                                        showSearch={{ filter }}
                                        onChange={(value) => handleGliderChange(Number(id), String(value[value.length - 1]))}
                                        displayRender={(labels) => labels[labels.length - 1]}
                                    />
                                </div>
                                <MinusCircleOutlined onClick={() => handleDeleteGlider(Number(id))} style={{ marginTop: 10 }} />
                            </div>
                        );
                    })}


                    <Button type="dashed" onClick={handleAddGlider} block icon={<PlusOutlined />} style={{ marginBottom: 30 }}>
                        Add glider
                    </Button>

                    {isWideScreen && <Typography.Paragraph type="secondary" style={{ textAlign: "justify" }}>
                        <Typography.Text type="secondary" underline>Description:</Typography.Text>
                        <br style={{ marginBottom: 7 }} />
                        The following graph compares different polars. The polars data rely on different sources, wich are the following:
                        <br />
                        <Typography.Text italic>[Manual]:</Typography.Text> Polar from the glider manual, provided by the manufacturer.
                        <br />
                        <Typography.Text italic>[XCSoar]:</Typography.Text> Polar used in XCSoar software, often the same used in LX devices.
                        <br />
                        <Typography.Text italic>[Idaflieg]:</Typography.Text> Polar determined by Idaflieg, based on real flight data.
                        <br style={{ marginBottom: 7 }} />
                        <Divider />
                        If you would like to contribute to this public database, please contact
                        <a href="mailto:unified.glider.project@gmail.com"> unified.glider.project@gmail.com</a>
                    </Typography.Paragraph>}
                </Col>
                <Col span={isWideScreen ? 18 : 24}>
                    <ResponsiveContainer width={"100%"} height={isWideScreen ? 700 : 400}>
                        <LineChart data={data} margin={{ top: 40, right: 10, bottom: 10, left: isWideScreen ? 0 : -25 }}>
                            <CartesianGrid strokeDasharray="3 3" fill='#fcfbfb' />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend align='right' width={350} />

                            <XAxis
                                type="number"
                                dataKey="speed"
                                orientation='top'
                                domain={[0, "auto"]}
                            >
                                <Label
                                    value={"Speed (km/h)"}
                                    offset={-10}
                                    position="insideTopRight"
                                    fontStyle="italic"
                                    style={{ textAnchor: "end" }}
                                />
                            </XAxis>
                            <YAxis domain={[minValue, 0]}
                                ticks={Array.from({ length: 1 - minValue }, (_, i) => i + minValue)}
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


                            {Object.keys(glidersInput).map(id => {
                                if (!glidersInput[Number(id)].gliderName) return null;

                                const gliderName = glidersInput[Number(id)].gliderName;
                                const color = glidersInput[Number(id)].color;
                                return (
                                    <Line
                                        key={id}
                                        connectNulls
                                        type="monotone"
                                        dataKey={gliderName}
                                        dot={false}
                                        stroke={color}
                                    />
                                );
                            })}

                        </LineChart>
                    </ResponsiveContainer>
                </Col>
            </Row>
            {!isWideScreen && <Typography.Paragraph type="secondary" style={{ textAlign: "justify" }}>
                <Typography.Text type="secondary" underline>Description:</Typography.Text>
                <br style={{ marginBottom: 7 }} />
                The following graph compares different polars. The polars data rely on different sources, wich are the following:
                <br />
                <Typography.Text italic>[Manual]:</Typography.Text> Polar from the glider manual, provided by the manufacturer.
                <br />
                <Typography.Text italic>[XCSoar]:</Typography.Text> Polar used in XCSoar software, often the same used in LX devices.
                <br />
                <Typography.Text italic>[Idaflieg]:</Typography.Text> Polar determined by Idaflieg, based on real flight data.
                <br style={{ marginBottom: 7 }} />
                <Divider />
                If you would like to contribute to this public database, please contact
                <a href="mailto:unified.glider.project@gmail.com"> unified.glider.project@gmail.com</a>
            </Typography.Paragraph>}
        </div>
    )
}
