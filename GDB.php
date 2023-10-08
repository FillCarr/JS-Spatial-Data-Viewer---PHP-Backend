<?php
ini_set('display_errors',1);

$host = 'yourserverorlocalhost';
$port = 'yourport';
$dbname = 'yourdbname';
$user = 'yourusermame'
$password = 'yourpassword

$conn = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");

if (!$conn) {
    $response = json_encode(['error' => 'Unable to open database']);    
} else {
    $sql = 'SELECT fid, opername, pipename, shape_leng, ST_AsGeoJSON(wkb_geometry) AS geojson FROM public."coPipes"';
    $result = pg_query($conn, $sql);

    if (!$result) {
        $response = json_encode(['error' => pg_last_error($conn)]);
    } else {
        $features = [];
        while ($row = pg_fetch_assoc($result)) {
            unset($row['wkb_geometry']); 
            $row['geojson'] = json_decode($row['geojson'], true); 

            $features[] = [
                'type' => 'Feature',
                'geometry' => $row['geojson'],
                'properties' => [
                    'fid' => $row['fid'],
                    'opername' => $row['opername'],
                    'pipename' => $row['pipename'],
                    'shape_leng' => $row['shape_leng']
                ]
            ];
        }

        $geojson = [
            'type' => 'FeatureCollection',
            'features' => $features,
            'crs' => [
                'type' => 'name',
                'properties' => [
                    'name' => 'urn:ogc:def:crs:OGC:1.3:CRS84'
                ]
            ]
        ];

        echo json_encode($geojson, JSON_NUMERIC_CHECK);

        pg_free_result($result);
        pg_close($conn);
    }
}
?>

