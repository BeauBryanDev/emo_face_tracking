import React, { useState } from 'react';
import Text from './ui/Text';

const SessionEmbeddingManager = ({
    history,
    onStore,
    onClear,
    error
}) => {
    const [embeddingInput, setEmbeddingInput] = useState('');
    const [sessionId, setSessionId] = useState('');

    const formatTs = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleTimeString([], { hour12: false });
    };

    const handleStore = () => {
        if (!embeddingInput.trim()) return;
        try {
            const parsed = JSON.parse(embeddingInput);
            if (!Array.isArray(parsed) || parsed.length !== 512) {
                alert('CRITICAL_ERROR: EMBEDDING_LENGTH_INVALID // EXPECTED: 512');
                return;
            }
            onStore(parsed, sessionId || null);
            setEmbeddingInput('');
            setSessionId('');
        } catch {
            alert('CRITICAL_ERROR: MALFORMED_JSON_STRUCTURE');
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full font-mono">
            {/* CAPTURE MODULE */}
            <div className="bg-surface-2/60 border border-purple-800/50 p-4 relative group">
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] text-neon-purple animate-pulse">STORAGE_READY</span>
                </div>
                <Text variant="subtext" className="text-[10px] text-purple-400 mb-3 uppercase">01 // MANUAL_VECTOR_INGEST</Text>

                <div className="flex flex-col gap-3">
                    <textarea
                        className="w-full h-24 bg-purple-950/40 border border-purple-700/50 p-2 text-xs text-purple-200 outline-none focus:border-neon-purple transition-colors resize-none placeholder:text-purple-800 font-mono"
                        placeholder="PASTE_512D_VECTOR_ARRAY_HERE..."
                        value={embeddingInput}
                        onChange={(e) => setEmbeddingInput(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-purple-950/40 border border-purple-700/50 p-2 text-[10px] text-purple-200 outline-none focus:border-neon-purple placeholder:text-purple-800 font-mono"
                            placeholder="SESSION_ID (OPTIONAL)"
                            value={sessionId}
                            onChange={(e) => setSessionId(e.target.value)}
                        />
                        <button
                            onClick={handleStore}
                            className="px-4 py-2 bg-neon-purple/10 border border-neon-purple text-neon-purple text-[10px] font-black hover:bg-neon-purple hover:text-white transition-all shadow-neon-sm"
                        >
                            EXECUTE_STORAGE
                        </button>
                    </div>
                </div>
            </div>

            {/* HISTORY MODULE (TERMINAL STYLE) */}
            <div className="flex-1 bg-purple-950/80 border border-purple-800/40 p-4 relative flex flex-col min-h-[300px] overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <Text variant="subtext" className="text-[10px] text-purple-400 uppercase">02 // VECTOR_CACHE_LOG</Text>
                    <button
                        onClick={onClear}
                        className="text-[8px] text-purple-600 hover:text-red-500 transition-colors uppercase tracking-tighter"
                    >
                        PURGE_CACHE
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {history.length === 0 ? (
                        <div className="h-full flex items-center justify-center opacity-30 italic text-[10px] text-purple-500">
                            -- NO_CACHED_VECTORS_FOUND --
                        </div>
                    ) : (
                        history.map((record, i) => (
                            <div
                                key={record.id}
                                className="flex items-start gap-3 p-2 bg-purple-900/10 border-l border-purple-700 hover:border-neon-purple transition-all group"
                                style={{ animation: `fadeIn 0.3s ease-out ${i * 0.05}s forwards` }}
                            >
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex justify-between items-center opacity-60">
                                        <span className="text-[7px] text-neon-violet">SEQ: {record.id.toString().padStart(4, '0')}</span>
                                        <span className="text-[7px] text-purple-600">{formatTs(record.captured_at)}</span>
                                    </div>
                                    <div className="text-[9px] text-purple-100 font-black tracking-tight truncate">
                                        ID: <span className="text-neon-purple">{record.session_id || 'LOCAL_OVERRIDE'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* TERMINAL FOOTER DECOR */}
                <div className="mt-4 pt-2 border-t border-purple-800/20 flex justify-between animate-glitch">
                    <span className="text-[7px] text-purple-700">KERNEL_VER: 0x2A3</span>
                    <span className="text-[7px] text-purple-700">BUFFER_LOAD: {((history.length / 200) * 100).toFixed(1)}%</span>
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(26, 0, 48, 0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a0080; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #bf00ff; }
      `}</style>
        </div>
    );
};

export default SessionEmbeddingManager;
