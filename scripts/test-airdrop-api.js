/**
 * Test script for Airdrop API endpoints
 * Run with: node scripts/test-airdrop-api.js
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

async function testAirdropCheck(address) {
  console.log(`\n=== Testing /api/airdrop/check ===`);
  console.log(`Address: ${address}`);

  try {
    const response = await fetch(`${BASE_URL}/api/airdrop/check?address=${address}`);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (data.eligible) {
      console.log(`✅ Eligible for airdrop!`);
      console.log(`   Amount: ${data.amount} wei`);
      console.log(`   Index: ${data.index}`);
      console.log(`   Proof length: ${data.proof?.length || 0}`);
      console.log(`   Round ID: ${data.roundId || 0}`);
    } else {
      console.log(`❌ Not eligible for airdrop`);
    }
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

async function testCreateEligibility() {
  console.log(`\n=== Testing /api/admin/airdrop/eligibility ===`);

  const testData = {
    walletAddress: "0x1234567890123456789012345678901234567890",
    amount: 1000, // 1000 POI
    merkleIndex: 0,
    merkleProof: [],
    roundId: 0,
  };

  try {
    const response = await fetch(`${BASE_URL}/api/admin/airdrop/eligibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log(`✅ Eligibility created successfully`);
    } else {
      console.log(`❌ Failed to create eligibility`);
    }
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

async function testBatchCreate() {
  console.log(`\n=== Testing /api/admin/airdrop/batch ===`);

  const testData = {
    recipients: [
      {
        walletAddress: "0x1111111111111111111111111111111111111111",
        amount: 1000,
      },
      {
        walletAddress: "0x2222222222222222222222222222222222222222",
        amount: 2000,
      },
      {
        walletAddress: "0x3333333333333333333333333333333333333333",
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

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log(`✅ Batch created successfully`);
      console.log(`   Root: ${data.root}`);
      console.log(`   Created: ${data.created} records`);
    } else {
      console.log(`❌ Failed to batch create`);
    }
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

async function main() {
  console.log(`Testing Airdrop API at ${BASE_URL}`);

  // Test 1: Check eligibility (should return not eligible if no record exists)
  await testAirdropCheck("0x1234567890123456789012345678901234567890");

  // Test 2: Create eligibility
  await testCreateEligibility();

  // Test 3: Check eligibility again (should now be eligible)
  await testAirdropCheck("0x1234567890123456789012345678901234567890");

  // Test 4: Batch create
  await testBatchCreate();

  // Test 5: Check batch created addresses
  await testAirdropCheck("0x1111111111111111111111111111111111111111");
  await testAirdropCheck("0x2222222222222222222222222222222222222222");

  console.log(`\n=== Tests complete ===`);
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === "undefined") {
  console.error("❌ This script requires Node.js 18+ with fetch support");
  console.error("   Or install node-fetch: npm install node-fetch");
  process.exit(1);
}

main().catch(console.error);

