import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Cascader, Col, ColorPicker, Row, Typography } from "antd";
import { Color } from 'antd/es/color-picker';
import { DefaultOptionType } from "antd/es/select";
import React, { useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlidersDataIndex } from '../App';
import { useWindowWidth } from '../hooks/window-width';
import "../styles/compare.css";
import { colors } from '../utils/colors';
import { loadGlidersDataForStatsChart, transformDataToStatsOptions } from '../utils/glidersData';

const filter = (inputValue: string, path: DefaultOptionType[]) => {
    const leafOption = path[path.length - 1];
    return (
        !leafOption.children &&
        (leafOption.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );
};

export const CompetitionStatsPage: React.FC<{ glidersData: GlidersDataIndex }> = ({ glidersData }) => {
    const { isWideScreen } = useWindowWidth()
    const [data, setData] = React.useState<any[]>([]);
    const [gliderId, setGliderId] = React.useState<number>(1);
    const [glidersInput, setGlidersInput] = React.useState<{ [id: number]: { gliderName: string, color: string } }>({});

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const options = React.useCallback(() => {
        return transformDataToStatsOptions(glidersData);
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
        const data = loadGlidersDataForStatsChart(glidersData, ...Object.values(glidersInput).map(glider => glider.gliderName));
        setData(data);
    }, [glidersInput])

    useEffect(() => {
        handleAddGlider();
    }, []);

    const toPercent = (decimal: number) => {
        return `${(decimal * 100).toFixed(0)}%`;
    }

    // const getPercent = (value, total) => {
    //     const ratio = total > 0 ? value / total : 0;

    //     return toPercent(ratio, 2);
    // };

    return (
        <div style={{ padding: isWideScreen ? '0 50px' : "0 10px" }}>
            <Row>
                <Col lg={6} xs={24}>
                    <Typography.Title level={3} style={{ textAlign: "center" }}>Competition Participation</Typography.Title>
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
                </Col>
                <Col span={isWideScreen ? 18 : 24}>
                    <ResponsiveContainer width={"100%"} height={isWideScreen ? 700 : 400}>
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, bottom: 10, left: isWideScreen ? 0 : -15 }}
                            stackOffset='expand'
                        >
                            <CartesianGrid strokeDasharray="3 3" fill='#fcfbfb' />
                            <Tooltip formatter={(value, name) => [`${value} participations`, name]} />
                            <Legend align='right' width={350} />

                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={toPercent} />


                            {Object.keys(glidersInput).map(id => {
                                if (!glidersInput[Number(id)].gliderName) return null;

                                const gliderName = glidersInput[Number(id)].gliderName;
                                const color = glidersInput[Number(id)].color;
                                return (
                                    <Area key={id} type="monotone" stackId={1} dataKey={gliderName} stroke={color} fill={color} />
                                );
                            })}

                        </AreaChart>
                    </ResponsiveContainer>
                </Col>
            </Row>
        </div>
    )
}
