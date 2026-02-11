-- ============================================
-- SEED: Historia Interactiva de Ejemplo
-- "El Bosque de las Decisiones"
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Primero ejecuta la migración de base de datos
-- 2. Reemplaza 'YOUR_USER_ID' con el ID de un usuario existente
-- 3. Ejecuta este script en tu base de datos
--
-- También puedes usar la API: POST /api/stories/[id]/nodes
-- ============================================

-- Crear variable para el user ID (reemplazar con un ID real)
-- En PostgreSQL puedes usar DO blocks para esto

DO $$
DECLARE
    v_user_id TEXT;
    v_story_id TEXT := 'demo-interactive-story-001';
    v_node_start TEXT := 'node-start-001';
    v_node_forest TEXT := 'node-forest-001';
    v_node_around TEXT := 'node-around-001';
    v_node_sound TEXT := 'node-sound-001';
    v_node_continue TEXT := 'node-continue-001';
    v_node_inn TEXT := 'node-inn-001';
    v_node_night TEXT := 'node-night-001';
    v_node_ending_treasure TEXT := 'node-ending-treasure';
    v_node_ending_safe TEXT := 'node-ending-safe';
    v_node_ending_adventure TEXT := 'node-ending-adventure';
BEGIN
    -- Obtener el primer usuario (o especificar uno)
    SELECT id INTO v_user_id FROM "User" LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No hay usuarios en la base de datos. Crea un usuario primero.';
    END IF;

    -- ============================================
    -- CREAR LA HISTORIA
    -- ============================================
    INSERT INTO "Story" (
        id, title, content, "wordCount", published, views, likes, 
        "createdAt", "updatedAt", "authorId", "isInteractive"
    ) VALUES (
        v_story_id,
        'El Bosque de las Decisiones',
        '<p>Una historia interactiva donde tú eliges el camino...</p>',
        10,
        true,
        0, 0,
        NOW(), NOW(),
        v_user_id,
        true
    ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        "isInteractive" = true,
        "updatedAt" = NOW();

    -- ============================================
    -- CREAR LOS NODOS
    -- ============================================

    -- NODO INICIO (Start)
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", position, "isStart", "isEnding", "wordCount", "createdAt", "updatedAt"
    ) VALUES (
        v_node_start,
        v_story_id,
        'El Comienzo',
        '<p>Te encuentras en un sendero polvoriento, justo frente a la entrada de un <strong>bosque misterioso</strong>. Los árboles se alzan imponentes, sus copas tan densas que apenas dejan pasar la luz del sol.</p>
        <p>El viento susurra entre las hojas, como si el bosque mismo quisiera contarte un secreto. A tu izquierda, un viejo letrero de madera dice: <em>"El que entra, no siempre sale igual"</em>.</p>
        <p>El camino se bifurca frente a ti. Puedes adentrarte en el bosque o tomar el sendero que lo rodea.</p>',
        'CONTENT',
        0,
        true,
        false,
        85,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "updatedAt" = NOW();

    -- NODO: Entrar al bosque
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", position, "isStart", "isEnding", "wordCount", "createdAt", "updatedAt"
    ) VALUES (
        v_node_forest,
        v_story_id,
        'Dentro del Bosque',
        '<p>Decides adentrarte en el bosque. La luz se filtra en rayos dorados entre las hojas, creando un espectáculo de luces y sombras.</p>
        <p>Caminas durante varios minutos cuando, de repente, escuchas un <strong>sonido extraño</strong>. Es una melodía, suave pero inquietante, que parece venir de lo profundo del bosque.</p>
        <p>Tu corazón late más rápido. ¿Investigas el sonido o continúas tu camino?</p>',
        'CONTENT',
        1,
        false,
        false,
        70,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "updatedAt" = NOW();

    -- NODO: Rodear el bosque
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", position, "isStart", "isEnding", "wordCount", "createdAt", "updatedAt"
    ) VALUES (
        v_node_around,
        v_story_id,
        'El Camino Seguro',
        '<p>Decides tomar el camino seguro y rodear el bosque. El sendero es largo pero tranquilo, bordeado de flores silvestres.</p>
        <p>El sol comienza a ponerse y el cielo se tiñe de naranja y púrpura. A lo lejos, divisas las luces de un <strong>pequeño pueblo</strong>.</p>
        <p>Llegas al pueblo justo cuando cae la noche. Tienes dos opciones: buscar una posada para descansar o continuar tu viaje bajo las estrellas.</p>',
        'CONTENT',
        1,
        false,
        false,
        75,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "updatedAt" = NOW();

    -- NODO: Investigar el sonido
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", position, "isStart", "isEnding", "wordCount", "createdAt", "updatedAt"
    ) VALUES (
        v_node_sound,
        v_story_id,
        'El Descubrimiento',
        '<p>Tu curiosidad es más fuerte que tu miedo. Sigues la melodía hasta llegar a un claro iluminado por la luna.</p>
        <p>En el centro, encuentras una <strong>antigua fuente de piedra</strong>. El agua brilla con un resplandor mágico, y en el fondo... ¡hay un cofre!</p>
        <p>Con manos temblorosas, sacas el cofre del agua. Dentro encuentras un <em>mapa antiguo</em> que señala un tesoro escondido y una nota que dice: "Para quien tuvo el valor de escuchar".</p>',
        'ENDING',
        2,
        false,
        true,
        90,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "updatedAt" = NOW();

    -- NODO: Continuar caminando
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", position, "isStart", "isEnding", "wordCount", "createdAt", "updatedAt"
    ) VALUES (
        v_node_continue,
        v_story_id,
        'El Otro Lado',
        '<p>Ignoras el sonido y continúas caminando. El bosque se vuelve más espeso, pero eventualmente llegas al otro lado.</p>
        <p>Frente a ti se extiende un <strong>valle hermoso</strong> bañado por la luz del atardecer. Pueblos pintorescos salpican las colinas, y un río cristalino serpentea a través del paisaje.</p>
        <p>Cruzaste el bosque de manera segura. Aunque te preguntas qué habría pasado si hubieras investigado aquel sonido...</p>',
        'ENDING',
        2,
        false,
        true,
        70,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "updatedAt" = NOW();

    -- NODO: Buscar posada
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", position, "isStart", "isEnding", "wordCount", "createdAt", "updatedAt"
    ) VALUES (
        v_node_inn,
        v_story_id,
        'La Posada del Viajero',
        '<p>Entras a la posada "El Viajero Cansado". El lugar está lleno de gente interesante: comerciantes, aventureros y narradores de historias.</p>
        <p>Mientras cenas, un anciano se acerca a tu mesa. <em>"Veo que evitaste el bosque"</em>, dice con una sonrisa misteriosa. <em>"Hiciste bien. Pero el bosque guarda secretos para quienes tienen valor"</em>.</p>
        <p>Pasas la noche cómodamente, soñando con las aventuras que te esperan mañana.</p>',
        'ENDING',
        2,
        false,
        true,
        85,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "updatedAt" = NOW();

    -- NODO: Seguir de noche
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", position, "isStart", "isEnding", "wordCount", "createdAt", "updatedAt"
    ) VALUES (
        v_node_night,
        v_story_id,
        'Bajo las Estrellas',
        '<p>Decides continuar bajo el manto estrellado. La noche es fresca pero agradable, y las estrellas brillan con una intensidad que nunca habías visto.</p>
        <p>Caminas durante horas hasta que encuentras un <strong>círculo de piedras antiguas</strong>. El lugar emana una energía extraña pero reconfortante.</p>
        <p>Decides descansar allí. Cuando despiertas al amanecer, te sientes renovado, como si hubieras dormido durante días. Y junto a ti, hay una <em>brújula dorada</em> que no estaba antes...</p>',
        'ENDING',
        2,
        false,
        true,
        95,
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "updatedAt" = NOW();

    -- ============================================
    -- CREAR LAS CONEXIONES (CHOICES)
    -- ============================================

    -- Del inicio: Entrar al bosque
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES (
        'choice-start-forest',
        v_node_start,
        v_node_forest,
        'Entrar al bosque misterioso',
        '🌲',
        0,
        0,
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Del inicio: Rodear el bosque
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES (
        'choice-start-around',
        v_node_start,
        v_node_around,
        'Tomar el camino que rodea el bosque',
        '🚶',
        1,
        0,
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Del bosque: Investigar sonido
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES (
        'choice-forest-sound',
        v_node_forest,
        v_node_sound,
        'Investigar el sonido misterioso',
        '🔍',
        0,
        0,
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Del bosque: Continuar
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES (
        'choice-forest-continue',
        v_node_forest,
        v_node_continue,
        'Ignorar el sonido y seguir caminando',
        '👣',
        1,
        0,
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Del pueblo: Buscar posada
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES (
        'choice-around-inn',
        v_node_around,
        v_node_inn,
        'Buscar una posada para descansar',
        '🏨',
        0,
        0,
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Del pueblo: Seguir de noche
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES (
        'choice-around-night',
        v_node_around,
        v_node_night,
        'Continuar el viaje bajo las estrellas',
        '🌙',
        1,
        0,
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Historia interactiva creada exitosamente!';
    RAISE NOTICE 'Story ID: %', v_story_id;
    RAISE NOTICE 'Para leerla, ve a: /read/%', v_story_id;

END $$;

-- ============================================
-- VERIFICAR LA CREACIÓN
-- ============================================
SELECT 
    s.id as story_id,
    s.title,
    s."isInteractive",
    COUNT(DISTINCT sn.id) as total_nodes,
    COUNT(DISTINCT c.id) as total_choices
FROM "Story" s
LEFT JOIN "StoryNode" sn ON s.id = sn."storyId"
LEFT JOIN "Choice" c ON sn.id = c."fromNodeId"
WHERE s.id = 'demo-interactive-story-001'
GROUP BY s.id, s.title, s."isInteractive";
