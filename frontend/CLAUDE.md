# 고마움 우체통 — 프론트엔드 작업 가이드

## 프로젝트 개요

채널 기반 감사 편지 모바일 웹앱.  
같은 채널에 속한 사람들끼리 익명 또는 실명으로 감사 편지를 보내고,  
편지를 보내면 열람권이 생겨 익명 발신자를 확인할 수 있는 서비스.

**핵심 컨셉**:

```
편지를 보내면 열람권 +1  →  열람권 사용하면 익명 발신자 공개
```

**구현 방향**: 모바일 웹앱 (max-width 430px 중앙 정렬, 하단 탭 바, 모노톤 디자인)

---

## 기술 스택

- **프레임워크**: React 18 + Vite 5
- **라우팅**: React Router v6
- **스타일링**: CSS (index.css, 커스텀 클래스 기반 — Tailwind 없음)
- **상태관리**: useState + localStorage (전역 상태 라이브러리 없음)
- **인증**: JWT — localStorage에 `token`, `username` 저장
- **API 통신**: fetch + `/frontend/src/api.ts` 중앙 관리
- **개발 서버**: `localhost:5173` → `/api` 프록시 → `localhost:3000`

---

## 폴더 구조 (목표)

```
frontend/src/
├── api.ts
├── App.tsx
├── main.tsx
├── index.css
├── components/
│   ├── BottomTabBar.tsx     하단 탭 바 (홈·받은편지함·보낸편지함·내정보)
│   ├── TopBar.tsx           상단 헤더 (채널명·햄버거·알림)
│   └── RevealModal.tsx      익명 발신자 확인 모달 2종
└── pages/
    ├── LandingPage.tsx          ① 시작 페이지
    ├── LoginPage.tsx            (기존 유지)
    ├── SignupPage.tsx           (기존 유지)
    ├── CreateChannelPage.tsx    ② 채널 생성
    ├── ChannelInvitePage.tsx    ③ 초대/공유 (QR + 링크)
    ├── ChannelJoinPage.tsx      ④ 채널 입장 (닉네임 + 표시방식 선택)
    ├── ChannelHomePage.tsx      ⑤ 채널 메인 홈
    ├── MembersPage.tsx          ⑥ 멤버 목록
    ├── WriteLetterPage.tsx      ⑦ 편지 작성 (익명/실명 선택)
    ├── InboxPage.tsx            ⑧ 받은 편지함 (탭: 전체/실명/익명)
    ├── OutboxPage.tsx           ⑪ 보낸 편지함 (탭: 전체/실명/익명)
    └── MyInfoPage.tsx           ⑫ 내 정보
```

---

## 라우트 구조

### 비인증 (로그인 불필요)

| 경로 | 컴포넌트 | 상태 |
|------|----------|------|
| `/` | LandingPage | ❌ 미구현 |
| `/login` | LoginPage | ✅ 구현됨 |
| `/signup` | SignupPage | ✅ 구현됨 |
| `/create-channel` | CreateChannelPage | ❌ 미구현 |
| `/channel/:id/invite` | ChannelInvitePage | ❌ 미구현 |
| `/join/:inviteCode` | ChannelJoinPage | ❌ 미구현 |

### 인증 필요 (채널 내 — 하단 탭 컨텍스트)

| 경로 | 컴포넌트 | 탭 | 상태 |
|------|----------|----|------|
| `/channel/:id` | ChannelHomePage | 홈 | ❌ 미구현 |
| `/channel/:id/inbox` | InboxPage | 받은편지함 | ⚠️ 수정 필요 |
| `/channel/:id/outbox` | OutboxPage | 보낸편지함 | ❌ 미구현 |
| `/me` | MyInfoPage | 내정보 | ❌ 미구현 |
| `/channel/:id/members` | MembersPage | (탭 외) | ❌ 미구현 |
| `/channel/:id/write` | WriteLetterPage | (탭 외) | ⚠️ 수정 필요 |

### 제거 예정 라우트 (이전 구현)

| 경로 | 이유 |
|------|------|
| `/` (MainPage) | LandingPage + ChannelHomePage로 분리 |
| `/inbox` | `/channel/:id/inbox`로 이동 |
| `/inbox/:letter_id` | InboxPage 내 모달로 통합 |
| `/write` | `/channel/:id/write`로 이동 |
| `/groups` | CreateChannel + ChannelJoin + MyInfo로 흡수 |

---

## 하단 탭 바

채널 컨텍스트 안에서 모든 페이지에 표시.

| 탭 | 아이콘 | 이동 경로 |
|----|--------|---------|
| 홈 | 🏠 | `/channel/:id` |
| 받은편지함 | ✉️ | `/channel/:id/inbox` |
| 보낸편지함 | 📤 | `/channel/:id/outbox` |
| 내정보 | 👤 | `/me` |

---

## 페이지별 스펙

### ① 시작 페이지 `/`
- 로고 + 서비스 슬로건
- "채널 만들기" 버튼 → `/create-channel`
- "참여하기" 버튼 → 초대코드 입력 or QR 스캔
- 서비스 소개 링크

