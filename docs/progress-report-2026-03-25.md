# 진행 보고서 (2026-03-25)

## 1. 오늘 목표

- AI 출력 계약을 문서/검증 스크립트로 고정
- fallback 추천 품질을 의미 토큰 기반으로 개선
- 애매 쿼리까지 회귀셋을 확장

## 2. 오늘 반영 내용

### 2.1 CLI 출력 계약 고정

- `docs/cli-output-contract.md` 작성
- `scripts/validate-cli-contract.mjs` 추가
- 루트 스크립트 `pnpm eval:contract` 추가

### 2.2 fallback 의미 기반 보강

- `normalizeText`에 불용어 확장
- 동의어/의미 토큰 확장 로직 추가
  - 예: `login -> auth/form/password`, `list -> section/page`, `settings -> form/profile`
- 복수형 단어 singularize 처리 추가

### 2.3 generate queryType 보정

- page/section/component 판별 우선순위 보정
- `settings form` 같은 쿼리가 section으로 처리되도록 정리

### 2.4 회귀셋 확장

- `recommend`: `user list` 케이스 추가
- `generate`: `settings form`, `user list`, `dashboard section` 추가
- 문서(`docs/example-query-set.md`)와 스크립트(`scripts/evaluate-query-set.mjs`) 동기화

### 2.5 AI 운영 기본값 문서화

- `docs/ai-integration-plan.md`에 운영 기본값 명시
  - provider/model default
  - timeout/retry
  - 실패 시 fallback + `meta.note`
- `ai-intent.ts`에 retry(기본 1회) 반영

## 3. 검증 결과

- `pnpm eval:contract` 통과
- `pnpm eval:queries` 통과

## 4. 현재 판단

- 오늘 기준으로 CLI 소비자 계약은 문서 + 실행 검증으로 고정됐다.
- AI 실패 시에도 애매 케이스를 scaffold 수준에서 일관되게 처리할 수 있다.
- 다음 단계는 AI 성공 경로 품질(프롬프트/샘플/응답 안정성) 개선과 adapter 확장 준비다.

## 5. 관련 의사결정 문서

- `docs/decision-log-2026-03-25.md`
