# Lindas Revolt 💗

En enkel, mobilanpassad träningsapp för Linda, inspirerad av konceptet med dagliga övningar i Weekly Revolt. **Inte en officiell Weekly Revolt-produkt.** Design, texter, illustrationer och tekniktips är egna. Originalvideor och originalbilder ingår inte.

## Funktioner

- 10 veckor / 70 dagar med två dagliga övningar (från 5 till 50 repetitioner).
- Markera övningar klara var för sig; gå tillbaka och se tidigare dagar.
- Veckoprogram, kalender, statistik och svit.
- Valfri boost (+5 repetitioner per övning) och anpassning av dagens antal.
- Alla träningsdata sparas **lokalt i webbläsaren** på just den enheten.
- JSON-export/import av säkerhetskopia, om du byter telefon eller rensar webbplatsdata.
- Installationsbar som webbapp på iPhone/Android; efter första besöket kan appen fungera offline.
- Utan backend, inloggning, cookies för spårning, analytics eller externa paket.

## Publicera gratis med GitHub Pages

1. Öppna **Settings → Pages** i det här repot.
2. Välj **Build and deployment → Source → Deploy from a branch**.
3. Välj **main** och **/(root)**, klicka **Save**.
4. Webbplatsen blir normalt tillgänglig på https://ludwigberglund-coder.github.io/weeklyrevoltdupe/ när publiceringen är klar.

GitHub Free kräver publikt repo för Pages. För Pages från privat repo krävs en betalplan som stöder det. **Pages-webbplatsen är offentligt åtkomlig även om själva repot är privat.** Ingen personlig träningshistorik ligger i repot.

## Viktigt om sparade data

Framsteg synkroniseras **inte** mellan Safari, Chrome eller andra enheter. Att rensa webbplatsdata, använda privat surfning eller byta telefon kan radera historiken. Gör en säkerhetskopia under **Mer → Exportera säkerhetskopia** med jämna mellanrum. Import kan göras på en ny enhet.

## Starta lokalt

Sidan fungerar med en statisk server. Exempel: kör `python3 -m http.server 8000` i repot och öppna `http://localhost:8000`. Direktöppning av index.html via `file://` rekommenderas inte för service worker-funktionen.

## Ändra programmet

- `js/program.js`: veckornas antal, kompletterande övningar, texter och tekniktips.
- `js/storage.js`: säkra, lokala data och import/exportkontroller.
- `js/app.js`: vyer, navigation och interaktioner.
- `styles.css`: färger, komponenter och mobilanpassning.

Det går att bygga vidare med exempelvis nya träningsperioder, videor man själv har rättigheter till och fler övningar, utan att börja om.
