import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-purple-950/95 border border-purple-800 p-2 backdrop-blur-md">
                <p className="text-[10px] font-mono text-purple-400 uppercase mb-1">{payload[0].payload.class}</p>
                <p className="text-sm font-mono text-neon-purple font-black">{(payload[0].value * 100).toFixed(1)}%</p>
            </div>
        );
    }
    return null;
};

const EmotionHistoryHistogram = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="w-full h-full relative group">
            {/* HUD DECOR */}
            <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-4 h-0.5 bg-neon-purple/50" />
                <div className="w-1 h-0.5 bg-neon-purple/50" />
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#4a0080"
                        opacity={0.3}
                    />
                    <XAxis
                        dataKey="class"
                        tick={{ fill: '#cc44ff', fontSize: 9, fontFamily: 'Share Tech Mono' }}
                        tickFormatter={(val) => val.substring(0, 3).toUpperCase()}
                        axisLine={{ stroke: '#4a0080', opacity: 0.5 }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#cc44ff', fontSize: 9, fontFamily: 'Share Tech Mono' }}
                        axisLine={{ stroke: '#4a0080', opacity: 0.5 }}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(191, 0, 255, 0.1)' }} />
                    <Bar
                        dataKey="confidence"
                        radius={[2, 2, 0, 0]}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={index % 2 === 0 ? '#bf00ff' : '#9d00ff'}
                                fillOpacity={0.6}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EmotionHistoryHistogram;
