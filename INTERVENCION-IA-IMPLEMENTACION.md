# 🎭 INTERVENCIÓN IA (PERSONAJES VIVOS) - Implementación

## 📋 Resumen de la Funcionalidad

**"Imagina que estás escribiendo una historia… y de repente uno de tus personajes te interrumpe, te habla, te reclama o te guía. Esta función hace que la IA actúe como un personaje vivo dentro del editor."**

---

## ✅ Componentes Implementados

### 1. Base de Datos (Prisma)

**Archivo:** `prisma/schema.prisma`

Campos agregados al modelo `Character`:
- `personality` (JSON) - Temperamento, estilo de hablar, humor
- `voiceTone` - Tono de voz del personaje
- `emotionalRange` - Rango emocional
- `triggerTopics` - Temas que activan al personaje
- `triggerWords` - Palabras específicas que lo activan
- `interventionEnabled` - Si está activo
- `interventionStyle` - Estilo de intervención
- `interventionFrequency` - Frecuencia de intervenciones
- `lastIntervention` - Última intervención
- `totalInterventions` - Contador total

**Migración SQL:** `prisma/migrations/20250108000001_add_character_intervention/migration.sql`

### 2. Tipos TypeScript

**Archivo:** `src/types/intervention.ts`

- `CharacterIntervention` - Datos de una intervención
- `InterventionSettings` - Configuración del sistema
- `CharacterPersonality` - Personalidad del personaje
- `CharacterForIntervention` - Personaje preparado para intervenir
- Constantes: `MIN_TEXT_CHANGE`, `CONTEXT_WINDOW`, `interventionCooldowns`

### 3. Servicio de Intervenciones

**Archivo:** `src/lib/intervention/intervention-service.ts`

| Función | Descripción |
|---------|-------------|
| `getInterventionCharacters()` | Obtiene personajes habilitados para intervenir |
| `analyzeForIntervention()` | Analiza si un personaje debe intervenir |
| `generateIntervention()` | Genera la intervención con GPT-4 |
| `checkForIntervention()` | Verifica y genera intervención para un personaje |
| `checkAllCharactersForIntervention()` | Verifica todos los personajes de una historia |

### 4. API Routes

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/assistant/intervention` | POST | Verificar y generar intervenciones |
| `/api/character/intervene` | POST | Endpoint alternativo |

### 5. Componentes Frontend

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| `CharacterInterventionPopup` | `src/components/intervention/character-intervention-popup.tsx` | Popup de intervención |
| `InterventionSettingsPanel` | `src/components/intervention/intervention-settings-panel.tsx` | Panel de configuración |

### 6. Hooks

| Hook | Archivo | Descripción |
|------|---------|-------------|
| `useCharacterIntervention` | `src/hooks/useCharacterIntervention.ts` | Monitoreo y gestión de intervenciones |
| `useInterventionMonitor` | `src/hooks/useInterventionMonitor.ts` | Hook alternativo de monitoreo |

### 7. Integración en Editor

El editor (`src/app/editor/page.tsx`) ya incluye:
- Import del hook `useCharacterIntervention`
- Import del componente `CharacterInterventionPopup`
- Integración con el sistema de intervenciones

---

## 🚀 Cómo Usar

### 1. Aplicar la Migración

```sql
-- Ejecutar en tu cliente de base de datos (pgAdmin, DBeaver, etc.)

ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "personality" JSONB;
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "voiceTone" TEXT NOT NULL DEFAULT 'neutral';
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "emotionalRange" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "triggerTopics" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "triggerWords" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "interventionEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "interventionStyle" TEXT NOT NULL DEFAULT 'suggestion';
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "interventionFrequency" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "lastIntervention" TIMESTAMP(3);
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "totalInterventions" INTEGER NOT NULL DEFAULT 0;
```

### 2. Regenerar Prisma Client

```bash
npx prisma generate
```

### 3. Configurar un Personaje para Intervenir

Actualiza un personaje existente con datos de intervención:

```sql
UPDATE "Character" 
SET 
  personality = '{"temperament": "passionate", "speakingStyle": "direct", "humor": "sarcastic", "confidence": "confident"}',
  "voiceTone" = 'dramatic',
  "emotionalRange" = ARRAY['anger', 'curiosity', 'determination'],
  "triggerTopics" = ARRAY['love', 'betrayal', 'danger'],
  "triggerWords" = ARRAY['muerte', 'secreto', 'traición', 'amor'],
  "interventionEnabled" = true,
  "interventionStyle" = 'suggestion',
  "interventionFrequency" = 'medium'
WHERE name = 'TU_PERSONAJE';
```

### 4. Probar en el Editor

1. Abre el editor con una historia que tenga personajes
2. Escribe texto que mencione al personaje o sus triggers
3. Espera 3 segundos después de dejar de escribir
4. ¡El personaje debería intervenir!

---

## 🎭 Tipos de Intervención

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `suggestion` | Sugerencias amables | "¿Y si en lugar de ir al bosque, vamos al lago?" |
| `complaint` | Quejas divertidas | "¡Otra vez me pones en peligro! ¿No puedo tener un día tranquilo?" |
| `question` | Preguntas intrigantes | "¿Por qué crees que hice eso? ¿Qué sabes de mi pasado?" |
| `encouragement` | Apoyo al autor | "¡Me encanta hacia dónde va esto! Sigue así." |
| `reaction` | Reacciones generales | "Hmm, interesante decisión..." |

---

## ⚙️ Configuración de Frecuencia

| Frecuencia | Cooldown | Probabilidad |
|------------|----------|--------------|
| `low` | 5 minutos | 15% |
| `medium` | 2 minutos | 30% |
| `high` | 30 segundos | 50% |

---

## 🎨 Personalidades Disponibles

### Temperamentos
- `calm` - Tranquilo y reflexivo
- `passionate` - Apasionado y expresivo
- `melancholic` - Melancólico y profundo
- `cheerful` - Alegre y optimista
- `mysterious` - Misterioso y enigmático

### Estilos de Hablar
- `formal` - Formal y educado
- `casual` - Casual y relajado
- `poetic` - Poético y elaborado
- `direct` - Directo y conciso
- `playful` - Juguetón y divertido

### Tipos de Humor
- `none` - Sin humor
- `subtle` - Humor sutil
- `sarcastic` - Sarcástico
- `witty` - Ingenioso
- `dark` - Humor negro

---

## 📊 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        EDITOR                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  useCharacterIntervention Hook                       │    │
│  │  - Monitorea cambios en el texto                     │    │
│  │  - Calcula si debe analizar                          │    │
│  │  - Gestiona cooldowns                                │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  CharacterInterventionPopup                          │    │
│  │  - Muestra intervención                              │    │
│  │  - Permite responder/ignorar                         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   API /api/assistant/intervention            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                INTERVENTION SERVICE                          │
├─────────────────────────────────────────────────────────────┤
│  1. getInterventionCharacters() - Obtiene personajes        │
│  2. analyzeForIntervention() - Detecta triggers             │
│  3. generateIntervention() - Genera con GPT-4               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      GPT-4 TURBO                             │
│  - System prompt con personalidad del personaje             │
│  - Genera intervención en la voz del personaje              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Próximos Pasos

1. [ ] Crear UI para configurar personalidad de personajes
2. [ ] Agregar historial de intervenciones
3. [ ] Implementar "conversaciones" con personajes
4. [ ] Agregar feedback del usuario (útil/molesto)
5. [ ] Machine learning para mejorar timing de intervenciones

---

**Versión:** 1.0.0
**Fecha:** Enero 2025

