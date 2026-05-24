# API Permissions

## Purpose
This file defines authorization rules.

## Roles
- `owner`: full workspace access, billing, team management.
- `admin`: operational access and team management, no ownership transfer.
- `staff`: operational access to assigned/visible customers, jobs, follow-ups.

## Public Routes
- Website pages.
- Sign-up/sign-in pages.
- API health.
- Lemon Squeezy webhook endpoint with signature verification.

## Authenticated Routes
- Workspace onboarding.
- Dashboard session.

## Workspace Routes
Require active membership:
- Customers
- Service jobs
- Follow-ups
- Templates
- Settings

## Owner/Admin Routes
- Billing checkout creation.
- Billing portal access.
- Team invites.
- Workspace-level settings.

## Enforcement Rules
- Never trust workspace ID from the client without membership lookup.
- Permission checks must run in API procedures.
- UI gates are helpful but not security boundaries.
