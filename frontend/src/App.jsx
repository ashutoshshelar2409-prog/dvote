import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  Vote,
  Users,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

import Navbar from './components/Navbar';
import NetworkAlert from './components/NetworkAlert';
import ProposalList from './components/ProposalList';
import CreateProposalModal from './components/CreateProposalModal';
import StatusToast from './components/StatusToast';

import {
  TARGET_CHAIN_ID,
  TARGET_NETWORK_NAME,
  TARGET_RPC_URL,
  fetchAllProposals,
  getProvider,
  getContractAddress,
  formatBlockchainError,
} from './services/contract';

export default function App() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [proposals, setProposals] = useState([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const contractAddress = getContractAddress();

  const showToast = useCallback(({ type, title, message }) => {
    setToast({ type, title, message });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch proposals from contract
  const loadProposals = useCallback(async (currentAccount = account) => {
    setIsLoadingProposals(true);
    try {
      const data = await fetchAllProposals(currentAccount);
      setProposals(data);
    } catch (err) {
      console.error('Failed to load proposals:', err);
      // Only show error toast if not an empty initial state
      showToast({
        type: 'warning',
        title: 'Connection Notice',
        message: 'Could not connect to Hardhat node at http://127.0.0.1:8545. Please ensure your local node is running.',
      });
    } finally {
      setIsLoadingProposals(false);
    }
  }, [account, showToast]);

  // Update wallet balance
  const updateBalance = useCallback(async (addr, provider) => {
    try {
      const bal = await provider.getBalance(addr);
      setBalance(ethers.formatEther(bal));
    } catch (e) {
      console.debug('Failed to get balance:', e);
    }
  }, []);

  // Connect MetaMask wallet
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      showToast({
        type: 'error',
        title: 'MetaMask Not Detected',
        message: 'MetaMask extension was not found. Please install MetaMask to interact with dVote.',
      });
      return;
    }

    setIsConnecting(true);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);

      if (accounts.length > 0) {
        const userSigner = await browserProvider.getSigner();
        const network = await browserProvider.getNetwork();
        const userChainId = Number(network.chainId);

        setAccount(accounts[0]);
        setSigner(userSigner);
        setChainId(userChainId);

        await updateBalance(accounts[0], browserProvider);

        showToast({
          type: 'success',
          title: 'Wallet Connected',
          message: `Connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`,
        });

        loadProposals(accounts[0]);
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      const friendlyError = formatBlockchainError(err);
      showToast({
        type: 'error',
        title: 'Connection Failed',
        message: friendlyError,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet (UI state reset)
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setChainId(null);
    setBalance(null);
    showToast({
      type: 'info',
      title: 'Wallet Disconnected',
      message: 'You have disconnected your wallet session.',
    });
    loadProposals(null);
  };

  // Listen for MetaMask account & network changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const userSigner = await provider.getSigner();
          setAccount(accounts[0]);
          setSigner(userSigner);
          updateBalance(accounts[0], provider);
          loadProposals(accounts[0]);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = (newChainIdHex) => {
        const newChainId = parseInt(newChainIdHex, 16);
        setChainId(newChainId);
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already authorized
      const checkExistingConnection = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const userSigner = await provider.getSigner();
            const network = await provider.getNetwork();
            setAccount(accounts[0].address);
            setSigner(userSigner);
            setChainId(Number(network.chainId));
            updateBalance(accounts[0].address, provider);
            loadProposals(accounts[0].address);
            return;
          }
        } catch (e) {
          console.debug('No existing connection:', e);
        }
        // Fallback: load proposals without wallet
        loadProposals(null);
      };

      checkExistingConnection();

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    } else {
      // No ethereum object, load via fallback RPC
      loadProposals(null);
    }
  }, [loadProposals, updateBalance]);

  // Aggregate stats
  const totalProposalsCount = proposals.length;
  const activeProposalsCount = proposals.filter((p) => p.isActive).length;
  const totalVotesAcrossAll = proposals.reduce((acc, p) => acc + p.totalVotes, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Header */}
      <Navbar
        account={account}
        chainId={chainId}
        balance={balance}
        isConnecting={isConnecting}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Network Warning Banner */}
      <NetworkAlert
        currentChainId={chainId}
        onNetworkSwitched={() => {
          if (account) loadProposals(account);
        }}
      />

      {/* Hero & Overview Section */}
      <section style={{
        paddingTop: '2.5rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, rgba(16, 21, 34, 0.6) 0%, transparent 100%)',
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '2rem',
          }}>
            <div style={{ maxWidth: '640px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                color: '#60a5fa',
                fontSize: '0.78rem',
                fontWeight: 600,
                marginBottom: '1rem',
              }}>
                <Sparkles size={14} />
                <span>GDG On-Chain Web3 Recruitment Submission</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '0.85rem',
                color: '#ffffff',
              }}>
                Decentralized Voting, <br />
                <span style={{
                  background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Zero Middlemen.
                </span>
              </h1>

              <p style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
              }}>
                dVote is an immutable, verifiable governance portal. Every proposal, vote,
                and deadline constraint is strictly enforced by Solidity smart contracts on the blockchain.
              </p>

              {/* Verified Smart Contract Info Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Contract:</span>
                <span className="mono" style={{ color: '#38bdf8' }}>
                  {contractAddress || 'Deploying...'}
                </span>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem',
              width: '100%',
              maxWidth: '440px',
            }}>
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  <Vote size={15} color="var(--accent-blue)" />
                  <span>Proposals</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {totalProposalsCount}
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  <Clock size={15} color="var(--accent-green)" />
                  <span>Active</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>
                  {activeProposalsCount}
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  <Users size={15} color="var(--accent-purple)" />
                  <span>Votes Cast</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c084fc' }}>
                  {totalVotesAcrossAll}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Governance Proposals Feed */}
      <main style={{ flex: 1 }}>
        <ProposalList
          proposals={proposals}
          isLoading={isLoadingProposals}
          onRefresh={() => loadProposals(account)}
          account={account}
          signer={signer}
          onVoteCast={() => loadProposals(account)}
          onOpenCreateModal={() => {
            if (!account) {
              connectWallet();
            } else {
              setIsCreateModalOpen(true);
            }
          }}
          showToast={showToast}
        />
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-secondary)',
        padding: '1.75rem 0',
        marginTop: 'auto',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}>
          <div>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>dVote</span> — Built for Google Developer Groups (GDG) Web3 Recruitment.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span>Solidity 0.8.20</span>
            <span>Hardhat 2</span>
            <span>ethers.js v6</span>
            <span>React + Vite</span>
          </div>
        </div>
      </footer>

      {/* Create Proposal Modal */}
      <CreateProposalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        signer={signer}
        onProposalCreated={() => loadProposals(account)}
        showToast={showToast}
      />

      {/* Global Status / Alert Toast */}
      <StatusToast
        toast={toast}
        onDismiss={dismissToast}
      />

    </div>
  );
}

