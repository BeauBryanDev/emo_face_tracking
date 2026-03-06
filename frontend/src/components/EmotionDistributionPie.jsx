import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

/**
 * CYBERPUNK PIE TOOLTIP
 */
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-purple-950/95 border-l-2 border-neon-purple p-2 backdrop-blur-md shadow-[0_0_15px_rgba(170,0,255,0.2)]">
                <p className="text-purple-200 font-mono text-[10px] uppercase tracking-wider mb-1">
                    {payload[0].name} // METRIC
                </p>
                <p className="text-neon-purple font-mono text-sm font-bold">
                    {payload[0].value.toFixed(1)}%
                </p>
            </div>
        );
    }
    return null;
};

const COLORS = [
    '#bf00ff', // neon purple
    '#9d00ff', // neon violet
    '#7c3aed', // violet 600
    '#6600b3', // purple 600
    '#4a0080', // purple 700
    '#2d0057', // purple 800
    '#1a0030', // purple 900
    '#aa00ff'  // purple 400
];

const EmotionDistributionPie = ({ data }) => {
    if (!data || data.length === 0) return null;

    const chartData = data.map(item => ({
        name: item.emotion,
        value: item.percentage
    }));

    return (
        <div className="w-full h-full relative group">
            {/* HUD ACCENTS */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-purple-500/20" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-purple-500/20" />

            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius="80%"
                        paddingAngle={2}
                        dataKey="value"
                        stroke="#0d0010"
                        strokeWidth={2}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                fillOpacity={0.8}
                                className="hover:opacity-100 transition-opacity duration-300"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-[9px] font-mono text-purple-400 uppercase tracking-tighter">{value}</span>}
                        iconType="square"
                        iconSize={8}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EmotionDistributionPie;
