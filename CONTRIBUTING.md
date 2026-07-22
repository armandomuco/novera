# Contributing

## Development Principles

- Build the smallest truthful version first.
- Prefer explicit service boundaries over clever abstractions.
- Keep tenant isolation visible in code reviews.
- Do not expose database documents directly in API responses.
- Add tests where behavior can regress.

## Pull Request Checklist

- Scope is clear and connected to a milestone.
- Inputs are validated.
- Authorization checks are documented or implemented.
- Tests and manual verification are listed.
- Relevant docs are updated.

## Security Review Questions

- Can this read or write data from another organization?
- Can a lower role perform a higher-role action?
- Can uploaded content trigger unsafe processing?
- Can AI output cite or infer unauthorized sources?
- Are secrets, tokens, prompts, or sensitive content logged?
