# Reference Projects

## Purpose
This file records the local reference projects agents should use when implementing afterservice architecture, UI patterns, and developer experience.

## Primary References
- `midday`: `/Users/M1PRO/Documents/code/_kitchen_sink/midday`
  - Primary standard for pages, tables, modals, sheets, sidebar, forms, onboarding, layouts, tRPC calls, loading states, error states, and caching patterns.
- `gnd`: `/Users/M1PRO/Documents/code/_turbo/gnd`
  - Reference for the standard notification package system and mature operational dashboard patterns.
- `plot-keys`: `/Users/M1PRO/Documents/code/plot-keys`
  - Reference for local URL handling, Portless/proxy support, generated links, and multi-app developer experience.

## Secondary References
- `school-clerk`: `/Users/M1PRO/Documents/code/school-clerk`
  - Reference for Portless/dashboard routing, tenant-aware auth patterns, and pragmatic dashboard flows.
- `halaal-coperative`: `/Users/M1PRO/Documents/code/halaal-coperative`
  - Reference for cooperative/business workflow structure where relevant.

## Usage Rules
- Prefer Midday for implementation architecture unless another reference is explicitly named for the subsystem.
- Do not copy product-specific domain concepts from reference projects into afterservice.
- Copy patterns, file organization, and interaction architecture; adapt naming and business logic to afterservice.
