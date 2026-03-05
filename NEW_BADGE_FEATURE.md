# 🆕 New Badge Feature - Lovable CRM

## O que foi implementado?

Um badge **"🆕 New"** agora aparece automaticamente quando um card é movido para um novo bloco (status) no Kanban.

## Como funciona?

### Backend Changes
- ✅ Adicionado campo `status_changed_at` ao modelo `Lead`
- ✅ Atualizado método `move_to_stage` para gravar o timestamp quando status muda
- ✅ Criada migration SQL para adicionar coluna ao banco

### Frontend Changes
- ✅ Adicionada função `isReccentlyMoved()` que verifica se o card foi movido há menos de 5 minutos
- ✅ Badge "🆕 New" com gradient purple-pink e animação pulse
- ✅ Atualizado tipo `Lead` para incluir `status_changed_at`

## Visual

```
┌─────────────────────┐
│ 🆕 New    HIGH PRIORITY │
│                     │
│ Business Name       │
│ Suburb              │
│ 📞 Phone            │
│ 📧 Email            │
│                     │
│ [Action Buttons]    │
└─────────────────────┘
```

- O badge aparece em **GRADIENTE COLORIDO** (roxo → rosa)
- Tem animação **PULSE** para chamar atenção
- Desaparece automaticamente após **5 minutos**

## Quando aparece o badge?

O badge "New" aparece quando:
- ✅ Um card é arrastado para outro bloco
- ✅ Um card é movido via botão de ação (Preview →, Sample →, etc)
- ✅ Um card é movido via API
- ✅ Passou **menos de 5 minutos** desde a última mudança de status

## Timeline

- **Minuto 0-5**: Badge visível com animação
- **Minuto 5+**: Badge desaparece automaticamente

## Customização

Se você quiser mudar o tempo de expiração, edite `KanbanCard.tsx`:

```typescript
// Linha ~24 - altere este número (em minutos)
return minutesAgo < 5  // Mudar para 10, 15, etc
```

Para mudar as cores, edite a className do badge:
```tsx
className="... from-purple-500 to-pink-500 ..." // Alterar cores aqui
```

## Database

A coluna `status_changed_at` foi adicionada com:
- Default: CURRENT_TIMESTAMP
- Index: Criado para performance em queries

Se o banco tiver dados antigos, eles usarão o timestamp de criação do banco.
