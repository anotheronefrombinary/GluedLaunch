'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Identicon } from './Identicon';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

interface CommentsProps {
  tokenAddress: string;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function Comments({ tokenAddress }: CommentsProps) {
  const { address, isConnected } = useAccount();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?tokenAddress=${tokenAddress}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      // silent
    }
  }, [tokenAddress]);

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 15_000);
    return () => clearInterval(interval);
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address || !newComment.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenAddress,
          author: address,
          text: newComment.trim(),
        }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [comment, ...prev]);
        setNewComment('');
      }
    } catch {
      // silent
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="rounded-xl p-5" style={{ background: '#111215', border: '1px solid #1e2028' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: '#f0f0f2' }}>
        Comments {comments.length > 0 && <span style={{ color: '#5c5e69' }}>({comments.length})</span>}
      </h3>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-3">
          {isConnected && address ? (
            <Identicon address={address} size={32} className="mt-1" />
          ) : (
            <div className="w-8 h-8 rounded-full shrink-0 mt-1" style={{ background: '#1e2028' }} />
          )}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isConnected ? 'Write a comment...' : 'Connect wallet to comment'}
              disabled={!isConnected}
              maxLength={500}
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm transition-all focus:ring-1 focus:ring-[#00e87b] focus:border-[#00e87b40] disabled:opacity-50"
              style={{ background: '#16171c', border: '1px solid #1e2028', color: '#f0f0f2', resize: 'none' }}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs" style={{ color: '#5c5e69' }}>
                {newComment.length}/500
              </span>
              <button
                type="submit"
                disabled={!isConnected || !newComment.trim() || isPosting}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-30"
                style={{ background: '#00e87b', color: '#0b0c0e' }}
              >
                {isPosting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: '#5c5e69' }}>
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Identicon address={comment.author} size={28} className="mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <a
                    href={`https://sepolia.etherscan.io/address/${comment.author}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono hover:underline"
                    style={{ color: '#00e87b' }}
                  >
                    {comment.author.slice(0, 6)}...{comment.author.slice(-4)}
                  </a>
                  <span className="text-xs" style={{ color: '#5c5e69' }}>
                    {timeAgo(comment.timestamp)}
                  </span>
                </div>
                <p className="text-sm break-words" style={{ color: '#8b8d97' }}>
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
