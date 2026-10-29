import React, { useState } from 'react';
import { Wallet, LogOut, Copy, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { TARGET_CHAIN_ID, TARGET_NETWORK_NAME, switchToHardhatNetwork } from '../services/contract';

export default function Navbar({
  account,
  chainId,
  balance,
  isConnecting,
  onConnect,
  onDisconnect,
  onOpenCreateModal,
}) {
  const [copied, setCopied] = useState(false);

  const isWrongNetwork = account && chainId !== null && chainId !== TARGET_CHAIN_ID;

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleCopy = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'rgba(10, 13, 20, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.875rem 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Logo and Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
          }}>
            <ShieldCheck size={24} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                dVote
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}>
                GDG Web3
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Decentralized Governance & Voting
            </p>
          </div>
        </div>

        {/* Action Controls & Wallet Connection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {account && (
            <button
              onClick={onOpenCreateModal}
              style={{
                backgroundColor: 'var(--accent-blue)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: '0.55rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-blue-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-blue)'}
            >
              <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> New Proposal
            </button>
          )}

          {/* Network Indicator */}
          {account && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isWrongNetwork ? 'var(--accent-red-bg)' : 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${isWrongNetwork ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.25)'}`,
              color: isWrongNetwork ? '#f87171' : '#34d399',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isWrongNetwork ? 'var(--accent-red)' : 'var(--accent-green)',
                boxShadow: isWrongNetwork ? '0 0 8px rgba(239, 68, 68, 0.6)' : '0 0 8px rgba(16, 185, 129, 0.6)',
              }} />
              <span>{isWrongNetwork ? 'Wrong Network' : TARGET_NETWORK_NAME}</span>
              {isWrongNetwork && (
                <button
                  onClick={switchToHardhatNetwork}
                  style={{
                    backgroundColor: 'var(--accent-red)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    marginLeft: '0.3rem',
                  }}
                >
                  Switch
                </button>
              )}
            </div>
          )}

          {/* Wallet Address & Disconnect */}
          {account ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.3rem 0.4rem 0.3rem 0.85rem',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {truncateAddress(account)}
                </span>
                {balance && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {parseFloat(balance).toFixed(3)} ETH
                  </span>
                )}
              </div>

              <button
                onClick={handleCopy}
                title="Copy Address"
                style={{
                  backgroundColor: 'transparent',
                  color: copied ? 'var(--accent-green)' : 'var(--text-secondary)',
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>

              <button
                onClick={onDisconnect}
                title="Disconnect Wallet"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-red)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              style={{
                backgroundColor: 'var(--accent-blue)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-blue-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-blue)'}
            >
              <Wallet size={18} />
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          )}

        </div>
      </div>
    </header>
  );
}

