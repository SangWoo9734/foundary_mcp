# Adapter 확장 설계 구상 (2026-03-26)

## 1. 목적

현재 `custom` 고정 구조를 adapter 기반으로 분리해, 이후 `shadcn/company` 확장을 가능하게 한다.

핵심은 “AI 품질 로직”과 “디자인시스템 소스 해석”을 분리하는 것이다.

## 2. 설계 원칙

1. core는 adapter 내부 구현을 모른다.
2. adapter는 공통 metadata contract로만 결과를 제공한다.
3. adapter 품질이 낮아도 core 계약은 유지한다.

## 3. 책임 분리

### adapter 책임

- source에서 컴포넌트 정보 수집
- 공통 metadata 형식으로 정규화
- 부족한 필드에 대해 최소 보정(빈값/기본값)

### core 책임

- intent 해석
- 추천/생성 전략 결정
- CLI output contract 보장

## 4. 최소 adapter 계약 (초안)

```ts
type AdapterId = "custom" | "shadcn" | "company";

type AdapterContext = {
  adapterId: AdapterId;
};

type AdapterComponent = {
  name: string;
  category: "action" | "layout" | "surface" | "input" | "form" | "icon";
  description: string;
  props: string[];
  useCases: string[];
  keywords: string[];
  relatedComponents: string[];
  tokens: Record<string, { ref: string; source: string }>;
};

type DesignSystemAdapter = {
  id: AdapterId;
  listComponents(ctx: AdapterContext): Promise<AdapterComponent[]>;
};
```

## 5. Adapter Registry (초안)

```ts
type AdapterRegistry = {
  getAdapter(id: AdapterId): DesignSystemAdapter;
  listAdapters(): AdapterId[];
};
```

운영 규칙:

- CLI `--adapter` 입력은 registry에서 검증
- 미등록 adapter는 즉시 에러

## 6. 도입 순서

### Step 1

`custom` 데이터를 `customAdapter`로 이동

- 기존 `@repo/ai-metadata` 직접 참조 제거
- core는 adapter를 통해 metadata 획득

### Step 2

core entry에 adapter context 주입

- `recommend/generate/search`의 입력에 `adapterId` 반영

### Step 3

`shadcnAdapter` 스켈레톤만 추가

- 실제 데이터 연동 전, contract 충족 더미로 연결 테스트

## 7. 리스크와 대응

리스크:

- adapter별 metadata 품질 편차
- 필드 누락/의미 불일치

대응:

- adapter 품질 체크 함수 도입
  - 필수 필드 존재율
  - description/useCases/keywords 최소 길이
- 품질 미달 시 core meta에 note 추가 (`metadata_quality_low`)

## 8. 완료 조건 (adapter phase 시작선)

다음 3개가 되면 adapter 확장 phase 진입으로 본다.

1. custom adapter 분리 완료
2. core direct metadata import 제거
3. CLI `--adapter custom` 경로가 기존과 동일 결과 유지

## 9. 현재 테스트 체계와 adapter 도입 시 활용

현재 테스트는 2트랙으로 분리되어 있다.

- deterministic 트랙
  - command: `pnpm eval:deterministic`
  - 목적: adapter 변경 후에도 fallback 기준 동작이 깨지지 않는지 확인
- ai semantic 트랙
  - command: `pnpm eval:ai`
  - 목적: adapter별 metadata가 AI 의미 해석 결과에 미치는 영향 확인
  - AI 경로 비활성 시 SKIP 허용

adapter 도입 이후에는 두 트랙 모두 `--adapter`별로 반복 실행해 회귀를 확인한다.
