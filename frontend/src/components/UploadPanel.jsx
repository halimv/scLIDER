export default function UploadPanel({ file, onFileSelect }) {
  return (
    <div style={styles.container}>
      <label style={styles.label}>
        <input
          type="file"
          accept=".csv,.zip"
          onChange={(e) => onFileSelect(e.target.files?.[0])}
          style={styles.input}
        />
        <span style={styles.buttonText}>
          {file ? `📁 ${file.name}` : '📤 Upload CSV or 10X ZIP'}
        </span>
      </label>
      <p style={styles.hint}>CSV or ZIP (10X matrix directory)</p>
    </div>
  )
}

const styles = {
  container: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    cursor: 'pointer',
  },
  input: {
    display: 'none',
  },
  buttonText: {
    display: 'block',
    padding: '10px 16px',
    backgroundColor: '#0066cc',
    color: 'white',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  },
  hint: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px',
    marginBottom: 0,
  },
}
