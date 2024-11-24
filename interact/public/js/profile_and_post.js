//
// Server's public key in PEM format (you should replace this with the actual server public key)
const serverPublicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1ff4e8iKylXLdXkFyIP
nXNW0C4dmdwQ5sHDHH/Xan4UWvSw99IYl8eIIjnwrW+C0e2EWmkUBrTCtawg0OTf
wISkvq09/gR+wqeyXoNxLdN5kZ3eTuJolj3xqAMkT4USo6SDSwWmRTACO55S89c/
Ysd7EFrpE+pSl9X+1Fl1CpmVFDqprw02gNbK2WgC/tQV/K78PobuY4VPAQouybNh
KrLkTYqRKkv9dQo6ZgpVKpGaOXBWoLB2ffVKAW8wCWzLESJHC1b51rNi+03MgBJl
dzTPXfB1KuP5bMo8sPvz6Nb2Zw9vB8rvW/iQnlrLq9OGefQDr2QfxUdQLJVwCBnv
IQIDAQAB
-----END PUBLIC KEY-----`;


// var keypair
document.getElementById('prof_share').addEventListener('click', () => {
    alert('Sharing profile...');
    // Add the corresponding logic here
});

document.getElementById('prof_message').addEventListener('click', () => {
    alert('check Message S profile...');
    // Add the corresponding logic here
});

document.getElementById('prof_download').addEventListener('click', () => {
    const userConfirmed = confirm(
        "Your private key is highly sensitive and should not be shared with anyone. Are you sure you want to download it?"
    );
    if (userConfirmed) {
        downloadPrivateKey();
    }
});


document.getElementById('prof_logout').addEventListener('click', () => {
    const userConfirmed = confirm(
        "Logging out will remove all your wallet data from this device. Make sure you have downloaded your private key before proceeding. Do you want to log out?"
    );

    if (userConfirmed) {
        logout()
    }
});


function logout(){
    // Remove solana_private_key from localStorage
    localStorage.removeItem('solana_private_key');

    // Remove cookies: email, publicKey, and displayName
    const cookiesToRemove = ['email', 'publicKey', 'displayName'];

    cookiesToRemove.forEach(cookieName => {
        if (cookieExists(cookieName)) {
            writeCookie(cookieName, '', -1); // Set expiry to a past date
        }
    });

    // Provide feedback to the user
    alert('You have successfully logged out.');

    // Optionally redirect the user to a login page or homepage
    window.location.reload();
}


// Utility function to check if a cookie exists
function cookieExists(name) {
    return document.cookie.split('; ').some((cookie) => cookie.startsWith(`${name}=`));
}

// Utility function to read a cookie
function readCookie(name) {
    const cookieString = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${name}=`));
    return cookieString ? decodeURIComponent(cookieString.split('=')[1]) : null;
}

