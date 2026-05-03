<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Tetris - Hall of Fame</title>
    <style>
        body {
            background: #1a1a1d;
            color: #0DFF72;
            font-family: 'Courier New', Courier, monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
            --shake-intensity: 8px;
            transition: background 0.5s;
        }

        /* --- EFECTO FUEGO / HARDCORE --- */
        @keyframes fire-glow {
            0% { box-shadow: 0 0 10px #ff4500, inset 0 0 5px #ff0000; border-color: #ff4500; }
            50% { box-shadow: 0 0 30px #ff8c00, inset 0 0 20px #ff4500; border-color: #ff8c00; }
            100% { box-shadow: 0 0 10px #ff4500, inset 0 0 5px #ff0000; border-color: #ff4500; }
        }

        .hardcore-active {
            animation: fire-glow 0.5s infinite !important;
            background-color: #1a0500 !important; /* Fondo rojizo oscuro suave */
        }

        .score-hardcore {
            color: #ff4500 !important;
            text-shadow: 0 0 10px #ff0000, 2px 2px 2px #000;
        }

        @keyframes blink {
            0%, 18%, 22%, 25%, 53%, 57%, 100% { text-shadow: 0 0 10px #0DFF72, 0 0 20px #0DFF72; }
            20%, 24%, 55% { text-shadow: none; opacity: 0.8; }
        }

        @keyframes scanline {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .main-container {
            display: flex;
            gap: 30px;
            padding: 30px;
            background: #2a2a2e;
            border: 4px solid #333;
            border-radius: 15px;
            box-shadow: 0 0 50px rgba(0,0,0,0.9);
            position: relative;
        }

        canvas {
            border: 4px solid #fff;
            background-color: #000;
            box-shadow: 0 0 15px rgba(255,255,255,0.1);
        }

        .leaderboard {
            background: #000;
            padding: 20px;
            border: 2px solid #0DFF72;
            border-radius: 8px;
            width: 250px;
            box-shadow: inset 0 0 15px rgba(13, 255, 114, 0.2);
            display: flex;
            flex-direction: column;
        }

        .leaderboard h2 {
            text-align: center;
            font-size: 1.3rem;
            animation: blink 3s infinite;
            margin: 10px 0;
            color: #0DFF72;
            border-top: 1px solid #333;
            padding-top: 15px;
        }

        .score-item {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding-bottom: 5px;
            border-bottom: 1px dashed #222;
            animation: scanline 0.5s ease-out forwards;
        }

        /* Estilos de Hardcore para el panel lateral */
        .leaderboard.hardcore-active h2, 
        .leaderboard.hardcore-active .score-item {
            color: #ff4500 !important;
            border-color: #ff4500 !important;
            text-shadow: 0 0 10px #ff0000;
        }

        .leaderboard.hardcore-active {
            border-color: #ff4500 !important;
        }

        .leaderboard.hardcore-active #next {
            border-color: #ff4500 !important;
            box-shadow: 0 0 10px rgba(255, 69, 0, 0.5);
        }

        .btn-refresh {
            width: 100%;
            background: #0DFF72; /* Verde Neón original */
            border: none;
            padding: 10px;
            font-weight: bold;
            cursor: pointer;
            font-family: inherit;
            margin-top: 10px;
            transition: all 0.3s;
            /* Esto le da la forma inclinada de antes */
            clip-path: polygon(5% 0, 100% 0, 95% 100%, 0 100%);
            color: #000; /* Texto negro para contraste */
        }

        .btn-refresh:hover {
            background: #fff;
            box-shadow: 0 0 20px #0DFF72;
            transform: scale(1.02);
        }

        .btn-hardcore {
            width: 100%;
            background: #ff4500;
            color: white;
            border: none;
            padding: 10px;
            font-weight: bold;
            cursor: pointer;
            margin-bottom: 10px;
            clip-path: polygon(0 0, 100% 15%, 100% 100%, 0 85%);
            transition: transform 0.2s, background 0.3s;
        }

        .btn-hardcore:hover { transform: scale(1.05); background: #ff0000; }

        .stats {
            font-size: 2.5rem;
            margin-bottom: 15px;
            text-shadow: 0 0 5px #0DFF72;
        }

        .next-piece-container {
            text-align: center;
            margin-bottom: 15px;
        }
        
        #next {
            border: 2px solid #0DFF72;
            background: #000;
        }

        @keyframes shake {
            0% { transform: translate(0, 0); }
            10% { transform: translate(calc(-1 * var(--shake-intensity)), calc(0.5 * var(--shake-intensity))); }
            30% { transform: translate(var(--shake-intensity), calc(-1 * var(--shake-intensity))); }
            50% { transform: translate(calc(-0.5 * var(--shake-intensity)), var(--shake-intensity)); }
            70% { transform: translate(var(--shake-intensity), 0); }
            90% { transform: translate(calc(-0.2 * var(--shake-intensity)), calc(-0.2 * var(--shake-intensity))); }
            100% { transform: translate(0, 0); }
        }

        .shake-effect { animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both; }

        @keyframes score-pop {
            0% { transform: scale(1); color: #0DFF72; }
            50% { transform: scale(1.3); color: #fff; text-shadow: 0 0 20px #fff; }
            100% { transform: scale(1); color: #0DFF72; }
        }

        .score-animate {
            display: inline-block;
            animation: score-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        /* --- CAMBIO DEL BOTÓN REFRESCAR EN MODO HARDCORE --- */

        /* Cambia el fondo a naranja y el texto a blanco */
        .leaderboard.hardcore-active .btn-refresh {
            background: #ff4500 !important;
            color: #ffffff !important;
            box-shadow: 0 0 15px rgba(255, 69, 0, 0.4);
        }

        /* Efecto al pasar el ratón en modo Hardcore */
        .leaderboard.hardcore-active .btn-refresh:hover {
            background: #ffffff !important;
            color: #ff4500 !important;
            box-shadow: 0 0 25px #ff4500;
        }
        /* --- ESTÉTICA HARDCORE PARA TEXTOS LATERALES --- */

        /* Cambia "SIGUIENTE:" a naranja */
        .leaderboard.hardcore-active .next-piece-container p {
            color: #ff4500 !important;
            text-shadow: 0 0 8px #ff0000;
        }

        /* Brillo potente para nombres y puntos */
        .leaderboard.hardcore-active h2, 
        .leaderboard.hardcore-active .score-item span {
            color: #ff4500 !important;
            text-shadow: 0 0 10px #ff0000, 0 0 20px rgba(255, 69, 0, 0.6) !important;
        }

        /* Animación de pulso para que los nombres "brillen" */
        @keyframes text-glow-pulse {
            from { text-shadow: 0 0 10px #ff0000; }
            to { text-shadow: 0 0 20px #ff4500, 0 0 30px #ff0000; }
        }

        .leaderboard.hardcore-active .score-item {
            animation: text-glow-pulse 1.5s infinite alternate;
        }
    </style>
</head>
<body>
    <div class="main-container">
        <div style="text-align: center;">
            <div class="stats">SCORE: <span id="score" style="display: inline-block;">0</span></div>
            <canvas id="tetris" width="240" height="400"></canvas>
        </div>

        <div class="leaderboard">
            <div class="next-piece-container">
                <p style="margin-top: 0; font-size: 0.9rem; letter-spacing: 2px;">SIGUIENTE:</p>
                <canvas id="next" width="80" height="80"></canvas>
            </div>

            <button id="btn-hardcore" class="btn-hardcore" onclick="toggleHardcore()">ACTIVAR MODO HARDCORE</button>

            <h2>HALL OF FAME</h2>
            <div id="rank-list">
                <?php
                $archivo = 'puntos.json';
                if (file_exists($archivo)) {
                    $datos = json_decode(file_get_contents($archivo), true) ?: [];
                    usort($datos, function($a, $b) { return $b['puntos'] - $a['puntos']; });
                    $top5 = array_slice($datos, 0, 5);
                    
                    foreach ($top5 as $index => $jugador) {
                        echo "<div class='score-item' style='opacity: 1;'>";
                        echo "<span>" . ($index + 1) . ". " . htmlspecialchars($jugador['nombre']) . "</span>";
                        echo "<span>" . $jugador['puntos'] . "</span>";
                        echo "</div>";
                    }
                    if (empty($top5)) echo "<p style='text-align:center; font-size: 0.8rem;'>No hay datos aún</p>";
                } else {
                    echo "<p style='text-align:center; font-size: 0.8rem;'>Archivo no encontrado</p>";
                }
                ?>
            </div>
            <button class="btn-refresh" onclick="location.reload()">REFRESCAR</button>
        </div>
    </div>

    <script src="tetris.js"></script>
</body>
</html>
