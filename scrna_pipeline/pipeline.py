import scanpy as sc
import anndata as ad
from pathlib import Path


def run_pipeline(
    data_path: str,
    n_genes_min: int = 200,
    pct_mt_max: float = 10.0,
    n_top_genes: int = 2000,
    n_pcs: int = 30,
    n_neighbors: int = 15,
    clustering_resolution: float = 0.5,
    clustering_method: str = "leiden",
    embedding_method: str = "umap",
    umap_min_dist: float = 0.1,
    umap_learning_rate: float = 1.0,
    tsne_perplexity: float = 30.0,
    tsne_learning_rate: float = 200.0,
    tsne_n_iter: int = 1000,
    progress_callback=None,
) -> ad.AnnData:
    """
    Run full scRNA-seq analysis pipeline.

    Parameters
    ----------
    data_path : str
        Path to 10X data directory or CSV file (genes x cells).
    n_genes_min : int
        Minimum number of genes per cell.
    pct_mt_max : float
        Maximum percent mitochondrial reads per cell.
    n_top_genes : int
        Number of highly variable genes to keep.
    n_pcs : int
        Number of principal components.
    n_neighbors : int
        Number of neighbors for KNN graph.
    clustering_resolution : float
        Resolution parameter for clustering (Leiden or Louvain).
    clustering_method : str
        Clustering algorithm to use: "leiden" or "louvain".
    embedding_method : str
        Embedding method: "umap" or "tsne".
    umap_min_dist : float
        Minimum distance for UMAP embedding.
    umap_learning_rate : float
        Learning rate (alpha) for UMAP optimization.
    tsne_perplexity : float
        Perplexity parameter for t-SNE.
    tsne_learning_rate : float
        Learning rate for t-SNE optimization.
    tsne_n_iter : int
        Number of iterations for t-SNE.

    Returns
    -------
    ad.AnnData
        Processed AnnData object with embeddings and clusters.
    """

    def _progress(stage):
        if progress_callback:
            progress_callback(stage)

    # Load data
    _progress("Loading data...")
    path = Path(data_path)
    if path.is_dir():
        adata = sc.read_10x_mtx(data_path, var_names='gene_symbols', cache=True)
    elif path.suffix == '.csv':
        import pandas as pd
        df = pd.read_csv(data_path, index_col=0)
        adata = ad.AnnData(X=df.T.values, obs=pd.DataFrame(index=df.columns), var=pd.DataFrame(index=df.index))
    else:
        raise ValueError("Data must be 10X directory or CSV file")

    # QC and filtering
    _progress("QC & Filtering...")
    adata.var["mt"] = adata.var_names.str.startswith("Mt-") | adata.var_names.str.startswith("MT-")
    adata.var["ribo"] = adata.var_names.str.startswith(("RPS", "RPL"))
    adata.var["hb"] = adata.var_names.str.contains("^HB[^(P)]")
    sc.pp.calculate_qc_metrics(adata, qc_vars=["mt", "ribo", "hb"], inplace=True, log1p=True)
    adata = adata[
        (adata.obs['n_genes_by_counts'] > n_genes_min) &
        (adata.obs['pct_counts_mt'] < pct_mt_max)
    ]

    # Normalize
    _progress("Normalizing...")
    sc.pp.normalize_total(adata)
    sc.pp.log1p(adata)

    # HVG selection and PCA
    _progress("Selecting HVGs & PCA...")
    sc.pp.highly_variable_genes(adata, n_top_genes=n_top_genes)
    sc.tl.pca(adata, n_comps=n_pcs, use_highly_variable=True)

    # Clustering and embedding
    _progress("Building KNN graph...")
    sc.pp.neighbors(adata, n_neighbors=n_neighbors, use_rep='X_pca')

    if clustering_method == "leiden":
        _progress("Leiden clustering...")
        sc.tl.leiden(adata, resolution=clustering_resolution)
    elif clustering_method == "louvain":
        _progress("Louvain clustering...")
        sc.tl.louvain(adata, resolution=clustering_resolution)
    else:
        raise ValueError(f"Unknown clustering method: {clustering_method}")

    if embedding_method == "umap":
        _progress("Computing UMAP...")
        sc.tl.umap(adata, min_dist=umap_min_dist, alpha=umap_learning_rate)
    elif embedding_method == "tsne":
        _progress("Computing t-SNE...")
        sc.tl.tsne(adata, perplexity=tsne_perplexity, learning_rate=tsne_learning_rate, n_iter=tsne_n_iter)
    else:
        raise ValueError(f"Unknown embedding method: {embedding_method}")

    _progress("Done!")

    return adata