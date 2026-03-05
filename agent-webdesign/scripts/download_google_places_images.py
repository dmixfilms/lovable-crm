#!/usr/bin/env python3
"""
Download Dumpling Room Images from Google Places
Usa Google Places API - LEGAL e SEGURO
"""

import os
import requests
import json
from pathlib import Path

OUTPUT_DIR = Path.home() / "Documents" / "dumpling-room-website" / "images"

def download_from_google_places():
    """
    Para usar Google Places API:

    1. Vá para: https://console.cloud.google.com/
    2. Crie um novo projeto
    3. Ative: Places API, Maps JavaScript API
    4. Crie uma API Key
    5. Cole a chave abaixo
    """

    API_KEY = os.getenv('GOOGLE_PLACES_API_KEY', '')

    if not API_KEY:
        print("""
╔════════════════════════════════════════════════════════════════╗
║  ⚠️  Google Places API Key não configurada                     ║
╚════════════════════════════════════════════════════════════════╝

Para usar esta função:

1. Vá para: https://console.cloud.google.com/
2. Crie um novo projeto (se não tiver)
3. Ative as APIs:
   - Places API
   - Maps JavaScript API
4. Vá em "Credenciais" > "Criar credencial" > "Chave API"
5. Configure a variável de ambiente:

   export GOOGLE_PLACES_API_KEY="sua-chave-aqui"

6. Execute novamente este script

Alternativa: Use o script Selenium (mais fácil!)
   python3 download_dumpling_images.py
        """)
        return 0

    # Busca o lugar
    search_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    search_params = {
        'query': 'Dumpling Room 124 King Street Newtown Sydney',
        'key': API_KEY
    }

    print("🔍 Buscando Dumpling Room no Google Places...")
    response = requests.get(search_url, params=search_params)
    data = response.json()

    if data['status'] != 'OK' or not data['results']:
        print("❌ Restaurante não encontrado")
        return 0

    place_id = data['results'][0]['place_id']
    print(f"✅ Encontrado! Place ID: {place_id}")

    # Busca detalhes com fotos
    detail_url = "https://maps.googleapis.com/maps/api/place/details/json"
    detail_params = {
        'place_id': place_id,
        'fields': 'photos',
        'key': API_KEY
    }

    print("📸 Buscando fotos...")
    response = requests.get(detail_url, params=detail_params)
    details = response.json()

    if 'photos' not in details['result']:
        print("❌ Nenhuma foto encontrada")
        return 0

    photos = details['result']['photos']
    count = 0

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for idx, photo in enumerate(photos[:10]):  # Máximo 10 fotos
        photo_reference = photo['photo_reference']
        photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference={photo_reference}&key={API_KEY}"

        try:
            response = requests.get(photo_url)
            if response.status_code == 200:
                filename = f"google_places_{idx:03d}.jpg"
                file_path = OUTPUT_DIR / filename
                with open(file_path, 'wb') as f:
                    f.write(response.content)
                count += 1
                print(f"  ✅ Salva: {filename}")
        except Exception as e:
            print(f"  ❌ Erro: {e}")

    return count

if __name__ == "__main__":
    count = download_from_google_places()
    if count > 0:
        print(f"\n✅ {count} imagens baixadas em: {OUTPUT_DIR}")
    else:
        print("\n💡 Use o script Selenium para método alternativo:")
        print("   python3 download_dumpling_images.py")
