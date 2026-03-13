# 진행 상황 보고서

작성일: 2026-03-13

## 1. 문서 목적

이 문서는 현재까지 진행된 작업 내용을 구조적으로 정리하고,

- 어떤 범위가 완료되었는지
- 현재 저장소 구조가 어떻게 정리되어 있는지
- 어떤 항목이 아직 남아 있는지
- 다음 단계에서 무엇을 우선적으로 진행해야 하는지

를 빠르게 확인할 수 있도록 작성한다.

## 2. 현재 프로젝트 방향 요약

현재 프로젝트는 다음 방향으로 진행 중이다.

- AI가 디자인 시스템 문서를 직접 읽는 대신, 구조화된 metadata와 core logic을 통해 컴포넌트를 검색하고 추천할 수 있도록 한다.
- 초기 검증 인터페이스는 MCP가 아니라 CLI를 우선 사용한다.
- core logic은 CLI에 종속되지 않도록 분리하며, 이후 MCP 인터페이스로 확장 가능한 구조를 유지한다.
- 기본 디자인 시스템은 `custom default design system`으로 정의하고, 구현은 Tailwind 기반으로 진행한다.
- 디자인 토큰은 Figma 자동 연동 없이 로컬 코드 기준으로 관리하며, metadata에는 token reference만 유지한다.

## 3. 이번 단계까지 완료한 작업

### 3.1 Monorepo 및 기본 개발 환경 세팅

완료 항목:

- Turborepo 기반 monorepo 구성
- `pnpm workspace` 구성
- 공통 `tsconfig` 구성
- `Next.js` 기반 `apps/web-demo` 생성
- 패키지 구조 초기화

현재 주요 패키지:

- `packages/ui`
- `packages/ai-metadata`
- `packages/core`
- `packages/cli`

## 3.2 Tailwind 기반 UI 시스템 기반 마련

완료 항목:

- `web-demo`에 Tailwind 적용
- 글로벌 CSS 변수 및 토큰 기반 스타일 적용
- 초기 custom design system에 맞는 기본 색상/spacing/radius/shadow 방향 반영

현재 토큰 방향:

- color
- spacing
- radius
- shadow

## 3.3 UI 컴포넌트 1차 구현

현재 구현 완료된 컴포넌트:

- `Button`
- `Card`
- `Layout`
- `Input`
- `Form`
- `FormField`
- `Icon`

구현 특징:

- `Button`: `primary / secondary / tertiary`, `sm / md / lg`
- `Input`: 기본 입력, leading icon, trailing icon, disabled, placeholder, invalid 상태 지원
- `Form`: 조합용 wrapper
- `FormField`: label / message 조합 지원
- `Icon`: 현재 `search`, `eye` 아이콘 지원
- `Layout`: 페이지 레벨 layout shell 역할

## 3.4 UI 패키지 구조 정리

초기에는 한 파일에 여러 컴포넌트가 몰려 있었으나, 현재는 구조적으로 분리해두었다.

현재 `packages/ui` 구조:

```text
packages/ui/src/
  components/
    Button.tsx
    Card.tsx
    Form.tsx
    Icon.tsx
    Input.tsx
    Layout.tsx
  icons/
    EyeIcon.tsx
    SearchIcon.tsx
  index.ts
  tokens.ts
  types.ts
```

정리 원칙:

- `index.ts`: export 전용
- `components/`: 실제 UI 컴포넌트
- `icons/`: SVG 아이콘
- `tokens.ts`: 디자인 토큰 상수
- `types.ts`: 공통 props/type 정의

## 3.5 Component Metadata 설계 및 작성

`packages/ai-metadata`는 placeholder 상태에서 컴포넌트 metadata 중심 구조로 전환했다.

현재 metadata 작성 완료 컴포넌트:

- `Button`
- `Card`
- `Layout`
- `Input`
- `Form`
- `Icon`

현재 metadata 필드:

- `name`
- `category`
- `description`
- `props`
- `useCases`
- `keywords`
- `relatedComponents`
- `tokens`

현재 `packages/ai-metadata` 구조:

```text
packages/ai-metadata/src/
  components/
    button.ts
    card.ts
    form.ts
    icon.ts
    input.ts
    layout.ts
  index.ts
  types.ts
```

정리 원칙:

- metadata 타입과 실제 데이터 분리
- 컴포넌트별 metadata 파일 분리
- `index.ts`는 export와 aggregate 역할만 담당

## 3.6 Core 로직 구조화

초기에는 `packages/core`가 단일 파일이었으나, 현재는 역할별로 분리했다.

현재 구조:

```text
packages/core/src/
  index.ts
  normalize.ts
  recommend.ts
  score.ts
  search.ts
  types.ts
```

현재 구현 내용:

- `normalizeText()`
- `normalizeQuery()`
- `scoreComponent()`
- `searchComponents()`
- `recommendComponents()`

현재 역할 구분:

- `normalize.ts`: query normalization
- `score.ts`: component scoring
- `search.ts`: 검색 결과 계산
- `recommend.ts`: 추천 결과 계산
- `types.ts`: 공통 결과 타입

