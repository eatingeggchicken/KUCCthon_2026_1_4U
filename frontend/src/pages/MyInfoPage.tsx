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

  useEffect(() => {
    Promise.all([api.getGroups(), api.getTodayStatus()])
      .then(([g, s]) => { setGroups(g); setStatus(s); })
      .finally(() => setLoading(false));
  }, []);

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
        <div className="my-username">
          {username}
        </div>
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

      <div className="card mb-16">
        <div className="section-label" style={{ marginBottom: 4 }}>참여 중인 채널</div>
        {groups.length === 0 ? (
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
