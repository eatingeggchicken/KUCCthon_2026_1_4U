import { NavLink } from 'react-router-dom';

export default function BottomTabBar() {
  const channelId = localStorage.getItem('currentChannelId') || '';

  const tabs = [
    { to: `/channel/${channelId}`, end: true, icon: '🏠', label: '홈' },
    { to: `/channel/${channelId}/inbox`, end: false, icon: '✉️', label: '받은편지함' },
    { to: `/channel/${channelId}/outbox`, end: false, icon: '📤', label: '보낸편지함' },
    { to: '/me', end: false, icon: '👤', label: '내정보' },
  ];

  const cls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'tab-item active' : 'tab-item';

  return (
    <nav className="bottom-tab-bar">
      {tabs.map(t => (
        <NavLink key={t.to} to={t.to} end={t.end} className={cls}>
          <span className="tab-icon">{t.icon}</span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
