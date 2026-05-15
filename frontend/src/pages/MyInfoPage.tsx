import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Group, TodayStatus } from '../api';
import TopBar from '../components/TopBar';

export default function MyInfoPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') ?? '';
  const [groups, setGroups] = useState<Group[]>([]);
  const [status, setStatus] = useState<TodayStatus>({ sent_today: 0, opened_today: 0, can_open: 0 });
  const [loading, setLoading] = useState(true);

  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getGroups().catch(() => [] as Group[]),
      api.getTodayStatus().catch(() => ({ sent_today: 0, opened_today: 0, can_open: 0 })),
    ]).then(([g, s]) => {
      setGroups(g as Group[]);
      setStatus(s as TodayStatus);
    }).finally(() => setLoading(false));
  }, []);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoinError('');
    setJoining(true);
    try {
      const res = await api.joinGroup(code);
      if (res.error) {
        if (res.error === 'Already a member' && res.group) {
          localStorage.setItem('currentChannelId', String(res.group.group_id));
          navigate(`/channel/${res.group.group_id}`);
          return;
        }
        setJoinError(res.error);
        return;
      }
      if (res.group) {
        localStorage.setItem('currentChannelId', String(res.group.group_id));
        navigate(`/channel/${res.group.group_id}`);
      }
    } catch {
      setJoinError('참여 중 오류가 발생했습니다.');
    } finally {
      setJoining(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('currentChannelId');
    navigate('/');
  }

  return (
    <div>
      <TopBar title="내 정보" />
      <div className="page">

        <div className="my-profile">
          <div className="my-avatar">🐰</div>
          <div className="my-username">{username}</div>
          <span className="my-badge">채널 닉네임으로 참여 중</span>
        </div>

        {!loading && (
          <div className="stats-row mb-24">
            <div className="stat-card">
              <div className="stat-num">{status.sent_today}</div>
              <div className="stat-label">보낸 편지</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{status.can_open}</div>
              <div className="stat-label">열람권</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{groups.length}</div>
              <div className="stat-label">참여 채널</div>
            </div>
          </div>
        )}

        {/* 채널 추가 */}
        <div className="card mb-16">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showJoinForm ? 12 : 0 }}>
            <div className="section-label" style={{ marginBottom: 0 }}>채널 추가</div>
            <button
              onClick={() => { setShowJoinForm(v => !v); setJoinError(''); setJoinCode(''); }}
              style={{
                border: 'none', background: showJoinForm ? '#EDE8D8' : 'var(--accent)',
                color: showJoinForm ? 'var(--muted)' : '#FDFAF3',
                borderRadius: 8, padding: '4px 12px', fontSize: 13,
                fontFamily: 'Nunito, sans-serif', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {showJoinForm ? '취소' : '+ 참여하기'}
            </button>
          </div>

          {showJoinForm && (
            <>
              {joinError && <div className="error-msg">{joinError}</div>}
              <form onSubmit={handleJoin} style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="초대 코드 입력"
                  maxLength={8}
                  autoFocus
                  style={{ fontFamily: 'monospace', letterSpacing: 2, flex: 1 }}
                />
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={joining || !joinCode.trim()}
                  style={{ whiteSpace: 'nowrap', padding: '12px 16px' }}
                >
                  {joining ? '...' : '입장'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* 참여 중인 채널 */}
        <div className="card mb-16">
          <div className="section-label" style={{ marginBottom: 4 }}>참여 중인 채널</div>
          {loading ? (
            <div className="text-muted mt-8">불러오는 중...</div>
          ) : groups.length === 0 ? (
            <div className="text-muted mt-8">참여 중인 채널이 없어요</div>
          ) : (
            <div className="menu-list">
              {groups.map(g => (
                <button
                  key={g.group_id}
                  className="menu-item"
                  onClick={() => {
                    localStorage.setItem('currentChannelId', String(g.group_id));
                    navigate(`/channel/${g.group_id}`);
                  }}
                >
                  <span>{g.group_name}</span>
                  <span className="menu-arrow">›</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="menu-list">
            <button className="menu-item" onClick={() => {}}>
              <span>알림 설정</span>
              <span className="menu-arrow">›</span>
            </button>
            <button className="menu-item" onClick={() => {}}>
              <span>도움말</span>
              <span className="menu-arrow">›</span>
            </button>
            <button className="menu-item danger" onClick={logout}>
              <span>로그아웃</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
