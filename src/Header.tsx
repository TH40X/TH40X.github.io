import { Drawer, Menu, Typography } from "antd";
import { Header } from "antd/es/layout/layout";
import { Link, useLocation } from "react-router-dom";
import { useWindowWidth } from "./hooks/window-width";
import { useState } from "react";
import "./styles/header.css"



type Page = { key: string; label: string };

export const AppHeader = () => {
    const [drawerVisible, setDrawerVisible] = useState(false);

    const location = useLocation();
    const currentKey = location.pathname.substr(1);

    const { isWideScreen } = useWindowWidth()

    const pages: Page[] = [
        { key: "compare", label: "Gliders compare" },
        { key: "infos", label: "Gliders infos" },
        { key: "flightAnalysis", label: "Flight analysis" }
    ];

    return (
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>


            {!isWideScreen ? (
                <>
                    <button
                        onClick={() => setDrawerVisible(true)}
                        style={{
                            border: "none",
                            height: "100%",
                            backgroundColor: "transparent",
                            color: "white",
                            fontSize: 30,
                            cursor: "pointer"
                        }}
                    >
                        ☰
                    </button>

                    <Drawer
                        title={<span style={{ color: 'white' }}>Menu</span>}
                        placement="left"
                        closable={true}
                        onClose={() => setDrawerVisible(false)}
                        open={drawerVisible}
                        style={{ backgroundColor: "#001529" }}
                    >
                        <Menu theme="dark" mode="vertical" selectedKeys={[currentKey]}>
                            {pages.map(page => (
                                <Menu.Item key={page.key}>
                                    <Link to={`/${page.key}`} onClick={() => setDrawerVisible(false)}>{page.label}</Link>
                                </Menu.Item>
                            ))}
                        </Menu>
                    </Drawer>
                </>
            ) : (
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[currentKey]} disabledOverflow={true} >
                    {pages.map(page => (
                        <Menu.Item key={page.key}>
                            <Link to={`/${page.key}`}>{page.label}</Link>
                        </Menu.Item>
                    ))}
                </Menu>
            )
            }

            <Typography.Text strong onClick={() => window.location.href = '/'} style={{ cursor: "pointer", color: "white", marginRight: 30, fontSize: 20 }}>
                Unified Glider Project
            </Typography.Text>

        </Header >
    );
};