### ② 채널 생성 `/create-channel`
- 채널 이름 입력 (필수)
- 채널 설명 입력 (선택)
- 생성 후 → `/channel/:id/invite`

### ③ 초대/공유 `/channel/:id/invite`
- 채널명 표시
- 초대 링크 + 복사 버튼
- QR코드 (`<img src="/api/groups/:invite_code/qr">`)
- "채널로 이동하기" → `/channel/:id`

### ④ 채널 입장 `/join/:inviteCode`
- 채널명 표시
- 닉네임 입력 (최대 10자)
- 표시 방식 선택 라디오:
  - 닉네임으로 참여 (기본값)
  - 실명으로 참여
- 입장하기 → `/channel/:id`

### ⑤ 채널 홈 `/channel/:id`
- 상단: 채널명 TopBar
- 아바타 + 인사말 ("만반하세요, {username}님!")
- 통계 3개: 받은 편지 / 보낸 편지 / 열람권
- 버튼 3개: 편지 보내기 → `/channel/:id/members`, 받은 편지함, 멤버 목록

### ⑥ 멤버 목록 `/channel/:id/members`
- 닉네임 검색
- 총 N명의 멤버
- 멤버 카드 + "편지 보내기" 버튼 → `/channel/:id/write?receiverId=:uid`

### ⑦ 편지 작성 `/channel/:id/write`
- receiverId: URL 쿼리 파라미터 (`?receiverId=:uid`)
- 받는 사람 표시 (아바타 + 닉네임)
- **보내는 방식 선택 라디오**:
  - 실명으로 보내기 ("내 닉네임이 공개돼요")
  - 익명으로 보내기 ("닉네임이 공개되지 않아요") — 기본값
- 편지 내용 textarea (최대 300자)
- 편지 보내기 버튼

### ⑧ 받은 편지함 `/channel/:id/inbox`
- 탭: 전체 / 실명 / 익명
- 실명 편지: 발신자 아바타 + 이름 + 내용 미리보기
- 익명 편지: ? 아이콘 + "익명의 누군가" + 미리보기 + "NEW" 배지
  - 열람권 있을 때: "보낸 사람 확인하기 (열람권 1개 필요)" 버튼
  - 열람권 없을 때: 잠금 아이콘
  - 버튼 클릭 → RevealModal 표시

### ⑨⑩ RevealModal 컴포넌트
- **열람권 없음**: 자물쇠 아이콘, 안내 문구, 보유 열람권 0개, "감사 편지 보내러 가기" / "나중에 하기"
- **열람권 있음 (확인 완료)**: 하트 아이콘, "보낸 사람은 {username}님이었어요!" 문구, "확인" 버튼

### ⑪ 보낸 편지함 `/channel/:id/outbox`
- 탭: 전체 / 실명 / 익명
- 받는 사람 아바타 + 이름 + 내용 미리보기 + 실명/익명 배지

### ⑫ 내 정보 `/me`
- 아바타 + username + 표시방식 배지 ("채널 닉네임으로 참여 중" 등)
- 통계: 받은 편지 / 보낸 편지 / 열람권
- 메뉴 목록: 참여 중인 채널 / 알림 설정 / 도움말 / 로그아웃

---

## 실제 API 엔드포인트 (현재 백엔드 기준)

모든 인증 필요 요청: `Authorization: Bearer <token>` 헤더 필수.

### 인증

```
POST /api/auth/register   { username, password }  → { token, username }
POST /api/auth/login      { username, password }  → { token, username }
```

### 그룹

```
POST /api/groups                   { group_name }        → Group
POST /api/groups/join              { invite_code }       → { message, group }
GET  /api/groups                                         → Group[]
GET  /api/groups/:group_id/members                       → Member[]
GET  /api/groups/:invite_code/qr                         → image/png
```

### 편지

```
POST /api/letters/groups/:group_id  { receiver_id, content }  → { letter_id }
GET  /api/letters/inbox                                        → Letter[]
GET  /api/letters/outbox                                       → OutboxLetter[]
GET  /api/letters/today-status                                 → TodayStatus
POST /api/letters/:letter_id/open                              → Letter
```

---

## 백엔드 변경 요청 사항 (미반영)

아래 기능은 백엔드 추가 작업이 완료되어야 프론트 연동 가능.

| 기능 | 현재 백엔드 | 필요한 변경 |
|------|-----------|-----------|
| 편지 익명/실명 구분 | 항상 익명 | `letter.is_anonymous` 컬럼, 요청 시 필드 수신 |
| 익명 발신자 공개 | 없음 | `POST /api/letters/:id/reveal-sender` (credits 차감 후 sender 반환) |
| 열람권(revealCredits) | daily balance 방식 | 누적 credits — 편지 보내면 +1, 발신자 확인하면 -1 |
| 채널 입장 시 표시방식 | 없음 | `group_member.display_style` ('nickname'\|'realname'), join 시 전달 |
| 단일 채널 조회 | 없음 | `GET /api/groups/:group_id` 추가 |
| 채널별 inbox/outbox | 전체 조회만 | `?group_id=` 쿼리 파라미터 지원 |
| 실명 편지 발신자 | 항상 숨김 | 실명 편지인 경우 inbox에서 `sender_username` 포함 반환 |

