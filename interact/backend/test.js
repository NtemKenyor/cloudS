require('dotenv').config();
// fetchMetadata.js
const { Connection, PublicKey } = require("@solana/web3.js");
const { deserialize } = require("borsh");
// // HFnssVc9XfdaHe4pdTNG8DH69V6zrKviSFWjf4FWTifp
const programId = new PublicKey("HFnssVc9XfdaHe4pdTNG8DH69V6zrKviSFWjf4FWTifp");
// // const connection = new Connection("http://127.0.0.1:8899", "confirmed");
// const connection = new Connection("https://rpc.devnet.soo.network/rpc", "confirmed");

// Function to determine if running on localhost
const isLocalhost = () => {
    const env = process.env.NODE_ENV || "production";;
    return env === "development" || env === "localhost";
};

// Set connection endpoint based on environment
const rpcUrl = isLocalhost() ? "http://127.0.0.1:8899" : "https://rpc.devnet.soo.network/rpc"; // Live server endpoint  
const connection = new Connection(rpcUrl, "confirmed");
console.log(rpcUrl);