<?php

// require 'db.php';
require $_SERVER['DOCUMENT_ROOT']."/alltrenders/env_variables/accessor/db.php";

// Routing mechanism
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['send_message'])) {
        $media_src = handleImageUpload($_FILES['media'] ?? null);
        sendMessage(
            $_POST['sender_pubkey'],
            $_POST['receiver_pubkey'],
            $_POST['message'],
            $_POST['category'] ?? 'chart',
            $media_src,
            $_POST['addon'] ?? null
        );
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['conversations']) AND isset($_GET['pubkey']) ) {
        // fetchConversations($_GET['conversations']);
        fetchConversations($_GET['pubkey']);
    }elseif (isset($_GET['pubkey']) AND isset($_GET['r_pubkey'])) {
        fetchMessages($_GET['pubkey'], $_GET['r_pubkey'], $_GET['category'] ?? null);
    } else {
        echo json_encode(["error" => "Invalid request"]);
    }
} else {
    echo json_encode(["error" => "Invalid request method"]);
}


// Send a message
/* function sendMessage($sender_pubkey, $receiver_pubkey, $message, $category = 'chart', $media_src = null, $addon = null) {
    try {
        $conn = getDbConnection(); // Ensure the database connection is established

        // echo "entered here";

        // Check message limit for free users
        $query = "SELECT COUNT(*) AS message_count FROM charts WHERE sender_pubkey = ? AND receiver_pubkey = ?";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Failed to prepare SELECT statement: " . $conn->error);
        }
        $stmt->bind_param("ss", $sender_pubkey, $receiver_pubkey);
        $stmt->execute();

        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $messageCount = $row['message_count'] ?? 0;
        $stmt->close(); // Ensure the statement is closed

        // echo "entered here2";

        $freeLimit = 5;
        if ($messageCount >= $freeLimit) {
            echo json_encode(["error" => "Free message limit exceeded"]);
            return;
        }

        // Insert the message
        $query = "INSERT INTO charts (sender_pubkey, receiver_pubkey, message, category, media_src, addon)
                  VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Failed to prepare INSERT statement: " . $conn->error);
        }
        $stmt->bind_param("ssssss", $sender_pubkey, $receiver_pubkey, $message, $category, $media_src, $addon);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            echo json_encode(["message" => "Message sent successfully"]);
        } else {
            echo json_encode(["error" => "Failed to send message"]);
        }
        $stmt->close();
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
} */

function sendMessage($sender_pubkey, $receiver_pubkey, $message, $category = 'chart', $media_src = null, $addon = null) {
    try {
        $conn = getDbConnection(); // Ensure the database connection is established

        // Handle AI-specific logic
        if ($sender_pubkey === 'AI') {
            $aiResponse = getOpenAIReply($message); // Generate AI response
            $message = $aiResponse; // Use the AI response as the message
        } elseif ($sender_pubkey === 'AI-Image-creator') {
            $imageURL = generateOpenAIImage($message); // Generate AI image
            $media_src = $imageURL; // Use the image URL as media source
        }

        // Check message limit for free users
        $query = "SELECT COUNT(*) AS message_count FROM charts WHERE sender_pubkey = ? AND receiver_pubkey = ?";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Failed to prepare SELECT statement: " . $conn->error);
        }
        $stmt->bind_param("ss", $sender_pubkey, $receiver_pubkey);
        $stmt->execute();

        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $messageCount = $row['message_count'] ?? 0;
        $stmt->close(); // Ensure the statement is closed

        $freeLimit = 5;
        if ($messageCount >= $freeLimit) {
            echo json_encode(["error" => "Free message limit exceeded"]);
            return;
        }

        // Insert the message
        $query = "INSERT INTO charts (sender_pubkey, receiver_pubkey, message, category, media_src, addon)
                  VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Failed to prepare INSERT statement: " . $conn->error);
        }
        $stmt->bind_param("ssssss", $sender_pubkey, $receiver_pubkey, $message, $category, $media_src, $addon);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            echo json_encode(["status" => "True", "message" => "Message sent successfully"]);
        } else {
            echo json_encode(["error" => "Failed to send message"]);
        }
        $stmt->close();
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}




