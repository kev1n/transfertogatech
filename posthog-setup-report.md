<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into transfertogatech. Client-side tracking is initialized via `instrumentation-client.ts` (Next.js 15.3+ instrumentation pattern — no provider needed). A reverse proxy routes PostHog traffic through `/ingest` via `next.config.ts` rewrites, improving reliability and ad-blocker resistance. A shared server-side client in `lib/posthog-server.ts` is used by API routes. Ten events are instrumented across 7 files, covering the full user journey: school/major selection, course picking and clearing, plan sharing, shared plan views, and server-side data freshness signals.

| Event | Description | File |
|---|---|---|
| `school_selected` | User picks their current transfer school | `components/planner/InlinePicker.tsx` |
| `major_selected` | User picks their target GT major | `components/planner/InlinePicker.tsx` |
| `course_picked` | User confirms a course pick (transfer or AP credit) | `components/planner/CoursePicker.tsx` |
| `ap_tab_viewed` | User switches to the AP credit tab in the course picker | `components/planner/CoursePicker.tsx` |
| `course_pick_cleared` | User removes a previously picked course from a slot | `components/planner/SlotRow.tsx` |
| `plan_shared` | User copies the shareable plan link to clipboard | `components/planner/Header.tsx` |
| `shared_plan_viewed` | User lands on a shared plan URL (read-only mode) | `hooks/usePlannerState.ts` |
| `shared_plan_exited` | User clicks "Open my plan" to exit shared read-only view | `hooks/usePlannerState.ts` |
| `equivalencies_fetched` | Server: equivalency data fetched for a school | `app/api/mongo/getAllEquivalentsForSchool/route.ts` |
| `daily_crawl_triggered` | Server: daily data refresh cron job triggered | `app/api/mongo/dailyRefreshData/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/399144/dashboard/1513892
- **Planner setup funnel**: https://us.posthog.com/project/399144/insights/QeBeiA92
- **Course picks over time (transfer vs AP)**: https://us.posthog.com/project/399144/insights/jxSkXVcC
- **Plan shares over time**: https://us.posthog.com/project/399144/insights/71E6uL05
- **Shared plan views vs exits**: https://us.posthog.com/project/399144/insights/2QBWazp8
- **Top schools selected by users**: https://us.posthog.com/project/399144/insights/LXjJHBfr

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
