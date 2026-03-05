#!/usr/bin/env python3
"""
Download Dumpling Room Images Script
Baixa imagens do restaurante de múltiplas fontes usando Selenium
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

# Configuração
OUTPUT_DIR = Path.home() / "Documents" / "dumpling-room-website" / "images"
RESTAURANT_NAME = "Dumpling Room"
CHROME_DRIVER_PATH = None  # Auto-detect

# URLs para buscar imagens
SOURCES = {
    "uber_eats": "https://www.ubereats.com/au/store/dumpling-room/U_jq1aO0QBaU9hpbsNCVpQ",
    "doordash": "https://www.doordash.com/en-AU/store/dumpling-room-newtown-31818999/",
    "wheree": "https://dumpling-room.wheree.com/",
    "quandoo": "https://www.quandoo.com.au/place/dumpling-room-101412",
}

class DumplingImageDownloader:
    def __init__(self):
        self.downloaded_images = set()
        self.setup_output_directory()
        self.setup_selenium()

    def setup_output_directory(self):
        """Cria diretório de saída"""
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        print(f"✅ Diretório criado: {OUTPUT_DIR}")

    def setup_selenium(self):
        """Configura Selenium com Chrome"""
        chrome_options = Options()
        # Descomente a linha abaixo para modo headless (sem janela)
        # chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")

        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            print("✅ Chrome inicializado com sucesso")
        except Exception as e:
            print(f"❌ Erro ao inicializar Chrome: {e}")
            print("💡 Instale chromedriver: brew install chromedriver")
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

            # Skip se já foi baixada
            if image_url in self.downloaded_images:
                return False

            response = requests.get(image_url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            })

            if response.status_code == 200:
                # Salva arquivo
                file_path = OUTPUT_DIR / filename
                with open(file_path, 'wb') as f:
                    f.write(response.content)

                self.downloaded_images.add(image_url)
                print(f"  ✅ Baixada: {filename} ({len(response.content) / 1024:.1f} KB)")
                return True
        except Exception as e:
            print(f"  ❌ Erro ao baixar {filename}: {e}")

        return False

    def scrape_uber_eats(self):
        """Scrape de imagens do Uber Eats"""
        print("\n🍜 Buscando imagens no Uber Eats...")
        try:
            self.driver.get(SOURCES['uber_eats'])
            time.sleep(3)  # Espera carregamento

            # Scroll para carregar mais imagens
            for _ in range(5):
                self.driver.execute_script("window.scrollBy(0, 500)")
                time.sleep(1)

            # Encontra imagens
            images = self.driver.find_elements(By.TAG_NAME, "img")
            count = 0
            for idx, img in enumerate(images):
                try:
                    src = img.get_attribute('src')
                    if src and ('food' in src.lower() or 'menu' in src.lower() or 'recipe' in src.lower() or idx > 10):
                        filename = f"ubereats_{idx:03d}.jpg"
                        if self.download_image(src, filename):
                            count += 1
                except:
                    pass

            print(f"  📊 Total: {count} imagens do Uber Eats")
            return count
        except Exception as e:
            print(f"  ❌ Erro no Uber Eats: {e}")
            return 0

    def scrape_doordash(self):
        """Scrape de imagens do DoorDash"""
        print("\n🍜 Buscando imagens no DoorDash...")
        try:
            self.driver.get(SOURCES['doordash'])
            time.sleep(3)

            # Scroll
            for _ in range(5):
                self.driver.execute_script("window.scrollBy(0, 500)")
                time.sleep(1)

            images = self.driver.find_elements(By.TAG_NAME, "img")
            count = 0
            for idx, img in enumerate(images):
                try:
                    src = img.get_attribute('src')
                    if src and ('food' in src.lower() or 'item' in src.lower() or idx > 10):
                        filename = f"doordash_{idx:03d}.jpg"
                        if self.download_image(src, filename):
                            count += 1
                except:
                    pass

            print(f"  📊 Total: {count} imagens do DoorDash")
            return count
        except Exception as e:
            print(f"  ❌ Erro no DoorDash: {e}")
            return 0

    def scrape_wheree(self):
        """Scrape de imagens do Wheree"""
        print("\n🍜 Buscando imagens no Wheree...")
        try:
            self.driver.get(SOURCES['wheree'])
            time.sleep(3)

            # Scroll
            for _ in range(5):
                self.driver.execute_script("window.scrollBy(0, 500)")
                time.sleep(1)

            images = self.driver.find_elements(By.TAG_NAME, "img")
            count = 0
            for idx, img in enumerate(images):
                try:
                    src = img.get_attribute('src')
                    if src and src.startswith('http'):
                        filename = f"wheree_{idx:03d}.jpg"
                        if self.download_image(src, filename):
                            count += 1
                except:
                    pass

            print(f"  📊 Total: {count} imagens do Wheree")
            return count
        except Exception as e:
            print(f"  ❌ Erro no Wheree: {e}")
            return 0

    def scrape_quandoo(self):
        """Scrape de imagens do Quandoo"""
        print("\n🍜 Buscando imagens no Quandoo...")
        try:
            self.driver.get(SOURCES['quandoo'])
            time.sleep(3)

            # Scroll
            for _ in range(5):
                self.driver.execute_script("window.scrollBy(0, 500)")
                time.sleep(1)

            images = self.driver.find_elements(By.TAG_NAME, "img")
            count = 0
            for idx, img in enumerate(images):
                try:
                    src = img.get_attribute('src')
                    if src and src.startswith('http'):
                        filename = f"quandoo_{idx:03d}.jpg"
                        if self.download_image(src, filename):
                            count += 1
                except:
                    pass

            print(f"  📊 Total: {count} imagens do Quandoo")
            return count
        except Exception as e:
            print(f"  ❌ Erro no Quandoo: {e}")
            return 0

    def run(self):
        """Executa o scraper completo"""
        print(f"""
╔══════════════════════════════════════════════════════════════╗
║   🥟 DUMPLING ROOM IMAGE DOWNLOADER                          ║
║   Baixando imagens de múltiplas fontes...                   ║
╚══════════════════════════════════════════════════════════════╝
        """)

        total = 0
        try:
            total += self.scrape_uber_eats()
            total += self.scrape_doordash()
            total += self.scrape_wheree()
            total += self.scrape_quandoo()
        finally:
            self.driver.quit()

        print(f"""
╔══════════════════════════════════════════════════════════════╗
║   ✅ DOWNLOAD COMPLETO!                                      ║
║   📸 Total de imagens: {total}
║   📁 Localização: {OUTPUT_DIR}                 ║
╚══════════════════════════════════════════════════════════════╝
        """)

        if total == 0:
            print("⚠️  Nenhuma imagem foi baixada.")
            print("💡 Dica: Os sites podem bloquear automaticamente.")
            print("   Tente manualmente:")
            print("   1. Acesse os links no navegador")
            print("   2. Clique direito nas imagens > Salvar imagem como")
            print("   3. Salve em:", OUTPUT_DIR)

if __name__ == "__main__":
    downloader = DumplingImageDownloader()
    downloader.run()
