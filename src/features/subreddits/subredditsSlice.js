import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSubreddits } from '../../api/reddit';

export const fetchSubreddits = createAsyncThunk('subreddits/fetchSubreddits', async () => getSubreddits());

const subredditsSlice = createSlice({
  name: 'subreddits',
  initialState: { items: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubreddits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubreddits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchSubreddits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export default subredditsSlice.reducer;
export const selectSubreddits = (state) => state.subreddits.items;
