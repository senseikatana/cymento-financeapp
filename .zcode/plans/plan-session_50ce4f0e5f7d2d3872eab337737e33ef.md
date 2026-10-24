## Plan: Web Performance, Design, and Guidelines Audit for Cyfinance App

### Current Project State
- **Nuxt 3** project with TailwindCSS v3
- Basic setup with `nuxt.config.ts`, `app.vue`, and minimal pages
- No Convex backend currently (AGENTS.md recommends Nuxt + Supabase)
- Contains a downloaded workspace archive (`download/workspace-416183b5-86a8-4e58-a5d0-4882fee31269.tar`)
- Utility file `utils/cn.ts` for class naming

### Skill Analysis & proposed usage

#### 1. web-perf (cloudflare/web-perf)
**Purpose**: Audit website loading performance, Core Web Vitals, and Lighthouse scores.

**For this Nuxt finance app, I would:**
- Navigate to the local dev server (`http://localhost:3000`) and run a performance trace
- Analyze Core Web Vitals (LCP, CLS, FCP, INP) 
- Identify render-blocking resources, unused CSS/JS, and caching issues
- Check for large bundle sizes and compression settings
- Look at network requests for the finance dashboard components
- **Key metrics to target**: LCP < 2.5s, CLS < 0.1, INP < 200ms

**Output format**: Core Web Vitals summary table, top prioritized issues with impact estimates, specific recommendations with code snippets.

#### 2. design (convex/design)
**Purpose**: Design and build reactive, type-safe backends on Convex.

**Context note**: AGENTS.md recommends Nuxt + Supabase over Convex for this personal finance app, but I would:
- If the user decides to explore Convex: Design the schema based on the PostgreSQL schema from AGENTS.md (transactions, categories, subscriptions, user_preferences tables)
- Define Convex tables mirroring the Supabase schema: `transactions`, `categories`, `subscriptions`, `user_preferences`
- Implement queries/mutations for CRUD operations on transactions and categories
- Set up real-time subscriptions for dashboard updates
- **Key Convex principles to apply**: reactive by default, server-mediated data access, schema-first design, end-to-end type safety

**Output**: Convex schema design, function definitions for data operations, index recommendations, auth wiring.

#### 3. web-design-guidelines (agents/web-design-guidelines)
**Purpose**: Review UI code for Web Interface Guidelines compliance.

**For this finance dashboard, I would:**
- Fetch the latest guidelines from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
- Review Nuxt/Vue components against rules for:
  - Accessibility (ARIA, contrast ratios, focus indicators)
  - Visual design (color usage, typography, spacing)
  - Component patterns (shadcn/Radix primitives, saturation levels)
  - Dark mode support
  - Responsive design
- **Specific finance app concerns**: data visualization accessibility, table readability, form validation, error states

**Output**: Findings in `file:line` format, compliance status, specific violations with remediation suggestions.

### Execution Workflow

**Phase 1: Performance Audit**
1. Start Nuxt dev server
2. Run web-perf skill: navigate page, start trace, analyze CWV metrics
3. Identify optimization opportunities (image optimization, code splitting, caching)

**Phase 2: Design Evaluation**
1. Assess if Convex backend makes sense vs. Supabase (per AGENTS.md)
2. If Convex: design schema and functions based on finance data model
3. If Supabase: evaluate Convex vs. Supabase tradeoffs

**Phase 3: Design Guidelines Review**
1. Fetch latest web interface guidelines
2. Review existing Nuxt components (App.vue, any pages)
3. Check accessibility, visual design, and component patterns
4. Generate compliance report

### Deliverables (upon approval)
1. **Performance report**: CWV metrics, top 5 issues, specific fixes
2. **Design assessment**: Convex schema design OR Supabase reinforcement advice
3. **UI compliance report**: Accessibility and design guideline violations with fixes

### Dependencies & Constraints
- **Must not**: Make any edits, run non-readonly tools, or change configs during plan mode
- **Requires**: User approval before any actual execution
- **Project context**: Finance app personal use, SPA architecture, Supabase recommended
- **Skills must align**: web-perf for performance, design for backend options, guidelines for UI quality

### Next Steps (awaiting user approval)
The user needs to approve this plan before I proceed with any skill invocations. I'll wait for confirmation on:
1. Which skills to prioritize (all three, or specific ones?)
2. Whether to pursue Convex design or stick with Supabase per AGENTS.md
3. The target page/URL for performance auditing