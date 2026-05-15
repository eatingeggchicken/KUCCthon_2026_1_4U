import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import BottomTabBar from './BottomTabBar';

/**
 * 하단 탭 바가 있는 채널 페이지 래퍼.
 * TopBar는 각 페이지가 직접 렌더링한다.
 * channel-body 가 스크롤 컨테이너이고, TopBar는 그 안에 포함된다.
 */
export default function Layout() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (id) localStorage.setItem('currentChannelId', id);
  }, [id]);

  const channelId = id ?? localStorage.getItem('currentChannelId') ?? '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
        <Outlet />
        {/* page padding 아래 탭 바 높이만큼 여백 */}
        <div style={{ height: 'var(--bottom-tab-h)' }} />
      </div>
      <BottomTabBar key={channelId} />
    </div>
  );
}
