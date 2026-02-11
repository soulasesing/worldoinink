# 📖 LECTOR DE HISTORIAS - Plan de Implementación

## 📋 Resumen

**Objetivo**: Crear una sección "Lector" donde los usuarios puedan explorar y leer historias publicadas. El sistema debe detectar automáticamente si una historia es interactiva y cargar el lector apropiado.

---

## 🎯 Requisitos

### Funcionales
1. Nuevo enlace "Lector" en el navbar (después de Dashboard)
2. Página `/library` con lista de historias publicadas
3. Al hacer clic en una historia:
   - Si `isInteractive = true` → Ir a `/read/[id]` (lector interactivo)
   - Si `isInteractive = false` → Ir a `/story/[id]` (lector normal)
4. Filtros: Todas / Interactivas / Lineales
5. Búsqueda por título
6. Cards con preview de la historia

### No Funcionales
- UI consistente con el resto de la app
- Responsive (mobile friendly)
- Loading states

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         NAVBAR                               │
│  [Dashboard] [Editor] [Lector] [Characters] [Mi Estilo]     │
│                          ↓                                   │
│                    Click "Lector"                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    /library (página)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔍 Buscar historias...          [Todas ▾]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 📖 Historia 1│  │ 🌳 Historia 2│  │ 📖 Historia 3│      │
│  │              │  │  INTERACTIVA │  │              │      │
│  │ "Resumen..." │  │ "Resumen..." │  │ "Resumen..." │      │
│  │ 👁 120 views │  │ 🔀 4 finales │  │ 👁 85 views  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
              Click en historia
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌─────────────────┐                ┌─────────────────┐
│ isInteractive?  │                │ isInteractive?  │
│     FALSE       │                │     TRUE        │
│                 │                │                 │
│  /story/[id]    │                │  /read/[id]     │
│  (Lector normal)│                │  (Interactivo)  │
└─────────────────┘                └─────────────────┘
```

---

## 📁 Archivos a Crear/Modificar

### 1. Modificar Navbar
**Archivo**: `src/components/layout/navbar.tsx`

```tsx
// Agregar nuevo enlace después de Dashboard
const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/library', label: 'Lector', icon: BookOpen },  // NUEVO
  { href: '/editor', label: 'Editor', icon: Edit },
  // ...resto
];
```

### 2. Crear Página de Biblioteca
**Archivo**: `src/app/library/page.tsx`

- Lista de historias publicadas
- Filtros (Todas / Interactivas / Lineales)
- Búsqueda
- Cards con info de cada historia
- Redirección inteligente al hacer clic

### 3. Crear Componente StoryCard para Biblioteca
**Archivo**: `src/components/library/story-card.tsx`

- Cover image o gradient
- Título y autor
- Badge si es interactiva (🌳)
- Stats (views, likes, palabras)
- Preview del contenido

### 4. Crear Página de Lectura Normal
**Archivo**: `src/app/story/[id]/page.tsx`

- Lector simple para historias lineales
- Contenido completo
- Info del autor
- Botón "Volver a biblioteca"

### 5. Crear API para Historias Públicas
**Archivo**: `src/app/api/library/route.ts`

- GET: Lista historias publicadas
- Soporta filtros y búsqueda
- Paginación (opcional)

---

## 🎨 Diseño de UI

### Card de Historia

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │     [Cover Image]           │   │
│  │     o Gradient              │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  🌳 INTERACTIVA  (badge opcional)   │
│                                     │
│  Título de la Historia              │
│  por Nombre del Autor               │
│                                     │
│  "Primeras palabras del            │
│   contenido como preview..."        │
│                                     │
│  👁 245  ❤️ 32  📝 1,234 palabras   │
│                                     │
└─────────────────────────────────────┘
```

### Página de Biblioteca

