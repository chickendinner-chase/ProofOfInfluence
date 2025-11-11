# Git Workflow for ProofOfInfluence

Standard Git workflow for all AI collaborators (Cursor, Codex, Replit).

## Branch Structure

```
main (production stable)
  ↓
dev (development integration) ← Primary development branch
  ↓
feature/* (optional short-lived branches)
```

### Branch Roles

| Branch | Purpose | Who Uses | Merge To |
|--------|---------|----------|----------|
| `main` | Production-ready code | All (read-only) | N/A |
| `dev` | Active development | Cursor, Codex | main |
| `feat/*` | Short-term features | Optional | dev |

---

## Standard Workflow

### Daily Development (on dev branch)

All development work happens on the `dev` branch:

```bash
# 1. Start working
git checkout dev
git pull origin dev

# 2. Make changes
# - Cursor: Frontend/backend code
# - Codex: Smart contracts
# Edit files...

# 3. Commit with proper format
git add .
git commit -m "feat(frontend): add user dashboard (Cursor)"
# or
git commit -m "feat(contracts): implement staking rewards (Codex)"

# 4. Push to dev
git push origin dev

# 5. Continue development or hand to Replit for deployment testing
```

### When to Merge dev → main

**Merge dev to main** when:
- ✅ A major milestone is complete (e.g., Market module fully functional)
- ✅ All features tested and stable on dev
- ✅ Ready for production deployment
- ✅ Typically every 2-4 weeks

**How to merge:**

```bash
# 1. Ensure dev is stable
git checkout dev
git pull origin dev
# Run tests, verify everything works

# 2. Merge to main
git checkout main
git pull origin main
git merge dev --no-ff -m "release: v2.x - [milestone name]"

# 3. Tag the release
git tag -a v2.1 -m "Release v2.1: Market module complete"

# 4. Push to remote
git push origin main
git push origin v2.1

# 5. Continue dev
git checkout dev
```

---

## Commit Message Format

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description> (AI Name)

# Examples:
feat(contracts): add token pause functionality (Codex)
fix(frontend): resolve wallet connection issue (Cursor)
docs: update API documentation (Cursor)
chore(deployment): update env config (Replit)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: Style changes (no logic impact)
- `docs`: Documentation changes
- `chore`: Build/tool changes
- `test`: Add or update tests

### Scopes (optional but recommended)

- `contracts`: Smart contracts
- `frontend`: Frontend code
- `backend`: Backend API
- `deployment`: Deployment configuration
- `docs`: Documentation

### AI Attribution

Always include the AI name at the end:
- `(Codex)` - For contract/script changes
- `(Cursor)` - For application/docs changes
- `(Replit)` - For deployment/config changes

---

## Branch Naming Conventions

When creating feature branches (optional):

```
<ai-name>/<type>-<description>

Examples:
codex/feat-token-vesting
cursor/fix-profile-ui
replit/chore-deploy-config
```

**Recommended**: Work directly on `dev` for most changes. Only create feature branches for experimental work or major refactors.

---

## Pull Request Workflow

### When to Create PR

Create PR when merging `dev` → `main` for releases:

```bash
# After thorough testing on dev
gh pr create --base main --head dev \
  --title "Release: v2.x - [Milestone Name]" \
  --body "Release notes..."
```

### PR Template

```markdown
## Release Summary

Brief description of what's included in this release.

## Changes

- Feature 1 (Codex)
- Feature 2 (Cursor)
- Bug fix 3 (Cursor)

## Testing

- [x] All unit tests pass
- [x] Integration tests pass on dev
- [x] Contracts deployed and verified on testnet
- [x] Frontend/backend tested

## Deployment Notes

Any special deployment steps or configuration changes.

---

Ready for production deployment
```

### PR Review Checklist

Before merging `dev` → `main`:

- [ ] All tests passing
- [ ] Code reviewed by at least one other AI
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Deployment plan ready

---

## Conflict Resolution

### When Conflicts Occur

If `dev` conflicts with `main`:

```bash
# 1. Update dev with latest main
git checkout dev
git pull origin dev
git pull origin main

# 2. Resolve conflicts
# Edit conflicted files manually
git add <resolved-files>
git commit -m "merge: resolve conflicts with main"

# 3. Push resolved dev
git push origin dev
```

### Prevention

- Pull from `main` into `dev` periodically
- Keep `dev` updated with latest `main` changes
- Communicate large changes across team

---

## Best Practices

### Do's ✅

- Commit frequently with clear messages
- Push to `dev` regularly (at least daily)
- Include AI name in commits
- Write descriptive commit messages
- Test before pushing
- Pull before pushing to avoid conflicts

### Don'ts ❌

- Don't commit directly to `main`
- Don't push without testing
- Don't force push to shared branches
- Don't commit secrets or `.env` files
- Don't skip commit message conventions
- Don't create unnecessary branches

---

## Emergency Procedures

### Revert Bad Commit

```bash
# On dev branch
git revert <commit-hash>
git push origin dev
```

### Emergency Hotfix

If critical bug in production:

```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/critical-bug

# 2. Fix the bug
# Edit files...
git commit -m "fix: critical security issue (Cursor/Codex)"

# 3. Merge to main
git checkout main
git merge hotfix/critical-bug
git push origin main

# 4. Merge back to dev
git checkout dev
git merge main
git push origin dev

# 5. Delete hotfix branch
git branch -d hotfix/critical-bug
```

---

## Summary

**Primary Development Branch**: `dev`  
**Production Branch**: `main`  
**Merge Frequency**: Every 2-4 weeks (when milestone complete)  
**Commit Format**: `<type>(<scope>): <description> (AI Name)`  
**Review Required**: Yes, for dev → main merges  

**All AIs work on `dev`, merge to `main` when stable.**

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-11  
**Maintained by**: Development Team

