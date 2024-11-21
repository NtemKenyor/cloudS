<?php
require 'db.php';

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
        // $conn = getDbConnection();
        echo "entered here";
        // Check message limit for free users
        $query = "SELECT COUNT(*) FROM charts WHERE sender_pubkey = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $sender_pubkey);
        $stmt->execute();
        $stmt->bind_result($messageCount);
        $stmt->fetch();
        // $stmt->close();

        echo "entered here2";

        $freeLimit = 5;
        if ($messageCount >= $freeLimit) {
            echo json_encode(["error" => "Free message limit exceeded"]);
            return;
        }

        // Insert the message
        $query = "INSERT INTO charts (sender_pubkey, receiver_pubkey, message, category, media_src, addon)
                  VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
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
}



// Fetch all messages for a public key
/* function fetchMessages($pubkey, $r_pubkey, $category = null) {
    try {
        $conn = getDbConnection();

        $query = "SELECT * FROM charts WHERE sender_pubkey = ? OR receiver_pubkey = ?";
        $params = [$pubkey, $pubkey];
        $types = "ss";

        if ($category) {
            $query .= " AND category = ?";
            $params[] = $category;
            $types .= "s";
        }

        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        $messages = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($messages);

        $stmt->close();
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}
 */
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
/* function fetchConversations($pubkey, $category=null) {
    try {
        $conn = getDbConnection();

        $query = "SELECT * FROM charts WHERE sender_pubkey = ? OR receiver_pubkey = ?";

        $stmt2 = $conn->prepare($query);
        $stmt2->bind_param("ss", $pubkey, $pubkey);
        $stmt2->execute();
        $result2 = $stmt2->get_result();

        $messages_ = $result2->fetch_all(MYSQLI_ASSOC);
        echo json_encode($messages_);

        $stmt2->close();
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
} */



/*  function fetchConversations($pubkey) {
    try {
        $conn = getDbConnection();

        // Query to fetch the last message of each conversation
        $query = "SELECT 
                    c.* 
                  FROM charts c
                  INNER JOIN (
                      SELECT 
                          CASE 
                              WHEN sender_pubkey = ? THEN receiver_pubkey 
                              ELSE sender_pubkey 
                          END AS other_pubkey,
                          MAX(chart_id) AS last_message_id
                      FROM charts
                      WHERE sender_pubkey = ? OR receiver_pubkey = ?
                      GROUP BY other_pubkey
                  ) latest ON c.id = latest.last_message_id";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("sss", $pubkey, $pubkey, $pubkey);
        $stmt->execute();
        $result = $stmt->get_result();

        // Fetch and return the conversations
        $conversations = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($conversations);

        $stmt->close();
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
} */

/* function fetchConversations($pubkey) {
    try {
        $conn = getDbConnection();

        // Query to fetch the last message for each unique conversation
        $query = "SELECT c.* 
                  FROM charts c
                  INNER JOIN (
                      SELECT 
                          CASE 
                              WHEN sender_pubkey = ? THEN receiver_pubkey 
                              ELSE sender_pubkey 
                          END AS other_pubkey,
                          MAX(timestamp) AS last_message_time
                      FROM charts
                      WHERE sender_pubkey = ? OR receiver_pubkey = ?
                      GROUP BY other_pubkey
                  ) latest ON 
                      (CASE 
                          WHEN c.sender_pubkey = ? THEN c.receiver_pubkey 
                          ELSE c.sender_pubkey 
                      END = latest.other_pubkey AND 
                      c.timestamp = latest.last_message_time)";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("ssss", $pubkey, $pubkey, $pubkey, $pubkey);
        $stmt->execute();
        $result = $stmt->get_result();

        // Fetch and return the last messages
        $conversations = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($conversations);

        $stmt->close();
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}
 */

/*  function fetchConversations($pubkey) {
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
        while ($row = $result->fetch_assoc()) {
            $otherPubkey = $row['other_pubkey'];

            // If the other_pubkey isn't already in the array, or if the current row's timestamp is newer, update it
            if (!isset($conversations[$otherPubkey])) {
                $conversations[$otherPubkey] = $row;
            }
        }

        // Step 3: Return the filtered results as JSON
        echo json_encode(array_values($conversations)); // array_values to reindex the array for JSON
        $stmt->close();

    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
} */


/* function fetchConversations($pubkey) {
    try {
        $conn = getDbConnection();

        // Step 1: Fetch all messages involving the user
        $query = "
            SELECT 
                chart_id,
                sender_pubkey,
                receiver_pubkey,
                message,
                timestamp
            FROM charts
            WHERE sender_pubkey = ? OR receiver_pubkey = ?
            ORDER BY timestamp DESC
        ";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ss", $pubkey, $pubkey);
        $stmt->execute();
        $result = $stmt->get_result();

        echo  json_encode($result) . '<br/>';

        // Step 2: Process data in PHP to get the latest message per unique user
        $conversations = [];
        while ($row = $result->fetch_assoc()) {
            $otherPubkey = ($row['sender_pubkey'] === $pubkey) 
                ? $row['receiver_pubkey'] 
                : $row['sender_pubkey'];

            // Keep only the first (latest) entry for each unique user
            if (!isset($conversations[$otherPubkey])) {
                $conversations[$otherPubkey] = $row;
            }
        }

        // Step 3: Return the filtered results as JSON
        echo json_encode(array_values($conversations)); // array_values to reindex the array for JSON
        $stmt->close();

    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
} */



/*  function fetchConversations($pubkey) {
    try {
        $conn = getDbConnection();

        // Step 1: Fetch all messages involving the user
        $query = "
            SELECT 
                chart_id,
                sender_pubkey,
                receiver_pubkey,
                message,
                timestamp
            FROM charts
            WHERE sender_pubkey = ? OR receiver_pubkey = ?
            ORDER BY timestamp DESC
        ";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ss", $pubkey, $pubkey);
        $stmt->execute();
        $result = $stmt->get_result();

        echo  json_encode($result) . '<br/>';

        // Step 2: Process data to get the latest message per unique user
        $conversations = [];
        while ($row = $result->fetch_assoc()) {
            // Determine the other user in the conversation
            $otherPubkey = ($row['sender_pubkey'] === $pubkey) 
                ? $row['receiver_pubkey'] 
                : $row['sender_pubkey'];

            echo $otherPubkey . '<br/>';

            // Store the latest message per unique user
            if (!isset($conversations[$otherPubkey])) {
                $conversations[$otherPubkey] = $row;
            }
        }

        
        echo  json_encode($conversations) . '<br/>';

        // Step 3: Return the filtered results as a JSON array
        echo json_encode(array_values($conversations)); // Reindex for JSON output
        $stmt->close();

    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}
 */

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

// Get database connection
// function getDbConnection() {
//     $host = "localhost"; // Update with your host
//     $user = "root"; // Update with your username
//     $password = ""; // Update with your password
//     $dbname = "your_database"; // Update with your database name
//     $port = 3306; // Update if needed

//     $conn = new mysqli($host, $user, $password, $dbname, $port);

//     if ($conn->connect_error) {
//         throw new Exception("Database connection failed: " . $conn->connect_error);
//     }

//     return $conn;
// }
?>
