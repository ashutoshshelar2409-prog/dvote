import React, { useState } from 'react';
import { X, Clock, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createProposalOnContract, formatBlockchainError } from '../services/contract';

export default function CreateProposalModal({
  isOpen,
  onClose,
  signer,
  onProposalCreated,
  showToast,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationValue, setDurationValue] = useState('1');
  const [durationUnit, setDurationUnit] = useState('hours'); // minutes, hours, days
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Calculate duration in seconds
  const calculateDurationSeconds = () => {
    const val = parseFloat(durationValue) || 0;
    if (durationUnit === 'minutes') return Math.floor(val * 60);
    if (durationUnit === 'hours') return Math.floor(val * 3600);
    if (durationUnit === 'days') return Math.floor(val * 86400);
    return Math.floor(val * 3600);
  };

  const durationInSeconds = calculateDurationSeconds();
  const calculatedDeadline = new Date(Date.now() + durationInSeconds * 1000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Proposal title is required.');
      return;
    }

    if (durationInSeconds <= 0) {
      setError('Duration must be greater than 0.');
      return;
    }

    if (!signer) {
      setError('Wallet signer not found. Please connect your MetaMask wallet.');
      return;
    }

    setIsSubmitting(true);
    showToast({
      type: 'pending',
      title: 'Creating Proposal...',
      message: 'Please confirm the transaction in MetaMask.',
    });

    try {
      const tx = await createProposalOnContract(
        signer,
        title,
        description,
        durationInSeconds
      );

      showToast({
        type: 'pending',
        title: 'Transaction Submitted',
        message: 'Waiting for block confirmation on Hardhat network...',
      });

      const receipt = await tx.wait();

      showToast({
        type: 'success',
        title: 'Proposal Created!',
        message: `Proposal "${title}" has been successfully broadcast to the blockchain.`,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setDurationValue('1');
      setDurationUnit('hours');
      onClose();

      if (onProposalCreated) {
        onProposalCreated();
      }
    } catch (err) {
      console.error('Error creating proposal:', err);
      const friendlyError = formatBlockchainError(err);
      setError(friendlyError);
      showToast({
        type: 'error',
        title: 'Proposal Creation Failed',
        message: friendlyError,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
    }}>
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '560px',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
        }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Create New Proposal
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Submit an on-chain proposal for community voting
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--accent-red-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: '0.85rem',
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Proposal Title <span style={{ color: 'var(--accent-red)' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Allocate GDG Club Budget for Smart Contract Auditing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              maxLength={150}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Description & Context
            </label>
            <textarea
              placeholder="Provide background, rationale, and specific actions this proposal will authorize..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
            />
          </div>

          {/* Voting Duration */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Voting Duration <span style={{ color: 'var(--accent-red)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="number"
                min="1"
                step="1"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '120px',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              />
              <select
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value)}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                <option value="minutes">Minutes (Testing/Fast)</option>
                <option value="hours">Hours</option>
                <option value="days">Days (Standard)</option>
              </select>
            </div>

            {/* Deadline summary */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '0.5rem',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
            }}>
              <Clock size={14} color="var(--accent-blue)" />
              <span>
                Voting will conclude on: <strong>{calculatedDeadline.toLocaleString()}</strong> ({durationInSeconds} seconds)
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: 'var(--accent-blue)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: '0.6rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating on Blockchain...
                </>
              ) : (
                'Create Proposal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

