# JOKI — Benchmark-kooste: navigaation/sivupalkin ja työmääräin-sisällön uudistus

## Context

Käyttäjä näytti kuvakaappauksia/videon Event Temple -tuotteesta (venue/event sales -ohjelmisto) inspiraationa JOKI Myynti-Pelin navigaation, sivupalkin ja työmääräin-sisällön jatkokehitykselle. Ennen konkreettista toteutusta käyttäjä halusi vahvat benchmarkit muista isojen tapahtumien järjestämiseen tarkoitetuista tuotteista — jotta muutokset perustuvat toimialan vakiintuneisiin malleihin, ei vain yhteen esimerkkiin.

---

## 1. Kilpailijakatsaus (7 tuotetta, WebFetch syyskuu 2026)

| Tuote | Kohderyhmä | Erottuva vahvuus |
|---|---|---|
| **Tripleseat** | 20 000+ hospitality-venuea: ravintolat, hotellit, cateringit, häävenuet, panimot, monikiinteistö-ketjut | Capture→Book→Plan→Grow -vaiheistus; 2D/3D-pohjapiirrokset, huonelohkot hotelleille |
| **Cvent** | Enterprise, Fortune 100 -taso, 340 000 venuen sourcing-verkosto | Koko elinkaari: sourcing→rekisteröinti→toteutus→ROI-raportointi; RFP-konversio venue-myyjille |
| **Momentus** (ent. Ungerboeck/Priava) | Kongressikeskukset, stadionit, korkeakoulukampukset, museot | Yhtenäinen kalenteri koko organisaatiolle, resurssiseuranta (tilat+kalusto+henkilöstö+inventaario), MoPay-laskutus |
| **iVvy** | Hotelliketjut, stadionit, monivenue-hospitality-ryhmät | Function diary, monivenue-näkyvyys, versioidut BEOt, integroitu maksu (PCI-DSS) |
| **MeetingPackage** ⭐ | Hotellit/venuet, M&E-myynti — **pohjoismainen** (Strawberry-referenssi) | AI-agentit varausprosessiin, eProposal, keskitetty lead-reititys, 100+ integraatiota |
| **Perfect Venue** | Yksittäiset venuet: ravintolat, panimot, musiikkitalot, golfklubit | Kevyempi, AI hoitaa viestit/proposalit/BEOt, Stripe-maksut, kalenteri estää tuplavaraukset |
| **Planning Pod** | Häävenuet, maatilat, golfklubit, hotellit — keskisegmentti | BEO+F&B-työkalut, pohjapiirrokset+istumakartat, maksuerät, asiakasportaali |

**Kohderyhmähuomio:** JOKI on yhden venuen (ei ketjun) järjestelmä isoille tapahtumille. Lähimmät rakenteelliset vertailukohdat ovat **MeetingPackage** (pohjoismainen, hotelli/venue M&E-fokus) ja **Perfect Venue / Planning Pod** (yksittäinen venue, ei enterprise-ylimitoitusta). Cvent/Momentus edustavat enterprise/kongressikeskus-skaalaa — hyviä ideoita resurssienhallintaan, mutta niiden feature-laajuus on ylimitoitettu tähän demoon.

### Toistuvat mallit kaikissa tuotteissa (vahva signaali priorisointiin)

