import { useEffect, useState } from 'react';
import { api, Group, Member } from '../api';

export default function GroupPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selected, setSelected] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => { api.getGroups().then(setGroups); }, []);

  async function selectGroup(g: Group) {
    setSelected(g);
    setMembers([]);
    setLoadingMembers(true);
    try {
      setMembers(await api.getGroupMembers(g.group_id));
    } finally {
      setLoadingMembers(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    if (!createName.trim()) { setCreateError('그룹 이름을 입력하세요.'); return; }
    setCreateLoading(true);
    try {
      const res = await api.createGroup(createName.trim());
      if (res.error) { setCreateError(res.error); return; }
      const updated = await api.getGroups();
      setGroups(updated);
      setCreateName('');
      selectGroup(res);
    } catch {
      setCreateError('그룹 생성 중 오류가 발생했습니다.');
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinError('');
    setJoinSuccess('');
    if (!joinCode.trim()) { setJoinError('초대 코드를 입력하세요.'); return; }
    setJoinLoading(true);
    try {
      const res = await api.joinGroup(joinCode.trim().toUpperCase());
      if (res.error) { setJoinError(res.error); return; }
      setJoinSuccess(`"${res.group?.group_name}" 그룹에 참여했어요!`);
      setJoinCode('');
      const updated = await api.getGroups();
      setGroups(updated);
    } catch {
      setJoinError('그룹 참여 중 오류가 발생했습니다.');
    } finally {
      setJoinLoading(false);
    }
  }

  const inviteUrl = selected
    ? `${window.location.origin}/join/${selected.invite_code}`
    : '';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👥 그룹</h1>
        <p className="page-subtitle">그룹 안에서 편지를 주고받아요</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* 왼쪽: 그룹 목록 + 생성/참여 */}
        <div>
          <div className="section-title">내 그룹</div>
          {groups.length === 0 ? (
            <div className="text-muted mb-16">아직 속한 그룹이 없어요</div>
          ) : (
            <div className="flex flex-col gap-8 mb-16">
              {groups.map(g => (
                <div
                  key={g.group_id}
                  className={`group-card${selected?.group_id === g.group_id ? ' selected' : ''}`}
                  onClick={() => selectGroup(g)}
                >
                  <div className="group-name">{g.group_name}</div>
                  <div className="group-meta">멤버 {g.member_count}명 · {g.invite_code}</div>
                </div>
              ))}
            </div>
          )}

          <div className="divider" />

          {/* 그룹 생성 */}
          <div className="section-title">그룹 만들기</div>
          {createError && <div className="error-msg">{createError}</div>}
          <form onSubmit={handleCreate} className="flex gap-8 mb-20">
            <input
              className="form-input"
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              placeholder="그룹 이름"
            />
            <button className="btn btn-primary" type="submit" disabled={createLoading} style={{ whiteSpace: 'nowrap' }}>
              {createLoading ? '...' : '생성'}
            </button>
          </form>

          {/* 초대 코드로 참여 */}
          <div className="section-title">코드로 참여</div>
          {joinError   && <div className="error-msg">{joinError}</div>}
          {joinSuccess && <div className="success-msg">{joinSuccess}</div>}
          <form onSubmit={handleJoin} className="flex gap-8">
            <input
              className="form-input"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="초대 코드 (예: AB12CD34)"
              maxLength={8}
              style={{ fontFamily: 'monospace', letterSpacing: 2 }}
            />
            <button className="btn btn-secondary" type="submit" disabled={joinLoading} style={{ whiteSpace: 'nowrap' }}>
              {joinLoading ? '...' : '참여'}
            </button>
          </form>
        </div>

        {/* 오른쪽: 선택된 그룹 상세 */}
        <div>
          {selected ? (
            <>
              <div className="section-title">{selected.group_name}</div>

              {/* 초대 URL */}
              <div className="card mb-16">
                <div className="text-muted mb-8" style={{ fontSize: 12 }}>초대 링크 (공유용)</div>
                <div className="invite-box mb-8">{inviteUrl}</div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { navigator.clipboard.writeText(inviteUrl); }}
                >
                  링크 복사
                </button>
                <span className="text-muted" style={{ marginLeft: 10, fontSize: 12 }}>
                  코드: <strong style={{ letterSpacing: 2 }}>{selected.invite_code}</strong>
                </span>
              </div>

              {/* 멤버 목록 */}
              <div className="card">
                <div className="text-muted mb-12" style={{ fontSize: 12 }}>
                  멤버 {members.length}명
                </div>
                {loadingMembers ? (
                  <div className="text-muted">불러오는 중...</div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {members.map(m => (
                      <div key={m.user_id} className="flex items-center gap-8" style={{ padding: '6px 0' }}>
                        <span>👤</span>
                        <span style={{ fontSize: 14 }}>{m.username}</span>
                        <span className="text-muted" style={{ marginLeft: 'auto', fontSize: 12 }}>
                          {new Date(m.joined_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👈</div>
              <div>그룹을 선택하면 상세 정보가 보여요</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
