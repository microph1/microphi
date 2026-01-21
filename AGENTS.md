# AGENTS.md

This file contains instructions for AI agents on how to commit changes in this repository.

## Git and Commit Guidelines

**Conventional Commits:**
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation
- `style`: formatting
- `refactor`: code restructuring
- `test`: testing
- `chore`: maintenance

**Scopes:**
- Use package name: `feat(json-db): add search functionality`
- Use component: `fix(flux): handle lifecycle correctly`
- Use `microphi` for repo-level changes

**Examples:**
```
feat(styles): add CSS Grid utilities and documentation 🎉
fix(json-db): handle concurrent file access properly
docs: update README with new API examples
```

**Commit Process:**
1. Stage changes: `git add .`
2. Run lint: `npm run lint:ci`
3. Run tests: `npm run test:ci`
4. Commit with conventional message: `git commit -m "feat(package): description"`
5. Push only when explicitly requested