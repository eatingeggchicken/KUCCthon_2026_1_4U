import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, OutboxLetter } from '../api';
import TopBar from '../components/TopBar';

type Tab = 'all' | 'pending' | 'opened';

function fmt(d: string) {
  const date = new Date(d);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function OutboxPage() {
  const { id } = useParams<{ id: string }>();
  const groupId = Number(id);

  const [outbox, setOutbox] = useState<OutboxLetter[]>([]);
  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOutbox()
      .then(letters => setOutbox(letters.filter(l => l.group_id === groupId)))
      .finally(() => setLoading(false));
  }, [groupId]);

  const filtered =
    tab === 'all' ? outbox :
    tab === 'pending' ? outbox.filter(l => l.status === 'pending') :
    outbox.filter(l => l.status === 'opened');

  return (
    <div>
      <TopBar title="보낸 편지함" />
      <div className="page">
      {loading ? (
        <div className="text-muted">불러오는 중...</div>
      ) : (
        <>
          <div className="tabs">
            {([['all', '전체'], ['pending', '미열람'], ['opened', '열람']] as [Tab, string][]).map(([t, label]) => (
              <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {label}
              </button>
            ))}
          </div>
          {/* TODO: 백엔드에 is_anonymous 추가되면 탭을 전체/실명/익명으로 변경 */}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📤</div>
              <div className="empty-text">보낸 편지가 없어요</div>
              <div className="empty-sub">멤버 목록에서 편지를 보내보세요</div>
            </div>
          ) : (
            <div className="letter-list">
              {filtered.map(l => (
                <div key={l.letter_id} className="letter-item">
                  <div className="letter-item-row">
                    <div className="letter-avatar">🐰</div>
                    <div className="letter-meta">
                      <div className="letter-sender">To. {l.receiver_username}</div>
                      <div className="letter-preview">{l.content}</div>
                    </div>
                    <div className="letter-right">
                      <span className="letter-time">{fmt(l.created_at)}</span>
                      <span className={`badge ${l.is_anonymous ? 'badge-anon' : 'badge-real'}`}>
                        {l.is_anonymous ? '익명' : '실명'}
                      </span>
                      <span className={`badge ${l.status === 'opened' ? 'badge-opened' : 'badge-pending'}`}>
                        {l.status === 'opened' ? '열람됨' : '미열람'}
                      </span>
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
