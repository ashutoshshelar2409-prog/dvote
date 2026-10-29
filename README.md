# 🗳️ dVote — Decentralized Voting Application
### Google Developer Groups (GDG) Web3 Recruitment Submission

**dVote** is a complete, beginner-understandable, and fully verified decentralized voting application. It enables community members and student organizations to propose initiatives and cast transparent, tamper-proof on-chain votes using Ethereum smart contracts and MetaMask.

---

## 🚀 Key Features

1. **MetaMask Wallet Connection**: Seamlessly connects to MetaMask using ethers.js v6, displaying truncated address, live ETH balance, and active network.
2. **Network Detection & 1-Click Switch**: Automatically detects if the wallet is on the wrong chain and provides a 1-click prompt to switch or add the **Hardhat Localhost** network (`Chain ID: 31337`).
3. **On-Chain Proposal Creation**: Anyone can submit a proposal with a title, description, and custom voting duration (minutes, hours, or days) enforced by `block.timestamp`.
4. **All Proposals Display**: Shows all active and historical proposals with ID, title, description, YES count, NO count, deadline, and real-time **Active / Closed** status badges.
5. **YES / NO Voting**: Connected wallets can vote on active proposals with live visual progress bars and participation metrics.
6. **Strict 1-Vote-Per-Wallet Enforcement**: Enforced strictly inside the Solidity smart contract via a nested mapping (`mapping(uint256 => mapping(address => bool))`). A wallet can vote once per proposal, and independently across different proposals.
7. **On-Chain Expiration Enforcement**: Solidity rejects any votes attempted after the proposal deadline (`require(block.timestamp < proposal.deadline)`).
8. **Wallet Voting Status**: Instant UI indicator showing whether the connected address has already voted (`You voted YES`, `You voted NO`, or `Vote YES / Vote NO` actions).
9. **Automatic State Refresh**: Automatically updates vote counts and status badges upon confirmed transaction receipts, with an optional manual refresh button.
10. **Resilient UX & Error Handling**: User-friendly alerts and toasts for user rejection in MetaMask, pending transactions, network switch prompts, and contract reverts.

---

## 🛠️ Tech Stack & Architecture

- **Smart Contract**: Solidity `^0.8.20` (`contracts/DVote.sol`)
- **Development & Testing Framework**: Hardhat `2.22.x` + `@nomicfoundation/hardhat-toolbox`
- **Blockchain Interaction**: ethers.js `v6`
- **Frontend**: React 18 + Vite (`frontend/`)
- **Styling**: Modern, responsive CSS design with `lucide-react` icons and glassmorphic cards
- **Target Network**: Local Hardhat Network (`http://127.0.0.1:8545`, Chain ID `31337`)

---

## 📂 Project Structure

```text
dvote/
├── contracts/
│   └── DVote.sol                  # Core Solidity smart contract
├── test/
│   └── DVote.test.js              # Comprehensive Hardhat automated test suite (14 tests)
├── scripts/
│   └── deploy.js                  # Deployment script + auto-exports ABI and seeds sample proposals
├── hardhat.config.js              # Hardhat configuration (Solidity 0.8.20, chainId 31337)
├── package.json                   # Root scripts & Hardhat dependencies
├── .env.example                   # Environment configuration template
├── frontend/
│   ├── index.html                 # HTML shell with fonts and metadata
│   ├── vite.config.js             # Vite configuration
│   ├── package.json               # Frontend dependencies (React, Vite, ethers v6)
│   └── src/
│       ├── main.jsx               # React DOM entry point
│       ├── App.jsx                # Main governance portal & dashboard
│       ├── index.css              # Theme styling & responsive layout
│       ├── services/
│       │   └── contract.js        # Ethers v6 contract interaction & error parser
│       ├── components/
│       │   ├── Navbar.jsx         # Branding, balance, network badge & wallet toggle
│       │   ├── NetworkAlert.jsx   # Wrong-network banner & 1-click switch helper
│       │   ├── CreateProposalModal.jsx # Proposal creation modal with duration picker
│       │   ├── ProposalList.jsx   # Filter tabs (All, Active, Closed, My Votes) & search
│       │   ├── ProposalCard.jsx   # Proposal card with dual progress bar & vote controls
│       │   └── StatusToast.jsx    # Real-time transaction feedback toast
│       └── contracts/
│           └── DVote.json         # Deployed contract address, network & ABI (generated)
└── README.md
```

---

## ⚡ Quick Start & Reproduction Guide

### 1. Prerequisites
- **Node.js**: v18 or higher (tested on Node v24)
- **MetaMask**: Browser extension installed in Chrome, Brave, or Edge

