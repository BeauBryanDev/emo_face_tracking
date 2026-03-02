import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Text from '../components/ui/Text';
import AvatarCard from '../components/ui/AvatarCard';
import Button from '../components/ui/Button';
import { Activity, Cpu, Database, Terminal, Zap } from 'lucide-react';

// Import centralized API services
import { getEmotionSummary } from '../api/emotions';
import { useAuth } from '../context/AuthContext';

// -----------------------------------------------------------------------------
// DASHBOARD COMPONENT
// Main telemetry hub displaying aggregated biometric and emotional data.
// Consumes the /summary REST endpoint.
// -----------------------------------------------------------------------------

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Request aggregated emotion data using the centralized Axios instance
      // The JWT token is automatically injected by the request interceptor
      const data = await getEmotionSummary();
      setSummary(data);
      
    } catch (err) {
      console.error("Error fetching telemetry summary:", err);
      setError("UNABLE TO ESTABLISH UPLINK WITH MAIN NEURAL CORE.");
    } finally {
      setLoading(false);
    }
  }, []); // token is no longer needed in dependencies since interceptor handles it

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="p-6 min-h-[calc(100vh-80px)] bg-surface-0 bg-cyber-grid flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-purple-800 pb-4">
        <div>
          <Text variant="h1" glow className="flex items-center gap-3">
            <Terminal className="w-8 h-8 text-neon-purple" />
            COMMAND CENTER
          </Text>
          <Text variant="mono" className="mt-2">
            SYSTEM TELEMETRY AND BIOMETRIC AGGREGATION
          </Text>
        </div>
        
        <div className="w-full md:w-auto">
          <AvatarCard 
            name={user?.full_name || "UNKNOWN OPERATOR"} 
            role="SYSTEM ADMINISTRATOR"
            status="ONLINE"
          />
        </div>
      </div>

      {/* ERROR HANDLING */}
      {error && (
        <div className="p-4 bg-red-950/50 border border-red-500 text-red-500 font-mono flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <Zap className="w-5 h-5 animate-pulse" />
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && !error && (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-24 h-1 border-t-2 border-neon-purple animate-scan-fast mb-4"></div>
          <Text variant="mono" className="animate-pulse text-purple-400">
            AGGREGATING NEURAL DATA...
          </Text>
        </div>
      )}

      {/* TELEMETRY DASHBOARD */}
      {!loading && !error && summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PRIMARY METRICS (LEFT COLUMN) */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            
            {/* Total Scans Card */}
            <div className="bg-surface-1 border border-purple-800 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-neon-purple/5 rounded-full blur-2xl group-hover:bg-neon-purple/10 transition-colors"></div>
              <Text variant="subtext" className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4" /> TOTAL BIOMETRIC SCANS
              </Text>
              <Text variant="h1" className="text-5xl text-purple-100">
                {summary.total_detections}
              </Text>
            </div>

            {/* Dominant Emotion Card */}
            <div className="bg-surface-1 border border-neon-purple p-6 shadow-neon-sm relative">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neon-purple"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neon-purple"></div>
              
              <Text variant="subtext" className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4" /> PRIMARY NEURAL STATE
              </Text>
              <Text variant="h1" glow className="text-4xl text-neon-purple mt-2 truncate">
                {summary.dominant_emotion || "N/A"}
              </Text>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-3 mt-4">
              <Button 
                variant="primary" 
                fullWidth 
                onClick={() => navigate('/inference')}
              >
                <Activity className="w-4 h-4" /> INITIATE LIVE SCAN
              </Button>
              <Button 
                variant="secondary" 
                fullWidth 
                onClick={() => navigate('/history')}
              >
                ACCESS ARCHIVES
              </Button>
            </div>
          </div>

          {/* SECONDARY METRICS: EMOTION DISTRIBUTION (RIGHT COLUMN) */}
          <div className="bg-surface-1 border border-purple-800 p-6 lg:col-span-2 flex flex-col">
            <Text variant="h3" className="mb-6 flex items-center gap-2 border-b border-purple-800 pb-3">
              <Activity className="w-5 h-5 text-purple-400" /> 
              NEURAL DISTRIBUTION MATRIX
            </Text>
            
            {summary.emotion_stats && summary.emotion_stats.length > 0 ? (
              <div className="flex flex-col gap-5 flex-1 justify-center">
                {summary.emotion_stats.map((stat) => (
                  <div key={stat.emotion} className="flex flex-col gap-1">
                    
                    <div className="flex justify-between items-end">
                      <Text variant="mono" className="text-purple-200">
                        {stat.emotion.toUpperCase()}
                      </Text>
                      <Text variant="mono" className="text-neon-purple font-bold">
                        {stat.percentage.toFixed(1)}%
                      </Text>
                    </div>
                    
                    <div className="w-full h-2 bg-surface-3 rounded-none overflow-hidden border border-purple-900">
                      <div 
                        className="h-full bg-neon-purple shadow-[0_0_8px_rgba(191,0,255,0.8)] transition-all duration-1000 ease-out"
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between mt-1">
                      <Text variant="subtext" className="text-purple-500">
                        SCANS: {stat.count}
                      </Text>
                      <Text variant="subtext" className="text-purple-500">
                        AVG CONFIDENCE: {(stat.avg_confidence * 100).toFixed(1)}%
                      </Text>
                    </div>
                    
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <Text variant="mono" className="text-purple-600 border border-purple-800 p-4 border-dashed">
                  [ INSUFFICIENT DATA FOR DISTRIBUTION ANALYSIS ]
                </Text>
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
};

export default Dashboard;

