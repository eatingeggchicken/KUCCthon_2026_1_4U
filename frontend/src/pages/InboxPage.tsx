import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Letter, TodayStatus } from '../api';
import TopBar from '../components/TopBar';

type Tab = 'all' | 'pending' | 'opened';

function fmt(d: string) {
  const date = new Date(d);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function InboxPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const groupId = Number(id);

  const [inbox, setInbox] = useState<Letter[]>([]);
  const [status, setStatus] = useState<TodayStatus>({ sent_today: 0, opened_today: 0, can_open: 0 });
  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getInbox(), api.getTodayStatus()])
      .then(([letters, s]) => {
        setInbox(letters.filter(l => l.group_id === groupId));
        setStatus(s);
      })
      .finally(() => setLoading(false));
  }, [groupId]);

  const filtered =
    tab === 'all' ? inbox :
    tab === 'pending' ? inbox.filter(l => l.status === 'pending') :
    inbox.filter(l => l.status === 'opened');

  return (
    <div>
      <TopBar title="받은 편지함" />
      <div className="page">
      {loading ? (
        <div className="text-muted">불러오는 중...</div>
      ) : (
        <>
          <div className="tabs">
            {([['all', '전체'], ['pending', '미열람'], ['opened', '열람']] as [Tab, string][]).map(([t, label]) => (
              <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {label}
                {t === 'pending' && inbox.filter(l => l.status === 'pending').length > 0 && (
                  <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--muted)' }}>
                    {inbox.filter(l => l.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-text">편지가 없어요</div>
              <div className="empty-sub">
                {tab === 'pending' ? '미열람 편지가 없어요' : tab === 'opened' ? '열람한 편지가 없어요' : '아직 받은 편지가 없어요'}
              </div>
            </div>
          ) : (
            <div className="letter-list">
              {filtered.map(l => (
                <div
                  key={l.letter_id}
                  className="letter-item"
                  onClick={() => navigate(`/channel/${id}/inbox/${l.letter_id}`, { state: { letter: l, status } })}
                >
                  <div className="letter-item-row">
                    <div className={`letter-avatar${l.status === 'pending' ? ' anon' : ''}`}>
                      {l.status === 'opened' ? '🐰' : '❓'}
                    </div>
                    <div className="letter-meta">
                      <div className="letter-sender">
                        {l.status === 'opened' ? '익명의 누군가' : '익명의 누군가'}
                      </div>
                      <div className="letter-preview">
                        {l.status === 'opened' && l.content
                          ? l.content
                          : '편지가 도착했어요'}
                      </div>
                    </div>
                    <div className="letter-right">
                      <span className="letter-time">{fmt(l.created_at)}</span>
                      {l.status === 'pending' && <span className="badge badge-new">NEW</span>}
                    </div>
                  </div>
                  {l.status === 'pending' && status.can_open > 0 && (
                    <div style={{ marginTop: 10, paddingLeft: 52 }}>
                      <button
                        className="reveal-btn"
                        onClick={e => { e.stopPropagation(); navigate(`/channel/${id}/inbox/${l.letter_id}`, { state: { letter: l, status } }); }}
                      >
                        편지 열기 (열람권 {status.can_open}개)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
