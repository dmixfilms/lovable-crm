#!/bin/bash
# Upscale todas as imagens de um lead

LEAD_NAME="${1:-.}"
IMAGES_DIR="/Users/andersonvieira/Documents/lovable-crm/agent-webdesign/${LEAD_NAME}/images"

if [ ! -d "$IMAGES_DIR" ]; then
    echo "❌ Pasta não encontrada: $IMAGES_DIR"
    exit 1
fi

cd "$IMAGES_DIR" || exit 1

echo "🚀 UPSCALANDO TODAS AS IMAGENS DE $LEAD_NAME"
echo "📁 Pasta: $IMAGES_DIR"
echo "================================"

# Contar imagens
TOTAL=$(find . -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) ! -name "*upscaled*" | wc -l)
CURRENT=0

# Processar cada imagem
find . -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) ! -name "*upscaled*" | sort | while read -r FILE; do
    CURRENT=$((CURRENT + 1))
    FILENAME=$(basename "$FILE")
    
    echo ""
    echo "[$CURRENT/$TOTAL] 🖼️  Processando: $FILENAME"
    
    # Upscale 2x se arquivo pequeno (< 500KB)
    SIZE=$(stat -f%z "$FILE" 2>/dev/null || stat -c%s "$FILE" 2>/dev/null)
    SIZE_KB=$((SIZE / 1024))
    
    if [ $SIZE_KB -lt 500 ]; then
        python3 ../../scripts/upscale_images.py "$FILE" --scale 2 2>&1 | grep -E "Original|Upscaled|Salvo" || true
    else
        echo "   ⏭️  Arquivo já grande ($SIZE_KB KB), pulando"
    fi
done

echo ""
echo "================================"
echo "✅ UPSCALING CONCLUÍDO!"
ls -lh *upscaled* 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}' || echo "   Nenhuma imagem upscalada"
