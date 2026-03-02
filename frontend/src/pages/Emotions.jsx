import React, { useEffect, useState } from 'react'
import { getEmotionSummary, getEmotionScores, getEmotionHistory, getEmotionDetails, getEmotionScoresChart } from '../api/emotions'
import Text from '../components/ui/Text'
import EmotionRadar from '../components/EmotionRadar'

const Emotions = () => {
  const [summary, setSummary] = useState(null)
  const [scores, setScores] = useState(null)
  const [chart, setChart] = useState(null)
  const [recent, setRecent] = useState([])
  const [details, setDetails] = useState(null)
  const [selectedEmotion, setSelectedEmotion] = useState('Happiness')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const formatTs = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toISOString().replace('T', ' ').substring(0, 19)
  }

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const [summaryData, scoreData, historyData, chartData, detailsData] = await Promise.all([
          getEmotionSummary(),
          getEmotionScores(1),
          getEmotionHistory({ page: 1, page_size: 10 }),
          getEmotionScoresChart(),
          getEmotionDetails(selectedEmotion),
        ])
        setSummary(summaryData)
        setScores(scoreData?.records?.[0]?.emotion_scores || null)
        setRecent(historyData?.records || [])
        setChart(chartData)
        setDetails(detailsData)
      } catch (e) {
        setError('FAILED TO LOAD EMOTION DATA')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [selectedEmotion])

  if (loading) {
    return (
      <div className="p-6">
        <Text variant="mono" className="animate-pulse text-purple-400">
          LOADING EMOTIONS...
        </Text>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Text variant="mono" className="text-red-500">{error}</Text>
      </div>
    )
  }

  return (
    <div className="p-6 min-h-[calc(100vh-80px)] bg-surface-0 bg-cyber-grid flex flex-col gap-6">
      <div className="flex items-end justify-between border-b border-purple-800 pb-4">
        <div>
          <Text variant="h2">EMOTION LOG</Text>
          <Text variant="mono">SUMMARY + RECENT DETECTIONS</Text>
        </div>
        <div className="font-mono text-xs text-purple-400">
          TOTAL: {summary?.total_detections || 0}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-1 border border-purple-800 p-4">
          <Text variant="subtext" className="mb-2">DOMINANT EMOTION</Text>
          <Text variant="h1" glow className="text-neon-purple text-4xl">
            {summary?.dominant_emotion || 'N/A'}
          </Text>
          <div className="mt-4 space-y-2">
            {(summary?.emotion_stats || []).map((stat) => (
              <div key={stat.emotion} className="flex items-center gap-3">
                <div className="w-24 font-mono text-xs text-purple-300">
                  {stat.emotion.toUpperCase()}
                </div>
                <div className="flex-1 h-1.5 bg-surface-3 border border-purple-900">
                  <div
                    className="h-full bg-neon-purple"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
                <div className="w-14 text-right font-mono text-xs text-purple-400">
                  {stat.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-1 border border-purple-800 p-4">
          <Text variant="subtext" className="mb-2">RADAR DISTRIBUTION</Text>
          <div className="h-72">
            <EmotionRadar emotionScores={scores} />
          </div>
        </div>
      </div>

      <div className="bg-surface-1 border border-purple-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <Text variant="subtext">DETAILS</Text>
          <select
            value={selectedEmotion}
            onChange={(e) => setSelectedEmotion(e.target.value)}
            className="bg-surface-2 border border-purple-700 text-purple-200 font-mono text-xs px-2 py-1"
          >
            {['Anger','Contempt','Disgust','Fear','Happiness','Neutral','Sadness','Surprise'].map((emo) => (
              <option key={emo} value={emo}>{emo.toUpperCase()}</option>
            ))}
          </select>
        </div>
        {details?.emotion_stats?.length ? (
          <div className="grid grid-cols-2 gap-3">
            {details.emotion_stats.map((d) => (
              <div key={d.class} className="data-readout">
                <div className="font-mono text-[10px] text-purple-500">{d.class.toUpperCase()}</div>
                <div className="font-mono text-sm text-purple-200">{(d.confidence * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        ) : (
          <Text variant="mono" className="text-purple-600">NO DETAIL DATA</Text>
        )}
      </div>

      <div className="bg-surface-1 border border-purple-800 p-4">
        <Text variant="subtext" className="mb-2">SCORES CHART</Text>
        {chart?.emotion_stats?.length ? (
          <div className="space-y-2">
            {chart.emotion_stats.map((c) => (
              <div key={c.class} className="flex items-center gap-3">
                <div className="w-24 font-mono text-xs text-purple-300">{c.class.toUpperCase()}</div>
                <div className="flex-1 h-1.5 bg-surface-3 border border-purple-900">
                  <div className="h-full bg-neon-purple" style={{ width: `${c.percentage}%` }} />
                </div>
                <div className="w-14 text-right font-mono text-xs text-purple-400">{c.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        ) : (
          <Text variant="mono" className="text-purple-600">NO CHART DATA</Text>
        )}
      </div>

      <div className="bg-surface-1 border border-purple-800 p-4">
        <Text variant="subtext" className="mb-3">RECENT DETECTIONS</Text>
        {recent.length === 0 ? (
          <Text variant="mono" className="text-purple-600">NO RECENT DATA</Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-900/40 font-mono text-[10px] text-purple-300 tracking-wider uppercase border-b border-purple-700">
                  <th className="p-3">ID</th>
                  <th className="p-3">TIMESTAMP</th>
                  <th className="p-3">EMOTION</th>
                  <th className="p-3">CONFIDENCE</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm text-purple-100">
                {recent.map((r) => (
                  <tr key={r.id} className="border-b border-purple-900/40">
                    <td className="p-3 text-purple-500">{String(r.id)}</td>
                    <td className="p-3">{formatTs(r.timestamp)}</td>
                    <td className="p-3">{r.dominant_emotion}</td>
                    <td className="p-3">{(r.confidence * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Emotions
