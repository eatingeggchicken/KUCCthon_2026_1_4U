import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, Letter, TodayStatus } from '../api';

export default function MainPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const [status, setStatus] = useState<TodayStatus>({ sent_today: 0, opened_today: 0, can_open: 0 });
  const [inbox, setInbox] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getTodayStatus(), api.getInbox()])
      .then(([s, letters]) => { setStatus(s); setInbox(letters); })
      .finally(() => setLoading(false));
  }, []);

  const pendingLetters = inbox.filter(l => l.status === 'pending');
  const openedLetters  = inbox.filter(l => l.status === 'opened');

  function fmt(d: string) {
    return new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }

  if (loading) return <div className="text-muted">불러오는 중...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">안녕하세요, {username}님 👋</h1>
        <p className="page-subtitle">오늘도 감사한 마음을 전해보세요</p>
      </div>

      {/* 오늘 미션 */}
      <div className="mission-banner mb-24">
        <div className="mission-title">📮 오늘의 미션</div>
        {status.sent_today === 0 ? (
          <>
            <div className="mission-text">아직 오늘 편지를 보내지 않았어요. 편지를 보내야 받은 편지를 열 수 있어요!</div>
            <button className="btn btn-primary mt-12 btn-sm" onClick={() => navigate('/write')}>
              ✉️ 지금 편지 쓰기
            </button>
          </>
        ) : status.can_open > 0 ? (
          <div className="mission-text">
            오늘 편지 {status.sent_today}개 발송 완료 ✓ · <strong>{status.can_open}개</strong> 열 수 있어요
          </div>
        ) : (
          <div className="mission-text">
            오늘 편지 {status.sent_today}개 발송 · 열 수 있는 편지 소진 완료!
            <button className="btn btn-secondary btn-sm mt-8" style={{ marginLeft: 12 }} onClick={() => navigate('/write')}>
              더 보내기
            </button>
          </div>
        )}
      </div>

      {/* 통계 */}
      <div className="grid-3 mb-24">
        <div className="status-card">
          <div className="status-num">{status.sent_today}</div>
          <div className="status-label">오늘 보낸 편지</div>
        </div>
        <div className="status-card">
          <div className="status-num">{status.can_open}</div>
          <div className="status-label">열 수 있는 편지</div>
        </div>
        <div className="status-card">
          <div className="status-num">{pendingLetters.length}</div>
          <div className="status-label">미열람 편지</div>
        </div>
      </div>

      {/* 열 수 있는 편지 */}
      {pendingLetters.length > 0 && (
        <div className="mb-24">
          <div className="flex items-center justify-between mb-12">
            <div className="section-title">📩 미열람 편지 ({pendingLetters.length})</div>
            <Link to="/inbox">전체보기</Link>
          </div>
          <div className="flex flex-col gap-8">
            {pendingLetters.slice(0, 4).map(l => (
              <div key={l.letter_id} className="letter-card" onClick={() => navigate(`/inbox/${l.letter_id}`)}>
                <span className="letter-icon">{status.can_open > 0 ? '📩' : '🔒'}</span>
                <div className="letter-info">
                  <div className="letter-preview" style={{ color: 'var(--muted)' }}>익명의 편지</div>
                  <div className="letter-date">{fmt(l.created_at)}</div>
                </div>
                <span className="badge badge-pending">미열람</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최근 열람 편지 */}
      {openedLetters.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-12">
            <div className="section-title">💌 최근 받은 편지</div>
            <Link to="/inbox">전체보기</Link>
          </div>
          <div className="flex flex-col gap-8">
            {openedLetters.slice(0, 3).map(l => (
              <div key={l.letter_id} className="letter-card" onClick={() => navigate(`/inbox/${l.letter_id}`)}>
                <span className="letter-icon">💌</span>
                <div className="letter-info">
                  <div className="letter-preview">
                    {l.content ? (l.content.length > 55 ? l.content.slice(0, 55) + '...' : l.content) : ''}
                  </div>
                  <div className="letter-date">{fmt(l.created_at)}</div>
                </div>
                <span className="badge badge-opened">열람</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {inbox.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div>아직 받은 편지가 없어요</div>
          <div className="text-muted mt-8">그룹에 참여하고 편지를 받아보세요</div>
          <button className="btn btn-secondary mt-16" onClick={() => navigate('/groups')}>그룹 참여하기</button>
        </div>
      )}
    </div>
  );
}
