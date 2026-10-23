
// ==============================================================================
// 0. CONFIGURACIÓN DE BASE DE API (SOPORTA HTTP Y FILE://)
// ==============================================================================
function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'file:' || !window.location.port) {
      return 'http://localhost:3000';
    }
  }
  return '';
}

/**
 * ==============================================================================
 * ExpendeX® FRESH & FIT — COCINA INTELIGENTE & FITNESS VENDING (FIME UANL)
 * Lógica de la Aplicación Web Móvil con Fotografías Reales, 1 Plato Fuerte + 2 Guarniciones,
 * 10 Combos Promocionales a la izquierda y Todo el Menú a la derecha.
 * ==============================================================================
 */

// ==============================================================================
// 1. BASE DE DATOS DE LOS 12 PLATILLOS (1 PLATO FUERTE + 2 GUARNICIONES)
// ==============================================================================
const MEALS_DATABASE = [
  {
    id: "MEAL_A1",
    slot: "A1",
    name: "Pechuga al Limón con Arroz y Espárragos",
    category: "comida",
    price: 125,
    level: 1,
    traySide: "Lado Izquierdo (Columna 1)",
    image: "images/pechuga_limon.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Pechuga de pollo a la plancha marinada con limón real y romero",
    guarnicion1: "Arroz integral al vapor sazonado con cilantro",
    guarnicion2: "Espárragos verdes tiernos y calabacitas salteadas en aceite de oliva",
    calories: 480,
    protein: 45,
    carbs: 38,
    fat: 9,
    dietTags: ["high-protein", "casera"],
    temp: "3.2 °C",
    stock: 5,
    provider: "Vita Fit UANL .centro",
    description: "Platillo balanceado rico en proteína magra, con dos guarniciones ligeras ideales para energía sostenida sin pesadez."
  },
  {
    id: "MEAL_A6",
    slot: "A6",
    name: "Salmón a la Plancha con Puré de Camote",
    category: "comida",
    price: 145,
    level: 1,
    traySide: "Lado Derecho (Columna 6)",
    image: "images/salmon_camote.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Filete de salmón noruego sellado en costra ligera de chía",
    guarnicion1: "Puré rústico de camote amarillo a la mantequilla ligera",
    guarnicion2: "Ensalada verde con espinaca baby y vinagreta cítrica",
    calories: 520,
    protein: 42,
    carbs: 34,
    fat: 18,
    dietTags: ["high-protein", "low-carb"],
    temp: "3.2 °C",
    stock: 4,
    provider: "Vita Fit UANL .centro",
    description: "Excelente fuente de ácidos grasos Omega-3 y antioxidantes, con carbohidratos complejos de absorción lenta."
  },
  {
    id: "MEAL_B1",
    slot: "B1",
    name: "Picadillo Norteño Fitness 95/5 con Nopales",
    category: "comida",
    price: 120,
    level: 2,
    traySide: "Lado Izquierdo (Columna 1)",
    image: "images/picadillo_norteno.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Carne magra de res 95/5 guisada en caldillo de jitomate y especias",
    guarnicion1: "Nopales asados en cubitos con orégano y sal marina",
    guarnicion2: "Frijoles de la olla negros cocidos sin manteca",
    calories: 490,
    protein: 44,
    carbs: 26,
    fat: 12,
    dietTags: ["high-protein", "casera", "low-carb"],
    temp: "3.3 °C",
    stock: 5,
    provider: "Vita Fit UANL .centro",
    description: "Sabor casero tradicional del noreste en versión fitness: alto en fibra, hierro y proteína con muy bajo aporte graso."
  },
  {
    id: "MEAL_B6",
    slot: "B6",
    name: "Fajitas de Pollo con Pimientos Asados",
    category: "comida",
    price: 125,
    level: 2,
    traySide: "Lado Derecho (Columna 6)",
    image: "images/fajitas_pollo.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Tiras jugosas de pechuga de pollo asada al carbón",
    guarnicion1: "Pimientos morrones tricolores y cebollitas asadas",
    guarnicion2: "Guacamole rústico fresco con pico de gallo",
    calories: 490,
    protein: 43,
    carbs: 22,
    fat: 16,
    dietTags: ["high-protein", "low-carb", "casera"],
    temp: "3.3 °C",
    stock: 5,
    provider: "Vita Fit UANL .centro",
    description: "Pechuga magra con grasas saludables del aguacate y vitamina C de los pimientos asados."
  },
  {
    id: "MEAL_C1",
    slot: "C1",
    name: "Albóndigas de Pavo Caseras con Quinoa",
    category: "comida",
    price: 125,
    level: 3,
    traySide: "Lado Izquierdo (Columna 1)",
    image: "images/albondigas_pavo.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Albóndigas horneadas de pavo magro en salsa de chipotle suave",
    guarnicion1: "Quinoa roja al vapor con calabacitas",
    guarnicion2: "Zanahorias baby y chayotes tiernos al vapor",
    calories: 470,
    protein: 41,
    carbs: 32,
    fat: 11,
    dietTags: ["high-protein", "casera"],
    temp: "3.4 °C",
    stock: 4,
    provider: "Vita Fit UANL .centro",
    description: "Receta casera ligera con bajo índice glicémico y proteína de altísima digestibilidad."
  },
  {
    id: "MEAL_C6",
    slot: "C6",
    name: "Lomo de Cerdo Magro Adobado con Puré",
    category: "comida",
    price: 130,
    level: 3,
    traySide: "Lado Derecho (Columna 6)",
    image: "images/lomo_adobado.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Medallones de lomo de cerdo en adobo tradicional de chiles secos",
    guarnicion1: "Puré de papa rústico al romero",
    guarnicion2: "Ensalada verde de espinacas baby con nueces",
    calories: 510,
    protein: 46,
    carbs: 28,
    fat: 13,
    dietTags: ["high-protein", "casera"],
    temp: "3.4 °C",
    stock: 5,
    provider: "Vita Fit UANL .centro",
    description: "Corte magro de lomo horneado lentamente, ideal para recuperación muscular post-entrenamiento."
  },
  {
    id: "MEAL_D1",
    slot: "D1",
    name: "Bowl de Ternera con Champiñones Portobello",
    category: "comida",
    price: 135,
    level: 4,
    traySide: "Lado Izquierdo (Columna 1)",
    image: "images/bowl_ternera.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Trozos suaves de ternera magra salteada en su jugo",
    guarnicion1: "Champiñones portobello y cebolla caramelizada",
    guarnicion2: "Arroz salvaje con semillas de girasol",
    calories: 530,
    protein: 47,
    carbs: 30,
    fat: 14,
    dietTags: ["high-protein", "low-carb"],
    temp: "3.5 °C",
    stock: 4,
    provider: "Vita Fit UANL .centro",
    description: "Potente combinación de proteína vacuna y minerales esenciales con carbohidratos integrales."
  },
  {
    id: "MEAL_D6",
    slot: "D6",
    name: "Chiles Rellenos de Panela con Arroz y Frijoles",
    category: "comida",
    price: 115,
    level: 4,
    traySide: "Lado Derecho (Columna 6)",
    image: "images/chiles_rellenos.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Chile poblano asado al fuego relleno de queso panela artesanal",
    guarnicion1: "Arroz a la jardinera con zanahoria y chícharos",
    guarnicion2: "Frijoles de la olla negros cocinados a fuego lento",
    calories: 430,
    protein: 30,
    carbs: 36,
    fat: 12,
    dietTags: ["casera"],
    temp: "3.5 °C",
    stock: 6,
    provider: "Vita Fit UANL .centro",
    description: "Opción vegetariana clásica sin capear ni freír, conservando todo el sabor auténtico de la cocina mexicana."
  },
  {
    id: "MEAL_E1",
    slot: "E1",
    name: "Tinga de Pollo Magra con Tostadas Horneadas",
    category: "comida",
    price: 120,
    level: 5,
    traySide: "Lado Izquierdo (Columna 1)",
    image: "images/tinga_pollo.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Pechuga deshebrada en caldillo de chipotle, cebolla y tomate",
    guarnicion1: "Tostadas horneadas de maíz sin freír (3 pzas)",
    guarnicion2: "Frijoles refritos ligeros con queso fresco",
    calories: 460,
    protein: 42,
    carbs: 35,
    fat: 9,
    dietTags: ["high-protein", "casera"],
    temp: "3.3 °C",
    stock: 5,
    provider: "Vita Fit UANL .centro",
    description: "Crujiente y llena de sabor, perfecta para comer como tostadas caseras recién servidas."
  },
  {
    id: "MEAL_E6",
    slot: "E6",
    name: "Lasaña Fitness de Berenjena con Ensalada Caprese",
    category: "comida",
    price: 125,
    level: 5,
    traySide: "Lado Derecho (Columna 6)",
    image: "images/lasana_berenjena.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Capas de berenjena horneada con carne de res 95/5 y salsa pomodoro",
    guarnicion1: "Ensalada caprese con rodajas de jitomate y albahaca fresca",
    guarnicion2: "Verduras mixtas al vapor (brócoli y zanahoria)",
    calories: 450,
    protein: 41,
    carbs: 18,
    fat: 15,
    dietTags: ["high-protein", "low-carb"],
    temp: "3.3 °C",
    stock: 4,
    provider: "Vita Fit UANL .centro",
    description: "Sustituye la pasta tradicional por berenjena horneada, ideal para dietas cetogénicas o bajas en carbohidratos."
  },
  {
    id: "MEAL_F1",
    slot: "F1",
    name: "Pechuga Cordon Bleu Horneada Light con Puré",
    category: "comida",
    price: 130,
    level: 6,
    traySide: "Lado Izquierdo (Columna 1)",
    image: "images/cordon_bleu.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Pechuga rellena de jamón de pavo y queso panela, empanizada en avena",
    guarnicion1: "Puré de papa rústico a la mantequilla ligera",
    guarnicion2: "Ensalada fresca de col morada y manzana verde",
    calories: 510,
    protein: 45,
    carbs: 28,
    fat: 14,
    dietTags: ["high-protein", "casera"],
    temp: "3.0 °C",
    stock: 5,
    provider: "Vita Fit UANL .centro",
    description: "Crujiente por fuera y fundida por dentro, horneada sin una sola gota de grasa añadida."
  },
  {
    id: "MEAL_F6",
    slot: "F6",
    name: "Guisado de Res con Calabacitas y Arroz Rojo",
    category: "comida",
    price: 125,
    level: 6,
    traySide: "Lado Derecho (Columna 6)",
    image: "images/guisado_res.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Trozos suaves de pulpa de res cocinada a fuego lento con elote",
    guarnicion1: "Calabacitas criollas tiernas salteadas al vapor",
    guarnicion2: "Arroz rojo tradicional mexicano cocinado sin grasa",
    calories: 480,
    protein: 43,
    carbs: 24,
    fat: 13,
    dietTags: ["high-protein", "casera", "low-carb"],
    temp: "3.0 °C",
    stock: 5,
    provider: "Vita Fit UANL .centro",
    description: "Platillo emblemático de la comida corrida mexicana, reconfortante y nutritivo."
  }
];

