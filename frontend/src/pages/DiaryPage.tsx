import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, DiaryEntry } from '../api';
import TopBar from '../components/TopBar';

const MOODS = ['😊', '🥰', '🤗', '😌', '🙏', '💪', '✨', '🌱'];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function groupByDate(entries: DiaryEntry[]) {
  const map: Record<string, DiaryEntry[]> = {};
  entries.forEach(e => {
    const d = e.created_at.slice(0, 10);
    if (!map[d]) map[d] = [];
    map[d].push(e);
  });
  return map;
}

export default function DiaryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const groupId = Number(id);

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState('😊');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    api.getDiary(groupId)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [groupId, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!content.trim()) { setError('내용을 입력하세요.'); return; }
    setSaving(true);
    try {
      const res = await api.createDiary(groupId, content.trim(), mood);
      if (res.error) { setError(res.error); return; }
      const newEntry: DiaryEntry = {
        diary_id: res.diary_id!,
        group_id: groupId,
        content: content.trim(),
        mood,
        created_at: new Date().toISOString(),
      };
      setEntries(prev => [newEntry, ...prev]);
      setContent('');
      setMood('😊');
      setShowForm(false);
    } catch {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  const grouped = groupByDate(entries);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="subpage-wrap">
      <TopBar title="감사 일기" onBack={true} />
      <div className="subpage-body">

        {/* 새 일기 작성 폼 */}
        {showForm ? (
          <div className="write-diary-form">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>오늘의 감사 기록</span>
              <button
                onClick={() => { setShowForm(false); setError(''); }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18 }}
              >×</button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>기분</div>
              <div className="mood-picker">
                {MOODS.map(m => (
                  <button key={m} className={`mood-btn${mood === m ? ' selected' : ''}`} onClick={() => setMood(m)} type="button">
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">오늘 감사한 일</label>
                <textarea
                  className="form-textarea"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="오늘 감사한 일을 적어보세요 ✨"
                  rows={5}
                  maxLength={500}
                  autoFocus
                />
                <div className="input-count">{content.length} / 500</div>
              </div>
              <button className="btn btn-primary btn-full" type="submit" disabled={saving || !content.trim()}>
                {saving ? '저장 중...' : '저장하기'}
              </button>
            </form>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-full"
            style={{ marginBottom: 24 }}
            onClick={() => setShowForm(true)}
          >
            ✏️ 오늘의 감사 기록하기
          </button>
        )}

        {/* 일기 목록 */}
        {loading ? (
          <div className="text-muted">불러오는 중...</div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📔</div>
            <div className="empty-text">아직 감사 일기가 없어요</div>
            <div className="empty-sub">오늘 받은 따뜻한 마음들을 기록해보세요</div>
          </div>
        ) : (
          dates.map(date => (
            <div key={date}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em', marginBottom: 8 }}>
                {fmtDate(date + 'T00:00:00')}
              </div>
              {grouped[date].map(entry => (
                <div key={entry.diary_id} className="diary-entry">
                  <div className="diary-entry-header">
                    <span className="diary-mood">{entry.mood}</span>
                    <span className="diary-date">{fmtTime(entry.created_at)}</span>
                  </div>
                  <div className="diary-content">{entry.content}</div>
                </div>
              ))}
            </div>
          ))
        )}

      </div>
    </div>
  );
}
