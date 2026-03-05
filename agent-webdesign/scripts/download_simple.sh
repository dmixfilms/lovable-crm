#!/bin/bash
# 🥟 Script Simples para Baixar Imagens (Sem Python)
# Usa apenas curl e ferramentas nativas do macOS

OUTPUT_DIR=~/Documents/dumpling-room-website/images

# Criar diretório
mkdir -p "$OUTPUT_DIR"

echo "🥟 Iniciando download de imagens do Dumpling Room..."
echo "📁 Salvando em: $OUTPUT_DIR"
echo ""

# Contador
count=0

# URLs conhecidas de imagens do Dumpling Room
# (Se encontrar URLs diretas, adicione aqui)

declare -a URLS=(
    # Exemplos - adicionar URLs reais quando encontradas
    # "https://example.com/dumpling1.jpg"
    # "https://example.com/noodles1.jpg"
)

# Se há URLs, baixa
if [ ${#URLS[@]} -gt 0 ]; then
    for url in "${URLS[@]}"; do
        filename=$(basename "$url" | cut -d'?' -f1)
        if [ -z "$filename" ]; then
            filename="image_${count}.jpg"
        fi

        echo "⏳ Baixando: $filename"
        curl -L --max-time 10 -o "$OUTPUT_DIR/$filename" "$url" 2>/dev/null

        if [ -f "$OUTPUT_DIR/$filename" ]; then
            size=$(du -h "$OUTPUT_DIR/$filename" | cut -f1)
            echo "  ✅ Salva ($size)"
            ((count++))
        else
            echo "  ❌ Erro no download"
        fi
    done
else
    echo "⚠️  Nenhuma URL configurada"
    echo ""
    echo "Para usar este script:"
    echo "1. Encontre URLs diretas de imagens"
    echo "2. Adicione à seção 'URLS' deste arquivo"
    echo "3. Execute novamente"
    echo ""
    echo "Exemplo:"
    echo '  URLS=("https://example.com/image1.jpg" "https://example.com/image2.jpg")'
fi

echo ""
echo "════════════════════════════════════════════"
if [ $count -gt 0 ]; then
    echo "✅ Total de imagens: $count"
    echo "📁 Localização: $OUTPUT_DIR"
    echo ""
    echo "📊 Ver imagens:"
    echo "   open $OUTPUT_DIR"
else
    echo "⚠️  Nenhuma imagem foi baixada"
    echo ""
    echo "💡 Próximos passos:"
    echo "1. Use o script Python Selenium (recomendado):"
    echo "   python3 ~/download_dumpling_images.py"
    echo ""
    echo "2. Ou baixe manualmente no navegador:"
    echo "   - Uber Eats: https://www.ubereats.com/au/store/dumpling-room/U_jq1aO0QBaU9hpbsNCVpQ"
    echo "   - DoorDash: https://www.doordash.com/en-AU/store/dumpling-room-newtown-31818999/"
    echo ""
fi
echo "════════════════════════════════════════════"
