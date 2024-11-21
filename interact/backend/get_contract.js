const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require("@solana/web3.js");
const { serialize } = require("borsh");

// Program ID (replace with your actual deployed program ID)
const programId = new PublicKey("HFnssVc9XfdaHe4pdTNG8DH69V6zrKviSFWjf4FWTifp");

// Connect to a local validator or devnet
const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

// Define the PostMetadata structure
class PostMetadata {
    constructor({ title, content, image_url, author, date, others }) {
        this.title = title;
        this.content = content;
        this.image_url = image_url;
        this.author = author;
        this.date = date;
        this.others = others;
    }
}

// Borsh schema for PostMetadata
const postMetadataSchema = new Map([
    [PostMetadata, { kind: 'struct', fields: [
        ['title', 'string'],
        ['content', 'string'],
        ['image_url', 'string'],
        ['author', 'string'],
        ['date', 'string'],
        ['others', 'string']
    ]}],
]);

// Sample metadata to be stored on-chain
const sampleMetadata = new PostMetadata({
    title: "Hello Solana!",
    content: "This is a test post on Solana.",
    image_url: "https://example.com/image.png",
    author: "Alice",
    date: "2024-11-10",
    others: "Additional information"
});

// Create a test user Keypair
const userKeypair = Keypair.generate();

async function requestAirdrop(userPublicKey) {
    // Request an airdrop of 1 SOL to the user's public key
    console.log("Requesting airdrop...");
    const signature = await connection.requestAirdrop(userPublicKey, 1e9); // 1 SOL = 1e9 lamports
    await connection.confirmTransaction(signature);
    console.log("Airdrop complete with signature:", signature);
}

async function createPost(programId, userKeypair, metadata) {
    // Generate a new Keypair for the post account
    const postAccount = Keypair.generate();

    // Serialize metadata
    const serializedMetadata = serialize(postMetadataSchema, metadata);

    // Transaction to create the post account and store metadata
    const createPostTx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: userKeypair.publicKey,
            newAccountPubkey: postAccount.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(serializedMetadata.length),
            space: serializedMetadata.length,
            programId: programId,
        })
    );

    // Instruction to call the program and save metadata to the post account
    createPostTx.add({
        keys: [
            { pubkey: postAccount.publicKey, isSigner: false, isWritable: true },
            { pubkey: userKeypair.publicKey, isSigner: true, isWritable: false },
        ],
        programId,
        data: Buffer.from(serializedMetadata),
    });

    // Sign and send the transaction
    const signature = await connection.sendTransaction(createPostTx, [userKeypair, postAccount]);
    await connection.confirmTransaction(signature);
    console.log("Post created with signature:", signature);
}

// Run the function
(async () => {
    await requestAirdrop(userKeypair.publicKey); // Airdrop SOL to userKeypair before proceeding
    await createPost(programId, userKeypair, sampleMetadata);
})();