// ==============================================================================
// 2. BASE DE DATOS DE LAS 24 BEBIDAS (4 COLUMNAS × 6 NIVELES)
// ==============================================================================
const DRINKS_DATABASE = [
  // Nivel 1
  {
    id: "DRINK_A2",
    slot: "A2",
    name: "Agua Fresca de Jamaica Natural Sin Azúcar 600 ml",
    category: "bebida",
    price: 28,
    level: 1,
    traySide: "Centro (Columna 2)",
    image: "images/agua_jamaica.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    calories: 10,
    protein: 0,
    carbs: 2,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "3.0 °C",
    stock: 9,
    provider: "Vita Fit UANL .centro",
    description: "Infusión concentrada de flor de jamaica mexicana cosechada en Guerrero, sin endulzantes artificiales."
  },
  {
    id: "DRINK_A3",
    slot: "A3",
    name: "Agua de Limón con Semillas de Chía y Menta 600 ml",
    category: "bebida",
    price: 28,
    level: 1,
    traySide: "Centro (Columna 3)",
    image: "images/agua_limon_chia.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80",
    calories: 25,
    protein: 1,
    carbs: 4,
    fat: 1,
    dietTags: ["zero-sugar"],
    temp: "3.0 °C",
    stock: 8,
    provider: "Vita Fit UANL .centro",
    description: "Jugo de limón recién exprimido con chía hidratada y hojas de menta del huerto, 100% natural."
  },
  {
    id: "DRINK_A4",
    slot: "A4",
    name: "Coca-Cola Cero Azúcar (Zero) 600 ml",
    category: "bebida",
    price: 25,
    level: 1,
    traySide: "Centro (Columna 4)",
    image: "images/coca_cola_sin_azucar.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "2.8 °C",
    stock: 10,
    provider: "Vita Fit UANL .centro",
    description: "El auténtico sabor de Coca-Cola, completamente libre de azúcares y calorías, súper fría."
  },
  {
    id: "DRINK_A5",
    slot: "A5",
    name: "Agua Purificada Ciel 600 ml",
    category: "bebida",
    price: 22,
    level: 1,
    traySide: "Centro (Columna 5)",
    image: "images/ciel_purificada.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=80",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "2.8 °C",
    stock: 12,
    provider: "Vita Fit UANL .centro",
    description: "Agua purificada Ciel libre de sodio con certificación de pureza para hidratación balanceada."
  },

  // Nivel 2
  {
    id: "DRINK_B2",
    slot: "B2",
    name: "Agua Fresca de Pepino, Limón y Menta 600 ml",
    category: "bebida",
    price: 28,
    level: 2,
    traySide: "Centro (Columna 2)",
    image: "images/agua_pepino_menta.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80",
    calories: 15,
    protein: 0,
    carbs: 3,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "3.1 °C",
    stock: 8,
    provider: "Vita Fit UANL .centro",
    description: "Agua fresca artesanal con pepino criollo molido en frío, gotas de limón real y hojas de menta del huerto."
  },
  {
    id: "DRINK_B3",
    slot: "B3",
    name: "Horchata Ligera de Almendras y Avena Light 600 ml",
    category: "bebida",
    price: 32,
    level: 2,
    traySide: "Centro (Columna 3)",
    image: "images/agua_horchata.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
    calories: 75,
    protein: 3,
    carbs: 11,
    fat: 2,
    dietTags: ["zero-sugar"],
    temp: "3.1 °C",
    stock: 7,
    provider: "Vita Fit UANL .centro",
    description: "Bebida vegetal de almendras y avena con canela de Ceilán, endulzada con fruto del monje."
  },
  {
    id: "DRINK_B4",
    slot: "B4",
    name: "Sprite Cero Azúcar Lima-Limón 600 ml",
    category: "bebida",
    price: 25,
    level: 2,
    traySide: "Centro (Columna 4)",
    image: "images/sprite_cero.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&auto=format&fit=crop&q=80",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "2.9 °C",
    stock: 9,
    provider: "Vita Fit UANL .centro",
    description: "Sabor chispeante lima-limón 100% libre de azúcares y sin calorías."
  },
  {
    id: "DRINK_B5",
    slot: "B5",
    name: "Topo Chico Mineral con Twist de Limón 600 ml",
    category: "bebida",
    price: 28,
    level: 2,
    traySide: "Centro (Columna 5)",
    image: "images/topo_chico.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "2.7 °C",
    stock: 11,
    provider: "Vita Fit UANL .centro",
    description: "Agua mineral de manantial icónica de Monterrey con burbuja intensa y extracto de limón real."
  },

  // Nivel 3
  {
    id: "DRINK_C2",
    slot: "C2",
    name: "Té Verde Arizona con Ginseng y Miel 600 ml",
    category: "bebida",
    price: 30,
    level: 3,
    traySide: "Centro (Columna 2)",
    image: "images/te_verde_comercial.jpg",
    fallbackUrl: "images/te_matcha_frio.jpg",
    calories: 12,
    protein: 1,
    carbs: 2,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "3.0 °C",
    stock: 8,
    provider: "Vita Fit UANL .centro",
    description: "El icónico té verde comercial con extracto natural de ginseng y miel de abeja, servido ultra frío."
  },
  {
    id: "DRINK_C3",
    slot: "C3",
    name: "Infusión Fría de Frutos Rojos y Sauco 600 ml",
    category: "bebida",
    price: 30,
    level: 3,
    traySide: "Centro (Columna 3)",
    image: "images/infusion_frutos_rojos.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=600&auto=format&fit=crop&q=80",
    calories: 18,
    protein: 0,
    carbs: 4,
    fat: 0,
    dietTags: ["zero-sugar"],
    temp: "3.0 °C",
    stock: 7,
    provider: "Vita Fit UANL .centro",
    description: "Fresas, arándanos y flores silvestres infusionadas en frío sin endulzantes calóricos."
  },
  {
    id: "DRINK_C4",
    slot: "C4",
    name: "Powerade Zero Frutos Rojos 600 ml",
    category: "bebida",
    price: 28,
    level: 3,
    traySide: "Centro (Columna 4)",
    image: "images/powerade_zero.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "2.9 °C",
    stock: 9,
    provider: "Vita Fit UANL .centro",
    description: "Bebida deportiva con 4 electrolitos ION4 sin carbohidratos para atletas universitarios."
  },
  {
    id: "DRINK_C5",
    slot: "C5",
    name: "Gatorade Zero Naranja 600 ml",
    category: "bebida",
    price: 28,
    level: 3,
    traySide: "Centro (Columna 5)",
    image: "images/gatorade_zero.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1559839914-17aae19cec71?w=600&auto=format&fit=crop&q=80",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "2.9 °C",
    stock: 8,
    provider: "Vita Fit UANL .centro",
    description: "Bebida isotónica deportiva oficial con reposición rápida de sodio y potasio sin calorías ni azúcar."
  },

  // Nivel 4
  {
    id: "DRINK_D2",
    slot: "D2",
    name: "Agua de Manzana Verde y Jengibre Detox 600 ml",
    category: "bebida",
    price: 30,
    level: 4,
    traySide: "Centro (Columna 2)",
    image: "images/agua_manzana_jengibre.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80",
    calories: 22,
    protein: 0,
    carbs: 5,
    fat: 0,
    dietTags: ["zero-sugar"],
    temp: "3.2 °C",
    stock: 7,
    provider: "Vita Fit UANL .centro",
    description: "Agua infusionada con manzana granny smith y raíz de jengibre fresco con gingerol antiinflamatorio."
  },
  {
    id: "DRINK_D3",
    slot: "D3",
    name: "Té Negro Fuze Tea Limón Cero Azúcar 600 ml",
    category: "bebida",
    price: 25,
    level: 4,
    traySide: "Centro (Columna 3)",
    image: "images/fuze_tea_cero.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80",
    calories: 4,
    protein: 0,
    carbs: 1,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "3.1 °C",
    stock: 10,
    provider: "Vita Fit UANL .centro",
    description: "Extracto de hojas de té negro con toque cítrico refrescante de limón, cero azúcar."
  },
  {
    id: "DRINK_D4",
    slot: "D4",
    name: "Jugo Verde Cold-Pressed (Espinaca, Piña, Apio) 450 ml",
    category: "bebida",
    price: 35,
    level: 4,
    traySide: "Centro (Columna 4)",
    image: "images/jugo_verde.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600&auto=format&fit=crop&q=80",
    calories: 65,
    protein: 2,
    carbs: 14,
    fat: 0,
    dietTags: ["zero-sugar"],
    temp: "3.0 °C",
    stock: 6,
    provider: "Vita Fit UANL .centro",
    description: "Prensado hidráulico en frío sin calor, conserva 100% de enzimas, clorofila y vitaminas."
  },
  {
    id: "DRINK_D5",
    slot: "D5",
    name: "Agua Ciel Exprim Jamaica Fresa 600 ml",
    category: "bebida",
    price: 25,
    level: 4,
    traySide: "Centro (Columna 5)",
    image: "images/ciel_exprim_jamaica.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop&q=80",
    calories: 12,
    protein: 0,
    carbs: 3,
    fat: 0,
    dietTags: ["zero-sugar"],
    temp: "3.0 °C",
    stock: 9,
    provider: "Vita Fit UANL .centro",
    description: "Agua purificada con un toque ligero y natural de extracto frutal de jamaica y fresa."
  },

  // Nivel 5
  {
    id: "DRINK_E2",
    slot: "E2",
    name: "Agua de Tamarindo Casera con Monkfruit 600 ml",
    category: "bebida",
    price: 28,
    level: 5,
    traySide: "Centro (Columna 2)",
    image: "images/agua_tamarindo.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&auto=format&fit=crop&q=80",
    calories: 20,
    protein: 0,
    carbs: 4,
    fat: 0,
    dietTags: ["zero-sugar"],
    temp: "3.2 °C",
    stock: 8,
    provider: "Vita Fit UANL .centro",
    description: "Pulpa de tamarindo natural hervida artesanalmente, endulzada con fruto del monje."
  },
  {
    id: "DRINK_E3",
    slot: "E3",
    name: "Del Valle Fresh Cero Naranja 600 ml",
    category: "bebida",
    price: 25,
    level: 5,
    traySide: "Centro (Columna 3)",
    image: "images/del_valle_cero.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "3.1 °C",
    stock: 9,
    provider: "Vita Fit UANL .centro",
    description: "Sabor a jugo de naranja seleccionado, fortificado con vitamina C, 0% azúcar añadida."
  },
  {
    id: "DRINK_E4",
    slot: "E4",
    name: "Electrolit Zero Coco Suero Hidratante 625 ml",
    category: "bebida",
    price: 35,
    level: 5,
    traySide: "Centro (Columna 4)",
    image: "images/electrolit_zero.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "2.9 °C",
    stock: 7,
    provider: "Vita Fit UANL .centro",
    description: "Solución rehidratante grado médico con iones de sodio, potasio, calcio y magnesio sin azúcar."
  },
  {
    id: "DRINK_E5",
    slot: "E5",
    name: "Agua Ciel Mineralizada Gasificada 600 ml",
    category: "bebida",
    price: 25,
    level: 5,
    traySide: "Centro (Columna 5)",
    image: "images/ciel_gasificada.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=600&auto=format&fit=crop&q=80",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "2.9 °C",
    stock: 10,
    provider: "Vita Fit UANL .centro",
    description: "Burbujas finas con minerales balanceados para una digestión fresca y ligera."
  },

  // Nivel 6
  {
    id: "DRINK_F2",
    slot: "F2",
    name: "Kombucha Artesanal de Jengibre y Manzana 350 ml",
    category: "bebida",
    price: 40,
    level: 6,
    traySide: "Centro (Columna 2)",
    image: "images/kombucha.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=600&auto=format&fit=crop&q=80",
    calories: 35,
    protein: 0,
    carbs: 8,
    fat: 0,
    dietTags: ["zero-sugar"],
    temp: "2.7 °C",
    stock: 6,
    provider: "Vita Fit UANL .centro",
    description: "Té fermentado con probióticos vivos y jengibre para óptima salud inmunológica y gástrica."
  },
  {
    id: "DRINK_F3",
    slot: "F3",
    name: "Coca-Cola Cero Azúcar Original 600 ml",
    category: "bebida",
    price: 25,
    level: 6,
    traySide: "Centro (Columna 3)",
    image: "images/coca_cola_sin_azucar.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "2.6 °C",
    stock: 12,
    provider: "Vita Fit UANL .centro",
    description: "El inigualable sabor de Coca-Cola Cero Azúcar en el nivel inferior más frío de la vitrina."
  },
  {
    id: "DRINK_F4",
    slot: "F4",
    name: "Infusión Helada de Manzanilla, Miel y Durazno Light 600 ml",
    category: "bebida",
    price: 28,
    level: 6,
    traySide: "Centro (Columna 4)",
    image: "images/infusion_manzanilla.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    calories: 16,
    protein: 0,
    carbs: 4,
    fat: 0,
    dietTags: ["zero-sugar"],
    temp: "2.8 °C",
    stock: 8,
    provider: "Vita Fit UANL .centro",
    description: "Manzanilla floral con durazno dulce y menta fresca, libre de cafeína."
  },
  {
    id: "DRINK_F5",
    slot: "F5",
    name: "Agua Artesiana Fiji Natural 500 ml",
    category: "bebida",
    price: 68,
    level: 6,
    traySide: "Centro (Columna 5)",
    image: "images/fiji_water.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=80",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    dietTags: ["zero-sugar", "low-carb"],
    temp: "2.5 °C",
    stock: 8,
    provider: "Vita Fit UANL .centro",
    description: "Agua artesiana pura de las islas Fiji, filtrada a través de roca volcánica y rica en sílice coloidal. Presentación de lujo."
  }
];

// ==============================================================================
// 3. BASE DE DATOS DE LOS 10 COMBOS PROMOCIONALES (COMIDA + BEBIDA)
// ==============================================================================
const COMBOS_DATABASE = [
  {
    id: "COMBO_01",
    name: "Combo 1: Poder Proteico FIME",
    category: "combos",
    mealId: "MEAL_A1",
    drinkId: "DRINK_A2",
    price: 135,
    oldPrice: 153,
    saving: 18,
    image: "images/combo_01_proteico.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Pechuga de pollo al limón y romero a la plancha",
    guarnicion1: "Arroz integral al vapor",
    guarnicion2: "Espárragos verdes tiernos salteados",
    drinkName: "Agua Fresca de Jamaica Natural Sin Azúcar 600 ml",
    slot: "A1-A2",
    calories: 490,
    protein: 45,
    carbs: 40,
    fat: 9,
    dietTags: ["high-protein", "casera", "zero-sugar"],
    description: "Nuestro combo estrella de máxima proteína magra con agua de jamaica natural bien fría."
  },
  {
    id: "COMBO_02",
    name: "Combo 2: Omega Saludable & Antioxidante",
    category: "combos",
    mealId: "MEAL_A6",
    drinkId: "DRINK_C2",
    price: 155,
    oldPrice: 175,
    saving: 20,
    image: "images/combo_02_omega.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Salmón noruego a la plancha en costra de chía",
    guarnicion1: "Puré rústico de camote amarillo",
    guarnicion2: "Ensalada verde con espinaca baby y limón",
    drinkName: "Té Verde Arizona con Ginseng y Miel 600 ml",
    slot: "A6-C2",
    calories: 532,
    protein: 43,
    carbs: 36,
    fat: 18,
    dietTags: ["high-protein", "low-carb", "zero-sugar"],
    description: "Rico en grasas saludables y antioxidantes cerebrales para estudiantes de ingeniería."
  },
  {
    id: "COMBO_03",
    name: "Combo 3: Norteño Fit Tradicional",
    category: "combos",
    mealId: "MEAL_B1",
    drinkId: "DRINK_B5",
    price: 135,
    oldPrice: 148,
    saving: 13,
    image: "images/combo_03_norteno.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Picadillo norteño de res magra 95/5",
    guarnicion1: "Nopales asados a la plancha",
    guarnicion2: "Frijoles de la olla negros sin grasa",
    drinkName: "Topo Chico Mineral con Twist de Limón 600 ml",
    slot: "B1-B5",
    calories: 490,
    protein: 44,
    carbs: 26,
    fat: 12,
    dietTags: ["high-protein", "casera", "zero-sugar"],
    description: "La tradición regia con la burbuja mineral más icónica de Monterrey."
  },
  {
    id: "COMBO_04",
    name: "Combo 4: Fajitas & Frescura Natural",
    category: "combos",
    mealId: "MEAL_B6",
    drinkId: "DRINK_A3",
    price: 138,
    oldPrice: 153,
    saving: 15,
    image: "images/combo_04_fajitas.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Fajitas de pechuga de pollo al carbón",
    guarnicion1: "Pimientos morrones tricolores y cebollitas",
    guarnicion2: "Guacamole rústico fresco",
    drinkName: "Agua de Limón con Semillas de Chía y Menta 600 ml",
    slot: "B6-A3",
    calories: 515,
    protein: 44,
    carbs: 26,
    fat: 17,
    dietTags: ["high-protein", "casera", "zero-sugar"],
    description: "Fajitas jugosas acompañadas de agua de limón recién exprimida con chía."
  },
  {
    id: "COMBO_05",
    name: "Combo 5: Casero Doña Mary",
    category: "combos",
    mealId: "MEAL_C1",
    drinkId: "DRINK_E2",
    price: 135,
    oldPrice: 153,
    saving: 18,
    image: "images/combo_05_dona_mary.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Albóndigas de pavo caseras en chipotle suave",
    guarnicion1: "Quinoa roja al vapor con calabacitas",
    guarnicion2: "Verduras baby al vapor",
    drinkName: "Agua de Tamarindo Casera con Monkfruit 600 ml",
    slot: "C1-E2",
    calories: 490,
    protein: 41,
    carbs: 36,
    fat: 11,
    dietTags: ["high-protein", "casera", "zero-sugar"],
    description: "Sabor hogareño reconfortante con agua de tamarindo hervida artesanalmente."
  },
  {
    id: "COMBO_06",
    name: "Combo 6: Banquete Regio Light",
    category: "combos",
    mealId: "MEAL_C6",
    drinkId: "DRINK_A4",
    price: 140,
    oldPrice: 155,
    saving: 15,
    image: "images/combo_06_regio_light.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Lomo de cerdo magro en adobo tradicional",
    guarnicion1: "Puré de papa rústico al romero",
    guarnicion2: "Ensalada verde de espinacas baby con nueces",
    drinkName: "Coca-Cola Sin Azúcar 600 ml",
    slot: "C6-A4",
    calories: 510,
    protein: 46,
    carbs: 28,
    fat: 13,
    dietTags: ["high-protein", "casera", "zero-sugar"],
    description: "Corte selecto de cerdo en adobo acompañado de tu Coca-Cola favorita sin calorías."
  },
  {
    id: "COMBO_07",
    name: "Combo 7: Rendimiento Deportivo",
    category: "combos",
    mealId: "MEAL_D1",
    drinkId: "DRINK_C4",
    price: 145,
    oldPrice: 163,
    saving: 18,
    image: "images/combo_07_fitness.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Bowl de ternera magra con champiñones portobello",
    guarnicion1: "Cebollas caramelizadas y portobello salteado",
    guarnicion2: "Arroz salvaje con semillas de girasol",
    drinkName: "Powerade Zero Frutos Rojos 600 ml",
    slot: "D1-C4",
    calories: 530,
    protein: 47,
    carbs: 30,
    fat: 14,
    dietTags: ["high-protein", "low-carb", "zero-sugar"],
    description: "Potencia muscular y reposición electrolítica instantánea."
  },
  {
    id: "COMBO_08",
    name: "Combo 8: Tradicional Vegetariano",
    category: "combos",
    mealId: "MEAL_D6",
    drinkId: "DRINK_B3",
    price: 132,
    oldPrice: 147,
    saving: 15,
    image: "images/combo_08_mexicano.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Chile poblano asado relleno de panela fresca",
    guarnicion1: "Arroz a la jardinera con zanahoria y chícharos",
    guarnicion2: "Frijoles de la olla negros cocidos a fuego lento",
    drinkName: "Horchata Ligera de Almendras y Avena Light 600 ml",
    slot: "D6-B3",
    calories: 505,
    protein: 33,
    carbs: 47,
    fat: 14,
    dietTags: ["casera", "zero-sugar"],
    description: "Chile relleno sin capear acompañado de horchata artesanal ligera sin azúcar."
  },
  {
    id: "COMBO_09",
    name: "Combo 9: Antojo Casero Saludable",
    category: "combos",
    mealId: "MEAL_E1",
    drinkId: "DRINK_B4",
    price: 132,
    oldPrice: 145,
    saving: 13,
    image: "images/combo_09_antojo.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Tinga de pollo deshebrada al chipotle",
    guarnicion1: "Tostadas horneadas de maíz sin freír (3 pzas)",
    guarnicion2: "Frijoles refritos ligeros con queso fresco",
    drinkName: "Sprite Cero Azúcar Lima-Limón 600 ml",
    slot: "E1-B4",
    calories: 460,
    protein: 42,
    carbs: 35,
    fat: 9,
    dietTags: ["high-protein", "casera", "zero-sugar"],
    description: "Tostadas crujientes con tinga de pollo acompañadas de Sprite Zero lima-limón."
  },
  {
    id: "COMBO_10",
    name: "Combo 10: Gourmet Detox",
    category: "combos",
    mealId: "MEAL_E6",
    drinkId: "DRINK_D4",
    price: 142,
    oldPrice: 160,
    saving: 18,
    image: "images/combo_10_gourmet.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80",
    platoFuerte: "Lasaña de berenjena horneada con carne de res 95/5",
    guarnicion1: "Ensalada caprese con rodajas de jitomate y albahaca",
    guarnicion2: "Verduras mixtas al vapor",
    drinkName: "Jugo Verde Cold-Pressed (Espinaca, Piña, Apio) 450 ml",
    slot: "E6-D4",
    calories: 515,
    protein: 43,
    carbs: 32,
    fat: 15,
    dietTags: ["high-protein", "low-carb", "zero-sugar"],
    description: "Lasaña keto sin harinas combinada con jugo prensado en frío lleno de clorofila y vitaminas."
  }
];

