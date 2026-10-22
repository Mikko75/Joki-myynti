# JOKI Myynti-Peli — E2E Tarkistuslista

> Versio: 2026-10-22  
> Testattava: http://localhost:5173

---

## FLOW 1 — Saapunut leedi (myyjä vastaa asiakkaalle)

### 1.1 Kanban-näkymä
- [ ] `/` näyttää kanban-taulun
- [ ] `wo-1` (Esimerkkiyritys Oy) näkyy "Työn alla" -sarakkeessa
- [ ] Kortin footer näyttää: viesticount + päivämäärä
- [ ] Progress-palkki on oikeassa kohdassa (työnalla = 15–55%)

### 1.2 Yleiskuva (myyjä)
- [ ] Klikkaa `wo-1` → aukeaa `/tyomarain/wo-1/yleiskuva`
- [ ] Perustiedot-kortissa lukee **"Ei vielä vastattu asiakkaalle"**
- [ ] Nappi **"Vastaa asiakkaalle"** näkyy (ei "Lähetä asiakkaalle")
- [ ] Tilat-kortissa näkyy thumbnail-kuva tilan nimellä
- [ ] Section-kortit: Tilat, Aikataulu, Catering, Lisäpalvelut näkyvät

### 1.3 Compose-modali (tapahtumavahvistus)
- [ ] Klikkaa "Vastaa asiakkaalle" → modali aukeaa
- [ ] Modalin otsikko: **"Vastaa asiakkaalle"**
- [ ] Viesti-tekstikenttä: pre-täytetty "Hei Matti, Kiitos yhteydenotosta!..."
- [ ] Tapahtumatiedot näkyvät alla (yhtiö, päivä, osallistujat, catering, AV)
- [ ] Napit: "Peruuta" + "Lisää ehdotukseen"
- [ ] Klikkaa "Lisää ehdotukseen" → modali sulkeutuu
- [ ] Sidebar näyttää "Tapahtumavahvistus — Luonnos"

### 1.4 Lähetys sidebarista
- [ ] "Lähetä ehdotus" -nappi on **enabled** (draft olemassa)
- [ ] Klikkaa "Lähetä ehdotus"
- [ ] Sidebar: badge muuttuu "Asiakkaalla"
- [ ] Perustiedot-kortti: **"Tapahtumavahvistus lähetetty — ei vielä avattu"** (keltainen teksti)

---

## FLOW 2 — Asiakasportaali (tapahtumavahvistus)

### 2.1 Ehdotuksen avaus
- [ ] Vaihda mode → **Asiakas**
- [ ] Navigoi `/tyomarain/wo-1/ehdotus`
- [ ] "Tapahtumavahvistus" -kortti näkyy **ylimpänä**
- [ ] Myyjän viesti näkyy lainauslaatikossa (harmaa vasen reuna)
- [ ] Tapahtumatiedot listattu riveittäin (Yhtiö, Tapahtumatyyppi, Osallistujia...)
- [ ] Badge: "Odottaa vastausta"
- [ ] Napit: "✓ Hyväksy" + "Pyydä muutoksia"

### 2.2 Lukuvastaanotto
- [ ] Palaa myyjä-moodiin → yleiskuva
- [ ] Perustiedot-kortti: teksti muuttui → **"Avattu [aika]"** (sininen)
- [ ] Sidebar-kortti: **"● Avattu [aika]"**

### 2.3 Hyväksyntä
- [ ] Vaihda asiakas-moodiin → ehdotus-sivu
- [ ] Klikkaa "Hyväksy" tapahtumavahvistuksessa
- [ ] Badge muuttuu: **"Hyväksytty"** (vihreä)
- [ ] "Peru"-linkki näkyy

---

## FLOW 3 — Proposal-osiot (tilat + aikataulu)

### 3.1 Myyjä lisää osioita sidebariin
- [ ] Myyjä-moodissa yleiskuva
- [ ] Klikkaa **+** tilat-kortilla → tilat ilmestyy sidebariin "Luonnos"
- [ ] Klikkaa **+** aikataulu-kortilla → aikataulu ilmestyy sidebariin
- [ ] Sidebar: 2 draft-osiota, "Lähetä ehdotus" enabled

