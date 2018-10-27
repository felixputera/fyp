# Felix's Online Text Highlighting FYP

## READMEs
- [Server](server/README.md)
- [Frontend](frontend/README.md)

## Requirement
- pipenv (for backend)
- npm / yarn (for frontend)

## Installation
### Backend & Notebook
*Optional: you might want to rename the env name in `environment.yml`*

In your terminal:

```bash
conda env create -f environment.yml
conda activate fyp # or the name that you had renamed in environment.yml
```

### Frontend
```bash
cd frontend
yarn install # or npm install
``` 

## Usage
### Backend
*Make sure that you had activated the conda env*

```bash
cd backend
python application.py
```

### Frontend
```bash
cd frontend
yarn start
```