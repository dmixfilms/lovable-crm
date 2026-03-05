#!/usr/bin/env python3
"""
Image Upscale Tool - DMIX Media Works
Melhora a qualidade e resolução de imagens usando AI upscaling
Usa Real-ESRGAN se disponível, senão usa OpenCV/Pillow
Uso: python3 upscale_images.py "path/to/image.jpg" [--scale 2 or 4]
"""

import os
import sys
import json
from pathlib import Path
from PIL import Image, ImageEnhance
import cv2
import numpy as np
from subprocess import run, PIPE, CalledProcessError

class ImageUpscaler:
    def __init__(self, image_path, scale=2):
        """Inicializa upscaler"""
        self.image_path = Path(image_path)
        self.scale = scale

        if not self.image_path.exists():
            print(f"❌ Arquivo não encontrado: {self.image_path}")
            sys.exit(1)

        # Gerar nome de output
        self.output_path = self.image_path.parent / f"{self.image_path.stem}_upscaled_x{scale}{self.image_path.suffix}"
        print(f"📸 Imagem original: {self.image_path}")
        print(f"📏 Escala: {scale}x")
        self.print_info()

    def print_info(self):
        """Mostra info da imagem"""
        img = Image.open(self.image_path)
        w, h = img.size
        size_mb = self.image_path.stat().st_size / (1024 * 1024)
        print(f"   Resolução: {w}x{h} ({size_mb:.2f} MB)")

    def upscale_with_realsr(self):
        """Tenta usar Real-ESRGAN se disponível"""
        try:
            print("\n🤖 Tentando Real-ESRGAN (melhor qualidade)...")

            # Verificar se real-esrgan está disponível
            result = run(['realesrgan-ncnn-vulkan', '-v'], capture_output=True)

            cmd = [
                'realesrgan-ncnn-vulkan',
                '-i', str(self.image_path),
                '-o', str(self.output_path),
                '-n', 'realesrgan-x4plus',
                '-s', str(self.scale),
                '-t', '100'  # tile size
            ]

            print("   Processando com Real-ESRGAN 4x+...")
            result = run(cmd, capture_output=True, text=True)

            if result.returncode == 0:
                print(f"   ✅ Upscaled com Real-ESRGAN!")
                self.enhance_with_opencv()
                return True
            else:
                print(f"   ⚠️  Erro: {result.stderr[:100]}")
                return False

        except (FileNotFoundError, CalledProcessError):
            return False

    def upscale_with_opencv(self):
        """Upscale com OpenCV usando interpolação avançada"""
        print("\n🔧 Upscaling com OpenCV (qualidade boa)...")

        # Ler imagem com OpenCV
        img = cv2.imread(str(self.image_path))
        if img is None:
            print(f"❌ Erro ao ler imagem com OpenCV")
            return False

        h, w = img.shape[:2]
        new_w = w * self.scale
        new_h = h * self.scale

        print(f"   {w}x{h} → {new_w}x{new_h}")

        # Usar INTER_LANCZOS4 (melhor para upscale)
        upscaled = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)

        # Salvar
        success = cv2.imwrite(str(self.output_path), upscaled)

        if success:
            print(f"   ✅ Upscaled com OpenCV LANCZOS4!")
            self.enhance_with_pil()
            return True
        else:
            print(f"   ❌ Erro ao salvar")
            return False

    def enhance_with_pil(self):
        """Melhora contraste, saturação e nitidez"""
        print("\n✨ Aplicando filtros de melhoria...")

        try:
            img = Image.open(self.output_path)

            # Aumentar contraste (+20%)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.2)

            # Aumentar saturação (+15%)
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.15)

            # Aumentar nitidez (+25%)
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.25)

            # Aplicar slight blur for noise reduction (usando SMOOTH)
            img = img.filter(Image.SMOOTH)

            # Salvar versão final
            img.save(self.output_path, quality=95, optimize=True)

            print("   ✅ Contraste, cor e nitidez melhorados!")
            return True
        except Exception as e:
            print(f"   ⚠️  Erro ao melhorar: {str(e)[:50]}")
            return False

    def upscale_with_pillow(self):
        """Fallback com Pillow (mais rápido)"""
        print("\n📦 Upscaling com Pillow (rápido)...")

        try:
            img = Image.open(self.image_path)
            w, h = img.size
            new_w = w * self.scale
            new_h = h * self.scale

            print(f"   {w}x{h} → {new_w}x{new_h}")

            # Usar LANCZOS (melhor qualidade)
            upscaled = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

            # Salvar
            upscaled.save(self.output_path, quality=95, optimize=True)
            print(f"   ✅ Upscaled com Pillow LANCZOS!")

            self.enhance_with_pil()
            return True
        except Exception as e:
            print(f"   ❌ Erro: {str(e)}")
            return False

    def run(self):
        """Executa upscaling com fallbacks"""
        print("\n" + "="*60)
        print("🚀 INICIANDO UPSCALE DE IMAGEM")
        print("="*60)

        # Tentar Real-ESRGAN primeiro
        if self.upscale_with_realsr():
            self.print_results()
            return True

        # Fallback OpenCV
        if self.upscale_with_opencv():
            self.print_results()
            return True

        # Fallback Pillow
        if self.upscale_with_pillow():
            self.print_results()
            return True

        print("❌ Todos os métodos falharam")
        return False

    def print_results(self):
        """Mostra resultado final"""
        if not self.output_path.exists():
            return

        original_img = Image.open(self.image_path)
        upscaled_img = Image.open(self.output_path)

        orig_w, orig_h = original_img.size
        upsc_w, upsc_h = upscaled_img.size

        orig_size = self.image_path.stat().st_size / (1024 * 1024)
        upsc_size = self.output_path.stat().st_size / (1024 * 1024)

        print("\n" + "="*60)
        print("✅ CONCLUÍDO COM SUCESSO!")
        print("="*60)
        print(f"Original:  {orig_w}x{orig_h} ({orig_size:.2f} MB)")
        print(f"Upscaled:  {upsc_w}x{upsc_h} ({upsc_size:.2f} MB)")
        print(f"Aumento:   {upsc_w/orig_w:.1f}x width, {upsc_h/orig_h:.1f}x height")
        print(f"\n📁 Salvo em: {self.output_path}")
        print("="*60 + "\n")


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 upscale_images.py 'caminho/para/imagem.jpg' [--scale 2 ou 4]")
        print("\nExemplos:")
        print("  python3 upscale_images.py 'dumpling_hero_2.jpg'           # 2x upscale")
        print("  python3 upscale_images.py 'dumpling_hero_2.jpg' --scale 4  # 4x upscale")
        print("\nMétodos:")
        print("  1. Real-ESRGAN (AI, melhor qualidade)")
        print("  2. OpenCV LANCZOS4 (muito bom, rápido)")
        print("  3. Pillow LANCZOS (fallback, funciona sempre)")
        sys.exit(1)

    image_path = sys.argv[1]
    scale = 2

    if '--scale' in sys.argv:
        idx = sys.argv.index('--scale')
        if idx + 1 < len(sys.argv):
            scale = int(sys.argv[idx + 1])

    upscaler = ImageUpscaler(image_path, scale)
    upscaler.run()


if __name__ == "__main__":
    main()
