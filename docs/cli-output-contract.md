# CLI Output Contract

작성일: 2026-03-25

## 1. 목적

이 문서는 `ds-ai` CLI의 JSON 출력 계약을 고정하기 위한 명세다.

- 대상 command: `search`, `recommend`, `generate`
- 범위: `--format json` 출력
- 목표: AI 교체/확장 시에도 CLI consumer가 파싱 계약을 안정적으로 유지할 수 있게 한다.

## 2. 공통 규칙

- `command`: 실행한 command 이름과 반드시 일치해야 한다.
- `adapter`: 현재는 `"custom"`만 허용한다.
- `query`: 사용자 입력 원문 문자열.
- `status`:
  - search/recommend: `"ok"` | `"no_match"`
  - generate: `"ok"` | `"fallback"` | `"error"` (현재 구현은 `"ok"`/`"fallback"`)

## 3. search / recommend 계약

```json
{
  "command": "search | recommend",
  "adapter": "custom",
  "query": "string",
  "status": "ok | no_match",
  "results": [
    {
      "name": "string",
      "category": "action | layout | surface | input | form | icon",
      "priority": "high | medium | low",
      "description": "string",
      "reasons": ["string"]
    }
  ],
  "meta": {
    "intentSource": "ai | fallback",
    "provider": "gemini | openai",
    "model": "string",
    "queryType": "component | section | page",
    "scope": "component | standalone_section | page_section | page",
    "needsLayout": "true | false",
    "confidence": "0.00 ~ 1.00 (string)",
    "strategy": "single_component | form_flow | listing | scaffold",
    "intentTags": "comma-separated string",
    "note": "string"
  }
}
```

주의:

- `meta`는 `search`에서는 생략될 수 있다.
- `recommend`에서는 `meta.intentSource`를 항상 포함한다.
- `results`는 빈 배열일 수 있다.

## 4. generate 계약

```json
{
  "command": "generate",
  "adapter": "custom",
  "query": "string",
  "status": "ok | fallback | error",
  "selectedComponents": ["string"],
  "jsx": "string",
  "rationale": ["string"],
  "meta": {
    "intentSource": "ai | fallback",
    "provider": "gemini | openai",
    "model": "string",
    "queryType": "component | section | page",
    "scope": "component | standalone_section | page_section | page",
    "needsLayout": "true | false",
    "confidence": "0.00 ~ 1.00 (string)",
    "strategy": "single_component | form_flow | listing | scaffold",
    "intentTags": "comma-separated string",
    "note": "string"
  }
}
```

주의:

- `selectedComponents`, `jsx`, `rationale`는 `generate`에서 항상 포함한다.
- `meta`는 AI/fallback 경로 정보를 담으며 생략될 수 있다.

## 5. 계약 변경 원칙

- 필드 삭제/이름 변경은 breaking change로 취급한다.
- enum 확장은 가능하지만, 기존 값의 의미를 바꾸지 않는다.
- 계약 변경 시 다음을 같이 갱신한다.
  - `scripts/validate-cli-contract.mjs`
  - `docs/example-query-set.md` (필요 시)
