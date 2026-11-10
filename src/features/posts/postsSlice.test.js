import { describe, it, expect } from 'vitest';
import reducer, {
  fetchPosts,
  setSearchTerm,
  setSelectedSubreddit,
  selectFilteredPosts,
  selectPost,
  selectSelectedPost,
} from './postsSlice';

const posts = [
  { id: '1', title: 'React tips', author: 'ana' },
  { id: '2', title: 'CSS grid', author: 'ivan' },
];
const stateWith = (patch) => ({ posts: { ...reducer(undefined, { type: '@@INIT' }), items: posts, ...patch } });

describe('postsSlice', () => {
  it('has a sensible initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toMatchObject({ items: [], isLoading: false, selectedSubreddit: 'popular' });
  });

  it('tracks the promise lifecycle', () => {
    let state = reducer(undefined, { type: fetchPosts.pending.type });
    expect(state.isLoading).toBe(true);
    state = reducer(state, { type: fetchPosts.fulfilled.type, payload: posts });
    expect(state).toMatchObject({ isLoading: false, items: posts, error: null });
    state = reducer(state, { type: fetchPosts.rejected.type, error: { message: 'boom' } });
    expect(state).toMatchObject({ isLoading: false, error: 'boom' });
  });

  it('changing subreddit clears the search', () => {
    let state = reducer(undefined, setSearchTerm('abc'));
    state = reducer(state, setSelectedSubreddit('pics'));
    expect(state).toMatchObject({ selectedSubreddit: 'pics', searchTerm: '' });
  });

  it('filters posts by title or author (case-insensitive)', () => {
    expect(selectFilteredPosts(stateWith({ searchTerm: 'react' }))).toEqual([posts[0]]);
    expect(selectFilteredPosts(stateWith({ searchTerm: 'IVAN' }))).toEqual([posts[1]]);
    expect(selectFilteredPosts(stateWith({ searchTerm: '' }))).toEqual(posts);
  });

  it('selects a post for the detail view', () => {
    const state = reducer(stateWith({}).posts, selectPost('2'));
    expect(selectSelectedPost({ posts: state })).toEqual(posts[1]);
  });
});
