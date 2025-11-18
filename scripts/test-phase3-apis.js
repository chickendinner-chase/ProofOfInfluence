/**
 * Test script for Phase 3 API endpoints
 * Tests: AchievementBadges mint, ReferralRegistry query, Wallet connect signature
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// Test addresses (Base Sepolia testnet)
const TEST_WALLET = "0x1234567890123456789012345678901234567890";
const TEST_INVITER = "0x0987654321098765432109876543210987654321";

async function testRequest(method, path, body = null, headers = {}) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function testAchievementBadgesMint() {
  console.log("\n🧪 Testing AchievementBadges Mint API");
  console.log("=" .repeat(50));

  // Note: This requires authentication, so we'll just test the endpoint structure
  console.log("POST /api/badges/mint");
  console.log("⚠️  Requires authentication - test manually with:");
  console.log(`   curl -X POST ${BASE_URL}/api/badges/mint \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -H "Cookie: <session-cookie>" \\`);
  console.log(`     -d '{"to": "${TEST_WALLET}", "badgeType": 1}'`);
}

async function testReferralRegistryQuery() {
  console.log("\n🧪 Testing ReferralRegistry Query API");
  console.log("=" .repeat(50));

  // Note: This requires authentication
  console.log("GET /api/referral/on-chain");
  console.log("⚠️  Requires authentication - test manually with:");
  console.log(`   curl ${BASE_URL}/api/referral/on-chain \\`);
  console.log(`     -H "Cookie: <session-cookie>"`);
}

async function testReferralRegistryRegister() {
  console.log("\n🧪 Testing ReferralRegistry Register API");
  console.log("=" .repeat(50));

  // Note: This requires authentication
  console.log("POST /api/referral/register-on-chain");
  console.log("⚠️  Requires authentication - test manually with:");
  console.log(`   curl -X POST ${BASE_URL}/api/referral/register-on-chain \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -H "Cookie: <session-cookie>" \\`);
  console.log(`     -d '{"inviterAddress": "${TEST_INVITER}"}'`);
}

async function testWalletNonce() {
  console.log("\n🧪 Testing Wallet Nonce API");
  console.log("=" .repeat(50));

  const result = await testRequest("GET", `/api/auth/wallet/nonce?address=${TEST_WALLET}`);
  
  if (result.status === 200) {
    console.log("✅ GET /api/auth/wallet/nonce - Success");
    console.log("   Response:", JSON.stringify(result.data, null, 2));
    return result.data.nonce;
  } else {
    console.log("❌ GET /api/auth/wallet/nonce - Failed");
    console.log("   Status:", result.status);
    console.log("   Error:", result.error || result.data);
    return null;
  }
}

async function testWalletConnect() {
  console.log("\n🧪 Testing Wallet Connect API");
  console.log("=" .repeat(50));

  // First get a nonce
  const nonceResult = await testRequest("GET", `/api/auth/wallet/nonce?address=${TEST_WALLET}`);
  
  if (nonceResult.status !== 200) {
    console.log("❌ Cannot test wallet connect - failed to get nonce");
    return;
  }

  const nonce = nonceResult.data.nonce;
  console.log("📝 Got nonce:", nonce);
  console.log("⚠️  To test wallet connect, you need to:");
  console.log("   1. Sign the message with your wallet");
  console.log("   2. POST to /api/wallet/connect with signature");
  console.log(`   Message: "Sign this nonce to prove ownership: ${nonce}"`);
}

async function testContractConfigs() {
  console.log("\n🧪 Testing Contract Configurations");
  console.log("=" .repeat(50));

  // Check if contract configs are loaded
  try {
    const { readFileSync } = await import("fs");
    const { fileURLToPath } = await import("url");
    const { dirname, join } = await import("path");
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const projectRoot = join(__dirname, "..");

    const achievementBadges = JSON.parse(
      readFileSync(join(projectRoot, "shared/contracts/achievement_badges.json"), "utf-8")
    );
    const referralRegistry = JSON.parse(
      readFileSync(join(projectRoot, "shared/contracts/referral_registry.json"), "utf-8")
    );

    console.log("✅ AchievementBadges config loaded");
    console.log(`   Address: ${achievementBadges.address}`);
    console.log(`   Has ABI: ${achievementBadges.abi ? "Yes" : "No"}`);

    console.log("\n✅ ReferralRegistry config loaded");
    console.log(`   Address: ${referralRegistry.address}`);
    console.log(`   Has ABI: ${referralRegistry.abi ? "Yes" : "No"}`);
  } catch (error) {
    console.log("❌ Failed to load contract configs:", error.message);
  }
}

async function main() {
  console.log("🚀 Phase 3 API Testing");
  console.log("=" .repeat(50));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Wallet: ${TEST_WALLET}`);

  // Test contract configs
  await testContractConfigs();

  // Test wallet nonce (public endpoint)
  await testWalletNonce();

  // Test wallet connect (requires signature)
  await testWalletConnect();

  // Test AchievementBadges (requires auth)
  await testAchievementBadgesMint();

  // Test ReferralRegistry (requires auth)
  await testReferralRegistryQuery();
  await testReferralRegistryRegister();

  console.log("\n" + "=" .repeat(50));
  console.log("✅ Test script completed");
  console.log("\n📝 Note: Most endpoints require authentication.");
  console.log("   Use browser DevTools or Postman with session cookies to test authenticated endpoints.");
}

// Run if executed directly
main().catch(console.error);

