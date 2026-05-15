import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
    setLoading(true);
    try {
      const res = await api.register(username, password);
      if (res.error) { setError(res.error); return; }
      localStorage.setItem('token', res.token);
      localStorage.setItem('username', res.username);
      const next = sessionStorage.getItem('loginNext') || '/';
      sessionStorage.removeItem('loginNext');
      navigate(next);
    } catch {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">✉️</div>
        <div className="auth-title">회원가입</div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">아이디</label>
            <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="사용자 이름" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호 (6자 이상)</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호" />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <div className="auth-footer">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
}
