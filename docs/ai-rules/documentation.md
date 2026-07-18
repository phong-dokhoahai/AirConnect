# Documentation Rules

## Source-of-truth mapping

| Information             | Source of truth                                  |
| ----------------------- | ------------------------------------------------ |
| Product overview        | `PROJECT.md`                                     |
| Business behavior       | `features/<feature>/spec.md`                     |
| Feature usage           | `features/<feature>/README.md`                   |
| Architectural decisions | `features/<feature>/decisions.md` or `docs/adr/` |
| System architecture     | `docs/architecture/`                             |
| API contract            | `docs/api/` or OpenAPI                           |
| Database schema         | migrations and `docs/database/`                  |
| Shared component usage  | Storybook or component README                    |
| Coding conventions      | `docs/ai-rules/`                                 |

## Editing principles

1. Search for the current source of truth before creating documentation.
2. Update existing documentation rather than creating duplicate files.
3. Replace obsolete behavior instead of appending contradictory notes.
4. Documentation must describe the final implemented behavior.
5. Do not document planned behavior as if it were already implemented.
6. Clearly mark future or unimplemented behavior.
7. Keep documentation close to the feature it describes.
8. Use architecture documentation only for system-level design.
