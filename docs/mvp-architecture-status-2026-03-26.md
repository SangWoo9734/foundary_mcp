# MVP 아키텍처/진행상황 정리 (2026-03-26)

## 1. 목적

이 문서는 AI 전환 이후 현재 MVP의 구조와 완료 상태를 한 번에 확인하기 위한 상태 문서다.

## 2. 현재 아키텍처

```text
ai-metadata (component metadata)
  -> core (search/recommend/generate + AI intent + fallback)
    -> cli (command interface + json/text formatter)
```

핵심 흐름:

1. `search`
- metadata + lexical scoring 기반 후보 검색

2. `recommend`
- AI intent(JSON) 우선
  - `queryType`, `scope`, `needsLayout`, `confidence`, `intentTags`, `strategy`
- AI 실패 시 fallback intent 추론 + selection

3. `generate`
- `recommend.selectedComponents`를 단일 입력으로 사용
- `strategy` 기반 JSX 조합
  - `single_component`, `form_flow`, `listing`, `scaffold`

## 3. 오늘 기준 검증 결과

실행 결과:

- `pnpm eval:contract` PASS
- `pnpm eval:deterministic` PASS
- `pnpm eval:ai` PASS (AI 비활성 시 SKIP 허용)

수동 확인:

- `recommend "login page"`: form_flow + page 맥락 정상
- `recommend "dashboard section"`: scope/page 맥락과 scaffold 전략 확인
- `generate "shopping page with a lot of products"`: listing 전략으로 반복 card scaffold 생성
- `generate "page layout"`: page scaffold 생성

주의:

- 현재 실행 환경에서 AI API 호출은 `fetch failed`로 fallback 경로가 관측됨
- 로컬 키/네트워크 환경에서 동일 명령 재검증 필요
- 테스트 해석 기준:
  - deterministic: fallback 고정 기준 회귀 검증
  - ai: `intentSource=ai` 케이스에 대해 semantic 검증, 미활성 시 SKIP

## 4. 완료된 MVP 범위

- [완료] custom(default) 디자인 시스템 기준 `search/recommend/generate`
- [완료] AI-first 전환 + fallback 안전 경로
- [완료] 출력 계약 문서화 (`docs/cli-output-contract.md`)
- [완료] 계약 검증/회귀 검증 스크립트

## 5. 현재 한계

- adapter가 아직 분리되지 않아 metadata source가 고정되어 있음
- fallback 품질은 안정적이지만 adapter별 semantic 편차를 아직 흡수하지 않음
- AI 성공 경로 품질은 네트워크 가능한 환경에서 별도 확인 필요

## 6. 다음 단계(Phase 전환)

다음 목표는 최적화가 아니라 확장 구조화다.

1. adapter interface 도입
2. custom adapter 분리
3. core가 adapter contract만 바라보도록 경계 고정