// Utility function to write a cookie
function writeCookie(name, value, days = 30) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/`;
}

function load_wallet_simple() {
    const privateKey = localStorage.getItem('solana_private_key');
    if (privateKey) {
        try {
            let keypair = solanaWeb3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(privateKey)));
            // console.log("Private key loaded for test:", keypair);
            return keypair; // Ensure keypair is returned successfully
        } catch (error) {
            console.error("Error creating keypair from private key:", error);
            return null; // Return null if there's an error
        }
    } else {
        console.log("No private key found in localStorage.");
        return null; // Return null if no private key is found
    }
}

// Main function to load and initialize profile
async function little_profile() {
    let keypair; // Declare keypair in the function's scope
    try {
        keypair = load_wallet_simple();
        if (keypair) {
            console.log("Testing keypair:", keypair.publicKey.toBase58());
        } else {
            console.log("Keypair could not be loaded.");
        }
    } catch (error) {
        console.error("An error occurred while loading the keypair:", error);
    }



    // Default values
    const defaultEmail = "user@example.com";
    const defaultPublicKey = "defaultPublicKey12345";
    const defaultDisplayName = "Default User";

    //check if the users public key is present
    let userPublicKey;
    try {
        // Attempt to retrieve the user's public key
        // userPublicKey = keypair?.publicKey?.toBase58?.();
        userPublicKey = keypair.publicKey.toBase58();
        // keypair.publicKey.toBase58()
        console.log("the public: ", userPublicKey);
    } catch (error) {
        console.warn("Error retrieving user's public key:", error);
    }

    // Fallback to default public key if not available
    const finalPublicKey = userPublicKey || defaultPublicKey;


    // Get input elements
    const emailDisplayer = document.getElementById('email_displayer');
    const publicKeyDisplayer = document.getElementById('publicKey');
    const displayNameDisplayer = document.getElementById('displayName');

    // Retrieve values from cookies or use defaults
    const email = cookieExists('email') ? readCookie('email') : defaultEmail;
    const publicKey = cookieExists('publicKey') ? readCookie('publicKey') : finalPublicKey;
    const displayName = cookieExists('displayName') ? readCookie('displayName') : defaultDisplayName;

    // Set values in the respective input fields
    emailDisplayer.value = email;
    publicKeyDisplayer.innerText = publicKey;
    // publicKeyDisplayer.setAttribute('readonly', true); // Make publicKey read-only
    displayNameDisplayer.innerText = displayName;

    // Save the default values to cookies if they don't exist
    // if (!cookieExists('email')) writeCookie('email', defaultEmail);
    // if (!cookieExists('publicKey')) writeCookie('publicKey', finalPublicKey);
    // if (!cookieExists('displayName')) writeCookie('displayName', defaultDisplayName);
}

// Function to handle email change
function setupEmailChange() {
    const emailDisplayer = document.getElementById('email_displayer');
    // const changeEmailButton = document.getElementById('changeEmail');

    const newEmail = emailDisplayer.value;
    if (newEmail) {
        writeCookie('email', newEmail);
        alert('Email updated and saved successfully!');
    } else {
        alert('Email cannot be empty!');
    }
}

const emailDisplayer = document.getElementById('email_displayer');

document.getElementById('changeEmail').addEventListener('click', () => {
    setupEmailChange();
});

function changeDisplayName() {
    const displayNameElement = document.getElementById('displayName');
    const newDisplayName = displayNameElement.textContent.trim(); // Get the updated display name

    if (newDisplayName) {
        writeCookie('displayName', newDisplayName);
        alert(`Display name saved: ${newDisplayName}`);
        // You can save the value to cookies or a database here
        // document.cookie = `displayName=${encodeURIComponent(newDisplayName)}; path=/`;
    } else {
        alert('Display name cannot be empty!');
    }
}

document.getElementById('saveDisplayName').addEventListener('click', () => {
    changeDisplayName();
});


// Download private key as a JSON file
function downloadPrivateKey() {
    if (!keypair) {
        alert('No wallet found. Create or load a wallet first.');
        return;
    }
    const privateKey = JSON.stringify(Array.from(keypair.secretKey));
    const blob = new Blob([privateKey], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'solana_private_key.json';
    link.click();
}

// Load private key from uploaded file
/* function loadPrivateKeyFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const privateKeyArray = JSON.parse(e.target.result);
        keypair = solanaWeb3.Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
        displayWalletInfo();
    };
    reader.readAsText(file);
} */


// Initialize the functions on page load
document.addEventListener('DOMContentLoaded', () => {
    little_profile();
    // setupEmailChange();
});





document.getElementById('accountIcon').addEventListener('click', () => {
    const popup = document.getElementById('profilepopup');
    
    if (popup.style.display === 'flex') {
        // Hide the popup
        popup.style.display = 'none';
    } else {
        // Show the popup
        popup.style.display = 'flex';
        // const publicKey = new URLSearchParams(window.location.search).get('public_key') || 'N/A';
        // document.getElementById('publicKey').textContent = publicKey;
    }
});

document.querySelector('.profileclose-btn').addEventListener('click', () => {
    document.getElementById('profilepopup').style.display = 'none';
});



document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('popup').style.display = 'none';
});

document.querySelector('.copy-btn').addEventListener('click', () => {
    const publicKey = document.getElementById('publicKey').textContent;
    navigator.clipboard.writeText(publicKey);
    alert('Public key copied to clipboard!');
});



document.getElementById('createPostBtn').addEventListener('click', () => {
    document.getElementById('postPopup').style.display = 'block';
});

document.getElementById('closePopup').addEventListener('click', () => {
    document.getElementById('postPopup').style.display = 'none';
});

document.getElementById('markdownTools').addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const tag = event.target.getAttribute('data-tag');
        const textarea = document.getElementById('content');
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;

        const beforeText = textarea.value.substring(0, selectionStart);
        const selectedText = textarea.value.substring(selectionStart, selectionEnd);
        const afterText = textarea.value.substring(selectionEnd);

        textarea.value = beforeText + tag + selectedText + tag + afterText;
        textarea.focus();
        textarea.selectionStart = selectionStart + tag.length;
        textarea.selectionEnd = selectionEnd + tag.length;
    }
});

async function encryptPrivateKey_OLD(publicKeyPem, privateKey) {
    // Convert the server's public key from PEM format to a Forge public key object
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    
    // Encrypt the user's private key using RSA-OAEP
    const encryptedPrivateKey = publicKey.encrypt(privateKey, "RSA-OAEP");
    
    // Convert to Base64 encoding for safe transport
    return forge.util.encode64(encryptedPrivateKey);
}


async function encryptPrivateKey(publicKeyPem, privateKey) {
    // Convert the server's public key from PEM format to a Forge public key object
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    
    // Split the private key string into chunks of 10 characters
    const privateKeyChunks = privateKey.match(/.{1,10}/g); // This splits the string into chunks of 10 characters

    // Encrypt each chunk using RSA-OAEP
    const encryptedChunks = await Promise.all(privateKeyChunks.map(async (chunk) => {
        try {
            return publicKey.encrypt(chunk, 'RSA-OAEP');
        } catch (error) {
            console.error("Error encrypting chunk:", error);
            throw error;
        }
    }));

    // Return a JSON string containing both the chunks and the encrypted chunks
    const result = {
        // originalChunks: privateKeyChunks,
        encryptedChunks: encryptedChunks
    };

    return JSON.stringify(result);
}



document.getElementById('insertImage').addEventListener('click', () => {
    const textarea = document.getElementById('content');
    const imageURL = prompt('Enter image URL:');
    if (imageURL) {
        textarea.value += `![Image Description](${imageURL})`;
    }
});



// window.NODE_URL = "http://localhost:3000";
// window.NODE_URL = "https://roynek.com/cloudS/interact/backend";
// window.PHP_URL = "http://localhost";
// window.PHP_URL = "https://roynek.com/cloudS/interact/server";

// Initialize global variables using the window object
if (
    window.location.hostname === "localhost" || 
    window.location.hostname.startsWith("127.") || 
    window.location.hostname === "0.0.0.0"
) {
    // Use localhost URLs
    window.NODE_URL = "http://localhost:3000";
    window.PHP_URL = "http://localhost/cloudS/interact/server";
} else {
    // Use live URLs
    window.NODE_URL = "https://roynek.com/cloudS/interact/backend";
    window.PHP_URL = "https://roynek.com/cloudS/interact/server";
}

// Log the current URLs being used for easy tracking
console.log("Current NODE_URL:", window.NODE_URL);
console.log("Current PHP_URL:", window.PHP_URL);

/* async function make_some_post(){

    console.log(JSON.stringify(Array.from(keypair.secretKey)));
    // const {encryptedAK, encryptedAeSKeyK, encryptedIvK, authTagK} = await encryptArticleWithServerPublicKey(JSON.stringify(Array.from(keypair.secretKey)), serverPublicKeyPem);
    // encryptedPrivateKey = encryptedAK +"***%***"+ encryptedAeSKeyK +"***%***"+ encryptedIvK +"***%***"+ authTagK;
    const encryptedPrivateKey = await encryptPrivateKey(serverPublicKeyPem, JSON.stringify(Array.from(keypair.secretKey)));

    // await submitPost(encryptedPrivateKey, serverPublicKeyPem);

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const image_url = document.getElementById("image_url").value;
    const author = document.getElementById("author").value || keypair.publicKey.toBase58(); // Default to public key
    const others = document.getElementById("others").value;

    const postData = {
        encryptedPrivateKey: encryptedPrivateKey,
        publicKey: serverPublicKeyPem,
        title: title,
        content: content,
        image_url: image_url,
        author: author,
        date: new Date().toISOString(),
        others: others,
    };

    console.log(postData);
    // if (title == ""){
    //     encrypted_title = "";
    // }else{
    //     const {encryptedArticle_, encryptedAesKey_, encryptedIv_, authTag_} = await encryptArticleWithServerPublicKey(content, serverPublicKeyPem);
    //     encrypted_title = encryptedArticle +"***%***"+ encryptedAesKey +"***%***"+ encryptedIv +"***%***"+ authTag;
    // }
    // const {encryptedArticle, encryptedAesKey, encryptedIv, authTag} = await encryptArticleWithServerPublicKey(content, serverPublicKeyPem);
    // encrypted_content = encryptedArticle +"***%***"+ encryptedAesKey +"***%***"+ encryptedIv +"***%***"+ authTag;

    

    // {enc}content = 
    try {
        const response = await fetch(NODE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(postData)
        });

        const result = await response.json();
        alert("Output: " + JSON.stringify(result));
    } catch (error) {
        console.error("Error submitting post:", error);
        alert("Failed to submit post.");
    }
}
 */
/*  document.getElementById('postForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // const encryptedPrivateKey = "fakeEncryptedKey"; // Replace with actual key logic
    // const publicKeyPem = "fakePublicKeyPem"; // Replace with actual key logic
    await make_some_post();

});
 */


 // Function to show spinner
function showSpinner(button) {
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span> Processing...`; // Replace button content
}

