import React, { useState } from 'react';
import { Search, RefreshCw, Layers, PlusCircle, Inbox } from 'lucide-react';
import ProposalCard from './ProposalCard';

export default function ProposalList({
  proposals,
  isLoading,
  onRefresh,
  account,
  signer,
  onVoteCast,
  onOpenCreateModal,
  showToast,
}) {
  const [filter, setFilter] = useState('all'); // all, active, closed, voted
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProposals = proposals.filter((p) => {
    // Search query match
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.id).includes(searchQuery);

    if (!matchesSearch) return false;

    // Filter tab
    if (filter === 'active') return p.isActive;
    if (filter === 'closed') return !p.isActive;
    if (filter === 'voted') return p.hasVoted;
    return true; // all
  });

  const activeCount = proposals.filter((p) => p.isActive).length;
  const closedCount = proposals.filter((p) => !p.isActive).length;
  const votedCount = proposals.filter((p) => p.hasVoted).length;

  return (
    <section style={{ marginTop: '2rem', marginBottom: '3rem' }}>
      <div className="container">
        
        {/* Top Control Bar: Filters, Search, Refresh */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Governance Proposals
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Vote directly on-chain using your connected Ethereum wallet
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh Proposals"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              {account && (
                <button
                  onClick={onOpenCreateModal}
                  style={{
                    backgroundColor: 'var(--accent-blue)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    padding: '0.55rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-blue-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-blue)'}
                >
                  <PlusCircle size={16} /> New Proposal
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills & Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            {/* Filter Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.25rem',
              gap: '0.25rem',
            }}>
              {[
                { id: 'all', label: 'All', count: proposals.length },
                { id: 'active', label: 'Active', count: activeCount },
                { id: 'closed', label: 'Closed', count: closedCount },
                ...(account ? [{ id: 'voted', label: 'My Votes', count: votedCount }] : []),
              ].map((tab) => {
                const isSelected = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 700 : 500,
                      backgroundColor: isSelected ? 'var(--accent-blue)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span>{tab.label}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '320px',
            }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem 0.5rem 2.25rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && proposals.length === 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  height: '240px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  opacity: 0.6,
                }}
              >
                <div style={{ height: '20px', width: '30%', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }} />
                <div style={{ height: '28px', width: '80%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }} />
                <div style={{ height: '48px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px' }} />
                <div style={{ height: '40px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', marginTop: 'auto' }} />
              </div>
            ))}
          </div>
        ) : filteredProposals.length === 0 ? (
          /* Empty State */
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-blue)',
            }}>
              <Inbox size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {searchQuery ? 'No matching proposals found' : 'No proposals found'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '420px' }}>
                {searchQuery
                  ? `No proposals match "${searchQuery}". Try modifying your search keywords or clear the filter.`
                  : filter === 'voted'
                  ? "You haven't voted on any proposals yet."
                  : filter === 'active'
                  ? 'There are currently no active proposals open for voting.'
                  : 'Be the first to submit a proposal to the dVote governance smart contract!'}
              </p>
            </div>

            {account && !searchQuery && (
              <button
                onClick={onOpenCreateModal}
                style={{
                  backgroundColor: 'var(--accent-blue)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  padding: '0.6rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginTop: '0.5rem',
                }}
              >
                <PlusCircle size={16} /> Create First Proposal
              </button>
            )}
          </div>
        ) : (
          /* Proposals Grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem',
          }}>
            {filteredProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                account={account}
                signer={signer}
                onVoteCast={onVoteCast}
                showToast={showToast}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

