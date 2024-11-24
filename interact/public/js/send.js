        
// Check if solanaWeb3 is defined
if (typeof solanaWeb3 === 'undefined') {
    console.log("solanaWeb3 is not defined. Make sure the Solana Web3 library is loaded.");
}

let keypair;
// Connect to the Solana devnet
// const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
const connection = new solanaWeb3.Connection('https://rpc.devnet.soo.network/rpc', 'confirmed');
// const connection = new solanaWeb3.Connection('http://127.0.0.1:8899', 'confirmed');

// Create a new wallet and save private key in localStorage
// async function createWallet() {
//     keypair = solanaWeb3.Keypair.generate();
//     localStorage.setItem('solana_private_key', JSON.stringify(Array.from(keypair.secretKey)));
//     displayWalletInfo();
// }

// Display public key and balance
function displayWalletInfo() {
    document.getElementById('publicKey').textContent = keypair.publicKey.toBase58();
    getBalance();
}

// Retrieve private key from localStorage
function loadStoredWallet() {
    const privateKey = localStorage.getItem('solana_private_key');
    if (privateKey) {
        keypair = solanaWeb3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(privateKey)));
        displayWalletInfo();
    } else {
        if (confirm('No wallet found. Would you like to go to the homepage to create a new wallet?')) {
            window.location.href = 'index.html'; // Redirects to the homepage
        }
    }
}


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
function loadPrivateKeyFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const privateKeyArray = JSON.parse(e.target.result);
        keypair = solanaWeb3.Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
        displayWalletInfo();
    };
    reader.readAsText(file);
}


// Fetch wallet balance
async function getBalance() {
    if (!keypair) {
        alert('No wallet found. Create or load a wallet first.');
        return;
    }
    const balance = await connection.getBalance(keypair.publicKey);
    document.getElementById('balance').textContent = (balance / solanaWeb3.LAMPORTS_PER_SOL) + ' SOL';
}

// Send SOL to another address
async function sendSol() {
    if (!keypair) {
        alert('No wallet found. Create or load a wallet first.');
        return;
    }

    const recipientAddress = document.getElementById('recipient').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (!recipientAddress || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid recipient address and amount.');
        return;
    }

    const recipientPublicKey = new solanaWeb3.PublicKey(recipientAddress);
    const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: recipientPublicKey,
            lamports: amount * solanaWeb3.LAMPORTS_PER_SOL,
        })
    );

    try {
        const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [keypair]);
        document.getElementById('transactionStatus').textContent = 'Transaction successful! Signature: ' + signature;
    } catch (error) {
        document.getElementById('transactionStatus').textContent = 'Transaction failed: ' + error.message;
    }
}

// // Interact with a Solana program
// async function interactWithProgram() {
//     const programId = document.getElementById('programId').value;

//     if (!programId) {
//         alert('Please enter a valid Program ID.');
//         return;
//     }

//     try {
//         const publicKey = new solanaWeb3.PublicKey(programId);
//         const accountInfo = await connection.getAccountInfo(publicKey);

//         if (accountInfo === null) {
//             document.getElementById('programOutput').textContent = 'Program not found or has no data.';
//         } else {
//             const data = accountInfo.data;
//             document.getElementById('programOutput').textContent = 'Program Data: ' + new TextDecoder().decode(data);
//         }
//     } catch (error) {
//         document.getElementById('programOutput').textContent = 'Error interacting with program: ' + error.message;
//     }
// }

// Interact with Solana Program
async function interactWithProgram() {
    const programId = document.getElementById('programId').value;
    if (!programId) {
        alert("Please enter a Program ID.");
        return;
    }

    try {
        const programPublicKey = new solanaWeb3.PublicKey(programId);
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: programPublicKey,
                lamports: 1000, // Example value, you can change this as per your program logic
            })
        );

        // Send the transaction and confirm it
        const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [keypair]);
        console.log('Transaction successful! Signature:', signature);
        document.getElementById('programData').textContent = 'Transaction successful! Signature: ' + signature;

        // Fetch and display program logs if available
        const logs = await connection.getTransaction(signature, { commitment: 'confirmed' });
        console.log('Transaction logs:', logs);
        document.getElementById('programData').textContent += '\n' + JSON.stringify(logs, null, 2);

    } catch (error) {
        console.error('Error interacting with program:', error);
        document.getElementById('programData').textContent = 'Error: ' + error.message;
    }
}

// Load wallet if private key exists in localStorage
window.onload = loadStoredWallet;
