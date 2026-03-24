# 진행 보고서 (2026-03-24)

## 1. 오늘 목표

- 기존 `recommend/generate`의 룰/시나리오 의존을 제거
- AI가 컴포넌트를 직접 선택하는 경로로 단순화
- CLI 계약을 AI 우선 흐름에 맞춰 정리

## 2. 오늘 반영 내용

### 2.1 추천 로직 구조 변경

- `rule/hybrid/ai` 모드를 제거하고 추천 경로를 단일화했다.
- AI 응답 계약을 `scenarios` 기반에서 `recommendedComponents` 기반으로 변경했다.
- AI 실패 시에는 metadata 점수 기반 fallback으로 동작하도록 유지했다.

### 2.2 시나리오 룰 제거

- `packages/core/src/scenarios.ts`를 삭제했다.
- `recommend`의 scenario/role/category bias 로직을 제거했다.
- 기존의 미지원 패턴 강제 차단(`list/table/dashboard`)을 제거했다.

### 2.3 프롬프트/파서 재구성

- `ai-prompt.ts`를 새로 구성해 다음 JSON만 반환하도록 강제했다.
  - `queryType: component|section|page`
  - `recommendedComponents: string[]`
  - `rationale: string[]`
- allow-list 기반 검증으로 모델 hallucination을 방어했다.

### 2.4 생성 로직 정리

- `generate`에서 시나리오 템플릿 분기를 제거했다.
- 추천 결과 + query type을 기준으로 컴포지션을 만들도록 변경했다.
- generate 출력에도 intent 메타를 포함했다.
  - `intentSource`, `provider`, `model`, `queryType`, `note`

### 2.5 CLI 계약 정리

- `--mode` 옵션 제거
- `recommend/generate`는 `--provider`, `--model`만 사용
- recommend 결과 meta에서 `mode` 제거, `queryType` 추가

## 3. 검증 결과

- `pnpm -w typecheck` 통과
- `pnpm -w build` 통과
- `pnpm eval:queries` 통과

## 4. 현재 판단

- 이제 baseline의 기준은 "시나리오 룰"이 아니라 "AI 우선 + metadata fallback"이다.
- 네트워크/키 이슈로 AI 호출 실패 시에도 CLI가 동작하도록 안전 경로는 유지했다.
- 다음 단계는 fallback 품질을 semantic 중심으로 올리고, generate 조합 품질을 더 정교화하는 것이다.
