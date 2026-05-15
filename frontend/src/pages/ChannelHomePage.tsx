import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Group, Letter, TodayStatus } from '../api';
import TopBar from '../components/TopBar';

function toDateStr(isoStr: string) {
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function ChannelHomePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const username = localStorage.getItem('username') ?? '';
  const groupId = Number(id);

  const [group, setGroup] = useState<Group | null>(null);
  const [status, setStatus] = useState<TodayStatus>({ sent_today: 0, opened_today: 0, can_open: 0 });
  const [inbox, setInbox] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(() => toDateStr(new Date().toISOString()));

  useEffect(() => {
    if (!groupId) { setLoading(false); return; }
    Promise.all([
      api.getGroup(groupId).catch(() => null),
      api.getTodayStatus().catch(() => ({ sent_today: 0, opened_today: 0, can_open: 0 })),
      api.getInbox().catch(() => [] as Letter[]),
    ]).then(([g, s, inboxAll]) => {
      setGroup(g && !(g as any).error ? g as Group : null);
      setStatus(s as TodayStatus);
      setInbox((inboxAll as Letter[]).filter(l => l.group_id === groupId));
    }).finally(() => setLoading(false));
  }, [groupId]);

  const lettersByDate = useMemo(() => {
    const map: Record<string, Letter[]> = {};
    inbox.forEach(l => {
      const d = toDateStr(l.created_at);
      if (!map[d]) map[d] = [];
      map[d].push(l);
    });
    return map;
  }, [inbox]);

  const todayStr = toDateStr(new Date().toISOString());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const thisMonthLetters = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return inbox.filter(l => toDateStr(l.created_at).startsWith(prefix)).length;
  }, [inbox, year, month]);

  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const s = toDateStr(d.toISOString());
      if (lettersByDate[s]?.length > 0) {
        count++;
        d.setDate(d.getDate() - 1);
      } else if (i === 0) {
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [lettersByDate]);

  const formatDateLabel = (dateStr: string) => {
    const [, m, day] = dateStr.split('-');
    return `${parseInt(m)}월 ${parseInt(day)}일`;
  };

  const unreadCount = inbox.filter(l => l.status === 'pending').length;

  if (loading) return <div className="page text-muted">불러오는 중...</div>;
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
        right={
          <button
            className="icon-btn"
            aria-label="알림"
            style={{ position: 'relative' }}
            onClick={() => navigate(`/channel/${id}/letters`)}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                background: 'var(--highlight)', color: '#fff',
                borderRadius: '50%', width: 16, height: 16,
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
        }
      />
      <div className="page">

        <div className="home-greeting">
          <div className="home-avatar">🐰</div>
          <div className="home-greeting-text">
            <h2>안녕하세요, {username}님! 👋</h2>
            <p>오늘도 감사 가득한 하루 되세요!</p>
          </div>
        </div>

        {/* 캘린더 섹션 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ color: 'var(--accent)', fontSize: 14 }}>🌿</span>
          <span style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            감사 기록
          </span>
        </div>
        <h2 className="page-title" style={{ marginBottom: 2 }}>받은 편지 달력</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>당신이 받은 소중한 편지들</p>

        <div className="stats-row" style={{ marginBottom: 16 }}>
          <div className="stat-card" style={{ background: '#E5F7D1' }}>
            <div className="stat-num">{thisMonthLetters}통</div>
            <div className="stat-label">이번 달</div>
          </div>
          <div className="stat-card" style={{ background: '#E8E0A1' }}>
            <div className="stat-num">{inbox.length}통</div>
            <div className="stat-label">전체</div>
          </div>
          <div className="stat-card" style={{ background: '#F9E8C8' }}>
            <div className="stat-num">{streak}일</div>
            <div className="stat-label">연속</div>
          </div>
        </div>

        {/* 캘린더 카드 */}
        <div className="card" style={{ marginBottom: 16, padding: '20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#EDE8D8', color: 'var(--accent)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >‹</button>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
              {year}년 {month + 1}월
            </span>
            <button
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#EDE8D8', color: 'var(--accent)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {DAY_NAMES.map((d, i) => (
              <div key={d} style={{
                textAlign: 'center', fontSize: 12, fontWeight: 700, padding: '4px 0',
                color: i === 0 ? '#E06060' : i === 6 ? '#6080D0' : 'var(--muted-light)',
              }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 2 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const count = lettersByDate[dateStr]?.length ?? 0;
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayStr;
              const dow = (firstDay + i) % 7;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '6px 2px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: isSelected ? 'var(--accent)' : isToday ? '#E5F7D1' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{
                    fontFamily: "'Nunito', sans-serif", fontSize: 13,
                    fontWeight: isSelected || isToday ? 700 : 400,
                    color: isSelected ? '#FDFAF3' : dow === 0 ? '#E06060' : dow === 6 ? '#6080D0' : 'var(--text)',
                    lineHeight: 1.4,
                  }}>{day}</span>
                  {count > 0 && (
                    <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                      {Array.from({ length: Math.min(count, 3) }).map((_, ci) => (
                        <div key={ci} style={{
                          width: 4, height: 4, borderRadius: '50%',
                          background: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--highlight)',
                        }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 선택한 날짜의 편지 */}
        {selectedDate && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.04em', marginBottom: 12 }}>
              {formatDateLabel(selectedDate)} 받은 편지
            </p>
            {(lettersByDate[selectedDate] ?? []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', borderRadius: 16, border: '1px dashed rgba(108,128,75,0.2)', background: 'var(--card)' }}>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>이날은 편지가 없어요 🌿</p>
              </div>
            ) : (
              <div className="letter-list">
                {(lettersByDate[selectedDate] ?? []).map(l => (
                  <div
                    key={l.letter_id}
                    className="letter-item"
                    onClick={() => navigate(`/channel/${id}/inbox/${l.letter_id}`, { state: { letter: l, status } })}
                  >
                    <div className="letter-item-row">
                      <div className={`letter-avatar${l.status === 'opened' ? ' read' : ' anon'}`}>
                        {l.status === 'opened' ? '🐰' : '❓'}
                      </div>
                      <div className="letter-meta">
                        <div className="letter-sender">
                          {l.status === 'opened' ? (l.sender_username ?? '익명의 누군가') : '익명의 누군가'}
                        </div>
                        <div className="letter-preview">
                          {l.status === 'opened' && l.content ? l.content : '편지가 도착했어요'}
                        </div>
                      </div>
                      <div className="letter-right">
                        <span className="letter-time">
                          {new Date(l.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {l.status === 'pending' && <span className="badge badge-new">NEW</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
