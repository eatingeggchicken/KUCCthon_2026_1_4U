import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CreateChannelPage from './pages/CreateChannelPage';
import ChannelInvitePage from './pages/ChannelInvitePage';
import ChannelJoinPage from './pages/ChannelJoinPage';

import ChannelHomePage from './pages/ChannelHomePage';
import InboxPage from './pages/InboxPage';
import OutboxPage from './pages/OutboxPage';
import MyInfoPage from './pages/MyInfoPage';

import MembersPage from './pages/MembersPage';
import WriteLetterPage from './pages/WriteLetterPage';
import LetterDetailPage from './pages/LetterDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 비인증 */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/create-channel" element={<CreateChannelPage />} />
        <Route path="/channel/:id/invite" element={<ChannelInvitePage />} />
        <Route path="/join/:inviteCode" element={<ChannelJoinPage />} />

        {/* 하단 탭 있는 채널 페이지 */}
        <Route element={<Layout />}>
          <Route path="/channel/:id" element={<ChannelHomePage />} />
          <Route path="/channel/:id/inbox" element={<InboxPage />} />
          <Route path="/channel/:id/outbox" element={<OutboxPage />} />
          <Route path="/me" element={<MyInfoPage />} />
        </Route>

        {/* 하단 탭 없는 서브 페이지 */}
        <Route path="/channel/:id/members" element={<MembersPage />} />
        <Route path="/channel/:id/write" element={<WriteLetterPage />} />
        <Route path="/channel/:id/inbox/:letter_id" element={<LetterDetailPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
