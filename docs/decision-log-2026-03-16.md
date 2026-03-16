# 의사결정 기록

작성일: 2026-03-16

## 1. 문서 목적

이 문서는 프로젝트 진행 과정에서 내린 주요 설계 판단과 그 이유를 기록하기 위한 문서다.

특히 다음 내용을 중심으로 정리한다.

- metadata 구조를 왜 현재 형태로 유지했는가
- 왜 MCP보다 CLI를 먼저 선택했는가
- 왜 현재 컴포넌트 구현 범위를 먼저 선택했는가

이후에도 프로젝트 진행 중 중요한 설계 판단은 같은 방식으로 기록한다.

## 2. metadata 구조 설계

### 2.1 기본 판단

metadata의 초기 구조는 AI 제안을 출발점으로 삼았지만, 그대로 수용하지는 않았다.

각 필드는 디자인 시스템 문서, 실제 컴포넌트 코드, 그리고 search / recommend 단계에서 실제로 필요한 정보인지의 관점에서 검토한 뒤 유지했다.

현재 유지 중인 기본 구조는 아래와 같다.

```text
name / category / description / props / useCases / keywords / relatedComponents / tokens
```

현재 기준에서는 각 필드의 존재 이유를 대부분 납득할 수 있다고 판단해, 구조를 크게 바꾸지 않고 유지하고 있다.

### 2.2 참고한 내용

#### 디자인 시스템 문서 참고

여러 기업의 디자인 시스템 문서를 참고했을 때 공통적으로 확인한 내용은 다음과 같다.

- 대부분 `name`, `description` 수준의 기본 설명을 제공한다.
- 잘 구조화된 디자인 시스템은 컴포넌트를 카테고리 단위로 정리하고 있다.
- 디자인 토큰 혹은 스타일 관련 기준 정보를 직접 또는 간접적으로 제공하고 있다.

이 때문에 다음 필드는 비교적 직접적인 근거를 갖는다고 판단했다.

- `name`
- `category`
- `description`
- `tokens`

참고 이미지 메모:

- 디자인 시스템 문서 예시 캡처를 기반으로 정리
- 실제 이미지 파일은 현재 워크스페이스에 저장되어 있지 않아 본 문서에는 텍스트 설명으로 기록

#### 디자인 시스템 코드 참고

컴포넌트 구현 코드에서는 `props`가 컴포넌트의 종류와 사용성을 드러내는 중요한 단서라고 판단했다.

예를 들어 `Button` 컴포넌트의 경우 다음과 같은 요소가 사용 맥락을 드러낸다.

- `variant`
- `size`
- `disabled`
- `loading`
- 기타 상호작용 관련 props

이 때문에 `props`는 단순 API 정보가 아니라, AI가 컴포넌트의 성격과 선택 기준을 판단할 때 필요한 데이터라고 보았다.

참고 이미지 메모:

- Line Design System의 Button 코드 캡처 참고
- 실제 이미지 파일은 현재 워크스페이스에 저장되어 있지 않아 본 문서에는 텍스트 설명으로 기록

### 2.3 필드별 판단 근거

#### `name`

가장 기본적인 식별자이며, search와 recommendation 모두에서 출발점이 되는 값이다.

#### `category`

단순 문자열 검색을 넘어서, action / layout / input / form 같은 역할 기반 분류를 하기 위해 필요하다고 판단했다.

#### `description`

컴포넌트 의미를 가장 압축적으로 설명하는 필드이며, 문서 기반 정보와 가장 자연스럽게 연결되는 영역이라고 보았다.

#### `props`

구현 코드에서 직접 확인 가능한 정보이며, 컴포넌트가 어떤 상태와 변형을 지원하는지 보여주기 때문에 유지했다.

#### `tokens`

디자인 시스템의 시각 규칙과 연결되는 필드다. 다만 값 자체를 넣기보다 reference만 유지하는 것이 context 크기와 구조적 유연성 측면에서 더 적절하다고 판단했다.

### 2.4 우려된 부분과 유지한 이유

다음 세 필드는 문서나 코드에서 항상 명시적으로 드러나는 정보라고 보기 어렵다.

- `useCases`
- `keywords`
- `relatedComponents`

초기 판단에서는 이 세 필드가 다소 임의적으로 작성될 가능성이 있다고 보았다.

그럼에도 불구하고 유지한 이유는 다음과 같다.

- `description`만으로는 컴포넌트의 실제 쓰임새를 충분히 분리하기 어렵다.
- search와 recommendation에서는 "무엇인가"보다 "어떤 상황에서 쓰는가"가 더 중요한 경우가 많다.
- `useCases`, `keywords`, `relatedComponents`는 description과는 조금 다른 맥락 정보를 제공할 수 있다.

