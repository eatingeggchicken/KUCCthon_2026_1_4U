import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Group, Letter, OutboxLetter, TodayStatus } from '../api';
import TopBar from '../components/TopBar';

export default function ChannelHomePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const username = localStorage.getItem('username') ?? '';
  const groupId = Number(id);

  const [group, setGroup] = useState<Group | null>(null);
  const [status, setStatus] = useState<TodayStatus>({ sent_today: 0, opened_today: 0, can_open: 0 });
  const [inboxCount, setInboxCount] = useState(0);
  const [outboxCount, setOutboxCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) { setLoading(false); return; }
    Promise.all([
      api.getGroup(groupId).catch(() => null),
      api.getTodayStatus().catch(() => ({ sent_today: 0, opened_today: 0, can_open: 0 })),
      api.getInbox().catch(() => []),
      api.getOutbox().catch(() => []),
    ]).then(([g, s, inbox, outbox]) => {
      setGroup(g && !(g as any).error ? g as Group : null);
      setStatus(s as TodayStatus);
      setInboxCount((inbox as Letter[]).filter(l => l.group_id === groupId).length);
      setOutboxCount((outbox as OutboxLetter[]).filter(l => l.group_id === groupId).length);
    }).finally(() => setLoading(false));
  }, [groupId]);

  if (loading) return <div style={{ padding: 24 }} className="text-muted">불러오는 중...</div>;
  if (!group) return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>채널을 찾을 수 없어요</div>
      <div className="text-muted" style={{ marginBottom: 24, fontSize: 14 }}>
        채널이 삭제됐거나 접근 권한이 없어요
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/me')}>
        내 채널 목록으로
      </button>
    </div>
  );

  return (
    <div>
      <TopBar
        title={group.group_name}
        right={<button className="icon-btn" aria-label="알림">🔔</button>}
      />
      <div className="page">
      <div className="home-greeting">
        <div className="home-avatar">🐰</div>
        <div className="home-greeting-text">
          <h2>만반하세요, {username}님! 👋</h2>
          <p>오늘도 감사 가득한 하루 되세요!</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{inboxCount}</div>
          <div className="stat-label">받은 편지</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{outboxCount}</div>
          <div className="stat-label">보낸 편지</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{status.can_open}</div>
          <div className="stat-label">열람권 ⓘ</div>
        </div>
      </div>

      <div className="home-actions">
        <button
          className="home-action-btn primary"
          onClick={() => navigate(`/channel/${id}/members`)}
        >
          <span className="home-action-icon">✈️</span>
          편지 보내기
        </button>
        <button
          className="home-action-btn secondary"
          onClick={() => navigate(`/channel/${id}/inbox`)}
        >
          <span className="home-action-icon">✉️</span>
          받은 편지함
        </button>
        <button
          className="home-action-btn secondary"
          onClick={() => navigate(`/channel/${id}/members`)}
        >
          <span className="home-action-icon">👥</span>
          멤버 목록
        </button>
      </div>
      </div>
    </div>
  );
}
