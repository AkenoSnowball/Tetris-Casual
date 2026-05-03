<?php
// Nombre del archivo donde se guardarán los datos
$archivo = 'puntos.json';

// Recibimos los datos del JS
$nombre = $_POST['nombre'] ?? 'Anónimo';
$puntos = isset($_POST['puntos']) ? (int)$_POST['puntos'] : 0;

if (!empty($nombre)) {
    // 1. Leer los puntajes actuales si el archivo existe
    $datos_actuales = [];
    if (file_exists($archivo)) {
        $contenido = file_get_contents($archivo);
        $datos_actuales = json_decode($contenido, true) ?: [];
    }

    // 2. Añadir el nuevo puntaje
    $nuevo_puntaje = [
        "nombre" => $nombre,
        "puntos" => $puntos,
        "fecha"  => date("Y-m-d H:i:s")
    ];
    $datos_actuales[] = $nuevo_puntaje;

    // 3. Opcional: Ordenar por puntaje más alto
    usort($datos_actuales, function($a, $b) {
        return $b['puntos'] - $a['puntos'];
    });

    // 4. Guardar de nuevo en el archivo JSON
    file_put_contents($archivo, json_encode($datos_actuales, JSON_PRETTY_PRINT));

    echo "Puntaje guardado en el archivo JSON";
}
?>
