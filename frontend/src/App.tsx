import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import InboxPage from './pages/InboxPage';
import LetterDetailPage from './pages/LetterDetailPage';
import WriteLetterPage from './pages/WriteLetterPage';
import GroupPage from './pages/GroupPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/inbox/:letter_id" element={<LetterDetailPage />} />
          <Route path="/write" element={<WriteLetterPage />} />
          <Route path="/groups" element={<GroupPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