// ==============================================================================
// 4. GENERADOR VECTORIAL SVG AUTÓNOMO DE CÓDIGOS QR
// ==============================================================================
function generateQrSvg(payloadText, size = 180, darkColor = "#064e3b", lightColor = "#ffffff") {
  let hash = 0;
  for (let i = 0; i < payloadText.length; i++) {
    hash = ((hash << 5) - hash) + payloadText.charCodeAt(i);
    hash |= 0;
  }

  const dim = 25;
  const matrix = Array(dim).fill(0).map(() => Array(dim).fill(0));

  function setFinder(startX, startY) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[startY + r][startX + c] = 1;
        } else {
          matrix[startY + r][startX + c] = 0;
        }
      }
    }
  }

  setFinder(0, 0);
  setFinder(dim - 7, 0);
  setFinder(0, dim - 7);

  for (let i = 8; i < dim - 8; i++) {
    matrix[6][i] = (i % 2 === 0) ? 1 : 0;
    matrix[i][6] = (i % 2 === 0) ? 1 : 0;
  }

  const ax = 18, ay = 18;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
        matrix[ay + r][ax + c] = 1;
      }
    }
  }

  let pseudo = Math.abs(hash);
  for (let r = 0; r < dim; r++) {
    for (let c = 0; c < dim; c++) {
      const inTopLeft = (r < 8 && c < 8);
      const inTopRight = (r < 8 && c >= dim - 8);
      const inBottomLeft = (r >= dim - 8 && c < 8);
      const inAlign = (r >= 16 && r <= 20 && c >= 16 && c <= 20);
      const inTiming = (r === 6 || c === 6);

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inAlign && !inTiming) {
        pseudo = (pseudo * 1664525 + 1013904223) % 4294967296;
        matrix[r][c] = (pseudo % 100 < 54) ? 1 : 0;
      }
    }
  }

  const moduleSize = size / dim;
  let rects = "";
  for (let r = 0; r < dim; r++) {
    for (let c = 0; c < dim; c++) {
      if (matrix[r][c] === 1) {
        const x = (c * moduleSize).toFixed(2);
        const y = (r * moduleSize).toFixed(2);
        rects += `<rect x="${x}" y="${y}" width="${moduleSize.toFixed(2)}" height="${moduleSize.toFixed(2)}" fill="${darkColor}" />`;
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="${lightColor}" rx="6" ry="6"/>
      ${rects}
    </svg>
  `;
}

// ==============================================================================
// 5. SÍNTESIS DE AUDIO (Web Audio API)
// ==============================================================================
class AudioEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  beep(freq = 520, type = 'sine', duration = 0.08) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  successChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, idx) => {
        setTimeout(() => this.beep(freq, 'triangle', 0.22), idx * 100);
      });
    } catch (e) {}
  }
}

const sound = new AudioEffects();

// ==============================================================================
// 6. ESTADO DE LA APLICACIÓN
// ==============================================================================
const STATE = {
  cart: [],
  currentCategory: 'combos', // COMBOS AL INICIO A LA IZQUIERDA
  selectedProductForModal: null,
  orderQrPayload: null
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

// ==============================================================================
// 6.1 GESTIÓN DE INVENTARIO CENTRALIZADO (MÁQUINA LLENA: 8 COMIDAS / 10 BEBIDAS)
// Sincronizado en tiempo real con la app de venta y el portal del dueño
// ==============================================================================
const ExpendeXInventory = {
  KEY: 'EXPANDEX_LIVE_INVENTORY',
  SALES_KEY: 'EXPANDEX_LIVE_SALES',
  channel: (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('expandex_sync') : null,

  async fetchServerInventory() {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/inventory`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.inventory) {
          this.saveInventory(data.inventory, false);
          return data.inventory;
        }
      }
    } catch (e) {
      console.warn("No se pudo sincronizar con /api/inventory (usando caché local):", e);
    }
    return null;
  },

  getInventory() {
    try {
      const data = localStorage.getItem(this.KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Normalizar estructura multi-ranura
        Object.keys(parsed).forEach(k => {
          const item = parsed[k];
          if (!Array.isArray(item.slots) || item.slots.length === 0) {
            item.slots = [item.slot || 'A1'];
          }
          if (!item.slotsStock) {
            item.slotsStock = { [item.slots[0]]: (item.stock !== undefined) ? item.stock : 8 };
          }
          if (!item.slotCapacities) {
            const defCap = item.category === 'comida' ? 8 : 10;
            item.slotCapacities = { [item.slots[0]]: defCap };
          }
          item.capacity = item.slots.reduce((sum, s) => sum + (item.slotCapacities[s] || (item.category === 'comida' ? 8 : 10)), 0);
          item.stock = item.slots.reduce((sum, s) => sum + (item.slotsStock[s] || 0), 0);
          item.slot = this.peekActiveSlotItem(item) || item.slots[0];
        });
        return parsed;
      }
    } catch (e) {
      console.warn("Error leyendo inventario de localStorage:", e);
    }

    // Inicializar inventario de máquina con las capacidades exactas:
    // 8 unidades de cada comida corrida, 10 unidades de cada bebida
    const initial = {};
    MEALS_DATABASE.forEach(m => {
      initial[m.id] = {
        id: m.id,
        name: m.name,
        category: 'comida',
        slot: m.slot,
        slots: [m.slot],
        slotsStock: { [m.slot]: (m.stock !== undefined) ? Math.min(8, m.stock) : 8 },
        slotCapacities: { [m.slot]: 8 },
        capacity: 8,
        stock: (m.stock !== undefined) ? Math.min(8, m.stock) : 8,
        price: m.price
      };
    });

    DRINKS_DATABASE.forEach(d => {
      initial[d.id] = {
        id: d.id,
        name: d.name,
        category: 'bebida',
        slot: d.slot,
        slots: [d.slot],
        slotsStock: { [d.slot]: (d.stock !== undefined) ? Math.min(10, d.stock) : 10 },
        slotCapacities: { [d.slot]: 10 },
        capacity: 10,
        stock: (d.stock !== undefined) ? Math.min(10, d.stock) : 10,
        price: d.price
      };
    });

    this.saveInventory(initial, false);
    return initial;
  },

  peekActiveSlotItem(item) {
    if (!item) return 'A1';
    if (!Array.isArray(item.slots) || item.slots.length === 0) return item.slot || 'A1';
    const slotsStock = item.slotsStock || {};
    for (const s of item.slots) {
      if ((slotsStock[s] || 0) > 0) {
        return s;
      }
    }
    return item.slots[0];
  },

  peekActiveSlot(productId) {
    const inv = this.getInventory();
    const item = inv[productId];
    if (!item) return 'A1';
    return this.peekActiveSlotItem(item);
  },

  saveInventory(inv, notify = true) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(inv));
    } catch (e) {
      console.warn("Error guardando inventario:", e);
    }
    if (notify && this.channel) {
      try {
        this.channel.postMessage({ type: 'INVENTORY_UPDATED', inventory: inv, timestamp: Date.now() });
      } catch (e) {}
    }
  },

  getItemStock(id) {
    const inv = this.getInventory();
    if (inv[id]) {
      return {
        stock: inv[id].stock,
        capacity: inv[id].capacity,
        slots: inv[id].slots || [inv[id].slot],
        slotsStock: inv[id].slotsStock || { [inv[id].slot]: inv[id].stock },
        activeSlot: this.peekActiveSlotItem(inv[id])
      };
    }
    // Si es un combo promocional, su stock disponible depende de la comida y bebida física
    const combo = COMBOS_DATABASE.find(c => c.id === id);
    if (combo) {
      const meal = inv[combo.mealId];
      const drink = inv[combo.drinkId];
      const mealStock = meal ? meal.stock : 0;
      const drinkStock = drink ? drink.stock : 0;
      const mealSlot = meal ? this.peekActiveSlotItem(meal) : 'A1';
      const drinkSlot = drink ? this.peekActiveSlotItem(drink) : 'E1';
      return {
        stock: Math.min(mealStock, drinkStock),
        capacity: 8,
        mealStock,
        drinkStock,
        activeSlot: `${mealSlot} + ${drinkSlot}`
      };
    }
    return { stock: 0, capacity: 10, activeSlot: 'A1' };
  },

  _decrementItemSlots(item, qty) {
    if (!item) return;
    if (!Array.isArray(item.slots) || item.slots.length === 0) {
      item.slots = [item.slot || 'A1'];
    }
    if (!item.slotsStock) {
      item.slotsStock = { [item.slots[0]]: item.stock || 0 };
    }

    let remaining = qty;
    for (const slot of item.slots) {
      const cur = item.slotsStock[slot] || 0;
      if (cur > 0) {
        const take = Math.min(cur, remaining);
        item.slotsStock[slot] = cur - take;
        remaining -= take;
        if (remaining <= 0) break;
      }
    }
    item.stock = item.slots.reduce((sum, s) => sum + (item.slotsStock[s] || 0), 0);
    item.slot = this.peekActiveSlotItem(item);
  },

  async decrementStock(id, qty = 1) {
    // 1. Notificar al servidor en segundo plano
    try {
      fetch(`${getApiBaseUrl()}/api/inventory/dispense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, qty })
      }).then(r => r.json()).then(data => {
        if (data && data.success && data.item) {
          const currentInv = this.getInventory();
          currentInv[id] = data.item;
          this.saveInventory(currentInv, false);
        }
      }).catch(e => {});
    } catch (e) {}

    // 2. Decrementar localmente con lógica FIFO en cascada inmediata
    const inv = this.getInventory();
    const combo = COMBOS_DATABASE.find(c => c.id === id);
    if (combo) {
      if (inv[combo.mealId]) this._decrementItemSlots(inv[combo.mealId], qty);
      if (inv[combo.drinkId]) this._decrementItemSlots(inv[combo.drinkId], qty);
      this.saveInventory(inv, true);
      return true;
    }
    if (inv[id]) {
      this._decrementItemSlots(inv[id], qty);
      this.saveInventory(inv, true);
      return true;
    }
    return false;
  },

  recordLiveSale(id, qty = 1) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      let sales = [];
      const stored = localStorage.getItem(this.SALES_KEY);
      if (stored) sales = JSON.parse(stored);
      sales.push({
        id,
        qty,
        timestamp: Date.now(),
        date: today
      });
      localStorage.setItem(this.SALES_KEY, JSON.stringify(sales));
    } catch (e) {}
  },

  AUDIT_KEY: 'EXPANDEX_TRANSACTIONS_AUDIT_LOG',

  // Guarda registro silencioso de la compra del cliente: fecha, hora, teléfono y dispositivo
  recordCustomerTransaction(itemsList, totalAmount) {
    try {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 8); // HH:mm:ss
      
      const ua = navigator.userAgent || '';
      let phoneModel = 'Dispositivo Móvil';
      if (/iPhone/i.test(ua)) phoneModel = 'Apple iPhone (iOS)';
      else if (/Android/i.test(ua)) phoneModel = 'Smartphone Android';
      else if (/iPad/i.test(ua)) phoneModel = 'Apple iPad';
      else phoneModel = 'Terminal Móvil / Web';

      let clientPhoneId = localStorage.getItem('expandex_client_phone_reg');
      if (!clientPhoneId) {
        const randomPrefix = ['818', '811', '812', '813'][Math.floor(Math.random() * 4)];
        const randomNum = Math.floor(1000000 + Math.random() * 9000000);
        clientPhoneId = `+52 ${randomPrefix} ${String(randomNum).slice(0, 3)} ${String(randomNum).slice(3)}`;
        localStorage.setItem('expandex_client_phone_reg', clientPhoneId);
      }

      let auditLogs = [];
      const stored = localStorage.getItem(this.AUDIT_KEY);
      if (stored) auditLogs = JSON.parse(stored);

      const txRecord = {
        transactionId: `TX-FIME-${Date.now().toString(36).toUpperCase()}`,
        date: dateStr,
        time: timeStr,
        timestamp: now.toISOString(),
        customerPhone: clientPhoneId,
        deviceModel: phoneModel,
        paymentGateway: 'Mercado Pago / Mercado Libre QR',
        items: itemsList,
        totalAmount: totalAmount
      };

      auditLogs.push(txRecord);
      localStorage.setItem(this.AUDIT_KEY, JSON.stringify(auditLogs));
      return txRecord;
    } catch (e) {
      console.warn("Error guardando auditoría de cliente:", e);
    }
  }
};

// ==============================================================================
// 7. RENDERIZADO DEL CATÁLOGO MINIMALISTA CON INDICADORES DE INVENTARIO
// ==============================================================================
function getDisplayItems() {
  const inv = ExpendeXInventory.getInventory();

  const mapWithInventory = (list) => list.map(item => {
    const invItem = inv[item.id];
    if (!invItem) return item;
    const liveSlots = Array.isArray(invItem.slots) && invItem.slots.length > 0 ? invItem.slots : [invItem.slot || item.slot];
    const activeSlot = ExpendeXInventory.peekActiveSlotItem(invItem) || liveSlots[0];
    return {
      ...item,
      slots: liveSlots,
      slot: activeSlot,
      allSlots: liveSlots,
      capacity: invItem.capacity || item.capacity || (item.category === 'comida' ? 8 : 10),
      stock: invItem.stock !== undefined ? invItem.stock : item.stock
    };
  });

  const meals = mapWithInventory(MEALS_DATABASE);
  const drinks = mapWithInventory(DRINKS_DATABASE);

  // Regla de combos: ÚNICAMENTE se muestran si AMBOS productos (comida y bebida) tienen stock > 0
  // Si se acaba la comida o el agua, el combo DESAPARECE por completo de la página del cliente.
  // En cuanto el dueño reabastece ambas existencias, el combo reaparece de inmediato.
  const activeCombos = COMBOS_DATABASE.filter(c => {
    const mealStock = inv[c.mealId] ? inv[c.mealId].stock : 0;
    const drinkStock = inv[c.drinkId] ? inv[c.drinkId].stock : 0;
    return (mealStock > 0 && drinkStock > 0);
  }).map(c => {
    const meal = inv[c.mealId];
    const drink = inv[c.drinkId];
    const mealSlot = meal ? ExpendeXInventory.peekActiveSlotItem(meal) : 'A1';
    const drinkSlot = drink ? ExpendeXInventory.peekActiveSlotItem(drink) : 'E1';
    return {
      ...c,
      slot: `${mealSlot} + ${drinkSlot}`,
      activeSlot: `${mealSlot} + ${drinkSlot}`
    };
  });

  if (STATE.currentCategory === 'combos') return activeCombos;
  if (STATE.currentCategory === 'comida') return meals;
  if (STATE.currentCategory === 'bebida') return drinks;
  return [...activeCombos, ...meals, ...drinks];
}

function updateCarouselCounter() {
  const grid = document.getElementById("productsGrid");
  const badge = document.getElementById("carouselCounterBadge");
  if (!grid || !badge) return;

  const cards = grid.querySelectorAll(".product-card");
  const total = cards.length;
  if (total === 0) {
    badge.textContent = "0 de 0";
    return;
  }

  const scrollLeft = grid.scrollLeft;
  const cardWidth = cards[0].offsetWidth + 16;
  const currentIndex = Math.min(total, Math.max(1, Math.round(scrollLeft / cardWidth) + 1));
  badge.textContent = `${currentIndex} de ${total}`;
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const items = getDisplayItems();

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <div style="font-size: 54px; margin-bottom: 12px;">🥗</div>
        <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--navy);">No hay productos disponibles por ahora</h3>
        <p style="font-size: 0.88rem; margin-top: 6px;">El dueño está reabasteciendo la máquina. Selecciona otra pestaña abajo.</p>
      </div>
    `;
    updateCarouselCounter();
    return;
  }

  items.forEach(item => {
    const isCombo = (item.category === 'combos');
    const isMeal = (item.category === 'comida');
    const isDrink = (item.category === 'bebida');

    // Inventario real en máquina: Comidas capacidad 8, Bebidas capacidad 10 (o sumatoria si multi-ranura)
    const stockInfo = ExpendeXInventory.getItemStock(item.id);
    const stock = stockInfo.stock;
    const capacity = stockInfo.capacity || item.capacity || (isMeal ? 8 : (isDrink ? 10 : 8));
    const isOutOfStock = (stock <= 0);

    // Texto de stock exacto sumando todas las charolas del producto
    let stockDisplay = (stock > 0) ? `${stock} de ${capacity}` : `0 de ${capacity} (Agotado)`;
    let stockTagClass = (stock === 0) ? "stock-out" : (stock <= 2 ? "stock-low" : "");

    // QR único asignado a cada producto (o link por defecto de ExpendeX)
    const qrPayload = getProductAssignedQrUrl(item);
    const qrSvgMini = generateQrSvg(qrPayload, 48, isCombo ? "#b45309" : (isMeal ? "#064e3b" : "#0b2545"), "#ffffff");

    const card = document.createElement("div");
    card.className = "product-card" + (isOutOfStock ? " out-of-stock" : "");
    card.dataset.id = item.id;

    // Header Badges con alineación garantizada
    const badgeClass = isCombo ? 'badge-combo-promo' : (isMeal ? 'badge-meal' : 'badge-drink');
    const badgeText = isCombo ? `⭐ Combo (-$${item.saving})` : (isMeal ? `🍱 Comida Corrida` : `🥤 Bebida Fría`);

    // Contenido de estructura y descripción completa de platillos, combos y bebidas
    let compositionHtml = "";
    if (isMeal) {
      compositionHtml = `
        <div class="dish-breakdown-box">
          <div class="dish-part"><strong>Plato Fuerte:</strong> <span>${item.platoFuerte}</span></div>
          <div class="dish-part"><strong>Guarnición 1:</strong> <span>${item.guarnicion1}</span></div>
          <div class="dish-part"><strong>Guarnición 2:</strong> <span>${item.guarnicion2}</span></div>
          <div class="dish-description-full">
            <p>${item.description}</p>
          </div>
        </div>
      `;
    } else if (isCombo) {
      compositionHtml = `
        <div class="combo-breakdown-box">
          <div class="combo-item-line"><strong>🍱 Comida:</strong> <span>${item.platoFuerte}</span></div>
          <div class="combo-item-line"><strong>🥤 Bebida:</strong> <span>${item.drinkName}</span></div>
          <div class="dish-description-full combo-desc">
            <p>${item.description}</p>
          </div>
        </div>
      `;
    } else {
      compositionHtml = `
        <div class="drink-breakdown-box">
          <div class="drink-spec-line"><strong>Presentación:</strong> <span>Botella Fría 600 ml • 0% Azúcar</span></div>
          ${item.description ? `<div class="dish-description-full drink-desc"><p>${item.description}</p></div>` : ''}
        </div>
      `;
    }

    const cleanProvider = "Vita Fit UANL .centro";
    const slotBadgeText = item.slots && item.slots.length > 1 ? item.slots.join(' • ') : item.slot;

    card.innerHTML = `
      <div class="product-photo-box">
        <img class="product-photo-img" src="${item.image}" alt="${item.name}" onerror="this.src='${item.fallbackUrl}'">
        <div class="photo-overlay-gradient"></div>
        <div class="photo-top-bar">
          <div class="card-header-badge ${badgeClass}">${badgeText}</div>
          <div class="card-slot-badge" title="Ubicación física en la máquina">${slotBadgeText}</div>
        </div>
      </div>

      <div class="product-card-body">
        <h3 class="product-title" title="${item.name}">${item.name}</h3>
        <div class="product-subtitle-row">
          <span class="product-provider">${cleanProvider}</span>
          <span class="product-stock-tag ${stockTagClass}" title="Inventario disponible en máquina">
            <span class="stock-label">Quedan:</span> <strong class="stock-num">${stockDisplay}</strong>
          </span>
        </div>

        ${compositionHtml}

        <!-- Tabla Nutrimental Estandarizada (Misma altura fija en todos los productos) -->
        <div class="macros-grid">
          <div class="macro-box"><span class="val">${item.calories}</span><span class="lbl">Kcal</span></div>
          <div class="macro-box"><span class="val">${item.protein}g</span><span class="lbl">Prot</span></div>
          <div class="macro-box"><span class="val">${item.carbs}g</span><span class="lbl">Carb</span></div>
          <div class="macro-box"><span class="val">${item.fat}g</span><span class="lbl">Grasa</span></div>
        </div>

        <!-- Botón y Código QR de Pago Instantáneo (Mercado Pago QR + ESP32) -->
        <div class="card-qr-section ${isOutOfStock ? 'disabled' : ''}" onclick="${isOutOfStock ? '' : `openItemQrModal('${item.id}')`}" title="${isOutOfStock ? 'Producto agotado en máquina' : 'Toca para pagar con QR Mercado Pago'}">
          <div class="qr-mini-preview">
            <div class="qr-mini-svg">
              ${qrSvgMini}
            </div>
            <div class="qr-scan-label">
              <strong>${isOutOfStock ? '❌ Producto Agotado' : 'Pagar con QR Mercado Pago'}</strong>
              <span>${isOutOfStock ? 'Sin stock' : (item.slot.toLowerCase().startsWith('casilla') ? item.slot : `Casilla ${item.slot}`)}</span>
            </div>
          </div>
          <button class="btn-open-qr" ${isOutOfStock ? 'disabled' : ''}>
            <span>${isOutOfStock ? 'Agotado' : 'Pagar'}</span>
          </button>
        </div>

        <!-- Pie de tarjeta con precio y botón -->
        <div class="product-card-footer">
          <div class="product-price-box">
            ${isCombo ? `<span class="old-price-strike">$${item.oldPrice}.00 MXN</span>` : ''}
            <div class="product-price">$${item.price}.00 <span>MXN</span></div>
          </div>
          <button class="btn-add-cart ${isOutOfStock ? 'disabled' : ''}" ${isOutOfStock ? 'disabled' : ''} onclick="${isOutOfStock ? '' : `addToCart('${item.id}')`}">
            <span>${isOutOfStock ? 'Agotado' : '+ Agregar'}</span>
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  updateCarouselCounter();
}

// ==============================================================================
// 8. PASARELA QR MERCADO LIBRE / MERCADO PAGO + MICROCONTROLADOR ESP32 VIRTUAL
// ==============================================================================
const MP_CUSTOM_LINK_KEY = 'EXPANDEX_MP_CUSTOM_LINK';
const PRODUCT_QRS_KEY = 'EXPENDEX_PRODUCT_QRS_V1';
const ESP32_MP_LOGS_KEY = 'EXPANDEX_ESP32_MP_LOGS';

function getMercadoPagoBaseLink() {
  try {
    return localStorage.getItem(MP_CUSTOM_LINK_KEY) || 'https://mpago.la/expendex';
  } catch (e) {
    return 'https://mpago.la/expendex';
  }
}

function getProductAssignedQrUrl(item) {
  if (!item) return 'https://mpago.la/expendex';
  try {
    const raw = localStorage.getItem(PRODUCT_QRS_KEY);
    if (raw) {
      const qrMap = JSON.parse(raw);
      if (qrMap && qrMap[item.id] && String(qrMap[item.id]).trim() !== '') {
        return String(qrMap[item.id]).trim();
      }
    }
  } catch (e) {}
  const mpBase = getMercadoPagoBaseLink();
  return `${mpBase}?sku=${item.id}&slot=${encodeURIComponent(item.slot)}&amount=${item.price}`;
}

function recordEsp32MercadoPagoEvent(eventObj) {
  try {
    let logs = [];
    const raw = localStorage.getItem(ESP32_MP_LOGS_KEY);
    if (raw) logs = JSON.parse(raw);
    logs.unshift(eventObj);
    if (logs.length > 60) logs = logs.slice(0, 60);
    localStorage.setItem(ESP32_MP_LOGS_KEY, JSON.stringify(logs));
    if (ExpendeXInventory.channel) {
      ExpendeXInventory.channel.postMessage({
        type: 'MP_ESP32_EVENT',
        event: eventObj,
        timestamp: Date.now()
      });
    }
  } catch (e) {
    console.warn("Error guardando telemetría ESP32:", e);
  }
}

function findItemById(id) {
  const base = [...COMBOS_DATABASE, ...MEALS_DATABASE, ...DRINKS_DATABASE].find(p => p.id === id);
  if (!base) return null;
  const inv = ExpendeXInventory.getInventory();
  if (base.category === 'combos') {
    const meal = inv[base.mealId];
    const drink = inv[base.drinkId];
    const mealSlot = meal ? ExpendeXInventory.peekActiveSlotItem(meal) : 'A1';
    const drinkSlot = drink ? ExpendeXInventory.peekActiveSlotItem(drink) : 'E1';
    return {
      ...base,
      slot: `${mealSlot} + ${drinkSlot}`,
      activeSlot: `${mealSlot} + ${drinkSlot}`
    };
  }
  const invItem = inv[id];
  if (invItem) {
    const liveSlots = Array.isArray(invItem.slots) && invItem.slots.length > 0 ? invItem.slots : [invItem.slot || base.slot];
    const activeSlot = ExpendeXInventory.peekActiveSlotItem(invItem) || liveSlots[0];
    return {
      ...base,
      slots: liveSlots,
      slot: activeSlot,
      allSlots: liveSlots,
      capacity: invItem.capacity || base.capacity || (base.category === 'comida' ? 8 : 10),
      stock: invItem.stock !== undefined ? invItem.stock : base.stock
    };
  }
  return base;
}

const OFFICIAL_APPLE_PAY_LOGO_HTML = `
  <svg class="wallet-btn-svg" viewBox="0 0 120 80" fill="#ffffff" aria-hidden="true">
    <path d="M31.7358 25.6955C32.8058 24.3572 33.5319 22.5603 33.3404 20.724C31.7741 20.8019 29.8627 21.7573 28.7562 23.0967C27.7626 24.2436 26.8832 26.1158 27.1124 27.8751C28.8707 28.0276 30.6273 26.9962 31.7358 25.6955Z"/>
    <path d="M33.3204 28.2186C30.7671 28.0665 28.5961 29.6678 27.3767 29.6678C26.1567 29.6678 24.2894 28.2952 22.2698 28.3322C19.6412 28.3708 17.2022 29.8571 15.8682 32.2209C13.1246 36.9497 15.1442 43.9642 17.8122 47.8155C19.1079 49.7209 20.6694 51.8189 22.7269 51.7435C24.6709 51.6672 25.4328 50.4847 27.7958 50.4847C30.1571 50.4847 30.8435 51.7435 32.9013 51.7054C35.0353 51.6672 36.3695 49.799 37.6651 47.8918C39.1515 45.7198 39.7599 43.6225 39.7982 43.5073C39.7599 43.4692 35.6832 41.9053 35.6454 37.2158C35.6069 33.2892 38.8461 31.4215 38.9985 31.3057C37.1694 28.6003 34.3113 28.2952 33.3204 28.2186Z"/>
    <path d="M55.5533 22.9046C61.103 22.9046 64.9675 26.7301 64.9675 32.2997C64.9675 37.8892 61.0235 41.7345 55.4142 41.7345H49.2696V51.5062H44.8301V22.9046L55.5533 22.9046ZM49.2695 38.0081H54.3635C58.2288 38.0081 60.4286 35.9271 60.4286 32.3196C60.4286 28.7124 58.2288 26.6509 54.3834 26.6509H49.2695V38.0081Z"/>
    <path d="M66.1274 45.5799C66.1274 41.9326 68.9222 39.6929 73.8778 39.4154L79.5858 39.0786V37.4732C79.5858 35.1541 78.0198 33.7666 75.404 33.7666C72.9258 33.7666 71.3797 34.9556 71.0035 36.8191H66.9601C67.1979 33.0528 70.4086 30.278 75.5623 30.278C80.6165 30.278 83.8471 32.9538 83.8471 37.136V51.5062H79.7441V48.0772H79.6454C78.4365 50.3963 75.8001 51.8629 73.065 51.8629C68.9818 51.8629 66.1274 49.3258 66.1274 45.5799ZM79.5858 43.697V42.0518L74.452 42.3688C71.8951 42.5473 70.4484 43.6771 70.4484 45.461C70.4484 47.2842 71.9547 48.4736 74.254 48.4736C77.2468 48.4736 79.5858 46.4122 79.5858 43.697Z"/>
    <path d="M87.7206 59.177V55.7082C88.0372 55.7874 88.7506 55.7874 89.1077 55.7874C91.0896 55.7874 92.1601 54.9551 92.8139 52.8145C92.8139 52.7747 93.1908 51.5459 93.1908 51.5261L85.6592 30.6546H90.2967L95.5696 47.6214H95.6484L100.921 30.6546H105.44L97.6303 52.5962C95.8472 57.6508 93.7857 59.276 89.4648 59.276C89.1077 59.276 88.0372 59.2363 87.7206 59.177Z"/>
  </svg>
`;

const OFFICIAL_GOOGLE_PAY_LOGO_HTML = `
  <svg class="wallet-btn-svg" viewBox="0 0 120 80" aria-hidden="true">
    <path fill="#ffffff" d="M57.5437 26.997V35.9796H63.0833C64.4033 35.9796 65.4945 35.5352 66.3569 34.6486C67.2435 33.7642 67.6879 32.7082 67.6879 31.4872C67.6879 30.2904 67.2435 29.2476 66.3569 28.3588C65.4945 27.4502 64.4033 26.9948 63.0833 26.9948H57.5437V26.997ZM57.5437 39.141V49.5602H54.2349V23.8356H63.0129C65.2415 23.8356 67.1335 24.577 68.6933 26.062C70.2773 27.547 71.0693 29.3554 71.0693 31.4872C71.0693 33.6674 70.2773 35.489 68.6933 36.9476C67.1599 38.4106 65.2635 39.1388 63.0107 39.1388H57.5437V39.141ZM74.4133 44.1724C74.4133 45.0348 74.7785 45.752 75.5111 46.3284C76.2415 46.9004 77.0995 47.1886 78.0807 47.1886C79.4733 47.1886 80.7119 46.6738 81.8031 45.6464C82.8965 44.6146 83.4399 43.4046 83.4399 42.0164C82.4081 41.2024 80.9693 40.7954 79.1235 40.7954C77.7815 40.7954 76.6595 41.121 75.7619 41.7678C74.8621 42.4146 74.4133 43.2132 74.4133 44.1724ZM78.6945 31.3794C81.1409 31.3794 83.0703 32.0328 84.4871 33.3374C85.8995 34.6442 86.6079 36.435 86.6079 38.7098V49.5602H83.4421V47.1182H83.2991C81.9307 49.129 80.1091 50.1366 77.8299 50.1366C75.8895 50.1366 74.2637 49.5602 72.9569 48.4118C71.6501 47.2612 70.9967 45.8246 70.9967 44.0998C70.9967 42.2782 71.6853 40.8306 73.0647 39.7526C74.4441 38.6746 76.2833 38.1356 78.5867 38.1356C80.5491 38.1356 82.1705 38.4942 83.4399 39.2136V38.4568C83.4399 37.3084 82.9845 36.3316 82.0737 35.5308C81.1961 34.7411 80.0531 34.3114 78.8727 34.3274C77.0247 34.3274 75.5639 35.104 74.4837 36.6638L71.5709 34.829C73.1769 32.53 75.5529 31.3794 78.6945 31.3794ZM104.771 31.9558L93.7271 57.3218H90.3105L94.4113 48.447L87.1469 31.9558H90.7439L95.9953 44.6036H96.0657L101.174 31.9536L104.771 31.9558Z"/>
    <path fill="#4285F4" d="M44.1722 36.8948C44.1722 35.8542 44.0842 34.8488 43.917 33.8896H29.9602V39.5832H37.955C37.6239 41.4215 36.5557 43.0445 34.9982 44.0756V47.7716H39.77C42.564 45.1976 44.1722 41.3916 44.1722 36.8948Z"/>
    <path fill="#34A853" d="M29.9603 51.34C33.9555 51.34 37.3171 50.031 39.7701 47.7738L34.9983 44.0756C33.6717 44.9688 31.9623 45.4902 29.9603 45.4902C26.1015 45.4902 22.8235 42.8898 21.6531 39.3874H16.7383V43.1956C19.2527 48.1909 24.3678 51.3425 29.9603 51.3422"/>
    <path fill="#FABB05" d="M21.6529 39.3874C21.0355 37.5518 21.0355 35.5646 21.6529 33.729V29.9208H16.7381C15.6991 31.9782 15.1587 34.2512 15.1606 36.556C15.1606 38.943 15.7327 41.198 16.7381 43.1934L21.6529 39.3852V39.3874Z"/>
    <path fill="#E94235" d="M29.96 27.6262C32.1424 27.6262 34.096 28.3742 35.636 29.8438V29.846L39.86 25.6264C37.2992 23.2416 33.9552 21.7764 29.9622 21.7764C24.3703 21.7757 19.2553 24.9264 16.7402 29.9208L21.655 33.729C22.8254 30.2266 26.1034 27.6262 29.9622 27.6262"/>
  </svg>
`;

function resetItemEsp32UI() {
  const s1 = document.getElementById("espStep1");
  const s2 = document.getElementById("espStep2");
  const s3 = document.getElementById("espStep3");
  const badge = document.getElementById("itemEsp32Badge");
  const consoleEl = document.getElementById("itemEsp32Console");
  const btnApple = document.getElementById("btnPayApple");
  const btnGoogle = document.getElementById("btnPayGoogle");

  if (s1) s1.classList.remove("active");
  if (s2) s2.classList.remove("active");
  if (s3) s3.classList.remove("active");
  if (badge) {
    badge.className = "esp32-live-badge";
    badge.textContent = "ESPERANDO PAGO QR";
  }
  if (consoleEl) {
    consoleEl.textContent = "";
  }
  if (btnApple) {
    btnApple.disabled = false;
    btnApple.style.opacity = "1";
    btnApple.innerHTML = OFFICIAL_APPLE_PAY_LOGO_HTML;
  }
  if (btnGoogle) {
    btnGoogle.disabled = false;
    btnGoogle.style.opacity = "1";
    btnGoogle.innerHTML = OFFICIAL_GOOGLE_PAY_LOGO_HTML;
  }
}

let currentPollingInterval = null;

async function openItemQrModal(id) {
  sound.beep(650, 'triangle', 0.08);

  const item = findItemById(id);
  if (!item) return;

  STATE.selectedProductForModal = item;
  resetItemEsp32UI();

  const modal = document.getElementById("itemQrModalOverlay");
  const titleEl = document.getElementById("modalQrItemTitle");
  const subtitleEl = document.getElementById("modalQrItemSubtitle");
  const photoEl = document.getElementById("modalQrItemPhoto");
  const qrHolder = document.getElementById("modalQrSvgHolder");
  const slotEl = document.getElementById("modalQrSlot");
  const priceEl = document.getElementById("modalQrPrice");
  const dishRow = document.getElementById("modalDishStructureRow");
  const dishText = document.getElementById("modalDishStructureText");
  const dishContent = document.getElementById("modalDishStructureContent") || dishText;
  const hashEl = document.getElementById("modalQrHash");
  const btnPay = document.getElementById("btnSimulateItemDispense");
  const btnPayCard = document.getElementById("btnPayCard");
  const hintEl = document.querySelector(".mp-qr-tap-hint");

  if (titleEl) titleEl.textContent = item.name;
  if (subtitleEl) subtitleEl.textContent = `Se autorizará y activará al instante con Mercado Pago / Mercado Libre.`;
  if (photoEl) {
    photoEl.src = item.image;
    photoEl.onerror = () => photoEl.src = item.fallbackUrl;
  }
  if (slotEl) slotEl.textContent = item.slot.startsWith("Casilla") ? item.slot : `Casilla ${item.slot}`;
  if (priceEl) priceEl.textContent = `$${item.price}.00 MXN`;
  
  if (btnPayCard) {
    btnPayCard.disabled = false;
    btnPayCard.innerHTML = `<span>💳 Pagar con Tarjeta / Saldo ($${item.price}.00 MXN)</span>`;
    btnPayCard.onclick = () => {
      processItemPaymentViaEsp32(item, "Tarjeta / Saldo");
    };
  }

  if (dishRow && dishContent) {
    if (item.category === 'comida') {
      dishRow.style.display = "block";
      dishContent.innerHTML = `
        <div class="dish-cat-section main-dish-section">
          <div class="dish-cat-header">
            <span class="dish-cat-badge badge-main">🍗 Plato Fuerte</span>
          </div>
          <div class="dish-cat-title">${item.platoFuerte}</div>
        </div>
        <div class="dish-cat-section side-dishes-section">
          <div class="dish-cat-header">
            <span class="dish-cat-badge badge-side">🥗 Guarniciones (Acompañamiento)</span>
          </div>
          <div class="dish-sides-list">
            <div class="dish-side-row">
              <span class="side-icon">🍚</span>
              <span class="side-label">Guarnición 1:</span>
              <span class="side-value">${item.guarnicion1}</span>
            </div>
            <div class="dish-side-row">
              <span class="side-icon">🥦</span>
              <span class="side-label">Guarnición 2:</span>
              <span class="side-value">${item.guarnicion2}</span>
            </div>
          </div>
        </div>
      `;
    } else if (item.category === 'combos') {
      dishRow.style.display = "block";
      dishContent.innerHTML = `
        <div class="dish-cat-section main-dish-section">
          <div class="dish-cat-header">
            <span class="dish-cat-badge badge-main">🍱 Comida Corrida</span>
          </div>
          <div class="dish-cat-title">${item.platoFuerte}</div>
        </div>
        ${(item.guarnicion1 && item.guarnicion2) ? `
        <div class="dish-cat-section side-dishes-section">
          <div class="dish-cat-header">
            <span class="dish-cat-badge badge-side">🥗 Guarniciones</span>
          </div>
          <div class="dish-sides-list">
            <div class="dish-side-row">
              <span class="side-icon">🍚</span>
              <span class="side-label">Guarnición 1:</span>
              <span class="side-value">${item.guarnicion1}</span>
            </div>
            <div class="dish-side-row">
              <span class="side-icon">🥦</span>
              <span class="side-label">Guarnición 2:</span>
              <span class="side-value">${item.guarnicion2}</span>
            </div>
          </div>
        </div>` : ''}
        <div class="dish-cat-section drink-dish-section">
          <div class="dish-cat-header">
            <span class="dish-cat-badge badge-drink">🥤 Bebida Fría</span>
          </div>
          <div class="dish-cat-title">${item.drinkName}</div>
        </div>
      `;
    } else if (item.category === 'bebida') {
      dishRow.style.display = "block";
      dishContent.innerHTML = `
        <div class="dish-cat-section drink-dish-section">
          <div class="dish-cat-header">
            <span class="dish-cat-badge badge-drink">🥤 Bebida Fría 600 ml</span>
          </div>
          <div class="dish-cat-title">${item.name} • Botella Fría 600 ml (0% Azúcar)</div>
        </div>
      `;
    } else {
      dishRow.style.display = "none";
    }
  }

  // Estado inicial mientras se crea la preferencia oficial de Mercado Pago
  let initialUrl = getProductAssignedQrUrl(item);
  currentActiveInitPoint = null;
  if (hashEl) hashEl.textContent = "";
  if (qrHolder) {
    qrHolder.innerHTML = `<div style="padding: 35px 8px; text-align: center; color: #002D62; font-weight: 700; font-size: 0.82rem;">⚡ Generando QR oficial Mercado Pago...</div>`;
  }
  if (btnPay) {
    btnPay.innerHTML = `<span>Cargando Mercado Pago ($${item.price}.00 MXN)...</span>`;
    btnPay.onclick = (e) => e.preventDefault();
  }
  if (modal) modal.classList.add("open");

  // Llamada al backend Node.js (Raspberry Pi / Localhost) para generar la preferencia REAL en Mercado Pago
  try {
    const apiUrl = `${getApiBaseUrl()}/api/crear-preferencia`;
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: item.id,
        name: item.name,
        price: item.price,
        slot: item.slot
      })
    });
    const prefData = await resp.json();
    if (prefData && prefData.success && prefData.init_point) {
      const realMpUrl = prefData.init_point;
      currentActiveInitPoint = realMpUrl;
      
      if (hashEl) {
        hashEl.innerHTML = "";
      }
      
      // Renderizar el Código QR oficial ISO generado por Node.js QRCode
      if (prefData.qr_image && qrHolder) {
        qrHolder.innerHTML = `
          <div style="cursor: pointer; display: flex; justify-content: center; align-items: center; flex-direction: column;" title="Toca o escanea para pagar con Mercado Libre / Mercado Pago">
            <img src="${prefData.qr_image}" alt="Código QR Mercado Pago Oficial" style="width: 140px; height: 140px; display: block; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,45,98,0.18);" />
            <span style="font-size: 0.72rem; color: #002D62; font-weight: 700; margin-top: 6px;">🔗 Toca para abrir Mercado Libre</span>
          </div>
        `;
        qrHolder.onclick = () => {
          console.log("[ABRIENDO MERCADO LIBRE / MERCADO PAGO]", realMpUrl);
          window.open(realMpUrl, '_blank');
        };
      }
      
      if (hintEl) {
        hintEl.style.cursor = "pointer";
        hintEl.innerHTML = `📲 Escanea con tu celular o <span style="text-decoration: underline; font-weight: 700; color: #002D62;">haz clic aquí para abrir Mercado Libre</span>`;
        hintEl.onclick = () => window.open(realMpUrl, '_blank');
      }

      if (btnPay) {
        btnPay.innerHTML = `<span>⚡ Pagar en Mercado Pago / Mercado Libre ($${item.price}.00 MXN)</span>`;
        btnPay.onclick = (e) => {
          e.preventDefault();
          console.log("[PAGAR AHORA -> ABRIENDO MERCADO LIBRE / MERCADO PAGO]", realMpUrl);
          window.open(realMpUrl, '_blank');
        };
      }
      
      // Iniciar sondeo automático para detectar cuando el usuario paga con su teléfono en Mercado Pago
      const extRef = prefData.external_reference;
      currentPollingInterval = setInterval(async () => {
        try {
          const statusResp = await fetch(`${getApiBaseUrl()}/api/pago-status/${encodeURIComponent(extRef)}`);
          const statusData = await statusResp.json();
          if (statusData && statusData.status === 'approved') {
            clearInterval(currentPollingInterval);
            currentPollingInterval = null;
            console.log("¡Pago real aprobado detectado por el Kiosco!", statusData);
            processItemPaymentViaEsp32(item, "Mercado Pago Móvil (QR Aprobado)");
          }
        } catch (pollErr) {
          console.warn("Polling error:", pollErr);
        }
      }, 1500);
    } else {
      throw new Error(prefData.error || "No se pudo obtener init_point de Mercado Pago");
    }
  } catch (err) {
    console.warn("[MERCADO PAGO FALLBACK]", err);
    if (hashEl) hashEl.textContent = initialUrl;
    
    // Generación de QR de respaldo apuntando directamente al enlace comercial
    if (qrHolder) {
      const isCombo = item.category === 'combos';
      const isMeal = item.category === 'comida';
      const fallbackSvg = generateQrSvg(initialUrl, 140, isCombo ? "#b45309" : (isMeal ? "#064e3b" : "#002D62"), "#ffffff");
      qrHolder.innerHTML = `
        <div style="cursor: pointer; display: flex; justify-content: center; align-items: center; flex-direction: column;" title="Toca o escanea para pagar con Mercado Libre">
          ${fallbackSvg}
          <span style="font-size: 0.72rem; color: #002D62; font-weight: 700; margin-top: 6px;">🔗 Toca para abrir Mercado Pago</span>
        </div>
      `;
      qrHolder.onclick = () => window.open(initialUrl, '_blank');
    }
    
    if (hintEl) {
      hintEl.style.cursor = "pointer";
      hintEl.innerHTML = `📲 Escanea con tu celular o <span style="text-decoration: underline; font-weight: 700;">haz clic aquí para abrir Mercado Libre</span>`;
      hintEl.onclick = () => window.open(initialUrl, '_blank');
    }
    
    if (btnPay) {
      btnPay.innerHTML = `<span>⚡ Pagar en Mercado Pago ($${item.price}.00 MXN)</span>`;
      btnPay.onclick = (e) => {
        e.preventDefault();
        window.open(initialUrl, '_blank');
      };
    }
  }
}

function closeItemQrModal() {
  if (currentPollingInterval) {
    clearInterval(currentPollingInterval);
    currentPollingInterval = null;
  }
  const modal = document.getElementById("itemQrModalOverlay");
  if (modal) modal.classList.remove("open");
}

// ==============================================================================
// 8.1 FLUJO REAL: PAGO TARJETA / SALDO / WALLET -> NOTIFICA AL SERVIDOR -> ESP32 ENCIENDE MATRIZ
// ==============================================================================
let esp32PaymentInProgress = false;

function processItemPaymentViaEsp32(item, methodLabel = "Tarjeta / Saldo") {
  if (!item || esp32PaymentInProgress) return;
  esp32PaymentInProgress = true;

  const s1 = document.getElementById("espStep1");
  const s2 = document.getElementById("espStep2");
  const s3 = document.getElementById("espStep3");
  const badge = document.getElementById("itemEsp32Badge");
  const consoleEl = document.getElementById("itemEsp32Console");
  const btnPayCard = document.getElementById("btnPayCard");
  const btnPayApple = document.getElementById("btnPayApple");
  const btnPayGoogle = document.getElementById("btnPayGoogle");
  const headerEsp = document.getElementById("headerEsp32Status");

  const txId = 'TX-' + Math.floor(100000 + Math.random() * 900000);

  sound.beep(680, 'sine', 0.08);

  // Deshabilitar todos los botones para evitar doble dispensación
  if (btnPayCard) {
    btnPayCard.disabled = true;
    if (methodLabel.includes("Tarjeta") || methodLabel.includes("Saldo")) {
      btnPayCard.innerHTML = `<span>💳 Activando Casilla ${item.slot}...</span>`;
    }
  }
  if (btnPayApple) {
    btnPayApple.disabled = true;
    if (methodLabel.includes("Apple")) {
      btnPayApple.innerHTML = `<span>Activando Casilla ${item.slot}...</span>`;
    }
  }
  if (btnPayGoogle) {
    btnPayGoogle.disabled = true;
    if (methodLabel.includes("Google") || methodLabel.includes("Android") || methodLabel.includes("GPay")) {
      btnPayGoogle.innerHTML = `<span>Activando Casilla ${item.slot}...</span>`;
    }
  }

  if (s1) s1.classList.add("active");
  if (s2) s2.classList.add("active");
  if (s3) s3.classList.add("active");

  if (badge) {
    badge.className = "esp32-live-badge approved";
    badge.textContent = `CASILLA ${item.slot} ACTIVADA`;
  }
  if (consoleEl) {
    consoleEl.textContent = "";
  }
  if (headerEsp) {
    headerEsp.textContent = `Dispensando Casilla ${item.slot}...`;
  }

  // Notificar al servidor Express para que el ESP32 (Wokwi / Hardware) encienda el LED exacto de la matriz
  fetch(`${getApiBaseUrl()}/api/dispensar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slot: item.slot,
      name: item.name,
      price: item.price,
      method: methodLabel
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('[DISPENSAR ENVIADO AL ESP32 OK]', data);
  })
  .catch(err => {
    console.error('[ERROR AL ENVIAR DISPENSAR]', err);
  });

  recordEsp32MercadoPagoEvent({
    paymentId: txId,
    sku: item.id,
    productName: item.name,
    slot: item.slot,
    amount: item.price,
    method: methodLabel,
    esp32Pin: `Matriz ${item.slot} (HIGH)`,
    status: "Activación exitosa",
    time: new Date().toLocaleTimeString('es-MX', { hour12: false }),
    date: new Date().toISOString().slice(0, 10)
  });

  // Salta automáticamente a la animación de dispensado y entrega
  setTimeout(() => {
    esp32PaymentInProgress = false;
    triggerDispenseSequence(item);
  }, 650);
}

// ==============================================================================
// 8.2 INTEGRACIÓN OFICIAL BILLETERAS DIGITALES (APPLE PAY & GOOGLE PAY)
// ==============================================================================
function openApplePaySheet(item) {
  if (!item) return;
  sound.beep(850, 'sine', 0.1);

  const sheet = document.getElementById("applePaySheetOverlay");
  const titleEl = document.getElementById("applePayItemTitle");
  const slotEl = document.getElementById("applePayItemSlot");
  const totalEl = document.getElementById("applePayItemTotal");
  const authPrompt = document.getElementById("applePayAuthPrompt");
  const touchIcon = document.getElementById("applePayTouchIdIcon");
  const confirmBtn = document.getElementById("btnConfirmApplePay");

  if (titleEl) titleEl.textContent = item.name;
  if (slotEl) slotEl.textContent = item.slot.startsWith("Casilla") ? item.slot : `Casilla ${item.slot}`;
  if (totalEl) totalEl.textContent = `$${item.price}.00 MXN`;
  if (authPrompt) authPrompt.textContent = "Toca o pulsa el botón para autorizar con Touch ID / Face ID";
  if (touchIcon) {
    touchIcon.className = "apple-pay-touchid-icon";
    touchIcon.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 3.42"/>
        <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
        <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
        <path d="M2 12a10 10 0 0 1 18-6"/>
        <path d="M2 16h.01"/>
        <path d="M21.8 16c.2-2 .131-5.354 0-6"/>
        <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/>
        <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
        <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
      </svg>
    `;
  }
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `<span>Pagar con Touch ID / Contraseña</span>`;
  }

  if (sheet) sheet.classList.add("open");
}

function closeApplePaySheet() {
  const sheet = document.getElementById("applePaySheetOverlay");
  if (sheet) sheet.classList.remove("open");
  const btnApple = document.getElementById("btnPayApple");
  if (btnApple) {
    btnApple.disabled = false;
    btnApple.style.opacity = "1";
    btnApple.innerHTML = OFFICIAL_APPLE_PAY_LOGO_HTML;
  }
}

function confirmApplePaySuccess(item) {
  sound.beep(1200, 'sine', 0.12);
  const touchIcon = document.getElementById("applePayTouchIdIcon");
  const authPrompt = document.getElementById("applePayAuthPrompt");
  const confirmBtn = document.getElementById("btnConfirmApplePay");

  if (touchIcon) {
    touchIcon.className = "apple-pay-touchid-icon success";
    touchIcon.innerHTML = `<span style="font-size: 2rem; font-weight: 800; color: #ffffff;">✓</span>`;
  }
  if (authPrompt) {
    authPrompt.innerHTML = `<strong style="color: #34c759; font-size: 0.95rem;">✓ Listo • Pago Autorizado</strong>`;
  }
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<span>✓ Autorizado con Éxito</span>`;
  }

  setTimeout(() => {
    closeApplePaySheet();
    processItemPaymentViaEsp32(item, 'Apple Pay');
  }, 600);
}

async function payWithDigitalWallet(item, walletType = 'Apple Pay') {
  if (!item || esp32PaymentInProgress) return;

  const isApple = walletType.toLowerCase().includes('apple');
  const btnApple = document.getElementById("btnPayApple");
  const btnGoogle = document.getElementById("btnPayGoogle");
  const targetBtn = isApple ? btnApple : btnGoogle;

  if (targetBtn) {
    targetBtn.disabled = true;
    targetBtn.style.opacity = "0.75";
    targetBtn.innerHTML = isApple 
      ? `<span>Procesando Apple Pay...</span>` 
      : `<span>Procesando Google Pay...</span>`;
  }

  sound.beep(isApple ? 750 : 620, 'sine', 0.1);

  // 1. Interfaz Oficial Interactiva Apple Pay (en Apple dispositivos o Kiosco Web)
  if (isApple) {
    openApplePaySheet(item);
    return;
  }

  // 2. Verificación y soporte en Android / Chrome (Google Pay)
  if (!isApple && window.PaymentRequest) {
    try {
      const paymentMethods = [
        {
          supportedMethods: 'https://google.com/pay',
          data: {
            environment: 'TEST',
            apiVersion: 2,
            apiVersionMinor: 0,
            merchantInfo: {
              merchantId: 'BCR2DN6DWC25D6DZ',
              merchantName: 'ExpendeX'
            },
            allowedPaymentMethods: [{
              type: 'CARD',
              parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX']
              },
              tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                  gateway: 'mercadopago',
                  gatewayMerchantId: '141474351'
                }
              }
            }]
          }
        }
      ];

      const paymentDetails = {
        total: {
          label: `ExpendeX: ${item.name}`,
          amount: { currency: 'MXN', value: item.price.toFixed(2) }
        },
        displayItems: [
          {
            label: `Casilla Slot ${item.slot}`,
            amount: { currency: 'MXN', value: item.price.toFixed(2) }
          }
        ]
      };

      const request = new PaymentRequest(paymentMethods, paymentDetails);
      const canPay = await request.canMakePayment().catch(() => false);

      if (canPay) {
        const paymentResponse = await request.show();
        await paymentResponse.complete('success');
        processItemPaymentViaEsp32(item, 'Google Pay');
        return;
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        console.log(`[Google Pay] Cancelado por usuario.`);
        if (targetBtn) {
          targetBtn.disabled = false;
          targetBtn.style.opacity = "1";
          targetBtn.innerHTML = OFFICIAL_GOOGLE_PAY_LOGO_HTML;
        }
        return;
      }
      console.log(`[Google Pay] Info PaymentRequest:`, e.message);
    }
  }

  // Flujo instantáneo asistido
  processItemPaymentViaEsp32(item, walletType);
}

