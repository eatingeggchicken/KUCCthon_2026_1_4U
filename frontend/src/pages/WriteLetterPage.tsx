import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import TopBar from '../components/TopBar';

export default function WriteLetterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const groupId = Number(id);
  const receiverId = Number(searchParams.get('receiverId'));
  const receiverName = searchParams.get('receiverName') ?? '상대방';

  const [isAnonymous, setIsAnonymous] = useState(true);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!localStorage.getItem('token')) { navigate('/login'); return null; }
  if (!receiverId) { navigate(`/channel/${id}/members`); return null; }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!content.trim()) { setError('내용을 입력하세요.'); return; }
    setLoading(true);
    try {
      const res = await api.sendLetter(groupId, receiverId, content.trim(), isAnonymous);
      if (res.error) { setError(res.error); return; }
      navigate(`/channel/${id}/inbox`);
    } catch {
      setError('편지를 보내는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="subpage-wrap">
      <TopBar title="편지 보내기" onBack={true} />
      <div className="subpage-body">
        <div className="receiver-card">
          <div className="receiver-avatar">🐰</div>
          <div>
            <div className="receiver-label">받는 사람</div>
            <div className="receiver-name">{receiverName}</div>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">보내는 방식</label>
            {/* TODO: 백엔드 is_anonymous 지원 후 실제 적용 */}
            <label
              className="radio-option"
              style={!isAnonymous ? { borderColor: 'var(--accent)', background: 'var(--accent-light)' } : {}}
              onClick={() => setIsAnonymous(false)}
            >
              <input type="radio" name="anon" checked={!isAnonymous} onChange={() => setIsAnonymous(false)} />
              <div className="radio-option-text">
                <strong>실명으로 보내기</strong>
                <span>내 닉네임이 공개돼요</span>
              </div>
            </label>
            <label
              className="radio-option"
              style={isAnonymous ? { borderColor: 'var(--accent)', background: 'var(--accent-light)' } : {}}
              onClick={() => setIsAnonymous(true)}
            >
              <input type="radio" name="anon" checked={isAnonymous} onChange={() => setIsAnonymous(true)} />
              <div className="radio-option-text">
                <strong>익명으로 보내기</strong>
                <span>닉네임이 공개되지 않아요</span>
              </div>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">편지 내용</label>
            <textarea
              className="form-textarea"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="고마운 마음을 전해보세요. ✉️"
              rows={6}
              maxLength={300}
            />
            <div className="input-count">{content.length} / 300</div>
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading || !content.trim()}>
            {loading ? '보내는 중...' : '편지 보내기'}
          </button>
        </form>
      </div>
    </div>
  );
}
