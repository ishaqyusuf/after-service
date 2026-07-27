# 0006: Hybrid QA routing and workspace purge

## Status

Accepted

## Decision

Separate ordinary email mode from QA-domain routing. Persist QA classification
on `Workspace`, add a global platform-admin capability, and authorize purge only
from the stored marker. Require an expiring signed preview and exact typed
confirmation, execute in Trigger, block active commercial subscriptions, and
retain aggregate receipts only.

## Consequences

QA works in production without changing ordinary accounts, `.test`
misconfiguration fails closed, workspace roles cannot authorize global cleanup,
and partial failures remain retryable.
