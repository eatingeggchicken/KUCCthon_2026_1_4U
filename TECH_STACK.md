# 기술 스택 (Tech Stack)

## 서비스 개요

채널 기반 익명/실명 감사 편지 모바일 웹앱 — **고마움 우체통**

---

## 인프라

| 항목 | 선택 |
|------|------|
| 호스팅 | [Render](https://render.com) |
| 배포 방식 | 단일 서비스 (백엔드가 프론트 정적 파일 서빙) |
| 환경변수 관리 | Render 대시보드 + `dotenv` |

---

## 백엔드

| 항목 | 선택 | 버전 |
|------|------|------|
| 언어 | TypeScript | 5.3 |
| 런타임 | Node.js | — |
| 웹 프레임워크 | Express | 4.18 |
| 데이터베이스 | SQLite3 | Node.js 내장 (`node:sqlite`) |
| ORM/쿼리 | Raw SQL (`DatabaseSync`) | — |
| 인증 | JWT | `jsonwebtoken` 9.0 |
| 비밀번호 해싱 | bcryptjs | 2.4 |
| QR코드 생성 | qrcode | 1.5 |
| 환경변수 | dotenv | 17.4 |
| 개발 서버 | ts-node-dev | 2.0 |

### DB 스키마 요약

```
user           — 사용자 계정
group          — 채널
group_member   — 채널-사용자 매핑
letter         — 편지 (익명/실명, pending/opened)
```

---

## 프론트엔드

| 항목 | 선택 | 버전 |
|------|------|------|
| 언어 | TypeScript | 5.3 |
| UI 라이브러리 | React | 18.2 |
| 번들러 | Vite | 5.1 |
| 라우팅 | React Router | v6.22 |
| 스타일링 | Vanilla CSS (CSS 변수 기반) | — |
| 상태관리 | `useState` + `localStorage` | — |
| HTTP 클라이언트 | `fetch` API | — |

### 개발 환경 프록시

```
localhost:5173 (Vite dev server)
  └─ /api/* → localhost:3000 (Express)
```

### 프로덕션 서빙

Express가 `frontend/dist`를 정적 파일로 서빙

---

## 프로젝트 구조

```
KUCCthon_2026_1_4U/
├── backend/
│   ├── src/
│   │   ├── app.ts          Express 앱 엔트리포인트
│   │   ├── db.ts           SQLite 연결 및 스키마 초기화
│   │   ├── middleware/     JWT 인증 미들웨어
│   │   └── routes/         auth, groups, letters, diary
│   └── data/
│       └── app.db          SQLite DB 파일
└── frontend/
    └── src/
        ├── api.ts           API 클라이언트 (fetch 래퍼)
        ├── App.tsx          라우트 설정
        ├── index.css        전역 스타일
        ├── components/      BottomTabBar, TopBar, RevealModal
        └── pages/           페이지 컴포넌트
```

---

## 빌드 & 실행

```bash
# 개발
cd backend  && npm run dev   # ts-node-dev → localhost:3000
cd frontend && npm run dev   # Vite        → localhost:5173

# 프로덕션 빌드 (Render에서 자동 실행)
npm run build   # frontend build → backend build
npm start       # node backend/dist/app.js
```

---

## 주요 의존성 요약

```
Express 4  +  TypeScript 5  +  SQLite (node:sqlite)
React 18   +  Vite 5        +  React Router v6
JWT  +  bcryptjs  +  qrcode  +  dotenv
```
