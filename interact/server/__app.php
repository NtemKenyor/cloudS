<?php
require_once 'db.php';


// Set up a simple routing mechanism
// if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['pubkey'])) {
        // Fetch messages by public key
        fetchMessages($_GET['pubkey'], $_GET['category'] ?? null);
    } 
    elseif (isset($_GET['conversations'])) {
        // Fetch conversations for a public key
        fetchConversations($_GET['conversations']);
    }
    elseif (isset($_POST['send_message'])) {
        // Send a message
        sendMessage($_POST['sender_pubkey'], $_POST['receiver_pubkey'], $_POST['message'], $_POST['category'] ?? 'chart', $_POST['media_src'] ?? null, $_POST['addon'] ?? null);
    }
    else{
        echo "nothing much to do here";
    }

// Fetch all messages for a public key
function fetchMessages($pubkey, $category = null) {
    try {
        $conn = getDbConnection();

        $query = "SELECT * FROM charts WHERE sender_pubkey = $1 OR receiver_pubkey = $1";
        $params = [$pubkey];

        if ($category) {
            $query .= " AND category = $2";
            $params[] = $category;
        }

        $result = pg_prepare($conn, "fetch_messages", $query);
        $result = pg_execute($conn, "fetch_messages", $params);

        if ($result) {
            $messages = pg_fetch_all($result);
            echo json_encode($messages);
        } else {
            echo json_encode(["error" => "Failed to fetch messages"]);
        }
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}

// Send a message
function sendMessage($sender_pubkey, $receiver_pubkey, $message, $category = 'chart', $media_src = null, $addon = null) {
    try {
        $conn = getDbConnection();

        // Check message limit for free users
        $countQuery = "SELECT COUNT(*) FROM charts WHERE sender_pubkey = $1";
        $result = pg_prepare($conn, "count_messages", $countQuery);
        $result = pg_execute($conn, "count_messages", [$sender_pubkey]);

        $messageCount = pg_fetch_result($result, 0, 0);
        $freeLimit = 5;

        if ($messageCount >= $freeLimit) {
            echo json_encode(["error" => "Free message limit exceeded"]);
            return;
        }

        // Insert the new message using parameterized query
        $insertQuery = "INSERT INTO charts ('sender_pubkey', 'receiver_pubkey', 'message', 'category', 'media_src', 'addon')
                        VALUES ($1, $2, $3, $4, $5, $6)";
        $result = pg_prepare($conn, "insert_message", $insertQuery);
        pg_execute($conn, "insert_message", [$sender_pubkey, $receiver_pubkey, $message, $category, $media_src, $addon]);

        echo json_encode(["message" => "Message sent successfully"]);
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}

// Fetch list of conversations for a public key
function fetchConversations($pubkey) {
    try {
        $conn = getDbConnection();

        $query = "SELECT DISTINCT CASE WHEN sender_pubkey = $1 THEN receiver_pubkey ELSE sender_pubkey END AS other_pubkey FROM charts WHERE sender_pubkey = $1 OR receiver_pubkey = $1";
        $result = pg_prepare($conn, "fetch_conversations", $query);
        $result = pg_execute($conn, "fetch_conversations", [$pubkey]);

        if ($result) {
            $conversations = pg_fetch_all($result);
            echo json_encode($conversations);
        } else {
            echo json_encode(["error" => "Failed to fetch conversations"]);
        }
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>
