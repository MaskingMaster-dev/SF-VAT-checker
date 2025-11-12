# GitHub Setup & Cursor Integratie

## ✅ Repository is gekoppeld

Je project is gekoppeld aan: `https://github.com/MaskingMaster-dev/SF-VAT-checker.git`

## 🚀 Eerste Push naar GitHub

### Optie 1: Via Terminal (aanbevolen)

```bash
# Push naar GitHub (eerste keer)
git push -u origin main
```

Je wordt gevraagd om in te loggen. Kies een van deze methoden:

#### A. GitHub Personal Access Token (aanbevolen)

1. Ga naar GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Klik "Generate new token (classic)"
3. Geef een naam: `Cursor Git Access`
4. Selecteer scopes:
   - ✅ `repo` (volledige repository toegang)
   - ✅ `workflow` (als je GitHub Actions gebruikt)
5. Klik "Generate token"
6. **Kopieer de token** (je ziet hem maar 1x!)
7. Bij `git push` gebruik je als wachtwoord: de token (niet je GitHub wachtwoord)

#### B. GitHub CLI (gh)

```bash
# Installeer GitHub CLI (als je die nog niet hebt)
brew install gh

# Login
gh auth login

# Push
git push -u origin main
```

#### C. SSH Key (voor langdurig gebruik)

```bash
# Genereer SSH key (als je die nog niet hebt)
ssh-keygen -t ed25519 -C "tim@maskingmaster.com"

# Start ssh-agent
eval "$(ssh-agent -s)"

# Voeg key toe
ssh-add ~/.ssh/id_ed25519

# Kopieer publieke key
cat ~/.ssh/id_ed25519.pub

# Voeg toe aan GitHub:
# GitHub.com → Settings → SSH and GPG keys → New SSH key
# Plak de publieke key

# Verander remote naar SSH
git remote set-url origin git@github.com:MaskingMaster-dev/SF-VAT-checker.git

# Push
git push -u origin main
```

## 🔧 Cursor & GitHub Integratie

### Cursor heeft automatisch Git integratie

Cursor gebruikt de Git configuratie van je systeem. Als je Git al hebt geconfigureerd (wat je hebt), werkt Cursor automatisch met GitHub.

### In Cursor:

1. **Source Control Panel** (⌘+Shift+G / Ctrl+Shift+G):
   - Zie je wijzigingen
   - Commit direct vanuit Cursor
   - Push naar GitHub

2. **Git Commands in Command Palette** (⌘+Shift+P / Ctrl+Shift+P):
   - Type "Git: Push" om te pushen
   - Type "Git: Pull" om te pullen
   - Type "Git: Commit" om te committen

3. **Branch Management**:
   - Klik op branch naam onderaan in Cursor
   - Maak nieuwe branches
   - Switch tussen branches

## 📝 Workflow voor Updates

### Dagelijkse workflow:

```bash
# 1. Pull laatste wijzigingen
git pull origin main

# 2. Maak wijzigingen in Cursor

# 3. Stage wijzigingen
git add .

# 4. Commit
git commit -m "Beschrijving van wijzigingen"

# 5. Push
git push origin main
```

### Of via Cursor UI:

1. Open Source Control panel (⌘+Shift+G)
2. Klik "+" naast gewijzigde bestanden om te stage
3. Type commit message
4. Klik "✓ Commit"
5. Klik "..." → "Push" om te pushen

## 🔐 Authenticatie Troubleshooting

### Als `git push` vraagt om credentials:

**Voor HTTPS (huidige setup):**
- Username: `tim@maskingmaster.com` (of je GitHub username)
- Password: **GitHub Personal Access Token** (niet je wachtwoord!)

**Token aanmaken:**
1. GitHub.com → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Scope: `repo`
5. Kopieer en gebruik als wachtwoord

### Credentials opslaan (macOS):

```bash
# Gebruik macOS Keychain
git config --global credential.helper osxkeychain
```

### Credentials opslaan (Linux/Windows):

```bash
# Windows
git config --global credential.helper wincred

# Linux
git config --global credential.helper store
```

## 🌿 Branch Strategy

### Voor nieuwe features:

```bash
# Maak nieuwe branch
git checkout -b feature/vat-caching-improvement

# Werk aan feature
# ... maak wijzigingen ...

# Commit
git add .
git commit -m "Improve VAT caching"

# Push branch
git push -u origin feature/vat-caching-improvement

# Maak Pull Request op GitHub
# Na merge, terug naar main:
git checkout main
git pull origin main
```

## 🔄 Automatische Deployment

### Railway/Render koppelen aan GitHub:

1. **Railway:**
   - Project → Settings → Connect GitHub
   - Selecteer repository: `MaskingMaster-dev/SF-VAT-checker`
   - Auto-deploy bij push naar `main`

2. **Render:**
   - New → Web Service
   - Connect GitHub repository
   - Auto-deploy: Enabled

## 📋 Handige Git Commands

```bash
# Status checken
git status

# Wijzigingen zien
git diff

# Commit geschiedenis
git log --oneline

# Laatste commit ongedaan maken (lokaal)
git reset --soft HEAD~1

# Branch lijst
git branch -a

# Remote info
git remote -v
```

## ⚠️ Belangrijk

- **Push nooit `.env` bestanden** (staan in `.gitignore`)
- **Commit messages** moeten duidelijk zijn
- **Pull voor je pusht** als anderen werken aan het project
- **Gebruik branches** voor grote wijzigingen

## 🆘 Hulp nodig?

- GitHub Docs: https://docs.github.com
- Git Docs: https://git-scm.com/doc
- Cursor Git: Gebruik Source Control panel (⌘+Shift+G)

