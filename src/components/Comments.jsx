import Markdown from 'react-markdown';
import { useSelector } from 'react-redux';
import { selectCommentsFor } from '../features/comments/commentsSlice';
import { timeAgo, formatNumber } from '../utils/format';

export default function Comments({ postId, onRetry }) {
  const { list, isLoading, error } = useSelector(selectCommentsFor(postId));

  if (isLoading) {
    return (
      <div className="comments" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton skeleton-comment" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="comments error-inline" role="alert">
        <p>Could not load comments: {error}</p>
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (!list.length) return <p className="comments empty">No comments yet.</p>;

  return (
    <ul className="comments">
      {list.map((c) => (
        <li key={c.id} className="comment">
          <div className="comment-meta">
            <span className="comment-author">u/{c.author}</span>
            <span>·</span>
            <time>{timeAgo(c.created_utc)}</time>
            <span>·</span>
            <span>▲ {formatNumber(c.score)}</span>
          </div>
          <div className="comment-body">
            <Markdown
              components={{
                a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
              }}
            >
              {c.body}
            </Markdown>
          </div>
        </li>
      ))}
    </ul>
  );
}
