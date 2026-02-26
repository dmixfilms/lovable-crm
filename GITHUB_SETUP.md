# GitHub Setup Instructions

## 1. Create a new repository on GitHub

1. Go to https://github.com/new
2. Create a new repository with the name: `lovable-crm`
3. **DO NOT** initialize with README, .gitignore, or license (we already have them)
4. Click "Create repository"

## 2. Add remote and push to GitHub

```bash
cd /Users/andersonvieira/Documents/lovable-crm

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/lovable-crm.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## 3. Going forward - All changes must be committed

Before any code changes, you MUST:

```bash
# 1. Check status
git status

# 2. Stage changes
git add .

# 3. Commit with descriptive message
git commit -m "Description of what changed"

# 4. Push to GitHub
git push
```

## Example workflow:

```bash
# Make some code changes...

# Then commit:
git add .
git commit -m "feat: Add new payment feature

- Implement Stripe integration
- Add payment link generation
- Create payment modal UI"

git push
```

## Important notes:

- **NEVER** delete files/database without committing first
- **ALWAYS** commit before major changes
- Use descriptive commit messages
- Push regularly to avoid losing work

## Useful Git commands:

```bash
# See commit history
git log --oneline -10

# See what changed in a commit
git show COMMIT_ID

# Undo last commit (before push)
git reset --soft HEAD~1

# See differences
git diff
```

---

Once you push to GitHub, you'll have a complete backup and version history! 🎉