### 3.2 Lähetys
- [ ] Klikkaa "Lähetä ehdotus"
- [ ] Työmääräimen status → **"Asiakkaalla"** (kanbanissa näkyy muutos)
- [ ] Tilat-kortilla badge muuttuu "Asiakkaalla"

### 3.3 Asiakkaan näkymä
- [ ] Asiakas-moodi → ehdotus-sivu
- [ ] Tilat-osio näkyy tilakorteilla + kuvilla
- [ ] Aikataulu-osio näkyy ohjelmakohtineen
- [ ] Molemmat: "Hyväksy" + "Pyydä muutoksia" -napit

### 3.4 Muutospyyntö
- [ ] Klikkaa "Pyydä muutoksia" tilat-osiosta
- [ ] Kirjoita kommentti: "Haluaisimme eri tilan"
- [ ] Klikkaa "Lähetä"
- [ ] Badge: "Muutoksia pyydetty" (punainen)
- [ ] Myyjä näkee kortin alaosassa asiakkaan kommentin
- [ ] Myyjä: "✓ Käsitelty" -nappi näkyy kortilla

---

## FLOW 4 — Uuden työmääräimen luonti (myyjä)

### 4.1 Lomake
- [ ] Navigoi `/uusi-liidi`
- [ ] Täytä: yritys "Testitoimisto Oy", yhteyshenkilö "Pekka Testi"
- [ ] Valitse lähde: "Puhelin" (ei "Web-lomake")
- [ ] Luo työmääräin → redirectaa yleiskuvalle

### 4.2 Oikea CTA
- [ ] **Ei** compose-modalia automaattisesti ✓
- [ ] Perustiedot-kortissa: **"Lähetä asiakkaalle"** (ei "Vastaa") ✓
- [ ] Klikkaa "Lähetä asiakkaalle" → modali otsikolla **"Lähetä asiakkaalle"**
- [ ] Viesti pre-täytetty vain "Hei Pekka," (tyhjä body) ✓

---

## FLOW 5 — Catering-kumppani

### 5.1 Kutsuminen
- [ ] Yleiskuva → "Kutsu" → lisää **Mauno Rajupaja** (catering)
- [ ] Vaihda mode → kumppani (Mauno)
- [ ] Catering-sivu aukeaa (partnerin näkymä)

### 5.2 Kumppanin vastaus
- [ ] Catering-sivu: täytä tarjoiluhetki + hinnat
- [ ] Sidebar → "Lähetä ehdotus myyjälle"
- [ ] Myyjä-moodissa: catering-kortissa **"Tarkistettavana"** tai kumppanin nimi

---

## FLOW 6 — Lopullinen tarjous

### 6.1 Kaikki hyväksytty
- [ ] Hyväksy kaikki 4 pääosiota asiakkaana (tilat, aikataulu, catering, lisapalvelut)
- [ ] Myyjä-moodissa yleiskuva: **"Kaikki osiot hyväksytty!"** -banner näkyy
- [ ] "Luo lopullinen tarjous →" -nappi näkyy

### 6.2 Tarjous-sivu
- [ ] Klikkaa nappia → `/tyomarain/wo-1/tarjous`
- [ ] Hinnat, ALV-erittely, yhteensä näkyvät
- [ ] Asiakas-portaalissa lopullinen tarjous näkyy

---

## YLEINEN

- [ ] Moodinvaihto myyjä → kumppani → asiakas → myyjä toimii ilman virheitä
- [ ] Sivuston navigointi: kaikki sidebar-linkit aukeavat
- [ ] Kalenteri `/kalenteri` näyttää tapahtumat
- [ ] Post-it muistiinpanot: lisää, muokkaa, poista — kortit suoria (ei kiertoa)
- [ ] Lukuvastaanotto toimii: "Avattu" näkyy oikeissa paikoissa

---

*Generoitu automaattisesti — Claude Code 2026-10-22*
