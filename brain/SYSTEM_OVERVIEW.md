# System Overview

## Purpose
This file summarizes the afterservice system for fast onboarding.

## System Shape
afterservice is a multi-app monorepo:
- Marketing website explains the product and pricing.
- Dashboard lets local operators manage customers, completed service jobs, follow-ups, templates, and billing.
- API owns auth-aware business operations, billing webhooks, and future automation jobs.
- Shared packages keep auth, DB, UI, navigation, jobs, notifications, and utilities reusable.

## Primary User Journey
1. Operator visits `afterservice.app`.
2. Operator signs up and creates a workspace.
3. Operator completes onboarding: business name, service type, default follow-up cadence, preferred channels.
4. Operator adds customers and completed service jobs.
5. afterservice creates or helps schedule follow-ups.
6. Operator works the board: due today, upcoming, waiting, replied, closed.
7. Subscription status controls limits and paid feature access.

## External Systems
- Postgres for persistent data.
- Better Auth-style auth layer.
- Lemon Squeezy for subscriptions.
- Email/SMS/WhatsApp providers are future integrations behind `packages/notifications`.
- Scheduled processing lives behind `packages/jobs`.

## Current Bootable Surfaces
- Website: `http://localhost:4100`
- Dashboard: `http://localhost:4101`
- API health: `http://localhost:4102/health`
