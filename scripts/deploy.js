const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("-----------------------------------------");
  console.log("Starting DVote Smart Contract Deployment...");
  console.log("-----------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");

  const DVote = await hre.ethers.getContractFactory("DVote");
  const dVote = await DVote.deploy();
  await dVote.waitForDeployment();

  const contractAddress = await dVote.getAddress();
  console.log("DVote deployed successfully to:", contractAddress);

  // Read the artifact for ABI
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/DVote.sol/DVote.json"
  );

  let abi = [];
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    abi = artifact.abi;
  }

  // Ensure frontend/src/contracts directory exists
  const frontendContractsDir = path.join(__dirname, "../frontend/src/contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const deploymentData = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployedAt: new Date().toISOString(),
    abi: abi,
  };

  fs.writeFileSync(
    path.join(frontendContractsDir, "DVote.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("Saved contract address and ABI to frontend/src/contracts/DVote.json");

  // Seed sample proposals if on local network for immediate reviewer experience
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    console.log("Seeding sample proposals for local testing...");
    try {
      const tx1 = await dVote.createProposal(
        "Organize GDG Web3 Bootcamp & Hackathon",
        "Allocate $1,000 in prizes and resources for an inter-college Web3 developer bootcamp and demo day.",
        3 * 24 * 60 * 60 // 3 days
      );
      await tx1.wait();

      const tx2 = await dVote.createProposal(
        "Adopt On-Chain Voting for Student Council",
        "Transition GDG campus chapter elections and project grant allocations entirely onto dVote smart contracts.",
        7 * 24 * 60 * 60 // 7 days
      );
      await tx2.wait();

      const tx3 = await dVote.createProposal(
        "Demo Flash Proposal (60 Seconds Expiry)",
        "Short duration proposal designed to quickly test and demonstrate expired/closed state handling.",
        60 // 60 seconds
      );
      await tx3.wait();

      console.log("Sample proposals seeded successfully!");
    } catch (err) {
      console.warn("Notice: Proposal seeding skipped:", err.message);
    }
  }

  console.log("-----------------------------------------");
  console.log("Deployment & Initialization complete!");
  console.log("-----------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });

