import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPosts,
  fetchSearchResults,
  selectFilteredPosts,
  selectPostsState,
  setSearchTerm,
  setActiveSearch,
} from '../features/posts/postsSlice';
import PostCard from './PostCard';

function Skeletons() {
  return (
    <div aria-busy="true" aria-label="Loading posts">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="post-card skeleton-card">
          <div className="skeleton skeleton-votes" />
          <div className="skeleton-lines">
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-block" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Posts() {
  const dispatch = useDispatch();
  const { isLoading, error, selectedSubreddit, searchTerm, activeSearch } = useSelector(selectPostsState);
  const posts = useSelector(selectFilteredPosts);

  useEffect(() => {
    if (!activeSearch) dispatch(fetchPosts(selectedSubreddit));
  }, [dispatch, selectedSubreddit, activeSearch]);

  const retry = () => (activeSearch ? dispatch(fetchSearchResults(activeSearch)) : dispatch(fetchPosts(selectedSubreddit)));

  const heading = activeSearch ? `Results for “${activeSearch}”` : `r/${selectedSubreddit}`;

  if (isLoading) {
    return (
      <section className="posts">
        <h1 className="feed-title">{heading}</h1>
        <Skeletons />
      </section>
    );
  }

  if (error) {
    return (
      <section className="posts">
        <div className="error-state" role="alert">
          <h2>Failed to load posts</h2>
          <p>{error}</p>
          <button type="button" className="btn" onClick={retry}>
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="posts">
      <h1 className="feed-title">{heading}</h1>
      {posts.length === 0 ? (
        <div className="error-state">
          <h2>No posts matching “{searchTerm || activeSearch}”</h2>
          <button
            type="button"
            className="btn"
            onClick={() => {
              dispatch(setSearchTerm(''));
              dispatch(setActiveSearch(''));
            }}
          >
            Go back
          </button>
        </div>
      ) : (
        posts.map((post, i) => (
          <div key={post.id} className="fade-in" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
            <PostCard post={post} />
          </div>
        ))
      )}
    </section>
  );
}