즉 이 세 필드는 완전히 문서 기반의 고정 정보라기보다, AI가 컴포넌트를 선택할 때 필요한 semantic 보조 필드로 보고 초기 metadata에 포함했다.

## 3. 프로젝트 진행 과정 설계

### 3.1 Button, Input, Form을 먼저 구현한 이유

Button, Input, Form을 우선 구현한 이유는 로그인, 회원가입, 설정, 프로필 수정처럼 가장 대표적인 입력 중심 시나리오를 빠르게 검증할 수 있는 최소 조합이기 때문이다.

단순히 많이 쓰이는 컴포넌트라는 이유도 있지만, search / recommend / generate 흐름을 초기 단계에서 검증하기 가장 좋은 조합이라고 판단했다.

### 3.2 Card, Form, Layout을 함께 본 이유

Card, Form, Layout은 각각 서로 다른 역할을 가진 container 역할을 한다고 보았다.

- `Card`: 정보 표시
- `Form`: 입력 흐름, 특정 양식
- `Layout`: 페이지 구조, 반응형 배치, 컴포넌트 나열 방식

이 세 가지를 함께 구현해야 이후 generation 단계에서 단순 컴포넌트 추천을 넘어서 실제 조합 규칙까지 검증할 수 있다고 판단했다.

즉 단일 컴포넌트 구현보다, 역할이 다른 구조 컴포넌트를 같이 두는 것이 이후 단계 검증에 더 유리하다고 보았다.

## 4. CLI를 먼저 택한 이유

### 4.1 초기 방향

초기에는 MCP 기반 도구 제공을 먼저 고려했다.

하지만 현재 단계에서는 디자인 시스템 metadata와 core logic 자체를 검증하는 것이 더 중요하다고 판단해 CLI를 우선 인터페이스로 선택했다.

### 4.2 CLI를 먼저 선택한 이유

CLI는 기능 단위의 입력과 출력만 먼저 정의하면 되기 때문에 `search / recommend / generate`의 동작을 빠르게 검증할 수 있다.

반면 MCP는 다음 요소까지 함께 설계해야 한다.

- 서버 구성
- 요청/응답 프로토콜
- tool interface
- 런타임 연결 방식

즉 MCP는 기능 설계 외의 주변 설계 비용이 더 큰 편이다.

현재 단계에서는 metadata 구조와 core 로직의 타당성을 먼저 검증하는 것이 더 중요하므로, MCP를 바로 붙이는 것은 검증 범위를 불필요하게 넓힐 수 있다고 판단했다.

### 4.3 현재 결론

따라서 먼저 CLI에서 핵심 로직을 안정화한 뒤, 이후 동일한 core를 MCP 인터페이스로 확장하는 순서를 선택했다.

이 판단은 "MCP가 불필요하다"는 의미가 아니라, 현재 단계에서의 우선순위가 CLI 쪽에 있다는 의미다.

## 5. 현재 문서화 원칙

앞으로 프로젝트 의사결정은 다음 원칙으로 기록한다.

- 무엇을 했는지보다 왜 그렇게 결정했는지를 먼저 쓴다.
- 가능하면 문서, 코드, 실제 구현 제약 중 어떤 근거에서 나온 판단인지 구분해 적는다.
- 우려되는 점이나 애매한 점도 같이 남긴다.
- 이후 구조가 바뀌더라도 당시 판단 배경을 추적할 수 있도록 남긴다.

## 6. 보완 예정

현재 문서에는 참고 이미지에 대한 설명은 포함되어 있으나, 실제 이미지 파일은 저장소에 포함되어 있지 않다.

향후 같은 종류의 문서를 계속 작성할 계획이라면 다음 구조를 함께 도입하는 것이 좋다.

```text
docs/
  decisions/
    2026-03-16-metadata-and-cli.md
  assets/
    2026-03-16/
      metadata-doc-example.png
      line-button-code.png
```

이렇게 하면 의사결정 문서와 참고 이미지를 함께 버전 관리하기 쉬워진다.

## 7. CLI 기능 및 Input / Output 정의

### 7.1 기본 방향

`search`, `recommend`, `generate`는 서로 다른 command이지만, 사용자가 입력하는 값의 형태는 모두 자연어 문자열이라는 점에서 동일하다고 판단했다.

초기에는 command별로 `pageType`, `description`, `query`처럼 다른 이름을 둘 수도 있다고 보았지만, 실제 사용 맥락에서는 모두 같은 성격의 입력이라고 판단해 하나의 입력 이름으로 통일하기로 했다.

현재 기준에서 세 command의 차이는 입력값이 아니라 출력 목적에 있다.

- `search`: 관련 컴포넌트 후보를 찾는 기능
- `recommend`: 목적에 맞는 컴포넌트 세트를 추천하는 기능
- `generate`: 선택된 컴포넌트를 바탕으로 실제 UI 조합 결과를 만드는 기능

