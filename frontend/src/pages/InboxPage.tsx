import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Letter, TodayStatus } from '../api';

type Tab = 'all' | 'pending' | 'opened';

export default function InboxPage() {
  const navigate = useNavigate();
  const [inbox, setInbox] = useState<Letter[]>([]);
  const [status, setStatus] = useState<TodayStatus>({ sent_today: 0, opened_today: 0, can_open: 0 });
  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getInbox(), api.getTodayStatus()])
      .then(([letters, s]) => { setInbox(letters); setStatus(s); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === 'all' ? inbox
    : tab === 'pending' ? inbox.filter(l => l.status === 'pending')
    : inbox.filter(l => l.status === 'opened');

  function fmt(d: string) {
    return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  if (loading) return <div className="text-muted">불러오는 중...</div>;

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">📬 메일함</h1>
          <p className="page-subtitle">총 {inbox.length}개 · 미열람 {inbox.filter(l => l.status === 'pending').length}개</p>
        </div>
        {status.can_open > 0 && (
          <div className="badge badge-pending" style={{ fontSize: 13, padding: '6px 14px' }}>
            🔓 {status.can_open}개 열 수 있음
          </div>
        )}
      </div>

      <div className="tabs">
        {(['all', 'pending', 'opened'] as Tab[]).map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'all' ? '전체' : t === 'pending' ? '미열람' : '열람'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div>{tab === 'all' ? '받은 편지가 없어요' : tab === 'pending' ? '미열람 편지가 없어요' : '열람한 편지가 없어요'}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {filtered.map(l => (
            <div key={l.letter_id} className="letter-card" onClick={() => navigate(`/inbox/${l.letter_id}`)}>
              <span className="letter-icon">
                {l.status === 'opened' ? '💌' : status.can_open > 0 ? '📩' : '🔒'}
              </span>
              <div className="letter-info">
                <div className="letter-preview">
                  {l.status === 'opened' && l.content
                    ? (l.content.length > 60 ? l.content.slice(0, 60) + '...' : l.content)
                    : '익명의 편지 (클릭해서 열기)'}
                </div>
                <div className="letter-date">{fmt(l.created_at)}</div>
              </div>
              <span className={`badge ${l.status === 'opened' ? 'badge-opened' : 'badge-pending'}`}>
                {l.status === 'opened' ? '열람' : '미열람'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
