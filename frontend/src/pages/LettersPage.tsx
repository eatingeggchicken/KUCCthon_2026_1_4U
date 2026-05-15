import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Letter, OutboxLetter, TodayStatus } from '../api';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';

type MainTab = 'inbox' | 'outbox';
type SubTab = 'all' | 'pending' | 'opened';

function fmt(d: string) {
  const date = new Date(d.includes('T') ? d : d.replace(' ', 'T') + 'Z');
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function LettersPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const groupId = Number(id);

  const [mainTab, setMainTab] = useState<MainTab>('inbox');
  const [inboxSubTab, setInboxSubTab] = useState<SubTab>('all');
  const [outboxSubTab, setOutboxSubTab] = useState<SubTab>('all');

  const [inbox, setInbox] = useState<Letter[]>([]);
  const [outbox, setOutbox] = useState<OutboxLetter[]>([]);
  const [status, setStatus] = useState<TodayStatus>({ sent_today: 0, opened_today: 0, can_open: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getInbox().catch(() => [] as Letter[]),
      api.getOutbox().catch(() => [] as OutboxLetter[]),
      api.getTodayStatus().catch(() => ({ sent_today: 0, opened_today: 0, can_open: 0 })),
    ]).then(([letters, sent, s]) => {
      setInbox((letters as Letter[]).filter(l => l.group_id === groupId));
      setOutbox((sent as OutboxLetter[]).filter(l => l.group_id === groupId));
      setStatus(s as TodayStatus);
    }).finally(() => setLoading(false));
  }, [groupId]);

  const unreadCount = inbox.filter(l => l.status === 'pending').length;

  const filteredInbox =
    inboxSubTab === 'all' ? inbox :
    inboxSubTab === 'pending' ? inbox.filter(l => l.status === 'pending') :
    inbox.filter(l => l.status === 'opened');

  const filteredOutbox =
    outboxSubTab === 'all' ? outbox :
    outboxSubTab === 'pending' ? outbox.filter(l => l.status === 'pending') :
    outbox.filter(l => l.status === 'opened');

  return (
    <div>
      <TopBar title="편지함" />
      <div className="page">

        {/* 메인 탭 — 세그먼트 컨트롤 */}
        <div style={{ display: 'flex', background: '#EDE8D8', borderRadius: 12, padding: 4, marginBottom: 16 }}>
          {(['inbox', 'outbox'] as MainTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: 10,
                background: mainTab === tab ? '#fff' : 'transparent',
                fontWeight: mainTab === tab ? 600 : 400,
                fontSize: 14,
                color: mainTab === tab ? 'var(--text, #1a1a1a)' : 'var(--muted, #888)',
                cursor: 'pointer',
                boxShadow: mainTab === tab ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                transition: 'all 0.15s',
                fontFamily: 'Nunito, sans-serif',
                position: 'relative',
              }}
            >
              {tab === 'inbox' ? '받은 편지함' : '보낸 편지함'}
              {tab === 'inbox' && mainTab !== 'inbox' && unreadCount > 0 && (
                <span className="badge badge-new" style={{ marginLeft: 5, verticalAlign: 'middle', fontSize: 11 }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-muted">불러오는 중...</div>
        ) : mainTab === 'inbox' ? (
          <>
            <div className="tabs">
              {([['all', '전체'], ['pending', '미열람'], ['opened', '열람']] as [SubTab, string][]).map(([t, label]) => (
                <button
                  key={t}
                  className={`tab-btn${inboxSubTab === t ? ' active' : ''}`}
                  onClick={() => setInboxSubTab(t)}
                >
                  {label}
                  {t === 'pending' && inbox.filter(l => l.status === 'pending').length > 0 && (
                    <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--muted)' }}>
                      {inbox.filter(l => l.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {filteredInbox.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Icon name="mail-x" size={48} /></div>
                <div className="empty-text">편지가 없어요</div>
                <div className="empty-sub">
                  {inboxSubTab === 'pending' ? '미열람 편지가 없어요'
                    : inboxSubTab === 'opened' ? '열람한 편지가 없어요'
                    : '아직 받은 편지가 없어요'}
                </div>
              </div>
            ) : (
              <div className="letter-list">
                {filteredInbox.map(l => (
                  <div
                    key={l.letter_id}
                    className="letter-item"
                    onClick={() => navigate(`/channel/${id}/inbox/${l.letter_id}`, { state: { letter: l, status } })}
                  >
                    <div className="letter-item-row">
                      <div className={`letter-avatar${l.status === 'pending' ? ' anon' : ' read'}`}>
                        {l.status === 'opened' ? <Icon name="rabbit" size={20} /> : <Icon name="circle-question-mark" size={20} />}
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
                        <span className="letter-time">{fmt(l.created_at)}</span>
                        {l.status === 'pending' && <span className="badge badge-new">NEW</span>}
                      </div>
                    </div>
                    {l.status === 'pending' && status.can_open > 0 && (
                      <div style={{ marginTop: 10, paddingLeft: 52 }}>
                        <button
                          className="reveal-btn"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/channel/${id}/inbox/${l.letter_id}`, { state: { letter: l, status } });
                          }}
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
        ) : (
          <>
            <div className="tabs">
              {([['all', '전체'], ['pending', '미열람'], ['opened', '열람']] as [SubTab, string][]).map(([t, label]) => (
                <button
                  key={t}
                  className={`tab-btn${outboxSubTab === t ? ' active' : ''}`}
                  onClick={() => setOutboxSubTab(t)}
                >
                  {label}
                </button>
              ))}
            </div>

            {filteredOutbox.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Icon name="mail-warning" size={48} /></div>
                <div className="empty-text">보낸 편지가 없어요</div>
                <div className="empty-sub">
                  {outboxSubTab === 'pending' ? '미열람 편지가 없어요'
                    : outboxSubTab === 'opened' ? '상대방이 열람한 편지가 없어요'
                    : '아직 보낸 편지가 없어요'}
                </div>
              </div>
            ) : (
              <div className="letter-list">
                {filteredOutbox.map(l => (
                  <div key={l.letter_id} className="letter-item">
                    <div className="letter-item-row">
                      <div className="letter-avatar"><Icon name="rabbit" size={20} /></div>
                      <div className="letter-meta">
                        <div className="letter-sender">To. {l.receiver_username}</div>
                        <div className="letter-preview">{l.content}</div>
                      </div>
                      <div className="letter-right">
                        <span className="letter-time">{fmt(l.created_at)}</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <span className={`badge ${l.is_anonymous ? 'badge-anon' : 'badge-real'}`}>
                            {l.is_anonymous ? '익명' : '실명'}
                          </span>
                          <span className={`badge ${l.status === 'opened' ? 'badge-opened' : 'badge-pending'}`}>
                            {l.status === 'opened' ? '열람됨' : '미열람'}
                          </span>
                        </div>
                      </div>
                    </div>
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
