# Validate follow-up relations before mutation

Date: 2026-10-18
Status: Accepted

Individual foreign keys do not prove that a follow-up's job, template, or
assignee belongs to its workspace. A job must also belong to the selected
customer. Cross-workspace integration tests exposed these gaps in API writes.

Use a shared database query to resolve optional relations within the active
workspace before mutation. The API adapter returns a generic `NOT_FOUND`
without revealing foreign records. Apply it to direct follow-up creation,
job-based scheduling, template updates, and owner assignment. Existing scoped
customer and target-record checks remain in place.

This preserves the current schema and query/router layering. Direct database
writers must uphold the same invariants; this guard is not a database-level
composite constraint. No existing records are migrated or repaired by this
change. Real PostgreSQL integration tests cover rejected references and verify
that failed mutations do not change the target records.

Manual phone contact also records its status, message log, and timeline event
in one nested database write. It does not dispatch a provider message.
