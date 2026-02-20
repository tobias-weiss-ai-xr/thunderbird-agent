# Add AI Configuration to OpenCode Config

## TL;DR
> **Quick Summary**: Add AI provider configuration to thunderbird-mcp-server section in OpenCode config
> 
> **Deliverables**: Modified `~/.config/opencode/opencode.json` with AI settings
> 
> **Estimated Effort**: Short
> **Parallel Execution**: NO - single file edit
> **Critical Path**: Single edit operation

---

## Context

### Original Request
Add AI configuration settings to the OpenCode config file for the thunderbird-mcp-server, enabling it to use rule-based or external AI providers (OpenAI, Anthropic, etc.) for email analysis, categorization, and draft generation features.

### Interview Summary
**Key Discussions**:
- AI service has been implemented in `src/utils/aiService.ts` with pluggable backends
- Configuration uses environment variables: `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `AI_ENDPOINT`
- Default is rule-based (free, no API key needed)
- OpenCode config already has thunderbird-mcp-server configured with Bun runtime

**Research Findings**:
- OpenCode config located at `~/.config/opencode/opencode.json`
- Current thunderbird-mcp-server config uses Python command (different project)
- Need to add `env` section to pass environment variables to MCP server

### Metis Review
**Identified Gaps** (addressed):
- None - straightforward configuration addition

---

## Work Objectives

### Core Objective
Add AI configuration environment variables to the thunderbird-mcp-server section in OpenCode config to enable AI features for email analysis, categorization, and draft generation.

### Concrete Deliverables
- Modified `~/.config/opencode/opencode.json` with AI environment variables

### Definition of Done
- [ ] OpenCode config has `env` section in thunderbird-mcp-server
- [ ] AI_PROVIDER is set (default: "rule-based")
- [ ] AI_MODEL is set (default: "glm-4.7")
- [ ] ENABLE_HTTP_SERVER is set (default: "false" for testing)

### Must Have
- AI configuration in env section of thunderbird-mcp-server
- No breaking changes to existing config
- Default values provided (rule-based, no API key required)

### Must NOT Have (Guardrails)
- Do not modify other MCP server entries in config
- Do not require API keys (rule-based should work out-of-the-box)
- Do not enable HTTP server by default (should be false for testing)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (OpenCode config file exists)
- **Automated tests**: Tests-after (verify config is valid JSON)
- **Framework**: None (JSON file editing)
- **If TDD**: N/A

### QA Policy
Every task MUST include agent-executed QA scenarios (see TODO template below).
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Configuration Files**: Use Bash to validate JSON syntax and verify structure
- **Environment Variables**: Verify they're properly formatted
- Each scenario = exact tool + exact steps + exact assertions + evidence path.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Add AI configuration to OpenCode config [quick]
```

### Dependency Matrix

- **1**: — — 

### Agent Dispatch Summary

- **1**: **1** — T1 → `quick`

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**

- [ ] 1. Add AI configuration to OpenCode config

  **What to do**:
  - Read current `~/.config/opencode/opencode.json` file
  - Add `env` section to thunderbird-mcp-server entry with AI configuration:
    ```json
    "env": {
      "AI_PROVIDER": "rule-based",
      "AI_MODEL": "glm-4.7",
      "ENABLE_HTTP_SERVER": "false"
    }
    ```
  - Ensure JSON remains valid (no syntax errors)
  - Preserve all existing configuration

  **Must NOT do**:
  - Do not modify other MCP server entries
  - Do not remove existing configuration
  - Do not require API keys (use rule-based default)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Single file edit, straightforward JSON modification
  - **Skills**: None needed - simple file editing

  **Parallelization**:
  - **Can Run In Parallel**: NO | Sequential
  - **Parallel Group**: Wave 1 (single task)
  - **Blocks**: None
  - **Blocked By**: None

  **References** (CRITICAL - Be exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `~/.config/opencode/opencode.json:12-24` - Example of env section configuration pattern

  **API/Type References** (contracts to implement against):
  - JSON configuration format - must be valid JSON after edit

  **Test References** (testing patterns to follow):
  - Use Bash `cat` and `jq` or Python `json.load` to validate JSON syntax

  **External References** (libraries and frameworks):
  - OpenCode config file format documentation (if available)

  **WHY Each Reference Matters** (explain the relevance):
  - OpenCode config must remain valid JSON or server won't load it
  - Following existing env section patterns ensures consistency

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  **Tests-after:**
  - [ ] Config file is valid JSON after edit
  - [ ] thunderbird-mcp-server entry contains env section
  - [ ] AI_PROVIDER is set to "rule-based"
  - [ ] AI_MODEL is set to "glm-4.7"
  - [ ] ENABLE_HTTP_SERVER is set to "false"

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.
  >
  > **The executing agent MUST run these scenarios after implementation.**
  > **The orchestrator WILL verify evidence files exist before marking task complete.**

  ```
  Scenario: Config file is valid JSON after edit
    Tool: Bash
    Preconditions: Config file exists at ~/.config/opencode/opencode.json
    Steps:
      1. cat ~/.config/opencode/opencode.json | python -m json.tool > /dev/null
      2. Check exit code is 0 (valid JSON)
    Expected Result: Exit code 0, no JSON parsing errors
    Failure Indicators: Exit code non-zero, JSON syntax errors printed
    Evidence: .sisyphus/evidence/task-1-json-validation.log

  Scenario: thunderbird-mcp-server has env section with AI config
    Tool: Bash
    Preconditions: Config file has been edited
    Steps:
      1. python -c "import json; config = json.load(open(r'C:\Users\Tobias\.config\opencode\opencode.json')); server = config['mcp']['thunderbird-mcp-server']; env = server.get('env', {}); print(f\"AI_PROVIDER={env.get('AI_PROVIDER')}\""
      2. Verify AI_PROVIDER exists and equals "rule-based"
      3. Verify AI_MODEL exists and equals "glm-4.7"
      4. Verify ENABLE_HTTP_SERVER exists and equals "false"
    Expected Result: All four environment variables are present with correct values
    Failure Indicators: Missing variables or incorrect values
    Evidence: .sisyphus/evidence/task-1-env-verification.log
  ```

  **Evidence to Capture:**
  - [ ] JSON validation output
  - [ ] Environment variable verification output

  **Commit**: NO | 

---

## Final Verification Wave

All verification tasks complete when:
- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

---

## Commit Strategy

No commit needed - this is a local configuration file change.

---

## Success Criteria

### Verification Commands
```bash
# Validate config file JSON
python -m json.tool ~/.config/opencode/opencode.json > /dev/null && echo "JSON OK" || echo "JSON INVALID"

# Verify env section exists
python -c "import json; config = json.load(open(r'C:\Users\Tobias\.config\opencode\opencode.json')); server = config['mcp']['thunderbird-mcp-server']; env = server.get('env', {}); print('Has env:', 'env' in server)"
```

### Final Checklist
- [ ] OpenCode config has env section in thunderbird-mcp-server
- [ ] AI_PROVIDER = "rule-based"
- [ ] AI_MODEL = "glm-4.7"
- [ ] ENABLE_HTTP_SERVER = "false"
- [ ] Config file is valid JSON
- [ ] No syntax errors in config file
