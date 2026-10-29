import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, RefreshCw, Copy, Check, HelpCircle, ExternalLink } from 'lucide-react';
import { TARGET_CHAIN_ID, TARGET_NETWORK_NAME, TARGET_RPC_URL, switchToHardhatNetwork } from '../services/contract';

export default function NetworkAlert({ currentChainId, onNetworkSwitched }) {
  const [switching, setSwitching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  if (currentChainId === null || currentChainId === TARGET_CHAIN_ID) {
    return null;
  }

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSwitch = async () => {
    setSwitching(true);
    setErrorMsg('');
    try {
      await switchToHardhatNetwork();
      if (onNetworkSwitched) onNetworkSwitched();
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('private address') || msg.includes('HTTPS') || err.code === -32603) {
        setErrorMsg('meta_private_restriction');
      } else {
        setErrorMsg(msg || 'Failed to switch network in MetaMask.');
      }
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '1.25rem' }}>
      <div style={{
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.4rem',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AlertTriangle size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fca5a5', marginBottom: '0.25rem' }}>
              Action Required: Switch MetaMask to Hardhat Localhost (Chain ID: 31337)
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              Your wallet is currently connected to <strong>Chain ID {currentChainId}</strong>. dVote smart contracts are deployed to <strong>{TARGET_NETWORK_NAME} (Chain ID {TARGET_CHAIN_ID})</strong>.
            </p>
          </div>
        </div>

        {/* Action Button & Quick Switch */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleSwitch}
            disabled={switching}
            style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              padding: '0.6rem 1.35rem',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {switching ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Prompting MetaMask...
              </>
            ) : (
              <>
                Switch to {TARGET_NETWORK_NAME} <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* MetaMask Security Restriction Notice & Manual Step-by-Step */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fcd34d', fontSize: '0.875rem', fontWeight: 700 }}>
            <HelpCircle size={16} />
            <span>How to switch or add Localhost in MetaMask (30 Seconds):</span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '0.4rem' }}>
              <strong>Option 1 (Fastest):</strong> Open MetaMask &rarr; click network selector at top-left &rarr; toggle on <strong>"Show test networks"</strong> &rarr; select <strong>Localhost 8545</strong>.
            </p>
            <p>
              <strong>Option 2 (Add Manually):</strong> Open MetaMask &rarr; click network selector &rarr; <strong>"Add Network"</strong> &rarr; <strong>"Add a network manually"</strong> and enter:
            </p>
          </div>

          {/* Copyable Parameters Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.6rem',
            marginTop: '0.25rem',
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Network Name</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Hardhat Localhost</span>
              </div>
              <button
                onClick={() => handleCopy('Hardhat Localhost', 'name')}
                title="Copy Name"
                style={{ background: 'none', color: copiedField === 'name' ? 'var(--accent-green)' : 'var(--text-muted)' }}
              >
                {copiedField === 'name' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>New RPC URL</span>
                <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 600 }}>{TARGET_RPC_URL}</span>
              </div>
              <button
                onClick={() => handleCopy(TARGET_RPC_URL, 'rpc')}
                title="Copy RPC URL"
                style={{ background: 'none', color: copiedField === 'rpc' ? 'var(--accent-green)' : 'var(--text-muted)' }}
              >
                {copiedField === 'rpc' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Chain ID</span>
                <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 600 }}>31337</span>
              </div>
              <button
                onClick={() => handleCopy('31337', 'chainId')}
                title="Copy Chain ID"
                style={{ background: 'none', color: copiedField === 'chainId' ? 'var(--accent-green)' : 'var(--text-muted)' }}
              >
                {copiedField === 'chainId' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Currency Symbol</span>
                <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 600 }}>ETH</span>
              </div>
              <button
                onClick={() => handleCopy('ETH', 'symbol')}
                title="Copy Symbol"
                style={{ background: 'none', color: copiedField === 'symbol' ? 'var(--accent-green)' : 'var(--text-muted)' }}
              >
                {copiedField === 'symbol' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
