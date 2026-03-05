#!/usr/bin/env python3
"""
Scraper para capturar seção de Hours/Visit Us de um website
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

def scrape_hours_section():
    """Scrape hours/visit us section from Eleven Miles website"""
    
    chrome_options = Options()
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("user-agent=Mozilla/5.0")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("🌐 Acessando https://elevenmiles.lovable.app...")
        driver.get("https://elevenmiles.lovable.app")
        
        # Esperar página carregar
        time.sleep(3)
        
        # Procurar seções por ID/class
        print("\n🔍 Procurando seção de Hours/Contact/Visit Us...")
        
        # Tenta encontrar por diferentes seletores
        selectors = [
            ("section#contact", "contact section"),
            ("section#hours", "hours section"),
            ("section[class*='hours']", "hours class"),
            ("section[class*='contact']", "contact class"),
            ("div[class*='hours']", "hours div"),
            ("div[class*='visit']", "visit div"),
        ]
        
        for selector, description in selectors:
            try:
                element = driver.find_element(By.CSS_SELECTOR, selector)
                html = element.get_attribute("outerHTML")
                if len(html) > 100:  # Se encontrou algo substancial
                    print(f"\n✅ Encontrado: {description}")
                    print(f"📏 Tamanho: {len(html)} caracteres")
                    print(f"\n📄 HTML da seção:")
                    print("=" * 80)
                    print(html[:2000])
                    if len(html) > 2000:
                        print("...")
                        print(html[-500:])
                    print("=" * 80)
                    
                    # Salva em arquivo
                    filename = f"hours_section_{description.replace(' ', '_')}.html"
                    with open(filename, "w", encoding="utf-8") as f:
                        f.write(html)
                    print(f"💾 Salvo em {filename}")
                    return
            except:
                pass
        
        # Se não achou com seletores, procura por todas as sections
        print("\n🔎 Procurando todas as sections...")
        sections = driver.find_elements(By.TAG_NAME, "section")
        print(f"Total de sections: {len(sections)}")
        
        for i, section in enumerate(sections):
            section_id = section.get_attribute("id") or f"section-{i}"
            html = section.get_attribute("outerHTML")
            print(f"\n📍 Section {i} (#{section_id}): {len(html)} chars")
            
            # Salva cada section
            with open(f"section_{i}_{section_id}.html", "w", encoding="utf-8") as f:
                f.write(html)
        
    finally:
        driver.quit()
        print("\n✅ Scraping concluído!")

if __name__ == "__main__":
    scrape_hours_section()