// Function to hide spinner and restore button
function hideSpinner(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText; // Restore original button content
}

// Updated make_some_post function
async function make_some_post({
    title = document.getElementById("title").value,
    content = document.getElementById("content").value,
    image_url = document.getElementById("image_url").value,
    author = document.getElementById("author").value || keypair.publicKey.toBase58(),
    others = {
        nft: "false",
        nude: "false",
        encryption: "",
        share: "false",
        comment: "false",
        main_post_id: "", 
        category: "entertainment",
        hash: "",
        pubkey: keypair.publicKey.toBase58(),
        ip: "",
        geo: "LAT, LONG",
        others: ""
    },
    encryption_type = "" // New parameter
} = {}) {
    try {
        // Encrypt private key
        const encryptedPrivateKey = await encryptPrivateKey(serverPublicKeyPem, JSON.stringify(Array.from(keypair.secretKey)));

        // Construct postData
        const postData = {
            encryptedPrivateKey: encryptedPrivateKey,
            publicKey: serverPublicKeyPem,
            title: title,
            content: content,
            image_url: image_url,
            author: author,
            date: new Date().toISOString(),
            others: typeof others != "string" ? JSON.stringify(others) : others, // Ensure "others" is a JSON structure
            // encryption_type: encryption_type // Include encryption_type in the payload
        };

        console.log("Post Data:", postData);

        // Send data to server
        const response = await fetch(NODE_URL+"/api/create-post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(postData)
        });

        // Handle response
        const result = await response.json();
        alert("Output: " + JSON.stringify(result));
    } catch (error) {
        console.error("Error submitting post:", error);
        alert("Failed to submit post.");
    }
}

