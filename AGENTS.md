# Architecture rules

- Keep browser-safe input and URL validation in `src/lib/security-validation.ts`, with security tests beside it, so endpoints and public renderers share security boundaries.
- Lead creation and initial SmartFlow delivery remain in `submitLead`; standalone CRM resend operations require verified administrator authorization before privileged access.
- Retain CRM payloads and destination; contract changes, storage restrictions, and database privilege migrations require impact review and user approval during this audit.