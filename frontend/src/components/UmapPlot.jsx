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

export default function UmapPlot({ data, loading, params, datasetName, onLoadDemo, onDownload }) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => setElapsedTime(t => t + 0.1), 100)
    return () => clearInterval(interval)
  }, [loading])

  const dim1Key = params?.embedding_method === 'tsne' ? 'tsne1' : 'umap1'
  const dim2Key = params?.embedding_method === 'tsne' ? 'tsne2' : 'umap2'
  const embeddingName = params?.embedding_method === 'tsne' ? 't-SNE' : 'UMAP'

  if (data && data.cells.length > 0) {
    const dim1Values = data.cells.map(c => c[dim1Key])
    const dim2Values = data.cells.map(c => c[dim2Key])
    console.log(`${embeddingName} data received:`)
    console.log(`  X range: [${Math.min(...dim1Values).toFixed(2)}, ${Math.max(...dim1Values).toFixed(2)}]`)
    console.log(`  Y range: [${Math.min(...dim2Values).toFixed(2)}, ${Math.max(...dim2Values).toFixed(2)}]`)
    console.log(`  Cells: ${data.cells.length}`)
  }

  const getStage = () => {
    if (elapsedTime < 1) return 'Loading data...'
    if (elapsedTime < 2) return 'QC & Filtering...'
    if (elapsedTime < 3) return 'Normalizing...'
    if (elapsedTime < 4) return 'Selecting HVGs & PCA...'
    if (elapsedTime < 5) return 'Building KNN graph...'
    if (elapsedTime < 6) return 'Leiden clustering...'
    if (elapsedTime < 7) return `Computing ${embeddingName}...`
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
        <div style={styles.tutorialContent}>
          <h2 style={styles.tutorialTitle}>Welcome to scLIDER</h2>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🚀 Quick Start</h3>
            <button
              onClick={onLoadDemo}
              style={styles.demoButtonLarge}
            >
              📊 Load Demo Dataset (Thymus 10X)
            </button>
            <p style={styles.sectionText}>
              Demo dataset from <em>Tabula Muris</em>, a comprehensive single-cell transcriptomic atlas of mouse tissues.
              This is the thymus tissue with ~1500 cells from 10X Genomics sequencing.
            </p>
            <p style={styles.sectionText}>Or upload your own CSV or 10X ZIP file using the panel on the left.</p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📋 Pipeline Overview</h3>
            <p style={styles.sectionText}>
              scLIDER performs quality control, normalization, dimensionality reduction, and clustering on single-cell RNA-seq data:
            </p>
            <ol style={styles.list}>
              <li><strong>QC Filtering:</strong> Remove low-quality cells based on gene count and mitochondrial percentage</li>
              <li><strong>Normalization:</strong> Library size normalization and log-transformation</li>
              <li><strong>HVG Selection:</strong> Identify highly variable genes for downstream analysis</li>
              <li><strong>PCA:</strong> Dimensionality reduction to principal components</li>
              <li><strong>Neighbors:</strong> Build k-nearest neighbor graph</li>
              <li><strong>Clustering:</strong> Leiden community detection</li>
              <li><strong>Embedding:</strong> UMAP or t-SNE visualization</li>
            </ol>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📚 Resources</h3>
            <p style={styles.sectionText}>
              Learn more about the tools used:
              <br />
              <a href="https://scanpy.readthedocs.io/" target="_blank" rel="noopener noreferrer" style={styles.link}>
                Scanpy Documentation
              </a>
              {' | '}
              <a href="https://umap-learn.readthedocs.io/" target="_blank" rel="noopener noreferrer" style={styles.link}>
                UMAP
              </a>
              {' | '}
              <a href="https://scikit-learn.org/stable/modules/manifold.html#t-sne" target="_blank" rel="noopener noreferrer" style={styles.link}>
                t-SNE
              </a>
              {' | '}
              <a href="https://github.com/vtraag/leidenalg" target="_blank" rel="noopener noreferrer" style={styles.link}>
                Leiden
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  const chartData = data.cells.map((cell) => ({
    [dim1Key]: cell[dim1Key],
    [dim2Key]: cell[dim2Key],
    cluster: cell.cluster,
  }))

  const clusterColors = {}
  const uniqueClusters = [...new Set(data.cells.map((c) => c.cluster))]
  uniqueClusters.forEach((cluster, idx) => {
    clusterColors[cluster] = COLORS[idx % COLORS.length]
  })

  // Calculate data ranges with 5% padding
  const dim1Values = data.cells.map(c => c[dim1Key])
  const dim2Values = data.cells.map(c => c[dim2Key])
  const dim1Min = Math.min(...dim1Values)
  const dim1Max = Math.max(...dim1Values)
  const dim2Min = Math.min(...dim2Values)
  const dim2Max = Math.max(...dim2Values)
  const dim1Padding = (dim1Max - dim1Min) * 0.05
  const dim2Padding = (dim2Max - dim2Min) * 0.05

  const embeddingTitle = params?.embedding_method === 'tsne' ? 'tSNE' : 'UMAP'
  const displayName = datasetName === 'demo' ? 'demo' : datasetName?.replace(/\.[^/.]+$/, '') || 'data'

  const paramStr = params
    ? `res=${params.clustering_resolution} | embed=${params.embedding_method} | n_genes=${params.n_genes_min} | pct_mt=${params.pct_mt_max} | n_hvgs=${params.n_top_genes} | n_pcs=${params.n_pcs} | n_neighbors=${params.n_neighbors} | umap_dist=${params.umap_min_dist} | umap_lr=${params.umap_learning_rate} | tsne_perp=${params.tsne_perplexity} | tsne_lr=${params.tsne_learning_rate}`
    : ''

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h2>{embeddingTitle} ({displayName}) | {data.n_cells} cells | {data.n_clusters} clusters</h2>
            {paramStr && <p style={styles.paramDetails}>{paramStr}</p>}
          </div>
          <button
            onClick={onDownload}
            disabled={!data}
            style={{
              ...styles.downloadButton,
              opacity: !data ? 0.5 : 1,
              cursor: !data ? 'not-allowed' : 'pointer',
            }}
            title="Download as PNG"
          >
            ⬇️
          </button>
        </div>
      </div>
      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={600}>
        <ScatterChart margin={{ top: 20, right: 60, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={dim1Key}
            type="number"
            domain={[dim1Min - dim1Padding, dim1Max + dim1Padding]}
            label={{ value: `${embeddingName} 1`, position: 'insideBottom', offset: -10 }}
            tickFormatter={(value) => Math.round(value)}
          />
          <YAxis
            dataKey={dim2Key}
            type="number"
            domain={[dim2Min - dim2Padding, dim2Max + dim2Padding]}
            label={{ value: `${embeddingName} 2`, angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => Math.round(value)}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          {uniqueClusters.map((cluster) => (
            <Scatter
              key={cluster}
              dataKey={dim2Key}
              name={`Cluster ${cluster}`}
              data={chartData.filter((d) => d.cluster === cluster)}
              fill={clusterColors[cluster]}
              isAnimationActive={false}
            />
          ))}
          {data.cluster_labels && (
            <Scatter
              data={data.cluster_labels.map((label) => ({
                [dim1Key]: label.x,
                [dim2Key]: label.y,
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
  chartWrapper: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
  },
  downloadButton: {
    padding: '8px 12px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  paramDetails: {
    fontSize: '11px',
    color: '#999',
    margin: '10px 0 0 0',
    fontFamily: 'monospace',
    lineHeight: '1.4',
    wordBreak: 'break-word',
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
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    color: '#333',
    overflow: 'auto',
  },
  tutorialContent: {
    maxWidth: '900px',
    padding: '60px 40px 40px 40px',
    width: '100%',
  },
  tutorialTitle: {
    fontSize: '32px',
    marginTop: '0px',
    marginBottom: '8px',
    color: '#1a1a2e',
    fontWeight: 700,
  },
  tutorialSubtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '40px',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: '12px',
  },
  sectionText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#555',
    marginBottom: '10px',
  },
  list: {
    fontSize: '14px',
    lineHeight: '1.8',
    color: '#555',
    paddingLeft: '20px',
  },
  demoButtonLarge: {
    padding: '12px 24px',
    backgroundColor: '#6c63ff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  paramGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '15px',
  },
  paramCard: {
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#555',
  },
  link: {
    color: '#0066cc',
    textDecoration: 'none',
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
