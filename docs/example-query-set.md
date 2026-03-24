# 예시 Query 세트

작성일: 2026-03-20

## 1. 문서 목적

이 문서는 현재 단계의 `search / recommend / generate` 검증에 사용할 대표 query와 기대 결과를 정리하기 위한 문서다.

지금 정리하는 예시 데이터는 단순 데모 문장이 아니라, AI 품질 개선 과정에서 계속 사용할 baseline evaluation set으로 본다.

즉 이 문서는 다음 용도로 사용한다.

- 현재 AI-primary baseline 검증
- AI prompt/retrieval 개선 전후 비교
- expected behavior spec 정리
- prompt example 또는 evaluation fixture의 초안

## 2. 현재 범위 판단

현재 단계는 `custom` 디자인 시스템 기준의 CLI MVP를 검증하는 단계다.

따라서 다음 기준으로 범위를 제한한다.

- 지원 대상은 현재 구현된 핵심 컴포넌트와 직접 연결되는 query에 한정한다.
- `settings form`, `dashboard section`처럼 현재 baseline에서 의미가 덜 명확한 query는 대표 지원 범위에서 제외한다.
- `generate`는 완성 기능이 아니라 러프한 퍼블리싱을 가능하게 하는 수준의 조합 결과를 제공하는 것으로 본다.

## 3. 평가 기준

### 3.1 page / section / component 구분

query는 의미적으로 다음 세 층으로 나눠서 본다.

- `page`
  - 전체 화면 혹은 page shell 수준 구조를 기대하는 query
  - 예: `login page`, `page layout`
- `section`
  - 화면 일부를 구성하는 묶음이나 grouped content를 기대하는 query
  - 예: `form section`, `profile card`
- `component`
  - 단일 컴포넌트 혹은 작은 코드 조각 수준 결과를 기대하는 query
  - 예: `password input`, `button for submit`

이 구분은 이후 AI가 query를 더 유연하게 해석하는 기반이 되더라도, 현재 단계에서는 여전히 유효한 평가 기준으로 본다.

### 3.2 반복 개수 기준

`profile edit` 같은 query에서 반복되는 입력 필드 수는 고정 정답으로 두지 않는다.

현재는 다음 기준으로 평가한다.

- 여러 개의 입력 필드가 필요한 구조인지
- 그 입력 필드들이 의미적으로 구분될 수 있는지
- `Form`과 `Button`까지 포함한 편집 흐름이 성립하는지

즉 개수 자체보다 역할 충족 여부를 우선해서 본다.

### 3.3 optional 요소 기준

예를 들어 `search field`에서 `Icon`은 기본적으로 optional 요소로 본다.

현재 단계에서 must-have / good-to-have는 다음처럼 구분한다.

- must-have: 결과가 성립하기 위해 꼭 필요한 컴포넌트
- good-to-have: 있으면 더 자연스럽지만, 없어도 허용 가능한 컴포넌트

## 4. 대표 query 세트

| query | type | intent | recommend must-have | recommend good-to-have | generate 기대 형태 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| `login page` | page | 인증 화면 구성 | `Form`, `Input`, `Button` | `Layout`, `Card` | 로그인 폼 구조 | page 수준 query |
| `profile edit` | page | 수정 흐름 구성 | `Layout`, `Card`, `Form`, `Input`, `Button` | - | 수정 폼 구조 | Input 개수는 고정하지 않음 |
| `search field` | component | 검색 입력 | `Input` | `Icon` | 검색용 input 조각 | icon은 optional |
| `password input` | component | 비밀번호 입력 | `Input` | `Icon`, `Form` | password input 조각 | trailing icon 허용 |
| `button for submit` | component | 제출 액션 | `Button` | - | submit button 조각 | 단일 컴포넌트 generate 허용 |
| `form section` | section | grouped form block | `Form`, `Input`, `Button` | `Card` | form section 조각 | section 수준 query |
| `profile card` | section | profile 정보 카드 | `Card` | `Button` | card 조각 | 카드 중심 결과 기대 |
| `page layout` | page | page shell / layout | `Layout` | `Card` | layout 조각 | 구조 컴포넌트 중심 |

## 5. 현재 제외한 query

| query | 제외 이유 | 현재 기대 동작 |
| --- | --- | --- |
| `settings form` | 단일 form submission보다 setting item 처리 의미가 강해 현재 baseline 범위와 다름 | 현재 단계에서는 evaluation set에서 제외 |
| `user list` | list / collection display는 전용 리스트 컴포넌트 부재로 품질 변동이 큼 | AI/fallback 조합으로 근사 결과를 허용하되 품질 개선 대상 |
| `dashboard section` | display/dashboard 계열은 이후 확장 범위로 보는 것이 더 적절함 | 현재 단계에서는 evaluation set에서 제외 |

## 6. 이후 활용 방식

이 query 세트는 이후 다음 단계에서 그대로 재사용한다.

- AI prompt tuning 전/후 비교
- AI component selection 품질 비교
- semantic retrieval 도입 전/후 비교
- generate quality 회귀 테스트

즉 지금 문서화한 query 세트는 현재 기준 문서이면서, 이후 확장 시 비교 기준이 되는 문서다.
