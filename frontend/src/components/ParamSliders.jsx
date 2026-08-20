const DEFAULT_PARAMS = {
  n_genes_min: 200,
  pct_mt_max: 10.0,
  n_top_genes: 2000,
  n_pcs: 30,
  n_neighbors: 15,
  clustering_resolution: 0.5,
  embedding_method: 'umap',
  umap_min_dist: 0.1,
  umap_learning_rate: 1.0,
  tsne_perplexity: 30.0,
  tsne_learning_rate: 200.0,
}

export default function ParamSliders({ params, onParamChange }) {
  const handleChange = (key, value) => {
    onParamChange({ ...params, [key]: value })
  }

  const handleReset = (key) => {
    handleChange(key, DEFAULT_PARAMS[key])
  }

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h4>QC & Filtering</h4>
        <Slider
          label="Min genes per cell"
          value={params.n_genes_min}
          min={50}
          max={1000}
          defaultValue={DEFAULT_PARAMS.n_genes_min}
          onChange={(v) => handleChange('n_genes_min', v)}
          onReset={() => handleReset('n_genes_min')}
        />
        <Slider
          label="Max mitochondrial %"
          value={params.pct_mt_max}
          min={1}
          max={50}
          step={0.5}
          defaultValue={DEFAULT_PARAMS.pct_mt_max}
          onChange={(v) => handleChange('pct_mt_max', v)}
          onReset={() => handleReset('pct_mt_max')}
        />
      </div>

      <div style={styles.section}>
        <h4>HVG & PCA</h4>
        <Slider
          label="Highly variable genes"
          value={params.n_top_genes}
          min={500}
          max={5000}
          step={100}
          defaultValue={DEFAULT_PARAMS.n_top_genes}
          onChange={(v) => handleChange('n_top_genes', v)}
          onReset={() => handleReset('n_top_genes')}
        />
        <Slider
          label="Principal components"
          value={params.n_pcs}
          min={10}
          max={100}
          defaultValue={DEFAULT_PARAMS.n_pcs}
          onChange={(v) => handleChange('n_pcs', v)}
          onReset={() => handleReset('n_pcs')}
        />
      </div>

      <div style={styles.section}>
        <h4>Clustering</h4>
        <Slider
          label="KNN neighbors"
          value={params.n_neighbors}
          min={5}
          max={100}
          defaultValue={DEFAULT_PARAMS.n_neighbors}
          onChange={(v) => handleChange('n_neighbors', v)}
          onReset={() => handleReset('n_neighbors')}
        />
        <Slider
          label="Resolution"
          value={params.clustering_resolution}
          min={0.1}
          max={2}
          step={0.1}
          defaultValue={DEFAULT_PARAMS.clustering_resolution}
          onChange={(v) => handleChange('clustering_resolution', v)}
          onReset={() => handleReset('clustering_resolution')}
        />
      </div>

      <div style={styles.section}>
        <h4>Embedding</h4>
        <RadioGroup
          name="embedding_method"
          label="Method"
          value={params.embedding_method}
          options={['umap', 'tsne']}
          onChange={(v) => handleChange('embedding_method', v)}
        />
        {params.embedding_method === 'umap' && (
          <>
            <Slider
              label="Min distance"
              value={params.umap_min_dist}
              min={0.01}
              max={0.99}
              step={0.01}
              defaultValue={DEFAULT_PARAMS.umap_min_dist}
              onChange={(v) => handleChange('umap_min_dist', v)}
              onReset={() => handleReset('umap_min_dist')}
            />
            <Slider
              label="Learning rate"
              value={params.umap_learning_rate}
              min={0.1}
              max={2}
              step={0.1}
              defaultValue={DEFAULT_PARAMS.umap_learning_rate}
              onChange={(v) => handleChange('umap_learning_rate', v)}
              onReset={() => handleReset('umap_learning_rate')}
            />
          </>
        )}
        {params.embedding_method === 'tsne' && (
          <>
            <Slider
              label="Perplexity"
              value={params.tsne_perplexity}
              min={5}
              max={100}
              defaultValue={DEFAULT_PARAMS.tsne_perplexity}
              onChange={(v) => handleChange('tsne_perplexity', v)}
              onReset={() => handleReset('tsne_perplexity')}
            />
            <Slider
              label="Learning rate"
              value={params.tsne_learning_rate}
              min={10}
              max={1000}
              step={10}
              defaultValue={DEFAULT_PARAMS.tsne_learning_rate}
              onChange={(v) => handleChange('tsne_learning_rate', v)}
              onReset={() => handleReset('tsne_learning_rate')}
            />
          </>
        )}
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, step = 1, onChange, onReset, defaultValue }) {
  const isDefault = value === defaultValue

  return (
    <div style={styles.sliderGroup}>
      <div style={styles.labelRow}>
        <label style={styles.sliderLabel}>
          {label}: <span style={styles.value}>{value.toFixed(2)}</span>
        </label>
        <button
          onClick={onReset}
          disabled={isDefault}
          style={{
            ...styles.resetButton,
            opacity: isDefault ? 0.4 : 1,
            cursor: isDefault ? 'not-allowed' : 'pointer',
          }}
          title="Reset to default"
        >
          🔄
        </button>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={styles.slider}
      />
    </div>
  )
}

function RadioGroup({ name, label, value, options, onChange }) {
  const getDisplayLabel = (option) => {
    const labelMap = {
      'umap': 'UMAP',
      'tsne': 'tSNE',
      'leiden': 'Leiden',
      'louvain': 'Louvain',
    }
    return labelMap[option] || option.charAt(0).toUpperCase() + option.slice(1)
  }

  return (
    <div style={styles.radioGroup}>
      <label style={styles.sliderLabel}>{label}</label>
      <div style={styles.radioOptions}>
        {options.map((option) => (
          <label key={option} style={styles.radioLabel}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              style={styles.radioInput}
            />
            <span style={styles.radioText}>{getDisplayLabel(option)}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  section: {
    paddingBottom: '15px',
    borderBottom: '1px solid #ddd',
  },
  sliderGroup: {
    marginBottom: '12px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  sliderLabel: {
    fontSize: '14px',
    fontWeight: 500,
    margin: 0,
  },
  value: {
    color: '#0066cc',
    fontWeight: 600,
  },
  resetButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 6px',
    transition: 'transform 0.2s, opacity 0.2s',
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
  },
  radioGroup: {
    marginBottom: '12px',
  },
  radioOptions: {
    display: 'flex',
    gap: '12px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  radioInput: {
    cursor: 'pointer',
  },
  radioText: {
    userSelect: 'none',
  },
}
