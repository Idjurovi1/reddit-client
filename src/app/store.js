import { configureStore, combineReducers } from '@reduxjs/toolkit';
import postsReducer from '../features/posts/postsSlice';
import subredditsReducer from '../features/subreddits/subredditsSlice';
import commentsReducer from '../features/comments/commentsSlice';

export const rootReducer = combineReducers({
  posts: postsReducer,
  subreddits: subredditsReducer,
  comments: commentsReducer,
});

// Factory so tests can create a fresh store with optional preloaded state.
export const setupStore = (preloadedState) => configureStore({ reducer: rootReducer, preloadedState });

export const store = setupStore();
