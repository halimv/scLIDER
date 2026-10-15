# scLIDER

**A powerful, interactive web-based tool for single-cell RNA-seq (scRNA-seq) analysis**

Visualize, analyze, and explore your single-cell transcriptomics data with an intuitive interface. Process raw sequencing data through quality control, normalization, and clustering pipelines, then interactively explore the results with configurable dimensionality reduction and embedding techniques.

## 🎯 Features

- **📊 Interactive Visualization**: Real-time UMAP/t-SNE plots with cluster highlighting and point tooltips
- **🔧 Quality Control & Filtering**: Automatically filter cells and genes based on QC metrics
  - Minimum genes per cell threshold
  - Maximum mitochondrial percentage filter
- **📈 Normalization & Feature Selection**: 
  - Log normalization of gene expression data
  - Highly variable gene selection
- **🎨 Dimensionality Reduction**: 
  - Principal Component Analysis (PCA) for initial dimensionality reduction
  - UMAP embedding with configurable parameters
  - t-SNE embedding with adjustable perplexity
- **🔗 Graph-based Clustering**: Leiden clustering with configurable resolution
- **📥 Multiple Data Formats**: Support for 10X Genomics and CSV formats
- **💾 Easy Export**: Download plots and processed data
- **⚡ Demo Dataset**: Built-in demo dataset for quick exploration

## 🖼️ User Interface

### Application Layout

The scLIDER interface follows a classic sidebar + main content pattern:

```
┌──────────────────────────────────────────────────────────────┐
│  scLIDER Header                                              │
├──────────────────────┬──────────────────────────────────────┤
│                      │  Header: UMAP (demo) | 1500 cells   │
│   LEFT SIDEBAR       │  Parameters: res=0.5 | embed=umap   │
│   ┌───────────────┐  │  Download Button ⬇️                  │
│   │ Upload CSV    │  │                                      │
│   │ or 10X ZIP    │  │  ┌────────────────────────────────┐  │
│   └───────────────┘  │  │   Recharts ScatterChart        │  │
│   ┌───────────────┐  │  │                                │  │
│   │ QC & Filter:  │  │  │   ●  ●     ●  ●              │  │
│   │ • Min genes   │  │  │  ●    ●   ●    ●   ●         │  │
│   │ • Max MT %    │  │  │ ●   ●   ●   ●     ●  ●      │  │
│   │               │  │  │                                │  │
│   │ HVG & PCA:    │  │  │   Legend:                     │  │
│   │ • HVG Count   │  │  │   ◆ Cluster 0  ◆ Cluster 3  │  │
│   │ • PCA Dims    │  │  │   ◆ Cluster 1  ◆ Cluster 4  │  │
│   │               │  │  │   ◆ Cluster 2  ◆ Cluster 5  │  │
│   │ Clustering:   │  │  │                                │  │
│   │ • K Neighbors │  │  │  Empty State (before run):    │  │
│   │ • Resolution  │  │  │  Welcome to scLIDER           │  │
│   │               │  │  │  [📊 Load Demo Dataset]       │  │
│   │ Embedding:    │  │  │  (Thymus 10X)                 │  │
│   │ ○ UMAP        │  │  └────────────────────────────────┘  │
│   │ ○ t-SNE       │  │                                      │
│   │               │  │  Loading State:                     │
│   │ [▶ RUN]       │  │  [████████░░░░░░░░] 40%            │
│   │               │  │  Computing UMAP...                 │
│   └───────────────┘  │                                      │
│                      │  ↑ Main visualization area (Recharts)│
└──────────────────────┴──────────────────────────────────────┘
```

### Key Interface Components

**Left Sidebar:**
- **Upload Panel**: Select CSV or 10X ZIP files
- **Parameter Sections**: Organized by analysis stage
  - QC & Filtering (Min genes, Max MT%)
  - HVG & PCA (Gene count, dimensions)
  - Clustering (K neighbors, Resolution)
  - Embedding (UMAP/t-SNE with method-specific parameters)
- **Reset Buttons**: Each parameter has a reset-to-default button
- **Run Pipeline Button**: Large green button to execute analysis

