# Email Search Enhancement for Thunderbird MCP

## TL;DR

> **Quick Summary**: Enhance the existing `fetch_emails` MCP tool with advanced search capabilities including text search, date range filtering, sorting, and boolean filters while maintaining backward compatibility.
>
> **Deliverables**:
> - Enhanced `fetch_emails` tool with 4 new search parameter types
> - Updated Thunderbird extension with advanced filtering logic
> - Comprehensive TDD test suite with >80% coverage
> - Updated documentation (AGENTS.md files)
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Type definitions → Tool enhancement → Extension update → Tests

---

## Context

### Original Request
User requested implementation of "find mail" functionality with advanced search capabilities for the Thunderbird MCP server. After research discussion, confirmed approach to enhance existing `fetch_emails` tool rather than creating separate search tools.

### Interview Summary
**Key Discussions**:
- **Feature scope**: All four features confirmed - text search, date range, sorting, boolean filters
- **Approach**: Enhance existing `fetch_emails` tool (not create new tools)
- **Test strategy**: TDD (Test-Driven Development) with RED-GREEN-REFACTOR cycle
- **Integration**: Maintain backward compatibility with existing parameters (accountId, folderId, limit)

**Research Findings**:
- **Current implementation**: `fetch_emails` in src/index.ts:23-64 calls `emailService.fetchEmails()` in src/modules/emailService.ts:17-41
- **Extension integration**: `handleFetchEmails()` in extension/background.js uses browser.accounts.list(), browser.folders.list(), browser.messages.list()
- **Thunderbird API**: browser.messages.query() supports full-text search, date ranges, sorting, boolean filters
- **Test patterns**: Existing tests use mocked `browser` global with jest.fn().mockResolvedValue()

### Metis Review
**Identified Gaps** (addressed):
- **Search semantics**: Applied sensible defaults (case-insensitive, inclusive dates, newest-first, AND logic)
- **Error handling**: Defined clear HTTP status codes and error messages
- **Edge cases**: Documented 10+ categories with handling strategies
- **Guardrails**: Set explicit scope boundaries to prevent creep (no advanced query syntax, no caching, no cross-folder search)

---

## Work Objectives

### Core Objective
Extend the `fetch_emails` MCP tool to support advanced email search while maintaining backward compatibility and following existing codebase patterns.

### Concrete Deliverables
- Enhanced `fetch_emails` tool with new parameters: `query`, `fromDate`, `toDate`, `sortBy`, `isUnread`, `isStarred`, `hasAttachments`
- Updated `handleFetchEmails()` in extension/background.js to implement advanced filtering
- Type definitions for new search parameters
- Comprehensive TDD test suite with unit and integration tests
- Updated AGENTS.md documentation files

### Definition of Done
- [ ] All 4 search features work independently and in combination
- [ ] All new tests pass (>80% coverage)
- [ ] TypeScript compilation succeeds with no errors
- [ ] Backward compatibility maintained (existing parameters work unchanged)
- [ ] Documentation updated across all AGENTS.md files

### Must Have
- Text search parameter with case-insensitive substring matching
- Date range filtering with inclusive boundaries (ISO 8601 format)
- Sorting by date (newest/oldest), subject, and sender
- Boolean filters for unread, starred, and attachment status
- Backward compatibility with existing accountId, folderId, limit parameters
- Input validation on MCP server side with clear error messages
- TDD test coverage for all search features

### Must NOT Have (Guardrails)
- **Advanced search syntax**: No regex, wildcards, proximity searches, or query operators (AND/OR/NOT)
- **Cross-folder search**: Search scope limited to single folder specified by folderId
- **Result enrichment**: No highlighting, snippets, or context windows
- **Search persistence**: No saved searches, search history, or caching
- **Bulk operations**: No actions on search results (mark read, delete, move)
- **Additional filters**: No sender domain filtering, attachment type filtering, priority flags beyond starred
- **Pagination**: No server-side pagination beyond existing limit parameter
- **Breaking changes**: No changes to existing fetch_emails tool signature or response format

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: YES (Jest, test patterns in tests/emailService.test.ts)
- **Automated tests**: TDD (RED-GREEN-REFACTOR cycle)
- **Framework**: Jest
- **If TDD**: Each task follows RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios (see TODO template below).
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Not applicable (CLI/MCP server only)
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Library/Module**: Use Bash (bun/node REPL) — Import, call functions, compare output

---

## Execution Strategy

### Parallel Execution Waves

> Maximize throughput by grouping independent tasks into parallel waves.
> Each wave completes before next begins.
> Target: 5-8 tasks per wave. Fewer than 3 per wave (except final) = under-splitting.

```
Wave 1 (Start Immediately — foundation + types + test scaffolding):
├── Task 1: Create search parameter type definitions [quick]
├── Task 2: Write failing tests for text search (RED) [quick]
├── Task 3: Write failing tests for date range filters (RED) [quick]
├── Task 4: Write failing tests for sorting options (RED) [quick]
├── Task 5: Write failing tests for boolean filters (RED) [quick]
├── Task 6: Write failing tests for parameter validation (RED) [quick]
└── Task 7: Write failing tests for error handling (RED) [quick]

Wave 2 (After Wave 1 — implement MCP server changes, MAX PARALLEL):
├── Task 8: Implement text search in emailService.fetchEmails() (GREEN) [unspecified-high]
├── Task 9: Implement date range filtering in emailService.fetchEmails() (GREEN) [unspecified-high]
├── Task 10: Implement sorting in emailService.fetchEmails() (GREEN) [unspecified-high]
├── Task 11: Implement boolean filters in emailService.fetchEmails() (GREEN) [unspecified-high]
├── Task 12: Add parameter validation to fetch_emails tool (GREEN) [unspecified-high]
├── Task 13: Refactor and optimize emailService implementation (REFACTOR) [deep]
└── Task 14: Update fetch_emails tool signature and JSDoc (GREEN) [quick]

Wave 3 (After Wave 2 — extension integration, MAX PARALLEL):
├── Task 15: Implement text search in extension/background.js handleFetchEmails() (GREEN) [unspecified-high]
├── Task 16: Implement date range filtering in extension (GREEN) [unspecified-high]
├── Task 17: Implement sorting in extension (GREEN) [unspecified-high]
├── Task 18: Implement boolean filters in extension (GREEN) [unspecified-high]
├── Task 19: Add parameter validation to extension (GREEN) [unspecified-high]
├── Task 20: Integration test: end-to-end search scenarios (GREEN) [deep]
└── Task 21: Refactor extension code for clarity (REFACTOR) [deep]

Wave 4 (After Wave 3 — documentation + final verification):
├── Task 22: Update AGENTS.md with new search functionality [writing]
├── Task 23: Update src/AGENTS.md with emailService changes [writing]
├── Task 24: Run test suite and verify >80% coverage [quick]
└── Task 25: TypeScript compilation and type checking [quick]

Wave FINAL (After ALL tasks — independent review, 4 parallel):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: Task 1 → Task 2-7 (parallel) → Task 8-14 (parallel) → Task 15-21 (parallel) → Task 22-25 → F1-F4
Parallel Speedup: ~75% faster than sequential
Max Concurrent: 7 (Waves 1-3)
```

### Dependency Matrix (abbreviated — show ALL tasks in your generated plan)

- **1**: — — 2-7, 8-14
- **2-7**: 1 — 8, 9, 10, 11, 12, 13
- **8**: 2, 3, 4, 5, 6, 7, 1 — 13, 14, 15
- **9**: 3, 1 — 13, 14, 16
- **10**: 4, 1 — 13, 14, 17
- **11**: 5, 1 — 13, 14, 18
- **12**: 6, 1 — 13, 14, 19
- **13**: 8, 9, 10, 11, 12, 1 — 14, 15
- **14**: 8, 9, 10, 11, 12, 13, 1 — 22, 23, 24, 25
- **15**: 8, 13, 14 — 20, 21
- **16**: 9, 13, 14 — 20, 21
- **17**: 10, 13, 14 — 20, 21
- **18**: 11, 13, 14 — 20, 21
- **19**: 12, 13, 14 — 20, 21
- **20**: 15, 16, 17, 18, 19 — 21, 22, 23, 24, 25
- **21**: 15, 16, 17, 18, 19, 20 — 22, 23, 24, 25
- **22**: 14, 20, 21 — F1, F4
- **23**: 14, 20, 21 — F1, F4
- **24**: 14, 20, 21 — F1, F2
- **25**: 14, 20, 21 — F1, F2
- **F1-F4**: 22, 23, 24, 25 ——

> This is abbreviated for reference. YOUR generated plan must include the FULL matrix for ALL tasks.

### Agent Dispatch Summary

- **1**: **7** — T1 → `quick`, T2-T7 → `quick`
- **2**: **7** — T8-T11 → `unspecified-high`, T12 → `unspecified-high`, T13 → `deep`, T14 → `quick`
- **3**: **7** — T15-T18 → `unspecified-high`, T19 → `unspecified-high`, T20 → `deep`, T21 → `deep`
- **4**: **4** — T22 → `writing`, T23 → `writing`, T24 → `quick`, T25 → `quick`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**

