import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import TopBar from '../components/TopBar';

export default function ChannelJoinPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [displayStyle, setDisplayStyle] = useState<'nickname' | 'realname'>('nickname');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');
  const username = localStorage.getItem('username') ?? '';

  useEffect(() => {
    if (!isLoggedIn) {
      sessionStorage.setItem('loginNext', `/join/${inviteCode}`);
      navigate('/login');
      return;
    }
    setNickname(username);
  }, [isLoggedIn, inviteCode, navigate, username]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!nickname.trim()) { setError('닉네임을 입력하세요.'); return; }
    setLoading(true);
    try {
      const res = await api.joinGroup(inviteCode!);
      if (res.error) {
        if (res.error === 'Already a member' && res.group) {
          localStorage.setItem('currentChannelId', String(res.group.group_id));
          navigate(`/channel/${res.group.group_id}`);
          return;
        }
        setError(res.error);
        return;
      }
      if (res.group) {
        localStorage.setItem('currentChannelId', String(res.group.group_id));
        // TODO: 백엔드 display_style 지원 후 nickname + display_style 함께 전달
        navigate(`/channel/${res.group.group_id}`);
      }
    } catch {
      setError('참여 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) return null;

  return (
    <div className="subpage-wrap">
      <TopBar title="채널 입장" onBack={true} />
      <div className="subpage-body">
        <p className="page-subtitle">닉네임을 설정하고 채널에 입장해보세요.</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">닉네임</label>
            <input
              className="form-input"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="닉네임을 입력해주세요"
              maxLength={10}
            />
            <div className="input-count">{nickname.length} / 10</div>
          </div>

          <div className="form-group">
            <label className="form-label">표시 방식</label>
            {/* TODO: 백엔드 display_style 지원 후 연동 */}
            <label className="radio-option" style={displayStyle === 'nickname' ? { borderColor: 'var(--accent)', background: 'var(--accent-light)' } : {}}>
              <input type="radio" name="displayStyle" checked={displayStyle === 'nickname'} onChange={() => setDisplayStyle('nickname')} />
              <div className="radio-option-text">
                <strong>닉네임으로 참여</strong>
                <span>편지를 보낼 때 닉네임이 표시돼요</span>
              </div>
            </label>
            <label className="radio-option" style={displayStyle === 'realname' ? { borderColor: 'var(--accent)', background: 'var(--accent-light)' } : {}}>
              <input type="radio" name="displayStyle" checked={displayStyle === 'realname'} onChange={() => setDisplayStyle('realname')} />
              <div className="radio-option-text">
                <strong>실명으로 참여</strong>
                <span>편지를 보낼 때 실명이 표시돼요</span>
              </div>
            </label>
          </div>

          <button className="btn btn-primary btn-full mt-8" type="submit" disabled={loading || !nickname.trim()}>
            {loading ? '입장 중...' : '입장하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
