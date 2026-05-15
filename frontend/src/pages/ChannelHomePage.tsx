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
    Promise.all([
      api.getGroups(),
      api.getTodayStatus(),
      api.getInbox(),
      api.getOutbox(),
    ]).then(([groups, s, inbox, outbox]) => {
      const found = groups.find(g => g.group_id === groupId);
      setGroup(found ?? null);
      setStatus(s);
      // 채널 기준 필터 (group_id)
      setInboxCount((inbox as Letter[]).filter(l => l.group_id === groupId).length);
      setOutboxCount((outbox as OutboxLetter[]).filter(l => l.group_id === groupId).length);
    }).finally(() => setLoading(false));
  }, [groupId]);

  if (loading) return <div className="text-muted">불러오는 중...</div>;
  if (!group) return <div className="text-muted">채널을 찾을 수 없어요.</div>;

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
