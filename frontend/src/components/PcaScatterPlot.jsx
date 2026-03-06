import React, { useMemo } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Legend
} from 'recharts';

/**
 * CUSTOM TECH TOOLTIP
 */
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-purple-950/95 border-l-2 border-neon-purple p-3 backdrop-blur-md shadow-[0_0_20px_rgba(170,0,255,0.3)] animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-neon-purple animate-pulse" />
                    <p className="text-purple-200 font-mono text-[10px] font-bold tracking-widest uppercase">
                        VECTOR_NODE_DETECTION
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-purple-400 font-mono text-[9px]">SOURCE: <span className="text-purple-100">{data.source.toUpperCase()}</span></p>
                    <p className="text-purple-400 font-mono text-[9px]">USER_ID: <span className="text-purple-100">{data.user_id}</span></p>
                    <div className="h-[1px] bg-purple-800/50 my-1" />
                    <p className="text-neon-purple font-mono text-[10px] font-black">
                        COORD_PC1: {data.x.toFixed(4)}
                    </p>
                    <p className="text-neon-purple font-mono text-[10px] font-black">
                        COORD_PC2: {data.y.toFixed(4)}
                    </p>
                    <p className="text-purple-500 font-mono text-[10px]">
                        DEPTH_PC3: {data.z.toFixed(4)}
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const PcaScatterPlot = ({ points }) => {
    // Organize data for pseudo-3D (mapping Z to color opacity or size)
    const chartData = useMemo(() => {
        if (!points) return [];
        return points.map(p => ({
            ...p,
            // Map Z to range [1, 10] for point size
            size: 5 + (p.z * 5),
        }));
    }, [points]);

    const registeredPoints = chartData.filter(p => p.source === 'registered' && !p.is_current_user);
    const sessionPoints = chartData.filter(p => p.source === 'session' && !p.is_current_user);
    const currentUserPoints = chartData.filter(p => p.is_current_user);

    return (
        <div className="w-full h-full relative group">
            {/* HUD CORNER ACCENTS */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-purple-500/30" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-purple-500/30" />

            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#4a0080"
                        opacity={0.2}
                    />
                    <XAxis
                        type="number"
                        dataKey="x"
                        name="PC1"
                        hide
                        domain={['auto', 'auto']}
                    />
                    <YAxis
                        type="number"
                        dataKey="y"
                        name="PC2"
                        hide
                        domain={['auto', 'auto']}
                    />
                    <ZAxis
                        type="number"
                        dataKey="z"
                        range={[10, 80]}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#bf00ff' }} />

                    <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">{value}</span>}
                    />

                    <Scatter
                        name="User Biometrics"
                        data={registeredPoints}
                        fill="#bf00ff"
                        fillOpacity={0.6}
                    >
                        {registeredPoints.map((entry, index) => (
                            <Cell key={`cell-reg-${index}`} className="hover:filter hover:brightness-150 transition-all duration-300" />
                        ))}
                    </Scatter>

                    <Scatter
                        name="Session Vectors"
                        data={sessionPoints}
                        fill="#cc44ff"
                        fillOpacity={0.4}
                    >
                        {sessionPoints.map((entry, index) => (
                            <Cell key={`cell-sess-${index}`} className="hover:filter hover:brightness-150 transition-all duration-300" />
                        ))}
                    </Scatter>

                    <Scatter
                        name="Self Node"
                        data={currentUserPoints}
                        fill="#00ff88"
                    >
                        {currentUserPoints.map((entry, index) => (
                            <Cell key={`cell-self-${index}`} className="shadow-neon-sm animate-pulse" />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>

            {/* OVERLAY TELEMETRY */}
            <div className="absolute bottom-4 left-4 pointer-events-none opacity-40">
                <div className="flex flex-col gap-1">
                    <div className="h-[2px] w-12 bg-neon-purple" />
                    <span className="text-[7px] font-mono text-purple-400 uppercase tracking-widest">Projection: Principal_Components_1_2_3</span>
                </div>
            </div>
        </div>
    );
};

export default PcaScatterPlot;