1. **Yksi yhtenäinen kalenteri/tilanäkymä joka estää tuplavaraukset** — Tripleseat, Cvent, Momentus, iVvy, Perfect Venue, Planning Pod. JOKI:n nykyinen kalenteri on päivämääräruudukko, ei tila-rivipohjainen — selkein ja toistuvin ero.
2. **Selkeä myyntiputki** inquiry→qualifying→proposal→contract→confirmed — JOKI:n Kanban (5 saraketta) vastaa jo rakennetta, nimeäminen voisi tarkentua.
3. **BEO (Banquet Event Order) -tyyppinen koostedokumentti** per tapahtuma — JOKI:n Tarjous-sivu on lähellä, mutta ei BEO-formaatissa.
4. **Brändätty asiakasportaali + e-signature proposaalit** — JOKI:lla on asiakasportaali (hyväksy/hylkää/muutospyyntö), mutta ei e-signaturea eikä maksua.
5. **Integroitu maksu/laskutus** (useimmiten Stripe) — puuttuu JOKI:sta kokonaan (odotettua, demo ilman backendiä).
6. **Task/checklist-työkalut tiimille** — Perfect Venue & Planning Pod; JOKI:lla on ad hoc -tehtävälista Yleiskuvassa, ei omaa välilehteä.

---

## 2. MeetingPackage — syväsukellus

Pääbenchmark, koska pohjoismainen ja rakenteellisesti lähin JOKI:a. Tuotesivut (central-reservation-system, eproposal, ai-suite, success-stories) estivät automaattisen haun (402-virhe, todennäköisesti bottisuoja), mutta blogi oli avoin — kolme relevanttia artikkelia luettu kokonaan.

### 2.1 Lisäpalvelu-/add-on-katalogi ("service catalog items")
- Venuet rakentavat standardoituja add-on-katalogituotteita (kahvitauot, AV-paketit, kuljetukset, vastaanotot, aktiviteetit) uudelleenkäytettävillä hinnoittelusäännöillä
- Kaksi hinnoittelumallia rinnakkain:
  - **Bundlattu** — paketti kuten "Day Meeting Package": tila+AV+2 kahvitaukoa+lounas kiinteällä hinnalla
  - **Modulaarinen** — perushinta + erikseen valittavat lisät
- 6 add-on-kategoriaa: majoitus-upsellit, F&B, AV/tuotanto, elämykset/aktiviteetit, kuljetus/logistiikka, tapahtumatuotanto/muut
- **Nyanssi:** lähde ei mainitse määrä-stepperiä ("x20 kpl") tai rivikohtaista cart-UI:ta — konseptitason katalogirakenne, ei vahvistus Event Templen "+/- stepperi" -kuvalle
- **Missä add-onit näkyvät prosessissa:** suoravarauksen checkoutissa vain pienille/yksinkertaisille kokouksille; isojen tapahtumien RFP/proposal-vaiheessa add-onit näkyvät **suositeltuina lisinä proposaalin sisällä** ("recommended AV setups", "suggested catering upgrades") — ei itsepalvelu-checkoutina

### 2.2 "Real-time availability" -kalenteri
- Määritellään toiminnallisesti "elävänä, varattavana inventaariona" (tila+hinta+paketit+rajoitukset), synkassa operatiivisten järjestelmien kanssa — ei "kiiltävä sivu huoneista ja PDF:istä"
- Instant booking = e-commerce-tyylinen "compare & confirm in one session" — mutta tarkoitettu pieniin/yksinkertaisiin kokouksiin, ei isoihin neuvoteltaviin tapahtumiin
- Ei tarkkaa UI-layout-kuvausta löytynyt lähteestä — visuaalinen rakenne johdettava muista benchmarkeista (rivit=tilat, sarakkeet=aika)

### 2.3 AI Commerce Engine (inquiry→booking-automaatio)
- Sisääntulokanavat: sähköposti-AI-agentti, ääni-AI, jakelukumppanit, markkinapaikat
- Putki: AI jäsentää pyynnön → hinnoittelu-/liiketoimintasäännöt → reaaliaikainen saatavuustarkistus → brändätty proposaali generoituu ja lähtee sekunneissa
- Raskas taustajärjestelmäintegraatio (PMS, S&C, CRM) — **ei relevantti JOKI:lle tässä vaiheessa**, koska kyseessä on frontend-demo ilman backendiä

---

## 3. Synteesi: mitä tämä tarkentaa JOKI:n suunnasta

