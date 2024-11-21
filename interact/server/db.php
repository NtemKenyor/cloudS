<?php
// Custom function to load .env file
function loadEnv($path) {
    if (!file_exists($path)) {
        throw new Exception("The .env file is missing at path: $path");
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Parse key-value pairs
        [$key, $value] = explode('=', $line, 2);

        // Trim and remove quotes
        $key = trim($key);
        $value = trim($value);
        $value = trim($value, '"');

        // Store into environment
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

// Load .env variables
loadEnv(__DIR__ . '/.env');

// Database connection
function getDbConnection() {
    // $host = $_ENV['DB_HOST'];
    // $user = $_ENV['DB_USER'];
    // $password = $_ENV['DB_PASSWORD'];
    // $dbname = $_ENV['DB_NAME'];
    // $port = $_ENV['DB_PORT'];


    $conn = mysqli_connect('localhost', 'nkenyor', 'SomeRandom&&123rOYNEK', 'cloudS');
    // $conn = mysqli_connect(''.$host, ''.$user, ''.$password, ''.$dbname);
    // $conn = mysqli_connect($host, $user, $password, $dbname, intval(80) );
    // echo "still test";


    if (mysqli_connect_errno()) {
        // echo "some error. auto";
    } else {
        // echo "db connected successfully";
    }


    return $conn;
}




// getDbConnection();

// echo gethostbyname('localhost');
// $connection = mysqli_connect('localhost', 'nkenyor', 'SomeRandom&&123rOYNEK', 'cloudS');



?>

