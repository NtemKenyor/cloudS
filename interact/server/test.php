<?php
/* 
function getOpenAIReply($userMessage) {
    // Include your environment variables
    require $_SERVER['DOCUMENT_ROOT'] . "/alltrenders/env_variables/accessor/db.php";
    $token = $gbt_TOKEN;

    // Define conversation context and user input
    $messages = [
        ["role" => "system", "content" => "You are a forum expert, a creative content creator, and an intelligent assistant."]
    ];

    if ($userMessage) {
        $messages[] = ["role" => "user", "content" => $userMessage];
    }

    // OpenAI API endpoint
    $url = 'https://api.openai.com/v1/chat/completions';

    // Data payload for API request
    $data = [
        'model' => 'gpt-4', // Use the latest model, if available
        'messages' => $messages,
        // 'temperature' => 0.4,
        'max_tokens' => 200,
        // 'top_p' => 1.0,
        // 'frequency_penalty' => 0.0,
        // 'presence_penalty' => 0.0
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
        CURLOPT_TIMEOUT => 10 // Set timeout for better error handling
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

    echo response;

    // Parse response
    $chat = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON parse error: ' . json_last_error_msg());
    }

    echo json_encode($chat);

    // Validate response structure
    if (isset($chat["choices"][0]["message"]["content"])) {
        return trim($chat["choices"][0]["message"]["content"]);
    } else {
        throw new Exception('Unexpected API response structure');
    }
}


echo getOpenAIReply("hello"); */



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
    echo json_encode($messages);
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
    echo $response;
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
        CURLOPT_TIMEOUT => 10 // Set timeout for better error handling
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


try {
    $prompt = "A futuristic city skyline at sunset with flying cars";
    $imageUrl = generateOpenAIImage($prompt, "1024x1024");
    echo "Generated Image URL: " . $imageUrl;
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

// Example usage
// $userMessage = "Say something about CR7?";
// $reply = getOpenAIReply($userMessage);

// if ($reply !== null) {
//     echo $reply;
// } else {
//     echo 'Failed to retrieve a reply.';
// }

?>
