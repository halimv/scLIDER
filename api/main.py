from numpy import asarray
import pandas as pd
import tempfile
import zipfile
import shutil
import json
import io
from pathlib import Path
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
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
    clustering_resolution: float = Form(0.5),
    embedding_method: str = Form("umap"),
    umap_min_dist: float = Form(0.1),
    umap_learning_rate: float = Form(1.0),
    tsne_perplexity: float = Form(30.0),
    tsne_learning_rate: float = Form(200.0),
):
    try:
        content = await file.read()
        print(f"DEBUG: Uploaded file size: {len(content)} bytes, filename: {file.filename}")

        # Handle CSV or ZIP files
        if file.filename and file.filename.endswith('.zip'):
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
            clustering_resolution=clustering_resolution,
            embedding_method=embedding_method,
            umap_min_dist=umap_min_dist,
            umap_learning_rate=umap_learning_rate,
            tsne_perplexity=tsne_perplexity,
            tsne_learning_rate=tsne_learning_rate,
        )

        print(f"DEBUG: Cells={adata.n_obs}, Genes={adata.n_vars}, Clusters={len(adata.obs['leiden'].unique())}")

        # Get the appropriate embedding coordinates
        if embedding_method == "tsne":
            embedding_key = 'X_tsne'
            dim1, dim2 = "tsne1", "tsne2"
        else:
            embedding_key = 'X_umap'
            dim1, dim2 = "umap1", "umap2"

        embedding_coords = asarray(adata.obsm[embedding_key])
        print(f"DEBUG: {embedding_method.upper()} X range: [{embedding_coords[:, 0].min():.2f}, {embedding_coords[:, 0].max():.2f}]")
        print(f"DEBUG: {embedding_method.upper()} Y range: [{embedding_coords[:, 1].min():.2f}, {embedding_coords[:, 1].max():.2f}]")

        # Cleanup
        if cleanup_dir:
            shutil.rmtree(cleanup_dir)
        else:
            Path(data_path).unlink()

        clusters = asarray(adata.obs['leiden'].astype(int))
        cell_names = adata.obs_names.tolist()

        cells = [
            {
                "node": str(cell_names[i]),
                dim1: float(embedding_coords[i, 0]),
                dim2: float(embedding_coords[i, 1]),
                "cluster": int(clusters[i]),
            }
            for i in range(len(cell_names))
        ]

        # Calculate cluster centroids for labels
        import numpy as np
        cluster_labels = []
        for cluster_id in sorted(adata.obs['leiden'].unique()):
            mask = clusters == int(cluster_id)
            centroid_x = float(np.mean(embedding_coords[mask, 0]))
            centroid_y = float(np.mean(embedding_coords[mask, 1]))
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


@app.get("/demo")
async def run_demo(
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
):
    """Run pipeline with built-in Thymus 10X demo dataset"""
    demo_zip = Path(__file__).parent.parent / "data" / "Thymus-10X.zip"

    if not demo_zip.exists():
        raise HTTPException(status_code=404, detail="Demo dataset not found")

    content = demo_zip.read_bytes()
    tmp_dir = tempfile.mkdtemp()
    zip_path = Path(tmp_dir) / "demo.zip"
    zip_path.write_bytes(content)

    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(tmp_dir)

    # Find the 10X data directory
    data_path = Path(tmp_dir)
    for item in data_path.rglob('matrix.mtx'):
        data_path = item.parent
        break

    try:
        adata = run_pipeline(
            str(data_path),
            n_genes_min=n_genes_min,
            pct_mt_max=pct_mt_max,
            n_top_genes=n_top_genes,
            n_pcs=n_pcs,
            n_neighbors=n_neighbors,
            clustering_resolution=clustering_resolution,
            embedding_method=embedding_method,
            umap_min_dist=umap_min_dist,
            umap_learning_rate=umap_learning_rate,
            tsne_perplexity=tsne_perplexity,
            tsne_learning_rate=tsne_learning_rate,
        )

        print(f"DEBUG: Demo - Cells={adata.n_obs}, Genes={adata.n_vars}, Clusters={len(adata.obs['leiden'].unique())}")

        shutil.rmtree(tmp_dir)

        # Get the appropriate embedding coordinates
        if embedding_method == "tsne":
            embedding_key = 'X_tsne'
            dim1, dim2 = "tsne1", "tsne2"
        else:
            embedding_key = 'X_umap'
            dim1, dim2 = "umap1", "umap2"

        embedding_coords = asarray(adata.obsm[embedding_key])
        clusters = asarray(adata.obs['leiden'].astype(int))
        cell_names = adata.obs_names.tolist()

        cells = [
            {
                "node": str(cell_names[i]),
                dim1: float(embedding_coords[i, 0]),
                dim2: float(embedding_coords[i, 1]),
                "cluster": int(clusters[i]),
            }
            for i in range(len(cell_names))
        ]

        cluster_labels = []
        for cluster_id in sorted(adata.obs['leiden'].unique()):
            mask = clusters == int(cluster_id)
            centroid_x = float(embedding_coords[mask, 0].mean())
            centroid_y = float(embedding_coords[mask, 1].mean())
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
    except Exception as e:
        shutil.rmtree(tmp_dir)
        raise HTTPException(status_code=500, detail=f"Demo pipeline error: {str(e)}")


@app.get("/health")
def health():
    return {"status": "ok"}
