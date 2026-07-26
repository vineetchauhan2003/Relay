# PRODUCT.md — Relay Service Desk

## Register
product (design serves the task). Full build spec lives in `PLAN.md`; this file is the
product brief every screen designs toward.

## What it is
Relay is an IT service management (ITSM) console for a support team. It runs the
day-to-day of an internal IT service desk: agents triage an incident queue, work
tickets against SLA clocks, fulfill catalog requests, publish knowledge articles, and
managers watch throughput and SLA health on a live dashboard. It is a single,
operational cockpit — dense, fast, and built to be stared at for a full shift. An agent
fluent in Zendesk / Jira Service Management / Freshservice should trust it on sight.

## Who it's for
- **Primary: IT support agents** — live in the queue, pick up and resolve tickets,
  hit SLAs.
- **Secondary: the service-desk manager** — monitors SLA health, agent load, and
  trends; manages the catalog and knowledge base.

## Core screens
1. **Dashboard** — operational overview: open/breaching counts, SLA health, ticket
   volume trend, priority + status breakdown, agent workload, recent activity.
2. **Tickets (queue)** — the heart of the app: a filterable, sortable table of
   incidents & requests with SLA countdowns, priority, status, assignee.
3. **Ticket detail** — full record: description, activity timeline, worklog/comments,
   SLA panel, and inline edit of status/priority/assignee.
4. **Service Catalog** — browsable catalog of requestable IT services; submitting one
   opens a new request ticket.
5. **Knowledge Base** — searchable help articles by category; article reader view.

## Tone / identity
Operational, precise, calm under load. A dark ops-console surface so a queue can be
watched for hours without fatigue; a honey-amber signature that carries priority and
SLA urgency (the emotional core of a service desk). Crisp corners, tabular numbers,
status color used semantically and never decoratively. An instrument, not a brochure.

## Notes
- Do not stop to "initialize project context" — the context is already set up here.
- Never scaffold, install dependencies, or run a dev server; the platform owns the
  build and preview.
