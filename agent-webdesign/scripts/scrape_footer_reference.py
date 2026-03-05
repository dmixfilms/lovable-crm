#!/usr/bin/env python3
"""
Scraper para analisar footer de site reference
Usa Selenium para capturar HTML completo do footer
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def scrape_footer():
    """Scrape footer HTML from reference site"""

    chrome_options = Options()
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("user-agent=Mozilla/5.0")

    driver = webdriver.Chrome(options=chrome_options)

    try:
        print("🌐 Acessando https://elevenmiles.lovable.app...")
        driver.get("https://elevenmiles.lovable.app")

        # Esperar página carregar
        time.sleep(3)

        # Scroll para footer
        print("📜 Scrollando para o footer...")
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)

        # Capture footer
        print("📸 Capturando footer...")
        footer = driver.find_element(By.TAG_NAME, "footer")
        footer_html = footer.get_attribute("outerHTML")

        # Salvar em arquivo
        with open("footer_reference.html", "w", encoding="utf-8") as f:
            f.write(footer_html)

        print(f"✅ Footer salvo em footer_reference.html")
        print(f"📏 Tamanho: {len(footer_html)} caracteres")

        # Print primeiras 1000 chars
        print("\n📄 Preview do Footer:")
        print("=" * 60)
        print(footer_html[:1000])
        print("..." if len(footer_html) > 1000 else "")
        print("=" * 60)

        # Capture outras sections interessantes
        print("\n🔍 Procurando seções especiais...")

        # Look for contact/hours section
        sections = driver.find_elements(By.TAG_NAME, "section")
        print(f"   Total de <section>: {len(sections)}")

        for i, section in enumerate(sections[-3:]):
            section_id = section.get_attribute("id") or "sem-id"
            print(f"   Section {i}: #{section_id}")

        # Capture CSS da página
        print("\n🎨 Capturando CSS...")
        styles = driver.find_elements(By.TAG_NAME, "style")
        print(f"   Total de <style> tags: {len(styles)}")

        stylesheets = driver.find_elements(By.TAG_NAME, "link")
        print(f"   Total de <link> stylesheets: {len(stylesheets)}")

        for stylesheet in stylesheets[:3]:
            href = stylesheet.get_attribute("href")
            print(f"   - {href}")

    finally:
        driver.quit()
        print("\n✅ Scraping concluído!")

if __name__ == "__main__":
    scrape_footer()
