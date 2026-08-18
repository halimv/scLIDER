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
      const paramStr = `n_genes_min=${params.n_genes_min}_pct_mt_max=${params.pct_mt_max}_norm=${params.normalization_method}_n_top_genes=${params.n_top_genes}_n_pcs=${params.n_pcs}_n_neighbors=${params.n_neighbors}_clustering=${params.clustering_method}_clust_res=${params.clustering_resolution}_embedding=${params.embedding_method}_umap_dist=${params.umap_min_dist}_umap_lr=${params.umap_learning_rate}_tsne_perp=${params.tsne_perplexity}_tsne_lr=${params.tsne_learning_rate}`
      link.href = canvas.toDataURL('image/png')
      link.download = `scLIDER_${params.embedding_method.toUpperCase()}_${timestamp}_${paramStr}.png`
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
          <button
            onClick={handleLoadDemo}
            disabled={loading}
            style={{
              ...styles.demoButton,
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Running...' : '📊 Demo: Load & Run (Default Params)'}
          </button>

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

          <button
            onClick={handleDownload}
            disabled={!result}
            style={{
              ...styles.downloadButton,
              opacity: !result ? 0.5 : 1,
              cursor: !result ? 'not-allowed' : 'pointer',
            }}
          >
            💾 Download PNG
          </button>

          {error && <div style={styles.error}>{error}</div>}
        </aside>

        <main style={styles.main} ref={plotRef}>
          <UmapPlot data={result} loading={loading} />
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
  demoButton: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#6c63ff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '10px',
    transition: 'background-color 0.2s',
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
  downloadButton: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 600,
    marginTop: '10px',
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