### 2. Install Dependencies
In the root directory, install the Hardhat dependencies, then install frontend dependencies:
```bash
# Install root (Hardhat) dependencies
npm install

# Install frontend dependencies
npm --prefix frontend install
```

### 3. Run Automated Tests
Execute the 14 automated unit tests covering all edge cases, revert strings, and EVM time manipulation:
```bash
npx hardhat test
```

### 4. Start Local Blockchain
In a separate terminal window, start a local Hardhat node:
```bash
npx hardhat node
```
This starts an Ethereum JSON-RPC node at `http://127.0.0.1:8545` with 20 funded test accounts (10,000 ETH each).

### 5. Deploy the Smart Contract
In another terminal, deploy `DVote.sol` to the local network:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
*Note: This script automatically writes the deployed contract address and ABI to `frontend/src/contracts/DVote.json` and seeds 3 initial demo proposals (Active and Expired) for immediate testing.*

### 6. Run the Frontend Application
Start the Vite development server:
```bash
npm run dev
# or: npm --prefix frontend run dev
```
Open your browser at the URL shown (typically `http://localhost:5173` or `http://localhost:5174`).

---

## 🦊 Configuring MetaMask for Localhost

1. Open the MetaMask extension.
2. Click the Network selector in the top-left and select **Add Network** -> **Add a network manually**:
   - **Network Name**: `Hardhat Localhost`
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
3. Click **Save** and switch to this network.
4. Import a test account from the `npx hardhat node` terminal output:
   - Copy Private Key for **Account #0** or **Account #1**:
     `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - In MetaMask, click your account avatar -> **Add account or hardware wallet** -> **Import account**.
   - Paste the private key. You will immediately see a balance of `10,000 ETH`.

> **Tip for Resetting Nonces**: If you restart `npx hardhat node`, reset MetaMask's internal transaction nonce cache by going to:
> **MetaMask Settings -> Advanced -> Clear activity and nonce data**.

---

## 🧪 Test Coverage Summary

All tests are implemented in `test/DVote.test.js` using Hardhat, Chai, and `@nomicfoundation/hardhat-network-helpers`:

| Test Group | Test Case | Status |
| :--- | :--- | :---: |
| **Deployment** | Starts with 0 proposals initialized | ✅ PASS |
| **Proposal Creation** | Successfully creates proposal & emits `ProposalCreated` | ✅ PASS |
| **Proposal Creation** | Reverts on empty title with `"Title cannot be empty"` | ✅ PASS |
| **Proposal Creation** | Reverts on 0 duration with `"Duration must be greater than 0"` | ✅ PASS |
| **Proposal Creation** | `getAllProposals()` correctly aggregates all proposals | ✅ PASS |
| **Voting** | Records YES vote & emits `Voted` event with tally | ✅ PASS |
| **Voting** | Records NO vote & updates tally | ✅ PASS |
| **Voting** | Allows distinct voters to participate independently | ✅ PASS |
| **Voting** | Allows same voter to vote on different proposals | ✅ PASS |
| **Voting Protection** | Reverts duplicate votes with `"Address has already voted on this proposal"` | ✅ PASS |
| **Deadline Protection**| Reverts votes after deadline via `time.increase` (`"Voting deadline has passed"`) | ✅ PASS |
| **Status View** | `isProposalActive()` returns true before deadline and false after | ✅ PASS |
| **Input Validation** | Reverts vote on non-existent or ID 0 with `"Invalid proposal ID"` | ✅ PASS |
| **Input Validation** | Reverts `hasVoted` query on invalid ID with `"Invalid proposal ID"` | ✅ PASS |

---

## 🏛️ Smart Contract & Architecture Notes for Interview

### 1. Data Model
```solidity
struct Proposal {
    uint256 id;
    string title;
    string description;
    uint256 deadline;
    uint256 yesVotes;
    uint256 noVotes;
    address creator;
    bool exists;
}
```
- Proposals are stored in a mapping `proposals[id]`, indexed by a monotonic counter `proposalCount`.
- Returning all proposals is achieved via `getAllProposals()`, dynamically allocating a memory array `new Proposal[](proposalCount)` for clean, single-RPC querying on the client.

### 2. State Isolation & Security
- Duplicate voting is prevented using a double mapping:
  `mapping(uint256 => mapping(address => bool)) private _hasVoted;`
  This ensures:
  - An address can vote once per proposal ID.
  - An address can participate across all other proposals without collision.
  - Centralized servers or off-chain databases are never relied upon to enforce voting rights.
- Time constraints use Ethereum block timestamps (`block.timestamp`).
- Strict Checks-Effects-Interactions: state variables (`_hasVoted`, `proposal.yesVotes`/`noVotes`) are updated before emitting events.


cd "C:\Users\ASHUTOSH\OneDrive\Pictures\Desktop\FINAL\GDG\dvote"
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost