/**
 * Simple test script for Airdrop API endpoints (without database)
 * Tests the API logic and response format
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// Mock test data
const testAddresses = [
  "0x1234567890123456789012345678901234567890",
  "0x1111111111111111111111111111111111111111",
  "0x2222222222222222222222222222222222222222",
];

async function testAirdropCheck(address) {
  console.log(`\n=== Testing /api/airdrop/check ===`);
  console.log(`Address: ${address}`);

  try {
    const response = await fetch(`${BASE_URL}/api/airdrop/check?address=${address}`);
    
    if (!response.ok) {
      console.log(`❌ Status: ${response.status}`);
      const errorText = await response.text();
      console.log(`Error: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    // Validate response structure
    const requiredFields = ["eligible", "amount"];
    const hasAllFields = requiredFields.every(field => field in data);
    
    if (hasAllFields) {
      console.log(`✅ Response structure is valid`);
      
      if (data.eligible) {
        console.log(`✅ Eligible for airdrop!`);
        console.log(`   Amount: ${data.amount} wei`);
        console.log(`   Index: ${data.index ?? "N/A"}`);
        console.log(`   Proof length: ${data.proof?.length || 0}`);
        console.log(`   Round ID: ${data.roundId ?? "N/A"}`);
        
        // Validate amount format (should be string representing wei)
        if (typeof data.amount === "string" && /^\d+$/.test(data.amount)) {
          console.log(`✅ Amount format is correct (wei string)`);
        } else {
          console.log(`⚠️  Amount format may be incorrect`);
        }
      } else {
        console.log(`ℹ️  Not eligible (expected if no record exists)`);
      }
    } else {
      console.log(`❌ Response missing required fields`);
    }
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    if (error.code === "ECONNREFUSED") {
      console.error(`   Server is not running. Start with: npm run dev`);
    }
  }
}

async function testBatchCreate() {
  console.log(`\n=== Testing /api/admin/airdrop/batch ===`);

  const testData = {
    recipients: [
      {
        walletAddress: testAddresses[0],
        amount: 1000,
      },
      {
        walletAddress: testAddresses[1],
        amount: 2000,
      },
      {
        walletAddress: testAddresses[2],
        amount: 500,
      },
    ],
    roundId: 0,
  };

  try {
    const response = await fetch(`${BASE_URL}/api/admin/airdrop/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      console.log(`❌ Status: ${response.status}`);
      const errorText = await response.text();
      console.log(`Error: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    // Validate response structure
    if (data.created && data.root && data.recipients) {
      console.log(`✅ Batch create successful!`);
      console.log(`   Created: ${data.created} records`);
      console.log(`   Root: ${data.root}`);
      console.log(`   Recipients: ${data.recipients.length}`);
      
      // Validate root format (should be hex string)
      if (typeof data.root === "string" && data.root.startsWith("0x")) {
        console.log(`✅ Root format is correct (hex string)`);
      } else {
        console.log(`⚠️  Root format may be incorrect`);
      }
    } else {
      console.log(`❌ Response missing required fields`);
    }
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    if (error.code === "ECONNREFUSED") {
      console.error(`   Server is not running. Start with: npm run dev`);
    }
  }
}

async function main() {
  console.log(`🧪 Testing Airdrop API at ${BASE_URL}`);
  console.log(`\nNote: This test requires the server to be running`);
  console.log(`Start server with: npm run dev\n`);

  // Test 1: Check eligibility (should return not eligible if no record exists)
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Test 1: Check eligibility (no record)`);
  console.log(`${"=".repeat(50)}`);
  await testAirdropCheck(testAddresses[0]);

  // Test 2: Batch create (if server is running and database is connected)
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Test 2: Batch create eligibility`);
  console.log(`${"=".repeat(50)}`);
  await testBatchCreate();

  // Test 3: Check eligibility again (should now be eligible if batch create worked)
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Test 3: Check eligibility (after batch create)`);
  console.log(`${"=".repeat(50)}`);
  await testAirdropCheck(testAddresses[0]);

  console.log(`\n${"=".repeat(50)}`);
  console.log(`✅ Tests complete`);
  console.log(`${"=".repeat(50)}`);
  console.log(`\nNext steps:`);
  console.log(`1. Ensure database is connected and run: npm run db:push`);
  console.log(`2. Start server: npm run dev`);
  console.log(`3. Run this test again: node scripts/test-airdrop-api-simple.js`);
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === "undefined") {
  console.error("❌ This script requires Node.js 18+ with fetch support");
  console.error("   Or install node-fetch: npm install node-fetch");
  process.exit(1);
}

main().catch(console.error);

