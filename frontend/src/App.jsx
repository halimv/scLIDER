import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import UploadPanel from './components/UploadPanel'
import ParamSliders from './components/ParamSliders'
import UmapPlot from './components/UmapPlot'
import { runPipeline } from './api'

export default function App() {
  const plotRef = useRef(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [datasetName, setDatasetName] = useState('demo')
  const [params, setParams] = useState({
    n_genes_min: 200,
    pct_mt_max: 10.0,
    normalization_method: 'log',
    n_top_genes: 2000,
    n_pcs: 30,
    n_neighbors: 15,
    clustering_method: 'leiden',
    clustering_resolution: 0.5,
    embedding_method: 'umap',
    umap_min_dist: 0.1,
    umap_learning_rate: 1.0,
    tsne_perplexity: 30.0,
    tsne_learning_rate: 200.0,
  })

  const handleRun = async () => {
    if (!file) {
      setError('Please upload a CSV file first')
      return
    }

    setLoading(true)
    setError(null)
    setDatasetName(file.name)

    try {
      const data = await runPipeline(file, params)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadDemo = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/demo')
      if (!response.ok) throw new Error('Failed to load demo dataset')
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!plotRef.current) return

    try {
      const canvas = await html2canvas(plotRef.current, { scale: 2 })
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().slice(0, 10)
      const paramStr = `${params.normalization_method}_${params.clustering_method}_${params.embedding_method.toUpperCase()}_cr=${params.clustering_resolution}`
      link.href = canvas.toDataURL('image/png')
      link.download = `scLIDER_${timestamp}_${paramStr}.png`
      link.click()
    } catch (err) {
      setError('Failed to download plot: ' + err.message)
    }
  }

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <h1>scLIDER</h1>
        <p>vizualize your scRNA-seq data</p>
      </header>

      <div style={styles.container}>
        <aside style={styles.sidebar}>
          <UploadPanel file={file} onFileSelect={setFile} />

          <ParamSliders params={params} onParamChange={setParams} />

          <button
            onClick={handleRun}
            disabled={loading || !file}
            style={{
              ...styles.runButton,
              opacity: loading || !file ? 0.5 : 1,
              cursor: loading || !file ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Running...' : '▶ Run Pipeline'}
          </button>

          {error && <div style={styles.error}>{error}</div>}
        </aside>

        <main style={styles.main} ref={plotRef}>
          <UmapPlot data={result} loading={loading} params={params} datasetName={datasetName} onLoadDemo={handleLoadDemo} onDownload={handleDownload} />
        </main>
      </div>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a1a2e',
    color: 'white',
    padding: '20px 30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '300px',
    backgroundColor: 'white',
    borderRight: '1px solid #ddd',
    padding: '20px',
    overflowY: 'auto',
    boxShadow: '2px 0 4px rgba(0,0,0,0.05)',
  },
  main: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
  },
  runButton: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 600,
    marginTop: '20px',
    transition: 'background-color 0.2s',
  },
  error: {
    marginTop: '15px',
    padding: '12px 16px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '6px',
    fontSize: '14px',
    border: '1px solid #f5c6cb',
  },
}
