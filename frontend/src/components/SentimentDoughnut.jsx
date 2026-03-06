import React, { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

const SENTIMENT_COLORS = {
    Positive: '#bf00ff', // neon purple
    Neutral: '#7c3aed',  // violet 600
    Negative: '#4a0080'  // purple 700
};

const SENTIMENT_MAP = {
    Happiness: 'Positive',
    Surprise: 'Positive',
    Neutral: 'Neutral',
    Sadness: 'Negative',
    Anger: 'Negative',
    Fear: 'Negative',
    Disgust: 'Negative',
    Contempt: 'Negative'
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-purple-950/95 border-l-2 border-neon-purple p-2 backdrop-blur-sm">
                <p className="text-purple-200 font-mono text-[9px] uppercase tracking-widest">{payload[0].name}</p>
                <p className="text-neon-purple font-mono text-xs font-bold">{payload[0].value.toFixed(1)}%</p>
            </div>
        );
    }
    return null;
};

const SentimentDoughnut = ({ stats }) => {
    const data = useMemo(() => {
        if (!stats) return [];

        const sentimentGroups = {
            Positive: 0,
            Neutral: 0,
            Negative: 0
        };

        stats.forEach(stat => {
            const category = SENTIMENT_MAP[stat.emotion] || 'Neutral';
            sentimentGroups[category] += stat.percentage;
        });

        return Object.entries(sentimentGroups)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));
    }, [stats]);

    return (
        <div className="w-full h-full relative flex items-center justify-center">
            {/* CENTRAL READOUT */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <span className="text-[8px] font-mono text-purple-600 tracking-[0.2em] uppercase">Sentiment</span>
                <span className="text-[10px] font-mono text-purple-300 font-black">ANALYSIS</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="65%"
                        outerRadius="85%"
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={SENTIMENT_COLORS[entry.name]}
                                fillOpacity={0.7}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SentimentDoughnut;
