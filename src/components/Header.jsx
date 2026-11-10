import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSearchResults,
  fetchPosts,
  setActiveSearch,
  setSearchTerm,
  selectSearchTerm,
  selectSelectedSubreddit,
} from '../features/posts/postsSlice';

export default function Header() {
  const dispatch = useDispatch();
  const searchTerm = useSelector(selectSearchTerm);
  const subreddit = useSelector(selectSelectedSubreddit);
  const [local, setLocal] = useState(searchTerm);

  const onChange = (e) => {
    setLocal(e.target.value);
    dispatch(setSearchTerm(e.target.value)); // instant filter of loaded posts
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const term = local.trim();
    if (!term) return;
    dispatch(setActiveSearch(term));
    dispatch(setSearchTerm(''));
    dispatch(fetchSearchResults(term)); // full Reddit search
  };

  const onClear = () => {
    setLocal('');
    dispatch(setSearchTerm(''));
    dispatch(setActiveSearch(''));
    dispatch(fetchPosts(subreddit));
  };

  return (
    <header className="header">
      <a className="logo" href="/">
        <span className="logo-mark" aria-hidden="true">r/</span>
        <span className="logo-text">
          Reddit<span>Minimal</span>
        </span>
        <span className="visually-hidden"> home</span>
      </a>
      <form className="search" role="search" onSubmit={onSubmit}>
        <label htmlFor="search-input" className="visually-hidden">
          Search Reddit
        </label>
        <input
          id="search-input"
          type="search"
          placeholder="Search posts…"
          value={local}
          onChange={onChange}
          autoComplete="off"
        />
        {local && (
          <button type="button" className="search-clear" onClick={onClear} aria-label="Clear search">
            ×
          </button>
        )}
        <button type="submit" className="search-button" aria-label="Search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M10 2a8 8 0 0 1 6.32 12.9l5.39 5.4-1.41 1.4-5.4-5.39A8 8 0 1 1 10 2Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
          </svg>
        </button>
      </form>
    </header>
  );
}
