import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { useState, useEffect } from 'react'

function ClusterLabel(props) {
  const { cx, cy, payload } = props
  if (!payload || payload.label === undefined) return null
  return (
    <text
      x={cx}
      y={cy}
      fill="black"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="16"
      fontWeight="bold"
      pointerEvents="none"
      style={{ textShadow: '1px 1px 3px white' }}
    >
      {payload.label}
    </text>
  )
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8E6CF',
  '#FFD3B6', '#FFAAA5', '#AA96DA', '#FCBAD3', '#A8D8EA',
  '#FF9999', '#FFCC99', '#FFFF99', '#99FF99', '#99FFCC',
]

export default function UmapPlot({ data, loading }) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => setElapsedTime(t => t + 0.1), 100)
    return () => clearInterval(interval)
  }, [loading])

  if (data && data.cells.length > 0) {
    const umap1Values = data.cells.map(c => c.umap1)
    const umap2Values = data.cells.map(c => c.umap2)
    console.log('UMAP data received:')
    console.log(`  X range: [${Math.min(...umap1Values).toFixed(2)}, ${Math.max(...umap1Values).toFixed(2)}]`)
    console.log(`  Y range: [${Math.min(...umap2Values).toFixed(2)}, ${Math.max(...umap2Values).toFixed(2)}]`)
    console.log(`  Cells: ${data.cells.length}`)
  }

  const getStage = () => {
    if (elapsedTime < 1) return 'Loading data...'
    if (elapsedTime < 2) return 'QC & Filtering...'
    if (elapsedTime < 3) return 'Normalizing...'
    if (elapsedTime < 4) return 'Selecting HVGs & PCA...'
    if (elapsedTime < 5) return 'Building KNN graph...'
    if (elapsedTime < 6) return 'Leiden clustering...'
    if (elapsedTime < 7) return 'Computing UMAP...'
    return 'Finalizing...'
  }

  if (loading) {
    const stage = getStage()
    const progress = Math.min((elapsedTime / 8) * 100, 90)

    return (
      <div style={styles.loadingContainer}>
        <div style={styles.progressBarContainer}>
          <div style={{ ...styles.progressBar, width: `${progress}%` }}></div>
        </div>
        <p style={styles.stage}>{stage}</p>
      </div>
    )
  }

  if (!data || data.cells.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <p>Upload a CSV file and click Run to see results</p>
      </div>
    )
  }

  const chartData = data.cells.map((cell) => ({
    umap1: cell.umap1,
    umap2: cell.umap2,
    cluster: cell.cluster,
  }))

  const clusterColors = {}
  const uniqueClusters = [...new Set(data.cells.map((c) => c.cluster))]
  uniqueClusters.forEach((cluster, idx) => {
    clusterColors[cluster] = COLORS[idx % COLORS.length]
  })

  // Calculate data ranges with 5% padding
  const umap1Values = data.cells.map(c => c.umap1)
  const umap2Values = data.cells.map(c => c.umap2)
  const umap1Min = Math.min(...umap1Values)
  const umap1Max = Math.max(...umap1Values)
  const umap2Min = Math.min(...umap2Values)
  const umap2Max = Math.max(...umap2Values)
  const umap1Padding = (umap1Max - umap1Min) * 0.05
  const umap2Padding = (umap2Max - umap2Min) * 0.05

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>UMAP Embedding</h2>
        <p style={styles.stats}>
          {data.n_cells} cells | {data.n_clusters} clusters
        </p>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 60, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="umap1"
            type="number"
            domain={[umap1Min - umap1Padding, umap1Max + umap1Padding]}
            label={{ value: 'UMAP 1', position: 'insideBottom', offset: -10 }}
            tickFormatter={(value) => Math.round(value)}
          />
          <YAxis
            dataKey="umap2"
            type="number"
            domain={[umap2Min - umap2Padding, umap2Max + umap2Padding]}
            label={{ value: 'UMAP 2', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => Math.round(value)}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          {uniqueClusters.map((cluster) => (
            <Scatter
              key={cluster}
              dataKey="umap2"
              name={`Cluster ${cluster}`}
              data={chartData.filter((d) => d.cluster === cluster)}
              fill={clusterColors[cluster]}
              isAnimationActive={false}
            />
          ))}
          {data.cluster_labels && (
            <Scatter
              data={data.cluster_labels.map((label) => ({
                umap1: label.x,
                umap2: label.y,
                label: label.cluster,
              }))}
              fill="none"
              shape={<ClusterLabel />}
              isAnimationActive={false}
              legendType="none"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  stats: {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0 0 0',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  progressBarContainer: {
    width: '200px',
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0066cc',
    borderRadius: '4px',
    transition: 'width 0.1s linear',
  },
  stage: {
    fontSize: '14px',
    color: '#333',
    marginTop: '15px',
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0066cc',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px',
  },
  emptyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    color: '#999',
  },
}

const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = keyframes
  document.head.appendChild(style)
}
