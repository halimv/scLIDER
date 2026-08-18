import argparse
import pandas as pd
from pathlib import Path
from scrna_pipeline.pipeline import run_pipeline


def main():
    parser = argparse.ArgumentParser(description="scLIDER: Python scRNA-seq pipeline")

    parser.add_argument("--data", required=True, help="Path to 10X directory or CSV file")
    parser.add_argument("--output", default="output", help="Output directory")
    parser.add_argument("--n-genes-min", type=int, default=200, help="Min genes per cell")
    parser.add_argument("--pct-mt-max", type=float, default=10.0, help="Max mitochondrial percent")
    parser.add_argument("--n-top-genes", type=int, default=2000, help="Number of HVGs")
    parser.add_argument("--n-pcs", type=int, default=30, help="Number of PCs")
    parser.add_argument("--n-neighbors", type=int, default=15, help="KNN neighbors")
    parser.add_argument("--leiden-resolution", type=float, default=0.5, help="Leiden resolution")
    parser.add_argument("--umap-min-dist", type=float, default=0.1, help="UMAP min_dist")

    args = parser.parse_args()

    print(f"Loading data from {args.data}...")
    adata = run_pipeline(
        args.data,
        n_genes_min=args.n_genes_min,
        pct_mt_max=args.pct_mt_max,
        n_top_genes=args.n_top_genes,
        n_pcs=args.n_pcs,
        n_neighbors=args.n_neighbors,
        leiden_resolution=args.leiden_resolution,
        umap_min_dist=args.umap_min_dist,
    )

    Path(args.output).mkdir(exist_ok=True)

    print(f"Cells: {adata.n_obs} | Genes: {adata.n_vars}")

    umap_df = pd.DataFrame(
        adata.obsm['X_umap'],
        columns=['UMAP1', 'UMAP2'],
        index=adata.obs_names
    )
    umap_df['node'] = umap_df.index
    umap_df = umap_df[['node', 'UMAP1', 'UMAP2']]
    umap_df.to_csv(f"{args.output}/umap.csv", index=False)

    clusters_df = pd.DataFrame(
        {'cluster': adata.obs['leiden'].astype(int)},
        index=adata.obs_names
    )
    clusters_df['node'] = clusters_df.index
    clusters_df = clusters_df[['node', 'cluster']]
    clusters_df.to_csv(f"{args.output}/leiden_export_labels.csv", index=False)

    print(f"Output saved to {args.output}/")
    print(f"Unique clusters: {adata.obs['leiden'].nunique()}")


if __name__ == "__main__":
    main()
