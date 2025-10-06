# OPS Runbook — Disaster Recovery voor Local Pro Sites Platform

## Doel
Herstel een volledige, schone development/testomgeving van het Local Pro Sites Platform zodra iets corrupt/kapot is (foutmeldingen, corrupte db, dependency-issues, build errors).

---

## 1. Voorbereiden
- **Zorg voor toegang** tot je GitHub repository (SSH/HTTPS).
- Open een terminal (VS Code, Powershell, Bash, Codespaces).

---

## 2. Stoppen & schonen
```bash
# Stop alle dev servers in open terminals
Ctrl + C

# Verwijder alle lokale artefacten
git clean -xdf
rm -rf node_modules
rm -rf packages/**/node_modules
rm -rf packages/api/dev.db
```

---

## 3. Verse codebase ophalen
```bash
git fetch --all
git reset --hard origin/main
```

---

## 4. Dependencies herinstalleren
```bash
npm install
```

---

## 5. Database opnieuw genereren
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

---

## 6. Servers starten
```bash
npm run dev
```
- Backend beschikbaar op poort **3000**.
- Frontend beschikbaar op poort **5173**.

---

## 7. Verifiëren
- **Frontend check:** Open je webapp via :5173 → laadt het?
- **API health:** `/health` endpoint testen op :3000, bijv.:
  ```bash
  curl http://localhost:3000/health
  ```
- **Database:** Check of `dev.db` opnieuw is aangemaakt bij `packages/api/dev.db`.

---

## 8. Veelvoorkomende problemen
- **Build/Native errors:**  
  Check of Python 3 en VS Build Tools (C++ workload) geïnstalleerd zijn.  
  Voer uit:  
  ```bash
  npm rebuild
  ```
- **Poort bezet:**  
  Vind proces, bijv. voor poort 3000:  
  ```bash
  netstat -ano | findstr :3000
  taskkill /PID <ID> /F
  ```
- **Geen toegang tot repo:**  
  Check SSH-key of personal access token via HTTPS.

---

## 9. Snel checken na recovery
- Check dat alles draait in de PORTS (of met `lsof -i` lokaal).
- Test een CRUD-operatie via frontend + backend.
- Commit & push wijzigingen na verificatie.

---

**Let op:**  
Heb je issues? Plak de laatste 15 regels van foutmeldingen direct onder dit Runbook zodat support/OPS meegaat denken!

---