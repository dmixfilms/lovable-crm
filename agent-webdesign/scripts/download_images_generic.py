#!/usr/bin/env python3
"""
Download Imagens Genérico - Para QUALQUER Lead
Funciona com Selenium para qualquer restaurante/negócio
Uso: python3 download_images_generic.py "Nome-Do-Lead"
"""

import os
import sys
import time
import requests
from pathlib import Path
from urllib.parse import urljoin, urlparse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

class ImageDownloader:
    def __init__(self, lead_name, search_terms=None):
        """
        Inicializa o downloader

        Args:
            lead_name: Nome do lead (ex: "Dumpling-Room")
            search_terms: Termos para buscar (ex: ["restaurant", "food", "menu"])
        """
        self.lead_name = lead_name
        self.search_terms = search_terms or ["food", "menu", "restaurant", "dish"]
        self.lead_path = Path.home() / "Documents" / "lovable-crm" / "agent-webdesign" / lead_name
        self.images_dir = self.lead_path / "images"
        self.downloaded_images = set()

        # Validar que a pasta do lead existe
        if not self.lead_path.exists():
            print(f"❌ Pasta do lead não encontrada: {self.lead_path}")
            print(f"\n💡 Crie primeiro a pasta do lead:")
            print(f"   mkdir -p ~/{self.lead_path.relative_to(Path.home())}/{{images,website,documents,scripts}}")
            sys.exit(1)

        self.setup_output_directory()
        self.setup_selenium()

    def setup_output_directory(self):
        """Cria diretório de imagens se não existir"""
        self.images_dir.mkdir(parents=True, exist_ok=True)
        print(f"✅ Diretório de imagens: {self.images_dir}")

    def setup_selenium(self):
        """Configura Selenium com Chrome"""
        chrome_options = Options()
        # Descomente para headless mode
        # chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")

        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            print("✅ Chrome inicializado")
        except Exception as e:
            print(f"❌ Erro ao inicializar Chrome: {e}")
            sys.exit(1)

    def download_image(self, image_url, filename):
        """Baixa uma imagem individual"""
        if not image_url or image_url in self.downloaded_images:
            return False

        try:
            # Normalize URL
            if image_url.startswith('//'):
                image_url = 'https:' + image_url
            elif not image_url.startswith('http'):
                image_url = 'https://' + image_url

            if image_url in self.downloaded_images:
                return False

            response = requests.get(image_url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            })

            if response.status_code == 200:
                file_path = self.images_dir / filename
                with open(file_path, 'wb') as f:
                    f.write(response.content)

                self.downloaded_images.add(image_url)
                size_kb = len(response.content) / 1024
                print(f"  ✅ {filename} ({size_kb:.1f} KB)")
                return True
        except Exception as e:
            print(f"  ⚠️  Erro em {filename}: {str(e)[:50]}")

        return False

    def search_and_download(self, urls_to_scrape, platform_name):
        """Scrape genérico para qualquer URL"""
        print(f"\n🔍 Buscando imagens em {platform_name}...")

        count = 0
        for url in urls_to_scrape:
            try:
                print(f"   📥 Acessando: {url[:60]}...")
                self.driver.get(url)
                time.sleep(2)

                # Scroll para carregar mais imagens
                for _ in range(3):
                    self.driver.execute_script("window.scrollBy(0, 500)")
                    time.sleep(0.5)

                # Encontra todas as imagens
                images = self.driver.find_elements(By.TAG_NAME, "img")

                for idx, img in enumerate(images):
                    try:
                        src = img.get_attribute('src')
                        if src and any(term.lower() in src.lower() for term in self.search_terms + ['jpg', 'png', 'webp', 'image']):
                            filename = f"{platform_name.replace(' ', '_').lower()}_{idx:03d}.jpg"
                            if self.download_image(src, filename):
                                count += 1
                    except:
                        pass

            except Exception as e:
                print(f"   ❌ Erro ao acessar {platform_name}: {str(e)[:50]}")

        print(f"   📊 Total: {count} imagens de {platform_name}")
        return count

    def google_images_search(self):
        """Busca no Google Images"""
        print(f"\n🔍 Buscando no Google Images...")
        count = 0

        try:
            # Busca genérica por comida/restaurante
            search_url = f"https://www.google.com/search?q={self.lead_name}+restaurant+menu&tbm=isch"
            self.driver.get(search_url)
            time.sleep(2)

            # Scroll para carregar mais imagens
            for _ in range(5):
                self.driver.execute_script("window.scrollBy(0, 800)")
                time.sleep(0.5)

            # Encontra imagens
            images = self.driver.find_elements(By.CSS_SELECTOR, "img.rg_i")

            for idx, img in enumerate(images[:10]):  # Limite a 10
                try:
                    img.click()
                    time.sleep(0.2)

                    # Tenta encontrar a imagem em tamanho maior
                    actual_images = self.driver.find_elements(By.CSS_SELECTOR, "img.n3VNCb")
                    for actual_image in actual_images:
                        src = actual_image.get_attribute('src')
                        if src and src.startswith('http'):
                            filename = f"google_images_{idx:03d}.jpg"
                            if self.download_image(src, filename):
                                count += 1
                                break
                except:
                    pass

        except Exception as e:
            print(f"   ❌ Erro no Google Images: {str(e)[:50]}")

        print(f"   📊 Total: {count} imagens do Google Images")
        return count

    def run(self, sources=None):
        """
        Executa o download

        Args:
            sources: Dict com plataformas e URLs
                    Se None, usa fontes genéricas
        """
        print(f"""
╔══════════════════════════════════════════════════════════════╗
║   🥟 GENERIC IMAGE DOWNLOADER                               ║
║   Lead: {self.lead_name.ljust(48)} ║
║   Destino: {str(self.images_dir.relative_to(Path.home())).ljust(40)} ║
╚══════════════════════════════════════════════════════════════╝
        """)

        total = 0

        # Se não houver sources, tenta Google Images
        if not sources:
            print("⚠️  Nenhuma fonte configurada. Usando Google Images...")
            print("💡 Para melhores resultados, passe URLs específicas!")
            total += self.google_images_search()
        else:
            # Download de múltiplas fontes
            for platform, urls in sources.items():
                if isinstance(urls, str):
                    urls = [urls]
                total += self.search_and_download(urls, platform)

        self.driver.quit()

        print(f"""
╔══════════════════════════════════════════════════════════════╗
║   ✅ DOWNLOAD COMPLETO!                                      ║
║   📸 Total de imagens: {total}
║   📁 Local: {str(self.images_dir.relative_to(Path.home())).ljust(40)} ║
╚══════════════════════════════════════════════════════════════╝
        """)

        if total == 0:
            print("""
⚠️  Nenhuma imagem foi baixada.

💡 SOLUÇÕES:
   1. Configure URLs específicas do negócio
   2. Baixe manualmente usando o navegador
   3. Use o script Google Places API (mais confiável)

📝 EXEMPLO DE USO COM URLS:
   python3 download_images_generic.py "Nome-Do-Lead" \\
     --url "https://ubereats.com/seu-restaurante" \\
     --url "https://instagram.com/seu_negocio"
            """)


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Download genérico de imagens para qualquer lead",
        epilog="""
Exemplos:
  python3 download_images_generic.py "Dumpling-Room"
  python3 download_images_generic.py "Cafe-Italiano" --url "https://ubereats.com/cafe-italiano"
  python3 download_images_generic.py "Pizza-Express" --search "pizza" --search "pasta"
        """
    )

    parser.add_argument("lead_name", help='Nome do lead (ex: "Dumpling-Room")')
    parser.add_argument("--url", action="append", help="URL para fazer scrape (pode usar múltiplas vezes)")
    parser.add_argument("--search", action="append", help="Termo de busca (padrão: 'food', 'menu', 'restaurant')")
    parser.add_argument("--headless", action="store_true", help="Rodar Chrome em headless mode")

    args = parser.parse_args()

    # Configurar search terms
    search_terms = args.search if args.search else ["food", "menu", "restaurant", "dish"]

    # Criar downloader
    downloader = ImageDownloader(args.lead_name, search_terms)

    # Se tiver URLs, usar elas
    if args.url:
        sources = {f"url_{i}": url for i, url in enumerate(args.url)}
        downloader.run(sources)
    else:
        # Senão, tentar Google Images
        downloader.run()


if __name__ == "__main__":
    main()