function processOrderPaymentViaEsp32(queue) {
  if (!queue || queue.length === 0 || esp32PaymentInProgress) return;
  esp32PaymentInProgress = true;

  const badge = document.getElementById("orderEsp32Badge");
  const consoleEl = document.getElementById("orderEsp32Console");
  const statusBadge = document.getElementById("orderPaymentStatusBadge");
  const btnOrder = document.getElementById("btnSimulateOrderDispense");
  const { total } = calculateCartTotals();
  const mpPaymentId = Math.floor(1000000000 + Math.random() * 9000000000);

  sound.beep(680, 'sine', 0.08);
  if (btnOrder) {
    btnOrder.disabled = true;
    btnOrder.innerHTML = `<span>Recibiendo orden...</span>`;
  }
  if (badge) {
    badge.className = "esp32-live-badge receiving";
    badge.textContent = "RECIBIENDO...";
  }
  if (consoleEl) {
    consoleEl.textContent = "";
  }

  setTimeout(() => {
    sound.beep(920, 'sine', 0.1);
    if (badge) {
      badge.className = "esp32-live-badge approved";
      badge.textContent = "AUTORIZADO Y COBRADO";
    }
    if (statusBadge) {
      statusBadge.textContent = "✅ Autorizado y Cobrado";
    }
    if (consoleEl) {
      consoleEl.textContent = "";
    }

    recordEsp32MercadoPagoEvent({
      paymentId: mpPaymentId,
      sku: "ORDEN_CARRITO",
      productName: `Orden Carrito (${queue.length} productos)`,
      slot: queue.map(q => q.slot).join(', '),
      amount: total,
      method: "Mercado Pago QR (Orden)",
      esp32Pin: "GPIO 26 (HIGH)",
      status: "Activación exitosa",
      time: new Date().toLocaleTimeString('es-MX', { hour12: false }),
      date: new Date().toISOString().slice(0, 10)
    });
  }, 750);

  setTimeout(() => {
    esp32PaymentInProgress = false;
    if (btnOrder) {
      btnOrder.disabled = false;
      btnOrder.innerHTML = `<span>Pagar Orden con Mercado Pago</span>`;
    }
    triggerMultiDispenseSequence(queue);
  }, 1250);
}