- [ ] 1. **Create search parameter type definitions**

  **What to do**:
  - Create TypeScript interface definitions for new search parameters in `src/types/email.ts`
  - Define `SearchQuery` interface with optional fields: `query`, `fromDate`, `toDate`, `sortBy`, `isUnread`, `isStarred`, `hasAttachments`
  - Define `SortOrder` enum: "date-asc", "date-desc", "subject-asc", "subject-desc", "from-asc", "from-desc"
  - Add JSDoc comments documenting each parameter's purpose and format
  - Ensure type safety and null handling

  **Must NOT do**:
  - Change existing `FetchRequest` type structure (extend with new optional fields)
  - Create separate interfaces for each parameter (single `SearchQuery` interface)
  - Add validation logic to type definitions (that's for validation task)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Type definition task - straightforward, well-defined, no business logic
  - **Skills**: [] (no special skills needed for TypeScript type definitions)
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed (no git operations)
    - `superpowers/test-driven-development`: Not needed yet (tests come in next tasks)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2-7)
  - **Blocks**: [Tasks 2-7]
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `src/types/email.ts:FetchRequest` - Follow existing parameter interface pattern
  - `src/types/email.ts:Email` - Follow existing email object structure

  **API/Type References** (contracts to implement against):
  - Thunderbird WebExtension API docs (from research) - Parameter naming conventions (e.g., "fromDate", "toDate")

  **Test References** (testing patterns to follow):
  - `tests/emailService.test.ts:1-50` - Existing test structure and mock patterns

  **External References** (libraries and frameworks):
  - TypeScript handbook - Optional type syntax and interface composition

  **WHY Each Reference Matters** (explain the relevance):
  - `src/types/email.ts`: Shows current parameter pattern - match naming and structure
  - Thunderbird API docs: Ensures parameter names match API expectations for extension integration

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  **If TDD (tests enabled):**
  - [ ] Type definitions created in `src/types/email.ts`
  - [ ] TypeScript compilation succeeds: `tsc --noEmit src/types/email.ts` → PASS

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.
  >
  > **The executing agent MUST run these scenarios after implementation.**
  > **The orchestrator WILL verify evidence files exist before marking task complete.**

  ```
  Scenario: Type definitions compile successfully
    Tool: Bash (bun/node)
    Preconditions: Node.js/Bun runtime available
    Steps:
      1. Compile TypeScript: `tsc --noEmit src/types/email.ts`
      2. Check exit code (should be 0 for success)
    Expected Result: Exit code 0, no compilation errors
    Failure Indicators: TypeScript compilation errors, type mismatches, syntax errors
    Evidence: .sisyphus/evidence/task-1-type-compile.txt

  Scenario: Interface matches expected structure
    Tool: Bash (node)
    Preconditions: src/types/email.ts exists
    Steps:
      1. Import SearchQuery interface: `node -e "const {SearchQuery} = require('./src/types/email.ts'); console.log(Object.keys(new SearchQuery()))"`
      2. Verify expected fields exist in output
    Expected Result: Fields: query, fromDate, toDate, sortBy, isUnread, isStarred, hasAttachments (all optional)
    Failure Indicators: Missing fields, incorrect field types, non-optional fields
    Evidence: .sisyphus/evidence/task-1-interface-structure.txt
  ```

  > **Specificity requirements — every scenario MUST use:**
  > - **Selectors**: Specific CSS selectors (`.login-button`, not "the login button")
  > - **Data**: Concrete test data (`"test@example.com"`, not `"[email]"`)
  > - **Assertions**: Exact values (`text contains "Welcome back"`, not "verify it works")
  > - **Timing**: Wait conditions where relevant (`timeout: 10s`)
  > - **Negative**: At least ONE failure/error scenario per task
  >
  > **Anti-patterns (your scenario is INVALID if it looks like this):**
  > - ❌ "Verify it works correctly" — HOW? What does "correctly" mean?
  > - ❌ "Check the API returns data" — WHAT data? What fields? What values?
  > - ❌ "Test the component renders" — WHERE? What selector? What content?
  > - ❌ Any scenario without an evidence path

  **Evidence to Capture:**
  - [ ] Each evidence file named: task-{N}-{scenario-slug}.{ext}
  - [ ] Screenshots for UI, terminal output for CLI, response bodies for API

  **Commit**: NO (wait for Wave 1 completion)
  - Message: N/A

- [ ] 2. **Write failing tests for text search (RED)**

  **What to do**:
  - Write unit tests in `tests/emailService.test.ts` for text search functionality
  - Test case-sensitive and case-insensitive search (should be case-insensitive per defaults)
  - Test substring matching (query="project" matches "project management")
  - Test empty query returns all emails
  - Test no matches returns empty array
  - Mock browser.messages.query() to return filtered results based on query parameter
  - All tests should FAIL initially (RED state)

  **Must NOT do**:
  - Implement actual text search logic in emailService (that's Task 8)
  - Write integration tests yet (that's Task 20)
  - Test with actual Thunderbird instance (use mocks only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Test writing task - straightforward test cases, following existing patterns
  - **Skills**: [`superpowers/test-driven-development`]
    - `superpowers/test-driven-development`: Critical for TDD approach - ensures RED state before implementation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3-7)
  - **Blocks**: [Task 8]
  - **Blocked By**: [Task 1]

  **References**:
  - `tests/emailService.test.ts:describe("fetchEmails")` - Existing test structure and patterns
  - `tests/emailService.test.ts:mock(browser)` - How to mock browser API
  - `src/modules/emailService.ts:fetchEmails()` - Function being tested
  - Jest documentation - Test writing patterns and assertions

  **Acceptance Criteria**:
  - [ ] Test file updated with text search tests
  - [ ] All tests FAIL (RED state): `bun test tests/emailService.test.ts` → FAIL (expected failure)

  **QA Scenarios**:
  ```
  Scenario: Text search tests exist and fail (RED state)
    Tool: Bash (bun test)
    Preconditions: Tests written in tests/emailService.test.ts, no implementation yet
    Steps:
      1. Run Jest tests: `bun test tests/emailService.test.ts --testNamePattern="text search"`
      2. Check test output for failures
    Expected Result: All text search tests FAIL (implementation not yet written)
    Failure Indicators: Tests PASS (incorrect - should be RED state), syntax errors in test file
    Evidence: .sisyphus/evidence/task-2-red-state.txt

  Scenario: Test coverage includes text search scenarios
    Tool: Bash (bun test)
    Preconditions: Tests written
    Steps:
      1. Run tests with coverage: `bun test tests/emailService.test.ts --coverage --testNamePattern="text search"`
      2. Check coverage report for emailService
    Expected Result: Coverage report generated, text search tests counted
    Failure Indicators: No coverage generated, 0 tests executed
    Evidence: .sisyphus/evidence/task-2-coverage-report.txt
  ```

  **Evidence to Capture**:
  - [ ] Each evidence file named: task-{N}-{scenario-slug}.{ext}

  **Commit**: NO (wait for Wave 1 completion)

- [ ] 3. **Write failing tests for date range filters (RED)**

  **What to do**:
  - Write unit tests for date range filtering in `tests/emailService.test.ts`
  - Test fromDate only (emails from that date forward)
  - Test toDate only (emails up to that date)
  - Test both fromDate and toDate together (range)
  - Test inclusive boundaries (email at boundary date included)
  - Test invalid date format returns error
  - Test fromDate > toDate returns error
  - Mock browser API to return filtered results
  - All tests should FAIL (RED state)

  **Must NOT do**:
  - Implement date filtering logic (Task 9)
  - Test with actual dates beyond mock data

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-2, 4-7)
  - **Blocks**: [Task 9]
  - **Blocked By**: [Task 1]

  **References**:
  - `tests/emailService.test.ts:describe("fetchEmails")` - Test structure
  - `src/types/email.ts:SearchQuery` - Date field definitions
  - Thunderbird WebExtension API docs - Date format expectations (ISO 8601)

  **Acceptance Criteria**:
  - [ ] Date range tests written
  - [ ] All tests FAIL: `bun test tests/emailService.test.ts --testNamePattern="date range"` → FAIL

  **QA Scenarios**:
  ```
  Scenario: Date range tests fail (RED state)
    Tool: Bash (bun test)
    Preconditions: Tests written, no implementation
    Steps:
      1. Run tests: `bun test tests/emailService.test.ts --testNamePattern="date range"`
      2. Verify failures
    Expected Result: All date range tests FAIL
    Failure Indicators: Tests pass, syntax errors
    Evidence: .sisyphus/evidence/task-3-red-state.txt
  ```

  **Evidence to Capture**:
  - [ ] task-3-red-state.txt

  **Commit**: NO (wait for Wave 1 completion)

- [ ] 4. **Write failing tests for sorting options (RED)**

  **What to do**:
  - Write unit tests for sorting functionality in `tests/emailService.test.ts`
  - Test sort by date (newest first and oldest first)
  - Test sort by subject (alphabetical A-Z and Z-A)
  - Test sort by sender (from) (A-Z and Z-A)
  - Test default sort behavior (should be date-desc per defaults)
  - Test invalid sortBy returns error
  - Mock browser API to return sorted results
  - All tests should FAIL (RED state)

  **Must NOT do**:
  - Implement sorting logic (Task 10)
  - Test sorting stability (ties handled by browser API)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-3, 5-7)
  - **Blocks**: [Task 10]
  - **Blocked By**: [Task 1]

  **References**:
  - `tests/emailService.test.ts` - Test patterns
  - `src/types/email.ts:SortOrder` - Sort enum definition
  - Thunderbird API docs - Sorting parameter names and values

  **Acceptance Criteria**:
  - [ ] Sorting tests written
  - [ ] All tests FAIL: `bun test tests/emailService.test.ts --testNamePattern="sorting"` → FAIL

  **QA Scenarios**:
  ```
  Scenario: Sorting tests fail (RED state)
    Tool: Bash (bun test)
    Preconditions: Tests written, no implementation
    Steps:
      1. Run tests: `bun test tests/emailService.test.ts --testNamePattern="sorting"`
      2. Verify failures
    Expected Result: All sorting tests FAIL
    Failure Indicators: Tests pass
    Evidence: .sisyphus/evidence/task-4-red-state.txt
  ```

  **Evidence to Capture**:
  - [ ] task-4-red-state.txt

  **Commit**: NO (wait for Wave 1 completion)

