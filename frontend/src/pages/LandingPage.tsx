import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState('');

  const isLoggedIn = !!localStorage.getItem('token');

  if (isLoggedIn) {
    navigate('/me', { replace: true });
    return null;
  }

  const currentChannelId = localStorage.getItem('currentChannelId');

  function handleCreate() {
    if (!isLoggedIn) {
      sessionStorage.setItem('loginNext', '/create-channel');
      navigate('/login');
    } else {
      navigate('/create-channel');
    }
  }

  function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    if (!isLoggedIn) {
      sessionStorage.setItem('loginNext', `/join/${trimmed}`);
      navigate('/login');
    } else {
      navigate(`/join/${trimmed}`);
    }
  }

  return (
    <div className="landing-wrap">
      <div className="landing-logo">✉</div>
      <h1 className="landing-title">고마움 우체통</h1>
      <p className="landing-desc">
        감사는 받을 때보다 보낼 때 더 커져요.<br />
        같은 채널의 사람들에게 익명 또는 실명으로<br />
        감사 편지를 보내보세요.
      </p>

      <div className="landing-actions">
        {isLoggedIn && currentChannelId && (
          <button className="btn btn-secondary btn-full" onClick={() => navigate(`/channel/${currentChannelId}`)}>
            채널로 돌아가기
          </button>
        )}
        <button className="btn btn-primary btn-full" onClick={handleCreate}>
          채널 만들기
        </button>
        <button
          className="btn btn-secondary btn-full"
          onClick={() => setShowJoin(v => !v)}
        >
          참여하기
        </button>
      </div>

      {showJoin && (
        <div className="landing-join-wrap">
          <p className="text-muted text-center">초대 코드를 입력하세요</p>
          <form className="landing-join-row" onSubmit={handleJoinSubmit}>
            <input
              className="form-input"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="예) AB12CD34"
              maxLength={8}
              style={{ fontFamily: 'monospace', letterSpacing: 2 }}
              autoFocus
            />
            <button className="btn btn-primary" type="submit" style={{ whiteSpace: 'nowrap' }}>
              입장
            </button>
          </form>
        </div>
      )}

      <div className="landing-divider" style={{ marginTop: 36 }}>
        {isLoggedIn ? (
          <span className="text-muted">로그인됨 · <Link to="/me">내 정보</Link></span>
        ) : (
          <span className="text-muted">이미 계정이 있으신가요? <Link to="/login">로그인</Link></span>
        )}
      </div>
    </div>
  );
}