```
┌──────────────────────────────────────────────────────────────┐
│  📚 Biblioteca de Historias                                   │
│  Descubre historias increíbles de nuestra comunidad          │
│                                                               │
│  ┌────────────────────────┐  ┌─────────────────────────────┐ │
│  │ 🔍 Buscar historias... │  │ Filtro: [Todas        ▾]   │ │
│  └────────────────────────┘  └─────────────────────────────┘ │
│                                                               │
│  ── Destacadas ──────────────────────────────────────────── │
│                                                               │
│  [Card 1]  [Card 2]  [Card 3]  [Card 4]                      │
│                                                               │
│  ── Todas las historias ─────────────────────────────────── │
│                                                               │
│  [Card]  [Card]  [Card]                                      │
│  [Card]  [Card]  [Card]                                      │
│  ...                                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Modelo de Datos

### API Response: GET /api/library

```typescript
interface LibraryResponse {
  stories: Array<{
    id: string;
    title: string;
    content: string;        // Solo preview (primeros 200 chars)
    wordCount: number;
    views: number;
    likes: number;
    isInteractive: boolean;
    coverImageUrl: string | null;
    createdAt: string;
    author: {
      id: string;
      name: string;
      image: string | null;
    };
    // Solo para interactivas:
    _count?: {
      storyNodes: number;
    };
  }>;
  total: number;
  page: number;
  hasMore: boolean;
}
```

### Query Params

```
GET /api/library?type=all&search=bosque&page=1&limit=12

type: 'all' | 'interactive' | 'linear'
search: string (búsqueda en título)
page: number
limit: number
```

---

## 🚀 Fases de Implementación

### Fase 1: API y Datos (30 min)
```
□ 1.1 Crear API /api/library (GET)
□ 1.2 Implementar filtros y búsqueda
□ 1.3 Probar con Postman/curl
```

### Fase 2: Página de Biblioteca (1 hora)
```
□ 2.1 Crear página /library
□ 2.2 Crear componente StoryCard
□ 2.3 Implementar búsqueda y filtros
□ 2.4 Redirección inteligente (interactiva vs normal)
```

### Fase 3: Lector Normal (45 min)
```
□ 3.1 Crear página /story/[id]
□ 3.2 UI de lectura limpia
□ 3.3 Info del autor
□ 3.4 Navegación
```

### Fase 4: Navbar (15 min)
```
□ 4.1 Agregar enlace "Lector" al navbar
□ 4.2 Icono y estilo consistente
□ 4.3 Mobile menu
```

### Fase 5: Polish (30 min)
```
□ 5.1 Loading states
□ 5.2 Empty states
□ 5.3 Error handling
□ 5.4 Responsive
```

**Tiempo total estimado: ~3 horas**

---

## ✅ Checklist Final

- [ ] Navbar tiene enlace "Lector"
- [ ] /library muestra historias publicadas
- [ ] Filtro por tipo funciona
- [ ] Búsqueda funciona
- [ ] Click en historia interactiva → /read/[id]
- [ ] Click en historia normal → /story/[id]
- [ ] Lector normal muestra contenido completo
- [ ] UI responsive
- [ ] Loading states implementados

---

## 🎯 Resultado Esperado

### Flujo del Usuario

1. Usuario hace clic en "Lector" en el navbar
2. Ve la biblioteca con todas las historias publicadas
3. Puede filtrar por "Interactivas" para ver solo esas
4. Hace clic en "El Bosque de las Decisiones" (interactiva)
5. Se abre el lector interactivo con decisiones
6. O hace clic en otra historia normal
7. Se abre el lector simple con el contenido completo

---

**Versión:** 1.0.0  
**Fecha:** Febrero 2025  
**Estado:** ✅ IMPLEMENTADO

---

## Archivos Creados/Modificados

| Archivo | Estado |
|---------|--------|
| `src/app/api/library/route.ts` | ✅ Creado |
| `src/components/library/story-card.tsx` | ✅ Creado |
| `src/components/library/index.ts` | ✅ Creado |
| `src/app/library/page.tsx` | ✅ Creado |
| `src/app/story/[id]/page.tsx` | ✅ Creado |
| `src/components/layout/navbar.tsx` | ✅ Modificado |