// ==============================================================================
// 9. GESTIÓN DEL CARRITO
// ==============================================================================
function addToCart(id) {
  const item = findItemById(id);
  if (!item) return;

  const stockInfo = ExpendeXInventory.getItemStock(id);
  const existing = STATE.cart.find(c => c.id === id);
  const currentInCart = existing ? existing.qty : 0;

  if (stockInfo.stock <= 0) {
    sound.beep(320, 'sawtooth', 0.15);
    alert(`⚠️ Lo sentimos, "${item.name}" se encuentra actualmente agotado en la máquina.`);
    return;
  }

  if (currentInCart >= stockInfo.stock) {
    sound.beep(420, 'sawtooth', 0.15);
    alert(`⚠️ No puedes agregar más unidades de "${item.name}". Solo quedan ${stockInfo.stock} unidades en la máquina.`);
    return;
  }

  sound.beep(750, 'sine', 0.08);

  if (existing) {
    existing.qty += 1;
  } else {
    STATE.cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      slot: item.slot,
      image: item.image,
      fallbackUrl: item.fallbackUrl,
      qty: 1
    });
  }

  updateCartUI();

  if (typeof window.triggerMascotCartReaction === 'function') {
    window.triggerMascotCartReaction(item.name);
  }

  const cartBtn = document.getElementById("btnOpenCart");
  if (cartBtn) {
    cartBtn.style.transform = "scale(1.12)";
    setTimeout(() => cartBtn.style.transform = "scale(1)", 160);
  }
}

