import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Group, Member } from '../api';

export default function WriteLetterPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const myUsername = localStorage.getItem('username');

  useEffect(() => {
    api.getGroups().then(setGroups);
  }, []);

  async function handleGroupChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const gid = Number(e.target.value);
    setSelectedGroup(gid || null);
    setSelectedMember(null);
    setMembers([]);
    if (!gid) return;
    setLoadingMembers(true);
    try {
      const m = await api.getGroupMembers(gid);
      setMembers(m);
    } finally {
      setLoadingMembers(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedGroup) { setError('그룹을 선택하세요.'); return; }
    if (!selectedMember) { setError('받는 사람을 선택하세요.'); return; }
    if (!content.trim()) { setError('내용을 입력하세요.'); return; }
    setLoading(true);
    try {
      const res = await api.sendLetter(selectedGroup, selectedMember, content);
      if (res.error) { setError(res.error); return; }
      setSuccess('편지가 익명으로 전달되었어요! 이제 받은 편지를 하나 열 수 있어요.');
      setContent('');
      setSelectedMember(null);
    } catch {
      setError('편지를 보내는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const otherMembers = members.filter(m => m.username !== myUsername);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">✏️ 편지 쓰기</h1>
        <p className="page-subtitle">감사한 마음을 익명으로 전해보세요</p>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && (
        <div className="success-msg">
          {success}
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 12 }} onClick={() => navigate('/inbox')}>
            메일함 보기
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 그룹 선택 */}
        <div className="form-group">
          <label className="form-label">그룹 선택</label>
          {groups.length === 0 ? (
            <div className="text-muted">
              속한 그룹이 없어요.{' '}
              <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate('/groups')}>
                그룹 참여하기
              </span>
            </div>
          ) : (
            <select className="form-select" onChange={handleGroupChange} defaultValue="">
              <option value="" disabled>그룹을 선택하세요</option>
              {groups.map(g => (
                <option key={g.group_id} value={g.group_id}>
                  {g.group_name} ({g.member_count}명)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 받는 사람 선택 */}
        {selectedGroup !== null && (
          <div className="form-group">
            <label className="form-label">받는 사람</label>
            {loadingMembers ? (
              <div className="text-muted">불러오는 중...</div>
            ) : otherMembers.length === 0 ? (
              <div className="text-muted">보낼 수 있는 멤버가 없어요 (나 혼자뿐이에요)</div>
            ) : (
              <div className="flex flex-col gap-4">
                {otherMembers.map(m => (
                  <div
                    key={m.user_id}
                    className={`member-item${selectedMember === m.user_id ? ' selected' : ''}`}
                    onClick={() => setSelectedMember(m.user_id)}
                  >
                    <span style={{ fontSize: 20 }}>👤</span>
                    <span style={{ fontSize: 14, fontWeight: selectedMember === m.user_id ? 600 : 400 }}>
                      {m.username}
                    </span>
                    {selectedMember === m.user_id && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 내용 */}
        {selectedMember !== null && (
          <div className="form-group">
            <label className="form-label">
              내용 <span className="text-muted">(익명으로 전달됩니다)</span>
            </label>
            <textarea
              className="form-textarea"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="고마운 마음을 자유롭게 써주세요..."
              maxLength={1000}
            />
            <div className="text-muted" style={{ textAlign: 'right', marginTop: 4 }}>
              {content.length} / 1000
            </div>
          </div>
        )}

        {selectedMember !== null && (
          <button className="btn btn-primary btn-full" type="submit" disabled={loading || !content.trim()}>
            {loading ? '보내는 중...' : '✉️ 익명으로 보내기'}
          </button>
        )}
      </form>
    </div>
  );
}