- **"Pay Now"-tyylinen itsepalvelu-checkout (Event Templen kuva) sopii huonosti JOKI:n käyttötapaukseen.** JOKI on isojen, räätälöityjen tapahtumien työmääräinjärjestelmä, ei pienten kokousten instant-booking-työkalu. MeetingPackagenkin mukaan itsepalvelu-checkout on vain pienille/yksinkertaisille varauksille; isot tapahtumat kulkevat proposaali-/neuvottelupolun kautta — mikä vastaa JOKI:n nykyistä Tarjous→Asiakasportaali-hyväksymisflowta paremmin kuin Stripe-tyylinen kori.
- **Relevantimpi parannus:** JOKI:n olemassa oleva `Product`-tyyppi (`unit`, `unitPrice`, `vatPercent` — ks. `src/data/types.ts`) voitaisiin kytkeä Tarjous-sivulle/asiakasportaaliin **suositeltuina lisäpalveluina hintaerittelyssä** (moduulipohjainen, ei stepperi-korina) — lähempänä MeetingPackagen "recommended AV setups" -mallia kuin Event Templen "+ Add / stepperi" -mallia.
- **Tila-aikajanakalenteri pysyy vahvana priorisointina** (6+ vertailtua tuotetta vahvistaa tämän), mutta yksittäistä tarkkaa visuaalista layoutia ei löytynyt yhdestä lähteestä — kannattaa yhdistää useamman benchmarkin malli (rivit=tilat, sarakkeet=päivät/ajat, väri=status).
- **AI-automaatiotaso** (email/voice-agentit) rajataan pois tästä kierroksesta — ei sovi frontend-only-demoon ilman backendiä.

---

## 4. Nykytila JOKI:ssa (kartoitettu koodista ennen benchmarkkausta)

| Alue | Nykytila | Tiedosto |
|---|---|---|
| Kanban | 5 saraketta: Uusi/Työnalla/Asiakkaalla/Vahvistettu/Ei toteudu | `src/pages/KanbanPage.tsx`, `src/data/mock.ts` |
| Työmääräin-sivupalkki | yleiskuva/tilat/aikataulu/catering/av/lisäpalvelut/keskustelut/tarjous — ei erillisiä Tasks/Notes/Documents/Invoices/Payments-välilehtiä | `UnifiedLayout.tsx`, `ModeRouter.tsx` |
| Kalenteri | Kuukausi/viikko-ruudukko päivämäärän mukaan, EI resurssi/tila-aikajanaa | `src/pages/CalendarPage.tsx` |
| Tilat | Globaali tilakatalogi (`Space`-tyyppi) on olemassa, mutta ei ristiin-varausten tarkistusta eikä aikajananäkymää | `src/pages/work-order/SpacesPage.tsx`, `src/data/mock.ts` |
| Tarjous/Asiakasportaali | Hyväksy/hylkää/pyydä muutoksia -flow, ei maksu-UI:ta, ei lisäpalveluiden määrä-stepperiä | `src/pages/work-order/OfferPage.tsx`, `src/pages/client/ClientPortal.tsx` |
| Hinnoittelu | `Product`-tyyppi (unit, unitPrice, vatPercent) olemassa katalogitasolla, mutta ei kytketty qty-pohjaiseen add-on-koriin missään | `src/data/types.ts` |

---

## 5. Seuraavat vaiheet (ei vielä päätetty)

Benchmarkkaus on nyt riittävän syvä konkreettisten päätösten pohjaksi. Ei vielä valittu mitä toteutetaan. Seuraavaksi tarvitaan käyttäjältä:
1. Priorisointi — mitkä konkreettiset osat (kalenterin tila-aikajana, add-on-suositukset tarjoukseen, Kanban-nimeäminen, ym.) toteutetaan tällä kierroksella
2. Työnkulku — rakennetaanko ensin Figmaan (aiempi preferenssi) vai suoraan koodiin
3. Tekninen suunnitelma valituille osille
