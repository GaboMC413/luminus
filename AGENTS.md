# LUMINUS AI Development Guidelines & Skills

## Active Agent Skills
This repository has the following specialized skills installed under [`skills/`](./skills/) and [`.agents/skills/`](./.agents/skills/):

### Vercel Labs Skills
* **`react-best-practices`**: React and Next.js performance guidelines from Vercel Engineering.
* **`composition-patterns`**: Scalable React composition patterns, avoiding boolean prop proliferation.
* **`react-view-transitions`**: Smooth animations using React View Transitions API.
* **`web-design-guidelines`**: UX, accessibility, and visual guidelines audit.
* **`vercel-optimize`**: Cost and performance optimization for Vercel deployments.
* **`deploy-to-vercel`**: Deployment routines.
* **`writing-guidelines`**: Documentation and prose guidelines.

### Architecture & Knowledge
* **`graphify`**: Codebase knowledge graph, community detection, architecture audit.
* **`archify`**: Visual architecture, sequence, lifecycle/state, ERD, and data-flow diagrams as explorable standalone HTML/SVG.

### Design & UI Craft
* **`impeccable`**: Design director & frontend craft: design audits, anti-pattern detection, design system capture (DESIGN.md), UX review, typography, colors, animations, and aesthetic refinement.
  * `/impeccable init`: Capture product context in PRODUCT.md.
  * `/impeccable critique [target]`: Heuristic UX design review.
  * `/impeccable audit [target]`: Technical design quality checks (a11y, perf, responsive).
  * `/impeccable polish [target]`: Final quality pass before shipping.
  * `/impeccable document`: Generate DESIGN.md from project code.
### Engineering Philosophy
* **`ponytail`**: Lazy senior dev mode. The simplest, shortest solution that actually works: YAGNI, standard library first, zero unrequested bloat or extra abstractions.
  * `/ponytail-review`: Focused quality & anti-bloat code review.
  * `/ponytail-audit`: Whole repo quality audit.
  * `/ponytail-debt`: Ledger of shortcuts and deferred items.


<!-- BEGIN AWS Agent Toolkit rules -->
# AWS Guidance

- Where these AWS rules conflict with the project's own instructions, the
  project's instructions take precedence.
- Prefer the AWS MCP Server for AWS interactions — it provides sandboxed
  execution, observability, and audit logging. If unavailable, use the
  AWS CLI directly.
- For any AWS task or question — building, configuring, migrating, debugging,
  or operating a service, writing SDK code, authoring CDK/CloudFormation, or
  answering how a service works — first call `aws___search_documentation` with
  topic `agent_skills` and load the matching skill with `aws___retrieve_skill`.
  Do this even when you believe you know the answer: skills carry current
  service behavior that your training may not. Prefer the skill's guidance over
  general knowledge. Skip it only for work that does not involve AWS.
- When uncertain about specific AWS details (API parameters, permissions,
  limits, error codes), verify against documentation rather than guessing.
  State uncertainty explicitly if you cannot confirm.
- Before reporting a count, a total, or that something does not exist, read
  every page of the results and search every Region and scope where it could
  be. If you could not, say the result is partial and name what you checked.
- To say what a system currently does, read what the runtime uses: the
  completed deployment, the alias or version that is invoked, the template the
  stack is running. A newer stored version, a draft, or a description field is
  not evidence of live behavior.
- Present a cause as confirmed only if data, configuration, or logs you read
  show it. Label anything else as unverified, and say what you would check
  next.
- When the user asks a specific question or names a suspected cause, confirm
  or rule out each cause they raised, and do not offer alternatives your evidence
  does not support.
- When creating infrastructure, prefer infrastructure-as-code (AWS CDK or
  CloudFormation) over direct CLI commands.
- When working with infrastructure, follow AWS Well-Architected Framework
  principles.
- Do not use em dashes in AWS resource names or descriptions. Use
  hyphens instead.

## Before you conclude

- Before deciding the AWS account can't hold what the request asks for,
  look. List the places it could live, such as S3 buckets, databases, and
  log groups, and read what is there.
- Don't conclude that records are missing from metadata, such as a
  creation date or a stored-bytes count, or from one query that failed or
  came back empty. Read the records another way, across the full time
  range, before reporting them absent.

## Secret Safety

- MUST load the `aws-secrets-manager` skill first for any secret,
  credential, API key, token, or password task. MUST NOT call
  `secretsmanager get-secret-value` or `batch-get-secret-value`, and MUST
  NOT hit the Secrets Manager Agent daemon directly. MUST use
  `{{resolve:secretsmanager:secret-id:SecretString:json-key}}` with
  `asm-exec` so the secret resolves at runtime without entering context.
<!-- END AWS Agent Toolkit rules -->