**Main Visualization Area:**
- **Header**: Shows embedding method, dataset name, cell count, cluster count
- **Parameter Details**: Displays all current parameter values
- **Download Button**: Export visualization as PNG
- **ScatterChart**: Recharts-based interactive scatter plot
  - Points colored by cluster assignment
  - Cartesian grid with axis labels
  - Hover tooltip showing coordinates
  - Legend showing cluster names
- **Empty State**: Welcome message with "Load Demo Dataset" button
- **Loading State**: Progress bar with stage indicators

## Project Structure

```
scLIDER/
├── api/                          # FastAPI backend
│   └── main.py                   # API endpoints for data upload and analysis
├── scrna_pipeline/               # Analysis pipeline
│   ├── pipeline.py               # Core scRNA-seq processing logic
│   └── cli.py                    # Command-line interface
├── frontend/                     # React/Vite web interface
│   ├── src/                      # React components and pages
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite configuration
├── data/                         # Sample data directory
└── requirements.txt              # Python dependencies
```

## Tech Stack

**Backend:**
- Python 3.9+
- FastAPI for REST API
- Scanpy for scRNA-seq analysis
- AnnData for data structures
- Leiden for graph-based clustering

**Frontend:**
- React 18
- Vite build tool
- Recharts for visualization

## 💻 System Requirements

### Minimum Requirements
- **Python**: 3.9 or higher
- **Node.js**: 16 or higher
- **RAM**: 8 GB (16 GB recommended for large datasets)
- **Disk Space**: 2 GB for dependencies
- **OS**: Windows, macOS, or Linux

### Python Dependencies (Backend)
- scanpy (single-cell analysis)
- pandas, numpy, scipy (data processing)
- umap-learn, scikit-learn (dimensionality reduction)
- leidenalg (clustering)
- fastapi, uvicorn (API server)

### JavaScript Dependencies (Frontend)
- React 18
- Vite (build tool)
- Recharts (visualization)

## Installation

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd scLIDER
```

2. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

## 🚀 Getting Started

### Quick Start (Development)

#### Terminal 1: Start the Backend API
```bash
cd /path/to/scLIDER
source venv/bin/activate  # or on Windows: venv\Scripts\activate
uvicorn api.main:app --reload
```
The API will be available at `http://localhost:8000` with interactive API docs at `http://localhost:8000/docs`

#### Terminal 2: Start the Frontend
```bash
cd /path/to/scLIDER/frontend
npm run dev
```
Open your browser to `http://localhost:5173`

### Complete Workflow

#### 1. **Load Data**
   - Click "Upload CSV" to select your data, OR
   - Click "Load Demo" to use the built-in demo dataset
   - Supported formats:
     - **CSV**: Gene expression matrix with genes as rows, cells as columns
     - **10X Genomics**: Zipped directory containing matrix.mtx, features.tsv, barcodes.tsv

#### 2. **Configure Analysis Parameters**
   Use the sliders in the left sidebar to adjust:
   
   | Parameter | Range | Default | Purpose |
   |-----------|-------|---------|---------|
   | Min Genes | 0-1000 | 200 | Minimum genes per cell (QC filter) |
   | Max MT % | 0-100 | 10 | Maximum mitochondrial % (QC filter) |
   | HVG Count | 1000-5000 | 2000 | Highly variable genes to select |
   | PCA Dims | 10-100 | 30 | Principal components |
   | K Neighbors | 5-30 | 15 | KNN graph parameter |
   | Clustering Res | 0.1-2.0 | 0.5 | Leiden resolution (higher = more clusters) |
   | Embedding | UMAP/t-SNE | UMAP | Dimensionality reduction method |

#### 3. **Run Analysis**
   - Click the green **"▶ Run Pipeline"** button
   - Watch the status indicator as the analysis runs
   - Analysis includes:
     - Quality control filtering
     - Log normalization
     - Highly variable gene selection
     - PCA computation
     - KNN graph construction
     - Leiden clustering
     - UMAP or t-SNE embedding

#### 4. **Explore Results**
   - View the interactive scatter plot showing all cells
   - Cells are colored by cluster assignment
   - Hover over points to see cell information
   - Zoom and pan to explore specific regions
   - Click **"📥 Download"** to save the visualization as PNG

