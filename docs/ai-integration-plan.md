# AI Integration Plan (Backlog)

작성일: 2026-03-23

## 1. 현재 단계 요약

현재는 `custom` 디자인 시스템 기준의 rule-based baseline이 동작한다.

- `search`: metadata 기반 검색
- `recommend`: scenario/role bias 기반 추천
- `generate`: template composition 기반 생성

지금 단계의 우선순위는 확장성보다 baseline 품질 고정이다.

## 2. AI 도입 우선순위

현재 기준에서는 adapter 확장보다 AI 품질 보강을 먼저 적용한다.

이유:

- 현재 병목은 multi-design-system 확장보다 추천/생성 품질이다.
- baseline이 이미 존재하므로 AI 도입 전후 비교가 가능하다.
- adapter를 먼저 일반화하면 범위가 커져 품질 검증이 늦어진다.

## 3. 도입 원칙

1. 기존 rule-based 파이프라인을 제거하지 않는다.
2. AI는 baseline을 대체하는 것이 아니라 보강 계층으로 붙인다.
3. 평가 기준은 `docs/example-query-set.md`를 우선 사용한다.
4. AI 도입 전후를 같은 query 세트로 비교한다.

## 4. 단계별 적용 제안

### Phase A: Intent 보강 (추천 우선)

- 대상: `recommend`
- 역할:
  - query intent 해석 보강
  - scenario/role mapping 보조
- 출력 계약:
  - 기존 `recommend` JSON 계약 유지

### Phase B: Retrieval 보강

- 대상: `search`, `recommend`
- 역할:
  - metadata embedding 기반 semantic retrieval 추가
  - 기존 keyword score와 hybrid 결합
- 출력 계약:
  - 기존 `results[]` 구조 유지

### Phase C: Generate 보강

- 대상: `generate`
- 역할:
  - 추천 결과 rerank 및 조합 보조
  - rationale 품질 향상
- 출력 계약:
  - `selectedComponents`, `jsx`, `rationale`, `status` 유지

## 5. 지금 하지 않는 것

- adapter generalization 우선 착수
- free-form generation으로 즉시 전환
- rule-based baseline 제거

위 항목은 AI 보강 결과가 안정화된 뒤 진행한다.