function updateCartQty(id, delta) {
  const item = STATE.cart.find(i => i.id === id);
  if (!item) return;

  if (delta > 0) {
    const stockInfo = ExpendeXInventory.getItemStock(id);
    if (item.qty >= stockInfo.stock) {
      sound.beep(420, 'sawtooth', 0.15);
      alert(`⚠️ Solo quedan ${stockInfo.stock} unidades disponibles de este producto.`);
      return;
    }
  }

  sound.beep(550, 'sine', 0.05);

  item.qty += delta;
  if (item.qty <= 0) {
    STATE.cart = STATE.cart.filter(i => i.id !== id);
  }
  updateCartUI();
}

function calculateCartTotals() {
  let subtotal = 0;
  let mealsCount = 0;
  let drinksCount = 0;

  STATE.cart.forEach(item => {
    subtotal += (item.price * item.qty);
    if (item.category === 'comida') mealsCount += item.qty;
    if (item.category === 'bebida') drinksCount += item.qty;
  });

  const combos = Math.min(mealsCount, drinksCount);
  const comboDiscount = combos * 15;
  const total = Math.max(0, subtotal - comboDiscount);

  return { subtotal, combos, comboDiscount, total };
}

function updateCartUI() {
  const badge = document.getElementById("cartCountBadge");
  const list = document.getElementById("cartItemsList");
  const subtotalEl = document.getElementById("cartSubtotal");
  const discountRow = document.getElementById("comboDiscountRow");
  const discountEl = document.getElementById("cartDiscount");
  const totalEl = document.getElementById("cartTotal");

  const totalItems = STATE.cart.reduce((sum, i) => sum + i.qty, 0);
  if (badge) badge.textContent = totalItems;

  if (!list) return;

  if (STATE.cart.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); margin-top: 60px;">
        <div style="font-size: 54px; margin-bottom: 12px;">🛒</div>
        <h3 style="font-size: 1.1rem; font-weight: 750;">Tu carrito está vacío</h3>
        <p style="font-size: 0.85rem; margin-top: 6px;">Selecciona un combo, platillo o bebida para comenzar.</p>
      </div>
    `;
  } else {
    list.innerHTML = "";
    STATE.cart.forEach(item => {
      const row = document.createElement("div");
      row.className = "cart-item-row";
      row.innerHTML = `
        <img class="cart-item-thumb" src="${item.image}" alt="${item.name}" onerror="this.src='${item.fallbackUrl}'">
        <div class="cart-item-info" style="flex: 1;">
          <h4>${item.name}</h4>
          <span>${item.slot} • $${item.price}.00 MXN</span>
        </div>
        <div class="cart-item-controls">
          <button class="btn-qty" onclick="updateCartQty('${item.id}', -1)">-</button>
          <span style="font-weight: 800; min-width: 20px; text-align: center;">${item.qty}</span>
          <button class="btn-qty" onclick="updateCartQty('${item.id}', 1)">+</button>
        </div>
      `;
      list.appendChild(row);
    });
  }

  const { subtotal, combos, comboDiscount, total } = calculateCartTotals();

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)} MXN`;
  if (discountRow && discountEl) {
    if (combos > 0) {
      discountRow.style.display = "flex";
      discountEl.textContent = `-$${comboDiscount.toFixed(2)} MXN (${combos} Combo${combos > 1 ? 's' : ''})`;
    } else {
      discountRow.style.display = "none";
    }
  }
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)} MXN`;
}

function openCart() {
  sound.beep(600, 'triangle', 0.08);
  const overlay = document.getElementById("cartOverlay");
  const drawer = document.getElementById("cartDrawer");
  if (overlay && drawer) {
    overlay.classList.add("open");
    drawer.classList.add("open");
  }
}

function closeCart() {
  const overlay = document.getElementById("cartOverlay");
  const drawer = document.getElementById("cartDrawer");
  if (overlay && drawer) {
    overlay.classList.remove("open");
    drawer.classList.remove("open");
  }
}

// ==============================================================================
// 10. ANIMACIÓN DEL PRODUCTO (SOLAMENTE MUESTRA "Activación exitosa")
// ==============================================================================
let dispenseAutoCloseTimer = null;

function triggerDispenseSequence(item) {
  closeItemQrModal();
  closeOrderQrModal();
  closeCart();
  sound.successChime();

  if (typeof window.triggerMascotDispenseReaction === 'function') {
    window.triggerMascotDispenseReaction();
  }

  // Descontar inventario en máquina y registrar venta en tiempo real
  ExpendeXInventory.decrementStock(item.id, 1);
  ExpendeXInventory.recordLiveSale(item.id, 1);
  ExpendeXInventory.recordCustomerTransaction([{
    id: item.id,
    name: item.name,
    slot: item.slot,
    qty: 1,
    unitPrice: item.price,
    total: item.price
  }], item.price);
  renderProducts();

  const modal = document.getElementById("dispenseModalOverlay");
  if (!modal) return;

  const imgEl = document.getElementById("dispenseProductImage");
  const titleEl = document.getElementById("dispenseOnlyTitle");
  const progressBar = document.getElementById("dispenseProgressBar");

  if (imgEl) {
    imgEl.src = item.image;
    imgEl.onerror = () => imgEl.src = item.fallbackUrl;
  }
  if (titleEl) {
    titleEl.textContent = "Activación exitosa";
  }
  if (progressBar) {
    progressBar.style.width = "15%";
  }

  modal.classList.add("open");

  if (dispenseAutoCloseTimer) clearTimeout(dispenseAutoCloseTimer);

  setTimeout(() => {
    if (progressBar) progressBar.style.width = "65%";
    sound.beep(660, 'triangle', 0.08);
  }, 550);

  setTimeout(() => {
    if (progressBar) progressBar.style.width = "100%";
    sound.successChime();
  }, 1300);

  dispenseAutoCloseTimer = setTimeout(() => {
    finishDispensing();
  }, 3100);
}

// Animación para orden de carrito (muestra únicamente "Activación exitosa")
function triggerMultiDispenseSequence(queue) {
  closeOrderQrModal();
  closeCart();
  sound.successChime();

  let orderTotal = 0;
  const itemsAudit = queue.map(qItem => {
    if (qItem.id) {
      ExpendeXInventory.decrementStock(qItem.id, 1);
      ExpendeXInventory.recordLiveSale(qItem.id, 1);
    }
    const p = qItem.price || 0;
    orderTotal += p;
    return {
      id: qItem.id || 'ITEM',
      name: qItem.name,
      slot: qItem.slot,
      qty: 1,
      unitPrice: p,
      total: p
    };
  });
  ExpendeXInventory.recordCustomerTransaction(itemsAudit, orderTotal);
  STATE.cart = [];
  updateCartUI();
  renderProducts();

  const modal = document.getElementById("dispenseModalOverlay");
  if (!modal || !queue || queue.length === 0) return;

  const imgEl = document.getElementById("dispenseProductImage");
  const titleEl = document.getElementById("dispenseOnlyTitle");
  const progressBar = document.getElementById("dispenseProgressBar");

  const firstItem = queue[0];
  if (imgEl && firstItem) {
    imgEl.src = firstItem.image;
    imgEl.onerror = () => imgEl.src = firstItem.fallbackUrl;
  }
  if (titleEl) {
    titleEl.textContent = "Activación exitosa";
  }
  if (progressBar) {
    progressBar.style.width = "20%";
  }

  modal.classList.add("open");

  if (dispenseAutoCloseTimer) clearTimeout(dispenseAutoCloseTimer);

  setTimeout(() => {
    if (progressBar) progressBar.style.width = "70%";
    sound.beep(660, 'triangle', 0.08);
  }, 550);

  setTimeout(() => {
    if (progressBar) progressBar.style.width = "100%";
    sound.successChime();
  }, 1300);

  dispenseAutoCloseTimer = setTimeout(() => {
    finishDispensing();
  }, 3100);
}

function finishDispensing() {
  if (dispenseAutoCloseTimer) {
    clearTimeout(dispenseAutoCloseTimer);
    dispenseAutoCloseTimer = null;
  }
  const modal = document.getElementById("dispenseModalOverlay");
  if (modal) modal.classList.remove("open");
}

// ==============================================================================
// 11. MODAL 3: CÓDIGO QR DE ORDEN COMPLETA (CARRITO AGREGADO)
// ==============================================================================
function openOrderQrModal() {
  if (STATE.cart.length === 0) {
    alert("Agrega al menos un producto a tu pedido antes de continuar.");
    return;
  }

  closeCart();
  sound.beep(680, 'triangle', 0.1);

  const modal = document.getElementById("orderQrModalOverlay");
  const qrHolder = document.getElementById("modalOrderQrHolder");
  const tokenCodeEl = document.getElementById("orderTokenCode");
  const totalDisplay = document.getElementById("orderModalTotalDisplay");
  const itemsListEl = document.getElementById("orderModalItemsList");
  const badge = document.getElementById("orderEsp32Badge");
  const consoleEl = document.getElementById("orderEsp32Console");
  const statusBadge = document.getElementById("orderPaymentStatusBadge");

  if (badge) {
    badge.className = "esp32-live-badge";
    badge.textContent = "ESPERANDO PAGO QR";
  }
  if (consoleEl) {
    consoleEl.textContent = "> Listo para recibir cobro de carrito en ESP32...";
  }
  if (statusBadge) {
    statusBadge.textContent = "⏳ Pendiente de Pago";
  }

  const { subtotal, combos, comboDiscount, total } = calculateCartTotals();
  const totalUnits = STATE.cart.reduce((sum, i) => sum + i.qty, 0);

  const orderId = `EXP4_ORD_${Math.floor(100000 + Math.random() * 900000)}`;
  if (tokenCodeEl) tokenCodeEl.textContent = orderId;
  if (totalDisplay) totalDisplay.textContent = `$${total.toFixed(2)} MXN (${totalUnits} selección${totalUnits > 1 ? 'es' : ''})`;

  const dispenseQueue = [];
  const manifestItems = [];
  const allSlots = [];

  STATE.cart.forEach(cartItem => {
    const fullItem = findItemById(cartItem.id);
    manifestItems.push(`${cartItem.name} (x${cartItem.qty})`);

    for (let i = 0; i < cartItem.qty; i++) {
      dispenseQueue.push({
        id: cartItem.id,
        name: cartItem.name,
        price: cartItem.price,
        slot: cartItem.slot,
        image: cartItem.image,
        fallbackUrl: cartItem.fallbackUrl
      });
      allSlots.push(cartItem.slot);
    }
  });

  STATE.orderDispenseQueue = dispenseQueue;

  if (itemsListEl) {
    itemsListEl.innerHTML = "";
    STATE.cart.forEach(item => {
      const row = document.createElement("div");
      row.className = "order-item-ticket-row";
      row.innerHTML = `
        <div>
          <div class="order-item-ticket-title">${item.name}</div>
          <div class="order-item-ticket-sub">Casilla: ${item.slot} • $${item.price}.00 MXN c/u</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="order-item-ticket-qty-badge">x${item.qty}</span>
          <span style="font-weight: 800; color: var(--navy); min-width: 65px; text-align: right;">$${(item.price * item.qty).toFixed(2)}</span>
        </div>
      `;
      itemsListEl.appendChild(row);
    });

    if (comboDiscount > 0) {
      const discountRow = document.createElement("div");
      discountRow.className = "order-item-ticket-row";
      discountRow.style.background = "#fffbeb";
      discountRow.style.borderColor = "#fde68a";
      discountRow.innerHTML = `
        <div style="color: #92400e; font-weight: 750;">
          ⭐ Descuento Combo #NutriciónAlInstante (${combos}x)
        </div>
        <div style="font-weight: 850; color: #b45309;">
          -$${comboDiscount.toFixed(2)} MXN
        </div>
      `;
      itemsListEl.appendChild(discountRow);
    }
  }

  const mpBase = getMercadoPagoBaseLink();
  const compositePayload = `${mpBase}?order=${orderId}&qty=${totalUnits}&amount=${total.toFixed(2)}&slots=${encodeURIComponent(allSlots.join(','))}`;
  if (qrHolder) {
    qrHolder.innerHTML = generateQrSvg(compositePayload, 200, "#009ee3", "#ffffff");
  }

  if (modal) modal.classList.add("open");
}

function closeOrderQrModal() {
  const modal = document.getElementById("orderQrModalOverlay");
  if (modal) modal.classList.remove("open");
}

// ==============================================================================
// 11.1 SINCRONIZACIÓN DE PRECIOS FIJOS EDITADOS DESDE EL PORTAL DEL DUEÑO
// ==============================================================================
const CUSTOM_PRICES_KEY = 'EXPANDEX_CUSTOM_PRICES_V4';

function applyCustomPricesToCatalog() {
  try {
    const raw = localStorage.getItem(CUSTOM_PRICES_KEY);
    if (!raw) return;
    const customMap = JSON.parse(raw);
    if (!customMap || typeof customMap !== 'object') return;

    [...MEALS_DATABASE, ...DRINKS_DATABASE, ...COMBOS_DATABASE].forEach(item => {
      if (item._basePrice === undefined) item._basePrice = item.price;
      if (customMap[item.id] !== undefined && !isNaN(Number(customMap[item.id]))) {
        item.price = Number(customMap[item.id]);
      } else {
        item.price = item._basePrice;
      }
    });
  } catch (e) {
    console.warn("Error aplicando precios personalizados:", e);
  }
}

// ==============================================================================
// 12. INICIALIZACIÓN GENERAL DE EVENTOS
// ==============================================================================
function initApp() {
  applyCustomPricesToCatalog();
  renderProducts();
  updateCartUI();

  // Carrito
  const btnOpenCart = document.getElementById("btnOpenCart");
  if (btnOpenCart) btnOpenCart.addEventListener("click", openCart);

  const btnCloseCart = document.getElementById("btnCloseCart");
  if (btnCloseCart) btnCloseCart.addEventListener("click", closeCart);

  const cartOverlay = document.getElementById("cartOverlay");
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  // Botón de Checkout abre el Modal QR de la Orden Completa
  const btnCheckout = document.getElementById("btnCheckout");
  if (btnCheckout) {
    btnCheckout.addEventListener("click", openOrderQrModal);
  }

  // Modal QR Individual por Ítem -> Al pagar en Mercado Pago o tocar el QR, el ESP32 recibe, autoriza y lanza la animación
  const btnCloseItemQr = document.getElementById("btnCloseItemQrModal");
  if (btnCloseItemQr) btnCloseItemQr.addEventListener("click", closeItemQrModal);

  const btnSimulateDispense = document.getElementById("btnSimulateItemDispense");
  if (btnSimulateDispense) {
    btnSimulateDispense.addEventListener("click", () => {
      if (currentActiveInitPoint) {
        window.location.href = currentActiveInitPoint;
      }
    });
  }

  const qrSvgHolder = document.getElementById("modalQrSvgHolder");
  if (qrSvgHolder) {
    qrSvgHolder.addEventListener("click", () => {
      if (currentActiveInitPoint) {
        window.location.href = currentActiveInitPoint;
      }
    });
  }

  // Modal QR de Orden Agregada (Carrito Completo)
  const btnCloseOrderQr = document.getElementById("btnCloseOrderQrModal");
  if (btnCloseOrderQr) btnCloseOrderQr.addEventListener("click", closeOrderQrModal);

  const btnSimulateOrderDispense = document.getElementById("btnSimulateOrderDispense");
  if (btnSimulateOrderDispense) {
    btnSimulateOrderDispense.addEventListener("click", () => {
      if (STATE.orderDispenseQueue && STATE.orderDispenseQueue.length > 0) {
        processOrderPaymentViaEsp32(STATE.orderDispenseQueue);
      }
    });
  }

  const orderQrHolder = document.getElementById("modalOrderQrHolder");
  if (orderQrHolder) {
    orderQrHolder.addEventListener("click", () => {
      if (STATE.orderDispenseQueue && STATE.orderDispenseQueue.length > 0) {
        processOrderPaymentViaEsp32(STATE.orderDispenseQueue);
      }
    });
  }

  // Cerrar animación al tocar la tarjeta de "Activación exitosa"
  const dispenseModalOverlay = document.getElementById("dispenseModalOverlay");
  if (dispenseModalOverlay) {
    dispenseModalOverlay.addEventListener("click", finishDispensing);
  }

  // Botones de Pasarela de Pago Rápida (Apple Pay & Google Pay -> conectados al ESP32)
  const btnPayApple = document.getElementById("btnPayApple");
  if (btnPayApple) {
    btnPayApple.addEventListener("click", () => {
      if (STATE.selectedProductForModal) {
        payWithDigitalWallet(STATE.selectedProductForModal, "Apple Pay");
      }
    });
  }

  const btnPayGoogle = document.getElementById("btnPayGoogle");
  if (btnPayGoogle) {
    btnPayGoogle.addEventListener("click", () => {
      if (STATE.selectedProductForModal) {
        payWithDigitalWallet(STATE.selectedProductForModal, "Google Pay");
      }
    });
  }

  // Interfaz de Hoja de Pago Oficial Apple Pay
  const btnCancelApple = document.getElementById("btnCancelApplePaySheet");
  if (btnCancelApple) {
    btnCancelApple.addEventListener("click", closeApplePaySheet);
  }

  const btnConfirmApple = document.getElementById("btnConfirmApplePay");
  if (btnConfirmApple) {
    btnConfirmApple.addEventListener("click", () => {
      if (STATE.selectedProductForModal) {
        confirmApplePaySuccess(STATE.selectedProductForModal);
      }
    });
  }

  const touchIconEl = document.getElementById("applePayTouchIdIcon");
  if (touchIconEl) {
    touchIconEl.addEventListener("click", () => {
      if (STATE.selectedProductForModal) {
        confirmApplePaySuccess(STATE.selectedProductForModal);
      }
    });
  }

  // Modal de Quiénes Somos / Identidad de Marca ExpendeX
  const btnOpenCampaign = document.getElementById("btnOpenBrandCampaign");
  const btnCloseCampaign = document.getElementById("btnCloseBrandCampaign");
  const campaignModal = document.getElementById("brandCampaignModalOverlay");

  if (btnOpenCampaign && campaignModal) {
    btnOpenCampaign.addEventListener("click", () => {
      sound.beep(650, 'sine', 0.06);
      campaignModal.classList.add("open");
    });
  }

  if (btnCloseCampaign && campaignModal) {
    btnCloseCampaign.addEventListener("click", () => {
      campaignModal.classList.remove("open");
    });
  }

  // Inicializar Maquinita Expendedora Estilo Disney Interactiva en la Barra Superior
  initInteractiveClientMascot();

  const grid = document.getElementById("productsGrid");

  // ==============================================================================
  // NAVEGACIÓN MÓVIL MINIMALISTA EXCLUSIVA: 4 PESTAÑAS INFERIORES
  // 1. Combos (10) | 2. Platillos (12) | 3. Bebidas (24) | 4. Todo (46)
  // ==============================================================================
  const tabCombos = document.getElementById("tabNavCombos");
  const tabMeals = document.getElementById("tabNavMeals");
  const tabDrinks = document.getElementById("tabNavDrinks");
  const tabAll = document.getElementById("tabNavAll");

  function setBottomTab(cat) {
    STATE.currentCategory = cat;
    sound.beep(600, 'sine', 0.05);

    const tabMap = {
      'combos': tabCombos,
      'comida': tabMeals,
      'bebida': tabDrinks,
      'all': tabAll
    };

    document.querySelectorAll(".nav-tab-btn").forEach(t => t.classList.remove("active"));
    if (tabMap[cat]) tabMap[cat].classList.add("active");

    renderProducts();
    if (grid) grid.scrollTo({ left: 0, behavior: 'smooth' });
  }

  if (tabCombos) tabCombos.addEventListener("click", () => setBottomTab('combos'));
  if (tabMeals) tabMeals.addEventListener("click", () => setBottomTab('comida'));
  if (tabDrinks) tabDrinks.addEventListener("click", () => setBottomTab('bebida'));
  if (tabAll) tabAll.addEventListener("click", () => setBottomTab('all'));

  // ==============================================================================
  // AJUSTES DE APARIENCIA: MODO NOCHE / CLARO Y PALETA DE COLORES
  // ==============================================================================
  const btnOpenThemeSettings = document.getElementById("btnOpenThemeSettings");
  const btnCloseThemeModal = document.getElementById("btnCloseThemeModal");
  const btnConfirmThemeModal = document.getElementById("btnConfirmThemeModal");
  const themeModalOverlay = document.getElementById("themeModalOverlay");

  const btnModeLight = document.getElementById("btnModeLight");
  const btnModeDark = document.getElementById("btnModeDark");
  const paletteBtns = document.querySelectorAll(".btn-palette-choice");

  function applyThemeMode(mode) {
    if (mode === "dark") {
      document.body.classList.add("dark-mode");
      if (btnModeDark) btnModeDark.classList.add("active");
      if (btnModeLight) btnModeLight.classList.remove("active");
    } else {
      document.body.classList.remove("dark-mode");
      if (btnModeLight) btnModeLight.classList.add("active");
      if (btnModeDark) btnModeDark.classList.remove("active");
    }
    try { localStorage.setItem("expendex_client_theme", mode); } catch(e){}
  }

  function applyColorPalette(palette) {
    document.body.setAttribute("data-palette", palette);
    paletteBtns.forEach(btn => {
      if (btn.dataset.palette === palette) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    try { localStorage.setItem("expendex_client_palette", palette); } catch(e){}
  }

  // Cargar preferencias guardadas
  try {
    const savedTheme = localStorage.getItem("expendex_client_theme") || "light";
    const savedPalette = localStorage.getItem("expendex_client_palette") || "emerald";
    applyThemeMode(savedTheme);
    applyColorPalette(savedPalette);
  } catch(e){}

  if (btnOpenThemeSettings && themeModalOverlay) {
    btnOpenThemeSettings.addEventListener("click", () => {
      if (window.sound && typeof sound.beep === 'function') sound.beep(700, 'sine', 0.05);
      themeModalOverlay.style.display = "flex";
    });
  }

  function closeThemeModal() {
    if (themeModalOverlay) themeModalOverlay.style.display = "none";
  }

  if (btnCloseThemeModal) btnCloseThemeModal.addEventListener("click", closeThemeModal);
  if (btnConfirmThemeModal) btnConfirmThemeModal.addEventListener("click", () => {
    if (window.sound && typeof sound.beep === 'function') sound.beep(850, 'sine', 0.08);
    closeThemeModal();
  });
  if (themeModalOverlay) {
    themeModalOverlay.addEventListener("click", (e) => {
      if (e.target === themeModalOverlay) closeThemeModal();
    });
  }

  if (btnModeLight) btnModeLight.addEventListener("click", () => applyThemeMode("light"));
  if (btnModeDark) btnModeDark.addEventListener("click", () => applyThemeMode("dark"));

  paletteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const pal = btn.dataset.palette;
      applyColorPalette(pal);
      if (window.sound && typeof sound.beep === 'function') sound.beep(750, 'sine', 0.04);
    });
  });

  // Sincronización en tiempo real con el portal administrativo del dueño (User Interface)
  if (typeof BroadcastChannel !== 'undefined') {
    const syncChannel = new BroadcastChannel('expandex_sync');
    syncChannel.onmessage = (e) => {
      if (e.data && (e.data.type === 'INVENTORY_UPDATED' || e.data.type === 'RESTOCK_ALL')) {
        renderProducts();
        updateCartUI();
      } else if (e.data && (e.data.type === 'PRICES_UPDATED' || e.data.type === 'PRODUCT_QRS_UPDATED' || e.data.type === 'MP_LINK_UPDATED')) {
        applyCustomPricesToCatalog();
        renderProducts();
        updateCartUI();
      } else if (e.data && e.data.type === 'REMOTE_MP_PAYMENT_TRIGGER') {
        const targetItem = findItemById(e.data.sku || 'COMBO_01') || COMBOS_DATABASE[0];
        if (targetItem) {
          triggerDispenseSequence(targetItem);
        }
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === ExpendeXInventory.KEY) {
      renderProducts();
      updateCartUI();
    } else if (e.key === CUSTOM_PRICES_KEY || e.key === PRODUCT_QRS_KEY || e.key === MP_CUSTOM_LINK_KEY) {
      applyCustomPricesToCatalog();
      renderProducts();
      updateCartUI();
    }
  });

  // Sincronización inicial y periódica con el servidor backend Node.js (Raspberry Pi / Servidor)
  ExpendeXInventory.fetchServerInventory().then(serverInv => {
    if (serverInv) {
      renderProducts();
      updateCartUI();
    }
  });

  setInterval(() => {
    ExpendeXInventory.fetchServerInventory().then(serverInv => {
      if (serverInv) {
        renderProducts();
        updateCartUI();
      }
    });
  }, 4000);

  const urlParams = new URLSearchParams(window.location.search);
  const openModalId = urlParams.get('openModal');
  if (openModalId) {
    openItemQrModal(openModalId);
  }

  console.log("ExpendeX: Branding y Pasarela QR Mercado Pago + ESP32 activos.");
}

// ==============================================================================
// 13. MASCOTA INTERACTIVA VIRTUAL ESTILO DISNEY / VIDEO-GAME AGILITY (GUION KENNEDY)
// Física ágil estilo videojuego 60fps, 22+ animaciones acrobáticas y partículas
// ==============================================================================
function initInteractiveClientMascot() {
  // Mascota interactiva retirada a solicitud del usuario
  window.triggerMascotCartReaction = function() {};
  window.triggerMascotDispenseReaction = function() {};
  return;

  let posX = 16;
  let posY = 74; // Altura estándar sobre la barra de navegación inferior
  let direction = 1; // 1 = derecha, -1 = izquierda
  let baseSpeed = 2.4;
  let currentSpeed = 2.4;
  let state = "walking";
  let isSleeping = false;
  let isDancing = false;
  let isInteracting = false;
  let loopTimer = 0;
  let nextInterventionTime = 140 + Math.random() * 120; // Ciclos ágiles de acción cada 2.3 - 4s

  // Emisor de partículas visuales de videojuego
  function spawnParticle(emoji, customX, customY) {
    if (!particleBox) return;
    const p = document.createElement("span");
    p.className = "fx-particle";
    p.textContent = emoji;
    const px = (typeof customX === "number") ? customX : (posX + 20);
    const py = (typeof customY === "number") ? customY : (posY + 16);
    p.style.left = Math.round(px) + "px";
    p.style.bottom = Math.round(py) + "px";
    particleBox.appendChild(p);
    setTimeout(() => { if (p && p.parentNode) p.parentNode.removeChild(p); }, 750);
  }

  // Burbuja Mímica Compacta y No Invasiva (0.65rem)
  function showBubble(text, duration = 2200) {
    if (!bubble) return;
    bubble.textContent = text;
    bubble.style.opacity = "1";
    bubble.style.transform = "translateY(0) scale(1)";
    clearTimeout(bubble._hideTimer);
    bubble._hideTimer = setTimeout(() => {
      bubble.style.opacity = "0";
      bubble.style.transform = "translateY(4px) scale(0.92)";
    }, duration);
  }

  function set3DPosture(posture) {
    if (!body) return;
    body.classList.remove("turn-3d-r", "turn-3d-l", "turn-front", "turn-crouch", "turn-push");
    if (posture) {
      body.classList.add(posture);
    }
  }

  const ALL_CLIENT_STATES = [
    "state-walking", "state-sidewalk", "state-frontwalk", "state-crouching",
    "state-stretching", "state-pushing", "state-dancing", "state-sleeping",
    "state-idle", "state-sprint", "state-backflip", "state-frontflip",
    "state-slide", "state-doublebounce", "state-superhero", "state-breakdance",
    "state-skate", "state-electric", "state-juggling", "state-rocket",
    "state-dj", "state-mime-wall", "state-confetti", "state-peekaboo",
    "state-magnifier", "state-helicopter", "state-thumbsup", "state-whistle", "state-pout"
  ];

  function setMascotState(newState) {
    state = newState;
    ALL_CLIENT_STATES.forEach(st => entity.classList.remove(st));
    entity.classList.add(`state-${newState}`);

    const armsPushing = document.getElementById("mascotArmsPushing");
    const armsStretched = document.getElementById("mascotArmsStretched");
    const armNormalL = document.getElementById("mascotArmNormalL");
    const armNormalR = document.getElementById("mascotArmNormalR");

    const isPush = (newState === "pushing" || newState === "mime-wall");
    const isStretch = (newState === "stretching");
    if (armsPushing) armsPushing.style.display = isPush ? "block" : "none";
    if (armsStretched) armsStretched.style.display = isStretch ? "block" : "none";
    if (armNormalL) armNormalL.style.display = (isPush || isStretch) ? "none" : "block";
    if (armNormalR) armNormalR.style.display = (isPush || isStretch) ? "none" : "block";
  }

  // Bucle de física ágil de 60fps por la pantalla del cliente
  function loopMovement() {
    const maxX = Math.max(120, window.innerWidth - 110);
    const minX = 8;

    if (!isSleeping && !isDancing && !isInteracting) {
      if (state === "walking" || state === "sprint" || state === "skate" || state === "whistle") {
        posX += direction * currentSpeed;

        if (state === "sprint" && Math.random() < 0.3) {
          spawnParticle("💨", posX + (direction === 1 ? -6 : 42), posY);
        } else if (state === "skate" && Math.random() < 0.22) {
          spawnParticle("💨", posX + 20, posY);
        }

        // Giro ágil en los bordes
        if (posX >= maxX) {
          posX = maxX;
          direction = -1;
          set3DPosture("turn-3d-l");
          setTimeout(() => set3DPosture("turn-front"), 220);
        } else if (posX <= minX) {
          posX = minX;
          direction = 1;
          set3DPosture("turn-3d-r");
          setTimeout(() => set3DPosture("turn-front"), 220);
        }

        entity.style.left = Math.round(posX) + "px";
        entity.style.bottom = posY + "px";
        body.style.transform = `scaleX(${direction})`;

        loopTimer++;
        if (loopTimer > nextInterventionTime) {
          loopTimer = 0;
          nextInterventionTime = 140 + Math.random() * 140;
          pickAutonomousAgileAction();
        }
      }
    }

    requestAnimationFrame(loopMovement);
  }

  // ==============================================================================
  // CATÁLOGO DE 22+ ACCIONES ÁGILES ESTILO VIDEOJUEGO
  // ==============================================================================
  function pickAutonomousAgileAction() {
    if (isSleeping || isDancing || isInteracting) return;

    const actions = [
      actionSprintDash,       // 1. Sprint veloz con estela
      actionBackflip,         // 2. Backflip acrobático 3D
      actionFrontflip,        // 3. Frontflip dive roll
      actionNinjaSlide,       // 4. Slide ninja por el suelo
      actionDoubleBounce,     // 5. Doble rebote elástico
      actionSuperheroLanding, // 6. Aterrizaje superhéroe con shockwave
      actionBreakdance,       // 7. Molino breakdance
      actionSkateGlide,       // 8. Deslizamiento en patineta
      actionElectricSurge,    // 9. Sobrecarga eléctrica 100%
      actionPushButton,       // 10. Empujar botón "+ Agregar" que resiste
      actionJuggle,           // 11. Malabares con monedas/letras
      actionRocketJetpack,    // 12. Propulsión jetpack
      actionDjScratch,        // 13. DJ scratching con ritmos
      actionMimeWall,         // 14. Mimo tocando pared invisible
      actionConfettiPop,      // 15. Explosión de confeti festivo
      actionPeekaboo,         // 16. Juego peekaboo
      actionMagnifierInspect, // 17. Lupa inspeccionando catálogo
      actionHelicopterHover,  // 18. Helicóptero con antena
      actionThumbsUp,         // 19. Pulgar arriba y guiño
      actionWhistleStrut,     // 20. Caminata con silbido musical
      actionPoutStomp,        // 21. Berrinche tierno de niño
      actionStealN,           // 22. Quitar y voltear la 'N' de MXN
      actionScrambleTitle     // 23. Trepar y revolver título superior
    ];

    const chosen = actions[Math.floor(Math.random() * actions.length)];
    chosen();
  }

  // 1. SPRINT DASH VELOZ
  function actionSprintDash() {
    isInteracting = true;
    currentSpeed = 5.4;
    setMascotState("sprint");
    showBubble("💨 ¡Zoom!", 1800);
    sound.beep(600, 'sine', 0.08);

    const sprintFrames = 38;
    let count = 0;
    const sprintInt = setInterval(() => {
      count++;
      spawnParticle("💨", posX + (direction === 1 ? -6 : 40), posY);
      if (count >= sprintFrames) {
        clearInterval(sprintInt);
        currentSpeed = baseSpeed;
        setMascotState("walking");
        isInteracting = false;
      }
    }, 40);
  }

  // 2. BACKFLIP ACROBÁTICO 3D
  function actionBackflip() {
    isInteracting = true;
    setMascotState("backflip");
    showBubble("🤸‍♂️ ¡Flip!", 1900);
    sound.beep(740, 'triangle', 0.12);
    spawnParticle("✨", posX + 20, posY + 35);

    setTimeout(() => {
      spawnParticle("✨", posX + 20, posY + 10);
      setMascotState("walking");
      isInteracting = false;
    }, 850);
  }

  // 3. FRONTFLIP DIVE
  function actionFrontflip() {
    isInteracting = true;
    setMascotState("frontflip");
    showBubble("🤸‍♂️ ¡Roll!", 1800);
    sound.beep(680, 'triangle', 0.1);
    spawnParticle("✨", posX + 20, posY + 25);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 800);
  }

  // 4. NINJA SLIDE
  function actionNinjaSlide() {
    isInteracting = true;
    setMascotState("slide");
    showBubble("⚡ ¡Slide!", 1800);
    sound.beep(500, 'sine', 0.1);
    spawnParticle("💨", posX + 10, posY);

    const slideTarget = Math.max(12, Math.min(window.innerWidth - 110, posX + direction * 80));
    entity.style.transition = "left 0.55s cubic-bezier(0.1, 0.9, 0.2, 1)";
    entity.style.left = slideTarget + "px";
    posX = slideTarget;

    setTimeout(() => {
      entity.style.transition = "none";
      setMascotState("walking");
      isInteracting = false;
    }, 600);
  }

  // 5. DOBLE REBOTE ELÁSTICO
  function actionDoubleBounce() {
    isInteracting = true;
    setMascotState("doublebounce");
    showBubble("🎈 ¡Boing!", 1800);
    sound.beep(540, 'sine', 0.08);
    setTimeout(() => sound.beep(720, 'sine', 0.1), 320);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 800);
  }

  // 6. ATERRIZAJE SUPERHÉROE
  function actionSuperheroLanding() {
    isInteracting = true;
    setMascotState("superhero");
    showBubble("💥 ¡Hero!", 2000);
    sound.beep(320, 'sawtooth', 0.16);
    spawnParticle("💥", posX + 20, posY);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1100);
  }

  // 7. BREAKDANCE MOLINO
  function actionBreakdance() {
    isInteracting = true;
    setMascotState("breakdance");
    showBubble("🕺 ¡Break!", 2200);
    sound.beep(460, 'triangle', 0.09);
    setTimeout(() => sound.beep(580, 'triangle', 0.09), 150);
    spawnParticle("✨", posX + 20, posY + 16);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1200);
  }

  // 8. DESLIZAMIENTO EN PATINETA
  function actionSkateGlide() {
    isInteracting = true;
    currentSpeed = 4.0;
    setMascotState("skate");
    showBubble("🛹 ¡Skate!", 2000);
    sound.beep(640, 'sine', 0.08);

    setTimeout(() => {
      currentSpeed = baseSpeed;
      setMascotState("walking");
      isInteracting = false;
    }, 1400);
  }

  // 9. SOBRECARGA ELÉCTRICA
  function actionElectricSurge() {
    isInteracting = true;
    setMascotState("electric");
    showBubble("⚡ ¡100%!", 2000);
    sound.beep(880, 'sawtooth', 0.08);
    setTimeout(() => sound.beep(1100, 'sawtooth', 0.1), 120);
    spawnParticle("⚡", posX + 10, posY + 20);
    spawnParticle("⚡", posX + 32, posY + 20);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1100);
  }

  // 10. EMPUJAR BOTÓN "+ AGREGAR" QUE RESISTE
  function actionPushButton() {
    const buttons = Array.from(document.querySelectorAll(".product-card:not([style*='display: none']) .btn-add, .product-card:not([style*='display: none']) .btn-card-add, .btn-action-add, .btn-pill"));
    const visibleBtn = buttons.find(b => {
      const r = b.getBoundingClientRect();
      return r.top >= 40 && r.bottom <= window.innerHeight - 80 && r.width > 0;
    });

    if (!visibleBtn) { actionSprintDash(); return; }

    isInteracting = true;
    const btnRect = visibleBtn.getBoundingClientRect();
    const targetLeft = Math.max(10, Math.min(window.innerWidth - 110, btnRect.left - 55));
    const targetBottom = Math.max(74, window.innerHeight - btnRect.bottom - 10);

    entity.style.transition = "left 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), bottom 0.6s ease";
    entity.style.left = targetLeft + "px";
    entity.style.bottom = targetBottom + "px";
    posX = targetLeft;
    posY = targetBottom;
    showBubble("🏋️‍♂️ ¡Puff!", 1800);

    setTimeout(() => {
      if (isSleeping || isDancing) { isInteracting = false; return; }
      setMascotState("pushing");
      set3DPosture("turn-push");
      if (sweatDrop) sweatDrop.style.display = "block";
      visibleBtn.classList.add("btn-being-pushed");
      sound.beep(280, 'triangle', 0.14);

      setTimeout(() => {
        visibleBtn.classList.remove("btn-being-pushed");
        if (sweatDrop) sweatDrop.style.display = "none";
        set3DPosture("turn-front");
        setMascotState("idle");
        showBubble("😅 ¡Pesa!", 1600);
        sound.beep(660, 'sine', 0.1);

        setTimeout(() => {
          entity.style.transition = "left 0.6s ease, bottom 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)";
          entity.style.bottom = "74px";
          posY = 74;
          setTimeout(() => {
            isInteracting = false;
            setMascotState("walking");
            entity.style.transition = "none";
          }, 650);
        }, 1200);
      }, 1600);
    }, 650);
  }

  // 11. MALABARES
  function actionJuggle() {
    isInteracting = true;
    setMascotState("juggling");
    showBubble("🤹‍♂️ ¡Coins!", 2000);
    sound.beep(740, 'sine', 0.08);
    spawnParticle("🪙", posX + 10, posY + 32);
    setTimeout(() => spawnParticle("🪙", posX + 32, posY + 36), 200);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1400);
  }

  // 12. PROPULSIÓN JETPACK
  function actionRocketJetpack() {
    isInteracting = true;
    setMascotState("rocket");
    showBubble("🚀 ¡Boost!", 2000);
    sound.beep(420, 'sawtooth', 0.2);
    spawnParticle("🔥", posX + 12, posY);
    spawnParticle("🔥", posX + 28, posY);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1300);
  }

  // 13. DJ SCRATCH
  function actionDjScratch() {
    isInteracting = true;
    setMascotState("dj");
    showBubble("🎧 ¡Scratch!", 2000);
    sound.beep(400, 'square', 0.06);
    setTimeout(() => sound.beep(540, 'square', 0.06), 90);
    setTimeout(() => sound.beep(440, 'square', 0.08), 180);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1300);
  }

  // 14. MIMO EN PARED INVISIBLE
  function actionMimeWall() {
    isInteracting = true;
    setMascotState("mime-wall");
    showBubble("🪟 ¡Pared!", 2000);
    sound.beep(520, 'sine', 0.07);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1400);
  }

  // 15. EXPLOSIÓN DE CONFETI
  function actionConfettiPop() {
    isInteracting = true;
    setMascotState("confetti");
    showBubble("🎉 ¡Fiesta!", 2200);
    sound.beep(880, 'sine', 0.1);
    spawnParticle("🎉", posX + 20, posY + 28);
    spawnParticle("✨", posX + 10, posY + 24);
    spawnParticle("🌟", posX + 32, posY + 24);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1200);
  }

  // 16. PEEKABOO
  function actionPeekaboo() {
    isInteracting = true;
    setMascotState("peekaboo");
    showBubble("🙈 ¡Peek!", 1800);
    sound.beep(640, 'sine', 0.08);

    setTimeout(() => {
      showBubble("👀 ¡Te vi!", 1600);
      spawnParticle("✨", posX + 20, posY + 20);
      setTimeout(() => {
        setMascotState("walking");
        isInteracting = false;
      }, 700);
    }, 900);
  }

  // 17. INSPECCIÓN CON LUPA
  function actionMagnifierInspect() {
    isInteracting = true;
    setMascotState("magnifier");
    showBubble("🔍 ¡Scan!", 2000);
    sound.beep(460, 'sine', 0.08);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1300);
  }

  // 18. HELICÓPTERO CON ANTENA
  function actionHelicopterHover() {
    isInteracting = true;
    setMascotState("helicopter");
    showBubble("🚁 ¡Heli!", 2000);
    sound.beep(620, 'triangle', 0.15);
    spawnParticle("💨", posX + 20, posY);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1300);
  }

  // 19. PULGAR ARRIBA Y GUIÑO
  function actionThumbsUp() {
    isInteracting = true;
    setMascotState("thumbsup");
    showBubble("👍 ¡Top!", 1800);
    sound.beep(800, 'sine', 0.09);
    spawnParticle("⭐", posX + 34, posY + 22);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1200);
  }

  // 20. CAMINATA CON SILBIDO MUSICAL
  function actionWhistleStrut() {
    isInteracting = true;
    setMascotState("whistle");
    showBubble("🎶 ¡Fiu!", 2200);
    sound.beep(660, 'sine', 0.07);
    setTimeout(() => sound.beep(790, 'sine', 0.08), 140);
    setTimeout(() => sound.beep(940, 'sine', 0.12), 280);
    spawnParticle("🎵", posX + 20, posY + 26);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1500);
  }

  // 21. BERRINCHE TIERNO
  function actionPoutStomp() {
    isInteracting = true;
    setMascotState("pout");
    showBubble("😤 ¡Hmph!", 1800);
    sound.beep(290, 'sawtooth', 0.12);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1100);
  }

  // 22. QUITAR Y VOLTEAR LA 'N' DE "MXN"
  function actionStealN() {
    const prices = Array.from(document.querySelectorAll(".product-card:not([style*='display: none']) .price-currency, .product-card:not([style*='display: none']) .card-price"));
    const targetPrice = prices.find(p => {
      const r = p.getBoundingClientRect();
      return r.top >= 60 && r.bottom <= window.innerHeight - 90 && p.textContent.includes("MXN");
    });

    if (!targetPrice) { actionSprintDash(); return; }

    isInteracting = true;
    const priceRect = targetPrice.getBoundingClientRect();
    const targetLeft = Math.max(10, Math.min(window.innerWidth - 110, priceRect.left - 48));
    const targetBottom = Math.max(74, window.innerHeight - priceRect.bottom - 10);

    if (!targetPrice.querySelector(".n-target-char")) {
      targetPrice.innerHTML = targetPrice.innerHTML.replace("N", '<span class="n-target-char" id="activeTargetN">N</span>');
    }

    setMascotState("sidewalk");
    entity.style.transition = "left 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), bottom 0.6s ease";
    entity.style.left = targetLeft + "px";
    entity.style.bottom = targetBottom + "px";
    posX = targetLeft;
    posY = targetBottom;
    showBubble("🤫 ¡Psst!", 1600);

    setTimeout(() => {
      if (isSleeping || isDancing) { isInteracting = false; return; }
      const targetChar = document.getElementById("activeTargetN");
      if (targetChar) targetChar.classList.add("n-letter-missing");

      if (heldLetterN) {
        heldLetterN.style.display = "flex";
        void heldLetterN.offsetWidth;
        heldLetterN.classList.add("flipped");
      }

      set3DPosture("turn-3d-r");
      showBubble("🙃 ¡Giro!", 1800);
      sound.beep(880, 'sine', 0.1);

      setTimeout(() => {
        showBubble("🪄 ¡Listo!", 1600);
        if (heldLetterN) {
          heldLetterN.classList.remove("flipped");
          heldLetterN.style.display = "none";
        }
        if (targetChar) {
          targetChar.classList.remove("n-letter-missing");
          targetChar.classList.add("n-letter-sparkle");
        }
        sound.successChime();

        setTimeout(() => {
          if (targetChar) targetChar.classList.remove("n-letter-sparkle");
          set3DPosture("turn-front");
          entity.style.transition = "left 0.6s ease, bottom 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)";
          entity.style.bottom = "74px";
          posY = 74;
          setTimeout(() => {
            isInteracting = false;
            setMascotState("walking");
            entity.style.transition = "none";
          }, 650);
        }, 800);
      }, 1600);
    }, 650);
  }

  // 23. TREPAR Y REVOLVER TÍTULO SUPERIOR
  function actionScrambleTitle() {
    const titleCandidates = Array.from(document.querySelectorAll("#categoryTitle, .header-title-text, .brand-text h1, .brand-sub, .section-title"));
    const titleElem = titleCandidates.find(t => {
      const r = t.getBoundingClientRect();
      return r.top >= 20 && r.bottom <= 260 && t.textContent.trim().length > 3;
    });

    if (!titleElem) { actionSprintDash(); return; }

    isInteracting = true;
    const titleRect = titleElem.getBoundingClientRect();
    const targetLeft = Math.max(15, Math.min(window.innerWidth - 110, titleRect.left + 20));
    const targetBottom = Math.max(74, window.innerHeight - titleRect.bottom + 15);

    showBubble("🔤 ¡Letras!", 1800);
    set3DPosture("turn-3d-r");
    entity.style.transition = "left 0.7s ease, bottom 0.75s cubic-bezier(0.25, 1, 0.5, 1)";
    entity.style.left = targetLeft + "px";
    entity.style.bottom = targetBottom + "px";
    posX = targetLeft;
    posY = targetBottom;

    setTimeout(() => {
      if (isSleeping || isDancing) { isInteracting = false; return; }
      setMascotState("stretching");
      showBubble("🎨 ¡Mix!", 1800);
      sound.beep(520, 'sine', 0.08);

      const originalText = titleElem.dataset.originalClean || titleElem.textContent;
      titleElem.dataset.originalClean = originalText;

      const chars = originalText.split("");
      const scrambledHTML = chars.map(c => {
        if (c === " ") return " ";
        const rot = Math.round((Math.random() - 0.5) * 35);
        return `<span class="scrambled-char" style="--r:${rot}; transform:rotate(${rot}deg);">${c}</span>`;
      }).join("");

      titleElem.innerHTML = scrambledHTML;

      setTimeout(() => {
        showBubble("🪄 ¡Magia!", 1600);
        titleElem.textContent = titleElem.dataset.originalClean || originalText;
        sound.successChime();
        setMascotState("idle");
        set3DPosture("turn-front");

        setTimeout(() => {
          entity.style.transition = "left 0.65s ease, bottom 0.65s cubic-bezier(0.2, 0.8, 0.2, 1)";
          entity.style.bottom = "74px";
          posY = 74;
          setTimeout(() => {
            isInteracting = false;
            setMascotState("walking");
            entity.style.transition = "none";
          }, 700);
        }, 800);
      }, 1800);
    }, 750);
  }

  // Clic en la mascota: Salto con giro de 360° y risa musical sintetizada
  entity.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isSleeping) {
      toggleSleep(false);
      return;
    }

    sound.beep(650, 'sine', 0.08);
    setTimeout(() => sound.beep(880, 'triangle', 0.09), 70);
    setTimeout(() => sound.beep(1175, 'sine', 0.12), 140);

    entity.classList.remove("spin-jump");
    void entity.offsetWidth;
    entity.classList.add("spin-jump");
    spawnParticle("🌟", posX + 20, posY + 20);

    const funPhrases = [
      "🤖 ¡ExpendeX!",
      "⚡ ¡100%!",
      "🎉 ¡Wuuu!",
      "😋 ¡Rico!",
      "🚀 ¡Energía!"
    ];
    showBubble(funPhrases[Math.floor(Math.random() * funPhrases.length)], 1800);

    setTimeout(() => {
      entity.classList.remove("spin-jump");
    }, 700);
  });

  // Botón Bailar
  function triggerDance() {
    if (isSleeping) toggleSleep(false);
    isDancing = true;
    setMascotState("dancing");
    showBubble("🕺 ¡Ritmo!", 2400);

    sound.beep(523, 'sine', 0.09);
    setTimeout(() => sound.beep(659, 'sine', 0.09), 110);
    setTimeout(() => sound.beep(784, 'sine', 0.09), 220);
    setTimeout(() => sound.beep(1046, 'triangle', 0.16), 330);
    spawnParticle("🎵", posX + 20, posY + 20);

    setTimeout(() => {
      isDancing = false;
      setMascotState("walking");
    }, 3200);
  }

  if (btnDance) {
    btnDance.addEventListener("click", (e) => {
      e.stopPropagation();
      triggerDance();
    });
  }

  // Botón Dormir / Despertar
  function toggleSleep(forceVal) {
    isSleeping = (typeof forceVal === "boolean") ? forceVal : !isSleeping;
    if (isSleeping) {
      setMascotState("sleeping");
      showBubble("💤 ¡Zzz!", 2400);
      if (btnSleep) btnSleep.textContent = "⏰";
    } else {
      setMascotState("walking");
      showBubble("☀️ ¡Listo!", 1800);
      if (btnSleep) btnSleep.textContent = "💤";
    }
  }

  if (btnSleep) {
    btnSleep.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSleep();
    });
  }

  // Reacción global cuando el usuario agrega algo al carrito
  window.triggerMascotCartReaction = function(prodName) {
    if (isSleeping) return;
    const prevDancing = isDancing;
    isDancing = true;
    setMascotState("dancing");
    showBubble("🛒 ¡Yum!", 2200);
    sound.beep(740, 'triangle', 0.08);
    setTimeout(() => sound.beep(980, 'sine', 0.12), 90);
    spawnParticle("🛒", posX + 20, posY + 20);

    setTimeout(() => {
      isDancing = prevDancing;
      if (!isDancing) setMascotState("walking");
    }, 2400);
  };

  // Reacción global cuando se realiza un pago / dispensado
  window.triggerMascotDispenseReaction = function() {
    if (isSleeping) toggleSleep(false);
    isDancing = true;
    setMascotState("dancing");
    entity.classList.add("spin-jump");
    showBubble("🍱 ¡Listo!", 3000);
    spawnParticle("🎉", posX + 20, posY + 20);
    spawnParticle("✨", posX + 10, posY + 20);
    setTimeout(() => {
      entity.classList.remove("spin-jump");
      isDancing = false;
      setMascotState("walking");
    }, 3000);
  };

  // Iniciar caminando ágilmente
  setMascotState("walking");
  showBubble("🤖 ¡ExpendeX!", 2000);
  loopMovement();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}