### Advanced: Production Build

**Build frontend for production:**
```bash
cd frontend
npm run build
npm run preview
```

**Deploy with production server:**
```bash
# Use a production ASGI server instead of --reload
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

## ⚙️ Configuration Parameters

### Quality Control & Filtering
| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `n_genes_min` | int | 200 | 0-1000 | Minimum genes per cell threshold |
| `pct_mt_max` | float | 10.0 | 0-100 | Maximum mitochondrial percentage |

### Feature Selection
| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `n_top_genes` | int | 2000 | 1000-5000 | Number of highly variable genes |

### Dimensionality Reduction
| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `n_pcs` | int | 30 | 10-100 | Number of PCA components |

### Graph Construction & Clustering
| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `n_neighbors` | int | 15 | 5-30 | K-nearest neighbors for graph |
| `clustering_resolution` | float | 0.5 | 0.1-2.0 | Leiden clustering resolution |

### UMAP Embedding
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `umap_min_dist` | float | 0.1 | Minimum distance between points (0-1) |
| `umap_learning_rate` | float | 1.0 | Learning rate for optimization |

### t-SNE Embedding
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `tsne_perplexity` | float | 30.0 | Perplexity parameter (5-50) |
| `tsne_learning_rate` | float | 200.0 | Learning rate for optimization |

### Embedding Method Selection
- **UMAP** (default): Faster, better global structure preservation, good for large datasets
- **t-SNE**: Emphasizes local structure, excellent for small datasets, slower computation

## 🔌 API Endpoints

### POST `/run`
Uploads data and runs the complete analysis pipeline.

**Request:**
```
Content-Type: multipart/form-data

file: <CSV or ZIP file>
n_genes_min: int (default: 200)
pct_mt_max: float (default: 10.0)
n_top_genes: int (default: 2000)
n_pcs: int (default: 30)
n_neighbors: int (default: 15)
clustering_resolution: float (default: 0.5)
embedding_method: "umap" | "tsne" (default: "umap")
umap_min_dist: float (default: 0.1)
umap_learning_rate: float (default: 1.0)
tsne_perplexity: float (default: 30.0)
tsne_learning_rate: float (default: 200.0)
```

**Response:**
- `200 OK`: JSON containing:
  - `X_umap` or `X_tsne`: 2D embedding coordinates
  - `leiden`: Cluster assignments for each cell
  - Cell metadata and quality metrics

**Example cURL:**
```bash
curl -X POST http://localhost:8000/run \
  -F "file=@data.csv" \
  -F "n_genes_min=200" \
  -F "clustering_resolution=0.5" \
  -F "embedding_method=umap"
```

### GET `/api/demo`
Loads the built-in demo dataset with current parameters.

**Query Parameters:**
Same as `/run` endpoint (all parameters as query strings)

**Response:**
- Demo dataset analysis results in JSON format

## 🛠️ Development

### Project Architecture

**Backend (FastAPI):**
- `api/main.py`: REST API endpoints and request handling
- `scrna_pipeline/pipeline.py`: Core analysis logic
- Handles data validation, processing, and result serialization

**Frontend (React + Vite):**
- `frontend/src/App.jsx`: Main application component
- `frontend/src/components/`:
  - `UploadPanel.jsx`: File upload interface
  - `ParamSliders.jsx`: Parameter configuration
  - `UmapPlot.jsx`: Interactive visualization using Recharts
- `frontend/src/api.js`: API client

### Running Tests
```bash
# Backend tests (if available)
pytest

