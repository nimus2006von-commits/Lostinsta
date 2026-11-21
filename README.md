# Direkt — Instagram brez feeda

Spletna aplikacija (PWA), ki omogoča dostop do Instagram **sporočil** in **stories**
izbranih oseb, brez da bi se kdaj odprla domača stran, Reels ali Explore.

## Kako deluje

- Vsaki osebi, ki jo dodaš, sta na voljo dve povezavi:
  - **Sporočilo** — github `ig.me/m/uporabniško_ime`, Instagramov uradna povezava, ki
    odpre pogovor direktno, brez feeda.
  - **Story** — github `instagram.com/stories/uporabniško_ime`, odpre story te osebe.
- Seznam oseb in statistika odprtij sta shranjena lokalno (localStorage).
- Izvozi / uvozi seznam kot datoteko JSON, da ga preneseš med napravami.
- Deluje brez povezave ( aplikacijska lupina je predpomnjena prek service workerja).

## Namestitev

PWA zahteva obisk prek HTTPS (npr. GitHub Pages, Netlify ali podobna statična gostovanja).

1. Objavi mapo kot statično spletno stran (vsa vsebina v tej mapi).
2. Na telefonu odpri stran v brskalniku (Chrome / Safari).
3. **Android (Chrome):** Meni → *Dodaj na domači zaslon* oz. *Namesti aplikacijo*.
4. **iPhone (Safari):** Deli → *Dodaj na domači zaslon*.
5. Namesto Instagram aplikacije odpiraj to ikono.

## Testiranje lokalno

Service worker ne deluje prek `file://`, zato uporabi lokalni strežnik:

```bash
python3 -m http.server 8080
```

in odpri http://localhost:8080 (za namestitev PWA je potreben HTTPS ali localhost).

## Omejitve

- Instagramovih strani ni mogoče vdelati (iframe), zato aplikacija odpira ciljne strani
  v novem zavihku/oknu, kjer si prijavljen/a na Instagram.
- Prijava v Instagram ostane naloga Instagrama; aplikacija ne vidi niti ne shranjuje
  gesel ali žetonov.
