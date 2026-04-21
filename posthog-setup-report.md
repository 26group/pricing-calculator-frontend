<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Pricing Calculator frontend. The app uses `posthog-js` (browser SDK) initialized at app startup in `src/index.js`. User identification is wired to the Auth0 login flow so every event is tied to a known user. Thirteen events cover the full user lifecycle — from first signup through onboarding, day-to-day proposal work, and billing actions. Error capture is added to all critical async operations.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | New user authenticates for the first time (backend returns `isNewUser: true`) | `src/features/auth/Login.js` |
| `user_logged_in` | Returning user successfully authenticates via Auth0 | `src/features/auth/Login.js` |
| `user_logged_out` | User clicks logout; PostHog session is reset | `src/App.js` |
| `plan_type_selected` | User picks Bookkeeper or Accounting Practice during onboarding | `src/pages/Onboarding.js` |
| `onboarding_completed` | User finishes all 4 onboarding steps and organisation is created | `src/pages/Onboarding.js` |
| `subscription_plan_selected` | User confirms a Stripe subscription plan on the Select Plan page | `src/pages/SelectPlan.js` |
| `proposal_created` | New pricing proposal is created for a client (from either the nav bar modal or the Proposals page) | `src/App.js`, `src/pages/SavedPrices.js` |
| `proposal_opened` | User opens an existing saved proposal to edit | `src/pages/SavedPrices.js` |
| `proposal_saved` | User saves a completed price calculation with client details | `src/pages/Pricing.js` |
| `proposal_deleted` | User confirms deletion of a proposal | `src/pages/SavedPrices.js` |
| `proposal_cloned` | User successfully clones an existing proposal | `src/pages/SavedPrices.js` |
| `payment_method_initiated` | User clicks "Add Payment Method" (redirected to Stripe checkout) | `src/pages/BillingSettings.js` |
| `subscription_cancelled` | User confirms subscription cancellation | `src/pages/BillingSettings.js` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/390625/dashboard/1491023
- **New signups over time** (daily trend): https://us.posthog.com/project/390625/insights/m4wOXTLk
- **Onboarding funnel** (signed up → plan type selected → onboarding completed): https://us.posthog.com/project/390625/insights/iKgckRcj
- **Proposal activity** (created vs saved vs deleted): https://us.posthog.com/project/390625/insights/M1ydaw76
- **Subscription conversion funnel** (logged in → onboarding completed → plan selected): https://us.posthog.com/project/390625/insights/Ixf80DVJ
- **Subscription cancellations** (weekly churn signal): https://us.posthog.com/project/390625/insights/StR68jvt

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-javascript_node/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