# Frontend tests (if available)
npm test
```

### Code Structure Notes
- **Backend**: Handles data I/O, parameter validation, and pipeline orchestration
  - Supports both CSV and 10X formats
  - Processes large datasets efficiently
  - Returns results as JSON with embedding coordinates
- **Pipeline**: Separated module for CLI/standalone usage potential
- **Frontend**: Single-page application communicating with API via HTTP requests
- **Visualization**: Interactive Recharts-based scatter plots with hover information

### Adding New Features

**To add a new analysis parameter:**
1. Add to `scrna_pipeline/pipeline.py` function signature
2. Add to `api/main.py` Form parameter
3. Add to `frontend/src/App.jsx` state and ParamSliders
4. Update frontend API call in `frontend/src/api.js`

**To add a new visualization:**
1. Create new component in `frontend/src/components/`
2. Import in `frontend/src/App.jsx`
3. Pass result data as props

## 📁 Data Format Support

### CSV Format
Simple comma-separated values with:
- **Rows**: Gene names (first column is gene ID)
- **Columns**: Cell barcodes/IDs in header row
- **Values**: Raw or normalized gene expression counts

Example:
```
gene_id,cell_001,cell_002,cell_003,...
GENE1,0,5,2,...
GENE2,10,0,8,...
GENE3,1,3,0,...
```

### 10X Genomics Format
Standard 10X output directory structure (supports Matrix Market format):
```
data_directory/
├── matrix.mtx          # Gene-cell expression matrix
├── features.tsv        # Gene names and IDs
└── barcodes.tsv        # Cell barcodes
```

Upload as a ZIP file containing these three files.

## 📊 Output & Results

After analysis completes, the application provides:
- **Interactive Visualization**: UMAP/t-SNE plot colored by cluster
- **Downloadable PNG**: High-resolution plot image (date + parameters in filename)
- **Cell Metadata**: Cluster assignments and coordinates
- **Analysis Results**: Stored in AnnData object format
- **Log**: Console output with analysis statistics

### Output File Naming
Downloaded plots follow the pattern:
```
scLIDER_YYYY-MM-DD_leiden_{METHOD}_cr={RESOLUTION}.png
```
Example: `scLIDER_2024-08-20_leiden_UMAP_cr=0.5.png`

## 🐛 Troubleshooting

### Common Issues

**Q: Frontend won't connect to backend (CORS error)**
- ✅ Ensure backend is running on `http://localhost:8000`
- ✅ Check CORS middleware in `api/main.py` allows requests
- ✅ Verify both servers are running in separate terminals

**Q: Upload fails with "Invalid data format"**
- ✅ For CSV: Ensure genes are rows, cells are columns
- ✅ For 10X: Verify ZIP contains `matrix.mtx`, `features.tsv`, `barcodes.tsv`
- ✅ Check file size (very large datasets may need increased timeouts)

**Q: Analysis runs but produces blank plot**
- ✅ Check that input file has sufficient cells and genes
- ✅ Verify parameters aren't too restrictive (e.g., `n_genes_min` too high)
- ✅ Try with demo dataset first to verify installation
- ✅ Check browser console for error messages

**Q: Slow performance on large datasets**
- ✅ UMAP is faster than t-SNE; use UMAP for large datasets (>100k cells)
- ✅ Reduce `n_top_genes` for faster HVG selection
- ✅ Reduce `n_pcs` if dimensionality is not critical
- ✅ Consider running on a machine with more RAM/CPU cores

**Q: "Module not found" Python error**
- ✅ Verify virtual environment is activated: `source venv/bin/activate`
- ✅ Reinstall requirements: `pip install -r requirements.txt`
- ✅ Check Python version is 3.9+: `python --version`

**Q: Node modules not working**
- ✅ Clear node_modules: `rm -rf node_modules package-lock.json`
- ✅ Reinstall: `npm install`
- ✅ Try `npm ci` for clean installation

### Getting Help

1. **Check the console** in your browser (F12) for error messages
2. **Check the terminal** running the backend for detailed logs
3. **Try the demo dataset** to verify the installation works
4. **Open an issue** on the repository with error messages and dataset info

## 📚 References

- **Scanpy Documentation**: https://scanpy.readthedocs.io/
- **UMAP**: https://umap-learn.readthedocs.io/
- **t-SNE**: https://github.com/scikit-learn/scikit-learn
- **Leiden Clustering**: https://github.com/vtraag/leidenalg

## 📄 Citation

If you use scLIDER in your research, please cite:
```
scLIDER: Interactive visualization tool for single-cell RNA-seq analysis
Available at: https://github.com/vaniahalim/scLIDER
```

## 📜 License

[Add appropriate license information]

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💬 Support

For issues, questions, or feature requests:
- 📧 Open an issue on the repository
- 💡 Check existing issues for similar problems
- 📝 Include dataset info and error messages when reporting bugs