---

## 현재 데이터 타입 (api.ts)

```typescript
interface Group {
  group_id: number;
  group_name: string;
  invite_code: string;
  created_by: number;
  created_at: string;
  member_count?: number;
}

interface Member {
  user_id: number;
  username: string;
  joined_at: string;
}

interface Letter {
  letter_id: number;
  group_id: number;
  content: string | null;  // pending이면 null
  created_at: string;
  opened_at: string | null;
  status: 'pending' | 'opened';
  // 추가 예정: is_anonymous, sender_username (실명일 때)
}

interface OutboxLetter {
  letter_id: number;
  group_id: number;
  receiver_id: number;
  receiver_username: string;
  content: string;
  created_at: string;
  open_at: string;
  opened_at: string | null;
  status: 'pending' | 'opened';
  // 추가 예정: is_anonymous
}

interface TodayStatus {
  sent_today: number;
  opened_today: number;
  can_open: number;
  // 추가 예정: reveal_credits (누적 열람권 수)
}
```

---

## 디자인 시스템

- **레이아웃**: max-width 430px, `margin: 0 auto`, bottom tab bar 60px 여백
- **컬러**: 모노톤 (디자이너 시안 수령 전 임시) — 추후 디자이너 제공 시안으로 교체
- **현재 CSS 변수**: `index.css`의 `:root`에서 관리, 교체 시 변수만 수정

---

## 구현 완료 기능 (재사용 가능)

- [x] 회원가입 / 로그인 (LoginPage, SignupPage)
- [x] JWT 인증 가드
- [x] API 클라이언트 (`api.ts` — 타입 및 fetch 래퍼)
- [x] 편지 쓰기 기본 로직 (그룹·멤버 선택 → 발송)
- [x] 받은 편지함 목록
- [x] 편지 열기 (daily balance 방식 — revealCredits로 교체 예정)
- [x] 그룹 생성 / 초대코드 참여 / 멤버 목록 조회

---

## 미구현 목록

### 1순위 (구조 개편 — 백엔드 무관)
- [ ] 모바일 레이아웃 전환 (index.css 재작성 + Layout → BottomTabBar)
- [ ] 라우트 전면 재구성 (App.tsx)
- [ ] LandingPage (①)
- [ ] CreateChannelPage (②)
- [ ] ChannelInvitePage (③) — QR 포함
- [ ] ChannelJoinPage (④) — 닉네임+표시방식 UI (백엔드 연동 전 UI만)
- [ ] ChannelHomePage (⑤) — 기존 MainPage 리팩토링
- [ ] MembersPage (⑥)
- [ ] MyInfoPage (⑫) — 기본 정보 + 로그아웃

### 2순위 (백엔드 변경 후 연동)
- [ ] WriteLetterPage 수정 — is_anonymous 라디오 추가 (⑦)
- [ ] InboxPage 수정 — 탭 전체/실명/익명 + RevealModal 연결 (⑧)
- [ ] RevealModal 컴포넌트 — 열람권 없음 / 있음 2종 (⑨⑩)
- [ ] OutboxPage (⑪)
- [ ] revealCredits 연동 (ChannelHomePage 통계, InboxPage 버튼 활성화)

### 3순위
- [ ] 멤버 검색 기능 (MembersPage)
- [ ] 알림 설정 (MyInfoPage)
- [ ] 애니메이션 / 디자이너 시안 적용

---

## 코딩 컨벤션

- 컴포넌트: `PascalCase`, 파일명 동일
- API 호출: `api.ts`의 `api` 객체만 사용
- 인증: `localStorage.getItem('token')` / `localStorage.getItem('username')`
- 현재 채널 ID: URL 파라미터 (`useParams`) 또는 localStorage `currentChannelId`로 관리
- 에러 표시: `<div className="error-msg">`, 성공: `<div className="success-msg">`
- 로딩: `<div className="text-muted">불러오는 중...</div>`
- 날짜: `new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })`

---

## 알려진 버그 (백엔드 — 수정 완료)

**JWT_SECRET 불일치**: `routes/auth.ts`와 `middleware/auth.ts`의 fallback 값이 달랐음.  
→ `routes/auth.ts`를 `'MAIL_BOX_SECRET_KEY'`로 통일 완료.

---

## 데모 시나리오

1. 시작 페이지 → "채널 만들기" → 채널명 입력 → 초대 링크/QR 생성
2. 다른 유저가 QR 스캔 → 닉네임 입력 + 표시방식 선택 → 채널 입장
3. 멤버 목록에서 상대 선택 → 익명으로 편지 전송
4. 받은 사람 → 받은 편지함 → 익명 편지 확인 → 열람권 없음 모달
5. 편지 보내기 → 열람권 +1 → 다시 확인 → 발신자 공개
