import { ethers } from 'ethers';
import contractData from '../contracts/DVote.json';

export const TARGET_CHAIN_ID = 31337;
export const TARGET_CHAIN_ID_HEX = '0x7a69';
export const TARGET_NETWORK_NAME = 'Hardhat Localhost';
export const TARGET_RPC_URL = 'http://127.0.0.1:8545';

/**
 * Returns the deployed contract address.
 */
export function getContractAddress() {
  return import.meta.env.VITE_DVOTE_CONTRACT_ADDRESS || contractData.address;
}

/**
 * Returns the contract ABI.
 */
export function getContractABI() {
  return contractData.abi;
}

/**
 * Returns a read-only RPC provider (connected to local Hardhat node),
 * allowing users to view proposals even without MetaMask.
 */
export function getFallbackProvider() {
  return new ethers.JsonRpcProvider(TARGET_RPC_URL);
}

/**
 * Returns a BrowserProvider if window.ethereum exists, else fallback provider.
 */
export function getProvider() {
  // Always use local Hardhat JSON-RPC provider for read operations
  // so proposals load reliably even if MetaMask is on a different chain or locked.
  return getFallbackProvider();
}

/**
 * Returns an ethers Contract instance connected to the given signer or provider.
 */
export function getContractInstance(signerOrProvider) {
  const address = getContractAddress();
  const abi = getContractABI();
  if (!address || !abi || abi.length === 0) {
    throw new Error('Contract address or ABI not found. Please deploy the contract first.');
  }
  return new ethers.Contract(address, abi, signerOrProvider);
}

/**
 * Prompts MetaMask to switch to the Hardhat Localhost network (Chain ID: 31337).
 * If the network is not yet added to MetaMask, it requests wallet_addEthereumChain.
 */
export async function switchToHardhatNetwork() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to switch networks.');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: TARGET_CHAIN_ID_HEX }],
    });
  } catch (switchError) {
    // Error code 4902 indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: TARGET_CHAIN_ID_HEX,
            chainName: TARGET_NETWORK_NAME,
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: [TARGET_RPC_URL],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

/**
 * Fetches all proposals and user voting status if an address is provided.
 */
export async function fetchAllProposals(userAddress = null) {
  try {
    const provider = getProvider();
    const contract = getContractInstance(provider);

    const rawProposals = await contract.getAllProposals();
    const nowTimestamp = Math.floor(Date.now() / 1000);

    const proposals = await Promise.all(
      rawProposals.map(async (p) => {
        const id = Number(p.id);
        const deadline = Number(p.deadline);
        const yesVotes = Number(p.yesVotes);
        const noVotes = Number(p.noVotes);
        const totalVotes = yesVotes + noVotes;

        const isActive = nowTimestamp < deadline;

        let hasVoted = false;
        let userVote = null;

        if (userAddress) {
          try {
            const receipt = await contract.getVote(id, userAddress);
            hasVoted = receipt[0];
            userVote = receipt[0] ? receipt[1] : null; // true for YES, false for NO
          } catch (e) {
            // Non-fatal, fallback to hasVoted = false
            console.debug(`Error checking voting status for proposal ${id}:`, e);
          }
        }

        return {
          id,
          title: p.title,
          description: p.description,
          deadline,
          yesVotes,
          noVotes,
          totalVotes,
          creator: p.creator,
          isActive,
          hasVoted,
          userVote, // true (YES), false (NO), or null
        };
      })
    );

    // Return descending by proposal ID (newest first)
    return proposals.sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    throw error;
  }
}

/**
 * Creates a new proposal on the smart contract.
 */
export async function createProposalOnContract(signer, title, description, durationInSeconds) {
  if (signer && signer.provider) {
    try {
      const network = await signer.provider.getNetwork();
      if (Number(network.chainId) !== TARGET_CHAIN_ID) {
        throw new Error(
          `Your wallet is connected to Chain ID ${network.chainId}. Please switch your wallet to Hardhat Localhost (Chain ID: ${TARGET_CHAIN_ID}) before creating a proposal.`
        );
      }
    } catch (e) {
      if (e.message.includes('switch your wallet')) throw e;
    }
  }

  const contract = getContractInstance(signer);
  const tx = await contract.createProposal(title.trim(), description.trim(), durationInSeconds);
  return tx;
}

/**
 * Casts a vote (choice: true for YES, false for NO) on a proposal.
 */
export async function voteOnProposal(signer, proposalId, choice) {
  if (signer && signer.provider) {
    try {
      const network = await signer.provider.getNetwork();
      if (Number(network.chainId) !== TARGET_CHAIN_ID) {
        throw new Error(
          `Your wallet is connected to Chain ID ${network.chainId}. Please switch your wallet to Hardhat Localhost (Chain ID: ${TARGET_CHAIN_ID}) before voting.`
        );
      }
    } catch (e) {
      if (e.message.includes('switch your wallet')) throw e;
    }
  }

  const contract = getContractInstance(signer);
  const tx = await contract.vote(proposalId, choice);
  return tx;
}

/**
 * Parses user-friendly error messages from ethers and MetaMask errors.
 */
export function formatBlockchainError(error) {
  if (!error) return 'An unknown error occurred.';

  // MetaMask rejection
  if (
    error.code === 4001 ||
    error.code === 'ACTION_REJECTED' ||
    error?.message?.toLowerCase().includes('user rejected') ||
    error?.info?.error?.code === 4001
  ) {
    return 'Transaction rejected in MetaMask.';
  }

  // Contract revert reasons
  if (error.reason) {
    return error.reason;
  }

  // Check nested error data for revert strings
  const rawMessage = error?.data?.message || error?.error?.message || error?.message || '';
  if (rawMessage.includes('could not coalesce error') || rawMessage.includes('coalesce')) {
    return 'Transaction failed: Your wallet is on the wrong network. Please switch to Hardhat Localhost (Chain ID: 31337).';
  }

  if (rawMessage.includes('Voting deadline has passed')) {
    return 'Voting deadline has passed for this proposal.';
  }
  if (rawMessage.includes('Address has already voted')) {
    return 'Your wallet has already voted on this proposal.';
  }
  if (rawMessage.includes('Title cannot be empty')) {
    return 'Proposal title cannot be empty.';
  }
  if (rawMessage.includes('Duration must be greater than 0')) {
    return 'Voting duration must be greater than 0.';
  }
  if (rawMessage.includes('Invalid proposal ID')) {
    return 'Invalid proposal ID.';
  }

  if (rawMessage.includes('insufficient funds')) {
    return 'Insufficient ETH balance in your wallet for gas fees.';
  }

  if (rawMessage.includes('network') || rawMessage.includes('connection refused') || rawMessage.includes('fetch')) {
    return 'Cannot connect to Hardhat node at http://127.0.0.1:8545. Please ensure your local node is running.';
  }

  return error.shortMessage || error.message || 'Transaction failed. Please try again.';
}

