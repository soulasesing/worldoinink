# 🌳 NARRACIÓN INTERACTIVA MULTIRUTA - Plan de Implementación

## 📋 Resumen Ejecutivo

**"El lector elige lo que pasa en la historia. ¿El personaje entra al bosque o escapa? ¿Confiesa su amor o guarda silencio? Cada decisión lleva a un camino diferente."**

Esta funcionalidad transforma historias lineales en **experiencias narrativas interactivas** donde el lector toma decisiones que afectan el desarrollo de la trama.

---

## 🎯 Objetivos

### Objetivo Principal
Permitir a los escritores crear historias con múltiples caminos narrativos que los lectores pueden explorar tomando decisiones.

### Objetivos Específicos
1. Crear un editor visual para diseñar bifurcaciones narrativas
2. Implementar un modo lectura interactivo con opciones de decisión
3. Mantener compatibilidad con historias lineales existentes
4. Integrar con las funcionalidades de IA existentes

---

## 🧠 ANÁLISIS SECUENCIAL

### Paso 1: Entender el Concepto

```
HISTORIA LINEAL (actual):
[Inicio] → [Desarrollo] → [Final]

HISTORIA MULTIRUTA (nueva):
                    ┌→ [Camino A] → [Final A]
[Inicio] → [Nodo 1] ┤
                    └→ [Camino B] → [Nodo 2] ┬→ [Final B]
                                             └→ [Final C]
```

**Terminología:**
- **Nodo**: Un fragmento de historia (escena, capítulo, momento)
- **Decisión**: Punto donde el lector elige entre opciones
- **Opción**: Cada alternativa que lleva a un nodo diferente
- **Ruta**: Un camino completo desde inicio hasta un final
- **Final**: Nodo terminal sin más opciones

---

### Paso 2: Analizar Impacto en el Sistema Existente

| Componente | Impacto | Riesgo |
|------------|---------|--------|
| Schema Prisma | ALTO - Nuevos modelos | Medio |
| Editor page.tsx | MEDIO - Modo adicional | Bajo |
| API Stories | BAJO - Extender | Bajo |
| Dashboard | BAJO - Indicador | Bajo |
| AI Features | BAJO - Opcional | Bajo |

**Principio clave**: Las historias lineales existentes NO deben verse afectadas.

---

### Paso 3: Diseñar el Modelo de Datos

#### 3.1 Opción A: Modelo Embebido (Simple)
```prisma
// Guardar estructura en JSON dentro de Story
model Story {
  // ... campos existentes ...
  isInteractive  Boolean @default(false)
  storyStructure Json?   // Nodos y conexiones
}
```
**Pros**: Mínimo cambio en schema
**Contras**: Difícil de consultar, sin relaciones

#### 3.2 Opción B: Modelo Relacional (Recomendado) ✅
```prisma
model Story {
  // ... campos existentes ...
  isInteractive  Boolean      @default(false)
  storyNodes     StoryNode[]
}

model StoryNode {
  id          String   @id @default(cuid())
  storyId     String
  story       Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)
  
  // Contenido del nodo
  title       String            // "Capítulo 1" o "El bosque oscuro"
  content     String   @db.Text // Contenido HTML del fragmento
  nodeType    NodeType @default(CONTENT)
  
  // Posición en el árbol
  position    Int      @default(0)  // Orden para nodos raíz
  isStart     Boolean  @default(false)
  isEnding    Boolean  @default(false)
  
  // Relaciones
  outgoingChoices  Choice[]  @relation("FromNode")
  incomingChoices  Choice[]  @relation("ToNode")
  
  // Metadata
  wordCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storyId])
}

model Choice {
  id          String    @id @default(cuid())
  
  // Conexión
  fromNodeId  String
  fromNode    StoryNode @relation("FromNode", fields: [fromNodeId], references: [id], onDelete: Cascade)
  toNodeId    String
  toNode      StoryNode @relation("ToNode", fields: [toNodeId], references: [id], onDelete: Cascade)
  
  // Contenido de la decisión
  text        String    // "Entrar al bosque" o "Escapar corriendo"
  emoji       String?   // "🌲" o "🏃"
  position    Int       @default(0) // Orden de las opciones
  
  // Estadísticas
  timesChosen Int       @default(0)
  
  createdAt   DateTime  @default(now())
  
  @@index([fromNodeId])
  @@index([toNodeId])
}

enum NodeType {
  CONTENT     // Nodo normal con texto
  DECISION    // Nodo que presenta opciones
  ENDING      // Final de una ruta
}
```

**Por qué Opción B:**
- Consultas eficientes
- Estadísticas de decisiones
- Escalable
- Type-safe con Prisma

---

### Paso 4: Diseñar la Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   │
│  │  EDITOR MODE    │   │  GRAPH EDITOR   │   │  READER MODE    │   │
│  │  (Existente)    │   │  (Nuevo)        │   │  (Nuevo)        │   │
│  │                 │   │                 │   │                 │   │
│  │ - Historia      │   │ - Visualizar    │   │ - Leer nodo     │   │
│  │   lineal        │   │   árbol         │   │ - Ver opciones  │   │
│  │ - ReactQuill    │   │ - Crear nodos   │   │ - Elegir camino │   │
│  │                 │   │ - Conectar      │   │ - Tracking ruta │   │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘   │
│           │                    │                      │              │
│           └────────────────────┼──────────────────────┘              │
│                                │                                      │
└────────────────────────────────┼──────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API ROUTES                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  /api/stories/[id]/nodes     - CRUD de nodos                         │
│  /api/stories/[id]/choices   - CRUD de decisiones                    │
│  /api/stories/[id]/structure - Obtener árbol completo                │
│  /api/stories/[id]/convert   - Convertir lineal → interactiva        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Story ─────┬───── StoryNode ─────── Choice                          │
│             │                                                         │
│  (existing) │      (nuevo)          (nuevo)                          │
│             │                                                         │
└─────────────┴────────────────────────────────────────────────────────┘
```

---

### Paso 5: Definir Flujos de Usuario

#### Flujo 1: Crear Historia Interactiva (Escritor)

```
1. Usuario en Editor
   │
   ├─→ Click "Convertir a Interactiva" (historia existente)
   │   └─→ Convierte contenido en primer nodo
   │
   └─→ Click "Nueva Historia Interactiva" (desde cero)
       └─→ Crea historia con nodo inicial vacío

2. Editor de Nodos (Graph Editor)
   │
   ├─→ Ver árbol visual de la historia
   │
   ├─→ Click en nodo → Editar contenido (ReactQuill)
   │
   ├─→ Click "Añadir Decisión" en un nodo
   │   ├─→ Escribir texto de opción 1: "Entrar al bosque"
   │   ├─→ Escribir texto de opción 2: "Escapar"
   │   └─→ Crear nodos destino automáticamente
   │
   ├─→ Conectar nodos existentes (drag & drop)
   │
   └─→ Marcar nodo como "Final" ✓

3. Preview / Publicar
   │
   ├─→ Preview: Probar como lector
   │
   └─→ Publicar: Disponible para lectores
```

#### Flujo 2: Leer Historia Interactiva (Lector)

```
1. Lector abre historia interactiva
   │
   └─→ Ve badge "Historia Interactiva 🌳"

2. Comienza lectura
   │
   └─→ Muestra nodo inicial

3. Lee contenido del nodo
   │
   └─→ Al final, ve opciones de decisión

4. Elige una opción
   │
   ├─→ Animación de transición
   │
   └─→ Carga siguiente nodo

5. Repite hasta llegar a un FINAL
   │
   ├─→ Muestra mensaje "Has llegado a un final"
   │
   ├─→ Opción: "Volver al inicio"
   │
   └─→ Opción: "Explorar otro camino"
```

---

### Paso 6: Diseñar Componentes UI

#### 6.1 Editor de Grafos (InteractiveStoryEditor)

```tsx
// src/components/interactive-story/interactive-story-editor.tsx

interface InteractiveStoryEditorProps {
  storyId: string;
  nodes: StoryNode[];
  choices: Choice[];
  onSave: () => void;
}

// Características:
// - Canvas visual con nodos arrastrables
// - Líneas conectando nodos (choices)
// - Panel lateral para editar nodo seleccionado
// - Minimap para historias grandes
// - Zoom in/out
```

**Librería recomendada**: `reactflow` (antes react-flow-renderer)
- Gratuita y open source
- Excelente para diagramas de nodos
- Fácil de personalizar

#### 6.2 Editor de Nodo Individual

```tsx
// src/components/interactive-story/node-editor.tsx

interface NodeEditorProps {
  node: StoryNode;
  onUpdate: (node: StoryNode) => void;
  onAddChoice: () => void;
  onDelete: () => void;
}

// Características:
// - ReactQuill para contenido
// - Lista de choices salientes
// - Botón "Marcar como final"
// - Preview del contenido
```

#### 6.3 Lector Interactivo

```tsx
// src/components/interactive-story/interactive-reader.tsx

interface InteractiveReaderProps {
  storyId: string;
  storyTitle: string;
}

// Características:
// - Contenido del nodo actual
// - Botones de decisión al final
// - Barra de progreso (opcional)
// - Historial de decisiones
// - Animaciones de transición
```

#### 6.4 Botones de Decisión

```tsx
// src/components/interactive-story/choice-buttons.tsx

interface ChoiceButtonsProps {
  choices: Choice[];
  onChoose: (choiceId: string) => void;
  disabled?: boolean;
}

// Diseño:
// - Cards con gradiente
// - Emoji opcional
// - Hover effect
// - Animación al elegir
```

---

### Paso 7: Definir API Routes

#### GET /api/stories/[id]/structure
Obtener estructura completa de la historia interactiva.

```typescript
// Response
{
  story: {
    id: string;
    title: string;
    isInteractive: boolean;
  },
  nodes: StoryNode[],
  choices: Choice[],
  stats: {
    totalNodes: number;
    totalEndings: number;
    totalChoices: number;
  }
}
```

#### POST /api/stories/[id]/nodes
Crear nuevo nodo.

```typescript
// Request
{
  title: string;
  content: string;
  nodeType: 'CONTENT' | 'DECISION' | 'ENDING';
  isStart?: boolean;
}

// Response
{
  node: StoryNode;
}
```

#### PUT /api/stories/[id]/nodes/[nodeId]
Actualizar nodo existente.

#### DELETE /api/stories/[id]/nodes/[nodeId]
Eliminar nodo (y choices conectados).

#### POST /api/stories/[id]/choices
Crear decisión/conexión.

```typescript
// Request
{
  fromNodeId: string;
  toNodeId: string;
  text: string;
  emoji?: string;
}

// Response
{
  choice: Choice;
}
```

#### DELETE /api/stories/[id]/choices/[choiceId]
Eliminar conexión.

#### POST /api/stories/[id]/convert
Convertir historia lineal a interactiva.

```typescript
// Request
{} // No necesita body

