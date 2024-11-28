// fetchMetadata.js
const { Connection, PublicKey } = require("@solana/web3.js");
const { deserialize } = require("borsh");
require('dotenv').config();

// // HFnssVc9XfdaHe4pdTNG8DH69V6zrKviSFWjf4FWTifp
const programId = new PublicKey("HFnssVc9XfdaHe4pdTNG8DH69V6zrKviSFWjf4FWTifp");
// // const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const connection = new Connection("https://rpc.devnet.soo.network/rpc", "confirmed");

// // Function to determine if running on localhost
// const isLocalhost = () => {
//     const env = process.env.NODE_ENV || "production";;
//     return env === "development" || env === "localhost";
// };

// // Set connection endpoint based on environment
// const rpcUrl = isLocalhost() ? "http://127.0.0.1:8899" : "https://rpc.devnet.soo.network/rpc"; // Live server endpoint  

// const connection = new Connection(rpcUrl, "confirmed");


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

const postMetadataSchema = new Map([
    [PostMetadata, { kind: "struct", fields: [
        ["title", "string"],
        ["content", "string"],
        ["image_url", "string"],
        ["author", "string"],
        ["date", "string"],
        ["others", "string"]
    ]}],
]);

async function fetchMetadataForAccounts() {
    const accountMetadata = [];

    try {
        const programAccounts = await connection.getProgramAccounts(programId, {
            commitment: "confirmed",
            encoding: "base64",
        });

        for (const account of programAccounts) {
            const metadata = deserialize(postMetadataSchema, PostMetadata, Buffer.from(account.account.data, 'base64'));
            accountMetadata.push({
                pubkey: account.pubkey.toString(),
                metadata,
            });
        }

        return accountMetadata;

    } catch (err) {
        console.error("Error fetching account metadata:", err);
        return [];
    }
}

module.exports = { fetchMetadataForAccounts };
