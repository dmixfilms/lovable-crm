#!/usr/bin/env python3
"""
Smart Image Scraper com Chrome - DMIX Media Works
Busca e baixa automaticamente imagens de alta qualidade de múltiplas fontes
Uso: python3 smart_image_scraper.py "Nome-Do-Lead" "tipo de comida"
Exemplo: python3 smart_image_scraper.py "Dumpling-Room" "dumplings"
"""

import os
import sys
import time
import requests
import json
from pathlib import Path
from urllib.parse import urljoin, urlparse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException
from PIL import Image
from io import BytesIO

class SmartImageScraper:
    def __init__(self, lead_name, food_type):
        """Inicializa o scraper inteligente"""
        self.lead_name = lead_name
        self.food_type = food_type
        self.lead_path = Path.home() / "Documents" / "lovable-crm" / "agent-webdesign" / lead_name
        self.images_dir = self.lead_path / "images"
        self.downloaded_images = set()

        if not self.lead_path.exists():
            print(f"❌ Pasta do lead não encontrada: {self.lead_path}")
            sys.exit(1)

        self.images_dir.mkdir(parents=True, exist_ok=True)
        self.setup_chrome()
        print(f"🔍 Iniciando busca por imagens de '{self.food_type}' para {self.lead_name}")

    def setup_chrome(self):
        """Configura Chrome com opções otimizadas"""
        chrome_options = Options()
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--no-sandbox")

        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            print("✅ Chrome inicializado")
        except Exception as e:
            print(f"❌ Erro ao inicializar Chrome: {e}")
            sys.exit(1)

    def is_image_valid(self, image_path):
        """Verifica se imagem é válida e tem resolução mínima"""
        try:
            img = Image.open(image_path)
            width, height = img.size
            # Mínimo 1200x800px para hero
            if width >= 1000 and height >= 600:
                return True
        except:
            pass
        return False

    def download_image(self, image_url, filename, min_size=50):
        """Baixa e valida uma imagem"""
        if not image_url or image_url in self.downloaded_images:
            return False

        try:
            # Normalize URL
            if image_url.startswith('//'):
                image_url = 'https:' + image_url
            elif not image_url.startswith('http'):
                return False

            response = requests.get(image_url, timeout=15, allow_redirects=True, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            })

            if response.status_code != 200:
                return False

            # Salvar imagem
            file_path = self.images_dir / filename
            with open(file_path, 'wb') as f:
                f.write(response.content)

            # Validar imagem
            if not self.is_image_valid(file_path):
                file_path.unlink()
                return False

            self.downloaded_images.add(image_url)
            size_mb = len(response.content) / (1024 * 1024)
            print(f"  ✅ {filename} ({size_mb:.2f} MB)")
            return True

        except Exception as e:
            print(f"  ⚠️  Erro: {str(e)[:40]}")

        return False

    def search_pexels(self, query, per_page=10):
        """Busca imagens no Pexels (API pública)"""
        print(f"\n📸 Buscando em Pexels por '{query}'...")

        # Pexels API é mais restrita, vamos usar request direto com URL pattern
        search_url = f"https://www.pexels.com/search/{query}/?page=1"

        try:
            self.driver.get(search_url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "img[class*='lazy']"))
            )

            # Coletar URLs de imagens
            images = self.driver.find_elements(By.CSS_SELECTOR, "img[src*='pexels']")

            count = 0
            for i, img in enumerate(images[:per_page]):
                try:
                    img_src = img.get_attribute('src') or img.get_attribute('data-src')
                    if img_src and count < 5:
                        filename = f"pexels_{self.food_type}_{count+1}.jpg"
                        if self.download_image(img_src, filename):
                            count += 1
                except:
                    continue

            return count
        except Exception as e:
            print(f"  ⚠️  Erro Pexels: {str(e)[:40]}")
            return 0

    def search_pixabay(self, query, per_page=10):
        """Busca imagens no Pixabay (site público)"""
        print(f"\n🎨 Buscando em Pixabay por '{query}'...")

        search_url = f"https://pixabay.com/images/search/{query}/?pagi=1"

        try:
            self.driver.get(search_url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "img[class*='image-section']"))
            )

            # Coletar URLs de imagens
            images = self.driver.find_elements(By.CSS_SELECTOR, "img[src*='pixabay.com']")

            count = 0
            for img in images[:per_page]:
                try:
                    img_src = img.get_attribute('src')
                    if img_src and count < 5:
                        # Pixabay urls precisam de ajuste
                        if 'pixabay.com' in img_src:
                            filename = f"pixabay_{self.food_type}_{count+1}.jpg"
                            if self.download_image(img_src, filename):
                                count += 1
                except:
                    continue

            return count
        except Exception as e:
            print(f"  ⚠️  Erro Pixabay: {str(e)[:40]}")
            return 0

    def search_unsplash(self, query, per_page=10):
        """Busca imagens no Unsplash (API pública)"""
        print(f"\n🖼️  Buscando em Unsplash por '{query}'...")

        search_url = f"https://unsplash.com/napi/search/photos?query={query}&page=1&per_page={per_page}"

        try:
            response = requests.get(search_url, headers={
                'User-Agent': 'Mozilla/5.0'
            }, timeout=10)

            if response.status_code != 200:
                return 0

            data = response.json()
            results = data.get('results', [])

            count = 0
            for photo in results[:per_page]:
                if count >= 5:
                    break

                try:
                    # Usar full image URL
                    img_url = photo['urls']['raw'] + '?w=1600&h=900&fit=crop'
                    filename = f"unsplash_{self.food_type}_{count+1}.jpg"
                    if self.download_image(img_url, filename):
                        count += 1
                except:
                    continue

            return count
        except Exception as e:
            print(f"  ⚠️  Erro Unsplash: {str(e)[:40]}")
            return 0

    def search_google_images(self, query, per_page=15):
        """Busca imagens no Google Images"""
        print(f"\n🔍 Buscando em Google Images por '{query}'...")

        search_url = f"https://www.google.com/search?q={query}+high+quality&tbm=isch&hl=en"

        try:
            self.driver.get(search_url)

            # Fazer scroll para carregar mais imagens
            for _ in range(3):
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)

            # Coletar imagens
            image_elements = self.driver.find_elements(By.CSS_SELECTOR, "img.rg_i")

            count = 0
            for img in image_elements[:per_page]:
                if count >= 8:
                    break

                try:
                    img.click()
                    time.sleep(0.5)

                    # Tentar encontrar imagem real
                    images = self.driver.find_elements(By.CSS_SELECTOR, "img.n3VNCb")
                    for image in images:
                        src = image.get_attribute('src')
                        if src and 'http' in src and 'png' not in src.lower():
                            filename = f"google_{self.food_type}_{count+1}.jpg"
                            if self.download_image(src, filename):
                                count += 1
                                break
                except:
                    continue

            return count
        except Exception as e:
            print(f"  ⚠️  Erro Google Images: {str(e)[:40]}")
            return 0

    def run(self):
        """Executa busca em todas as fontes"""
        total_downloaded = 0

        try:
            # Buscar em múltiplas fontes
            total_downloaded += self.search_unsplash(self.food_type)
            total_downloaded += self.search_pexels(self.food_type)
            total_downloaded += self.search_pixabay(self.food_type)
            total_downloaded += self.search_google_images(self.food_type)

            print(f"\n✅ Concluído! {total_downloaded} imagens baixadas para '{self.lead_name}'")
            print(f"📁 Pasta: {self.images_dir}")

            # Listar imagens baixadas
            images = list(self.images_dir.glob("*.jpg")) + list(self.images_dir.glob("*.png"))
            print(f"\n🖼️  Total de imagens: {len(images)}")
            for img in sorted(images)[-5:]:
                print(f"   - {img.name}")

        finally:
            self.driver.quit()


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python3 smart_image_scraper.py 'Nome-Do-Lead' 'tipo-de-comida'")
        print("Exemplos:")
        print("  python3 smart_image_scraper.py 'Dumpling-Room' 'dumplings'")
        print("  python3 smart_image_scraper.py 'Pizza-Express' 'pizza'")
        print("  python3 smart_image_scraper.py 'Cafe-Italiano' 'coffee'")
        sys.exit(1)

    lead_name = sys.argv[1]
    food_type = sys.argv[2]

    scraper = SmartImageScraper(lead_name, food_type)
    scraper.run()
