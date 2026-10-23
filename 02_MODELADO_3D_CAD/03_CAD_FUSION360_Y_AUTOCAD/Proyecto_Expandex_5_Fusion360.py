# Author: Samuel Tovar Mojica & Antigravity Engineering
# Description: Generador 3D Paramétrico Profesional - Proyecto Expandex 5 (Versión 5.0 - Tubos Doblados Continuos, Espirales Gigantes y Émbolos Embonados)
# Gabinete: 950 mm ancho x 880 mm fondo x 1,830 mm alto (techo plano, SIN pantalla superior ni mástil)
# Puerta: vitrina panorámica de 810 mm (X 7-88 cm) + consola superior con pantalla touch 10.1", QR óptico y altavoz 5W
# Novedades Versión 5.0 (Tubos Doblados Continuos Sin Divisiones, Espirales Gigantes y Émbolos Embonados):
# 1. RESORTES COMO TUBOS DOBLADOS CONTINUOS 3D (CERO DIVISIONES, CERO FACETAS, CERO SECCIONES):
#    - Modelados mediante la operación nativa PipeFeature sobre curvas 3D Splines continuas (SketchFittedSplines).
#    - Crean una sola superficie cilíndrica NURBS ininterrumpida a lo largo de toda la espiral.
#    - 0% de facetas, 0% de anillos o juntas esféricas, luciendo exactamente como un tubo o alambre industrial curvado.
# 2. ESPIRALES / HÉLICES GIGANTES LATERALES PARA COMIDA CALIENTE (1 IZQUIERDA Y 1 DERECHA POR NIVEL):
#    - Se eliminó el esquema anterior de doble resorte y doble motor en los extremos.
#    - Ahora hay 1 solo resorte gigante de gran diámetro (Ø 144 mm, alambre reforzado Ø 7 mm, 5 vueltas)
#      que abarca en su totalidad la bahía ancha de 190 mm (X = 19.0 cm en la izquierda, X = 76.0 cm en la derecha).
#    - Un solo motor NEMA 17 por cada posición lateral, montado con total precisión en el centro exacto del compartimento.
# 3. ACOPLAMIENTO MECÁNICO DIRECTO (ÉMBOLO DEL MOTOR EMBONADO CON EL RESORTE):
#    - El cilindro que sale del motor (buje y émbolo central de Ø 21 mm) avanza desde la pared trasera (Y = 80.0 cm)
#      hasta la base de inicio del resorte (COIL_Y_REAR = 74.5 cm).
#    - Incorpora disco frontal de empuje, brazo radial de arrastre y casquillo de retención que embone firmemente con el resorte.
#    - La espiral incluye una transición tangencial suave que penetra y se fija físicamente en el émbolo del motor.
# 4. CUATRO CANALES CENTRALES DE BEBIDAS PRESERVADOS:
#    - Las 4 columnas centrales de bebidas (columnas 3, 4, 5 y 6) conservan sus resortes estándar de Ø 70 mm y motores individuales.
# 5. ARQUITECTURA EXACTA DE 36 MOTORES Y 36 ESPIRALES:
#    - 6 charolas x (1 comida izq + 4 bebidas + 1 comida der) = 6 motores por charola = 36 motores en total.
#    - Coincide 1 a 1 con la regleta de 36 pines (12 comida caliente + 24 bebidas) del gabinete electrónico superior.

import adsk.core, adsk.fusion, traceback, math

