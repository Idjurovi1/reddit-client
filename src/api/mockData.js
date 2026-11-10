// Local fallback data shaped exactly like Reddit's JSON API responses.
// Used when the real API is unreachable (offline, CORS, rate limit) and in tests.

const now = Math.floor(Date.now() / 1000);
const hoursAgo = (h) => now - h * 3600;

export const mockSubreddits = [
  { id: 'popular', display_name: 'popular', display_name_prefixed: 'r/popular', icon_img: '', primary_color: '#ff4500' },
  { id: 't5_2qh0u', display_name: 'pics', display_name_prefixed: 'r/pics', icon_img: '', primary_color: '#0079d3' },
  { id: 't5_2qs0q', display_name: 'webdev', display_name_prefixed: 'r/webdev', icon_img: '', primary_color: '#46d160' },
  { id: 't5_2zldd', display_name: 'reactjs', display_name_prefixed: 'r/reactjs', icon_img: '', primary_color: '#61dafb' },
  { id: 't5_2qh30', display_name: 'javascript', display_name_prefixed: 'r/javascript', icon_img: '', primary_color: '#f7df1e' },
  { id: 't5_2qh1i', display_name: 'space', display_name_prefixed: 'r/space', icon_img: '', primary_color: '#7193ff' },
  { id: 't5_2qh33', display_name: 'food', display_name_prefixed: 'r/food', icon_img: '', primary_color: '#ff8717' },
  { id: 't5_2qhbe', display_name: 'travel', display_name_prefixed: 'r/travel', icon_img: '', primary_color: '#0dd3bb' },
];

const raw = [
  ['webdev', 'I finally understood CSS Grid after building 10 layouts in a weekend', 'gridnerd', 4821, 312, null, 'Started with holy-grail layout and ended with a full dashboard. **grid-template-areas** is the real MVP.'],
  ['webdev', 'What is your 2026 front-end stack and why?', 'stack_curious', 2210, 845, null, 'Mine: Vite + React 19 + Redux Toolkit + Vitest. Deploying on Netlify.'],
  ['reactjs', 'React 19 Actions made my forms 40% smaller', 'hooked_on_hooks', 3390, 204, null, '`useActionState` + `useFormStatus` replaced most of my custom form state.'],
  ['reactjs', 'Redux Toolkit vs Zustand in 2026 - honest comparison after 2 years', 'state_of_mind', 1875, 433, null, 'RTK still wins for big teams thanks to DevTools and conventions.'],
  ['javascript', 'TIL: structuredClone() deep copies Maps, Sets and Dates', 'til_js', 2950, 156, null, 'No more `JSON.parse(JSON.stringify(obj))` hacks.'],
  ['javascript', 'A visual guide to the event loop', 'loop_de_loop', 5120, 287, 'https://picsum.photos/seed/eventloop/800/450', ''],
  ['pics', 'Sunrise over the Adriatic this morning', 'adriatic_eye', 18420, 640, 'https://picsum.photos/seed/adriatic/800/533', ''],
  ['pics', 'My grandpa built this wooden boat by hand', 'woodworks', 25300, 980, 'https://picsum.photos/seed/boat/800/600', ''],
  ['space', 'Webb captured the clearest image yet of a distant galaxy cluster', 'stargazer42', 31200, 1204, 'https://picsum.photos/seed/galaxy/800/800', ''],
  ['space', 'How do rockets steer in a vacuum? ELI5', 'curious_cosmos', 4410, 392, null, 'Thrust vectoring: the engine nozzle tilts, pushing the rocket in the opposite direction.'],
  ['food', 'Homemade sourdough after 30 failed attempts', 'crumb_shot', 12900, 511, 'https://picsum.photos/seed/sourdough/800/600', ''],
  ['food', 'Best cake recipes that never fail?', 'baker_beginner', 1630, 720, null, 'Looking for a reliable chocolate cake for a birthday. What are your go-to cake recipes?'],
  ['travel', 'Two weeks in Croatia: Zagreb, Plitvice and Split itinerary', 'wanderlust_hr', 6780, 488, 'https://picsum.photos/seed/plitvice/800/533', 'Plitvice in early morning before the tour buses is magical.'],
  ['travel', 'Packing list that fits in one carry-on for a month', 'light_packer', 3920, 301, null, 'Merino everything. Seriously.'],
];

export const mockPosts = raw.map(([subreddit, title, author, score, num_comments, url, selftext], i) => ({
  id: `mock${i + 1}`,
  name: `t3_mock${i + 1}`,
  subreddit,
  subreddit_name_prefixed: `r/${subreddit}`,
  title,
  author,
  score,
  ups: score,
  num_comments,
  created_utc: hoursAgo(i * 2 + 1),
  url: url || `https://www.reddit.com/r/${subreddit}/comments/mock${i + 1}/`,
  post_hint: url ? 'image' : 'self',
  is_video: false,
  selftext,
  permalink: `/r/${subreddit}/comments/mock${i + 1}/`,
  thumbnail: url || 'self',
}));

export const mockComments = (postId) => [
  { id: `${postId}_c1`, author: 'helpful_dev', body: 'Great post! **Saved** for later.', score: 312, created_utc: hoursAgo(1) },
  { id: `${postId}_c2`, author: 'devil_advocate', body: 'Interesting take, but have you considered:\n\n- performance\n- accessibility\n- maintainability', score: 128, created_utc: hoursAgo(2) },
  { id: `${postId}_c3`, author: 'lurker_no_more', body: 'Came here to say this. Here is a [link](https://developer.mozilla.org) that helped me.', score: 57, created_utc: hoursAgo(3) },
];

// Helpers that wrap data in Reddit's "Listing" response shape.
export const toListing = (items, kind = 't3') => ({
  kind: 'Listing',
  data: { children: items.map((data) => ({ kind, data })), after: null, before: null },
});
