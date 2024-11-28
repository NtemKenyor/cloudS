import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
  } from "@solana/web3.js";
  import { getKeypairFromFile } from "@solana-developers/helpers";
  
  const programId = new PublicKey("D2JpLs5Q35QKSsr2QyfMreFyrneXQm4nWvjzUvSTXzwq");
  // const connection = new Connection('https://devnet.sonic.game', 'confirmed');
  const connection = new Connection("https://rpc.devnet.soo.network/rpc", "confirmed");

  
  async function getRiddlesFromBlockchain() {
    try {
      // Load the keypair from the file
      const keyPair = await getKeypairFromFile("test_wallet.json");
  
      // Get the latest blockhash
      const blockhashInfo = await connection.getLatestBlockhash();
  
      // Create a new transaction
      const tx = new Transaction({
        ...blockhashInfo,
      });
  
      // Add Hello World instruction
      tx.add(
        new TransactionInstruction({
          programId: programId,
          keys: [],
          data: Buffer.from([]),
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
  
      // Fetch transaction details and logs
      const transactionDetails = await connection.getTransaction(txHash, { commitment: "confirmed" });
  
      // Extract logs
      const logs = transactionDetails.meta.logMessages;
      console.log("Transaction logs:", logs);
  
      // Extract riddles between ****start and ****end
      const riddleLogs = [];
      let isRiddleSection = false;
  
      for (const log of logs) {
        if (log.includes("****start")) {
          isRiddleSection = true;
          continue;
        }
  
        if (log.includes("****end")) {
          isRiddleSection = false;
          continue;
        }
  
        if (isRiddleSection && log.includes("riddle:")) {
          const riddleMatch = log.match(/riddle: "(.*?)", answer: "(.*?)"/);
          if (riddleMatch) {
            riddleLogs.push({
              riddle: riddleMatch[1],
              answer: riddleMatch[2],
            });
          }
        }
      }
  
      // Convert to JSON format
      const riddleJson = JSON.stringify(riddleLogs, null, 2);
      console.log("Riddles in JSON format:", riddleJson);
  
      return riddleLogs; // Return riddles extracted from the blockchain
  
    } catch (error) {
      console.error("Error interacting with the blockchain:", error);
      throw error; // Rethrow error to handle in API
    }
  }
  