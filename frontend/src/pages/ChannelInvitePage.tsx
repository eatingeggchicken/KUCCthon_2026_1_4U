import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api, Group } from '../api';
import TopBar from '../components/TopBar';

export default function ChannelInvitePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [group, setGroup] = useState<Group | null>(location.state?.group ?? null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!group && id) {
      api.getGroups().then(groups => {
        const found = groups.find(g => g.group_id === Number(id));
        if (found) setGroup(found);
      });
    }
  }, [id, group]);

  if (!group) {
    return (
      <div className="subpage-wrap">
        <TopBar title="" onBack={true} />
        <div className="subpage-body text-muted">불러오는 중...</div>
      </div>
    );
  }

  const inviteUrl = `${window.location.origin}/join/${group.invite_code}`;

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="subpage-wrap">
      <TopBar title="" onBack={true} />
      <div className="subpage-body">
        <h1 className="page-title" style={{ marginBottom: 6 }}>채널이 생성되었어요!</h1>
        <p className="page-subtitle">초대 링크를 공유하고 함께 감사를 나눠보세요.</p>

        <div className="channel-card">
          <div className="channel-card-name">{group.group_name}</div>
          <div className="channel-card-desc">오늘 함께한 사람들에게 고마운 마음을 남겨보세요.</div>
        </div>

        <div className="section-label">초대 링크</div>
        <div className="invite-row">
          <span className="invite-link">{inviteUrl}</span>
          <button className="copy-btn" onClick={handleCopy} title="복사">
            {copied ? '✓' : '📋'}
          </button>
        </div>
        {copied && <p className="text-muted mt-8">링크가 복사되었어요!</p>}

        <div className="qr-wrap">
          <img src={`/api/groups/${group.invite_code}/qr`} alt="QR코드" />
        </div>
        <p className="text-muted text-center mb-24" style={{ fontSize: 13 }}>이 QR코드를 공유해보세요!</p>

        <button
          className="btn btn-primary btn-full"
          onClick={() => {
            localStorage.setItem('currentChannelId', String(group.group_id));
            navigate(`/channel/${group.group_id}`);
          }}
        >
          채널로 이동하기
        </button>
      </div>
    </div>
  );
}
