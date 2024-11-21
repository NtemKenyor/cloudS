// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Keypair } = require("@solana/web3.js");
const { fetchMetadataForAccounts } = require("./fetchMetadata");
const { createPost } = require("./createPost");
const forge = require("node-forge");

const app = express();
const PORT = 3000;

// Load server's private key from environment variable
const serverPrivateKeyPem = process.env.SERVER_PRIVATE_KEY;
const serverPublicKeyPem = process.env.SERVER_PUBLIC_KEY;

let MAIN_DIR = "/cloudS/interact/backend";

app.use(cors());
app.use(express.json());

// Serve "Hello World" at /sonic_universe/client/sonic_planet/api/
app.get(MAIN_DIR+'/', (req, res) => {
    res.send('Entrace Point - Hello world');
});

app.get(MAIN_DIR+"/api/metadata", async (req, res) => {
    const metadata = await fetchMetadataForAccounts();
    res.json(metadata);
});



function getKeyFingerprint(pem) {
    // Convert PEM to public key object
    const key = forge.pki.publicKeyFromPem(pem);
    // Convert key to DER format and create a hash with forge
    const der = forge.asn1.toDer(forge.pki.publicKeyToAsn1(key)).getBytes();
    const sha256 = forge.md.sha256.create();
    sha256.update(der, "binary");
    return sha256.digest().toHex();
}

async function decryptPrivateKey(privateKeyPem, encryptedPrivateKeyJson) {
    // Parse the received JSON string into an object
    const encryptedData = JSON.parse(encryptedPrivateKeyJson);
    
    // Convert the server's private key from PEM format to a Forge private key object
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    
    // Decrypt each encrypted chunk using RSA-OAEP
    const decryptedChunks = await Promise.all(encryptedData.encryptedChunks.map(async (encryptedChunk) => {
        try {
            return privateKey.decrypt(encryptedChunk, 'RSA-OAEP');
        } catch (error) {
            console.error("Error decrypting chunk:", error);
            throw error;
        }
    }));

    // Reconstruct the original private key by joining the decrypted chunks
    const decryptedPrivateKey = decryptedChunks.join('');

    // Return the decrypted private key (in original string format)
    return decryptedPrivateKey;
}




app.post(MAIN_DIR+"/api/create-post", async (req, res) => {
    const { encryptedPrivateKey, publicKey, title, content, image_url, author, date, others } = req.body;

    if (!encryptedPrivateKey || !publicKey || !content) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Get fingerprints of the provided public key and server's public key
        console.log(publicKey, serverPublicKeyPem);
        const clientPublicKeyFingerprint = getKeyFingerprint(publicKey);
        const serverPublicKeyFingerprint = getKeyFingerprint(serverPublicKeyPem);

        if (clientPublicKeyFingerprint !== serverPublicKeyFingerprint) {
            return res.status(403).json({ error: "Invalid encryption public key" });
        }



        const decryptedPrivateKey = await decryptPrivateKey(serverPrivateKeyPem, encryptedPrivateKey);

        console.log(content, others); // This will be the original private key object

        // Decrypt user's private key using server's private key
        // const privateKey = forge.pki.privateKeyFromPem(serverPrivateKeyPem);

        // // Decode the base64 encoded encrypted private key
        // const encryptedBytes = forge.util.decode64(encryptedPrivateKey);

        // // Decrypt the private key
        // const decryptedPrivateKey = privateKey.decrypt(encryptedBytes, "RSA-OAEP");

        // console.log(decryptedPrivateKey);

        // Use the decrypted private key to create the user's Keypair
        const userKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(decryptedPrivateKey)));
        // const metadata = new PostMetadata({ title, content, image_url, author, date, others });
        const metadata = { title, content, image_url, author, date, others };

        // Proceed to create the post on the blockchain
        const {signature, program_account} = await createPost(userKeypair, metadata);
        res.json({ message: "Post created successfully", edit_key: program_account, signature });
        
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ error: "Failed to create post", details: err });
    }
});

/* app.post("/api/create-post", async (req, res) => {
    const { encryptedPrivateKey, publicKey, title, content, image_url, author, date, others } = req.body;

    if (!encryptedPrivateKey || !publicKey || !title || !content) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Verify the public key matches the server's expected public key
        const expectedPublicKey = forge.pki.publicKeyFromPem(publicKey);
        const serverPublicKeyPem = forge.pki.publicKeyToPem(expectedPublicKey);
        

        console.log(publicKey);
        console.log("--------------the next one below -------------")
        console.log(serverPublicKeyPem)

        if (serverPublicKeyPem !== publicKey) {
            return res.status(403).json({ error: "Invalid encryption public key" });
        }

        // Decrypt user's private key using server's private key
        const privateKey = forge.pki.privateKeyFromPem(serverPrivateKeyPem);
        const decryptedPrivateKey = privateKey.decrypt(encryptedPrivateKey, "RSA-OAEP");


        console.log(decryptedPrivateKey);

        // Use the decrypted private key to create the user's Keypair
        const userKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(decryptedPrivateKey)));
        const metadata = new PostMetadata({ title, content, image_url, author, date, others });

        // Proceed to create the post on the blockchain
        const signature = await createPost(userKeypair, metadata);
        res.json({ message: "Post created successfully", signature });
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ error: "Failed to create post" });
    }
});
 */
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
