import React from 'react';

interface DividerProps {
    color: string;
    size: string;
    width: string;
}

const Divider: React.FC<DividerProps> = ({ color, size, width }) => {
    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: width, height: size, backgroundColor: color, borderRadius: size }} />
        </div>
    );
};

export default Divider;
