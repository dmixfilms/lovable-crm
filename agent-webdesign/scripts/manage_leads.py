#!/usr/bin/env python3
"""
Gerenciador de Leads - Operações para QUALQUER Lead
Gerencia: criação de pastas, download de imagens, operações com sites
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

class LeadManager:
    def __init__(self):
        self.base_path = Path.home() / "Documents" / "lovable-crm" / "agent-webdesign"
        self.leads_config = self.base_path / "leads.json"
        self.leads = self.load_leads()

    def load_leads(self):
        """Carrega configuração de leads"""
        if self.leads_config.exists():
            try:
                with open(self.leads_config, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}

    def save_leads(self):
        """Salva configuração de leads"""
        with open(self.leads_config, 'w') as f:
            json.dump(self.leads, f, indent=2)

    def create_lead(self, lead_name, business_info=None):
        """Cria estrutura completa para um novo lead"""
        lead_path = self.base_path / lead_name

        # Criar pastas
        (lead_path / "images").mkdir(parents=True, exist_ok=True)
        (lead_path / "website").mkdir(parents=True, exist_ok=True)
        (lead_path / "documents").mkdir(parents=True, exist_ok=True)
        (lead_path / "scripts").mkdir(parents=True, exist_ok=True)

        # Copiar scripts
        scripts_src = self.base_path / "scripts"
        if scripts_src.exists():
            for script in scripts_src.glob("*.py"):
                if "manage" not in script.name:
                    src = script
                    dst = lead_path / "scripts" / script.name
                    if not dst.exists():
                        import shutil
                        shutil.copy2(src, dst)

        # Criar README
        readme_content = f"""# {lead_name}

**Data de Criação:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Status:** 🆕 Em Desenvolvimento

## 📋 Informações

[Adicione informações do negócio aqui]

## 🎯 Checklist

- [ ] Pesquisa completada
- [ ] Imagens baixadas
- [ ] Website criado
- [ ] Testes feitos
- [ ] Publicado

## 📁 Arquivos

- `images/` - Fotos do negócio
- `website/` - HTML, CSS, JS
- `documents/` - Pesquisa
- `scripts/` - Scripts de download

## 🔗 Links Úteis

[Adicione links importantes]

---

Criado automaticamente pelo Lead Manager
"""
        readme_path = lead_path / "README.md"
        if not readme_path.exists():
            with open(readme_path, 'w') as f:
                f.write(readme_content)

        # Registrar lead
        self.leads[lead_name] = {
            "created_at": datetime.now().isoformat(),
            "status": "new",
            "path": str(lead_path.relative_to(Path.home())),
            "info": business_info or {}
        }
        self.save_leads()

        print(f"""
✅ Lead '{lead_name}' criado com sucesso!

📁 Estrutura:
   {lead_path}/
   ├── images/ ..................... (fotos)
   ├── website/ .................... (HTML/CSS/JS)
   ├── documents/ .................. (pesquisa)
   ├── scripts/ .................... (download scripts)
   └── README.md

🚀 Próximos passos:
   1. Edite: {lead_path}/README.md
   2. Baixe imagens:
      cd {lead_path}
      python3 scripts/download_images_generic.py "{lead_name}" --url "sua-url"
   3. Crie website em: {lead_path}/website/
        """)

    def list_leads(self):
        """Lista todos os leads"""
        print("""
╔═══════════════════════════════════════════════════════════════╗
║   📋 LEADS CADASTRADOS                                        ║
╚═══════════════════════════════════════════════════════════════╝
        """)

        if not self.leads:
            print("Nenhum lead cadastrado ainda.\n")
            return

        for name, info in self.leads.items():
            path = self.base_path / name
            images_count = len(list((path / "images").glob("*"))) if (path / "images").exists() else 0
            status = info.get("status", "unknown")

            status_symbol = {
                "new": "🆕",
                "in_progress": "🔄",
                "completed": "✅",
                "published": "🚀"
            }.get(status, "❓")

            print(f"{status_symbol} {name}")
            print(f"   Status: {status}")
            print(f"   Imagens: {images_count}")
            print(f"   Criado: {info.get('created_at', '?')[:10]}")
            print()

    def download_images(self, lead_name, urls=None, search_terms=None):
        """Baixa imagens para um lead"""
        lead_path = self.base_path / lead_name

        if not lead_path.exists():
            print(f"❌ Lead '{lead_name}' não encontrado!")
            self.list_leads()
            return

        script_path = lead_path / "scripts" / "download_images_generic.py"

        if not script_path.exists():
            print(f"❌ Script não encontrado em {script_path}")
            return

        # Montar comando
        cmd = [sys.executable, str(script_path), lead_name]

        if urls:
            for url in urls:
                cmd.extend(["--url", url])

        if search_terms:
            for term in search_terms:
                cmd.extend(["--search", term])

        print(f"\n🚀 Iniciando download para '{lead_name}'...\n")
        subprocess.run(cmd)

    def update_status(self, lead_name, status):
        """Atualiza status de um lead"""
        if lead_name in self.leads:
            self.leads[lead_name]["status"] = status
            self.save_leads()
            print(f"✅ Status atualizado: {lead_name} → {status}")
        else:
            print(f"❌ Lead '{lead_name}' não encontrado!")

    def get_lead_path(self, lead_name):
        """Retorna o caminho de um lead"""
        path = self.base_path / lead_name
        if path.exists():
            return path
        return None


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Gerenciador de Leads para Agent WebDesign",
        epilog="""
Exemplos:
  python3 manage_leads.py --create "Nome-Do-Lead"
  python3 manage_leads.py --list
  python3 manage_leads.py --download "Nome-Do-Lead" --url "https://..."
  python3 manage_leads.py --status "Nome-Do-Lead" "completed"
        """
    )

    parser.add_argument("--create", help="Cria novo lead")
    parser.add_argument("--list", action="store_true", help="Lista todos os leads")
    parser.add_argument("--download", help="Baixa imagens para um lead")
    parser.add_argument("--url", action="append", help="URL para download (múltiplas)")
    parser.add_argument("--search", action="append", help="Termo de busca (múltiplos)")
    parser.add_argument("--status", nargs=2, help="Atualiza status: nome-do-lead novo-status")
    parser.add_argument("--info", help="Informações JSON do lead")

    args = parser.parse_args()

    manager = LeadManager()

    if args.create:
        info = json.loads(args.info) if args.info else None
        manager.create_lead(args.create, info)

    elif args.list:
        manager.list_leads()

    elif args.download:
        manager.download_images(args.download, args.url, args.search)

    elif args.status:
        manager.update_status(args.status[0], args.status[1])

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
