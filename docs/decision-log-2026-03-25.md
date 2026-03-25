# 의사결정 기록 (2026-03-25)

## 1. 문서 목적

이 문서는 2026-03-25 작업 중 변경된 핵심 판단을 정리한다.

- 단순 작업 내역이 아니라 `왜 이 결정을 했는지`를 남긴다.
- 이후 동일 이슈가 반복될 때 기준 문서로 사용한다.

## 2. 오늘의 핵심 의사결정

### 결정 1) 룰/시나리오 보정 중심 접근 중단

#### 배경

초기에는 AI 결과 품질 이슈를 케이스별 보정으로 해결하려고 했다.

예:

- `dashboard section`에서 Layout 강제
- 특정 query에서 컴포넌트 자동 추가

#### 문제

- 케이스가 늘수록 유지보수 비용이 커진다.
- AI 확장 목표(비핵심 범위 확대)와 충돌한다.
- “AI를 붙였지만 사실상 룰 확장판”이 된다.

#### 최종 결정

케이스 보정 중심이 아니라 **의미 계층 기반 설계**로 전환한다.

- `intentTags`
- `strategy`
- `scope`
- `needsLayout`
- `confidence`

#### 영향

- 문장별 핫픽스보다 일반화된 대응이 가능해진다.
- 비핵심 query에서 “안전한 실패”가 아니라 “타당한 근사 출력”을 목표로 바꿀 수 있다.

---

### 결정 2) recommend를 단일 의사결정 지점으로 고정

#### 배경

기존에는 recommend와 generate가 각각 재판단을 수행해 결과가 어긋나는 문제가 있었다.

예:

- rationale과 JSX 불일치
- selectedComponents와 실제 렌더 불일치

#### 최종 결정

`recommend`가 최종 selection을 결정하고, `generate`는 이를 조합만 한다.

#### 영향

- 책임 경계가 명확해졌다.
- 정합성 검증이 쉬워졌다.

---

### 결정 3) Layout + Card 강제 정책 제거

#### 배경

`page layout` 케이스에서 최소 scaffold를 보장하려고 `Layout + Card`를 강제 보정했다.

#### 문제

- 사용자 의도와 상충: page 의미가 항상 card를 포함하지는 않는다.
- 시멘틱 판단보다 템플릿 강제가 우선되는 구조가 된다.

#### 최종 결정

강제 보정을 제거하고, 시멘틱 기반 선택을 유지한다.

- `page layout`은 `Layout` 단독도 정상

#### 영향

- 규칙 강제보다 의도 해석 우선 구조가 유지된다.
- 테스트 기준도 해당 원칙에 맞춰 조정했다.

---

### 결정 4) section 의미를 scope로 분리

#### 배경

`section`은 항상 동일하지 않다.

- standalone section (독립 블록)
- page section (페이지 내부 섹션)

#### 최종 결정

`scope`를 명시적으로 도입한다.

- `component`
- `standalone_section`
- `page_section`
- `page`

#### 영향

- `dashboard section` 같은 쿼리에서 page 내부 맥락을 표현할 수 있다.
- adapter 확장 시에도 동일 계약을 재사용할 수 있다.

---

### 결정 5) 비핵심 확장은 strategy 기반으로 처리

#### 배경

`shopping page with a lot of products` 같은 쿼리는 컴포넌트만으로 직접 매핑하기 어렵다.

#### 최종 결정

`strategy`를 추가해 생성 방식을 분기한다.

- `single_component`
- `form_flow`
- `listing`
- `scaffold`

#### 영향

- `listing` 전략으로 반복 카드 구조를 생성할 수 있다.
- 도메인 문장 증가 시에도 템플릿을 재사용할 수 있다.

## 3. 오늘 기준 운영 원칙

1. 케이스별 예외 패치보다 의미 계층 확장을 우선한다.
2. 강제 조합 규칙은 최소화한다.
3. 평가는 핵심 정확도 + 비핵심 의미 타당성으로 본다.
4. 계약 변경 시 문서(`cli-output-contract`)와 검증 스크립트를 함께 갱신한다.

## 4. 남은 TODO (다음 작업 기준)

- `intentTags/strategy` 품질 측정 지표 정의
- AI 성공 경로/실패 경로 분리 회귀 리포트 추가
- adapter 도입 전 metadata 품질 점수(coverage) 정의
