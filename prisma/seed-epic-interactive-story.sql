-- ============================================
-- SEED: Historia Interactiva Épica
-- "La Corona de las Sombras"
-- ~2500 palabras, 15 nodos, múltiples finales
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Primero ejecuta la migración de base de datos (npx prisma db push)
-- 2. Ejecuta este script: psql -d worldinink -f prisma/seed-epic-interactive-story.sql
-- ============================================

DO $$
DECLARE
    v_user_id TEXT;
    v_story_id TEXT := 'epic-interactive-story-001';
    -- Nodos principales
    v_node_start TEXT := 'epic-node-start';
    v_node_throne TEXT := 'epic-node-throne';
    v_node_escape TEXT := 'epic-node-escape';
    v_node_confront TEXT := 'epic-node-confront';
    v_node_sewers TEXT := 'epic-node-sewers';
    v_node_ally TEXT := 'epic-node-ally';
    v_node_alone TEXT := 'epic-node-alone';
    v_node_magic TEXT := 'epic-node-magic';
    v_node_sword TEXT := 'epic-node-sword';
    v_node_negotiate TEXT := 'epic-node-negotiate';
    v_node_resistance TEXT := 'epic-node-resistance';
    v_node_ritual TEXT := 'epic-node-ritual';
    -- Finales
    v_ending_hero TEXT := 'epic-ending-hero';
    v_ending_darkness TEXT := 'epic-ending-darkness';
    v_ending_sacrifice TEXT := 'epic-ending-sacrifice';
    v_ending_exile TEXT := 'epic-ending-exile';
    v_ending_betrayal TEXT := 'epic-ending-betrayal';