// Form submission handler with spinner integration
document.getElementById('postForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = event.target.querySelector('button[type="submit"]'); // Target the submit button
    const originalText = submitButton.innerHTML;

    showSpinner(submitButton); // Show spinner

    try {
        // Call make_some_post function
        await make_some_post();
    } finally {
        hideSpinner(submitButton, originalText); // Hide spinner after completion
        document.getElementById('postPopup').style.display = 'none'; // to hide the post Pop-up
        window.location.reload();
    }
});





async function d_post_sharer(entry){
    post = entry.metadata;

    make_some_post({
        title: post.title,
        content: post.content,
        author: post.author,
        others: JSON.stringify({
            nft: "false",
            nude: "false",
            encryption: "", // encryption: "AES256",
            share: "true",
            comment: "false",
            main_post_id: "", 
            category: "entertainment", // "technology",
            hash: "",
            pubkey: keypair.publicKey.toBase58(),
            ip: "", // TODO: we would get this...
            geo: ",", //TODO: We would get this and it would be the LAT,LONG
            others: ""
        })
    });
}



async function d_post_liker(entry){
    console.log(entry);
    let recipientAddress = entry.pubkey;
    let amount = 0.02; // in SOL
    console.log(recipientAddress, amount);

    // await sendSol(recipientAddress, amount);
    await sendSol({ recipientAddress: recipientAddress, amount: 0.02 });

}


