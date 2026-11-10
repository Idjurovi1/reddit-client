import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubreddits, selectSubreddits } from '../features/subreddits/subredditsSlice';
import { selectSelectedSubreddit, setSelectedSubreddit } from '../features/posts/postsSlice';

export default function Subreddits() {
  const dispatch = useDispatch();
  const subreddits = useSelector(selectSubreddits);
  const selected = useSelector(selectSelectedSubreddit);

  useEffect(() => {
    dispatch(fetchSubreddits());
  }, [dispatch]);

  return (
    <aside className="subreddits" aria-label="Subreddits">
      <h2>Subreddits</h2>
      <ul>
        {subreddits.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={`subreddit${selected === s.display_name ? ' active' : ''}`}
              aria-pressed={selected === s.display_name}
              onClick={() => dispatch(setSelectedSubreddit(s.display_name))}
            >
              {s.icon_img ? (
                <img src={s.icon_img} alt="" className="subreddit-icon" loading="lazy" width="28" height="28" />
              ) : (
                <span className="subreddit-icon" style={{ background: s.primary_color || '#ff4500' }} aria-hidden="true">
                  {s.display_name[0].toUpperCase()}
                </span>
              )}
              <span>r/{s.display_name}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
