import { useSelector } from 'react-redux';
import Header from './components/Header';
import Posts from './components/Posts';
import Subreddits from './components/Subreddits';
import PostModal from './components/PostModal';
import { isUsingMockData } from './api/reddit';

export default function App() {
  // Re-render after each load so the demo-data banner reflects the latest request.
  useSelector((s) => s.posts.isLoading);
  return (
    <>
      <Header />
      {isUsingMockData() && (
        <p className="demo-banner" role="status">
          Reddit is unreachable right now, so you're seeing demo data.
        </p>
      )}
      <main className="layout">
        <Posts />
        <Subreddits />
      </main>
      <PostModal />
    </>
  );
}
