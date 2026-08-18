export default function ParamSliders({ params, onParamChange }) {
  const handleChange = (key, value) => {
    onParamChange({ ...params, [key]: value })
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
          onChange={(v) => handleChange('n_genes_min', v)}
        />
        <Slider
          label="Max mitochondrial %"
          value={params.pct_mt_max}
          min={1}
          max={50}
          step={0.5}
          onChange={(v) => handleChange('pct_mt_max', v)}
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
          onChange={(v) => handleChange('n_top_genes', v)}
        />
        <Slider
          label="Principal components"
          value={params.n_pcs}
          min={10}
          max={100}
          onChange={(v) => handleChange('n_pcs', v)}
        />
      </div>

      <div style={styles.section}>
        <h4>Clustering</h4>
        <Slider
          label="KNN neighbors"
          value={params.n_neighbors}
          min={5}
          max={100}
          onChange={(v) => handleChange('n_neighbors', v)}
        />
        <Slider
          label="Resolution"
          value={params.clustering_resolution}
          min={0.1}
          max={2}
          step={0.1}
          onChange={(v) => handleChange('clustering_resolution', v)}
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
              onChange={(v) => handleChange('umap_min_dist', v)}
            />
            <Slider
              label="Learning rate"
              value={params.umap_learning_rate}
              min={0.1}
              max={2}
              step={0.1}
              onChange={(v) => handleChange('umap_learning_rate', v)}
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
              onChange={(v) => handleChange('tsne_perplexity', v)}
            />
            <Slider
              label="Learning rate"
              value={params.tsne_learning_rate}
              min={10}
              max={1000}
              step={10}
              onChange={(v) => handleChange('tsne_learning_rate', v)}
            />
          </>
        )}
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, step = 1, onChange }) {
  return (
    <div style={styles.sliderGroup}>
      <label style={styles.sliderLabel}>
        {label}: <span style={styles.value}>{value.toFixed(2)}</span>
      </label>
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
  sliderLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '6px',
  },
  value: {
    color: '#0066cc',
    fontWeight: 600,
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
