import { Typography } from 'antd';
import React from 'react';

type DataDisplayProps = {
    text1: string;
    text2: string;
}

const DataDisplay: React.FC<DataDisplayProps> = ({ text1, text2 }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", paddingRight: 10, paddingLeft: 10 }}>
            <Typography.Text type="secondary" style={{ marginRight: 5 }}>{text1}:</Typography.Text>
            <Typography.Text>{text2}</Typography.Text>
        </div>
    );
}

export default DataDisplay;