async function sendSol({
    recipientAddress = document.getElementById('recipient')?.value,
    amount = parseFloat(document.getElementById('amount')?.value),
} = {}) {
    try {
        // Check if the wallet exists
        if (!keypair) {
            showToast('No wallet found. Create or load a wallet first.');
            return;
        }

        console.log(recipientAddress, amount);

        // Validate recipient address and amount
        if (!recipientAddress || isNaN(amount) || amount <= 0) {
            showToast('Please enter a valid recipient address and amount.');
            return;
        }

        // Convert recipient address to PublicKey
        const recipientPublicKey = new solanaWeb3.PublicKey(recipientAddress);

        // Create the transaction
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: recipientPublicKey,
                lamports: amount * solanaWeb3.LAMPORTS_PER_SOL,
            })
        );

        // Attempt to send and confirm the transaction
        const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [keypair]);
        
        alert(`Transaction successful! Signature: ${signature}`);

        // Success notification
        showToast(`Transaction successful! Signature: ${signature}`);
        
    } catch (error) {
        alert(`Transaction failed: ${error.message}`);
        
        // Failure notification
        showToast(`Transaction failed: ${error.message}`);
        
    }
}


/* 
async function encryptArticleWithServerPublicKey(article, publicKeyPem) {
    // Step 1: Convert PEM public key to CryptoKey object
    const publicKey = await importPublicKey(publicKeyPem);

    // Step 2: Generate AES key and IV
    const aesKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true, // extractable
        ["encrypt", "decrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM requires 12-byte IV

    // Step 3: Encrypt the article with AES-GCM
    const encoder = new TextEncoder();
    const articleData = encoder.encode(article);
    const encryptedArticle = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        aesKey,
        articleData
    );

    // Step 4: Encrypt the AES key and IV with the server's public RSA key
    const encryptedAesKey = await encryptAesKeyWithRsa(aesKey, publicKey);
    const encryptedIv = await encryptIvWithRsa(iv, publicKey);

    // Step 5: Create the authTag (authentication tag) from the encryption
    const authTag = await createAuthTag(encryptedArticle);

    // Step 6: Return the encrypted data
    return {
        encryptedArticle: arrayBufferToBase64(encryptedArticle),
        encryptedAesKey: arrayBufferToBase64(encryptedAesKey),
        encryptedIv: arrayBufferToBase64(encryptedIv),
        authTag: arrayBufferToBase64(authTag)
    };
}

// Helper function to import the public key from PEM format
async function importPublicKey(pem) {
    const binaryDer = pemToBinary(pem);
    return crypto.subtle.importKey(
        "spki", // "spki" format for public keys
        binaryDer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false, // not extractable
        ["encrypt"]
    );
}

// Convert PEM string to binary DER format
function pemToBinary(pem) {
    const lines = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s+/g, '');
    const decoded = atob(lines);
    const binaryDer = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
        binaryDer[i] = decoded.charCodeAt(i);
    }
    return binaryDer.buffer;
}

// Encrypt the AES key with RSA
async function encryptAesKeyWithRsa(aesKey, publicKey) {
    const exportedKey = await crypto.subtle.exportKey("raw", aesKey);
    return crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        exportedKey
    );
}

// Encrypt the IV with RSA
async function encryptIvWithRsa(iv, publicKey) {
    return crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        iv
    );
}

// Create the authentication tag (a hashed message for integrity)
async function createAuthTag(encryptedData) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", encryptedData);
    return hashBuffer.slice(0, 16); // Take the first 16 bytes for the auth tag
}

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
}
 */
