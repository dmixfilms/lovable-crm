# 🏆 FOOTER UNIVERSAL PATTERN - DMIX Media Works 2026

## Inspiração: Eleven Miles Cafe
Website: https://elevenmiles.lovable.app
Estilo: Minimalista, moderno, clean

---

## 📐 PADRÃO 1: FOOTER MINIMALISTA (Like Eleven Miles)

### HTML Estrutura Simplificada
```html
<footer class="footer footer--minimal">
  <div class="container">

    <!-- TOP: Logo + Endereço + Nav + Redes -->
    <div class="footer__top-row">
      <div class="footer__brand-compact">
        <img src="[LOGO]" alt="[NEGOCIO]">
        <p class="footer__address">[ENDERECO PRINCIPAL]</p>
      </div>

      <div class="footer__nav-compact">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#specialties">Menu</a>
        <a href="#contact">Contact</a>
        <a href="[INSTAGRAM]" target="_blank" rel="noopener">
          <svg>Instagram</svg>
        </a>
      </div>

      <p class="footer__copyright">&copy; 2026 [NEGOCIO]. All rights reserved.</p>
    </div>

    <!-- SEPARATOR -->
    <div class="footer__divider"></div>

    <!-- BOTTOM: Countdown + WhatsApp + DMIX -->
    <div class="footer__bottom-row">
      <div class="footer__countdown-badge">
        <span>⏰ This preview expires in [X days]</span>
      </div>

      <a href="[WHATSAPP-URL]" target="_blank" class="footer__whatsapp-btn">
        💬 Get in touch
      </a>
    </div>

    <!-- FOOTER BOTTOM: Disclaimer -->
    <div class="footer__disclaimer">
      <p>Approval required to proceed with full deployment</p>
      <p class="footer__dmix-tiny">Concept redesigned by DMIX Media Works 2026</p>
    </div>

  </div>
</footer>
```

---

## 🎨 CSS PADRÃO MINIMALISTA

```css
.footer--minimal {
  border-top: 1px solid rgba(212,175,55,0.1);
  padding: var(--space-3xl) 0;
  background: var(--bg-dark);
}

.footer__top-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2xl);
  margin-bottom: var(--space-2xl);
  flex-wrap: wrap;
}

.footer__brand-compact {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-width: 250px;
}

.footer__brand-compact img {
  height: 40px;
  width: auto;
  opacity: 0.9;
}

.footer__address {
  font-size: 0.75rem;
  color: rgba(253,248,240,0.4);
  margin: 0;
}

.footer__nav-compact {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  font-size: 0.9rem;
}

.footer__nav-compact a {
  color: rgba(253,248,240,0.5);
  transition: color var(--transition-fast);
  text-decoration: none;
}

.footer__nav-compact a:hover {
  color: var(--gold);
}

.footer__copyright {
  font-size: 0.75rem;
  color: rgba(253,248,240,0.3);
  margin: 0;
  white-space: nowrap;
}

.footer__divider {
  height: 1px;
  background: rgba(212,175,55,0.1);
  margin: var(--space-2xl) 0;
}

.footer__bottom-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  flex-wrap: wrap;
  margin-bottom: var(--space-lg);
}

.footer__countdown-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: rgba(212,175,55,0.1);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 999px;
  padding: var(--space-sm) var(--space-md);
  font-size: 0.8rem;
  color: var(--gold);
  font-weight: 600;
}

.footer__whatsapp-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.8rem;
  color: rgba(212,175,55,0.7);
  text-decoration: underline;
  text-decoration-offset: 2px;
  transition: color var(--transition-fast);
}

.footer__whatsapp-btn:hover {
  color: var(--gold);
}

.footer__disclaimer {
  text-align: center;
  space: var(--space-md);
  border-top: 1px solid rgba(212,175,55,0.05);
  padding-top: var(--space-lg);
}

.footer__disclaimer p {
  font-size: 0.75rem;
  color: rgba(253,248,240,0.4);
  margin: var(--space-xs) 0;
}

.footer__dmix-tiny {
  font-size: 0.7rem !important;
  color: rgba(253,248,240,0.25) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .footer__top-row {
    flex-direction: column;
    gap: var(--space-lg);
  }

  .footer__nav-compact {
    flex-direction: row;
    width: 100%;
    justify-content: center;
  }

  .footer__copyright {
    width: 100%;
    text-align: center;
  }

  .footer__bottom-row {
    flex-direction: column;
  }
}
```

