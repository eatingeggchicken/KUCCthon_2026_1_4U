import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api, Letter, TodayStatus } from '../api';
import TopBar from '../components/TopBar';

function fmt(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function LetterDetailPage() {
  const { id, letter_id } = useParams<{ id: string; letter_id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [letter, setLetter] = useState<Letter | null>(location.state?.letter ?? null);
  const [status, setStatus] = useState<TodayStatus>(
    location.state?.status ?? { sent_today: 0, opened_today: 0, can_open: 0 }
  );
  const [loading, setLoading] = useState(!location.state?.letter);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!letter) {
      Promise.all([api.getInbox(), api.getTodayStatus()])
        .then(([inbox, s]) => {
          setLetter(inbox.find(l => l.letter_id === Number(letter_id)) ?? null);
          setStatus(s);
        })
        .finally(() => setLoading(false));
    }
  }, [letter_id, letter]);

  async function handleOpen() {
    if (!letter) return;
    setOpening(true);
    setError('');
    try {
      const res = await api.openLetter(letter.letter_id);
      if (res.error) { setError(res.error); return; }
      setLetter(res as Letter);
      setStatus(prev => ({
        ...prev,
        can_open: Math.max(0, prev.can_open - 1),
        opened_today: prev.opened_today + 1,
      }));
    } catch {
      setError('편지를 여는 중 오류가 발생했습니다.');
    } finally {
      setOpening(false);
    }
  }

  const back = () => navigate(`/channel/${id}/inbox`);

  return (
    <div className="subpage-wrap">
      <TopBar title={letter?.status === 'opened' ? '편지' : '잠긴 편지'} onBack={back} />
      <div className="subpage-body">
        {loading ? (
          <div className="text-muted">불러오는 중...</div>
        ) : !letter ? (
          <div className="empty-state">
            <div className="empty-icon">❓</div>
            <div className="empty-text">편지를 찾을 수 없어요</div>
          </div>
        ) : letter.status === 'opened' ? (
          <>
            <div className="receiver-card" style={{ marginBottom: 16 }}>
              <div className="receiver-avatar">🐰</div>
              <div>
                <div className="receiver-label">보낸 사람</div>
                <div className="receiver-name">{letter.sender_username ?? '익명의 누군가'}</div>
              </div>
            </div>
            <div className="letter-content-box">{letter.content}</div>
            <div className="text-muted">
              {fmt(letter.created_at)} 도착
              {letter.opened_at && ` · ${fmt(letter.opened_at)} 열람`}
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', padding: '44px 20px 32px' }}>
              <div style={{ fontSize: 72, marginBottom: 16 }}>
                {status.can_open > 0 ? '📩' : '🔒'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                {status.can_open > 0 ? '지금 열 수 있어요!' : '아직 열 수 없어요'}
              </div>
              <div className="text-muted">
                {status.can_open > 0
                  ? `열람권 ${status.can_open}개 보유 중`
                  : status.sent_today > 0
                    ? '편지를 보내면 열람권이 생겨요'
                    : '오늘 편지를 먼저 보내야 해요'}
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {status.can_open > 0 ? (
              <button className="btn btn-primary btn-full" onClick={handleOpen} disabled={opening}>
                {opening ? '여는 중...' : '📬 편지 열기'}
              </button>
            ) : (
              <button
                className="btn btn-secondary btn-full"
                onClick={() => navigate(`/channel/${id}/members`)}
              >
                편지 보내러 가기
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