BEGIN
    -- Obtener el primer usuario
    SELECT id INTO v_user_id FROM "User" LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No hay usuarios en la base de datos. Crea un usuario primero.';
    END IF;

    -- ============================================
    -- CREAR LA HISTORIA
    -- ============================================
    INSERT INTO "Story" (
        id, title, content, "wordCount", published, views, likes, 
        "createdAt", "updatedAt", "authorId", "isInteractive", "coverImageUrl"
    ) VALUES (
        v_story_id,
        'La Corona de las Sombras',
        '<p>Una épica historia interactiva de fantasía donde cada decisión determina el destino del reino...</p>',
        2500,
        true,
        0,
        0,
        NOW(),
        NOW(),
        v_user_id,
        true,
        NULL
    ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        "updatedAt" = NOW();

    -- ============================================
    -- NODO 1: INICIO - El Despertar
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_node_start,
        v_story_id,
        'El Despertar',
        '<p>Los primeros rayos del amanecer se filtran por las grietas de tu celda cuando el sonido de pasos apresurados te despierta. Has pasado tres meses encerrado en las mazmorras del Castillo de Umbra, acusado injustamente de traición al reino.</p>

<p>Eras el Capitán de la Guardia Real, el protector más fiel del Rey Aldric. Pero todo cambió la noche en que la <strong>Corona de las Sombras</strong> fue robada del tesoro real. Alguien plantó evidencias en tus aposentos, y antes de que pudieras defenderte, ya estabas encadenado.</p>

<p>Ahora escuchas gritos en los pasillos. El castillo está bajo ataque.</p>

<p>—¡El Rey ha caído! —grita alguien a lo lejos— ¡Lord Malachar ha tomado el trono!</p>

<p>Tu corazón se detiene. Malachar, el consejero real, el hombre que siempre sospechaste estaba detrás de tu encarcelamiento. Ahora todo tiene sentido: él robó la Corona de las Sombras, te inculpó, y esperó el momento perfecto para dar el golpe.</p>

<p>Un estruendo sacude las paredes. Tu celda tiembla y una grieta se abre en el muro de piedra, lo suficientemente grande para escapar. Al mismo tiempo, escuchas los cerrojos de tu puerta ceder bajo el caos.</p>

<p>Tienes dos caminos ante ti:</p>',
        'CONTENT',
        true,
        false,
        280,
        1,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- NODO 2: Hacia el Trono
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_node_throne,
        v_story_id,
        'Hacia el Trono',
        '<p>Decides enfrentar tu destino de frente. Si Malachar ha tomado el poder, debes detenerlo antes de que sea demasiado tarde. Conoces cada pasillo de este castillo como la palma de tu mano.</p>

<p>Te mueves entre las sombras, evitando a los soldados que ahora visten el emblema negro de Malachar: una serpiente enrollada en una corona. Los gritos de batalla resuenan por todas partes. La resistencia del antiguo régimen está siendo aplastada.</p>

<p>Al llegar al pasillo principal, te encuentras con una escena desgarradora. El cuerpo del Rey Aldric yace junto al trono, su corona —la corona legítima, no la de las Sombras— manchada de sangre a su lado.</p>

<p>Malachar está de pie ante el Trono de Hierro, la <strong>Corona de las Sombras</strong> brillando con una luz antinatural sobre su cabeza. Sus ojos se encuentran con los tuyos.</p>

<p>—¡Vaya, vaya! El traidor ha escapado de su jaula —dice con una sonrisa cruel—. Pensé que morirías de hambre ahí abajo. Qué persistente eres, Capitán.</p>

<p>Los guardias te rodean, pero Malachar levanta una mano.</p>

<p>—Esperen. Quiero escuchar sus últimas palabras antes de ejecutarlo.</p>

<p>Notas algo: la Corona de las Sombras parece... inestable. Pequeñas grietas de luz oscura emanan de ella. Malachar no sabe controlar su poder completamente.</p>

<p>¿Qué haces?</p>',
        'DECISION',
        false,
        false,
        290,
        2,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- NODO 3: La Huida
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_node_escape,
        v_story_id,
        'La Huida',
        '<p>La prudencia siempre fue una de tus virtudes. Enfrentar a Malachar ahora, desarmado y débil tras meses de cautiverio, sería suicidio. Necesitas aliados, armas, un plan.</p>

<p>Te deslizas por la grieta en el muro y emerges en los jardines traseros del castillo. La noche todavía cubre parte del cielo, dándote la cobertura que necesitas.</p>

<p>A lo lejos, ves las luces de la ciudad de Luminara. Miles de personas que no saben que su rey está muerto y un tirano ha tomado el poder. Pronto lo sabrán, y el caos se extenderá.</p>

<p>Conoces dos rutas de escape:</p>

<p>Las <strong>alcantarillas antiguas</strong> bajo el castillo llevan directamente al barrio de los artesanos. Es un camino oscuro y peligroso, lleno de criaturas que han hecho de esos túneles su hogar. Pero también es el camino más rápido y discreto.</p>

<p>Por otro lado, podrías dirigirte al <strong>Bosque de los Susurros</strong> que bordea el castillo. Los rumores dicen que una orden secreta de magos se oculta en sus profundidades, esperando el momento adecuado para actuar contra las fuerzas oscuras. Si los encuentras, podrían ser aliados poderosos.</p>

<p>El tiempo apremia. ¿Qué camino eliges?</p>',
        'DECISION',
        false,
        false,
        270,
        3,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- NODO 4: Confrontación con Magia
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_node_confront,
        v_story_id,
        'Confrontación Mágica',
        '<p>Notas que la Corona de las Sombras está inestable en la cabeza de Malachar. El poder oscuro que contiene es antiguo, anterior al reino mismo, y claramente él no ha aprendido a controlarlo por completo.</p>

<p>—La Corona te destruirá —dices, dando un paso adelante—. No tienes idea del poder con el que juegas, Malachar. Es magia de la Era Primigenia.</p>

<p>El usurpador ríe, pero ves un destello de duda en sus ojos.</p>

<p>—¿Y tú sí lo sabes, Capitán? No eras más que un soldado glorificado.</p>

<p>—Mi abuela era una Guardiana del Velo —revelas, un secreto que nunca habías compartido—. Me enseñó sobre los artefactos prohibidos antes de morir. La Corona de las Sombras fue creada para contener la esencia de un dios caído. Si no la controlas, ella te controlará a ti.</p>

<p>Las grietas en la Corona brillan con más intensidad. Malachar lleva una mano a su cabeza, su rostro contorsionándose de dolor.</p>

<p>—¡Mientes! —grita, pero su voz tiembla.</p>

<p>Este es tu momento. Puedes intentar usar las palabras de poder que tu abuela te enseñó para desestabilizar la Corona y destruirla... pero el ritual podría matarte también.</p>

<p>O podrías aprovechar su distracción para arrebatarle la espada a uno de los guardias y atacar directamente.</p>',
        'DECISION',
        false,
        false,
        280,
        4,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- NODO 5: Las Alcantarillas
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_node_sewers,
        v_story_id,
        'Las Alcantarillas',
        '<p>El olor a podredumbre te golpea como un muro cuando desciendes por la antigua escalera de piedra. Las alcantarillas de Umbra tienen siglos de antigüedad, construidas por una civilización que existió mucho antes del reino actual.</p>

<p>Tu única luz proviene de los hongos fosforescentes que crecen en las paredes húmedas. El agua negra fluye junto a ti, arrastrando secretos y horrores que preferirías no conocer.</p>

<p>Después de lo que parece una eternidad navegando los túneles, escuchas voces adelante. Te acercas con cautela y descubres a un grupo de personas acurrucadas en una cámara lateral: refugiados del castillo, sirvientes y guardias leales que escaparon del golpe.</p>

<p>Entre ellos reconoces a <strong>Lady Seraphina</strong>, la hija menor del Rey. Sus ojos se abren con sorpresa al verte.</p>

<p>—¡Capitán! Pensamos que estabas muerto —susurra—. Mi padre... ¿es cierto lo que dicen?</p>

<p>Asientes con pesar. Ves el dolor cruzar su rostro joven, pero también algo más: determinación.</p>

<p>—Soy la heredera legítima al trono —dice, irguiéndose—. Malachar debe pagar por sus crímenes. ¿Me ayudarás a recuperar lo que es mío?</p>

<p>Tienes una decisión importante:</p>',
        'DECISION',
        false,
        false,
        260,
        5,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- NODO 6: Unirse a Lady Seraphina
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_node_ally,
        v_story_id,
        'La Alianza',
        '<p>—Mi espada es suya, Alteza —dices, arrodillándote ante Lady Seraphina—. Juré proteger a la familia real, y eso incluye a usted.</p>

<p>Seraphina te mira con gratitud y algo más... respeto. No muchos arriesgarían su vida por una causa que parece perdida.</p>

<p>—Gracias, Capitán. Juntos, encontraremos la manera de derrocar a ese monstruo.</p>

<p>Los siguientes días son un torbellino de actividad. Establecen una red de espías en la ciudad, contactan a nobles descontentos, y reclutan a soldados leales que se esconden en las sombras.</p>

<p>Descubres que Malachar planea un ritual en la próxima luna llena. Usará el poder completo de la Corona de las Sombras para invocar al dios caído cuya esencia contiene. Si tiene éxito, no solo el reino caerá... el mundo entero estará en peligro.</p>

<p>Lady Seraphina te convoca a una reunión urgente.</p>

<p>—Tenemos dos opciones —explica, señalando un mapa del castillo—. Podemos atacar directamente durante el ritual, cuando Malachar estará vulnerable pero rodeado de sus fuerzas. O podemos intentar infiltrarnos antes y sabotear los preparativos.</p>

<p>—Hay una tercera opción —interviene uno de los espías—. He escuchado rumores de que algunos de los nobles que apoyan a Malachar lo hacen por miedo, no por lealtad. Podríamos intentar negociar, ofrecerles amnistía a cambio de abandonar al usurpador.</p>',
        'DECISION',
        false,
        false,
        290,
        6,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- NODO 7: Ir Solo
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_node_alone,
        v_story_id,
        'El Lobo Solitario',
        '<p>—Lo siento, Alteza, pero debo hacer esto solo —respondes—. Si me capturan con usted, será el fin de la línea real. Es mejor que permanezca oculta mientras yo actúo desde las sombras.</p>

<p>Lady Seraphina parece dolida, pero asiente.</p>

<p>—Entiendo. ¿Cuál es tu plan?</p>

<p>—Conozco los secretos de este castillo mejor que nadie. Hay pasajes que ni siquiera Malachar conoce. Me infiltraré, encontraré sus debilidades, y atacaré cuando menos lo espere.</p>

<p>Durante las siguientes semanas, te conviertes en un fantasma. Duermes en los rincones olvidados del castillo, robas comida de las cocinas, y observas. Aprendes los patrones de los guardias, descubres los planes de Malachar, y esperas tu momento.</p>

<p>Una noche, mientras espiabas una reunión secreta, descubres algo perturbador: Malachar no actúa solo. Hay una figura encapuchada que lo visita regularmente, alguien que parece darle órdenes. La Corona de las Sombras no fue robada por ambición... fue un plan de una organización mucho más grande.</p>

<p>Tienes una decisión que tomar: ¿Sigues a la figura misteriosa para descubrir la verdad? ¿O actúas ahora contra Malachar antes de que sea demasiado tarde?</p>',
        'DECISION',
        false,
        false,
        265,
        7,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- NODO 8: Usar la Magia
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_node_magic,
        v_story_id,
        'El Ritual de Destrucción',
        '<p>Cierras los ojos y buscas en lo más profundo de tu memoria. Las palabras de tu abuela, susurradas en noches de tormenta cuando eras niño, regresan a ti como un río desbordado.</p>

<p><em>"Cuando la oscuridad tome forma de corona, solo la luz del sacrificio puede quebrarla."</em></p>

<p>Comienzas a recitar las palabras de poder en el idioma antiguo. Tu voz resuena por la sala del trono con una fuerza que no sabías que poseías.</p>

<p>Malachar grita de dolor. La Corona de las Sombras brilla con una intensidad cegadora, las grietas expandiéndose como rayos en un cielo tormentoso.</p>

<p>—¡Deténganlo! —ordena el usurpador, pero sus guardias están paralizados por el terror.</p>

<p>Sientes el poder fluyendo a través de ti, quemándote por dentro. Esto te matará, lo sabes. Pero si puede destruir la Corona y salvar el reino...</p>

<p>Una lágrima cae por tu mejilla mientras pronuncias las últimas palabras del ritual.</p>

<p>La Corona de las Sombras estalla en un millón de fragmentos de luz oscura. Malachar cae al suelo, su cuerpo consumido por la energía que intentaba controlar.</p>

<p>Y tú...</p>',
        'CONTENT',
        false,
        false,
        245,
        8,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- NODO 9: Usar la Espada
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_node_sword,
        v_story_id,
        'La Espada de la Justicia',
        '<p>No hay tiempo para rituales ni magia antigua. Actúas por instinto, como el soldado que siempre has sido.</p>

<p>En un movimiento fluido, desarmas al guardia más cercano y tomas su espada. Los años de entrenamiento regresan a tu cuerpo como si nunca hubieras estado encadenado.</p>

<p>—¡Malachar! —gritas mientras te abres paso entre los guardias— ¡Tu reinado termina esta noche!</p>

<p>El usurpador intenta usar el poder de la Corona contra ti, pero su control es imperfecto. Los rayos de energía oscura pasan cerca de ti sin alcanzarte, destruyendo pilares y tapices a tu alrededor.</p>

<p>Finalmente, lo tienes frente a ti. Espada contra magia. Voluntad contra poder robado.</p>

<p>—Eres un tonto —dice Malachar, su voz distorsionada por el poder que fluye a través de él—. La Corona me hace invencible.</p>

<p>—Ningún artefacto puede reemplazar el coraje —respondes—. Y tú nunca lo has tenido.</p>

<p>Tu espada encuentra su objetivo. Malachar cae, pero la Corona de las Sombras... la Corona sigue brillando sobre su cabeza caída, pulsando con vida propia.</p>

<p>Alguien tiene que ponérsela para controlar su poder. O destruirla de alguna manera. ¿Qué haces?</p>',
        'DECISION',
        false,
        false,
        270,
        9,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- NODO 10: Negociación
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_node_negotiate,
        v_story_id,
        'El Arte de la Diplomacia',
        '<p>La guerra abierta causaría demasiadas muertes inocentes. Decides intentar el camino de la diplomacia.</p>

<p>A través de intermediarios cuidadosamente seleccionados, comienzas a enviar mensajes a los nobles que apoyan a Malachar. Les ofreces amnistía total, la garantía de mantener sus tierras y títulos, a cambio de abandonar al usurpador cuando llegue el momento.</p>

<p>Las respuestas llegan lentamente, pero son prometedoras. El Duque de Valoria, el Conde de las Mareas, la Baronesa del Norte... todos expresan su disposición a negociar.</p>

<p>Sin embargo, uno de tus mensajeros es capturado. Malachar ahora sabe que hay una conspiración en su contra. Sus represalias son brutales: arrestos masivos, ejecuciones públicas, toque de queda permanente.</p>

<p>Lady Seraphina te confronta, sus ojos llenos de frustración.</p>

<p>—¡Nos has puesto en peligro a todos! Ahora Malachar sabe que estamos aquí.</p>

<p>—Pero también está asustado —respondes—. Un tirano asustado comete errores.</p>

<p>Tienes razón. En su paranoia, Malachar ha alienado a sus propios aliados. Los nobles que dudaban ahora están listos para actuar. Pero el tiempo se acaba: el ritual de la luna llena es en tres días.</p>',
        'CONTENT',
        false,
        false,
        260,
        10,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- NODO 11: La Resistencia
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_node_resistance,
        v_story_id,
        'El Alzamiento',
        '<p>La noche del ritual, las fuerzas de la resistencia atacan desde múltiples frentes. Los nobles convertidos abren las puertas de sus territorios, los soldados leales emergen de sus escondites, y el pueblo de Luminara, cansado de la tiranía, se alza en las calles.</p>

<p>Lideras el asalto principal al castillo, con Lady Seraphina a tu lado. Ya no es la princesa asustada que encontraste en las alcantarillas... es una reina guerrera.</p>

<p>—¡Por mi padre! —grita mientras cruzan las puertas del castillo— ¡Por el reino!</p>

<p>La batalla es feroz. Los guardias de Malachar pelean con la desesperación de los condenados, pero la marea está en su contra. Cuando finalmente llegan a la sala del trono, encuentran a Malachar en medio de su ritual.</p>

<p>La Corona de las Sombras brilla con una luz cegadora. El aire está cargado de energía oscura. Y frente a Malachar, un portal comienza a abrirse... un portal al reino de los dioses caídos.</p>

<p>—¡Es demasiado tarde! —grita Malachar, su voz mezclada con algo antiguo y terrible— ¡El Señor de las Sombras viene!</p>

<p>Solo hay una manera de detener esto...</p>',
        'CONTENT',
        false,
        false,
        255,
        11,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- NODO 12: El Ritual Final
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_node_ritual,
        v_story_id,
        'El Sacrificio',
        '<p>Comprendes lo que debes hacer. La Corona de las Sombras necesita un portador con voluntad de hierro para ser controlada... o destruida.</p>

<p>—Lady Seraphina —dices, tomando su mano—. Ha sido un honor servirla. Será una gran reina.</p>

<p>Sus ojos se abren con horror cuando comprende tu intención.</p>

<p>—¡No! ¡Capitán, tiene que haber otra manera!</p>

<p>Pero no la hay. Te lanzas hacia Malachar, arrebatándole la Corona de las Sombras de su cabeza en un movimiento suicida. El usurpador cae, su conexión con el artefacto cortada.</p>

<p>La Corona arde en tus manos como mil soles. El dolor es indescriptible, pero tu voluntad es más fuerte. Concentras toda tu fuerza en un solo pensamiento: <em>cerrar el portal</em>.</p>

<p>La energía oscura fluye a través de ti, pero en lugar de consumirte, la diriges de vuelta al portal. El Señor de las Sombras ruge de furia mientras su camino al mundo mortal se cierra.</p>

<p>La Corona se fragmenta, su poder dispersándose en el éter.</p>

<p>Y tú caes...</p>',
        'CONTENT',
        false,
        false,
        235,
        12,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- FINAL 1: El Héroe
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_ending_hero,
        v_story_id,
        'Final: El Héroe del Reino',
        '<p>Despiertas en una cama suave, con el sol entrando por una ventana de vitrales. Por un momento, piensas que todo fue un sueño.</p>

<p>Pero entonces ves la cicatriz en tu mano, la marca dejada por la Corona de las Sombras, y sabes que fue real.</p>

<p>Lady Seraphina entra en la habitación, ahora vistiendo los ropajes de una reina. Una corona dorada —la corona legítima de su padre— brilla sobre su cabeza.</p>

<p>—Finalmente despiertas —dice con una sonrisa que ilumina la habitación—. Llevas durmiendo tres semanas. Los sanadores no estaban seguros de si sobrevivirías.</p>

<p>Te incorporas lentamente. Tu cuerpo está débil, pero tu espíritu... tu espíritu se siente más fuerte que nunca.</p>

<p>—¿Y Malachar?</p>

<p>—Ejecutado por traición. El reino está en paz. —Se sienta a tu lado y toma tu mano—. Te debo mi corona, mi reino... mi vida. Y te ofrezco todo lo que puedo dar: un lugar a mi lado. No como Capitán de la Guardia... sino como mi esposo y Rey Consorte.</p>

<p>Tu corazón se detiene. Nunca imaginaste...</p>

<p>—Acepto —susurras.</p>

<p>Y así, el prisionero falsamente acusado se convierte en el héroe del reino, y eventualmente, en su rey. Las canciones de tu valentía se cantarán por generaciones.</p>

<h2>FIN - El Héroe del Reino</h2>',
        'ENDING',
        false,
        true,
        290,
        13,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- FINAL 2: La Oscuridad
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_ending_darkness,
        v_story_id,
        'Final: El Señor de las Sombras',
        '<p>Te colocas la Corona de las Sombras sobre la cabeza.</p>

<p>El poder que fluye a través de ti es... embriagador. Puedes sentir cada sombra en el reino, cada miedo, cada secreto oscuro. La tentación de usarlo es abrumadora.</p>

<p>—Capitán... tus ojos... —Lady Seraphina retrocede, su rostro pálido de terror.</p>

<p>Te miras en el reflejo de una armadura cercana. Tus ojos, antes de un cálido marrón, ahora brillan con una luz púrpura antinatural.</p>

<p>La voz del dios caído susurra en tu mente: <em>"Tanto poder desperdiciado en manos de tontos. Pero tú... tú tienes la voluntad para usarlo correctamente."</em></p>

<p>Malachar gime en el suelo, patético y derrotado. Podrías matarlo con un pensamiento. Podrías tomar el trono. Podrías...</p>

<p>La resistencia se congela a tu alrededor, esperando ver qué harás.</p>

<p>Sonríes, y tu sonrisa ya no es completamente humana.</p>

<p>—El reino necesita un gobernante fuerte —dices, tu voz resonando con poder antiguo—. Yo seré ese gobernante.</p>

<p>Lady Seraphina cae de rodillas, lágrimas corriendo por sus mejillas, mientras la oscuridad te envuelve como un manto real.</p>

<h2>FIN - El Señor de las Sombras</h2>',
        'ENDING',
        false,
        true,
        265,
        14,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- FINAL 3: El Sacrificio
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_ending_sacrifice,
        v_story_id,
        'Final: El Último Guardián',
        '<p>Caes, pero no hacia la muerte. Caes hacia algo más.</p>

<p>Tu conciencia se expande mientras tu cuerpo colapsa. Puedes ver el reino entero: cada aldea, cada bosque, cada vida que has salvado con tu sacrificio.</p>

<p>El portal se cierra definitivamente, llevándose los fragmentos de la Corona de las Sombras con él. El Señor de las Sombras no volverá a amenazar este mundo... gracias a ti.</p>

<p>Lady Seraphina sostiene tu cuerpo, llorando.</p>

<p>—No te vayas —suplica—. Por favor...</p>

<p>Pero no puedes quedarte. El precio del poder que usaste fue tu vida mortal. Sin embargo, mientras tu cuerpo se desvanece en luz dorada, una paz infinita te envuelve.</p>

<p>—Seré... el guardián —susurras con tu último aliento—. Siempre... protegiendo...</p>

<p>Y así es como el Capitán de la Guardia se convierte en algo más que un hombre. En los años venideros, cuando la oscuridad amenace el reino, la gente jurará ver una figura brillante luchando a su lado: el Guardián Eterno, el espíritu del héroe que dio todo por salvar a los que amaba.</p>

<p>Tu nombre se graba en el corazón del reino para siempre.</p>

<h2>FIN - El Último Guardián</h2>',
        'ENDING',
        false,
        true,
        260,
        15,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- FINAL 4: El Exilio
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_ending_exile,
        v_story_id,
        'Final: El Camino Solitario',
        '<p>Decides no involucrarte más en los asuntos del reino. Has visto demasiado, sufrido demasiado. Que otros luchen por el trono; tú solo quieres paz.</p>

<p>Abandonas Luminara bajo el manto de la noche, dejando atrás tu antigua vida. Viajas hacia el este, donde las montañas tocan el cielo y pocos se aventuran.</p>

<p>Los años pasan. Te construyes una cabaña en las faldas de la Montaña del Silencio. Cultivas tu huerto, cazas para sobrevivir, y lentamente, el dolor del pasado comienza a sanar.</p>

<p>Ocasionalmente, viajeros llegan con noticias del mundo exterior. Escuchas que Lady Seraphina finalmente derrotó a Malachar, que se convirtió en una reina justa y amada. Una parte de ti se alegra por ella.</p>

<p>Una tarde de otoño, una caravana de refugiados pasa por tu territorio. Entre ellos hay niños con ojos grandes y asustados, ancianos cansados del camino, familias rotas por alguna nueva guerra.</p>

<p>Les ofreces refugio por la noche. Mientras los niños duermen junto al fuego, te das cuenta de que no puedes escapar de quien eres. Siempre serás un protector.</p>

<p>Al día siguiente, guías a los refugiados a través del paso de montaña, el primero de muchos que salvarás en los años venideros.</p>

<h2>FIN - El Camino Solitario</h2>',
        'ENDING',
        false,
        true,
        280,
        16,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- FINAL 5: La Traición
    -- ============================================
    INSERT INTO "StoryNode" (
        id, "storyId", title, content, "nodeType", "isStart", "isEnding", "wordCount", position, "createdAt", "updatedAt"
    ) VALUES (
        v_ending_betrayal,
        v_story_id,
        'Final: El Precio de la Ambición',
        '<p>En lo más profundo de tu investigación solitaria, descubres la verdad: la figura encapuchada que controla a Malachar es nada menos que el Gran Maestre de la Orden Arcana, la organización mágica más respetada del reino.</p>

<p>Armado con este conocimiento, te presentas ante ellos con una propuesta.</p>

<p>—Sé lo que planean —dices al consejo de magos—. Usan a Malachar como marioneta para tomar el control del reino. Puedo ayudarlos... por un precio.</p>

<p>El Gran Maestre te estudia con ojos fríos como el hielo.</p>

<p>—¿Y qué precio sería ese?</p>

<p>—Poder. El mismo poder que le dieron a Malachar. Y cuando termine, el trono.</p>

<p>La negociación es larga y peligrosa, pero finalmente llegan a un acuerdo. Traicionas a Lady Seraphina, guiando a los magos a su escondite. La princesa es capturada, su resistencia destruida.</p>

<p>Malachar es eliminado, un peón que ya no servía. Y tú... tú te sientas en el Trono de Hierro, la Corona de las Sombras brillando sobre tu cabeza mientras los magos te observan desde las sombras.</p>

<p>Has ganado, pero el precio fue tu alma. Y en las noches, cuando cierras los ojos, ves el rostro de Seraphina mirándote con decepción infinita.</p>

<h2>FIN - El Precio de la Ambición</h2>',
        'ENDING',
        false,
        true,
        275,
        17,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        "updatedAt" = NOW();

    -- ============================================
    -- CREAR LAS DECISIONES (CHOICES)
    -- ============================================

    -- Desde INICIO
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES 
        ('epic-choice-1', v_node_start, v_node_throne, 'Ir hacia el trono y enfrentar a Malachar', '⚔️', 1, 0, NOW()),
        ('epic-choice-2', v_node_start, v_node_escape, 'Escapar por la grieta y buscar aliados', '🏃', 2, 0, NOW())
    ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;

    -- Desde TRONO
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES 
        ('epic-choice-3', v_node_throne, v_node_confront, 'Usar tu conocimiento sobre la Corona para desestabilizarla', '✨', 1, 0, NOW()),
        ('epic-choice-4', v_node_throne, v_node_escape, 'Huir mientras Malachar está distraído', '🚪', 2, 0, NOW())
    ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;

    -- Desde ESCAPE
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES 
        ('epic-choice-5', v_node_escape, v_node_sewers, 'Bajar a las alcantarillas antiguas', '🌑', 1, 0, NOW()),
        ('epic-choice-6', v_node_escape, v_ending_exile, 'Huir al Bosque de los Susurros y no volver', '🌲', 2, 0, NOW())
    ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;

    -- Desde CONFRONTACIÓN
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES 
        ('epic-choice-7', v_node_confront, v_node_magic, 'Recitar el ritual de destrucción', '🔮', 1, 0, NOW()),
        ('epic-choice-8', v_node_confront, v_node_sword, 'Arrebatar una espada y atacar', '🗡️', 2, 0, NOW())
    ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;

    -- Desde ALCANTARILLAS
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES 
        ('epic-choice-9', v_node_sewers, v_node_ally, 'Unirse a Lady Seraphina y la resistencia', '👑', 1, 0, NOW()),
        ('epic-choice-10', v_node_sewers, v_node_alone, 'Actuar solo desde las sombras', '🐺', 2, 0, NOW())
    ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;

    -- Desde ALIANZA
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES 
        ('epic-choice-11', v_node_ally, v_node_resistance, 'Atacar durante el ritual', '⚔️', 1, 0, NOW()),
        ('epic-choice-12', v_node_ally, v_node_negotiate, 'Intentar negociar con los nobles', '🤝', 2, 0, NOW())
    ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;

    -- Desde IR SOLO
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES 
        ('epic-choice-13', v_node_alone, v_ending_betrayal, 'Seguir a la figura misteriosa y descubrir la conspiración', '🕵️', 1, 0, NOW()),
        ('epic-choice-14', v_node_alone, v_node_sword, 'Actuar ahora contra Malachar', '⚡', 2, 0, NOW())
    ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;

    -- Desde MAGIA -> Final Sacrificio
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES 
        ('epic-choice-15', v_node_magic, v_ending_sacrifice, 'Completar el ritual aunque te cueste la vida', '💫', 1, 0, NOW())
    ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;

    -- Desde ESPADA
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES 
        ('epic-choice-16', v_node_sword, v_ending_hero, 'Destruir la Corona y rechazar su poder', '✨', 1, 0, NOW()),
        ('epic-choice-17', v_node_sword, v_ending_darkness, 'Ponerte la Corona y tomar su poder', '👑', 2, 0, NOW())
    ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;

    -- Desde NEGOCIACIÓN -> Resistencia
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES 
        ('epic-choice-18', v_node_negotiate, v_node_resistance, 'Liderar el alzamiento final', '🏰', 1, 0, NOW())
    ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;

    -- Desde RESISTENCIA -> Ritual
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES 
        ('epic-choice-19', v_node_resistance, v_node_ritual, 'Sacrificarte para cerrar el portal', '💀', 1, 0, NOW()),
        ('epic-choice-20', v_node_resistance, v_ending_darkness, 'Tomar la Corona para ti', '😈', 2, 0, NOW())
    ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;

    -- Desde RITUAL -> Final Guardián
    INSERT INTO "Choice" (id, "fromNodeId", "toNodeId", text, emoji, position, "timesChosen", "createdAt")
    VALUES 
        ('epic-choice-21', v_node_ritual, v_ending_sacrifice, 'Aceptar tu destino como el Último Guardián', '🌟', 1, 0, NOW())
    ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;

    RAISE NOTICE '✅ Historia épica "La Corona de las Sombras" creada exitosamente';
    RAISE NOTICE '📊 17 nodos, 21 decisiones, 5 finales diferentes';
    RAISE NOTICE '📖 ~2500 palabras de contenido narrativo';

END $$;
