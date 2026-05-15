import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Letter, TodayStatus } from '../api';

export default function LetterDetailPage() {
  const { letter_id } = useParams<{ letter_id: string }>();
  const navigate = useNavigate();
  const [letter, setLetter] = useState<Letter | null>(null);
  const [status, setStatus] = useState<TodayStatus>({ sent_today: 0, opened_today: 0, can_open: 0 });
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getInbox(), api.getTodayStatus()])
      .then(([inbox, s]) => {
        const found = inbox.find((l: Letter) => l.letter_id === Number(letter_id));
        setLetter(found ?? null);
        setStatus(s);
      })
      .finally(() => setLoading(false));
  }, [letter_id]);

  async function handleOpen() {
    if (!letter) return;
    setOpening(true);
    setError('');
    try {
      const res = await api.openLetter(letter.letter_id);
      if (res.error) {
        setError(res.error);
        return;
      }
      setLetter(res as Letter);
      setStatus(prev => ({ ...prev, can_open: Math.max(0, prev.can_open - 1), opened_today: prev.opened_today + 1 }));
    } catch {
      setError('편지를 여는 중 오류가 발생했습니다.');
    } finally {
      setOpening(false);
    }
  }

  function fmt(d: string) {
    return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  if (loading) return <div className="text-muted">불러오는 중...</div>;
  if (!letter) return (
    <div>
      <button className="btn btn-secondary btn-sm mb-16" onClick={() => navigate('/inbox')}>← 뒤로</button>
      <div className="empty-state"><div className="empty-icon">❓</div><div>편지를 찾을 수 없어요</div></div>
    </div>
  );

  return (
    <div>
      <button className="btn btn-secondary btn-sm mb-16" onClick={() => navigate('/inbox')}>← 메일함으로</button>

      <div className="page-header">
        <h1 className="page-title">
          {letter.status === 'opened' ? '💌 편지' : '🔒 열리지 않은 편지'}
        </h1>
        <p className="page-subtitle">{fmt(letter.created_at)} 도착</p>
      </div>

      {letter.status === 'opened' ? (
        <>
          <div className="letter-content">{letter.content}</div>
          {letter.opened_at && (
            <div className="text-muted mt-12">{fmt(letter.opened_at)} 열람</div>
          )}
        </>
      ) : (
        <>
          <div className="letter-envelope">
            <div className="letter-envelope-icon">
              {status.can_open > 0 ? '📩' : '🔒'}
            </div>
            <div className="letter-envelope-text">
              {status.can_open > 0 ? '지금 열 수 있어요!' : '아직 열 수 없어요'}
            </div>
            <div className="letter-envelope-sub">
              {status.can_open > 0
                ? `오늘 ${status.sent_today}개 보냄 · ${status.can_open}개 열 수 있음`
                : status.sent_today > 0
                  ? '오늘 열 수 있는 편지를 모두 열었어요. 더 보내면 더 열 수 있어요!'
                  : '오늘 편지를 먼저 보내야 열 수 있어요'}
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          {status.can_open > 0 ? (
            <button
              className="btn btn-primary btn-full"
              onClick={handleOpen}
              disabled={opening}
            >
              {opening ? '여는 중...' : '📬 편지 열기'}
            </button>
          ) : (
            <div className="card text-center" style={{ padding: 24 }}>
              <div style={{ fontSize: 20, marginBottom: 10 }}>✉️ 미션</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>
                편지를 보내면 받은 편지를 하나 열 수 있어요!<br />
                보낸 편지 1개 = 열 수 있는 편지 1개
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/write')}>
                지금 편지 쓰기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
