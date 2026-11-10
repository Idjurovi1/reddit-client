import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPostComments } from '../../api/reddit';

export const fetchComments = createAsyncThunk('comments/fetchComments', async (post) => {
  const comments = await getPostComments(post);
  return { postId: post.id, comments };
});

// Comments are stored per post id: { [postId]: { list, isLoading, error } }
const commentsSlice = createSlice({
  name: 'comments',
  initialState: { byPostId: {} },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state, action) => {
        const id = action.meta.arg.id;
        state.byPostId[id] = { list: state.byPostId[id]?.list || [], isLoading: true, error: null };
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.byPostId[action.payload.postId] = { list: action.payload.comments, isLoading: false, error: null };
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const id = action.meta.arg.id;
        state.byPostId[id] = { list: [], isLoading: false, error: action.error.message };
      });
  },
});

export default commentsSlice.reducer;
export const selectCommentsFor = (postId) => (state) =>
  state.comments.byPostId[postId] || { list: [], isLoading: false, error: null };