---

## 📞 WhatsApp Link Generator

```javascript
// Função para gerar link WhatsApp
function generateWhatsAppLink(phone, message) {
  const phoneClean = phone.replace(/\D/g, ''); // Remove non-digits
  const msg = encodeURIComponent(message);
  return `https://api.whatsapp.com/message/${phoneClean}?text=${msg}`;
}

// Exemplo:
// generateWhatsAppLink('+55 11 98765-4321', 'Hi, I\'m interested in the website proposal')
```

---

## 🗺️ SEÇÃO "VISIT US" PADRÃO

Layout recomendado: **Info esquerda (40%) + Mapa direita (60%)**

### Elementos Obrigatórios:
- ✅ Endereço completo com ícone
- ✅ Telefone clicável (tel: link)
- ✅ Horários de funcionamento
- ✅ Google Maps embed responsivo
- ✅ Botão "Get Directions"
- ✅ Apps de delivery (DoorDash, Uber Eats, etc)

### CSS Grid
```css
.hours-grid {
  display: grid;
  grid-template-columns: 40fr 60fr;
  gap: var(--space-3xl);
  align-items: start;
}

@media (max-width: 1024px) {
  .hours-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 📋 CHECKLIST - IMPLEMENTAR NOVO FOOTER

### Dados Necessários
- [ ] Logo do negócio
- [ ] Endereço completo
- [ ] Telefone com DDD
- [ ] Links de navegação principais
- [ ] Instagram URL
- [ ] Facebook URL (opcional)
- [ ] WhatsApp número (com DD)
- [ ] Google Maps embed code
- [ ] Horários de funcionamento
- [ ] Apps de delivery (DoorDash, Uber Eats, etc)

### Implementação
- [ ] Copiar estrutura HTML padrão
- [ ] Substituir [NEGOCIO], [ENDERECO], [PHONE], etc.
- [ ] Aplicar CSS do padrão
- [ ] Testar links em desktop
- [ ] Testar responsividade mobile
- [ ] Verificar countdown timer
- [ ] Confirmar WhatsApp link funciona

### Testes
- [ ] Footer renderiza corretamente
- [ ] Todos os links funcionam
- [ ] Redes sociais abrem em aba nova
- [ ] Mapa Google Maps carrega
- [ ] Countdown está funcionando
- [ ] Responsive em 320px, 768px, 1024px, 1920px

---

## 🎯 VARIAÇÕES POR TIPO DE NEGÓCIO

### Restaurante/Café
- Maps + Delivery apps proeminentes
- Horários em destaque
- Instagram importante

### Salão/Serviços
- Formulário de agendamento
- Horários de atendimento
- WhatsApp para contato

### Loja/Retail
- Localização em destaque
- Horários abertos/fechados dinâmico
- Links para redes sociais

---

## 🚀 PADRÃO FINAL ADOTADO

**Tipo:** Minimalista + Informativo
**Inspirado em:** Eleven Miles Cafe
**Status:** ✅ Pronto para implementação em todos os leads

---

## 📝 Referência: Eleven Miles Footer

```
Layout:
- Logo + Endereço (esquerda)
- Nav links + Instagram (centro)
- Copyright (direita)
- Divider
- Countdown badge | WhatsApp button (centro)
- Disclaimer text

Cores: Dark theme com Gold accents
Tipografia: Sans-serif clean, sizes 0.7rem - 0.9rem
Espacamento: Compact, minimal padding

Efeitos:
- Hover: text muda para gold
- Countdown: sempre visível e atualizado
- WhatsApp: underline on hover
```

---

**Versão:** 2.0 (Atualizado com Eleven Miles reference)
**Data:** 2026-02-27
**Autor:** DMIX Media Works
**Status:** ✅ Ready for Production
