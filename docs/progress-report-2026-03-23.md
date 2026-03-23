# 진행 보고서 (2026-03-23)

## 1. 오늘 목표

- `search / recommend / generate`의 현재 MVP 경로를 검증 가능한 상태로 마무리
- AI 도입 직전 단계에서 `recommend`를 `rule / hybrid / ai`로 분리
- 회귀 검증 루틴을 통해 기준 query 결과를 고정

## 2. 오늘 반영 내용

### 2.1 Recommend 모드 확장

- `recommend`에 모드 개념 추가
  - `rule`: 기존 규칙 기반
  - `hybrid`: AI intent 시도 후 실패 시 rule fallback
  - `ai`: AI intent 우선 시도 후 실패 시 fallback
- intent source를 결과 메타로 노출
  - `rule`, `ai`, `fallback`

### 2.2 Provider/Model 제어

- 글로벌/커맨드 옵션으로 provider/model 지정 가능
  - `--provider gemini|openai`
  - `--model <name>`
- 기본 provider를 `gemini`로 설정
- provider별 기본 model 적용
  - gemini: `gemini-2.0-flash`
  - openai: `gpt-5-mini`

### 2.3 환경 변수 및 실행 안정성

- `.env.local` 자동 로딩 로직 추가 (CLI 시작 시)
- `.env` 계열 파일이 Git에 포함되지 않도록 `.gitignore` 보완

### 2.4 회귀 검증 강화

- `scripts/evaluate-query-set.mjs`에 search 케이스 포함
- `pnpm eval:queries`로 `search/recommend/generate` 대표 query를 일괄 검증 가능

### 2.5 현재 스코프 가드

- 현재 custom baseline에서 미지원으로 본 패턴(list/table/dashboard 등)은
  `no_match`로 처리하는 가드 유지
- 다만 모드/메타를 통해 fallback 원인을 추적 가능하도록 구성

## 3. 검증 결과

- `pnpm typecheck` 통과
- `pnpm eval:queries` 통과
- `recommend` 실행 시 mode/provider/model/meta 확인

## 4. 현재 판단

- rule baseline은 유지하면서 AI 경로를 보강 계층으로 추가한 상태
- today scope 기준에서 기능은 동작하며 회귀 검증도 고정됨
- 다음 단계는 애매 케이스(`user list`)를 어떤 모드에서 어디까지 열어줄지 정책 확정이 필요