### 7.2 공통 입력 정의

모든 command의 기본 입력은 `query`로 통일한다.

예:

```bash
ds-ai search "login form input"
ds-ai recommend "login page"
ds-ai generate "login page"
```

이렇게 통일한 이유는 다음과 같다.

- 사용자가 입력하는 값은 결국 모두 자연어 설명이다.
- command마다 입력 이름을 다르게 두면 표면 인터페이스만 복잡해지고 내부적으로는 같은 데이터를 처리하게 된다.
- 입력을 `query`로 통일하면, 각 command의 차이를 결과 목적 중심으로 더 명확하게 설명할 수 있다.

### 7.3 공통 옵션 정의

모든 command는 아래 공통 옵션을 갖는 방향으로 정리한다.

#### `--adapter <name>`

- 기본값은 `custom`
- 현재는 `custom` 디자인 시스템만 실제 구현되어 있지만, 이후 확장 가능성을 고려해 command 표면에는 유지한다.

#### `--format <text|json>`

- 기본값은 `text`
- `text`는 사람이 터미널에서 바로 읽기 좋은 출력 형식이다.
- `json`은 후속 자동화나 다른 프로그램과의 연계를 위한 출력 형식이다.

즉 `format`은 입력 형태가 아니라 출력 형태를 제어하는 옵션으로 정의한다.

### 7.4 search 정의

#### 목적

주어진 자연어 query를 기준으로 관련 컴포넌트 후보를 찾는다.

#### 입력

- `query: string`
- `adapter?: string`
- `format?: text | json`

#### 출력

관련도가 높은 순서대로 컴포넌트 목록을 반환한다.

사용자에게는 아래 정보 위주로 보여준다.

- `name`
- `priority`
- `reasons`

#### 예시

```bash
ds-ai search --adapter custom "login form input"
```

예상 text 출력 예시:

```text
1. Input
   priority: high
   reasons: login field, form input, direct name match

2. Form
   priority: high
   reasons: login form, grouped input flow
```

### 7.5 recommend 정의

#### 목적

주어진 query를 기준으로 특정 페이지나 플로우에 적절한 컴포넌트 세트를 추천한다.

#### 입력

- `query: string`
- `adapter?: string`
- `format?: text | json`

#### 출력

추천 우선순위 기준으로 정렬된 컴포넌트 목록을 반환한다.

사용자에게는 아래 정보 위주로 보여준다.

- `name`
- `priority`
- `reasons`

#### 예시

```bash
ds-ai recommend --adapter custom "login page"
```

예상 text 출력 예시:

```text
1. Form
   priority: high
   reasons: grouped input flow, login form pattern

2. Input
   priority: high
   reasons: login field, validated input

3. Button
   priority: medium
   reasons: submit action
```

### 7.6 generate 정의

#### 목적

주어진 query를 기준으로 실제 UI 조합 결과를 생성한다.

#### 입력

- `query: string`
- `adapter?: string`
- `format?: text | json`

#### 출력

초기 MVP에서는 아래 세 가지를 함께 반환하는 방향으로 정리한다.

- `selectedComponents`
- `jsx`
- `rationale`

즉 단순히 JSX만 반환하는 것이 아니라, 어떤 컴포넌트를 왜 골랐는지도 함께 설명할 수 있게 한다.

#### 예시

```bash
ds-ai generate --adapter custom "login page"
```

예상 json 출력 예시:

```json
{
  "selectedComponents": ["Form", "Input", "Input", "Button"],
  "jsx": "<Form><Input /><Input /><Button>Login</Button></Form>",
  "rationale": [
    "Form is needed for grouped input flow",
    "Two Input fields are needed for email and password",
    "Button is needed for submission"
  ]
}
```

### 7.7 score 대신 priority를 쓰는 이유

현재 내부 구현은 heuristic 기반 점수 계산을 사용하고 있다.

하지만 이 점수는 내부 ranking을 위한 값일 뿐, 사용자에게 그대로 노출하기에는 적절하지 않다고 판단했다.

그 이유는 다음과 같다.

- 절대적인 의미를 가지는 점수가 아니다.
- 100을 넘는 값도 나올 수 있어 사용자 입장에서 해석이 어렵다.
- 점수를 노출하면 "왜 107점인가" 같은 추가 설명 요구가 생긴다.
- 현재 단계에서는 점수보다 우선순위와 이유를 보여주는 것이 더 자연스럽다.

따라서 현재 판단은 다음과 같다.

- 내부 구현: `score` 유지
- 사용자 출력: `priority` 중심

우선 `priority`는 다음 세 단계로 시작한다.

- `high`
- `medium`
- `low`

즉 내부에서는 score를 계속 사용하되, CLI 출력에서는 사용자 친화적인 우선순위 개념으로 변환해 보여주는 방향을 기본으로 한다.