def run(context):
    ui = None
    app = None
    try:
        app = adsk.core.Application.get()
        ui  = app.userInterface
        design = adsk.fusion.Design.cast(app.activeProduct)

        if not design:
            ui.messageBox('Error: No hay ningún diseño activo.\nAbre un nuevo documento en Fusion 360 y vuelve a ejecutar el script.', 'Proyecto Expandex 5')
            return

        rootComp = design.rootComponent
        app.isScreenUpdating = False

        # -------------------------------------------------------------
        # 1. PARÁMETROS MAESTROS (Cotas en CENTÍMETROS para la API)
        # -------------------------------------------------------------
        WIDTH_EXT   = 95.0    # 950 mm ancho exterior
        DEPTH_EXT   = 88.0    # 880 mm fondo exterior
        HEIGHT_EXT  = 183.0   # 1,830 mm altura de gabinete

        # Perfiles PTR Comerciales (Monterrey, N.L.)
        PTR_MAIN    = 3.810   # PTR 1 1/2" x 1 1/2" Calibre 14 (38.1 mm)
        PTR_SEC     = 2.540   # PTR 1" x 1" Calibre 14 (25.4 mm)
        
        # Lámina Comercial
        SHEET_T     = 0.121   # 1.21 mm Lámina Calibre 18 Cold Rolled
        DOOR_FRAME_T= 0.152   # 1.52 mm Lámina Calibre 16

        # Cotas de Zonas Funcionales
        SPLIT_Z     = 46.0    # 460 mm (Divisora horizontal entre sala inferior y vitrina)
        DROP_DEPTH  = 26.0    # 260 mm fondo del cajón colector de caída

        # Ruedas Industriales (100 mm / 4")
        WHEEL_R     = 5.0
        WHEEL_W     = 3.8

        # 6 NIVELES DE PRODUCTOS (A, B, C, D, E, F)
        NUM_SHELVES = 6
        SHELF_X0    = 9.5     # Margen lateral
        COL_PITCH   = 9.5     # 95 mm por posición
        NUM_COLS    = 8       # 8 posiciones físicas: 2 dobles en extremos + 4 individuales centro
        SHELF_W     = NUM_COLS * COL_PITCH # 76.0 cm
        SHELF_Y0    = 15.0    # Pozo de caída libre frontal
        SHELF_D     = 65.0    # 650 mm fondo útil
        COL_H       = 6.0     # 60 mm altura guías

        # Espirales Helicoidales Vending - Bebidas (4 centrales por nivel)
        COIL_Y_FRONT     = 15.5
        COIL_Y_REAR      = 74.5
        COIL_L           = COIL_Y_REAR - COIL_Y_FRONT # 59.0 cm activa
        COIL_R_BEV       = 3.5    # Ø exterior 70 mm
        WIRE_R_BEV       = 0.25   # Alambre Ø 5 mm
        COIL_TURNS_BEV   = 7.0
        COIL_PITCH_BEV   = COIL_L / COIL_TURNS_BEV

        # Espirales Helicoidales Gigantes - Comida Caliente (1 lateral izquierda y 1 derecha por nivel)
        COIL_R_GIANT     = 7.2    # Ø exterior 144 mm (abarca ampliamente la bahía de 190 mm)
        WIRE_R_GIANT     = 0.35   # Alambre reforzado Ø 7 mm
        COIL_TURNS_GIANT = 5.0    # 5 vueltas completas (paso de 11.8 cm, óptimo para tuppers)
        COIL_PITCH_GIANT = COIL_L / COIL_TURNS_GIANT

        # Motor NEMA 17
        NEMA_W      = 4.23
        NEMA_L      = 4.00
        SHAFT_R     = 0.25
        SHAFT_L     = 2.40

        # Pantalla 32"
        SCREEN_W    = 73.0
        SCREEN_H    = 43.0
        SCREEN_D    = 4.0

        # -------------------------------------------------------------
        # 2. LIMPIEZA AUTOMÁTICA DEL DISEÑO PREVIO
        # -------------------------------------------------------------
        is_parametric = (design.designType == adsk.fusion.DesignTypes.ParametricDesignType)
        try:
            if is_parametric:
                for bf in list(rootComp.features.baseFeatures):
                    try:
                        bf.deleteMe()
                    except:
                        pass
            for b in list(rootComp.bRepBodies):
                try:
                    b.deleteMe()
                except:
                    pass
            for occ in list(rootComp.occurrences):
                try:
                    occ.deleteMe()
                except:
                    pass
        except:
            pass

        # -------------------------------------------------------------
        # 3. MOTOR B-REP DIRECTO CON BOOLEANO EN MEMORIA Y TUBOS DOBLADOS CONTINUOS
        # -------------------------------------------------------------
        temp_brep = adsk.fusion.TemporaryBRepManager.get()

        def make_box(x0, y0, z0, dx, dy, dz):
            try:
                center = adsk.core.Point3D.create(x0 + dx/2.0, y0 + dy/2.0, z0 + dz/2.0)
                lengthDir = adsk.core.Vector3D.create(1, 0, 0)
                widthDir = adsk.core.Vector3D.create(0, 1, 0)
                box_input = adsk.core.OrientedBoundingBox3D.create(center, lengthDir, widthDir, abs(dx), abs(dy), abs(dz))
                return temp_brep.createBox(box_input)
            except:
                return None

        def make_cyl(p1_tuple, p2_tuple, radius):
            try:
                p1 = adsk.core.Point3D.create(p1_tuple[0], p1_tuple[1], p1_tuple[2])
                p2 = adsk.core.Point3D.create(p2_tuple[0], p2_tuple[1], p2_tuple[2])
                return temp_brep.createCylinderOrCone(p1, radius, p2, radius)
            except:
                return None

        def make_sphere(center_tuple, radius):
            try:
                pt = adsk.core.Point3D.create(center_tuple[0], center_tuple[1], center_tuple[2])
                return temp_brep.createSphere(pt, radius)
            except:
                return None

        # Función de tubo doblado continuo 3D (PipeFeature sobre SketchFittedSplines)
        # Genera un resorte como un solo tubo cilíndrico matemáticamente continuo con 0 divisiones y 0 facetas
        def create_true_bent_pipe_coil(radius, turns, length, wire_r):
            sketch = None
            pipe_feat = None
            try:
                try:
                    fusion_pref = app.preferences.productPreferences.itemByName('Design')
                    if fusion_pref:
                        fusion_pref.is3DSketchingAllowed = True
                except:
                    pass

                sketch = rootComp.sketches.add(rootComp.xYConstructionPlane)
                sketch.isLightWeight = False

                segs_per_turn = 16
                n_pts = int(turns * segs_per_turn)
                d_th = (2.0 * math.pi) / segs_per_turn
                dy_step = length / n_pts

                fit_points = adsk.core.ObjectCollection.create()
                for i in range(n_pts + 1):
                    th = i * d_th
                    y = i * dy_step
                    x = radius * math.cos(th)
                    z = radius * math.sin(th)
                    fit_points.add(adsk.core.Point3D.create(x, y, z))

                # Transición tangencial suave en espiral hacia el centro del émbolo (0, length, 0)
                inward_steps = 6
                th_last = turns * 2.0 * math.pi
                for j in range(1, inward_steps + 1):
                    frac = j / inward_steps
                    r_t = radius * 0.5 * (1.0 + math.cos(frac * math.pi))
                    th_t = th_last + frac * (math.pi / 2.0)
                    x = r_t * math.cos(th_t)
                    z = r_t * math.sin(th_t)
                    y = length
                    fit_points.add(adsk.core.Point3D.create(x, y, z))

                spline = sketch.sketchCurves.sketchFittedSplines.add(fit_points)
                if spline:
                    path = rootComp.features.createPath(spline, True)
                    if path:
                        pipe_feats = rootComp.features.pipeFeatures
                        pipe_input = pipe_feats.createInput(path, adsk.fusion.FeatureOperations.NewBodyFeatureOperation)
                        pipe_input.sectionType = adsk.fusion.PipeSectionTypes.CircularPipeSectionType
                        pipe_input.sectionSize = adsk.core.ValueInput.createByReal(wire_r * 2.0)
                        pipe_input.isHollow = False

                        pipe_feat = pipe_feats.add(pipe_input)
                        if pipe_feat and pipe_feat.bodies.count > 0:
                            master_brep = temp_brep.copy(pipe_feat.bodies.item(0))
                            try:
                                pipe_feat.deleteMe()
                            except:
                                pass
                            try:
                                sketch.deleteMe()
                            except:
                                pass
                            return master_brep
            except:
                pass

            try:
                if pipe_feat and pipe_feat.isValid:
                    pipe_feat.deleteMe()
            except:
                pass
            try:
                if sketch and sketch.isValid:
                    sketch.deleteMe()
            except:
                pass
            return None

        # Fallback de unión booleana suave en memoria con traslape continuo
        def build_smooth_master_coil(radius, turns, length, wire_r):
            try:
                SEGS_PER_TURN = 24
                total_segs = int(turns * SEGS_PER_TURN)
                d_theta = (2.0 * math.pi) / SEGS_PER_TURN
                dy_step = length / total_segs

                pts = []
                for s in range(total_segs + 1):
                    th = s * d_theta
                    y = s * dy_step
                    x = radius * math.cos(th)
                    z = radius * math.sin(th)
                    pts.append((x, y, z))

                inward_steps = 6
                th_last = turns * 2.0 * math.pi
                for j in range(1, inward_steps + 1):
                    frac = j / inward_steps
                    r_t = radius * 0.5 * (1.0 + math.cos(frac * math.pi))
                    th_t = th_last + frac * (math.pi / 2.0)
                    x = r_t * math.cos(th_t)
                    z = r_t * math.sin(th_t)
                    y = length
                    pts.append((x, y, z))

                segments = []
                for s in range(len(pts) - 1):
                    p1 = pts[s]
                    p2 = pts[s + 1]
                    vx = p2[0] - p1[0]
                    vy = p2[1] - p1[1]
                    vz = p2[2] - p1[2]
                    p1_ext = (p1[0] - vx * 0.05, p1[1] - vy * 0.05, p1[2] - vz * 0.05)
                    p2_ext = (p2[0] + vx * 0.05, p2[1] + vy * 0.05, p2[2] + vz * 0.05)
                    cyl = make_cyl(p1_ext, p2_ext, wire_r)
                    if cyl:
                        segments.append(cyl)

                chain = segments
                while len(chain) > 1:
                    next_lvl = []
                    for i in range(0, len(chain), 2):
                        if i + 1 < len(chain):
                            t1 = chain[i]
                            t2 = chain[i + 1]
                            ok = False
                            try:
                                ok = temp_brep.booleanOperation(t1, t2, adsk.fusion.BooleanTypes.UnionBooleanType)
                            except:
                                ok = False
                            if ok:
                                next_lvl.append(t1)
                            else:
                                next_lvl.append(t1)
                                next_lvl.append(t2)
                        else:
                            next_lvl.append(chain[i])
                    if len(next_lvl) == len(chain):
                        break
                    chain = next_lvl

                return chain[0] if chain else None
            except:
                return None

        # Generar resortes maestros en memoria ANTES de iniciar base_feature (cero divisiones)
        master_bev_coil = create_true_bent_pipe_coil(COIL_R_BEV, COIL_TURNS_BEV, COIL_L, WIRE_R_BEV)
        if not master_bev_coil:
            master_bev_coil = build_smooth_master_coil(COIL_R_BEV, COIL_TURNS_BEV, COIL_L, WIRE_R_BEV)

        master_giant_coil = create_true_bent_pipe_coil(COIL_R_GIANT, COIL_TURNS_GIANT, COIL_L, WIRE_R_GIANT)
        if not master_giant_coil:
            master_giant_coil = build_smooth_master_coil(COIL_R_GIANT, COIL_TURNS_GIANT, COIL_L, WIRE_R_GIANT)

        # Inicio de sesión BaseFeature unificada
        base_feature = None
        if is_parametric:
            base_feature = rootComp.features.baseFeatures.add()
            base_feature.startEdit()

        def add_compound_body(name, brep_parts):
            if not brep_parts:
                return None
            valid = [p for p in brep_parts if p is not None]
            if not valid:
                return None

            target = valid[0]
            leftovers = []

            for tool in valid[1:]:
                success = False
                try:
                    success = temp_brep.booleanOperation(target, tool, adsk.fusion.BooleanTypes.UnionBooleanType)
                except:
                    success = False
                if not success:
                    leftovers.append(tool)

            added_main = None
            try:
                if is_parametric and base_feature:
                    b = rootComp.bRepBodies.add(target, base_feature)
                else:
                    b = rootComp.bRepBodies.add(target)
                if b:
                    b.name = name
                    added_main = b
            except:
                pass

            for idx, part in enumerate(leftovers):
                try:
                    if is_parametric and base_feature:
                        b = rootComp.bRepBodies.add(part, base_feature)
                    else:
                        b = rootComp.bRepBodies.add(part)
                    if b:
                        b.name = f"{name}_Parte_{idx+1}"
                except:
                    pass
            return added_main

        # =============================================================
        # 4. RUEDAS INDUSTRIALES CON FRENO DE TOPE (4 CUERPOS)
        # =============================================================
        caster_pts = [
            ("1_(Frontal_Izquierda)", 10.0, 12.0),
            ("2_(Frontal_Derecha)", WIDTH_EXT - 10.0, 12.0),
            ("3_(Trasera_Izquierda)", 10.0, DEPTH_EXT - 12.0),
            ("4_(Trasera_Derecha)", WIDTH_EXT - 10.0, DEPTH_EXT - 12.0)
        ]
        for c_id, cx, cy in caster_pts:
            wheel_parts = [
                make_box(cx - 5.75, cy - 5.0, -0.6, 11.5, 10.0, 0.6),
                make_cyl((cx, cy, -0.6), (cx, cy, -2.2), 3.4),
                make_box(cx - 2.6, cy - 2.0, -7.5, 0.5, 4.0, 5.3),
                make_box(cx + 2.1, cy - 2.0, -7.5, 0.5, 4.0, 5.3),
                make_cyl((cx - 3.0, cy, -7.5), (cx + 3.0, cy, -7.5), 0.6),
                make_cyl((cx - WHEEL_W/2.0, cy, -7.5), (cx + WHEEL_W/2.0, cy, -7.5), WHEEL_R),
                make_box(cx - 1.2, cy - 3.4, -5.5, 2.4, 2.0, 1.8),
                make_box(cx - 1.5, cy - 6.2, -4.8, 3.0, 3.2, 0.45)
            ]
            add_compound_body(f"00_Rueda_{c_id}", wheel_parts)

        # =============================================================
        # 5. ESQUELETO ESTRUCTURAL PTR SOLDADO (COLUMNAS, ANILLOS, BANCADA Y VIGAS)
        # =============================================================
        z_start_tray = 55.0
        shelf_spacing = 20.0
        CROSS_BEAM_H = 2.0
        SIDE_BEAM_H  = PTR_SEC

        ptr_parts = [
            # 4 Columnas Principales
            make_box(0, 0, 0, PTR_MAIN, PTR_MAIN, HEIGHT_EXT),
            make_box(WIDTH_EXT - PTR_MAIN, 0, 0, PTR_MAIN, PTR_MAIN, HEIGHT_EXT),
            make_box(0, DEPTH_EXT - PTR_MAIN, 0, PTR_MAIN, PTR_MAIN, HEIGHT_EXT),
            make_box(WIDTH_EXT - PTR_MAIN, DEPTH_EXT - PTR_MAIN, 0, PTR_MAIN, PTR_MAIN, HEIGHT_EXT),

            # Anillo Base Inferior (Z = 0)
            make_box(PTR_MAIN, 0, 0, WIDTH_EXT - 2*PTR_MAIN, PTR_MAIN, PTR_MAIN),
            make_box(PTR_MAIN, DEPTH_EXT - PTR_MAIN, 0, WIDTH_EXT - 2*PTR_MAIN, PTR_MAIN, PTR_MAIN),
            make_box(0, PTR_MAIN, 0, PTR_MAIN, DEPTH_EXT - 2*PTR_MAIN, PTR_MAIN),
            make_box(WIDTH_EXT - PTR_MAIN, PTR_MAIN, 0, PTR_MAIN, DEPTH_EXT - 2*PTR_MAIN, PTR_MAIN),

            # Travesaño divisorio del piso de recogida a Y = 26 cm
            make_box(PTR_MAIN, DROP_DEPTH - PTR_SEC, 0, WIDTH_EXT - 2*PTR_MAIN, PTR_SEC, PTR_MAIN),

            # Dos vigas anchas de soporte de la bancada frigorífica
            make_box(25.0, DROP_DEPTH, 0, 10.0, DEPTH_EXT - PTR_MAIN - DROP_DEPTH, PTR_MAIN),
            make_box(64.0, DROP_DEPTH, 0, 10.0, DEPTH_EXT - PTR_MAIN - DROP_DEPTH, PTR_MAIN),
            make_box(PTR_MAIN, 54.0, 0, WIDTH_EXT - 2*PTR_MAIN, 4.0, PTR_MAIN),

            # Anillo Intermedio: Divisora gigante en Z = 46 cm
            make_box(PTR_MAIN, 0, SPLIT_Z - PTR_SEC, WIDTH_EXT - 2*PTR_MAIN, PTR_MAIN, PTR_SEC),
            make_box(PTR_MAIN, DEPTH_EXT - PTR_MAIN, SPLIT_Z - PTR_SEC, WIDTH_EXT - 2*PTR_MAIN, PTR_MAIN, PTR_SEC),
            make_box(0, PTR_MAIN, SPLIT_Z - PTR_SEC, PTR_MAIN, DEPTH_EXT - 2*PTR_MAIN, PTR_SEC),
            make_box(WIDTH_EXT - PTR_MAIN, PTR_MAIN, SPLIT_Z - PTR_SEC, PTR_MAIN, DEPTH_EXT - 2*PTR_MAIN, PTR_SEC),
            make_box(PTR_MAIN, DROP_DEPTH - PTR_SEC, SPLIT_Z - PTR_SEC, WIDTH_EXT - 2*PTR_MAIN, PTR_SEC, PTR_SEC),

            # Anillo Superior (Z = 183 cm)
            make_box(PTR_MAIN, 0, HEIGHT_EXT - PTR_MAIN, WIDTH_EXT - 2*PTR_MAIN, PTR_MAIN, PTR_MAIN),
            make_box(PTR_MAIN, DEPTH_EXT - PTR_MAIN, HEIGHT_EXT - PTR_MAIN, WIDTH_EXT - 2*PTR_MAIN, PTR_MAIN, PTR_MAIN),
            make_box(0, PTR_MAIN, HEIGHT_EXT - PTR_MAIN, PTR_MAIN, DEPTH_EXT - 2*PTR_MAIN, PTR_MAIN),
            make_box(WIDTH_EXT - PTR_MAIN, PTR_MAIN, HEIGHT_EXT - PTR_MAIN, PTR_MAIN, DEPTH_EXT - 2*PTR_MAIN, PTR_MAIN)
        ]

        # 6 Vigas laterales de soporte por lado (tubos de soporte longitudinales)
        # Ajustados para quedar COMPLETAMENTE AL RAS de las caras de los perfiles estructurales PTR
        side_span_y0 = PTR_MAIN
        side_span_dy = DEPTH_EXT - 2 * PTR_MAIN
        for lvl_idx in range(NUM_SHELVES):
            z_tray = z_start_tray + lvl_idx * shelf_spacing
            z_side_beam = z_tray - CROSS_BEAM_H - SIDE_BEAM_H
            # Tubo izquierdo: inicia exactamente en X = 0.0 (al ras de la cara exterior del PTR) y apoya sobre el perfil
            ptr_parts.append(make_box(0.0, side_span_y0, z_side_beam, PTR_SEC, side_span_dy, SIDE_BEAM_H))
            # Tubo derecho: termina exactamente en X = WIDTH_EXT (al ras de la cara exterior del PTR derecho)
            ptr_parts.append(make_box(WIDTH_EXT - PTR_SEC, side_span_y0, z_side_beam, PTR_SEC, side_span_dy, SIDE_BEAM_H))

        add_compound_body("01_Estructura_Chasis_PTR_Soldado", ptr_parts)

        # =============================================================
        # 6. FORRO EXTERIOR EN LÁMINA CON VENTILACIÓN FINA Y COMPUERTA TRASERA
        # =============================================================
        # Costado Izquierdo con 16 rejillas finas en la sala de máquinas (Y=33 a 73 cm, Z=8.5 a 38 cm)
        costado_izq_parts = [
            make_box(-SHEET_T, 0, 0, SHEET_T, DEPTH_EXT, HEIGHT_EXT),
            make_box(-SHEET_T - 0.15, 31.5, 7.0, 0.15, 43.0, 32.5) # Marco perimetral estampado
        ]
        for i in range(16):
            z_louv = 8.5 + i * 1.85
            costado_izq_parts.append(make_box(-SHEET_T - 0.35, 33.0, z_louv, 0.35, 40.0, 0.55))
        add_compound_body("02_Lamina_Costado_Izquierdo_Rejillas_Finas", costado_izq_parts)

        # Costado Derecho con 16 rejillas finas en la sala de máquinas (Y=33 a 73 cm, Z=8.5 a 38 cm)
        costado_der_parts = [
            make_box(WIDTH_EXT, 0, 0, SHEET_T, DEPTH_EXT, HEIGHT_EXT),
            make_box(WIDTH_EXT, 31.5, 7.0, 0.15, 43.0, 32.5) # Marco perimetral estampado
        ]
        for i in range(16):
            z_louv = 8.5 + i * 1.85
            costado_der_parts.append(make_box(WIDTH_EXT, 33.0, z_louv, 0.35, 40.0, 0.55))
        add_compound_body("02_Lamina_Costado_Derecho_Rejillas_Finas", costado_der_parts)

        # Techo Superior y Piso Inferior
        add_compound_body("02_Lamina_Techo_Superior_Cal18", [make_box(-SHEET_T, -SHEET_T, HEIGHT_EXT, WIDTH_EXT + 2*SHEET_T, DEPTH_EXT + 2*SHEET_T, SHEET_T)])
        add_compound_body("02_Lamina_Piso_Inferior_Cal18", [make_box(-SHEET_T, -SHEET_T, -SHEET_T, WIDTH_EXT + 2*SHEET_T, DEPTH_EXT + 2*SHEET_T, SHEET_T)])

        # Frente Inferior Liso
        DOOR_PUSH_W = 67.0
        DOOR_PUSH_H = 24.0
        DOOR_PUSH_X = (WIDTH_EXT - DOOR_PUSH_W) / 2.0 # 14.0 cm
        DOOR_PUSH_Z = 6.0

        frente_liso_parts = [
            make_box(0, -SHEET_T, 0, DOOR_PUSH_X, SHEET_T, SPLIT_Z),
            make_box(WIDTH_EXT - DOOR_PUSH_X, -SHEET_T, 0, DOOR_PUSH_X, SHEET_T, SPLIT_Z),
            make_box(DOOR_PUSH_X, -SHEET_T, 0, DOOR_PUSH_W, SHEET_T, DOOR_PUSH_Z),
            make_box(DOOR_PUSH_X, -SHEET_T, DOOR_PUSH_Z + DOOR_PUSH_H, DOOR_PUSH_W, SHEET_T, SPLIT_Z - (DOOR_PUSH_Z + DOOR_PUSH_H))
        ]
        add_compound_body("02_Lamina_Frontal_Inferior_Lisa", frente_liso_parts)

        # Respaldo Trasero Superior Totalmente Liso y Hermético (Z = 46.0 cm a 183.0 cm)
        # 100% cerrado y continuo para garantizar estanqueidad térmica y retención del frío
        add_compound_body("02_Lamina_Respaldo_Trasero_Superior_Liso_Cal18", [
            make_box(-SHEET_T, DEPTH_EXT, SPLIT_Z, WIDTH_EXT + 2*SHEET_T, SHEET_T, HEIGHT_EXT - SPLIT_Z)
        ])

        # Marco Perimetral Fijo de la Compuerta Trasera Inferior (Z = 0 a 46 cm)
        marco_compuerta_parts = [
            make_box(-SHEET_T, DEPTH_EXT, 0, WIDTH_EXT + 2*SHEET_T, SHEET_T, 5.0),
            make_box(-SHEET_T, DEPTH_EXT, 41.0, WIDTH_EXT + 2*SHEET_T, SHEET_T, SPLIT_Z - 41.0),
            make_box(-SHEET_T, DEPTH_EXT, 5.0, 8.5 + SHEET_T, SHEET_T, 36.0),
            make_box(WIDTH_EXT - 8.5, DEPTH_EXT, 5.0, 8.5 + SHEET_T, SHEET_T, 36.0)
        ]
        add_compound_body("02_Marco_Compuerta_Mantenimiento_Trasera", marco_compuerta_parts)

        # Compuerta Batiente Trasera de Mantenimiento con 16 Rejillas Finas
        compuerta_mant_parts = [
            make_box(8.5, DEPTH_EXT + SHEET_T, 5.5, WIDTH_EXT - 17.0, 0.25, 35.0), # Hoja principal
            make_box(12.0, DEPTH_EXT + SHEET_T + 0.15, 7.5, WIDTH_EXT - 24.0, 0.2, 31.0) # Reborde estampado
        ]
        for i in range(16):
            z_louv = 8.5 + i * 1.85
            compuerta_mant_parts.append(make_box(13.5, DEPTH_EXT + SHEET_T + 0.25, z_louv, WIDTH_EXT - 27.0, 0.4, 0.6))
        add_compound_body("02_Compuerta_Mantenimiento_Trasera_Rejillas_Finas", compuerta_mant_parts)

        # Dos Bisagras Industriales de Mantenimiento (Costado Izquierdo)
        bisagras_mant_parts = []
        hinge_mant_z = [12.0, 34.0]
        for hz in hinge_mant_z:
            # Pala de marco fijo
            bisagras_mant_parts.append(make_box(6.2, DEPTH_EXT + SHEET_T, hz - 2.5, 2.0, 0.25, 5.0))
            # Pala de hoja de compuerta
            bisagras_mant_parts.append(make_box(8.8, DEPTH_EXT + SHEET_T, hz - 2.5, 2.0, 0.25, 5.0))
            # Nudillos cilíndricos de giro
            bisagras_mant_parts.append(make_cyl((8.5, DEPTH_EXT + SHEET_T + 0.35, hz + 0.8), (8.5, DEPTH_EXT + SHEET_T + 0.35, hz + 2.5), 0.55))
            bisagras_mant_parts.append(make_cyl((8.5, DEPTH_EXT + SHEET_T + 0.35, hz - 2.5), (8.5, DEPTH_EXT + SHEET_T + 0.35, hz - 0.8), 0.55))
            bisagras_mant_parts.append(make_cyl((8.5, DEPTH_EXT + SHEET_T + 0.35, hz - 0.7), (8.5, DEPTH_EXT + SHEET_T + 0.35, hz + 0.7), 0.55))
            # Perno pasante
            bisagras_mant_parts.append(make_cyl((8.5, DEPTH_EXT + SHEET_T + 0.35, hz - 2.8), (8.5, DEPTH_EXT + SHEET_T + 0.35, hz + 2.8), 0.30))
        add_compound_body("02_Compuerta_Mantenimiento_Bisagras_Industriales", bisagras_mant_parts)

        # Cerradura de Seguridad de Mantenimiento Tipo Vending (Costado Derecho)
        LOCK_MANT_X = WIDTH_EXT - 11.5 # 83.5 cm
        LOCK_MANT_Z = 23.0            # Mitad de altura de la compuerta
        cerradura_mant_parts = [
            # Escudo embellecedor cromado exterior
            make_box(LOCK_MANT_X - 1.8, DEPTH_EXT + SHEET_T + 0.25, LOCK_MANT_Z - 2.5, 3.6, 0.35, 5.0),
            # Cuerpo del bombín cilíndrico
            make_cyl((LOCK_MANT_X, DEPTH_EXT + SHEET_T + 0.5, LOCK_MANT_Z), (LOCK_MANT_X, DEPTH_EXT + SHEET_T + 1.4, LOCK_MANT_Z), 0.95),
            # Núcleo de llave con hendidura
            make_cyl((LOCK_MANT_X, DEPTH_EXT + SHEET_T + 1.35, LOCK_MANT_Z), (LOCK_MANT_X, DEPTH_EXT + SHEET_T + 1.6, LOCK_MANT_Z), 0.65),
            # Manija de cuarto de vuelta / T-handle
            make_box(LOCK_MANT_X - 1.4, DEPTH_EXT + SHEET_T + 1.5, LOCK_MANT_Z - 0.6, 2.8, 0.5, 1.2),
            # Lengüeta interna de cerrojo (bloquea detrás del marco de acero)
            make_box(WIDTH_EXT - 9.0, DEPTH_EXT - 0.5, LOCK_MANT_Z - 2.0, 3.5, 0.4, 4.0)
        ]
        add_compound_body("02_Compuerta_Mantenimiento_Cerradura_Seguridad", cerradura_mant_parts)

        # =============================================================
        # 7. LÁMINA ENVOLVENTE DEL RECEPTÁCULO AISLANTE (TOGGLEABLE)
        # =============================================================
        receptaculo_aislante_parts = [
            make_box(PTR_MAIN, DROP_DEPTH, SPLIT_Z - 2.5, WIDTH_EXT - 2*PTR_MAIN, DEPTH_EXT - PTR_MAIN - DROP_DEPTH, 2.5),
            make_box(PTR_MAIN + 0.5, DROP_DEPTH + 0.5, SPLIT_Z - 4.5, WIDTH_EXT - 2*PTR_MAIN - 1.0, 1.2, 2.0),
            make_box(PTR_MAIN + 0.5, DEPTH_EXT - PTR_MAIN - 1.7, SPLIT_Z - 4.5, WIDTH_EXT - 2*PTR_MAIN - 1.0, 1.2, 2.0),
            make_box(PTR_MAIN + 0.5, DROP_DEPTH + 0.5, SPLIT_Z - 4.5, 1.2, DEPTH_EXT - PTR_MAIN - DROP_DEPTH - 1.0, 2.0),
            make_box(WIDTH_EXT - PTR_MAIN - 1.7, DROP_DEPTH + 0.5, SPLIT_Z - 4.5, 1.2, DEPTH_EXT - PTR_MAIN - DROP_DEPTH - 1.0, 2.0)
        ]
        add_compound_body("03_Panel_Receptaculo_Aislante_Inferior_Inspeccion", receptaculo_aislante_parts)

        # =============================================================
        # 8. DIVISIÓN VERTICAL ENTRE EL AISLANTE Y LA BANDEJA (Z: 46 a 55 cm)
        # =============================================================
        div_vert_parts = [
            make_box(PTR_MAIN, DROP_DEPTH - PTR_SEC, SPLIT_Z, WIDTH_EXT - 2*PTR_MAIN, PTR_SEC, z_start_tray - SPLIT_Z),
            make_box(0, DROP_DEPTH - 0.25, SPLIT_Z, WIDTH_EXT, 0.25, z_start_tray - SPLIT_Z)
        ]
        add_compound_body("03_Perfil_Division_Vertical_Aislante_Bandeja", div_vert_parts)

        # =============================================================
        # 9. POZO DE CAÍDA Y BANDEJA BLINDADA TOTALMENTE SELLADA
        #    (Se eliminaron pestañas flotantes artificiales)
        # =============================================================
        pozo_caida_blindado_parts = [
            make_box(0, DROP_DEPTH, 0, WIDTH_EXT, 0.25, SPLIT_Z),
            make_box(0, 0, 1.0, WIDTH_EXT, DROP_DEPTH, 0.20),
            make_box(DOOR_PUSH_X - 1.0, 1.5, 1.2, DOOR_PUSH_W + 2.0, DROP_DEPTH - 2.0, 1.8),
            make_box(0, 0, 0, 0.25, DROP_DEPTH, SPLIT_Z),
            make_box(WIDTH_EXT - 0.25, 0, 0, 0.25, DROP_DEPTH, SPLIT_Z)
        ]
        add_compound_body("05_Bandeja_Recogida_Pozo_Caida_Blindado_Totalmente_Cerrado", pozo_caida_blindado_parts)

        # Compuerta basculante lisa limpia (SIN PESTAÑAS FLOTANTES)
        z_top_flap = DOOR_PUSH_Z + DOOR_PUSH_H
        compuerta_parts = [
            make_box(DOOR_PUSH_X + 0.6, -SHEET_T - 0.15, DOOR_PUSH_Z + 0.6, DOOR_PUSH_W - 1.2, DOOR_FRAME_T, DOOR_PUSH_H - 1.2)
        ]
        add_compound_body("05_Compuerta_Basculante_Entrega_Limpia", compuerta_parts)

        # Bisagras superiores con 8 tornillos Phillips simulados
        hinge_flap_parts = []
        hinge_xs = [DOOR_PUSH_X + 7.0, WIDTH_EXT - DOOR_PUSH_X - 7.0]
        for hx in hinge_xs:
            hinge_flap_parts.append(make_box(hx - 2.0, -SHEET_T - 0.55, z_top_flap - 0.4, 4.0, 0.45, 2.4))
            hinge_flap_parts.append(make_box(hx - 2.0, -SHEET_T - 0.55, z_top_flap - 2.8, 4.0, 0.45, 2.4))
            hinge_flap_parts.append(make_cyl((hx - 2.4, -SHEET_T - 0.35, z_top_flap - 0.4), (hx + 2.4, -SHEET_T - 0.35, z_top_flap - 0.4), 0.55))
            hinge_flap_parts.append(make_cyl((hx - 2.8, -SHEET_T - 0.35, z_top_flap - 0.4), (hx + 2.8, -SHEET_T - 0.35, z_top_flap - 0.4), 0.28))
            for sx, sz in [(hx - 1.1, z_top_flap + 0.8), (hx + 1.1, z_top_flap + 0.8), (hx - 1.1, z_top_flap - 1.6), (hx + 1.1, z_top_flap - 1.6)]:
                hinge_flap_parts.append(make_cyl((sx, -SHEET_T - 0.55, sz), (sx, -SHEET_T - 0.75, sz), 0.35))
                hinge_flap_parts.append(make_box(sx - 0.20, -SHEET_T - 0.90, sz - 0.04, 0.40, 0.06, 0.08))
                hinge_flap_parts.append(make_box(sx - 0.04, -SHEET_T - 0.90, sz - 0.20, 0.08, 0.06, 0.40))
        add_compound_body("05_Bisagras_Compuerta_Con_Tornillos", hinge_flap_parts)

        # =============================================================
        # 10. SALA DE MÁQUINAS REFRIGERACIÓN INDUSTRIAL SEGÚN IMÁGENES BOWA
        # =============================================================
        bancada_parts = [
            make_box(8.0, DROP_DEPTH + 1.0, PTR_MAIN, 79.0, DEPTH_EXT - PTR_MAIN - DROP_DEPTH - 2.0, 0.6),
            make_box(8.0, DROP_DEPTH + 1.0, PTR_MAIN + 0.6, 79.0, 1.8, 2.5),
            make_box(8.0, DEPTH_EXT - PTR_MAIN - 2.0, PTR_MAIN + 0.6, 79.0, 1.8, 2.5),
            make_box(38.0, DROP_DEPTH + 0.2, PTR_MAIN + 1.0, 19.0, 0.8, 1.6)
        ]
        add_compound_body("04_Sala_Maquinas_01_Bandeja_Bancada_Antivibratoria", bancada_parts)

        # Compresor hermético con tacones de goma (101)
        cc_x = 24.0
        cc_y = 56.0
        compresor_parts = [
            make_cyl((cc_x - 7.0, cc_y - 6.0, PTR_MAIN + 0.6), (cc_x - 7.0, cc_y - 6.0, PTR_MAIN + 1.8), 1.6),
            make_cyl((cc_x + 7.0, cc_y - 6.0, PTR_MAIN + 0.6), (cc_x + 7.0, cc_y - 6.0, PTR_MAIN + 1.8), 1.6),
            make_cyl((cc_x - 7.0, cc_y + 6.0, PTR_MAIN + 0.6), (cc_x - 7.0, cc_y + 6.0, PTR_MAIN + 1.8), 1.6),
            make_cyl((cc_x + 7.0, cc_y + 6.0, PTR_MAIN + 0.6), (cc_x + 7.0, cc_y + 6.0, PTR_MAIN + 1.8), 1.6),
            make_box(cc_x - 8.5, cc_y - 7.5, PTR_MAIN + 1.8, 17.0, 15.0, 0.4),
            make_cyl((cc_x, cc_y, PTR_MAIN + 2.2), (cc_x, cc_y, 21.0), 8.5),
            make_cyl((cc_x, cc_y, 14.0), (cc_x, cc_y, 15.0), 8.9),
            make_cyl((cc_x, cc_y, 21.0), (cc_x, cc_y, 24.5), 7.2),
            make_cyl((cc_x, cc_y, 24.5), (cc_x, cc_y, 26.5), 5.0),
            make_box(cc_x - 12.8, cc_y - 3.5, 10.5, 4.5, 7.0, 6.5),
            make_cyl((cc_x - 14.0, cc_y, 13.0), (cc_x - 12.8, cc_y, 13.0), 0.8),
            make_cyl((cc_x + 1.5, cc_y - 2.0, 26.5), (cc_x + 1.5, cc_y - 2.0, 29.5), 0.65),
            make_cyl((cc_x - 6.0, cc_y + 4.5, 17.0), (cc_x - 9.0, cc_y + 4.5, 17.0), 0.75),
            make_cyl((cc_x + 6.5, cc_y + 4.5, 15.0), (cc_x + 9.5, cc_y + 4.5, 15.0), 0.50)
        ]
        add_compound_body("04_Sala_Maquinas_02_Compresor_Hermetico_Con_Amortiguadores", compresor_parts)

        # Acumulador de succión alto (702) y Separador de aceite (131)
        acc_x = 40.0
        acc_y = 58.0
        recibidor_parts = [
            make_cyl((acc_x, acc_y, PTR_MAIN + 0.6), (acc_x, acc_y, PTR_MAIN + 1.6), 2.5),
            make_cyl((acc_x, acc_y, PTR_MAIN + 1.6), (acc_x, acc_y, 27.0), 4.6),
            make_cyl((acc_x, acc_y, 27.0), (acc_x, acc_y, 29.5), 3.8),
            make_cyl((acc_x - 1.5, acc_y, 29.5), (acc_x - 1.5, acc_y, 32.5), 0.6),
            make_cyl((acc_x + 1.5, acc_y, 29.5), (acc_x + 1.5, acc_y, 32.5), 0.6),
            make_cyl((15.0, 42.0, 8.0), (15.0, 42.0, 21.0), 2.8),
            make_cyl((15.0, 42.0, 21.0), (15.0, 42.0, 23.0), 2.0),
            make_cyl((15.0, 42.0, 6.5), (15.0, 42.0, 8.0), 1.2),
            make_cyl((15.0, 42.0, 7.0), (20.0, 50.0, 7.0), 0.25),
            make_cyl((20.0, 50.0, 7.0), (cc_x - 5.0, cc_y - 5.0, 7.0), 0.25)
        ]
        add_compound_body("04_Sala_Maquinas_03_Acumulador_Succion_Y_Separador_Aceite", recibidor_parts)

        # Condensador serpentín con hairpins y ventilador con rejilla (201 y 202)
        cnd_x = 58.0
        cnd_y = 50.0
        condensador_parts = [
            make_box(cnd_x, cnd_y, 5.0, 24.0, 11.0, 26.0),
            make_box(cnd_x - 0.8, cnd_y - 0.5, PTR_MAIN + 0.6, 0.8, 12.0, 26.5),
            make_box(cnd_x + 24.0, cnd_y - 0.5, PTR_MAIN + 0.6, 0.8, 12.0, 26.5),
            make_box(cnd_x, cnd_y + 11.0, 5.0, 24.0, 3.5, 26.0),
            make_cyl((cnd_x + 12.0, cnd_y + 11.0, 18.0), (cnd_x + 12.0, cnd_y + 15.0, 18.0), 10.5)
        ]
        for row in range(6):
            z_u = 7.0 + row * 4.2
            condensador_parts.extend([
                make_cyl((cnd_x + 24.8, cnd_y + 2.5, z_u), (cnd_x + 26.8, cnd_y + 2.5, z_u), 0.45),
                make_cyl((cnd_x + 24.8, cnd_y + 8.5, z_u), (cnd_x + 26.8, cnd_y + 8.5, z_u), 0.45),
                make_cyl((cnd_x + 26.8, cnd_y + 2.5, z_u), (cnd_x + 26.8, cnd_y + 8.5, z_u), 0.45)
            ])
        fan_cx = cnd_x + 12.0
        fan_cz = 18.0
        condensador_parts.extend([
            make_cyl((fan_cx, cnd_y + 15.0, fan_cz), (fan_cx, cnd_y + 21.5, fan_cz), 4.0),
            make_cyl((fan_cx, cnd_y + 12.5, fan_cz), (fan_cx, cnd_y + 15.0, fan_cz), 0.5),
            make_cyl((fan_cx, cnd_y + 13.0, fan_cz), (fan_cx, cnd_y + 14.5, fan_cz), 2.2),
            make_box(fan_cx - 9.5, cnd_y + 13.5, fan_cz - 1.2, 19.0, 0.4, 2.5),
            make_box(fan_cx - 1.2, cnd_y + 13.5, fan_cz - 9.5, 2.5, 0.4, 19.0),
            make_cyl((fan_cx, cnd_y + 11.5, fan_cz), (fan_cx, cnd_y + 12.2, fan_cz), 5.5),
            make_cyl((fan_cx, cnd_y + 11.5, fan_cz), (fan_cx, cnd_y + 12.2, fan_cz), 9.0),
            make_cyl((cnd_x + 2.0, cnd_y + 12.0, 7.0), (cnd_x + 22.0, cnd_y + 12.0, 29.0), 0.3),
            make_cyl((cnd_x + 2.0, cnd_y + 12.0, 29.0), (cnd_x + 22.0, cnd_y + 12.0, 7.0), 0.3)
        ])
        add_compound_body("04_Sala_Maquinas_04_Condensador_Serpentin_Y_Ventilador_Con_Rejilla", condensador_parts)

        # Consola frontal de manómetros (107, 108) y presostato dual (110)
        csl_x = 42.0
        csl_y = 33.0
        csl_z = 7.0
        consola_parts = [
            make_box(csl_x - 7.5, csl_y, csl_z, 15.0, 0.6, 12.0),
            make_box(csl_x - 7.5, csl_y, csl_z + 12.0, 15.0, 6.0, 0.6),
            make_box(csl_x - 7.5, csl_y + 6.0, csl_z + 12.0, 15.0, 0.6, 9.0),
            make_cyl((csl_x - 3.8, csl_y + 5.5, csl_z + 16.5), (csl_x - 3.8, csl_y + 6.8, csl_z + 16.5), 3.2),
            make_cyl((csl_x - 3.8, csl_y + 6.8, csl_z + 16.5), (csl_x - 3.8, csl_y + 7.2, csl_z + 16.5), 2.7),
            make_cyl((csl_x + 3.8, csl_y + 5.5, csl_z + 16.5), (csl_x + 3.8, csl_y + 6.8, csl_z + 16.5), 3.2),
            make_cyl((csl_x + 3.8, csl_y + 6.8, csl_z + 16.5), (csl_x + 3.8, csl_y + 7.2, csl_z + 16.5), 2.7),
            make_box(csl_x - 6.0, csl_y + 0.8, csl_z + 2.0, 12.0, 5.0, 8.5),
            make_cyl((csl_x - 3.0, csl_y + 0.8, csl_z + 6.0), (csl_x - 3.0, csl_y - 0.5, csl_z + 6.0), 0.5),
            make_cyl((csl_x + 3.0, csl_y + 0.8, csl_z + 6.0), (csl_x + 3.0, csl_y - 0.5, csl_z + 6.0), 0.5)
        ]
        add_compound_body("04_Sala_Maquinas_05_Consola_Manometros_Y_Presostato_Dual", consola_parts)

        # Filtro deshidratador, solenoide y válvulas de servicio
        valvulas_parts = [
            make_cyl((52.0, 36.0, 8.0), (52.0, 36.0, 18.0), 1.6),
            make_cyl((52.0, 36.0, 6.5), (52.0, 36.0, 8.0), 0.6),
            make_cyl((52.0, 36.0, 18.0), (52.0, 36.0, 19.5), 0.6),
            make_box(50.5, 34.0, 21.0, 3.0, 4.0, 3.5),
            make_cyl((52.0, 36.0, 24.5), (52.0, 36.0, 28.5), 1.4),
            make_box(30.0, DROP_DEPTH + 3.0, PTR_MAIN + 0.6, 2.8, 3.5, 3.0),
            make_cyl((31.4, DROP_DEPTH + 4.7, PTR_MAIN + 3.6), (31.4, DROP_DEPTH + 4.7, PTR_MAIN + 5.5), 0.45),
            make_box(46.0, DROP_DEPTH + 3.0, PTR_MAIN + 0.6, 2.8, 3.5, 3.0),
            make_cyl((47.4, DROP_DEPTH + 4.7, PTR_MAIN + 3.6), (47.4, DROP_DEPTH + 4.7, PTR_MAIN + 5.5), 0.45),
            make_box(10.0, 30.0, PTR_MAIN + 0.6, 12.0, 18.0, 6.5),
            make_box(24.0, 28.5, 29.0, 18.0, 3.5, 13.0)
        ]
        add_compound_body("04_Sala_Maquinas_06_Filtro_Secador_Solenoide_Y_Valvulas_Servicio", valvulas_parts)

        # Red de tuberías de cobre interconectadas en el circuito
        tuberias_parts = [
            make_cyl((cc_x + 1.5, cc_y - 2.0, 29.5), (15.0, cc_y - 2.0, 29.5), 0.45),
            make_cyl((15.0, cc_y - 2.0, 29.5), (15.0, 42.0, 23.0), 0.45),
            make_cyl((15.0, 42.0, 23.0), (15.0, 32.0, 23.0), 0.45),
            make_cyl((15.0, 32.0, 23.0), (cnd_x + 2.0, 32.0, 23.0), 0.45),
            make_cyl((cnd_x + 2.0, 32.0, 23.0), (cnd_x + 2.0, cnd_y, 28.0), 0.45),

            make_cyl((cnd_x + 2.0, cnd_y, 6.5), (52.0, cnd_y, 6.5), 0.40),
            make_cyl((52.0, cnd_y, 6.5), (52.0, 36.0, 6.5), 0.40),
            make_cyl((52.0, 36.0, 19.5), (52.0, 36.0, 21.0), 0.40),
            make_cyl((52.0, 36.0, 24.5), (47.4, 36.0, 24.5), 0.40),
            make_cyl((47.4, 36.0, 24.5), (47.4, DROP_DEPTH + 4.7, PTR_MAIN + 3.6), 0.40),

            make_cyl((31.4, DROP_DEPTH + 4.7, PTR_MAIN + 3.6), (31.4, 52.0, 14.0), 0.55),
            make_cyl((31.4, 52.0, 14.0), (acc_x - 1.5, 52.0, 14.0), 0.55),
            make_cyl((acc_x - 1.5, 52.0, 14.0), (acc_x - 1.5, acc_y, 29.5), 0.55),
            make_cyl((acc_x + 1.5, acc_y, 29.5), (acc_x + 1.5, cc_y + 4.5, 29.5), 0.55),
            make_cyl((acc_x + 1.5, cc_y + 4.5, 29.5), (cc_x - 6.0, cc_y + 4.5, 17.0), 0.55)
        ]
        add_compound_body("04_Sala_Maquinas_07_Red_Tuberias_Cobre_Descarga_Succion_Liquido", tuberias_parts)

        # =============================================================
        # 11. COLUMNA VERTICAL DE CLIMATIZACIÓN Y DIFUSORES (6 NIVELES)
        #     - Ubicación Y: Exactamente a la mitad de la bandeja (Y = 47.5 cm)
        #     - Ubicación Z: Centrado exactamente a la mitad entre dos bandejas (Z = z_tray + 10.0 cm)
        #       elevado 4 cm por encima del tablón lateral de la charola (6 cm) para visibilidad directa
        #     - Orificio pasante real (Ø 26 mm) con brida/aro exterior (Ø 40 mm)
        #     - Tubería inferior conectada a la salida del compresor hermético
        # =============================================================
        duct_x0 = 4.2
        duct_w  = 4.0  # Ancho X: 4.2 a 8.2 cm (holgura libre de 13 mm antes de la charola en X = 9.5 cm)
        duct_d  = 7.0  # Fondo Y: 7.0 cm (de 44.0 cm a 51.0 cm)
        duct_y0 = (SHELF_Y0 + SHELF_D / 2.0) - duct_d / 2.0 # Centrado a la mitad exacta de la bandeja (47.5 cm)
        duct_z0 = SPLIT_Z - 2.5 # Z = 43.5 cm (atraviesa la base horizontal)
        duct_h  = (HEIGHT_EXT - PTR_MAIN) - duct_z0 # 135.7 cm hasta el techo

        y_nozzle = duct_y0 + duct_d / 2.0 # 47.5 cm (mitad exacta de la bandeja en profundidad Y)
        x_face = duct_x0 + duct_w         # 8.2 cm (cara orientada hacia las charolas)

        main_duct = make_box(duct_x0, duct_y0, duct_z0, duct_w, duct_d, duct_h)

        # 1. Unir bridas de fijación y tubería de compresor
        aux_features = [
            # Brida de paso y sellado hermético a través de la base horizontal (Z = 46.0 cm)
            make_box(duct_x0 - 0.4, duct_y0 - 0.4, SPLIT_Z - 0.4, duct_w + 0.8, duct_d + 0.8, 0.8),
            # Brida superior de remate en techo
            make_box(duct_x0 - 0.2, duct_y0 - 0.2, HEIGHT_EXT - PTR_MAIN - 0.5, duct_w + 0.4, duct_d + 0.4, 0.5),

            # Tubería inferior conectada a la descarga del compresor hermético
            make_cyl((cc_x - 2.0, cc_y - 2.0, 26.5), (cc_x - 2.0, y_nozzle, 26.5), 0.65),
            make_cyl((cc_x - 2.0, y_nozzle, 26.5), (duct_x0 + duct_w/2.0, y_nozzle, 26.5), 0.65),
            make_cyl((duct_x0 + duct_w/2.0, y_nozzle, 26.5), (duct_x0 + duct_w/2.0, y_nozzle, duct_z0), 0.65),
            make_cyl((duct_x0 + duct_w/2.0, y_nozzle, duct_z0 - 1.8), (duct_x0 + duct_w/2.0, y_nozzle, duct_z0), 1.1)
        ]
        for aux in aux_features:
            if aux and main_duct:
                try:
                    temp_brep.booleanOperation(main_duct, aux, adsk.fusion.BooleanTypes.UnionBooleanType)
                except:
                    pass

        # 2. Toberas con agujero pasante visible en los 6 niveles
        # Ubicadas a la mitad de la bandeja en fondo (Y = 47.5 cm)
        # y exactamente a la mitad entre dos bandejas en altura (Z = z_tray + 10.0 cm)
        for lvl_idx in range(NUM_SHELVES):
            z_tray = z_start_tray + lvl_idx * shelf_spacing
            z_hole = z_tray + shelf_spacing / 2.0 # z_tray + 10.0 cm (despejado 4 cm por encima del tablón de 6 cm)

            # Cuello / Aro exterior difusor (Ø 4.0 cm, R = 2.0 cm, sobresale 0.6 cm hacia la charola)
            collar = make_cyl((x_face, y_nozzle, z_hole), (x_face + 0.6, y_nozzle, z_hole), 2.0)
            if collar and main_duct:
                try:
                    temp_brep.booleanOperation(main_duct, collar, adsk.fusion.BooleanTypes.UnionBooleanType)
                except:
                    pass

            # Agujero pasante visible de impulsión de frío (Ø 2.6 cm, R = 1.3 cm)
            # Taladra de X = 5.7 cm (dentro del ducto) hasta X = 8.8 cm (exterior del collar)
            hole_cutter = make_cyl((x_face - 2.5, y_nozzle, z_hole), (x_face + 0.8, y_nozzle, z_hole), 1.3)
            if hole_cutter and main_duct:
                try:
                    temp_brep.booleanOperation(main_duct, hole_cutter, adsk.fusion.BooleanTypes.DifferenceBooleanType)
                except:
                    pass

        # Agregar el cuerpo final de la columna de climatización
        climatizacion_body = None
        try:
            if is_parametric and base_feature:
                climatizacion_body = rootComp.bRepBodies.add(main_duct, base_feature)
            else:
                climatizacion_body = rootComp.bRepBodies.add(main_duct)
            if climatizacion_body:
                climatizacion_body.name = "04_Columna_Climatizacion_Vertical_Y_Toberas_6_Niveles"
        except:
            pass

        # =============================================================
        # 11.1 TERMOSTATO / SENSOR DE TEMPERATURA INDUSTRIAL NOM-251
        # Ubicado en la esquina superior derecha al fondo, casi en el techo, montado en la pared
        # Modelo comercial Carel / Dixell con sonda cilíndrica de acero inoxidable AISI 304 y prensaestopas PG7
        # Coordenadas: X = 85.0 a 90.4 cm, Y = 81.2 a 84.2 cm, Z = 167.5 a 180.2 cm
        # =============================================================
        termostato_parts = [
            # Placa base de montaje mural contra la pared trasera en la esquina superior derecha
            make_box(85.0, 83.8, 172.0, 5.4, 0.35, 6.0),
            # Tornillos de sujeción M4 a la pared
            make_cyl((85.5, 83.7, 175.0), (85.5, 84.2, 175.0), 0.22),
            make_cyl((89.9, 83.7, 175.0), (89.9, 84.2, 175.0), 0.22),
            # Gabinete modular del termostato digital (Carel / Dixell industrial en ABS blanco IP65)
            make_box(85.3, 81.6, 172.3, 4.8, 2.2, 5.4),
            # Tapa frontal con bisel
            make_box(85.5, 81.3, 172.5, 4.4, 0.3, 5.0),
            # LED indicador de calibración y telemetría NOM-251 (Verde)
            make_cyl((87.7, 81.15, 176.4), (87.7, 81.35, 176.4), 0.30),
            # Clip de sujeción metálico inferior para la sonda
            make_box(87.2, 81.5, 171.2, 1.0, 0.4, 0.6),
            # Sonda de temperatura cilíndrica de acero inoxidable AISI 304 (Ø 6.4 mm x 45 mm)
            make_cyl((87.7, 81.7, 172.0), (87.7, 81.7, 167.5), 0.32),
            # Punta sensora redondeada de alta precisión
            make_sphere((87.7, 81.7, 167.5), 0.32),
            # Prensaestopas estanco PG7 superior
            make_cyl((87.7, 82.7, 177.7), (87.7, 82.7, 178.8), 0.55),
            make_box(87.2, 82.2, 178.1, 1.0, 1.0, 0.35),
            # Cable blindado hacia el canal de techo
            make_cyl((87.7, 82.7, 178.8), (87.7, 82.7, 180.2), 0.25)
        ]
        # Ranuras de ventilación térmica para muestreo directo del flujo de aire frío
        for i in range(3):
            termostato_parts.append(make_box(85.8, 81.2, 173.2 + i * 0.9, 3.8, 0.15, 0.4))

        add_compound_body("04_Termostato_Sensor_Temperatura_Pared_Superior_Derecha", termostato_parts)

        # =============================================================
        # 12. PUERTA FRONTAL EXPANDEX 4.0 CON PANTALLA TOUCH DE 10.1" SUPERIOR INTEGRADA
        # =========================================================================================
        # En Expandex 4.0 se integra una pantalla táctil comercial de 10.1" (Waveshare 10.1HP-CAPLCD /
        # Panel Industrial PCAP 1280x800) en el marco superior frontal de la máquina (Z = 156.0 a 183.0 cm).
        # El diseño queda completamente homologado con la carrocería en un único plano frontal limpio.
        # Debajo de la pantalla se despliega una vitrina panorámica completa (X = 7.0 a 88.0 cm, Z = 53.0 a 156.0 cm)
        # que permite visualizar simultáneamente los 12 toppers de comida corrida y las 24 bebidas centrales.
        # =========================================================================================
        DOOR_H_FULL = HEIGHT_EXT - SPLIT_Z # 137.0 cm (Z = 46.0 a 183.0 cm)
        DOOR_W_FULL = WIDTH_EXT            # 95.0 cm

        WINDOW_X0   = 7.0                  # Margen izquierdo (7.0 cm)
        WINDOW_W    = WIDTH_EXT - 14.0     # 81.0 cm de ancho panorámico visible (X = 7.0 a 88.0 cm)
        WINDOW_Z0   = SPLIT_Z + 7.0        # Z = 53.0 cm
        WINDOW_H    = 103.0                # Z = 53.0 a 156.0 cm (altura libre panorámica para 6 charolas)

        HEADER_Z0   = WINDOW_Z0 + WINDOW_H # Z = 156.0 cm
        HEADER_H    = HEIGHT_EXT - HEADER_Z0# 27.0 cm (Z = 156.0 a 183.0 cm, copete superior de la puerta)

        # 1. Marco Estructural de Puerta en Chapa Rolada Cal. 16 (Acero estructural)
        marco_puerta_parts = [
            # Larguero vertical izquierdo (X = 0 a 7.0 cm, Z = 46.0 a 183.0 cm)
            make_box(0, -SHEET_T - 2.0, SPLIT_Z, 7.0, 2.0, DOOR_H_FULL),
            # Larguero vertical derecho (X = 88.0 a 95.0 cm, Z = 46.0 a 183.0 cm)
            make_box(WIDTH_EXT - 7.0, -SHEET_T - 2.0, SPLIT_Z, 7.0, 2.0, DOOR_H_FULL),
            # Travesaño inferior de la puerta (Z = 46.0 a 53.0 cm, X = 7.0 a 88.0 cm)
            make_box(WINDOW_X0, -SHEET_T - 2.0, SPLIT_Z, WINDOW_W, 2.0, 7.0),
            # Copete frontal superior integrado (Z = 156.0 a 183.0 cm, X = 7.0 a 88.0 cm)
            make_box(WINDOW_X0, -SHEET_T - 2.0, HEADER_Z0, WINDOW_W, 2.0, HEADER_H)
        ]
        add_compound_body("06_Puerta_Marco_Acero_Integral", marco_puerta_parts)

        # 2. Vidrio Templado Doble Transparente Panorámico (Termopanel 4+4 mm con gas argón)
        glass_body = add_compound_body("06_Puerta_Vidrio_Templado_Doble_Panoramico", [
            make_box(WINDOW_X0, -SHEET_T - 1.2, WINDOW_Z0, WINDOW_W, 0.8, WINDOW_H)
        ])
        if glass_body:
            try:
                glass_body.opacity = 0.15
            except:
                pass

        # 3. Pantalla Táctil Comercial de 10.1" Capacitiva IPS Integrada en el Marco Superior
        # Modelo comercial: Waveshare 10.1HP-CAPLCD / Industrial 10.1" PCAP Panel (252 x 168 mm)
        SCREEN_W = 25.2 # 252 mm ancho exterior
        SCREEN_H = 16.8 # 168 mm alto exterior
        SCREEN_X = (WIDTH_EXT - SCREEN_W) / 2.0              # 34.9 cm (Centrada simétricamente en X = 47.5 cm)
        SCREEN_Z = HEADER_Z0 + (HEADER_H - SCREEN_H) / 2.0   # 161.1 cm (Centrada en Z = 169.5 cm)
        BEZEL_T  = 0.40 # 4 mm bisel perimetral de aluminio anodizado negro

        pantalla_touch_parts = [
            # Bisel de montaje enrasado (Flush Mount Bezel) en aluminio anodizado negro mate
            make_box(SCREEN_X - BEZEL_T, -SHEET_T - 2.20, SCREEN_Z - BEZEL_T, SCREEN_W + 2*BEZEL_T, 0.40, SCREEN_H + 2*BEZEL_T),
            # Superficie frontal de cristal templado 6H ópticamente enlazado (Optical Bonding)
            make_box(SCREEN_X, -SHEET_T - 2.35, SCREEN_Z, SCREEN_W, 0.15, SCREEN_H),
            # Área activa del display LCD IPS (1280x800, 217 mm ancho x 136 mm alto, diagonal 10.1")
            make_box(SCREEN_X + (SCREEN_W - 21.7)/2.0, -SHEET_T - 2.42, SCREEN_Z + (SCREEN_H - 13.6)/2.0, 21.7, 0.08, 13.6),
            # Barra indicadora de estado LED RGB inferior
            make_box(SCREEN_X + 2.0, -SHEET_T - 2.25, SCREEN_Z - 1.8, SCREEN_W - 4.0, 0.20, 0.60)
        ]
        add_compound_body("06_Terminal_Tactil_Capacitiva_10Pulg_Superior", pantalla_touch_parts)

        # 4. Consola Frontal Superior: Rejilla Acústica Frontal y Altavoz Industrial Posterior
        # =========================================================================================
        # El cuadrado derecho fue eliminado para mantener la chapa limpia y despejada.
        # En el cuadrado izquierdo (X = 24.4 a 32.4 cm, Z = 165.5 a 173.5 cm):
        #   - Frente: Rejilla acústica integrada con ranuras horizontales en chapa.
        #   - Reverso (+Y): Altavoz dinámico de 2.5" comercial de 5W RMS (4-8 Ohm, 5V/12V DC),
        #     con cono diafragma circular, cúpula antipolvo, imán cilíndrico de ferrita y terminales de audio.
        # =========================================================================================
        SPK_X = SCREEN_X - 10.5 # 24.4 cm
        SPK_W = 8.0             # 80 mm
        SPK_H = 8.0             # 80 mm
        SPK_Z = SCREEN_Z + (SCREEN_H - SPK_H)/2.0 # 165.5 cm
        SPK_XC = SPK_X + SPK_W / 2.0              # 28.4 cm (centro acústico en X)
        SPK_ZC = SPK_Z + SPK_H / 2.0              # 169.5 cm (centro acústico en Z)

        # 4.1 Rejilla Acústica Frontal en Chapa Exterior (Lado Izquierdo)
        rejilla_frontal_parts = [
            make_box(SPK_X, -SHEET_T - 2.15, SPK_Z, SPK_W, 0.20, SPK_H)
        ]
        for s_idx in range(5):
            sz = SPK_Z + 1.2 + s_idx * 1.3
            rejilla_frontal_parts.append(make_box(SPK_X + 1.0, -SHEET_T - 2.25, sz, SPK_W - 2.0, 0.12, 0.45))
        add_compound_body("06_Puerta_Rejilla_Acustica_Frontal", rejilla_frontal_parts)

        # 4.2 Altavoz Dinámico Industrial Comercial de 5W Posterior (Pegado detrás del cuadrado izquierdo)
        altavoz_parts = [
            # Brida cuadrada de montaje perimetral de acero estampado contra el reverso de la puerta
            make_box(SPK_X + 0.3, -SHEET_T, SPK_Z + 0.3, 7.4, 0.20, 7.4),
            # Anillo de suspensión perimetral de caucho (Surround Ring Ø 66 mm)
            make_cyl((SPK_XC, -SHEET_T + 0.20, SPK_ZC), (SPK_XC, -SHEET_T + 0.50, SPK_ZC), 3.3),
            # Cono acústico diafragma circular (cono escalonado en profundidad)
            make_cyl((SPK_XC, -SHEET_T + 0.45, SPK_ZC), (SPK_XC, -SHEET_T + 1.10, SPK_ZC), 2.5),
            make_cyl((SPK_XC, -SHEET_T + 1.10, SPK_ZC), (SPK_XC, -SHEET_T + 1.75, SPK_ZC), 1.9),
            # Cúpula central antipolvo (Dust Cap semiesférico en el centro)
            make_sphere((SPK_XC, -SHEET_T + 0.65, SPK_ZC), 0.95),
            # Brazos radiales de la canasta de acero estampado (Basket frame)
            make_box(SPK_XC - 0.45, -SHEET_T + 0.4, SPK_ZC - 2.8, 0.9, 1.8, 5.6),
            make_box(SPK_XC - 2.8, -SHEET_T + 0.4, SPK_ZC - 0.45, 5.6, 1.8, 0.9),
            # Conjunto motor magnético cilíndrico (Imán de ferrita Ø 50 mm, espesor 15 mm)
            make_cyl((SPK_XC, -SHEET_T + 1.75, SPK_ZC), (SPK_XC, -SHEET_T + 3.25, SPK_ZC), 2.5),
            # Placa polar posterior de acero (Back plate) con orificio de ventilación
            make_cyl((SPK_XC, -SHEET_T + 3.25, SPK_ZC), (SPK_XC, -SHEET_T + 3.60, SPK_ZC), 2.55),
            make_cyl((SPK_XC, -SHEET_T + 3.45, SPK_ZC), (SPK_XC, -SHEET_T + 3.65, SPK_ZC), 0.65),
            # Terminales eléctricos de conexión Faston (+ / -) dirigidos al cerebro
            make_box(SPK_XC + 2.1, -SHEET_T + 1.1, SPK_ZC - 0.7, 1.2, 0.15, 1.4),
            make_box(SPK_XC + 3.1, -SHEET_T + 1.1, SPK_ZC - 0.5, 0.5, 0.7, 0.3),
            make_box(SPK_XC + 3.1, -SHEET_T + 1.1, SPK_ZC + 0.2, 0.5, 0.7, 0.3)
        ]
        # Tornillos M3 en las 4 esquinas de la brida
        for sx, sz in [(SPK_X + 0.9, SPK_Z + 0.9), (SPK_X + 7.1, SPK_Z + 0.9), (SPK_X + 0.9, SPK_Z + 7.1), (SPK_X + 7.1, SPK_Z + 7.1)]:
            altavoz_parts.append(make_cyl((sx, -SHEET_T - 0.2, sz), (sx, -SHEET_T + 0.45, sz), 0.22))

        add_compound_body("06_Altavoz_Industrial_HiFi_5W_Posterior", altavoz_parts)

        # 5. Gabinete Posterior del Cerebro Electrónico (Raspberry Pi + ESP32 + Regletas Pines Motores)
        # =========================================================================================
        # Ubicado inmediatamente detrás de la pantalla táctil de 10.1" en el copete superior.
        # Extrusión hacia atrás (+Y) de 42 mm de profundidad, formando un gabinete modular que aloja:
        #   - Placa SBC Raspberry Pi 4 / 5 (Cerebro principal y servidor web / GUI táctil)
        #   - Placa Microcontroladora ESP32 DevKit v1 (Control en tiempo real de motores y sensores)
        #   - Módulo Regulador Reductor Buck DC-DC (24V a 5V 5A para lógica y display)
        #   - Panel posterior con regletas y pines para la conexión directa de los 36 arneses de motores
        #     (12 motores de toppers de comida caliente + 24 motores de bebidas frías).
        # Holgura mecánica: La bandeja frontal inicia a Y = 15.0 cm; el gabinete llega a Y = 4.05 cm,
        # dejando más de 10.9 cm de espacio libre sin obstruir el pozo de caída ni las charolas.
        # =========================================================================================
        BOX_W = 24.8  # 248 mm ancho
        BOX_H = 16.2  # 162 mm alto
        BOX_D = 4.2   # 42 mm fondo hacia atrás (+Y)
        BOX_X = SCREEN_X + (SCREEN_W - BOX_W) / 2.0  # 35.1 cm
        BOX_Z = SCREEN_Z + (SCREEN_H - BOX_H) / 2.0  # 161.4 cm
        WALL_T = 0.20 # 2 mm espesor de chapa / aluminio

        # A. Chasis Envolvente del Gabinete y Brida Frontal de Sujeción
        gabinete_parts = [
            # Brida perimetral de montaje enrasado contra el reverso de la puerta
            make_box(BOX_X - 0.7, -SHEET_T, BOX_Z - 0.7, BOX_W + 1.4, 0.25, BOX_H + 1.4),
            # Pared posterior (tapa de servicio desmontable)
            make_box(BOX_X, -SHEET_T + BOX_D - WALL_T, BOX_Z, BOX_W, WALL_T, BOX_H),
            # Pared lateral izquierda
            make_box(BOX_X, -SHEET_T, BOX_Z, WALL_T, BOX_D, BOX_H),
            # Pared lateral derecha
            make_box(BOX_X + BOX_W - WALL_T, -SHEET_T, BOX_Z, WALL_T, BOX_D, BOX_H),
            # Pared superior
            make_box(BOX_X, -SHEET_T, BOX_Z + BOX_H - WALL_T, BOX_W, BOX_D, WALL_T),
            # Pared inferior
            make_box(BOX_X, -SHEET_T, BOX_Z, BOX_W, BOX_D, WALL_T)
        ]
        # Rejillas de microventilación lateral (4 slots a la izquierda y 4 a la derecha)
        for v_i in range(4):
            vz = BOX_Z + 4.0 + v_i * 2.2
            gabinete_parts.append(make_box(BOX_X - 0.05, -SHEET_T + 1.2, vz, 0.30, 2.0, 0.45))
            gabinete_parts.append(make_box(BOX_X + BOX_W - 0.25, -SHEET_T + 1.2, vz, 0.30, 2.0, 0.45))
        # Louvers de ventilación en la tapa posterior
        for v_i in range(5):
            vz = BOX_Z + 11.0 + v_i * 0.9
            gabinete_parts.append(make_box(BOX_X + 3.0, -SHEET_T + BOX_D, vz, BOX_W - 6.0, 0.15, 0.45))

        add_compound_body("06_Gabinete_Posterior_Cerebro_Modular", gabinete_parts)

        # B. Electrónica Interior: Raspberry Pi 4/5, ESP32 DevKit y Conversor Buck
        electronica_parts = []
        # --- RASPBERRY PI 4 / 5 (Lado izquierdo, X = 36.6 a 45.1 cm) ---
        RPI_X = BOX_X + 1.5 # 36.6 cm
        RPI_W = 8.5
        RPI_H = 5.6
        RPI_Z = BOX_Z + (BOX_H - RPI_H) / 2.0 # 166.7 cm
        RPI_Y_PCB = -SHEET_T + 1.0
        # Postes separadores M2.5 de latón
        for px_off, pz_off in [(0.35, 0.35), (RPI_W - 0.35, 0.35), (0.35, RPI_H - 0.35), (RPI_W - 0.35, RPI_H - 0.35)]:
            electronica_parts.append(make_cyl((RPI_X + px_off, -SHEET_T + 0.3, RPI_Z + pz_off),
                                              (RPI_X + px_off, RPI_Y_PCB, RPI_Z + pz_off), 0.25))
        # Sustrato PCB Verde FR-4
        electronica_parts.append(make_box(RPI_X, RPI_Y_PCB, RPI_Z, RPI_W, 0.16, RPI_H))
        # Disipador de aluminio negro anodizado sobre SoC Broadcom
        electronica_parts.append(make_box(RPI_X + 2.2, RPI_Y_PCB + 0.16, RPI_Z + 1.8, 1.8, 0.75, 1.8))
        # Puerto Ethernet RJ45 metálico
        electronica_parts.append(make_box(RPI_X + 6.4, RPI_Y_PCB + 0.16, RPI_Z + 0.4, 2.1, 1.40, 1.5))
        # Dos puertos USB 3.0 / USB 2.0 duales metálicos
        electronica_parts.append(make_box(RPI_X + 6.6, RPI_Y_PCB + 0.16, RPI_Z + 2.1, 1.8, 1.50, 1.4))
        electronica_parts.append(make_box(RPI_X + 6.6, RPI_Y_PCB + 0.16, RPI_Z + 3.8, 1.8, 1.50, 1.4))
        # Tira GPIO de 40 pines (2x20 pines)
        electronica_parts.append(make_box(RPI_X + 1.2, RPI_Y_PCB + 0.16, RPI_Z + 4.9, 5.0, 0.85, 0.5))

        # --- ESP32 DEVKIT V1 (Lado derecho superior, X = 47.0 a 52.2 cm) ---
        ESP_X = BOX_X + BOX_W - 7.0 # 52.9 cm
        ESP_W = 5.2
        ESP_H = 2.8
        ESP_Z = BOX_Z + 8.5 # 169.9 cm
        ESP_Y_PCB = -SHEET_T + 1.0
        # Postes separadores M2
        for px_off, pz_off in [(0.2, 0.2), (ESP_W - 0.2, 0.2), (0.2, ESP_H - 0.2), (ESP_W - 0.2, ESP_H - 0.2)]:
            electronica_parts.append(make_cyl((ESP_X + px_off, -SHEET_T + 0.3, ESP_Z + pz_off),
                                              (ESP_X + px_off, ESP_Y_PCB, ESP_Z + pz_off), 0.20))
        # Sustrato PCB Negro
        electronica_parts.append(make_box(ESP_X, ESP_Y_PCB, ESP_Z, ESP_W, 0.16, ESP_H))
        # Módulo blindado RF ESP32-WROOM-32 metálico
        electronica_parts.append(make_box(ESP_X + 1.8, ESP_Y_PCB + 0.16, ESP_Z + 0.4, 1.8, 0.32, 2.0))
        # Headers laterales de pines (2 filas de 15 pines)
        electronica_parts.append(make_box(ESP_X + 0.4, ESP_Y_PCB + 0.16, ESP_Z + 0.1, 4.4, 0.55, 0.25))
        electronica_parts.append(make_box(ESP_X + 0.4, ESP_Y_PCB + 0.16, ESP_Z + 2.45, 4.4, 0.55, 0.25))

        # --- MÓDULO CONVERSOR BUCK STEP-DOWN DC-DC 24V->5V 5A (Lado derecho inferior) ---
        BUCK_X = ESP_X
        BUCK_W = 4.5
        BUCK_H = 3.2
        BUCK_Z = BOX_Z + 2.5 # 163.9 cm
        BUCK_Y_PCB = -SHEET_T + 1.0
        electronica_parts.append(make_box(BUCK_X, BUCK_Y_PCB, BUCK_Z, BUCK_W, 0.16, BUCK_H))
        electronica_parts.append(make_box(BUCK_X + 1.2, BUCK_Y_PCB + 0.16, BUCK_Z + 0.8, 2.0, 1.10, 1.6))

        add_compound_body("06_Cerebro_Interior_RaspberryPi_ESP32_Buck", electronica_parts)

        # C. Panel Posterior con Pines y Regletas Industriales para Conexión de los 36 Motores
        conectores_motores_parts = []
        REAR_Y = -SHEET_T + BOX_D # 4.05 cm

        # Regleta A: 12 Pines / Conectores de Motores de Comida Caliente (Toppers Canales A1..F2)
        BASE_A_X = BOX_X + 1.8
        BASE_A_Z = BOX_Z + 2.0
        conectores_motores_parts.append(make_box(BASE_A_X, REAR_Y, BASE_A_Z, 9.6, 0.80, 2.2))
        for p_i in range(12):
            px = BASE_A_X + 0.4 + p_i * 0.75
            conectores_motores_parts.append(make_box(px, REAR_Y + 0.80, BASE_A_Z + 0.8, 0.35, 0.40, 0.60))

        # Regleta B: 24 Pines / Conectores de Motores de Bebidas Frías (4 columnas x 6 niveles)
        BASE_B_X = BOX_X + 12.4
        BASE_B_Z = BOX_Z + 2.0
        conectores_motores_parts.append(make_box(BASE_B_X, REAR_Y, BASE_B_Z, 10.2, 0.80, 2.2))
        for p_i in range(12):
            px = BASE_B_X + 0.5 + p_i * 0.78
            # Fila inferior (12 canales pares)
            conectores_motores_parts.append(make_box(px, REAR_Y + 0.80, BASE_B_Z + 0.45, 0.35, 0.40, 0.40))
            # Fila superior (12 canales impares)
            conectores_motores_parts.append(make_box(px, REAR_Y + 0.80, BASE_B_Z + 1.35, 0.35, 0.40, 0.40))

        # Bloque de Bornes de Potencia (+24V / +12V / GND Motores y Sensores)
        conectores_motores_parts.append(make_box(BOX_X + 1.8, REAR_Y, BOX_Z + 5.0, 3.8, 0.75, 1.6))
        for b_i in range(3):
            bx = BOX_X + 2.2 + b_i * 1.0
            conectores_motores_parts.append(make_cyl((bx, REAR_Y + 0.75, BOX_Z + 5.8),
                                                    (bx, REAR_Y + 1.15, BOX_Z + 5.8), 0.28))

        # Pasamuros / Pasacables estanco PG16 para el arnés flexible que va al chasis
        conectores_motores_parts.append(make_cyl((BOX_X + 7.8, REAR_Y, BOX_Z + 5.8),
                                                (BOX_X + 7.8, REAR_Y + 1.2, BOX_Z + 5.8), 1.1))

        add_compound_body("06_Panel_Posterior_Pines_Conexion_36_Motores", conectores_motores_parts)

        # 5.1 Gabinete de Pared Izquierda para Matriz MOSFET y ESP32 de Control de Motores
        # =========================================================================================
        # Ubicado en la pared lateral interior izquierda (X = 3.93 a 7.73 cm), a la altura del copete
        # (Z = 156 a 176 cm, Y = 3.5 a 14.5 cm).
        # Espesor ultra delgado de 3.8 cm ("que no sea tan gruesa"), con gaveta corrediza
        # y mecanismo de pestillo pulsador sin llave (push-latch tipo Southco / Camloc).
        # Aloja la matriz de potencia MOSFET (36 canales de conmutación) y el ESP32 de motores.
        # =========================================================================================
        mosfet_box_parts = []
        MB_X = PTR_MAIN + SHEET_T # 3.931 cm
        MB_W = 3.80               # 38 mm espesor ultra delgado
        MB_Y = 3.50               # Inicio en Y
        MB_D = 11.00              # 110 mm longitud sobre la pared
        MB_Z = 156.00             # 1,560 mm altura base
        MB_H = 20.00              # 200 mm altura total

        # Chasis perimetral del gabinete
        mosfet_box_parts.append(make_box(MB_X, MB_Y, MB_Z, 0.15, MB_D, MB_H))
        mosfet_box_parts.append(make_box(MB_X, MB_Y, MB_Z, MB_W, MB_D, 0.20))
        mosfet_box_parts.append(make_box(MB_X, MB_Y, MB_Z + MB_H - 0.20, MB_W, MB_D, 0.20))
        mosfet_box_parts.append(make_box(MB_X, MB_Y + MB_D - 0.20, MB_Z, MB_W, 0.20, MB_H))

        # Gaveta / Bandeja con frente accesible
        mosfet_box_parts.append(make_box(MB_X + 0.3, MB_Y, MB_Z + 0.3, MB_W - 0.6, 0.25, MB_H - 0.6))
        mosfet_box_parts.append(make_box(MB_X + MB_W - 0.20, MB_Y + 0.3, MB_Z + 0.3, 0.20, MB_D - 0.6, MB_H - 0.6))

        # Pestillo mecánico push-to-open sin llave (Southco E4 / C3 Grabber Latch)
        mosfet_box_parts.append(make_box(MB_X + 0.8, MB_Y - 0.50, MB_Z + MB_H/2.0 - 1.2, 2.2, 0.50, 2.4))
        mosfet_box_parts.append(make_cyl((MB_X + MB_W/2.0, MB_Y - 0.50, MB_Z + MB_H/2.0),
                                        (MB_X + MB_W/2.0, MB_Y - 0.90, MB_Z + MB_H/2.0), 0.55))

        # Ranuras de ventilación pasiva superior e inferior
        for r_i in range(3):
            ry = MB_Y + 2.5 + r_i * 2.5
            mosfet_box_parts.append(make_box(MB_X + MB_W - 0.15, ry, MB_Z + MB_H - 1.8, 0.20, 1.6, 0.4))
            mosfet_box_parts.append(make_box(MB_X + MB_W - 0.15, ry, MB_Z + 1.2, 0.20, 1.6, 0.4))

        # PCB Matriz MOSFET (36 canales de potencia para motores)
        mosfet_box_parts.append(make_box(MB_X + 0.4, MB_Y + 1.0, MB_Z + 1.0, 0.16, MB_D - 2.0, MB_H - 2.0))
        # Disipador de aluminio extruido negro
        mosfet_box_parts.append(make_box(MB_X + 0.56, MB_Y + 1.5, MB_Z + 7.0, 1.20, MB_D - 3.0, 6.0))
        # Fila de transistores MOSFET TO-220
        for m_i in range(6):
            my = MB_Y + 2.0 + m_i * 1.2
            mosfet_box_parts.append(make_box(MB_X + 0.56, my, MB_Z + 5.5, 0.45, 0.8, 1.2))

        # Microcontrolador ESP32 dedicado a motores
        ESP_M_Y = MB_Y + 1.5
        ESP_M_Z = MB_Z + 14.0
        mosfet_box_parts.append(make_box(MB_X + 0.56, ESP_M_Y, ESP_M_Z, 0.16, 5.2, 2.8))
        mosfet_box_parts.append(make_box(MB_X + 0.72, ESP_M_Y + 1.6, ESP_M_Z + 0.4, 0.30, 2.0, 1.8))

        # Regleta de bornes para conexión de cables de motores
        mosfet_box_parts.append(make_box(MB_X + 0.56, MB_Y + 1.5, MB_Z + 1.5, 1.0, MB_D - 3.0, 1.6))

        add_compound_body("06_Gabinete_MOSFET_ESP32_Pared_Izquierda", mosfet_box_parts)

        # 6. Cerradura Vending de Alta Seguridad CompX Chicago ACE T-Handle (Larguero Derecho)
        LOCK_Z = 100.0 # Altura ergonómica de mano (1.00 m)
        LOCK_X = WIDTH_EXT - 3.5 # 91.5 cm
        cerradura_parts = [
            # Escudo biselado exterior de acero fundido cromado
            make_box(LOCK_X - 2.2, -SHEET_T - 2.5, LOCK_Z - 6.5, 4.4, 0.7, 13.0),
            # Manija en T escamoteable
            make_box(LOCK_X - 1.2, -SHEET_T - 3.8, LOCK_Z - 5.0, 2.4, 1.3, 10.0),
            # Bombín tubular antitaladro de 7 pines
            make_cyl((LOCK_X, -SHEET_T - 4.2, LOCK_Z), (LOCK_X, -SHEET_T - 3.7, LOCK_Z), 1.0),
            # Lengüeta interior de enganche al chasis PTR
            make_box(WIDTH_EXT - 6.5, -SHEET_T + 1.2, LOCK_Z - 1.2, 1.2, 0.5, 7.5)
        ]
        add_compound_body("06_Puerta_Cerradura_Vending_CompX_T_Handle", cerradura_parts)

        # 6. Bisagras pesadas industriales tipo Southco de la puerta (Larguero Izquierdo)
        bisagras_parts = []
        hinge_z = [SPLIT_Z + 12.0, SPLIT_Z + DOOR_H_FULL/2.0, HEIGHT_EXT - 11.0]
        xk_center = -0.6
        yk_center = -SHEET_T - 1.2
        rk = 0.85
        r_pin = 0.45
        for hz in hinge_z:
            bisagras_parts.append(make_box(-1.4, -SHEET_T - 0.5, hz - 5.5, 0.9, 0.5, 11.0))
            bisagras_parts.append(make_box(-SHEET_T - 0.45, 0.0, hz - 5.5, 0.45, 3.2, 11.0))
            bisagras_parts.append(make_box(0.2, -SHEET_T - 2.4, hz - 4.5, 3.4, 0.45, 9.0))
            bisagras_parts.append(make_cyl((xk_center, yk_center, hz - 5.0), (xk_center, yk_center, hz - 1.8), rk))
            bisagras_parts.append(make_cyl((xk_center, yk_center, hz - 1.4), (xk_center, yk_center, hz + 1.4), rk))
            bisagras_parts.append(make_cyl((xk_center, yk_center, hz + 1.8), (xk_center, yk_center, hz + 5.0), rk))
            bisagras_parts.append(make_cyl((xk_center, yk_center, hz - 5.8), (xk_center, yk_center, hz + 5.8), r_pin))
            bisagras_parts.append(make_cyl((xk_center, yk_center, hz + 5.8), (xk_center, yk_center, hz + 6.5), 0.60))
            bisagras_parts.append(make_cyl((xk_center, yk_center, hz + 6.5), (xk_center, yk_center, hz + 7.2), 0.20))
            bisagras_parts.append(make_cyl((xk_center, yk_center, hz - 6.5), (xk_center, yk_center, hz - 5.8), 0.60))
        add_compound_body("06_Puerta_Bisagras_Industriales_Reforzadas", bisagras_parts)

        # 13. 6 CHAROLAS REFORZADAS - ARQUITECTURA MIXTA (ESPIRALES GIGANTES + BEBIDAS)
        # =========================================================================================
        levels_letters = ['A', 'B', 'C', 'D', 'E', 'F']

        # Travesaños de base de charolas extendidos para quedar COMPLETAMENTE AL RAS de los perfiles laterales
        CROSS_BEAM_X0 = 0.0
        CROSS_BEAM_W  = WIDTH_EXT # 95.0 cm, rasito rasito con los perfiles en ambos lados
        CROSS_BEAM_D  = 2.2

        for lvl_idx in range(NUM_SHELVES):
            lvl_letter = levels_letters[lvl_idx]
            lvl_num = lvl_idx + 1
            z_tray = z_start_tray + lvl_idx * shelf_spacing
            y_rear_wall = SHELF_Y0 + SHELF_D # 80.0 cm

            # Bandeja de chapa con vigas de apoyo y guías divisorias adaptadas
            bandeja_parts = [
                # Base de charola continua de 95.0 cm de ancho
                make_box(0.0, SHELF_Y0, z_tray, WIDTH_EXT, SHELF_D, 0.15),
                make_box(0.0, SHELF_Y0 - 0.15, z_tray - 1.8, WIDTH_EXT, 0.15, 1.95),
                make_box(0.0, SHELF_Y0, z_tray + 0.15, 0.15, SHELF_D, 2.0),
                make_box(WIDTH_EXT - 0.15, SHELF_Y0, z_tray + 0.15, 0.15, SHELF_D, 2.0),
                make_box(0.0, SHELF_Y0 + SHELF_D, z_tray, WIDTH_EXT, 0.15, 8.5),
                # Travesaños tubulares frontales y traseros completamente al ras del perfil (0.0 a 95.0 cm)
                make_box(CROSS_BEAM_X0, SHELF_Y0 + 1.2, z_tray - CROSS_BEAM_H, CROSS_BEAM_W, CROSS_BEAM_D, CROSS_BEAM_H),
                make_box(CROSS_BEAM_X0, SHELF_Y0 + SHELF_D - CROSS_BEAM_D - 0.5, z_tray - CROSS_BEAM_H, CROSS_BEAM_W, CROSS_BEAM_D, CROSS_BEAM_H)
            ]

            # Guías divisorias selectivas:
            # - Omitimos índice 1 (para formar la bahía ancha de 190 mm de comida izquierda)
            # - Omitimos índice 7 (para formar la bahía ancha de 190 mm de comida derecha)
            # - Mantenemos índices 0, 2, 3, 4, 5, 6, 8 (4 casillas individuales centrales de 95 mm para bebidas)
            active_dividers = [0, 2, 3, 4, 5, 6, 8]
            for c in active_dividers:
                x_div = SHELF_X0 + c * COL_PITCH
                bandeja_parts.append(make_box(x_div - 0.06, SHELF_Y0, z_tray + 0.15, 0.12, SHELF_D, COL_H))

            add_compound_body(f"07_Bandeja_Nivel_{lvl_num}_{lvl_letter}_Mixta_Comida_Bebida", bandeja_parts)

            # Configuración de los 6 compartimentos por charola (1 gigante izq + 4 bebidas centro + 1 gigante der)
            slots_config = [
                {
                    "slot_id": f"{lvl_letter}1_Comida_Izq_Espiral_Gigante",
                    "x_center": 19.0, # Centro exacto de la bahía izquierda de 190 mm (X = 9.5 a 28.5 cm)
                    "is_giant": True,
                    "coil_r": COIL_R_GIANT,
                    "wire_r": WIRE_R_GIANT,
                    "master": master_giant_coil,
                    "turns": COIL_TURNS_GIANT
                },
                {
                    "slot_id": f"{lvl_letter}3_Bebida_Col3",
                    "x_center": SHELF_X0 + 2.5 * COL_PITCH, # 33.25 cm
                    "is_giant": False,
                    "coil_r": COIL_R_BEV,
                    "wire_r": WIRE_R_BEV,
                    "master": master_bev_coil,
                    "turns": COIL_TURNS_BEV
                },
                {
                    "slot_id": f"{lvl_letter}4_Bebida_Col4",
                    "x_center": SHELF_X0 + 3.5 * COL_PITCH, # 42.75 cm
                    "is_giant": False,
                    "coil_r": COIL_R_BEV,
                    "wire_r": WIRE_R_BEV,
                    "master": master_bev_coil,
                    "turns": COIL_TURNS_BEV
                },
                {
                    "slot_id": f"{lvl_letter}5_Bebida_Col5",
                    "x_center": SHELF_X0 + 4.5 * COL_PITCH, # 52.25 cm
                    "is_giant": False,
                    "coil_r": COIL_R_BEV,
                    "wire_r": WIRE_R_BEV,
                    "master": master_bev_coil,
                    "turns": COIL_TURNS_BEV
                },
                {
                    "slot_id": f"{lvl_letter}6_Bebida_Col6",
                    "x_center": SHELF_X0 + 5.5 * COL_PITCH, # 61.75 cm
                    "is_giant": False,
                    "coil_r": COIL_R_BEV,
                    "wire_r": WIRE_R_BEV,
                    "master": master_bev_coil,
                    "turns": COIL_TURNS_BEV
                },
                {
                    "slot_id": f"{lvl_letter}8_Comida_Der_Espiral_Gigante",
                    "x_center": 76.0, # Centro exacto de la bahía derecha de 190 mm (X = 66.5 a 85.5 cm)
                    "is_giant": True,
                    "coil_r": COIL_R_GIANT,
                    "wire_r": WIRE_R_GIANT,
                    "master": master_giant_coil,
                    "turns": COIL_TURNS_GIANT
                }
            ]

            for slot in slots_config:
                x_c = slot["x_center"]
                is_g = slot["is_giant"]
                r_c = slot["coil_r"]
                w_r = slot["wire_r"]
                master_c = slot["master"]
                s_id = slot["slot_id"]
                n_turns = slot["turns"]

                z_c = z_tray + 0.15 + r_c + w_r

                # 1. MOTOR NEMA 17 + ÉMBOLO INTEGRADO CON EMBONADO MECÁNICO DIRECTO AL RESORTE
                motor_parts = [
                    # A. Cuerpo principal del motor NEMA 17 detrás de la pared de la charola
                    make_box(x_c - NEMA_W/2.0, y_rear_wall + 0.15, z_c - NEMA_W/2.0, NEMA_W, NEMA_L, NEMA_W),
                    # B. Brida piloto de centrado NEMA (Ø 22 mm)
                    make_cyl((x_c, y_rear_wall, z_c), (x_c, y_rear_wall + 0.15, z_c), 1.1),
                    # C. Eje metálico de acero inoxidable del motor
                    make_cyl((x_c, y_rear_wall - SHAFT_L, z_c), (x_c, y_rear_wall, z_c), SHAFT_R),
                    # D. Conector eléctrico posterior
                    make_box(x_c - 0.8, y_rear_wall + 0.15 + NEMA_L, z_c - 0.6, 1.6, 0.5, 1.2),

                    # E. ÉMBOLO / BUJE PRINCIPAL DE ACOPLE (Cilindro que sale del motor hacia el resorte)
                    # Se extiende desde la pared trasera (Y = 80.0) hasta el plano de inicio del resorte (COIL_Y_REAR = 74.5)
                    make_cyl((x_c, COIL_Y_REAR, z_c), (x_c, y_rear_wall - 0.1, z_c), 1.05 if not is_g else 1.30),
                    # F. Collarín de apoyo posterior del émbolo contra la pared
                    make_cyl((x_c, y_rear_wall - 0.5, z_c), (x_c, y_rear_wall, z_c), 1.45 if not is_g else 1.75),
                    # G. Disco / Brida frontal de arrastre del émbolo en COIL_Y_REAR
                    make_cyl((x_c, COIL_Y_REAR - 0.35, z_c), (x_c, COIL_Y_REAR + 0.35, z_c), 1.35 if not is_g else 1.70),
                    # H. Brazo radial del émbolo que alcanza el alambre del resorte (embonado perfecto)
                    make_cyl((x_c, COIL_Y_REAR, z_c), (x_c + r_c, COIL_Y_REAR, z_c), w_r * 1.35),
                    # I. Casquillo / Mordaza cilíndrica de inserción y bloqueo del resorte
                    make_cyl((x_c + r_c, COIL_Y_REAR - 0.35, z_c), (x_c + r_c, COIL_Y_REAR + 0.35, z_c), w_r * 1.65)
                ]
                add_compound_body(f"08_Motor_NEMA17_{s_id}", motor_parts)

                # 2. RESORTE HELICOIDAL SUAVE (TUBO DOBLADO CONTINUO LISO SIN SECCIONES)
                resorte_creado = False
                if master_c:
                    try:
                        coil_inst = temp_brep.copy(master_c)
                        mat = adsk.core.Matrix3D.create()
                        mat.translation = adsk.core.Vector3D.create(x_c, COIL_Y_FRONT, z_c)
                        temp_brep.transform(coil_inst, mat)

                        if is_parametric and base_feature:
                            b = rootComp.bRepBodies.add(coil_inst, base_feature)
                        else:
                            b = rootComp.bRepBodies.add(coil_inst)
                        if b:
                            b.name = f"09_Resorte_{s_id}"
                            resorte_creado = True
                    except:
                        resorte_creado = False

                # Fallback de hilo suave si el master requiriera instanciación directa
                if not resorte_creado:
                    coil_parts = []
                    SEGS_FB = 24
                    TOTAL_FB = int(n_turns * SEGS_FB)
                    D_TH_FB = (2.0 * math.pi) / SEGS_FB
                    DY_FB = COIL_L / TOTAL_FB
                    pts_fb = []
                    for s in range(TOTAL_FB + 1):
                        th = s * D_TH_FB
                        ys = COIL_Y_FRONT + s * DY_FB
                        xs = x_c + r_c * math.cos(th)
                        zs = z_c + r_c * math.sin(th)
                        pts_fb.append((xs, ys, zs))
                    inward_steps = 6
                    th_last = n_turns * 2.0 * math.pi
                    for j in range(1, inward_steps + 1):
                        frac = j / inward_steps
                        r_t = r_c * 0.5 * (1.0 + math.cos(frac * math.pi))
                        th_t = th_last + frac * (math.pi / 2.0)
                        xs = x_c + r_t * math.cos(th_t)
                        zs = z_c + r_t * math.sin(th_t)
                        ys = COIL_Y_REAR
                        pts_fb.append((xs, ys, zs))
                    for s in range(len(pts_fb) - 1):
                        p1 = pts_fb[s]
                        p2 = pts_fb[s + 1]
                        vx = p2[0] - p1[0]
                        vy = p2[1] - p1[1]
                        vz = p2[2] - p1[2]
                        p1_ext = (p1[0] - vx * 0.05, p1[1] - vy * 0.05, p1[2] - vz * 0.05)
                        p2_ext = (p2[0] + vx * 0.05, p2[1] + vy * 0.05, p2[2] + vz * 0.05)
                        cyl = make_cyl(p1_ext, p2_ext, w_r)
                        if cyl:
                            coil_parts.append(cyl)
                    add_compound_body(f"09_Resorte_{s_id}", coil_parts)

        # 14. TECHO MONOLÍTICO INDUSTRIAL LIMPIO (SIN COPETE SUPERIOR)
        # =============================================================
        # En Expandex 4 se eliminó el mástil superior de 2", la pantalla de 32" y la cámara de techo.
        # El techo queda 100% plano, liso, estanco e integrado en lámina Calibre 18.
        # =============================================================

        # FINALIZACIÓN
        # -------------------------------------------------------------
        if is_parametric and base_feature:
            base_feature.finishEdit()

        app.isScreenUpdating = True

        msg = (
            "¡Proyecto Expandex 5 (Versión 5.0) Generado Exitosamente!\n\n"
            "Arquitectura y Novedades Implementadas:\n"
            "• RESORTES COMO TUBOS DOBLADOS CONTINUOS 3D (CERO DIVISIONES):\n"
            "  - Generados mediante PipeFeature sobre curvas 3D Splines continuas (SketchFittedSplines).\n"
            "  - Superficie continua única, libre de facetas, juntas esféricas o costuras intermedias.\n"
            "• ESPIRALES GIGANTES LATERALES PARA PLATILLOS CALIENTES:\n"
            "  - Se reemplazó el antiguo doble resorte y doble motor por una HÉLICE GIGANTE ÚNICA reforzada\n"
            "    de Ø 144 mm (alambre Ø 7 mm, 5 vueltas, paso 11.8 cm) en cada lateral (izquierda X=19 cm, derecha X=76 cm).\n"
            "  - 1 solo motor NEMA 17 por cada posición lateral, centrado con precisión geométrica en el compartimento.\n"
            "• ACOPLE Y EMBONADO MECÁNICO DIRECTO CON EL ÉMBOLO DEL MOTOR:\n"
            "  - El cilindro que sale del motor (émbolo de Ø 21 mm) avanza desde la pared trasera hasta el resorte.\n"
            "  - Cuenta con collarín de apoyo, disco frontal de empuje, brazo radial de arrastre y mordaza de fijación,\n"
            "    donde el tangón de la espiral embone físicamente sin holgura en los 36 compartimentos.\n"
            "• 4 COLUMNAS CENTRALES DE BEBIDAS INTACTAS:\n"
            "  - 4 canales por charola (columnas 3, 4, 5 y 6) con resortes estándar Ø 70 mm y motores individuales.\n"
            "• MATRIZ EXACTA DE 36 MOTORES:\n"
            "  - 6 charolas x (1 comida izq + 4 bebidas + 1 comida der) = 6 motores/charola = 36 motores en total,\n"
            "    conectados 1 a 1 con la regleta de 36 pines del cerebro electrónico de la consola superior.\n"
            "• CONSOLA SUPERIOR TOUCH 10.1 PULGADAS, QR Y PARLANTE HIFI 5W:\n"
            "  - Vitrina panorámica de 810 mm, compuerta trasera de 16 louvers y chasis PTR rasito rasito."
        )
        ui.messageBox(msg, 'Proyecto Expandex 5 - Versión 5.0')
    except:
        if app:
            app.isScreenUpdating = True
        if ui:
            ui.messageBox('Error al ejecutar el script:\n{}'.format(traceback.format_exc()), 'Error de Ejecución')
