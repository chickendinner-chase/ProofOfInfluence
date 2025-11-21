/**
 * Get AgentKit Wallet Address
 * 
 * This script retrieves the wallet address associated with the CDP API key
 * Note: This uses server-side AgentKit code, so it needs to run in Node.js environment
 */

require("dotenv").config({ override: true });

async function main() {
  try {
    // Import AgentKit (ESM module)
    const { AgentKit, CdpWalletProvider } = await import("@coinbase/agentkit");

    const apiKeyName = process.env.CDP_API_KEY_NAME;
    const apiKeyPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY;
    
    if (!apiKeyName || !apiKeyPrivateKey) {
      throw new Error("CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY must be configured");
    }

    console.log("🔍 Retrieving AgentKit Wallet Address...\n");

    const walletProvider = await CdpWalletProvider.configureWithWallet({
      apiKeyName,
      apiKeyPrivateKey,
      networkId: process.env.AGENTKIT_DEFAULT_CHAIN || "base-sepolia",
    });

    const walletAddress = await walletProvider.getAddress();
    
    console.log("✅ AgentKit Wallet Address:");
    console.log(`   ${walletAddress}\n`);
    console.log("📋 Add this to your .env file:");
    console.log(`   CDP_WALLET_ADDRESS=${walletAddress}\n`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\n💡 Alternative: Use the server API endpoint to get the address");
    console.error("   Or check your CDP dashboard for the wallet address\n");
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

