import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(username, password);
      if (res.error) { setError(res.error); return; }
      localStorage.setItem('token', res.token);
      localStorage.setItem('username', res.username);
      const next = sessionStorage.getItem('loginNext') || '/';
      sessionStorage.removeItem('loginNext');
      navigate(next);
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">✉️</div>
        <div className="auth-title">로그인</div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">아이디</label>
            <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="사용자 이름" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호" />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="auth-footer">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