// Response
{
  success: true;
  startNode: StoryNode; // Nodo creado con el contenido original
}
```

---

### Paso 8: Plan de Implementación por Fases

## 📅 FASES DE IMPLEMENTACIÓN

### FASE 1: Base de Datos (1-2 horas)
**Objetivo**: Crear modelos y migración

```
□ 1.1 Agregar modelos al schema.prisma
□ 1.2 Crear migración
□ 1.3 Generar cliente Prisma
□ 1.4 Probar con Prisma Studio
```

**Archivos a crear/modificar**:
- `prisma/schema.prisma` (modificar)
- `prisma/migrations/[timestamp]_add_interactive_stories/` (crear)

---

### FASE 2: API Routes (2-3 horas)
**Objetivo**: CRUD de nodos y choices

```
□ 2.1 GET/POST /api/stories/[id]/nodes
□ 2.2 PUT/DELETE /api/stories/[id]/nodes/[nodeId]
□ 2.3 POST/DELETE /api/stories/[id]/choices
□ 2.4 GET /api/stories/[id]/structure
□ 2.5 POST /api/stories/[id]/convert
```

**Archivos a crear**:
- `src/app/api/stories/[id]/nodes/route.ts`
- `src/app/api/stories/[id]/nodes/[nodeId]/route.ts`
- `src/app/api/stories/[id]/choices/route.ts`
- `src/app/api/stories/[id]/choices/[choiceId]/route.ts`
- `src/app/api/stories/[id]/structure/route.ts`
- `src/app/api/stories/[id]/convert/route.ts`

---

### FASE 3: Lector Interactivo (3-4 horas) ⭐ PRIORIDAD DEMO
**Objetivo**: Poder leer historias interactivas

```
□ 3.1 Componente InteractiveReader
□ 3.2 Componente ChoiceButtons
□ 3.3 Página /read/[storyId]
□ 3.4 Animaciones de transición
□ 3.5 Tracking de ruta del lector
```

**Archivos a crear**:
- `src/components/interactive-story/interactive-reader.tsx`
- `src/components/interactive-story/choice-buttons.tsx`
- `src/app/read/[id]/page.tsx`
- `src/types/interactive.ts`

**Por qué prioridad**: Para la demo, es más impactante mostrar la experiencia del lector.

---

### FASE 4: Editor de Grafos (4-6 horas)
**Objetivo**: Editor visual para crear historias

```
□ 4.1 Instalar reactflow
□ 4.2 Componente InteractiveStoryEditor
□ 4.3 Componente NodeEditor (ReactQuill integrado)
□ 4.4 Componente ChoiceEditor
□ 4.5 Integrar en página del editor
□ 4.6 Modo toggle: Lineal ↔ Interactivo
```

**Archivos a crear**:
- `src/components/interactive-story/interactive-story-editor.tsx`
- `src/components/interactive-story/node-editor.tsx`
- `src/components/interactive-story/story-graph.tsx`

**Dependencia a instalar**:
```bash
npm install reactflow
```

---

### FASE 5: Integración con Dashboard (1-2 horas)
**Objetivo**: Mostrar historias interactivas en el dashboard

```
□ 5.1 Badge "Interactiva 🌳" en StoryCard
□ 5.2 Filtro para historias interactivas
□ 5.3 Estadísticas (rutas, finales, decisiones)
```

---

### FASE 6: Mejoras Opcionales (Post-demo)

```
□ 6.1 Integración con IA - Sugerir bifurcaciones
□ 6.2 Analytics - Qué opciones eligen más los lectores
□ 6.3 Achievements - "Exploraste todos los finales"
□ 6.4 Compartir ruta específica
□ 6.5 Export a formato Twine/otros
```

---

## 🎯 MVP PARA DEMO (Miércoles)

### Alcance Mínimo Viable

| Componente | Incluido | Notas |
|------------|----------|-------|
| Schema + Migración | ✅ | Base necesaria |
| API básica | ✅ | CRUD mínimo |
| Lector interactivo | ✅ | **Estrella de la demo** |
| Historia de ejemplo | ✅ | Pre-cargada en DB |
| Editor visual | ⚠️ | Simplificado o mockup |
| Dashboard integration | ❌ | Post-demo |

### Historia de Ejemplo para Demo

```
TÍTULO: "El Bosque de las Decisiones"

[INICIO]
Te encuentras en la entrada de un bosque misterioso. 
El camino se bifurca frente a ti.

  → "Entrar al bosque" 🌲
  → "Rodear el bosque" 🏃

[CAMINO A - Bosque]
Avanzas entre los árboles. Un sonido extraño te detiene.
¿Investigas o continúas?

  → "Investigar el sonido" 🔍
  → "Continuar caminando" 👣

[CAMINO B - Rodear]
Decides ir por lo seguro. El camino es largo pero tranquilo.
Llegas a un pueblo al anochecer.

  → "Buscar posada" 🏨
  → "Seguir de noche" 🌙

