import { Col, Row, Typography } from "antd";
import Texty from 'rc-texty';
import BlurryImage from "../components/blurryImage";
import { GliderFollower } from "../components/glider";
import UGP from "../public/UGP.png";
import analysis from "../public/analysis.png";
import comparison from "../public/comparison.png";
import infos from "../public/infos.png";
import stats from "../public/stats.png";
import FadeInFadeOut from "../transitions/fade";
import Divider from "../components/Divider";
import { useWindowWidth } from "../hooks/window-width";
import { useEffect } from "react";


export const IndexPage: React.FC = () => {
    const { isWideScreen } = useWindowWidth()

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ backgroundColor: "#001529" }}>
            <GliderFollower gliderSize={100} />
            <div>
                <img src={UGP} style={{ width: "100%", height: "90vh", objectFit: "cover" }} />
                <Typography.Paragraph
                    style={{
                        textAlign: "end",
                        position: "absolute",
                        right: "5%",
                        bottom: "0%",
                        color: "white",
                        fontSize: 60,
                        fontWeight: "bold",
                        // textShadow: "0px 0px 40px #001529, 0px 0px 40px #001529, 0px 0px 40px #001529",
                        maxWidth: "800px"
                    }}
                >
                    <Texty duration={350}>
                        Unify glider data for visualisation and analysis
                    </Texty>
                </Typography.Paragraph>
            </div>

            <Row justify="center" style={{ marginTop: 80 }}>
                <Col span={isWideScreen ? 12 : 0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    <div style={{ maxWidth: 450 }}>
                        <FadeInFadeOut>
                            <Typography.Title style={{ color: "white", textAlign: "center", cursor: "pointer" }} onClick={() => window.location.href = "/#/compare"}>
                                Glider Comparison
                            </Typography.Title>
                        </FadeInFadeOut>

                        <FadeInFadeOut>
                            <Typography.Paragraph style={{ color: "white", textAlign: "justify", textJustify: "auto", fontSize: 22, marginLeft: 10, marginRight: 10 }}>
                                &emsp;Comparing the <span style={{ fontStyle: "bold", color: "#f75757" }}>polar curves of different gliders on the same graph</span> allows for a direct performance evaluation. This tool allows you, by overlaying multiple curves, to <span style={{ fontStyle: "bold", color: "#f75757" }}>easily assess metrics</span> like minimum sink rate and best glide ratio. This side-by-side comparison simplifies the visualisation and comparaison of different gliders performances.
                            </Typography.Paragraph>
                        </FadeInFadeOut>
                    </div>
                </Col>
                <Col span={isWideScreen ? 12 : 0} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ maxWidth: 600, cursor: "pointer" }} onClick={() => window.location.href = "/#/compare"}>
                        <BlurryImage src={comparison} style={{ width: "90%", margin: 20, borderRadius: 20 }} />
                    </div>
                </Col>
            </Row>

            {!isWideScreen && <Divider color="white" size="2px" width="70%" />}

            <Row justify="center">
                <Col span={isWideScreen ? 12 : 0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }} order={isWideScreen ? 0 : 1}>
                    <div style={{ maxWidth: 600, cursor: "pointer" }} onClick={() => window.location.href = "/#/infos"}>
                        <BlurryImage src={infos} style={{ width: "90%", margin: 20, borderRadius: 20 }} />
                    </div>
                </Col>
                <Col span={isWideScreen ? 12 : 0} style={{ display: "flex", alignItems: "center" }} order={isWideScreen ? 1 : 0}>
                    <div style={{ maxWidth: 450 }}>
                        <FadeInFadeOut>
                            <Typography.Title style={{ color: "white", textAlign: "center", cursor: "pointer" }} onClick={() => window.location.href = "/#/infos"}>
                                Gliders Infos
                            </Typography.Title>
                        </FadeInFadeOut>

                        <FadeInFadeOut>
                            <Typography.Paragraph style={{ color: "white", textAlign: "justify", textJustify: "auto", fontSize: 22, marginLeft: 10, marginRight: 10 }}>
                                &emsp;This tool provides a comprehensive <span style={{ fontStyle: "bold", color: "#f75757" }}>overview of each glider model</span> in our database. In addition to featuring the polar curve, you'll also find technical specifications of the glider. For some background of each model, you'll find a section dedicated to the <span style={{ fontStyle: "bold", color: "#f75757" }}>glider's historical background with key dates</span>. Lastly, to gauge its competitive impact, we offer a complete summary of <span style={{ fontStyle: "bold", color: "#f75757" }}>competition results and participations since 1999</span>.
                            </Typography.Paragraph>
                        </FadeInFadeOut>
                    </div>
                </Col>
            </Row>

            {!isWideScreen && <Divider color="white" size="2px" width="70%" />}

            <Row justify="center">
                <Col span={isWideScreen ? 12 : 0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    <div style={{ maxWidth: 450 }}>
                        <FadeInFadeOut>
                            <Typography.Title style={{ color: "white", textAlign: "center", cursor: "pointer" }} onClick={() => window.location.href = "/#/flightAnalysis"}>
                                Flight Analysis
                            </Typography.Title>
                        </FadeInFadeOut>

                        <FadeInFadeOut>
                            <Typography.Paragraph style={{ color: "white", textAlign: "justify", textJustify: "auto", fontSize: 22, marginLeft: 10, marginRight: 10 }}>
                                &emsp;Our Polar Analysis Tool is a straightforward software solution for evaluating glider performance during a specific flight. By <span style={{ fontStyle: "bold", color: "#f75757" }}>overlaying your actual flight data on a selected polar curve</span>, the tool provides an objective measure of how your glider is performing in real-time conditions. This allows for a direct comparison with predefined performance metrics, helping you understand where your flight stands in relation to the chosen polar curve.
                            </Typography.Paragraph>
                        </FadeInFadeOut>
                    </div>
                </Col>
                <Col span={isWideScreen ? 12 : 0} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ maxWidth: 600, cursor: "pointer" }} onClick={() => window.location.href = "/#/flightAnalysis"}>
                        <BlurryImage src={analysis} style={{ width: "90%", margin: 20, borderRadius: 20 }} />
                    </div>
                </Col>
            </Row>

            {!isWideScreen && <Divider color="white" size="2px" width="70%" />}

            <Row justify="center">
                <Col span={isWideScreen ? 12 : 0} style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }} order={isWideScreen ? 0 : 1}>
                    <div style={{ maxWidth: 600, cursor: "pointer" }} onClick={() => window.location.href = "/#/competitonStats"}>
                        <BlurryImage src={stats} style={{ width: "90%", margin: 20, borderRadius: 20 }} />
                    </div>
                </Col>
                <Col span={isWideScreen ? 12 : 0} style={{ display: "flex", alignItems: "center" }} order={isWideScreen ? 1 : 0}>
                    <div style={{ maxWidth: 450 }}>
                        <FadeInFadeOut>
                            <Typography.Title style={{ color: "white", textAlign: "center", cursor: "pointer" }} onClick={() => window.location.href = "/#/competitonStats"}>
                                Competition statistics
                            </Typography.Title>
                        </FadeInFadeOut>

                        <FadeInFadeOut>
                            <Typography.Paragraph style={{ color: "white", textAlign: "justify", textJustify: "auto", fontSize: 22, marginLeft: 10, marginRight: 10 }}>
                                &emsp;This graph allows you to see and compare some statistics of different gliders in competition. You can select the gliders you want to compare and the years you want to see. The graph will show you the <span style={{ fontStyle: "bold", color: "#f75757" }}>number of participations</span> of each glider for each year, and the <span style={{ fontStyle: "bold", color: "#f75757" }}>win rate</span> of each glider for each year.
                            </Typography.Paragraph>
                        </FadeInFadeOut>
                    </div>
                </Col>
            </Row>
        </div >
    )
}