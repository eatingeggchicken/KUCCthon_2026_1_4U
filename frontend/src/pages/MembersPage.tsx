import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Member } from '../api';
import TopBar from '../components/TopBar';

export default function MembersPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const groupId = Number(id);
  const myUsername = localStorage.getItem('username') ?? '';

  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    api.getGroupMembers(groupId)
      .then(setMembers)
      .finally(() => setLoading(false));
  }, [groupId, navigate]);

  const filtered = members.filter(m =>
    m.username.toLowerCase().includes(query.toLowerCase())
  );
  const me = filtered.find(m => m.username === myUsername);
  const others = filtered.filter(m => m.username !== myUsername);
  const displayList = me ? [me, ...others] : others;

  return (
    <div className="subpage-wrap">
      <TopBar title="멤버 목록" onBack={true} />
      <div className="subpage-body">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="닉네임 검색"
          />
        </div>
        <div className="member-count-label">총 {members.length}명의 멤버</div>

        {loading ? (
          <div className="text-muted">불러오는 중...</div>
        ) : displayList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-text">검색 결과가 없어요</div>
          </div>
        ) : (
          displayList.map(m => (
            <div key={m.user_id} className="member-row">
              <div className="member-avatar">🐰</div>
              <span className="member-name">
                {m.username}
                {m.username === myUsername && (
                  <span className="text-muted" style={{ fontSize: 12, marginLeft: 6 }}>(나)</span>
                )}
              </span>
              {m.username !== myUsername && (
                <button
                  className="btn-send-letter"
                  onClick={() => navigate(`/channel/${id}/write?receiverId=${m.user_id}&receiverName=${encodeURIComponent(m.username)}`)}
                >
                  편지 보내기
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