- [ ] 5. **Write failing tests for boolean filters (RED)**

  **What to do**:
  - Write unit tests for boolean filters in `tests/emailService.test.ts`
  - Test isUnread filter (only unread emails)
  - Test isStarred filter (only starred emails)
  - Test hasAttachments filter (only emails with attachments)
  - Test multiple filters together (AND logic)
  - Test filter=false (exclude emails with that property)
  - Mock browser API to return filtered results
  - All tests should FAIL (RED state)

  **Must NOT do**:
  - Implement filter logic (Task 11)
  - Test filter precedence (filters AND with search)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-4, 6-7)
  - **Blocks**: [Task 11]
  - **Blocked By**: [Task 1]

  **References**:
  - `tests/emailService.test.ts` - Test patterns
  - `src/types/email.ts:SearchQuery` - Boolean field definitions
  - Thunderbird API docs - Boolean filter parameter names

  **Acceptance Criteria**:
  - [ ] Boolean filter tests written
  - [ ] All tests FAIL: `bun test tests/emailService.test.ts --testNamePattern="boolean filters"` → FAIL

  **QA Scenarios**:
  ```
  Scenario: Boolean filter tests fail (RED state)
    Tool: Bash (bun test)
    Preconditions: Tests written, no implementation
    Steps:
      1. Run tests: `bun test tests/emailService.test.ts --testNamePattern="boolean filters"`
      2. Verify failures
    Expected Result: All boolean filter tests FAIL
    Failure Indicators: Tests pass
    Evidence: .sisyphus/evidence/task-5-red-state.txt
  ```

  **Evidence to Capture**:
  - [ ] task-5-red-state.txt

  **Commit**: NO (wait for Wave 1 completion)

- [ ] 6. **Write failing tests for parameter validation (RED)**

  **What to do**:
  - Write unit tests for input parameter validation in `tests/emailService.test.ts`
  - Test invalid date format returns 400 error
  - Test invalid sortBy value returns 400 error with valid options
  - Test fromDate > toDate returns 400 error
  - Test missing required params (accountId, folderId) returns 400
  - Test invalid boolean filter names returns 400 error
  - Test invalid boolean values (strings instead of bool) returns 400
  - All tests should FAIL (RED state - validation not implemented yet)

  **Must NOT do**:
  - Implement validation logic (Task 12)
  - Test beyond MCP server validation (extension validation is separate)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-5, 7)
  - **Blocks**: [Task 12]
  - **Blocked By**: [Task 1]

  **References**:
  - `tests/emailService.test.ts` - Test patterns
  - `src/types/email.ts:SearchQuery` - Parameter type definitions
  - HTTP status code documentation - 400 Bad Request usage

  **Acceptance Criteria**:
  - [ ] Validation tests written
  - [ ] All tests FAIL: `bun test tests/emailService.test.ts --testNamePattern="validation"` → FAIL

  **QA Scenarios**:
  ```
  Scenario: Validation tests fail (RED state)
    Tool: Bash (bun test)
    Preconditions: Tests written, no implementation
    Steps:
      1. Run tests: `bun test tests/emailService.test.ts --testNamePattern="validation"`
      2. Verify failures
    Expected Result: All validation tests FAIL
    Failure Indicators: Tests pass
    Evidence: .sisyphus/evidence/task-6-red-state.txt
  ```

  **Evidence to Capture**:
  - [ ] task-6-red-state.txt

  **Commit**: NO (wait for Wave 1 completion)

- [ ] 7. **Write failing tests for error handling (RED)**

  **What to do**:
  - Write unit tests for error handling scenarios in `tests/emailService.test.ts`
  - Test empty folder returns empty array (no error)
  - Test no matching search results returns empty array (no error)
  - Test invalid accountId returns 404 error
  - Test invalid folderId returns 404 error
  - Test extension timeout handling
  - Test browser API errors propagate correctly
  - All tests should FAIL (RED state - error handling not implemented yet)

  **Must NOT do**:
  - Implement error handling logic (Task 12-13)
  - Test extension communication beyond basic mocking

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-6)
  - **Blocks**: [Task 12]
  - **Blocked By**: [Task 1]

  **References**:
  - `tests/emailService.test.ts` - Test patterns
  - `src/modules/emailService.ts` - Current error handling
  - HTTP status code documentation - 404 Not Found usage

  **Acceptance Criteria**:
  - [ ] Error handling tests written
  - [ ] All tests FAIL: `bun test tests/emailService.test.ts --testNamePattern="error handling"` → FAIL

  **QA Scenarios**:
  ```
  Scenario: Error handling tests fail (RED state)
    Tool: Bash (bun test)
    Preconditions: Tests written, no implementation
    Steps:
      1. Run tests: `bun test tests/emailService.test.ts --testNamePattern="error handling"`
      2. Verify failures
    Expected Result: All error handling tests FAIL
    Failure Indicators: Tests pass
    Evidence: .sisyphus/evidence/task-7-red-state.txt
  ```

  **Evidence to Capture**:
  - [ ] task-7-red-state.txt

  **Commit**: YES (Wave 1 complete - all failing tests written)
  - Message: `test(emails): add failing tests for search functionality (RED)`
  - Files: tests/emailService.test.ts
  - Pre-commit: `bun test tests/emailService.test.ts` (should fail as expected)

- [ ] 8. **Implement text search in emailService.fetchEmails() (GREEN)**

  **What to do**:
  - Implement text search logic in `src/modules/emailService.ts` fetchEmails function
  - Extract `query` parameter from SearchQuery (if provided)
  - Pass query to extension's handleFetchEmails call
  - Use case-insensitive substring matching (default per requirements)
  - Handle empty query string (return all emails, same as no query)
  - Ensure backward compatibility (works without query parameter)
  - Make tests PASS (GREEN state)

  **Must NOT do**:
  - Implement case-sensitive search (defaults to case-insensitive)
  - Implement regex or wildcards (out of scope)
  - Change existing function signature (extend with optional params)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Implementation task with business logic and Thunderbird integration
  - **Skills**: [`superpowers/test-driven-development`]
    - `superpowers/test-driven-development`: Ensure GREEN state achieved by making tests pass

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 9-14)
  - **Blocks**: [Task 13, Task 15]
  - **Blocked By**: [Task 2]

  **References**:
  - `src/modules/emailService.ts:fetchEmails()` - Function to modify
  - `tests/emailService.test.ts:describe("text search")` - Tests to make pass
  - `src/types/email.ts:SearchQuery.query` - Query parameter definition
  - Thunderbird API docs - browser.messages.query() query parameter usage

  **Acceptance Criteria**:
  - [ ] Text search implemented in emailService
  - [ ] Tests PASS: `bun test tests/emailService.test.ts --testNamePattern="text search"` → PASS

  **QA Scenarios**:
  ```
  Scenario: Text search finds matching emails
    Tool: Bash (node - test emailService directly)
    Preconditions: emailService.ts implements text search
    Steps:
      1. Create test email list with query matches
      2. Call fetchEmails with query="urgent"
      3. Verify returned emails contain "urgent" in subject or body
    Expected Result: Only emails with "urgent" returned
    Failure Indicators: Wrong emails returned, case-sensitive matching, empty results when matches exist
    Evidence: .sisyphus/evidence/task-8-text-search-results.json

  Scenario: Text search is case-insensitive
    Tool: Bash (node)
    Preconditions: EmailService implemented
    Steps:
      1. Call fetchEmails with query="meeting"
      2. Verify results include "Meeting", "MEETING", "meeting"
    Expected Result: All case variations returned
    Failure Indicators: Only exact case returned
    Evidence: .sisyphus/evidence/task-8-case-insensitive.json
  ```

  **Evidence to Capture**:
  - [ ] task-8-text-search-results.json
  - [ ] task-8-case-insensitive.json

  **Commit**: NO (wait for Wave 2 completion)

