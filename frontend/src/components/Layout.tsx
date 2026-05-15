import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-item active' : 'nav-item';

  return (
    <div style={{ display: 'flex' }}>
      <nav className="sidebar">
        <div className="sidebar-logo">✉️ 고마움 우체통</div>
        <div className="sidebar-nav">
          <NavLink to="/" end className={navClass}>🏠 홈</NavLink>
          <NavLink to="/inbox" className={navClass}>📬 메일함</NavLink>
          <NavLink to="/write" className={navClass}>✏️ 편지쓰기</NavLink>
          <NavLink to="/groups" className={navClass}>👥 그룹</NavLink>
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-user">👤 {username}</div>
          <button className="logout-btn" onClick={logout}>로그아웃</button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
