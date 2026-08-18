export async function runPipeline(file, params) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('n_genes_min', params.n_genes_min)
  formData.append('pct_mt_max', params.pct_mt_max)
  formData.append('n_top_genes', params.n_top_genes)
  formData.append('n_pcs', params.n_pcs)
  formData.append('n_neighbors', params.n_neighbors)
  formData.append('leiden_resolution', params.leiden_resolution)
  formData.append('umap_min_dist', params.umap_min_dist)

  const response = await fetch('/api/run', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Pipeline failed')
  }

  return response.json()
}