- [ ] 9. **Implement date range filtering in emailService.fetchEmails() (GREEN)**

  **What to do**:
  - Implement date range filtering logic in emailService.fetchEmails
  - Extract `fromDate` and `toDate` parameters (if provided)
  - Pass date filters to extension
  - Implement inclusive boundaries (emails at boundary dates included)
  - Handle ISO 8601 date format parsing
  - Ensure both date filters work together (AND logic)
  - Make tests PASS (GREEN state)

  **Must NOT do**:
  - Implement exclusive boundaries (defaults to inclusive)
  - Implement relative dates (ISO 8601 only per requirements)
  - Change date format (use ISO 8601)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8, 10-14)
  - **Blocks**: [Task 13, Task 16]
  - **Blocked By**: [Task 3]

  **References**:
  - `src/modules/emailService.ts` - Function to modify
  - `tests/emailService.test.ts:describe("date range")` - Tests
  - `src/types/email.ts:SearchQuery.fromDate/toDate` - Date field definitions
  - Thunderbird API docs - Date filtering with fromDate/toDate parameters

  **Acceptance Criteria**:
  - [ ] Date filtering implemented
  - [ ] Tests PASS: `bun test tests/emailService.test.ts --testNamePattern="date range"` → PASS

  **QA Scenarios**:
  ```
  Scenario: Date range filters work correctly
    Tool: Bash (node)
    Preconditions: Date filtering implemented
    Steps:
      1. Create test emails across date range 2024-01-01 to 2024-12-31
      2. Call fetchEmails with fromDate="2024-06-01T00:00:00Z", toDate="2024-06-30T23:59:59Z"
      3. Verify only emails in June 2024 returned
    Expected Result: Only June emails returned (inclusive boundaries)
    Failure Indicators: Wrong date range returned, exclusive boundaries
    Evidence: .sisyphus/evidence/task-9-date-range-results.json

  Scenario: Date boundaries are inclusive
    Tool: Bash (node)
    Preconditions: Date filtering implemented
    Steps:
      1. Create email exactly at fromDate boundary
      2. Call fetchEmails with fromDate boundary
      3. Verify boundary email included
    Expected Result: Boundary email included
    Failure Indicators: Boundary email excluded
    Evidence: .sisyphus/evidence/task-9-boundary-inclusive.json
  ```

  **Evidence to Capture**:
  - [ ] task-9-date-range-results.json
  - [ ] task-9-boundary-inclusive.json

  **Commit**: NO (wait for Wave 2 completion)

- [ ] 10. **Implement sorting in emailService.fetchEmails() (GREEN)**

  **What to do**:
  - Implement sorting logic in emailService.fetchEmails
  - Extract `sortBy` parameter (if provided)
  - Support sort values: "date-asc", "date-desc", "subject-asc", "subject-desc", "from-asc", "from-desc"
  - Default to "date-desc" (newest first) when no sortBy provided
  - Pass sort parameter to extension
  - Handle invalid sortBy values (validation task handles error)
  - Make tests PASS (GREEN state)

  **Must NOT do**:
  - Implement multi-column sorting (single column only per requirements)
  - Change default sort (must be date-desc)
  - Implement sort by fields not in SortOrder enum

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-9, 11-14)
  - **Blocks**: [Task 13, Task 17]
  - **Blocked By**: [Task 4]

  **References**:
  - `src/modules/emailService.ts` - Function to modify
  - `tests/emailService.test.ts:describe("sorting")` - Tests
  - `src/types/email.ts:SortOrder` - Sort enum definition
  - Thunderbird API docs - Sorting parameter syntax

  **Acceptance Criteria**:
  - [ ] Sorting implemented
  - [ ] Tests PASS: `bun test tests/emailService.test.ts --testNamePattern="sorting"` → PASS

  **QA Scenarios**:
  ```
  Scenario: Sorting by date-desc works
    Tool: Bash (node)
    Preconditions: Sorting implemented
    Steps:
      1. Create test emails with different dates (Jan, Feb, Mar)
      2. Call fetchEmails with sortBy="date-desc"
      3. Verify order: Mar, Feb, Jan
    Expected Result: Newest emails first
    Failure Indicators: Oldest first, wrong order
    Evidence: .sisyphus/evidence/task-10-date-sort.json

  Scenario: Default sort is date-desc
    Tool: Bash (node)
    Preconditions: Sorting implemented
    Steps:
      1. Call fetchEmails without sortBy parameter
      2. Verify order is date-desc (newest first)
    Expected Result: Default to date-desc
    Failure Indicators: Different default, unsorted
    Evidence: .sisyphus/evidence/task-10-default-sort.json
  ```

  **Evidence to Capture**:
  - [ ] task-10-date-sort.json
  - [ ] task-10-default-sort.json

  **Commit**: NO (wait for Wave 2 completion)

- [ ] 11. **Implement boolean filters in emailService.fetchEmails() (GREEN)**

  **What to do**:
  - Implement boolean filter logic in emailService.fetchEmails
  - Extract `isUnread`, `isStarred`, `hasAttachments` parameters (if provided)
  - Pass filters to extension
  - Implement AND logic for multiple filters (all must match)
  - Handle filter=false (exclude emails with that property)
  - Make tests PASS (GREEN state)

  **Must NOT do**:
  - Implement OR logic (defaults to AND per requirements)
  - Add additional filters beyond the 3 specified
  - Change filter semantics (true means only, false means exclude)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-10, 12-14)
  - **Blocks**: [Task 13, Task 18]
  - **Blocked By**: [Task 5]

  **References**:
  - `src/modules/emailService.ts` - Function to modify
  - `tests/emailService.test.ts:describe("boolean filters")` - Tests
  - `src/types/email.ts:SearchQuery.isUnread/isStarred/hasAttachments` - Filter definitions
  - Thunderbird API docs - Boolean filter parameter usage

  **Acceptance Criteria**:
  - [ ] Boolean filters implemented
  - [ ] Tests PASS: `bun test tests/emailService.test.ts --testNamePattern="boolean filters"` → PASS

  **QA Scenarios**:
  ```
  Scenario: Boolean filters AND together
    Tool: Bash (node)
    Preconditions: Boolean filters implemented
    Steps:
      1. Create test emails: (unread+starred), (unread+unstarred), (read+starred), (read+unstarred)
      2. Call fetchEmails with isUnread=true, isStarred=true
      3. Verify only unread+starred emails returned
    Expected Result: Only emails matching both filters
    Failure Indicators: OR logic, wrong emails returned
    Evidence: .sisyphus/evidence/task-11-and-logic.json

  Scenario: Filter=true works correctly
    Tool: Bash (node)
    Preconditions: Boolean filters implemented
    Steps:
      1. Create test emails: 3 unread, 2 read
      2. Call fetchEmails with isUnread=true
      3. Verify only 3 unread emails returned
    Expected Result: Only unread emails
    Failure Indicators: All emails returned, wrong count
    Evidence: .sisyphus/evidence/task-11-filter-true.json
  ```

  **Evidence to Capture**:
  - [ ] task-11-and-logic.json
  - [ ] task-11-filter-true.json

  **Commit**: NO (wait for Wave 2 completion)

