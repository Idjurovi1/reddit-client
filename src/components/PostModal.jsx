import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Markdown from 'react-markdown';
import { selectPost, selectSelectedPost } from '../features/posts/postsSlice';
import { fetchComments } from '../features/comments/commentsSlice';
import { formatNumber, timeAgo } from '../utils/format';
import Comments from './Comments';

// Detail view of a single post, shown as an accessible modal dialog.
export default function PostModal() {
  const dispatch = useDispatch();
  const post = useSelector(selectSelectedPost);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!post) return undefined;
    dispatch(fetchComments(post));
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && dispatch(selectPost(null));
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [post, dispatch]);

  if (!post) return null;
  const close = () => dispatch(selectPost(null));

  return (
    <div className="modal-backdrop" onClick={close}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="modal-close" onClick={close} aria-label="Close">
          ×
        </button>
        <p className="post-meta">
          <span className="post-sub">r/{post.subreddit}</span> · u/{post.author} · <time>{timeAgo(post.created_utc)}</time> · ▲{' '}
          {formatNumber(post.score)}
        </p>
        <h2 id="modal-title">{post.title}</h2>
        {post.image && <img className="modal-image" src={post.image} alt="" />}
        {post.selftext && (
          <div className="modal-text">
            <Markdown>{post.selftext}</Markdown>
          </div>
        )}
        <a className="btn" href={`https://www.reddit.com${post.permalink}`} target="_blank" rel="noopener noreferrer">
          Open on Reddit ↗
        </a>
        <h3 className="modal-comments-title">Comments</h3>
        <Comments postId={post.id} onRetry={() => dispatch(fetchComments(post))} />
      </div>
    </div>
  );
}