## 3.7 CLI 패키지 추가

`packages/cli`를 추가하여 core logic을 실제 명령어 흐름으로 검증할 수 있게 만들었다.

현재 구조:

```text
packages/cli/
  src/
    format.ts
    index.ts
```

현재 지원 명령:

- `search`
- `recommend`

현재 흐름:

- 사용자 query 입력
- CLI command 실행
- `packages/core` 호출
- 결과를 text 형태로 출력

## 3.8 실제 동작 검증 결과

다음 항목을 실제로 확인했다.

- `pnpm typecheck`
- `pnpm --filter @repo/ai-metadata build`
- `pnpm --filter @repo/core build`
- `pnpm --filter @repo/cli build`
- `pnpm --filter @repo/web-demo build`

CLI 실행도 확인했다.

예시:

```bash
node dist/index.js search "login form input"
node dist/index.js recommend "login page"
```

실행 결과 예시 요약:

- `search "login form input"` 결과 상위:
  - `Input`
  - `Form`
  - `Icon`
  - `Card`

- `recommend "login page"` 결과 상위:
  - `Form`
  - `Input`
  - `Layout`
  - `Button`

즉, metadata 기반 검색과 추천이 최소 수준에서는 실제로 동작하는 상태다.

## 4. 현재 기준에서 아직 미완료인 항목

아직 남아 있는 주요 항목은 다음과 같다.

### 4.1 Adapter 구조 본격화

현재는 사실상 `custom default design system` 하나만 전제로 움직이고 있다.

아직 미완료:

- adapter interface 정의
- registry 구조
- active adapter 선택 흐름
- `custom` 외의 adapter 확장 포인트 정리

### 4.2 CLI 완성도 보강

현재 CLI는 동작 검증 수준이며, 제품형 CLI로 보기에는 아직 부족하다.

아직 미완료:

- `--adapter custom` 옵션
- 출력 포맷 옵션 (`text`, `json`)
- 에러 메시지 정리
- help 메시지 구체화
- `generate` command 추가

### 4.3 Recommendation 로직 고도화

현재 `recommendComponents()`는 search scoring을 기반으로 한 초안 수준이다.

아직 미완료:

- page type별 더 명확한 heuristic
- component 조합 우선순위 규칙
- `login`, `profile`, `settings` 같은 시나리오별 정교화

### 4.4 UI Generation 로직

아직 미구현:

- `generateUI()`
- 컴포넌트 조합 규칙
- code template 생성 규칙
- CLI `generate` 명령

### 4.5 Web Demo 역할 정리

현재 `web-demo`는 시각 검증과 metadata preview 용도로 사용 중이다.

아직 미완료:

- CLI/core 결과를 시각적으로 더 명확하게 보여주는 흐름
- 추천 결과와 생성 결과를 UI에서 비교 확인하는 화면

## 5. 현재 판단 기준에서의 진행 상태

프로젝트는 현재 다음 단계에 위치해 있다.

### 완료된 범위

- monorepo 기반 구축
- custom UI 1차 구현
- metadata 작성
- search MVP
- recommend 초안
- CLI 기반 search/recommend 실행 검증

### 아직 남은 핵심 범위

- adapter abstraction 정리
- CLI를 실제 제품형 command interface로 보강
- `generateUI()` 설계 및 구현
- 이후 MCP 확장 포인트 정리

즉 현재 상태는 다음과 같이 표현할 수 있다.

> 기본 디자인 시스템 + metadata + core search/recommend + CLI 검증까지는 1차 연결이 완료되었고,
> 이제부터는 adapter abstraction과 generate 흐름으로 넘어가야 하는 단계다.

## 6. 다음 단계 권장 작업 순서

현재 기준으로 다음 작업 우선순위는 아래와 같다.

### 1) Adapter 구조 설계

- `DesignSystemAdapter` 타입 정의
- `CustomAdapter` 초안 구현
- registry 구조 정의
- active adapter 선택 방식 정의

### 2) CLI 보강

- `--adapter` 옵션 추가
- `text/json` 출력 옵션 추가
- `search`, `recommend`, `generate` command 구조 정리

### 3) Generate 설계 시작

- `generateUI()` 함수 초안
- metadata 기반 component composition 규칙 정의
- login / profile edit 같은 대표 시나리오 기준 템플릿 설계

### 4) Search / Recommend 품질 개선

- category bias 보정
- use case weight 조정
- query token 매칭 개선

## 7. 현재 문서와 구현 간 정합성 메모

현재 구현 방향은 [docs/project-overview.md](/Users/sangwoo/foundary_mcp/docs/project-overview.md)의 CLI-first 방향과 대체로 맞춰져 있다.

다만 아직 문서 대비 미완료인 부분은 다음과 같다.

- adapter abstraction은 문서 수준에 비해 구현이 부족함
- `generate` 흐름은 아직 시작 전
- CLI는 MVP 수준이고 옵션 체계가 미완성

따라서 다음 단계에서는 기능을 더 추가하기 전에

- adapter contract
- core entry points
- CLI command contract

를 먼저 명확하게 고정하는 것이 중요하다.
