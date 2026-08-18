from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import tempfile
import zipfile
import pandas as pd
import json
import io
from pathlib import Path
from scrna_pipeline.pipeline import run_pipeline

app = FastAPI(title="scLIDER API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/run")
async def run_analysis(
    file: UploadFile = File(...),
    n_genes_min: int = Form(200),
    pct_mt_max: float = Form(10.0),
    n_top_genes: int = Form(2000),
    n_pcs: int = Form(30),
    n_neighbors: int = Form(15),
    leiden_resolution: float = Form(0.5),
    umap_min_dist: float = Form(0.1),
):
    try:
        content = await file.read()
        print(f"DEBUG: Uploaded file size: {len(content)} bytes, filename: {file.filename}")

        # Handle CSV or ZIP files
        if file.filename.endswith('.zip'):
            # Extract ZIP to temp directory
            tmp_dir = tempfile.mkdtemp()
            zip_path = Path(tmp_dir) / "upload.zip"
            zip_path.write_bytes(content)

            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(tmp_dir)

            # Find the 10X data directory
            data_path = Path(tmp_dir)
            for item in data_path.rglob('matrix.mtx'):
                data_path = item.parent
                break

            print(f"DEBUG: Extracted 10X data from ZIP, path: {data_path}")
            cleanup_dir = tmp_dir
        else:
            # Handle CSV file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
                tmp.write(content)
                data_path = tmp.name
            cleanup_dir = None

        adata = run_pipeline(
            str(data_path),
            n_genes_min=n_genes_min,
            pct_mt_max=pct_mt_max,
            n_top_genes=n_top_genes,
            n_pcs=n_pcs,
            n_neighbors=n_neighbors,
            leiden_resolution=leiden_resolution,
            umap_min_dist=umap_min_dist,
        )

        print(f"DEBUG: Cells={adata.n_obs}, Genes={adata.n_vars}, Clusters={len(adata.obs['leiden'].unique())}")
        print(f"DEBUG: UMAP X range: [{adata.obsm['X_umap'][:, 0].min():.2f}, {adata.obsm['X_umap'][:, 0].max():.2f}]")
        print(f"DEBUG: UMAP Y range: [{adata.obsm['X_umap'][:, 1].min():.2f}, {adata.obsm['X_umap'][:, 1].max():.2f}]")

        # Cleanup
        if cleanup_dir:
            import shutil
            shutil.rmtree(cleanup_dir)
        else:
            Path(data_path).unlink()

        umap_coords = adata.obsm['X_umap']
        clusters = adata.obs['leiden'].astype(int).values
        cell_names = adata.obs_names.tolist()

        cells = [
            {
                "node": cell_names[i],
                "umap1": float(umap_coords[i, 0]),
                "umap2": float(umap_coords[i, 1]),
                "cluster": int(clusters[i]),
            }
            for i in range(len(cell_names))
        ]

        # Calculate cluster centroids for labels
        import numpy as np
        cluster_labels = []
        for cluster_id in sorted(adata.obs['leiden'].unique()):
            mask = clusters == int(cluster_id)
            centroid_x = float(np.mean(umap_coords[mask, 0]))
            centroid_y = float(np.mean(umap_coords[mask, 1]))
            cluster_labels.append({
                "cluster": int(cluster_id),
                "x": centroid_x,
                "y": centroid_y,
            })

        return {
            "cells": cells,
            "cluster_labels": cluster_labels,
            "n_cells": adata.n_obs,
            "n_clusters": len(adata.obs['leiden'].unique()),
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


@app.get("/health")
def health():
    return {"status": "ok"}
