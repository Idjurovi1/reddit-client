import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchComments } from '../features/comments/commentsSlice';
import { selectPost } from '../features/posts/postsSlice';
import { formatNumber, timeAgo } from '../utils/format';
import Comments from './Comments';

export default function PostCard({ post }) {
  const dispatch = useDispatch();
  const [showComments, setShowComments] = useState(false);
  const [vote, setVote] = useState(0); // local only – JSON API is read-only

  const toggleComments = () => {
    if (!showComments) dispatch(fetchComments(post));
    setShowComments((s) => !s);
  };

  return (
    <article className="post-card">
      <div className="votes" aria-label="Votes">
        <button
          type="button"
          className={`vote up${vote === 1 ? ' on' : ''}`}
          aria-label="Upvote"
          aria-pressed={vote === 1}
          onClick={() => setVote(vote === 1 ? 0 : 1)}
        >
          ▲
        </button>
        <span className="score">{formatNumber(post.score + vote)}</span>
        <button
          type="button"
          className={`vote down${vote === -1 ? ' on' : ''}`}
          aria-label="Downvote"
          aria-pressed={vote === -1}
          onClick={() => setVote(vote === -1 ? 0 : -1)}
        >
          ▼
        </button>
      </div>

      <div className="post-content">
        <p className="post-meta">
          <span className="post-sub">r/{post.subreddit}</span> · Posted by u/{post.author} ·{' '}
          <time>{timeAgo(post.created_utc)}</time>
        </p>
        <h2 className="post-title">
          <button type="button" className="link-button" onClick={() => dispatch(selectPost(post.id))}>
            {post.title}
          </button>
        </h2>

        {post.image && (
          <button type="button" className="post-image-wrap" onClick={() => dispatch(selectPost(post.id))} aria-label={`Open ${post.title}`}>
            <img className="post-image" src={post.image} alt="" loading="lazy" />
          </button>
        )}
        {post.video && <video className="post-image" src={post.video} controls muted preload="none" />}

        <div className="post-actions">
          <button type="button" className={`btn-ghost${showComments ? ' on' : ''}`} onClick={toggleComments} aria-expanded={showComments}>
            💬 {formatNumber(post.num_comments)} comments
          </button>
          <button type="button" className="btn-ghost" onClick={() => dispatch(selectPost(post.id))}>
            Details
          </button>
        </div>

        {showComments && <Comments postId={post.id} onRetry={() => dispatch(fetchComments(post))} />}
      </div>
    </article>
  );
}
