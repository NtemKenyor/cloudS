// createPost.js
const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require("@solana/web3.js");
const { serialize } = require("borsh");

// Program ID and connection setup
const programId = new PublicKey("HFnssVc9XfdaHe4pdTNG8DH69V6zrKviSFWjf4FWTifp");
// const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const connection = new Connection("https://rpc.devnet.soo.network/rpc", "confirmed");

// Define the PostMetadata class with UTC timestamp support
class PostMetadata {
    constructor({ title, content, image_url, author, date = getUtcTimestamp(), others }) {
        this.title = title;
        this.content = content;
        this.image_url = image_url;
        this.author = author;
        this.date = date;
        this.others = others;
    }
}

// Borsh schema for serializing PostMetadata
const postMetadataSchema = new Map([
    [PostMetadata, { kind: "struct", fields: [
        ['title', 'string'],
        ['content', 'string'],
        ['image_url', 'string'],
        ['author', 'string'],
        ['date', 'string'],  // UTC timestamp as string
        ['others', 'string']
    ]}],
]);

// Helper function to get the current UTC timestamp as a string
function getUtcTimestamp() {
    return new Date().toISOString(); // ISO string format in UTC
}

async function createPost(userKeypair, metadata) {
    const postAccount = Keypair.generate();
    const metadataWithUtc = new PostMetadata(metadata); // Ensure date defaults to UTC if not provided

    // Serialize the metadata with the timestamp
    const serializedMetadata = serialize(postMetadataSchema, metadataWithUtc);

    // Create the account and store metadata on the blockchain
    const createPostTx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: userKeypair.publicKey,
            newAccountPubkey: postAccount.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(serializedMetadata.length),
            space: serializedMetadata.length,
            programId: programId,
        })
    );

    // Add the serialized data to the transaction
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
    return {
        signature: signature,
        program_account: JSON.stringify(Array.from(postAccount.secretKey))
    };
}

module.exports = { createPost };
