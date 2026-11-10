import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { getSubredditPosts, searchPosts } from '../../api/reddit';

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async (subreddit) => {
  return getSubredditPosts(subreddit);
});

export const fetchSearchResults = createAsyncThunk('posts/fetchSearchResults', async (term) => {
  return searchPosts(term);
});

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  selectedSubreddit: 'popular',
  searchTerm: '', // quick filter over loaded posts (typed live)
  activeSearch: '', // term sent to Reddit's search endpoint (on submit)
  selectedPostId: null, // post shown in the detail modal
};

const pending = (state) => {
  state.isLoading = true;
  state.error = null;
};
const fulfilled = (state, action) => {
  state.isLoading = false;
  state.items = action.payload;
};
const rejected = (state, action) => {
  state.isLoading = false;
  state.error = action.error.message || 'Something went wrong.';
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSelectedSubreddit(state, action) {
      state.selectedSubreddit = action.payload;
      state.searchTerm = '';
      state.activeSearch = '';
    },
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    setActiveSearch(state, action) {
      state.activeSearch = action.payload;
    },
    selectPost(state, action) {
      state.selectedPostId = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, pending)
      .addCase(fetchPosts.fulfilled, fulfilled)
      .addCase(fetchPosts.rejected, rejected)
      .addCase(fetchSearchResults.pending, pending)
      .addCase(fetchSearchResults.fulfilled, fulfilled)
      .addCase(fetchSearchResults.rejected, rejected);
  },
});

export const { setSelectedSubreddit, setSearchTerm, setActiveSearch, selectPost, clearError } = postsSlice.actions;
export default postsSlice.reducer;

// Selectors
export const selectPostsState = (state) => state.posts;
export const selectAllPosts = (state) => state.posts.items;
export const selectSearchTerm = (state) => state.posts.searchTerm;
export const selectSelectedSubreddit = (state) => state.posts.selectedSubreddit;

// Memoized: only recomputes when posts or the search term change.
export const selectFilteredPosts = createSelector([selectAllPosts, selectSearchTerm], (posts, term) => {
  const t = term.trim().toLowerCase();
  if (!t) return posts;
  return posts.filter((p) => p.title.toLowerCase().includes(t) || p.author.toLowerCase().includes(t));
});

export const selectSelectedPost = (state) =>
  state.posts.items.find((p) => p.id === state.posts.selectedPostId) || null;
