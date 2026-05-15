import { NavLink } from 'react-router-dom';
import Icon from './Icon';

export default function BottomTabBar() {
  const channelId = localStorage.getItem('currentChannelId') || '';

  const tabs = [
    { to: `/channel/${channelId}`, end: true,  icon: <Icon name="house"   size={22} />, label: '홈' },
    { to: `/channel/${channelId}/letters`, end: false, icon: <Icon name="mail"    size={22} />, label: '편지함' },
    { to: `/channel/${channelId}/write`,   end: false, icon: <Icon name="pencil"  size={22} />, label: '편지쓰기' },
    { to: '/me',                           end: false, icon: <Icon name="user"    size={22} />, label: '내정보' },
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
