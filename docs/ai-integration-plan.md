# AI Integration Plan (Backlog)

작성일: 2026-03-24

## 1. 현재 단계 요약

현재는 `custom` 디자인 시스템 기준의 AI-primary baseline이 동작한다.

- `search`: metadata 기반 검색
- `recommend`: AI 컴포넌트 선택 + metadata fallback
- `generate`: 추천 결과 기반 composition 생성

지금 단계의 우선순위는 adapter 확장보다 AI 품질 안정화다.

## 2. AI 도입 우선순위

현재 기준에서는 adapter 확장보다 AI 품질 고도화를 먼저 적용한다.

이유:

- 현재 병목은 multi-design-system 확장보다 추천/생성 품질이다.
- AI baseline이 이미 존재하므로 품질 개선 전후 비교가 가능하다.
- adapter를 먼저 일반화하면 범위가 커져 품질 검증이 늦어진다.

## 3. 도입 원칙

1. 추천/생성의 의사결정은 AI 출력(JSON contract)을 기준으로 한다.
2. fallback은 안전장치로 유지하되, 정책 중심은 AI 품질로 둔다.
3. 평가 기준은 `docs/example-query-set.md`를 우선 사용한다.
4. 품질 회귀는 동일 query 세트로 비교한다.

## 4. 단계별 적용 제안

### Phase A: Intent 신뢰도 향상 (추천 우선)

- 대상: `recommend`
- 역할:
  - queryType 분류 정확도 개선
  - recommendedComponents 품질 개선
- 출력 계약:
  - 기존 `recommend` JSON 계약 유지(`results[]` + `meta`)

### Phase B: Retrieval 보강

- 대상: `search`, `recommend`
- 역할:
  - metadata embedding 기반 semantic retrieval 추가
  - fallback ranking의 lexical bias 축소
- 출력 계약:
  - 기존 `results[]` 구조 유지

### Phase C: Generate 보강

- 대상: `generate`
- 역할:
  - queryType/intent 기반 조합 룰 정교화
  - rationale 품질 향상
- 출력 계약:
  - `selectedComponents`, `jsx`, `rationale`, `status`, `meta` 유지

## 5. 지금 하지 않는 것

- adapter generalization 우선 착수
- free-form code generation으로 즉시 전환
- 임베딩 인프라를 먼저 도입하는 대규모 리팩터링

위 항목은 AI 보강 결과가 안정화된 뒤 진행한다.

## 6. 운영 기본값 (현재)

- 기본 provider: `gemini`
- 기본 model:
  - gemini: `gemini-2.0-flash`
  - openai: `gpt-5-mini`
- timeout: `5000ms`
- retry: `1회` (총 2번 시도)
- 실패 시 동작: metadata fallback 결과 반환 + `meta.note`에 실패 사유 기록
