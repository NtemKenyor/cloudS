import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { getKeypairFromFile } from "@solana-developers/helpers";

// Async function to handle your blockchain transaction
async function interactWithBlockchain() {
  try {
    const programId = new PublicKey("D2JpLs5Q35QKSsr2QyfMreFyrneXQm4nWvjzUvSTXzwq");

    // Connect to the Solana cluster
    const connection = new Connection('https://devnet.sonic.game', 'confirmed');

    // Load the keypair from the file
    const keyPair = await getKeypairFromFile("~/.config/solana/id.json");

    // Every transaction requires a blockhash
    const blockhashInfo = await connection.getLatestBlockhash();

    // Create a new transaction
    const tx = new Transaction({
      ...blockhashInfo,
    });

    // Add an instruction to the transaction
    tx.add(
      new TransactionInstruction({
        programId: programId,
        keys: [],
        data: Buffer.from([]), // Empty data for now
      })
    );

    // Sign the transaction
    tx.sign(keyPair);

    // Send the transaction to the Solana network
    const txHash = await connection.sendRawTransaction(tx.serialize());
    console.log("Transaction sent with hash:", txHash);

    // Confirm the transaction
    await connection.confirmTransaction({
      blockhash: blockhashInfo.blockhash,
      lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
      signature: txHash,
    });

    // Fetch transaction details and logs using getTransaction
    const transactionDetails = await connection.getTransaction(txHash, { commitment: "confirmed" });

    if (transactionDetails && transactionDetails.meta) {
      const logs = transactionDetails.meta.logMessages;
      console.log("Transaction logs:", logs);

      // Extract riddles between ****start and ****end
      const riddleLogs = [];
      let isRiddleSection = false;

      for (const log of logs) {
        if (log.includes("****start")) {
          isRiddleSection = true; // Start collecting riddles
          continue; // Skip the start marker
        }

        if (log.includes("****end")) {
          isRiddleSection = false; // Stop collecting riddles
          continue; // Skip the end marker
        }

        if (isRiddleSection && log.includes("riddle:")) {
          // Extract riddle and answer using regex
          const riddleMatch = log.match(/riddle: "(.*?)", answer: "(.*?)"/);
          if (riddleMatch) {
            riddleLogs.push({
              riddle: riddleMatch[1],
              answer: riddleMatch[2],
            });
          }
        }
      }

      // Convert riddles to JSON format
      const riddleJson = JSON.stringify(riddleLogs, null, 2);
      console.log("Riddles in JSON format:", riddleJson);
    } else {
      console.log("No transaction details found or transaction is still pending.");
    }
  } catch (error) {
    console.error("Error interacting with the blockchain:", error);
  }
}

// Call the async function
interactWithBlockchain();
