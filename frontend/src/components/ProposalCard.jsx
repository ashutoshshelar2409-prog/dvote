import React, { useState } from 'react';
import { Clock, CheckCircle2, XCircle, ThumbsUp, ThumbsDown, User, AlertCircle, Loader2 } from 'lucide-react';
import { voteOnProposal, formatBlockchainError } from '../services/contract';

export default function ProposalCard({
  proposal,
  account,
  signer,
  onVoteCast,
  showToast,
}) {
  const [isVotingYes, setIsVotingYes] = useState(false);
  const [isVotingNo, setIsVotingNo] = useState(false);

  const {
    id,
    title,
    description,
    deadline,
    yesVotes,
    noVotes,
    totalVotes,
    creator,
    isActive,
    hasVoted,
    userVote,
  } = proposal;

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formattedDeadline = new Date(deadline * 1000).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Calculate percentage
  const yesPercentage = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;
  const noPercentage = totalVotes > 0 ? Math.round((noVotes / totalVotes) * 100) : 0;

  const handleVote = async (choice) => {
    if (!account || !signer) {
      showToast({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your MetaMask wallet before casting a vote.',
      });
      return;
    }

    if (!isActive) {
      showToast({
        type: 'error',
        title: 'Voting Closed',
        message: 'The deadline for this proposal has already passed.',
      });
      return;
    }

    if (hasVoted) {
      showToast({
        type: 'warning',
        title: 'Already Voted',
        message: 'You have already cast your vote on this proposal.',
      });
      return;
    }

    if (choice) {
      setIsVotingYes(true);
    } else {
      setIsVotingNo(true);
    }

    showToast({
      type: 'pending',
      title: `Voting ${choice ? 'YES' : 'NO'}...`,
      message: 'Please confirm the transaction in your MetaMask wallet.',
    });

    try {
      const tx = await voteOnProposal(signer, id, choice);

      showToast({
        type: 'pending',
        title: 'Vote Submitted',
        message: 'Waiting for blockchain confirmation...',
      });

      await tx.wait();

      showToast({
        type: 'success',
        title: 'Vote Confirmed!',
        message: `Your vote of ${choice ? 'YES' : 'NO'} on proposal #${id} was recorded on-chain.`,
      });

      if (onVoteCast) {
        onVoteCast();
      }
    } catch (err) {
      console.error('Error casting vote:', err);
      const friendlyError = formatBlockchainError(err);
      showToast({
        type: 'error',
        title: 'Voting Failed',
        message: friendlyError,
      });
    } finally {
      setIsVotingYes(false);
      setIsVotingNo(false);
    }
  };

  const isVoting = isVotingYes || isVotingNo;

  return (
    <div
      className="animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-card)',
        transition: 'border-color 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
      }}
    >
      {/* Top Meta: ID, Creator & Status Badge */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}>
              #{id}
            </span>

            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}>
              <User size={13} />
              <span className="mono">{truncateAddress(creator)}</span>
            </span>
          </div>

          {/* Active / Closed Badge */}
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: isActive ? 'var(--accent-green-bg)' : 'rgba(148, 163, 184, 0.1)',
            color: isActive ? '#34d399' : '#94a3b8',
            border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.2)'}`,
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isActive ? 'var(--accent-green)' : '#94a3b8',
            }} />
            {isActive ? 'Active' : 'Closed'}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.35,
          marginBottom: '0.5rem',
        }}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            whiteSpace: 'pre-wrap',
            marginBottom: '0.85rem',
          }}>
            {description}
          </p>
        )}

        {/* Deadline Information */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
        }}>
          <Clock size={14} color={isActive ? 'var(--accent-blue)' : 'var(--text-muted)'} />
          <span>
            {isActive ? 'Voting ends: ' : 'Concluded on: '}
            <strong style={{ color: isActive ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
              {formattedDeadline}
            </strong>
          </span>
        </div>
      </div>

      {/* Vote Progress Bars & Tallies */}
      <div>
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ThumbsUp size={14} /> YES: {yesVotes} ({yesPercentage}%)
            </span>
            <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ThumbsDown size={14} /> NO: {noVotes} ({noPercentage}%)
            </span>
          </div>

          {/* Dual-color Progress Bar */}
          <div style={{
            height: '8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
            overflow: 'hidden',
          }}>
            {totalVotes > 0 ? (
              <>
                <div style={{
                  width: `${yesPercentage}%`,
                  backgroundColor: 'var(--accent-green)',
                  transition: 'width 0.4s ease',
                }} />
                <div style={{
                  width: `${noPercentage}%`,
                  backgroundColor: 'var(--accent-red)',
                  transition: 'width 0.4s ease',
                }} />
              </>
            ) : (
              <div style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>Total Votes: {totalVotes}</span>
            <span>{totalVotes === 0 ? 'No votes recorded yet' : `${totalVotes} wallet${totalVotes === 1 ? '' : 's'} participated`}</span>
          </div>
        </div>

        {/* Voting Status & Actions */}
        {hasVoted ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: userVote === true ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${userVote === true ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: userVote === true ? '#34d399' : '#f87171',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}>
            {userVote === true ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <span>
              You have voted {userVote === true ? 'YES' : userVote === false ? 'NO' : ''} on this proposal
            </span>
          </div>
        ) : !isActive ? (
          <div style={{
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}>
            Voting has concluded for this proposal
          </div>
        ) : !account ? (
          <div style={{
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: '#93c5fd',
            fontWeight: 500,
          }}>
            Connect wallet to vote
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={() => handleVote(true)}
              disabled={isVoting}
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
              onMouseEnter={(e) => {
                if (!isVoting) {
                  e.currentTarget.style.backgroundColor = 'var(--accent-green)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isVoting) {
                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                  e.currentTarget.style.color = '#34d399';
                }
              }}
            >
              {isVotingYes ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Voting YES...
                </>
              ) : (
                <>
                  <ThumbsUp size={16} /> Vote YES
                </>
              )}
            </button>

            <button
              onClick={() => handleVote(false)}
              disabled={isVoting}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
              onMouseEnter={(e) => {
                if (!isVoting) {
                  e.currentTarget.style.backgroundColor = 'var(--accent-red)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isVoting) {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                  e.currentTarget.style.color = '#f87171';
                }
              }}
            >
              {isVotingNo ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Voting NO...
                </>
              ) : (
                <>
                  <ThumbsDown size={16} /> Vote NO
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