- [ ] 12. **Add parameter validation to fetch_emails tool (GREEN)**

  **What to do**:
  - Implement input validation in `src/index.ts` fetch_emails tool definition
  - Validate date format (ISO 8601), return 400 error if invalid
  - Validate sortBy value (must be in SortOrder enum), return 400 with valid options if invalid
  - Validate fromDate <= toDate, return 400 error if invalid
  - Validate boolean filter names, return 400 with valid filters if invalid
  - Validate boolean values are actual booleans (not strings)
  - Validate required params (accountId, folderId), return 400 if missing
  - Return clear error messages for each validation failure
  - Make tests PASS (GREEN state)

  **Must NOT do**:
  - Return 500 errors for validation issues (use 400)
  - Return generic error messages (be specific about what's wrong)
  - Validate in extension only (validate on MCP server side)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-11, 13-14)
  - **Blocks**: [Task 13, Task 19]
  - **Blocked By**: [Task 6]

  **References**:
  - `src/index.ts:fetch_emails` - Tool definition to validate
  - `tests/emailService.test.ts:describe("validation")` - Tests
  - `src/types/email.ts:SearchQuery` - Parameter types to validate against
  - HTTP status code docs - 400 Bad Request usage

  **Acceptance Criteria**:
  - [ ] Validation implemented
  - [ ] Tests PASS: `bun test tests/emailService.test.ts --testNamePattern="validation"` → PASS

  **QA Scenarios**:
  ```
  Scenario: Invalid date format returns 400 error
    Tool: Bash (curl)
    Preconditions: Validation implemented, HTTP server running
    Steps:
      1. Call fetch_emails with invalid date: `curl -X POST http://localhost:3476/api/tools/fetch_emails -H "Content-Type: application/json" -d '{"accountId": "test", "folderId": "test", "fromDate": "invalid-date"}'`
      2. Verify HTTP 400 status
      3. Verify error message mentions date format
    Expected Result: 400 status with specific error
    Failure Indicators: 200, 500, generic error
    Evidence: .sisyphus/evidence/task-12-invalid-date.txt

  Scenario: Invalid sortBy returns 400 with valid options
    Tool: Bash (curl)
    Preconditions: Validation implemented
    Steps:
      1. Call fetch_emails with invalid sortBy: `curl -X POST http://localhost:3476/api/tools/fetch_emails -H "Content-Type: application/json" -d '{"accountId": "test", "folderId": "test", "sortBy": "invalid-sort"}'`
      2. Verify 400 status
      3. Verify error lists valid sort options
    Expected Result: 400 with valid options in error message
    Failure Indicators: 200, missing valid options
    Evidence: .sisyphus/evidence/task-12-invalid-sort.txt
  ```

  **Evidence to Capture**:
  - [ ] task-12-invalid-date.txt
  - [ ] task-12-invalid-sort.txt

  **Commit**: NO (wait for Wave 2 completion)

- [ ] 13. **Refactor and optimize emailService implementation (REFACTOR)**

  **What to do**:
  - Refactor `src/modules/emailService.ts` for clarity and maintainability
  - Extract parameter extraction logic to separate function
  - Extract validation logic (if any) to separate function
  - Improve code readability with clear variable names
  - Add JSDoc comments to functions
  - Ensure no performance regression
  - Keep all tests PASS (refactor shouldn't change behavior)

  **Must NOT do**:
  - Change behavior or functionality (only refactor)
  - Add new features (that's implementation tasks 8-12)
  - Remove necessary logic
  - Change function signatures in breaking way

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Code refactoring requires understanding full context and ensuring no behavior change
  - **Skills**: [`superpowers/test-driven-development`]
    - `superpowers/test-driven-development`: Ensure all tests still PASS after refactor

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-12, 14)
  - **Blocks**: [Task 14, Task 15]
  - **Blocked By**: [Tasks 8-12]

  **References**:
  - `src/modules/emailService.ts` - File to refactor
  - `tests/emailService.test.ts` - Ensure all tests pass after refactor
  - Clean Code principles - Refactoring guidelines

  **Acceptance Criteria**:
  - [ ] Code refactored with improved readability
  - [ ] All tests PASS: `bun test tests/emailService.test.ts` → PASS

  **QA Scenarios**:
  ```
  Scenario: Refactor doesn't change behavior
    Tool: Bash (bun test)
    Preconditions: Refactored code
    Steps:
      1. Run all emailService tests: `bun test tests/emailService.test.ts`
      2. Compare test results to pre-refactor baseline
    Expected Result: All tests still PASS
    Failure Indicators: Tests FAIL, behavior changed
    Evidence: .sisyphus/evidence/task-13-refactor-tests.txt

  Scenario: TypeScript compilation succeeds
    Tool: Bash (tsc)
    Preconditions: Refactored code
    Steps:
      1. Compile TypeScript: `tsc --noEmit src/modules/emailService.ts`
      2. Check exit code
    Expected Result: Exit code 0, no errors
    Failure Indicators: Type errors, syntax errors
    Evidence: .sisyphus/evidence/task-13-tsc-check.txt
  ```

  **Evidence to Capture**:
  - [ ] task-13-refactor-tests.txt
  - [ ] task-13-tsc-check.txt

  **Commit**: NO (wait for Wave 2 completion)

- [ ] 14. **Update fetch_emails tool signature and JSDoc (GREEN)**

  **What to do**:
  - Update `src/index.ts` fetch_emails tool definition
  - Add new optional parameters to tool signature: query, fromDate, toDate, sortBy, isUnread, isStarred, hasAttachments
  - Update tool description to document new search capabilities
  - Add parameter descriptions with formats and examples
  - Ensure backward compatibility (all new params optional)
  - Update tool return type documentation

  **Must NOT do**:
  - Change tool name (still fetch_emails)
  - Remove existing parameters (accountId, folderId, limit)
  - Make new parameters required

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Documentation and signature update - straightforward task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-13)
  - **Blocks**: [Tasks 22-23]
  - **Blocked By**: [Tasks 8-12]

  **References**:
  - `src/index.ts:fetch_emails` - Tool definition to update
  - `src/types/email.ts:SearchQuery` - Parameter types
  - AGENTS.md:fetch_emails tool - Current documentation
  - FastMCP documentation - Tool definition format

  **Acceptance Criteria**:
  - [ ] Tool signature updated with new parameters
  - [ ] JSDoc documentation complete
  - [ ] TypeScript compilation passes: `tsc --noEmit src/index.ts` → PASS

  **QA Scenarios**:
  ```
  Scenario: Tool signature includes all new params
    Tool: Bash (tsc)
    Preconditions: Tool updated
    Steps:
      1. Compile src/index.ts: `tsc --noEmit src/index.ts`
      2. Check for type errors
    Expected Result: No type errors
    Failure Indicators: Type mismatches, missing params
    Evidence: .sisyphus/evidence/task-14-tool-signature.txt

  Scenario: Backward compatibility maintained
    Tool: Bash (node)
    Preconditions: Tool updated
    Steps:
      1. Call tool with old params only (accountId, folderId, limit)
      2. Verify no TypeScript errors
      3. Verify old behavior still works
    Expected Result: Old params work, no errors
    Failure Indicators: Breaking changes, type errors
    Evidence: .sisyphus/evidence/task-14-backward-compat.txt
  ```

  **Evidence to Capture**:
  - [ ] task-14-tool-signature.txt
  - [ ] task-14-backward-compat.txt

  **Commit**: YES (Wave 2 complete - MCP server side done)
  - Message: `feat(emails): add advanced search parameters to fetch_emails`
  - Files: src/index.ts, src/modules/emailService.ts, src/types/email.ts
  - Pre-commit: `bun test && tsc --noEmit`

- [ ] 15. **Implement text search in extension/background.js handleFetchEmails() (GREEN)**

  **What to do**:
  - Implement text search filtering in `extension/background.js` handleFetchEmails function
  - Extract `query` parameter from request body
  - Use browser.messages.query() with query parameter for full-text search
  - Implement case-insensitive matching (Thunderbird API default)
  - Handle empty query (return all messages)
  - Return filtered results to MCP server
  - Make tests PASS (GREEN state)

  **Must NOT do**:
  - Implement manual filtering (use browser.messages.query())
  - Change request/response format
  - Break existing non-query functionality

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Extension integration with Thunderbird WebExtension API
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 16-21)
  - **Blocks**: [Task 20]
  - **Blocked By**: [Task 8, Task 13]

  **References**:
  - `extension/background.js:handleFetchEmails()` - Function to modify
  - `tests/emailService.test.ts:describe("text search")` - Tests
  - Thunderbird WebExtension API docs - browser.messages.query() usage
  - Existing handleFetchEmails implementation - Current request/response handling

  **Acceptance Criteria**:
  - [ ] Text search implemented in extension
  - [ ] Tests PASS: `bun test tests/emailService.test.ts --testNamePattern="text search"` → PASS

  **QA Scenarios**:
  ```
  Scenario: Extension filters by query correctly
    Tool: Bash (mock Thunderbird environment)
    Preconditions: Extension implements text search
    Steps:
      1. Mock browser.messages.query() to return filtered results
      2. Call handleFetchEmails with query="urgent"
      3. Verify returned emails contain "urgent"
    Expected Result: Query filtering works in extension
    Failure Indicators: No filtering, wrong filtering
    Evidence: .sisyphus/evidence/task-15-extension-query.json

  Scenario: Case-insensitive matching
    Tool: Bash (mock)
    Preconditions: Extension implemented
    Steps:
      1. Mock messages with "Meeting", "meeting", "MEETING"
      2. Call handleFetchEmails with query="meeting"
      3. Verify all 3 returned
    Expected Result: All case variations
    Failure Indicators: Case-sensitive
    Evidence: .sisyphus/evidence/task-15-case-insensitive-ext.json
  ```

  **Evidence to Capture**:
  - [ ] task-15-extension-query.json
  - [ ] task-15-case-insensitive-ext.json

  **Commit**: NO (wait for Wave 3 completion)

- [ ] 16. **Implement date range filtering in extension (GREEN)**

  **What to do**:
  - Implement date range filtering in extension/background.js handleFetchEmails
  - Extract `fromDate` and `toDate` parameters
  - Use browser.messages.query() with minDate/maxDate parameters
  - Implement inclusive boundaries (API default)
  - Handle both dates together
  - Return filtered results
  - Make tests PASS (GREEN state)

  **Must NOT do**:
  - Implement manual date filtering in JavaScript (use API)
  - Change date format (expect ISO 8601)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 15, 17-21)
  - **Blocks**: [Task 20]
  - **Blocked By**: [Task 9, Task 13]

  **References**:
  - `extension/background.js:handleFetchEmails()` - Function to modify
  - `tests/emailService.test.ts:describe("date range")` - Tests
  - Thunderbird API docs - messages.query() date filtering parameters

  **Acceptance Criteria**:
  - [ ] Date filtering implemented in extension
  - [ ] Tests PASS: `bun test tests/emailService.test.ts --testNamePattern="date range"` → PASS

  **QA Scenarios**:
  ```
  Scenario: Extension filters by date range
    Tool: Bash (mock)
    Preconditions: Extension implements date filtering
    Steps:
      1. Mock messages across date range
      2. Call handleFetchEmails with fromDate/toDate
      3. Verify correct date range returned
    Expected Result: Correct date filtering
    Failure Indicators: Wrong dates, no filtering
    Evidence: .sisyphus/evidence/task-16-extension-date.json
  ```

  **Evidence to Capture**:
  - [ ] task-16-extension-date.json

  **Commit**: NO (wait for Wave 3 completion)

- [ ] 17. **Implement sorting in extension (GREEN)**

  **What to do**:
  - Implement sorting in extension/background.js handleFetchEmails
  - Extract `sortBy` parameter
  - Use browser.messages.query() with sorting parameter
  - Map sortBy values to API sorting:
    - "date-asc" → "date" ascending
    - "date-desc" → "date" descending
    - "subject-asc" → "subject" ascending
    - "subject-desc" → "subject" descending
    - "from-asc" → "author" ascending
    - "from-desc" → "author" descending
  - Default to date-desc if not provided
  - Make tests PASS (GREEN state)

  **Must NOT do**:
  - Implement manual sorting in JavaScript (use API)
  - Change sort direction defaults

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 15-16, 18-21)
  - **Blocks**: [Task 20]
  - **Blocked By**: [Task 10, Task 13]

  **References**:
  - `extension/background.js:handleFetchEmails()` - Function to modify
  - `tests/emailService.test.ts:describe("sorting")` - Tests
  - Thunderbird API docs - messages.query() sorting parameter

  **Acceptance Criteria**:
  - [ ] Sorting implemented in extension
  - [ ] Tests PASS: `bun test tests/emailService.test.ts --testNamePattern="sorting"` → PASS

  **QA Scenarios**:
  ```
  Scenario: Extension sorts results correctly
    Tool: Bash (mock)
    Preconditions: Extension implements sorting
    Steps:
      1. Mock messages with different dates
      2. Call handleFetchEmails with sortBy="date-desc"
      3. Verify newest-first order
    Expected Result: Correct sort order
    Failure Indicators: Wrong order, unsorted
    Evidence: .sisyphus/evidence/task-17-extension-sort.json
  ```

  **Evidence to Capture**:
  - [ ] task-17-extension-sort.json

  **Commit**: NO (wait for Wave 3 completion)

- [ ] 18. **Implement boolean filters in extension (GREEN)**

  **What to do**:
  - Implement boolean filters in extension/background.js handleFetchEmails
  - Extract `isUnread`, `isStarred`, `hasAttachments` parameters
  - Use browser.messages.query() with tag and read status filtering:
    - `isUnread=true` → filter for read: false
    - `isUnread=false` → filter for read: true
    - `isStarred=true` → filter for $label1 (starred tag)
    - `isStarred=false` → exclude $label1
    - `hasAttachments=true` → filter for attachments present
  - Implement AND logic for multiple filters
  - Make tests PASS (GREEN state)

  **Must NOT do**:
  - Implement manual filtering (use API tags and read status)
  - Add additional filter types

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 15-17, 19-21)
  - **Blocks**: [Task 20]
  - **Blocked By**: [Task 11, Task 13]

  **References**:
  - `extension/background.js:handleFetchEmails()` - Function to modify
  - `tests/emailService.test.ts:describe("boolean filters")` - Tests
  - Thunderbird API docs - messages.query() tag filtering, read status filtering

  **Acceptance Criteria**:
  - [ ] Boolean filters implemented in extension
  - [ ] Tests PASS: `bun test tests/emailService.test.ts --testNamePattern="boolean filters"` → PASS

  **QA Scenarios**:
  ```
  Scenario: Extension filters by boolean flags
    Tool: Bash (mock)
    Preconditions: Extension implements boolean filters
    Steps:
      1. Mock messages with various read/starred/attachment states
      2. Call handleFetchEmails with isUnread=true
      3. Verify only unread returned
    Expected Result: Correct boolean filtering
    Failure Indicators: Wrong filtering, no filtering
    Evidence: .sisyphus/evidence/task-18-extension-boolean.json

  Scenario: Multiple filters AND together
    Tool: Bash (mock)
    Preconditions: Extension implements AND logic
    Steps:
      1. Mock messages with combinations
      2. Call handleFetchEmails with isUnread=true, isStarred=true
      3. Verify only unread+starred returned
    Expected Result: AND logic works
    Failure Indicators: OR logic
    Evidence: .sisyphus/evidence/task-18-and-logic-ext.json
  ```

  **Evidence to Capture**:
  - [ ] task-18-extension-boolean.json
  - [ ] task-18-and-logic-ext.json

  **Commit**: NO (wait for Wave 3 completion)

- [ ] 19. **Add parameter validation to extension (GREEN)**

  **What to do**:
  - Implement parameter validation in extension/background.js handleFetchEmails
  - Validate date formats (already done on server, but double-check)
  - Validate sortBy values
  - Validate boolean filter values
  - Return clear error messages for invalid inputs
  - Ensure errors propagate correctly to MCP server
  - Make tests PASS (GREEN state)

  **Must NOT do**:
  - Return generic errors (be specific)
  - Skip validation (validate on both sides)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 15-18, 20-21)
  - **Blocks**: [Task 20]
  - **Blocked By**: [Task 12, Task 13]

  **References**:
  - `extension/background.js:handleFetchEmails()` - Function to validate in
  - `tests/emailService.test.ts:describe("validation")` - Tests
  - Existing error handling in extension - Pattern to follow

  **Acceptance Criteria**:
  - [ ] Validation implemented in extension
  - [ ] Tests PASS: `bun test tests/emailService.test.ts --testNamePattern="validation"` → PASS

  **QA Scenarios**:
  ```
  Scenario: Extension validates parameters
    Tool: Bash (mock)
    Preconditions: Extension implements validation
    Steps:
      1. Call handleFetchEmails with invalid params
      2. Verify error response with details
    Expected Result: Validation errors returned
    Failure Indicators: Invalid params accepted
    Evidence: .sisyphus/evidence/task-19-ext-validation.json
  ```

  **Evidence to Capture**:
  - [ ] task-19-ext-validation.json

  **Commit**: NO (wait for Wave 3 completion)

- [ ] 20. **Integration test: end-to-end search scenarios (GREEN)**

  **What to do**:
  - Write integration tests for combined search functionality in `tests/emailService.test.ts`
  - Test text search + date range together
  - Test text search + boolean filters together
  - Test date range + boolean filters + sorting together
  - Test all 4 feature types together (complex query)
  - Test edge cases: empty results, invalid params
  - Test backward compatibility: old params only
  - Mock full extension chain (MCP server → emailService → extension)
  - All tests should PASS (GREEN state)

  **Must NOT do**:
  - Test with actual Thunderbird (use mocks only per test strategy)
  - Test cross-folder search (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Integration tests require understanding full data flow

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 15-19, 21)
  - **Blocks**: [Task 21]
  - **Blocked By**: [Tasks 15-19]

  **References**:
  - `tests/emailService.test.ts` - Add integration test suite
  - `src/index.ts` - MCP server entry point
  - `src/modules/emailService.ts` - Service layer
  - `extension/background.js` - Extension layer

  **Acceptance Criteria**:
  - [ ] Integration tests written and passing
  - [ ] All tests PASS: `bun test tests/emailService.test.ts` → PASS

  **QA Scenarios**:
  ```
  Scenario: Complex query with all features
    Tool: Bash (bun test)
    Preconditions: Integration tests written
    Steps:
      1. Run test: `bun test tests/emailService.test.ts --testNamePattern="complex query"`
      2. Verify test passes
    Expected Result: Complex query works end-to-end
    Failure Indicators: Test fails, integration broken
    Evidence: .sisyphus/evidence/task-20-complex-query.txt

  Scenario: Backward compatibility maintained
    Tool: Bash (bun test)
    Preconditions: Integration tests written
    Steps:
      1. Run test with old params only
      2. Verify test passes
    Expected Result: Old params work
    Failure Indicators: Breaking changes
    Evidence: .sisyphus/evidence/task-20-backward-compat-int.txt
  ```

  **Evidence to Capture**:
  - [ ] task-20-complex-query.txt
  - [ ] task-20-backward-compat-int.txt

  **Commit**: NO (wait for Wave 3 completion)

- [ ] 21. **Refactor extension code for clarity (REFACTOR)**

  **What to do**:
  - Refactor `extension/background.js` for readability
  - Extract filter logic to separate functions
  - Add clear comments
  - Improve variable naming
  - Ensure no behavior changes
  - Keep all tests PASS

  **Must NOT do**:
  - Change functionality
  - Add new features
  - Break existing paths

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`superpowers/test-driven-development`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 15-20)
  - **Blocks**: [Tasks 22-23]
  - **Blocked By**: [Tasks 15-20]

  **References**:
  - `extension/background.js` - File to refactor
  - `tests/emailService.test.ts` - Ensure tests still pass
  - Clean Code principles - Refactoring guidelines

  **Acceptance Criteria**:
  - [ ] Extension code refactored
  - [ ] All tests PASS: `bun test tests/emailService.test.ts` → PASS

  **QA Scenarios**:
  ```
  Scenario: Refactor doesn't break extension
    Tool: Bash (bun test)
    Preconditions: Extension refactored
    Steps:
      1. Run all tests: `bun test tests/emailService.test.ts`
      2. Compare results
    Expected Result: All tests PASS
    Failure Indicators: Tests fail, behavior changed
    Evidence: .sisyphus/evidence/task-21-ext-refactor.txt
  ```

  **Evidence to Capture**:
  - [ ] task-21-ext-refactor.txt

  **Commit**: YES (Wave 3 complete - implementation done)
  - Message: `feat(extension): implement advanced filtering in handleFetchEmails`
  - Files: extension/background.js
  - Pre-commit: `bun test`

- [ ] 22. **Update AGENTS.md with new search functionality**

  **What to do**:
  - Update `AGENTS.md` (root) with new search features overview
  - Document new fetch_emails parameters: query, fromDate, toDate, sortBy, isUnread, isStarred, hasAttachments
  - Add usage examples for each search feature
  - Update tool documentation section
  - Document backward compatibility
  - Document performance considerations

  **Must NOT do**:
  - Remove existing documentation
  - Document features not implemented (scope guardrails)
  - Change existing doc structure (append/update only)

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Documentation writing requires clear communication

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 23-25)
  - **Blocks**: [Tasks F1, F4]
  - **Blocked By**: [Tasks 14, 20, 21]

  **References**:
  - `AGENTS.md` - File to update
  - `src/index.ts:fetch_emails` - Tool to document
  - `src/types/email.ts:SearchQuery` - Parameter definitions
  - Existing AGENTS.md sections - Documentation style to match

  **Acceptance Criteria**:
  - [ ] AGENTS.md updated with search features
  - [ ] All new parameters documented with examples

  **QA Scenarios**:
  ```
  Scenario: AGENTS.md includes search feature documentation
    Tool: Bash (grep)
    Preconditions: AGENTS.md updated
    Steps:
      1. Search for parameter names: `grep -E "(query|fromDate|toDate|sortBy|isUnread|isStarred|hasAttachments)" AGENTS.md`
      2. Verify all found
    Expected Result: All new parameters documented
    Failure Indicators: Missing parameters, incomplete docs
    Evidence: .sisyphus/evidence/task-22-doc-complete.txt
  ```

  **Evidence to Capture**:
  - [ ] task-22-doc-complete.txt

  **Commit**: NO (wait for Wave 4 completion)

- [ ] 23. **Update src/AGENTS.md with emailService changes**

  **What to do**:
  - Update `src/AGENTS.md` with emailService changes
  - Document new search parameter handling
  - Document integration with extension
  - Update emailService usage examples
  - Document internal implementation details

  **Must NOT do**:
  - Document out-of-scope features
  - Change existing section structure

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 22, 24-25)
  - **Blocks**: [Tasks F1, F4]
  - **Blocked By**: [Tasks 14, 20, 21]

  **References**:
  - `src/AGENTS.md` - File to update
  - `src/modules/emailService.ts` - Changes to document
  - Existing src/AGENTS.md sections - Style to match

  **Acceptance Criteria**:
  - [ ] src/AGENTS.md updated
  - [ ] emailService changes documented

  **QA Scenarios**:
  ```
  Scenario: src/AGENTS.md documents emailService changes
    Tool: Bash (grep)
    Preconditions: src/AGENTS.md updated
    Steps:
      1. Search for emailService updates: `grep -A 5 "emailService" src/AGENTS.md`
      2. Verify search features mentioned
    Expected Result: emailService changes documented
    Failure Indicators: Missing documentation
    Evidence: .sisyphus/evidence/task-23-src-doc.txt
  ```

  **Evidence to Capture**:
  - [ ] task-23-src-doc.txt

  **Commit**: NO (wait for Wave 4 completion)

- [ ] 24. **Run test suite and verify >80% coverage**

  **What to do**:
  - Run complete test suite with Jest
  - Generate coverage report for modified files
  - Verify >80% code coverage for emailService and related files
  - Check for any failing tests
  - Document coverage statistics

  **Must NOT do**:
  - Accept <80% coverage
  - Ignore failing tests

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 22-23, 25)
  - **Blocks**: [Tasks F1, F2]
  - **Blocked By**: [Tasks 14, 20, 21]

  **References**:
  - Jest coverage documentation - How to generate and interpret coverage
  - `tests/emailService.test.ts` - Test suite to run

  **Acceptance Criteria**:
  - [ ] All tests PASS
  - [ ] Coverage >80% for modified files

  **QA Scenarios**:
  ```
  Scenario: All tests pass
    Tool: Bash (bun test)
    Preconditions: All implementation complete
    Steps:
      1. Run tests: `bun test`
      2. Check exit code (should be 0)
      3. Check test summary for failures
    Expected Result: 0 failures, all PASS
    Failure Indicators: Test failures, non-zero exit code
    Evidence: .sisyphus/evidence/task-24-test-results.txt

  Scenario: Coverage >80%
    Tool: Bash (bun test with coverage)
    Preconditions: Tests passing
    Steps:
      1. Run with coverage: `bun test --coverage`
      2. Check coverage report for src/modules/emailService.ts
      3. Verify coverage >80%
    Expected Result: Coverage >80%
    Failure Indicators: Coverage <80%
    Evidence: .sisyphus/evidence/task-24-coverage.txt
  ```

  **Evidence to Capture**:
  - [ ] task-24-test-results.txt
  - [ ] task-24-coverage.txt

  **Commit**: NO (wait for Wave 4 completion)

- [ ] 25. **TypeScript compilation and type checking**

  **What to do**:
  - Run TypeScript compiler with --noEmit flag
  - Check for type errors across entire project
  - Verify no compilation errors
  - Ensure strict type checking passes
  - Verify type definitions are complete

  **Must NOT do**:
  - Accept @ts-ignore (remove if found)
  - Accept type errors

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 22-24)
  - **Blocks**: [Tasks F1, F2]
  - **Blocked By**: [Tasks 14, 20, 21]

  **References**:
  - TypeScript CLI documentation - --noEmit flag usage
  - `tsconfig.json` - TypeScript configuration

  **Acceptance Criteria**:
  - [ ] TypeScript compilation succeeds
  - [ ] No type errors

  **QA Scenarios**:
  ```
  Scenario: TypeScript compilation succeeds
    Tool: Bash (tsc)
    Preconditions: All code complete
    Steps:
      1. Compile TypeScript: `tsc --noEmit`
      2. Check exit code
    Expected Result: Exit code 0, no errors
    Failure Indicators: Type errors, compilation errors
    Evidence: .sisyphus/evidence/task-25-tsc-output.txt

  Scenario: No @ts-ignore in new code
    Tool: Bash (grep)
    Preconditions: Compilation succeeds
    Steps:
      1. Search for @ts-ignore: `grep -r "@ts-ignore" src/modules/emailService.ts src/index.ts src/types/email.ts`
      2. Verify not found
    Expected Result: No @ts-ignore
    Failure Indicators: @ts-ignore found (should use proper types)
    Evidence: .sisyphus/evidence/task-25-no-ignore.txt
  ```

  **Evidence to Capture**:
  - [ ] task-25-tsc-output.txt
  - [ ] task-25-no-ignore.txt

  **Commit**: YES (Wave 4 complete - ready for final review)
  - Message: `docs: update AGENTS.md with search feature documentation`
  - Files: AGENTS.md, src/AGENTS.md
  - Pre-commit: `bun test && tsc --noEmit`

- [ ] F1. **Plan Compliance Audit** — `oracle`

  **What to do**:
  - Read plan end-to-end from `.sisyphus/plans/email-search-enhancement.md`
  - For each "Must Have" feature, verify implementation exists:
    - Text search: Check src/index.ts and src/modules/emailService.ts for query parameter handling
    - Date range filtering: Check for fromDate/toDate handling
    - Sorting: Check for sortBy parameter implementation
    - Boolean filters: Check for isUnread/isStarred/hasAttachments handling
    - Backward compatibility: Verify existing params (accountId, folderId, limit) work unchanged
    - Input validation: Check for validation logic in src/index.ts
    - TDD test coverage: Check tests/emailService.test.ts for search feature tests
  - For each "Must NOT Have", search codebase for forbidden patterns:
    - Advanced search syntax: Search for regex, wildcards in query handling
    - Cross-folder search: Verify search limited to single folderId
    - Result enrichment: Check for highlighting, snippets code
    - Search persistence: Check for caching, history code
    - Bulk operations: Check for delete/move/read-marking on search results
    - Additional filters: Check for sender domain, attachment type, priority filters
    - Pagination: Check for pagination beyond limit parameter
    - Breaking changes: Verify fetch_emails tool signature unchanged
  - Check evidence files exist in `.sisyphus/evidence/` directory
  - Compare deliverables against plan requirements
  - Output structured verdict with counts

  **Must NOT do**:
  - Skip any "Must Have" or "Must NOT Have" check
  - Accept partial compliance (all must pass)

  **Recommended Agent Profile**:
  - **Category**: `oracle`
    - Reason: Plan compliance requires systematic verification against specifications

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave FINAL (with Tasks F2-F4)
  - **Blocks**: None (final review)
  - **Blocked By**: [Tasks 22-25]

  **References**:
  - `.sisyphus/plans/email-search-enhancement.md` - Plan to audit against
  - `src/index.ts`, `src/modules/emailService.ts`, `src/types/email.ts` - Implementation to verify
  - `extension/background.js` - Extension implementation
  - `tests/emailService.test.ts` - Test coverage to verify
  - AGENTS.md, src/AGENTS.md - Documentation updates

  **Acceptance Criteria**:
  - [ ] All "Must Have" features verified present
  - [ ] All "Must NOT Have" patterns verified absent
  - [ ] Evidence files exist for all QA scenarios
  - [ ] Deliverables match plan exactly

  **QA Scenarios**:
  ```
  Scenario: Must Have features all present
    Tool: N/A (oracle agent verification)
    Preconditions: Implementation complete
    Steps:
      1. Read plan's "Must Have" section
      2. For each feature, verify implementation exists
      3. Use grep/find to locate code
    Expected Result: All Must Have features found in code
    Failure Indicators: Missing features, incomplete implementation
    Evidence: .sisyphus/evidence/task-F1-must-have.txt

  Scenario: Must NOT Have patterns absent
    Tool: N/A (oracle agent verification)
    Preconditions: Implementation complete
    Steps:
      1. Read plan's "Must NOT Have" section
      2. For each forbidden pattern, search codebase
      3. Use grep to verify absence
    Expected Result: No forbidden patterns found
    Failure Indicators: Forbidden patterns present
    Evidence: .sisyphus/evidence/task-F1-must-not-have.txt
  ```

  **Evidence to Capture**:
  - [ ] task-F1-must-have.txt
  - [ ] task-F1-must-not-have.txt

  **Commit**: NO (final review task, no commit)

- [ ] F2. **Code Quality Review** — `unspecified-high`

  **What to do**:
  - Run `bun test` to verify all tests pass
  - Run `tsc --noEmit` for TypeScript compilation check
  - Run linter (if configured) to check code style
  - Review all changed files for:
    - `as any` types (should have proper types)
    - `@ts-ignore` comments (should be removed, not used)
    - Empty catch blocks (should have error handling)
    - `console.log` statements in production code (should be removed)
    - Commented-out code (should be removed)
    - Unused imports (should be cleaned up)
  - Check for AI slop patterns:
    - Excessive comments (code should be self-documenting)
    - Over-abstraction (keep it simple)
    - Generic names (data/result/item/temp - use descriptive names)
  - Count issues and provide structured output
  - Verify test coverage meets >80% threshold

  **Must NOT do**:
  - Accept code quality issues
  - Skip any quality check category

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Code quality review requires thorough analysis of multiple aspects

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave FINAL (with Tasks F1, F3-F4)
  - **Blocks**: None (final review)
  - **Blocked By**: [Tasks 22-25]

  **References**:
  - `src/index.ts`, `src/modules/emailService.ts`, `src/types/email.ts`, `extension/background.js` - Files to review
  - `tsconfig.json` - TypeScript configuration
  - Jest configuration - Test setup
  - ESLint/Prettier config (if exists) - Linting rules

  **Acceptance Criteria**:
  - [ ] Build: PASS (no TypeScript errors)
  - [ ] Lint: PASS (no lint errors if linter configured)
  - [ ] Tests: N pass/N fail (all must pass)
  - [ ] Files: N clean/N issues (zero quality issues)
  - [ ] Coverage: N% (must be >80%)

  **QA Scenarios**:
  ```
  Scenario: All quality checks pass
    Tool: N/A (unspecified-high agent review)
    Preconditions: Implementation complete
    Steps:
      1. Run bun test
      2. Run tsc --noEmit
      3. Run linter if configured
      4. Review files manually for code quality issues
    Expected Result: All checks pass, zero quality issues
    Failure Indicators: Type errors, lint errors, test failures, code quality issues
    Evidence: .sisyphus/evidence/task-F2-quality-report.txt
  ```

  **Evidence to Capture**:
  - [ ] task-F2-quality-report.txt

  **Commit**: NO (final review task, no commit)

- [ ] F3. **Real Manual QA** — `unspecified-high`

  **What to do**:
  - Start from clean state (no cached data)
  - Execute EVERY QA scenario from EVERY task:
    - Follow exact steps from each task's QA Scenarios section
    - Capture evidence as specified (screenshots, terminal output, JSON responses)
  - Test cross-task integration:
    - Combine search parameters: text + date + filters + sort
    - Verify features work together correctly
    - Test with complex queries (all 4 feature types)
  - Test edge cases:
    - Empty folder (0 emails)
    - No matching search results
    - Invalid dates (fromDate > toDate)
    - Invalid sortBy values
    - Complex queries with conflicting filters
  - Save all evidence to `.sisyphus/evidence/final-qa/` directory
  - Document any issues found
  - Output structured verdict with counts

  **Must NOT do**:
  - Skip any QA scenario
  - Use different test data than specified
  - Fail to capture evidence

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Manual QA requires thorough testing and evidence capture

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave FINAL (with Tasks F1-F2, F4)
  - **Blocks**: None (final review)
  - **Blocked By**: [Tasks 22-25]

  **References**:
  - All task QA Scenarios sections (Tasks 1-25) - Scenarios to execute
  - `.sisyphus/plans/email-search-enhancement.md` - Full plan with all scenarios
  - Test data from tasks - Mock email data for testing

  **Acceptance Criteria**:
  - [ ] Scenarios: N/N pass (all QA scenarios executed successfully)
  - [ ] Integration: N/N (all cross-task tests pass)
  - [ ] Edge Cases: N tested (all edge cases covered)
  - [ ] Evidence files captured in `.sisyphus/evidence/final-qa/`

  **QA Scenarios**:
  ```
  Scenario: All task QA scenarios executed
    Tool: N/A (unspecified-high agent execution)
    Preconditions: Implementation complete
    Steps:
      1. Read all task QA scenarios from plan
      2. Execute each scenario step-by-step
      3. Capture evidence as specified
      4. Verify expected results
    Expected Result: All scenarios pass, evidence captured
    Failure Indicators: Scenario failures, missing evidence
    Evidence: .sisyphus/evidence/final-qa/all-scenarios.txt

  Scenario: Cross-task integration works
    Tool: N/A (manual testing)
    Preconditions: Individual QA scenarios pass
    Steps:
      1. Test query="urgent" + fromDate + toDate + sortBy="date-desc" + isUnread=true
      2. Verify all filters work together
      3. Test variations of parameter combinations
    Expected Result: Complex queries work correctly
    Failure Indicators: Parameter conflicts, incorrect filtering
    Evidence: .sisyphus/evidence/final-qa/integration.txt
  ```

  **Evidence to Capture**:
  - [ ] final-qa/all-scenarios.txt
  - [ ] final-qa/integration.txt

  **Commit**: NO (final review task, no commit)

- [ ] F4. **Scope Fidelity Check** — `deep`

  **What to do**:
  - For each task (1-25):
    - Read "What to do" section from plan
    - Read actual implementation diff using `git log/diff`
    - Verify 1:1 correspondence:
      - Everything in spec was built (no missing features)
      - Nothing beyond spec was built (no scope creep)
  - Check "Must NOT do" compliance for each task
  - Detect cross-task contamination:
    - Task N touching Task M's files inappropriately
    - Unexpected file modifications
    - Changes outside planned scope
  - Flag unaccounted changes (not in any task)
  - Verify no breaking changes to existing functionality
  - Output structured verdict with counts

  **Must NOT do**:
  - Accept scope creep
  - Skip any task verification
  - Ignore unexpected changes

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Scope fidelity requires deep understanding of all changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave FINAL (with Tasks F1-F3)
  - **Blocks**: None (final review)
  - **Blocked By**: [Tasks 22-25]

  **References**:
  - `.sisyphus/plans/email-search-enhancement.md` - Plan with all task specs
  - `git log` and `git diff` - Actual changes made
  - Task list (1-25 + F1-F4) - All tasks to verify
  - "Must NOT Have" section - Scope boundaries

  **Acceptance Criteria**:
  - [ ] Tasks: N/N compliant (all tasks match spec exactly)
  - [ ] Contamination: CLEAN (N issues, zero cross-task contamination)
  - [ ] Unaccounted: CLEAN (N files, zero unexpected changes)
  - [ ] Scope fidelity: VERDICT (APPROVE or REJECT)

  **QA Scenarios**:
  ```
  Scenario: All tasks match plan exactly
    Tool: N/A (deep agent verification)
    Preconditions: Implementation complete
    Steps:
      1. For each task 1-25, compare plan spec with actual diff
      2. Verify all "What to do" items implemented
      3. Verify no extra work beyond spec
      4. Verify "Must NOT do" compliance
    Expected Result: Perfect 1:1 correspondence for all tasks
    Failure Indicators: Missing work, extra work, scope creep
    Evidence: .sisyphus/evidence/task-F4-scope-check.txt

  Scenario: No cross-task contamination
    Tool: N/A (git analysis)
    Preconditions: All tasks complete
    Steps:
      1. Check git diff for file modifications
      2. Verify each file modified only by its assigned task(s)
      3. Detect unexpected file changes
    Expected Result: Clean task boundaries, no contamination
    Failure Indicators: Cross-task changes, unexpected modifications
    Evidence: .sisyphus/evidence/task-F4-contamination.txt
  ```

  **Evidence to Capture**:
  - [ ] task-F4-scope-check.txt
  - [ ] task-F4-contamination.txt

  **Commit**: NO (final review task, no commit)

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `bun test` (Jest), `tsc --noEmit`, and linter. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Coverage [N%] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration: combine search parameters (text + date + filters + sort). Test edge cases: empty folder, no matching results, invalid dates, complex queries. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **1**: `feat(emails): add advanced search parameters to fetch_emails` — src/index.ts, src/modules/emailService.ts, src/types/*.ts
- **2**: `feat(extension): implement advanced filtering in handleFetchEmails` — extension/background.js
- **3**: `test(emails): add TDD test suite for search functionality` — tests/emailService.test.ts, tests/*.test.ts
- **4**: `docs: update AGENTS.md with search feature documentation` — AGENTS.md, src/AGENTS.md

---

## Success Criteria

### Verification Commands
```bash
# Run test suite
bun test

