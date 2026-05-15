import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  onBack?: (() => void) | true;
  right?: React.ReactNode;
}

export default function TopBar({ title, onBack, right }: Props) {
  const navigate = useNavigate();
  const handleBack = onBack === true ? () => navigate(-1) : onBack;

  return (
    <div className="top-bar">
      <div className="top-bar-side">
        {handleBack ? (
          <button className="icon-btn" onClick={handleBack} aria-label="뒤로">
            ←
          </button>
        ) : (
          <button className="icon-btn" aria-label="메뉴">☰</button>
        )}
      </div>
      <div className="top-bar-title">{title}</div>
      <div className="top-bar-side">
        {right ?? null}
      </div>
    </div>
  );
}