// Fetch all messages for a public key
function fetchMessages($pubkey, $r_pubkey, $category = null) {
    try {
        $conn = getDbConnection();

        // Base query to fetch messages between two pubkeys
        $query = "
            SELECT * 
            FROM charts 
            WHERE 
                (sender_pubkey = ? AND receiver_pubkey = ?) 
                OR (sender_pubkey = ? AND receiver_pubkey = ?)
        ";

        $params = [$pubkey, $r_pubkey, $r_pubkey, $pubkey];
        $types = "ssss";

        // Add category condition if specified
        if ($category) {
            $query .= " AND category = ?";
            $params[] = $category;
            $types .= "s";
        }

        // Order results by timestamp or id
        $query .= " ORDER BY timestamp ASC"; // Use ASC for chronological order

        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        // Fetch all results as an associative array
        $messages = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($messages);

        $stmt->close();
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}



// Fetch conversations for a public key
 function fetchConversations($pubkey) {
    try {
        $conn = getDbConnection();

        // Step 1: Fetch all messages involving the user
        $query = "
            SELECT 
                chart_id,
                sender_pubkey,
                receiver_pubkey,
                message,
                timestamp,
                CASE 
                    WHEN sender_pubkey = ? THEN receiver_pubkey 
                    ELSE sender_pubkey 
                END AS other_pubkey
            FROM charts
            WHERE sender_pubkey = ? OR receiver_pubkey = ?
            ORDER BY timestamp DESC
        ";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sss", $pubkey, $pubkey, $pubkey);
        $stmt->execute();
        $result = $stmt->get_result();

        // Step 2: Process data to get the latest message per conversation
        $conversations = [];
        

        // Step 3: Add two preset public keys with falsified values
        $presetConversations = [
            [
                "chart_id" => null,
                "sender_pubkey" => "AI",
                "receiver_pubkey" => $pubkey,
                "message" => "Use our AI Friend",
                "timestamp" => date('Y-m-d H:i:s'),
                "other_pubkey" => "AI"
            ],
            [
                "chart_id" => null,
                "sender_pubkey" => "AI-Image-creator",
                "receiver_pubkey" => $pubkey,
                "message" => "You can now create images from prompts",
                "timestamp" => date('Y-m-d H:i:s'),
                "other_pubkey" => "AI-Image-creator"
            ]
        ];

        // Combine the preset conversations with the actual ones
        $finalConversations = array_merge($presetConversations, array_values($conversations));

        // Step 4: Return the filtered results as JSON
        echo json_encode($finalConversations);
        $stmt->close();

    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}


// Handle image upload
function handleImageUpload($file) {
    if ($file && $file['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/media/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $uniqueName = uniqid() . '_' . basename($file['name']);
        $uploadPath = $uploadDir . $uniqueName;

        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            return 'media/' . $uniqueName;
        } else {
            echo json_encode(["error" => "Failed to upload file"]);
        }
    }
    return null;
}

function getOpenAIReply($userMessage) {
    require $_SERVER['DOCUMENT_ROOT'] . "/alltrenders/env_variables/accessor/accessor_main.php";
    // require "/var/www/html/alltrenders/env_variables/accessor/accessor_main.php";
    $token = $gbt_TOKEN;
    // echo $token;
    // Define the conversation messages
    $messages = [
        ["role" => "system", "content" => "You are a forum expert, a creative content creator, and an intelligent assistant."]
    ];

    // Add user message to the conversation
    if ($userMessage) {
        $messages[] = ["role" => "user", "content" => $userMessage];
    }

    // API endpoint for chat completions
    $url = 'https://api.openai.com/v1/chat/completions';
    // echo json_encode($messages);
    // Request data
    $data = [
        'model' => 'gpt-4',
        'messages' => $messages,
        'temperature' => 0.4,
        'max_tokens' => 200,
        'top_p' => 1,
        'frequency_penalty' => 0,
        'presence_penalty' => 0
    ];

    // Initialize cURL session
    $ch = curl_init();

    // Set cURL options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ]);

    // Execute cURL request
    $response = curl_exec($ch);
    // echo $response;
    // Check for cURL errors
    if ($response === false) {
        echo 'cURL error: ' . curl_error($ch);
        return null;
    }

    // Check HTTP status code
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($httpCode !== 200) {
        echo 'HTTP error: ' . $httpCode;
        return null;
    }

    // Close cURL session
    curl_close($ch);

    // Parse JSON response
    $chat = json_decode($response, true);

    // Check response structure
    if (isset($chat["choices"][0]["message"]["content"])) {
        return $chat["choices"][0]["message"]["content"];
    } else {
        echo 'Unexpected API response structure';
        return null;
    }
}


function generateOpenAIImage($prompt, $imageSize = "512x512") {
    // Include your environment variables
    require $_SERVER['DOCUMENT_ROOT'] . "/alltrenders/env_variables/accessor/accessor_main.php";
    $token = $gbt_TOKEN;

    // OpenAI API endpoint for image generation
    $url = 'https://api.openai.com/v1/images/generations';

    // Data payload for API request
    $data = [
        'prompt' => $prompt,
        'n' => 1, // Number of images to generate
        'size' => $imageSize // Options: 256x256, 512x512, 1024x1024
    ];

    // Setup cURL
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token
        ],
        CURLOPT_TIMEOUT => 60 // Set timeout for better error handling
    ]);

    // Execute cURL request
    $response = curl_exec($ch);

    // Handle cURL errors
    if ($response === false) {
        $error = 'cURL error: ' . curl_error($ch);
        curl_close($ch);
        throw new Exception($error);
    }

    // Check HTTP status
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("HTTP error code: $httpCode, Response: $response");
    }

    // Parse response
    $result = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON parse error: ' . json_last_error_msg());
    }

    // Validate response structure
    if (isset($result["data"][0]["url"])) {
        return $result["data"][0]["url"]; // Return the URL of the generated image
    } else {
        throw new Exception('Unexpected API response structure');
    }
}
?>