[... más nodos y finales ...]
```

---

## 📊 Estimación de Tiempo

### Para MVP Demo (Miércoles)

| Fase | Tiempo | Prioridad |
|------|--------|-----------|
| Fase 1: Schema | 1h | CRÍTICO |
| Fase 2: APIs básicas | 2h | CRÍTICO |
| Fase 3: Lector | 3h | CRÍTICO |
| Historia ejemplo | 1h | CRÍTICO |
| **TOTAL MVP** | **7h** | - |

### Implementación Completa

| Fase | Tiempo |
|------|--------|
| Fases 1-3 (MVP) | 7h |
| Fase 4: Editor visual | 5h |
| Fase 5: Dashboard | 2h |
| Testing & Polish | 3h |
| **TOTAL COMPLETO** | **17h** |

---

## 🔧 Dependencias Técnicas

### Nuevas dependencias
```json
{
  "reactflow": "^11.10.0"  // Editor visual de grafos
}
```

### Dependencias existentes que usaremos
- ReactQuill (ya instalado) - Para editar contenido de nodos
- Prisma (ya instalado) - ORM
- Tailwind (ya instalado) - Estilos
- Lucide React (ya instalado) - Iconos

---

## 🚨 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Tiempo insuficiente para demo | Alta | Alto | Priorizar lector sobre editor |
| Complejidad del editor visual | Media | Medio | Usar reactflow como base |
| Conflictos con código existente | Baja | Bajo | Nuevos modelos aislados |
| Performance con muchos nodos | Baja | Bajo | Lazy loading |

---

## ✅ Checklist Pre-Implementación

Antes de empezar a codear, confirmar:

- [ ] ¿El plan cubre los requisitos de la demo?
- [ ] ¿El schema de datos es correcto?
- [ ] ¿La UI propuesta es factible en el tiempo?
- [ ] ¿Hay preguntas o cambios al plan?

---

## 📝 Notas Finales

### Filosofía de diseño
1. **No romper lo existente**: Historias lineales siguen funcionando igual
2. **Progresivo**: Empezar simple, iterar después
3. **Demostrable**: Priorizar experiencia del lector para la expo

### Alineación con la visión
> "Cada decisión lleva a un camino diferente. Esto hace que la lectura sea como un juego narrativo, donde el lector se convierte en parte de la historia."

Esta implementación permite exactamente eso: el lector toma decisiones que afectan el desarrollo de la historia, convirtiéndose en co-autor de su experiencia.

---

**Versión:** 1.0.0  
**Fecha:** Febrero 2025  
**Estado:** ✅ **IMPLEMENTADO**

---

## ✅ IMPLEMENTACIÓN COMPLETADA

### Archivos Creados

#### Schema y Migración
- `prisma/schema.prisma` - Modelos StoryNode, Choice, NodeType agregados
- `prisma/migrations/20250209000000_add_interactive_stories/migration.sql`

#### Tipos TypeScript
- `src/types/interactive.ts` - Tipos completos para la funcionalidad

#### APIs (6 endpoints)
- `src/app/api/stories/[id]/structure/route.ts` - GET estructura completa
- `src/app/api/stories/[id]/nodes/route.ts` - GET/POST nodos
- `src/app/api/stories/[id]/nodes/[nodeId]/route.ts` - GET/PUT/DELETE nodo
- `src/app/api/stories/[id]/choices/route.ts` - POST choice
- `src/app/api/stories/[id]/choices/[choiceId]/route.ts` - PUT/DELETE/POST choice
- `src/app/api/stories/[id]/convert/route.ts` - Convertir a interactiva

#### Componentes Frontend
- `src/components/interactive-story/choice-buttons.tsx` - Botones de decisión
- `src/components/interactive-story/interactive-reader.tsx` - Lector completo
- `src/components/interactive-story/index.ts` - Exportaciones

#### Página de Lectura
- `src/app/read/[id]/page.tsx` - Página para leer historias interactivas

#### Historia de Ejemplo
- `prisma/seed-interactive-story.sql` - "El Bosque de las Decisiones"

---

## 🚀 Comandos para Activar

```bash
# 1. Aplicar migración
cd worldinink
npx prisma db push   # o: npx prisma migrate deploy

# 2. Regenerar cliente Prisma
npx prisma generate

# 3. (Opcional) Cargar historia de ejemplo
psql -d worldinink -f prisma/seed-interactive-story.sql

# 4. Iniciar servidor
npm run dev

# 5. Probar en: http://localhost:3000/read/demo-interactive-story-001
```

---

## 🎯 Listo para Demo

La funcionalidad está completa. Para la demo del miércoles:

1. ✅ Lector interactivo hermoso
2. ✅ Botones de decisión animados  
3. ✅ Múltiples finales
4. ✅ Progreso del lector
5. ✅ Historia de ejemplo pre-cargada
