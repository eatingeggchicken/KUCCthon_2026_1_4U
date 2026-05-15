import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import TopBar from '../components/TopBar';

export default function CreateChannelPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!localStorage.getItem('token')) {
    sessionStorage.setItem('loginNext', '/create-channel');
    navigate('/login');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('채널 이름을 입력하세요.'); return; }
    setLoading(true);
    try {
      const res = await api.createGroup(name.trim());
      if (res.error) { setError(res.error); return; }
      navigate(`/channel/${res.group_id}/invite`, { state: { group: res } });
    } catch {
      setError('채널 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="subpage-wrap">
      <TopBar title="" onBack={true} />
      <div className="subpage-body">
        <h1 className="page-title">새 채널 만들기</h1>
        <p className="page-subtitle">함께 감사의 마음을 나눌 채널을 만들어보세요.</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">채널 이름</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="예) 쥬씨톤 2026"
              maxLength={30}
              autoFocus
            />
          </div>
          <button className="btn btn-primary btn-full mt-24" type="submit" disabled={loading || !name.trim()}>
            {loading ? '생성 중...' : '채널 만들기'}
          </button>
        </form>
      </div>
    </div>
  );
}
