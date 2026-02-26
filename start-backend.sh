#!/bin/bash

# Carregar variáveis do .env
export $(grep -v '^#' /Users/andersonvieira/Documents/lovable-crm/.env | xargs)

# Iniciar o backend
cd /Users/andersonvieira/Documents/lovable-crm/backend
uv run --python 3.13 uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
