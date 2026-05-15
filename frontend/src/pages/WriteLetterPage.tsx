import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api, Member } from '../api';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';

type Step = 'select' | 'write' | 'done';

export default function WriteLetterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const groupId = Number(id);
  const myUsername = localStorage.getItem('username') ?? '';

  const urlReceiverId = searchParams.get('receiverId');
  const urlReceiverName = searchParams.get('receiverName') ?? '상대방';

  const [step, setStep] = useState<Step>(urlReceiverId ? 'write' : 'select');
  const [selectedMember, setSelectedMember] = useState<Member | null>(
    urlReceiverId
      ? { user_id: Number(urlReceiverId), username: urlReceiverName, joined_at: '' }
      : null
  );

  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState('');
  const [membersLoading, setMembersLoading] = useState(false);

  const [isAnonymous, setIsAnonymous] = useState(true);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    if (!groupId) {
      navigate('/me', { state: { error: '참여 중인 채널이 없어요. 채널을 추가해주세요.' } });
      return;
    }
    if (step === 'select') {
      setMembersLoading(true);
      api.getGroupMembers(groupId)
        .then(setMembers)
        .finally(() => setMembersLoading(false));
    }
  }, [step, groupId, navigate]);

  const filteredMembers = members.filter(m =>
    m.username !== myUsername &&
    m.username.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelectMember(member: Member) {
    setSelectedMember(member);
    setContent('');
    setError('');
    setIsAnonymous(true);
    setStep('write');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!content.trim()) { setError('내용을 입력하세요.'); return; }
    if (!selectedMember) return;
    setSending(true);
    try {
      const res = await api.sendLetter(groupId, selectedMember.user_id, content.trim(), isAnonymous);
      if (res.error) { setError(res.error); return; }
      setStep('done');
    } catch {
      setError('편지를 보내는 중 오류가 발생했습니다.');
    } finally {
      setSending(false);
    }
  }

  function handleReset() {
    setSelectedMember(null);
    setContent('');
    setError('');
    setIsAnonymous(true);
    setQuery('');
    setStep('select');
  }

  if (step === 'select') {
    return (
      <div className="subpage-wrap" style={{ minHeight: 'auto' }}>
        <TopBar title="편지 보내기" />
        <div className="subpage-body">
          <div className="search-input-wrap">
            <span className="search-icon"><Icon name="search" size={15} /></span>
            <input
              className="search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="닉네임 검색"
            />
          </div>

          {membersLoading ? (
            <div className="text-muted">불러오는 중...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Icon name="search-x" size={48} /></div>
              <div className="empty-text">
                {query ? '검색 결과가 없어요' : '편지를 보낼 멤버가 없어요'}
              </div>
            </div>
          ) : (
            filteredMembers.map(m => (
              <div key={m.user_id} className="member-row">
                <div className="member-avatar"><Icon name="rabbit" size={20} /></div>
                <span className="member-name">{m.username}</span>
                <button className="btn-send-letter" onClick={() => handleSelectMember(m)}>
                  선택
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="subpage-wrap" style={{ minHeight: 'auto' }}>
        <TopBar title="편지 쓰기" />
        <div className="subpage-body" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 24, color: 'var(--accent)' }}><Icon name="mail" size={64} /></div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            편지가 전달됐어요
          </div>
          <div className="text-muted" style={{ marginBottom: 40 }}>
            {selectedMember?.username}님에게 따뜻한 마음이 전해졌어요
          </div>
          <button className="btn btn-primary btn-full" onClick={handleReset} style={{ marginBottom: 12 }}>
            다른 편지 보내기
          </button>
          <button className="btn btn-secondary btn-full" onClick={() => navigate(`/channel/${id}/letters`)}>
            편지함으로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subpage-wrap" style={{ minHeight: 'auto' }}>
      <TopBar
        title="편지 쓰기"
        onBack={urlReceiverId ? undefined : () => setStep('select')}
      />
      <div className="subpage-body">
        <div className="receiver-card">
          <div className="receiver-avatar"><Icon name="rabbit" size={20} /></div>
          <div>
            <div className="receiver-label">받는 사람</div>
            <div className="receiver-name">{selectedMember?.username ?? '상대방'}</div>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">보내는 방식</label>
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
              rows={8}
              maxLength={300}
            />
            <div className="input-count">{content.length} / 300</div>
          </div>

          <button
            className="btn btn-primary btn-full"
            type="submit"
            disabled={sending || !content.trim()}
          >
            {sending ? '보내는 중...' : '편지 보내기'}
          </button>
        </form>
      </div>
    </div>
  );
}
