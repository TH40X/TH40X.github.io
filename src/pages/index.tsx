import { Col, Row, Typography } from "antd";
import Texty from 'rc-texty';
import BlurryImage from "../components/blurryImage";
import { GliderFollower } from "../components/glider";
import UGP from "../public/UGP.png";
import analysis from "../public/analysis.png";
import comparison from "../public/comparison.png";
import infos from "../public/infos.png";
import FadeInFadeOut from "../transitions/fade";


export const IndexPage: React.FC = () => {
    return (
        <div style={{ backgroundColor: "#001529" }}>
            <GliderFollower gliderSize={100} />
            <div>
                <img src={UGP} style={{ width: "100%", height: 800, objectFit: "cover" }} />
                <Typography.Paragraph
                    style={{
                        textAlign: "end",
                        position: "absolute",
                        right: "5%",
                        bottom: "0%",
                        color: "white",
                        fontSize: 60,
                        fontWeight: "bold",
                        textShadow: "0px 0px 40px #001529, 0px 0px 40px #001529, 0px 0px 40px #001529"
                    }}
                >
                    <Texty duration={350}>
                        Unify glider data
                    </Texty>
                    <Texty duration={350} delay={1000}>
                        for visualisation and analysis
                    </Texty>
                </Typography.Paragraph>
            </div>

            <Row justify="center" style={{ marginTop: 80 }}>
                <Col span={12} style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    <div style={{ maxWidth: 450 }}>
                        <FadeInFadeOut>
                            <Typography.Title style={{ color: "white", textAlign: "end", cursor: "pointer" }} onClick={() => window.location.href = "/compare"}>
                                Glider Comparison
                            </Typography.Title>
                        </FadeInFadeOut>

                        <FadeInFadeOut>
                            <Typography.Paragraph style={{ color: "white", textAlign: "end", fontSize: 22 }}>
                                Comparing the <span style={{ fontStyle: "bold", color: "#f75757" }}>polar curves of different gliders on the same graph</span> allows for a direct performance evaluation. This tool allows you, by overlaying multiple curves, to <span style={{ fontStyle: "bold", color: "#f75757" }}>easily assess metrics</span> like minimum sink rate and best glide ratio. This side-by-side comparison simplifies the visualisation and comparaison of different gliders performances.
                            </Typography.Paragraph>
                        </FadeInFadeOut>
                    </div>
                </Col>
                <Col span={12} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ maxWidth: 600, cursor: "pointer" }} onClick={() => window.location.href = "/compare"}>
                        <BlurryImage src={comparison} style={{ width: "90%", margin: 20, borderRadius: 20 }} />
                    </div>
                </Col>
            </Row>

            <Row justify="center">
                <Col span={12} style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    <div style={{ maxWidth: 600, cursor: "pointer" }} onClick={() => window.location.href = "/infos"}>
                        <BlurryImage src={infos} style={{ width: "90%", margin: 20, borderRadius: 20 }} />
                    </div>
                </Col>
                <Col span={12} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ maxWidth: 450 }}>
                        <FadeInFadeOut>
                            <Typography.Title style={{ color: "white", textAlign: "start", cursor: "pointer" }} onClick={() => window.location.href = "/infos"}>
                                Gliders Infos
                            </Typography.Title>
                        </FadeInFadeOut>

                        <FadeInFadeOut>
                            <Typography.Paragraph style={{ color: "white", textAlign: "start", fontSize: 22 }}>
                                This tool provides a comprehensive <span style={{ fontStyle: "bold", color: "#f75757" }}>overview of each glider model</span> in our database. In addition to featuring the polar curve, you'll also find technical specifications of the glider. For some background of each model, you'll find a section dedicated to the <span style={{ fontStyle: "bold", color: "#f75757" }}>glider's historical background with key dates</span>. Lastly, to gauge its competitive impact, we offer a complete summary of <span style={{ fontStyle: "bold", color: "#f75757" }}>competition results and participations since 1999</span>.
                            </Typography.Paragraph>
                        </FadeInFadeOut>
                    </div>
                </Col>
            </Row>

            <Row justify="center">
                <Col span={12} style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    <div style={{ maxWidth: 450 }}>
                        <FadeInFadeOut>
                            <Typography.Title style={{ color: "white", textAlign: "end", cursor: "pointer" }} onClick={() => window.location.href = "/flightAnalysis"}>
                                Flight Analysis
                            </Typography.Title>
                        </FadeInFadeOut>

                        <FadeInFadeOut>
                            <Typography.Paragraph style={{ color: "white", textAlign: "end", fontSize: 22 }}>
                                Our Polar Analysis Tool is a straightforward software solution for evaluating glider performance during a specific flight. By <span style={{ fontStyle: "bold", color: "#f75757" }}>overlaying your actual flight data on a selected polar curve</span>, the tool provides an objective measure of how your glider is performing in real-time conditions. This allows for a direct comparison with predefined performance metrics, helping you understand where your flight stands in relation to the chosen polar curve.
                            </Typography.Paragraph>
                        </FadeInFadeOut>
                    </div>
                </Col>
                <Col span={12} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ maxWidth: 600, cursor: "pointer" }} onClick={() => window.location.href = "/flightAnalysis"}>
                        <BlurryImage src={analysis} style={{ width: "90%", margin: 20, borderRadius: 20 }} />
                    </div>
                </Col>
            </Row>
        </div >
    )
}