# Verify TypeScript compilation
tsc --noEmit

# Check test coverage
bun test --coverage
# Expected: >80% coverage for modified files

# Manual test: text search
curl -X POST http://localhost:3476/api/tools/fetch_emails \
  -H "Content-Type: application/json" \
  -d '{"accountId": "account1", "folderId": "folder1", "query": "urgent"}'
# Expected: 200 OK with emails containing "urgent"

# Manual test: date range
curl -X POST http://localhost:3476/api/tools/fetch_emails \
  -H "Content-Type: application/json" \
  -d '{"accountId": "account1", "folderId": "folder1", "fromDate": "2024-01-01T00:00:00Z", "toDate": "2024-12-31T23:59:59Z"}'
# Expected: 200 OK with emails within date range

# Manual test: sorting
curl -X POST http://localhost:3476/api/tools/fetch_emails \
  -H "Content-Type: application/json" \
  -d '{"accountId": "account1", "folderId": "folder1", "sortBy": "date-desc"}'
# Expected: 200 OK with emails sorted newest-first

# Manual test: boolean filters
curl -X POST http://localhost:3476/api/tools/fetch_emails \
  -H "Content-Type: application/json" \
  -d '{"accountId": "account1", "folderId": "folder1", "isUnread": true}'
# Expected: 200 OK with only unread emails
```

### Final Checklist
- [ ] All "Must Have" features implemented and working
- [ ] All "Must NOT Have" patterns absent from codebase
- [ ] All tests pass (>80% coverage)
- [ ] TypeScript compilation succeeds with no errors
- [ ] Backward compatibility maintained (existing params work)
- [ ] Documentation updated across all AGENTS.md files
- [ ] All QA scenarios executed and evidence captured
- [ ] All 4 review agents (F1-F4) approve
