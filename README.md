# Kalenderblatt – installierbare Version (PWA)

Das hier ist der komplette Kalender als eigenständige Web-App. Einmal auf einen
kostenlosen Hoster hochladen, dann hast du auf dem iPhone ein echtes App-Icon –
ohne Anmeldung, offline nutzbar, mit Mitteilungen.

## Was drin ist

```
kalenderblatt-pwa/
├─ index.html              die App
├─ manifest.webmanifest    App-Name + Icons + „standalone“-Modus
├─ service-worker.js       Offline-Betrieb + Mitteilungen
└─ icons/                  App-Icons (192, 512, maskable, Apple, Favicon)
```

Alles läuft rein im Browser. Keine Datenbank, kein Server, keine laufenden Kosten.
Deine Termine liegen nur auf deinem Gerät (localStorage).

---

## Hochladen – einfachster Weg: Netlify Drop (ca. 2 Minuten, am Computer)

1. Am **Computer** gehe auf **https://app.netlify.com/drop**
2. Einmalig kostenlos anmelden (mit E-Mail oder Google/GitHub).
3. Den **ganzen Ordner `kalenderblatt-pwa`** auf die Seite ziehen und fallen lassen.
   *(Nicht die einzelnen Dateien – den Ordner.)*
4. Nach ~20 Sekunden bekommst du eine Adresse wie
   `https://leuchtender-koala-1234.netlify.app`
5. Unter **Site configuration → Change site name** kannst du sie umbenennen,
   z. B. `https://kalender-eldin.netlify.app`
6. Diese Adresse ist ab jetzt dein Kalender. Fertig.

### Auf dem iPhone einrichten
1. Die Netlify-Adresse in **Safari** öffnen.
2. Teilen-Symbol (Quadrat mit Pfeil nach oben) → **„Zum Home-Bildschirm“**.
3. **„Hinzufügen“**. Jetzt ist das Icon da.
4. App vom Home-Bildschirm öffnen → Zahnrad → **„Handy-Mitteilungen → Erlauben“**.

---

## Alternative: GitHub Pages (wenn du ein GitHub-Konto hast)

1. Neues Repository anlegen, z. B. `kalenderblatt`.
2. Inhalt des Ordners `kalenderblatt-pwa` hochladen (die Dateien, nicht den Ordner selbst).
3. **Settings → Pages → Source: „Deploy from a branch“ → Branch: `main`, Ordner `/root`** → Save.
4. Nach 1–2 Minuten ist die App unter
   `https://<dein-name>.github.io/kalenderblatt/` erreichbar.

Beide Wege liefern automatisch HTTPS – das ist Pflicht, sonst funktionieren
Mitteilungen und Offline-Betrieb nicht.

---

## Später aktualisieren

Wenn ich dir eine neue Version gebe:

- **Netlify:** denselben Ordner nochmal auf die Site ziehen (im Netlify-Dashboard
  unter „Deploys“ → „Drag and drop“). Alte Adresse bleibt gleich.
- **GitHub:** die geänderten Dateien im Repository ersetzen.

In `service-worker.js` steht oben `const CACHE = "kalenderblatt-v1";`. Bei jeder
neuen Version zähle ich diese Nummer hoch, damit dein iPhone die Änderung sicher lädt.
Danach die App einmal schließen und neu öffnen.

---

## Termin per Link / Code einfügen

Statt jeden Termin von Hand einzutippen, kann ein Termin als **Link** oder
**Code** übergeben werden. Die App zeigt dann eine Vorschau und trägt ihn nach
einem Tipp auf „Hinzufügen" ein (bestehende Termine bleiben erhalten).

- **Link antippen:** `https://eldin676.github.io/kalenderblatt/#add=KB1.…`
  Öffnet die App (oder Safari) mit der Bestätigungs-Abfrage.
- **Falls der Link in Safari statt in der installierten App landet:** den Link
  oder den `KB1.…`-Code kopieren und in der App unter
  **Zahnrad → Termin per Link** einfügen.

### Link erzeugen (am Computer)

```
node tools/make-event-link.mjs '{"title":"Paddle mit Freunden","date":"2026-08-30","start":"14:00","end":"16:00","cat":"Sport","reminder":"1h"}'
```

Auch mehrere Termine auf einmal: eine `.json`-Datei mit einem Array übergeben.
Feld-Referenz steht oben in `tools/make-event-link.mjs`. Die Nutzdaten stehen
nur im `#…`-Teil der URL und werden dadurch nie an einen Server übertragen.

## Datensicherung

Zahnrad → **Sicherung → Daten exportieren** speichert alle Termine als Datei.
Über **Daten importieren** holst du sie zurück (z. B. auf einem neuen Handy).
Mach das ab und zu – die Daten liegen nur lokal auf dem Gerät.

---

## Zu den Mitteilungen (ehrlich)

- Nach dem Erlauben kommen Erinnerungen als echte iOS-Mitteilung.
- Ganz zuverlässig sind sie, solange die App in den letzten Stunden mindestens
  einmal offen war. iOS erlaubt Web-Apps ohne eigenen Push-Server kein
  garantiertes Aufwecken bei tagelang geschlossener App.
- Praxis-Tipp: den Kalender einmal am Tag kurz öffnen – dann werden alle
  fälligen Erinnerungen sicher nachgeholt.
- Wenn dir das irgendwann nicht reicht, kann man einen kleinen (weiterhin
  kostenlosen) Push-Dienst ergänzen. Sag einfach Bescheid.
