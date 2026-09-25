# JOKI Project Manager Pack

Tämä paketti tekee Codexista JOKI-projektin riippumattoman projektipäällikön ja laatuportin. Se ei lupaa mahdotonta virheettömyyttä. Se poistaa vaarallisemman asian: päätösten, oletusten ja hyväksyntöjen jäämisen näkymättömiksi.

## Mitä tämä ratkaisee

- Yksi paikka projektin vahvistetulle totuudelle.
- Selkeä ero vahvistetun tiedon, oletuksen ja avoimen päätöksen välillä.
- Yhtenäiset tuotteen, datan, tietoturvan ja UI/UX:n hyväksyntäportit.
- Riippumaton `joki_project_manager`-agentti, joka arvioi työn ennen toteutusta ja julkaisua.
- Päätös-, riski- ja hyväksyntähistoria, jotta samaa asiaa ei ratkaista eri tavoin eri näkymissä.
- Uudelleenkäytettävät brief-, UX-review- ja käyttöoikeusmatriisipohjat.

## Ajattelutapa

Tässä ei kopioida Applea tai Elon Muskia henkilönä. Hyödyllinen osa heidän tuoteajattelustaan muutetaan tarkistettaviksi säännöiksi:

1. Aloita käyttäjän työstä, älä ominaisuuslistasta.
2. Pura ongelma ensimmäisiin periaatteisiin: mitä on pakko olla totta, jotta prosessi toimii?
3. Poista vaihe, kenttä ja komponentti ennen kuin optimoit sen.
4. Suunnittele koko ketju päästä päähän; yksittäinen hieno näyttö ei pelasta rikkonaista prosessia.
5. Tee tärkein toiminto ilmeiseksi ja muu käyttöliittymä rauhalliseksi.
6. Prototypoi ensin riskisin oletus.
7. Älä hyväksy mielipidettä todisteeksi. Hyväksyntään tarvitaan havaittava tulos.

## Asennus VS Code -projektiin

Pura paketin sisältö Git-repositorion juureen niin, että nämä polut syntyvät:

```text
AGENTS.md
.codex/agents/joki-project-manager.toml
docs/JOKI_*.md
docs/templates/*.md
```

Codex lukee projektitason `AGENTS.md`-tiedoston automaattisesti. Projektikohtainen agentti löytyy `.codex/agents/`-hakemistosta. Agentti on tarkoituksella vain luku -tilassa: se arvioi, haastaa ja antaa porttipäätöksen, mutta ei hyväksy omaa toteutustaan.

## Ensimmäinen käyttökerta

Pyydä Codexia projektin juuressa:

```text
Käytä joki_project_manager-agenttia. Tee nykytilan auditointi suhteessa
docs/JOKI_CURRENT_STATE.md-tiedostoon. Älä muuta koodia. Palauta puuttuvat
todisteet, riskit ja järjestetty 30/60/90 päivän etenemissuunnitelma.
```

Yksittäiselle ominaisuudelle:

```text
Käytä joki_project_manager-agenttia arvioimaan tämä feature brief.
Anna tuomio PASS, CONDITIONAL tai BLOCKED. Listaa täsmällinen näyttö,
joka puuttuu ennen toteutusta.
```

UI/UX-katselmukseen:

```text
Käytä joki_project_manager-agenttia tähän näkymään ja täytä
docs/templates/UX_REVIEW.md. Arvioi kaikki tilat, roolit, responsiivisuus,
saavutettavuus ja yhteys JOKI:n tilamalliin. Älä arvioi vain ulkoasua.
```

## Paketin rakenne

| Tiedosto | Tarkoitus |
|---|---|
| `AGENTS.md` | Kaikkia projektissa toimivia agentteja sitovat säännöt |
| `.codex/agents/joki-project-manager.toml` | Riippumaton projektipäällikkö- ja laatuporttiagentti |
| `docs/JOKI_PRODUCT_TRUTH.md` | Tuotteen tarkoitus, käyttäjät, rajat ja onnistumisen mittarit |
| `docs/JOKI_PROJECT_OPERATING_MODEL.md` | Projektipäällikön työjärjestys, vastuut ja 30/60/90 päivän malli |
| `docs/JOKI_DOMAIN_AND_STATE_MODEL.md` | Oliot, tilat, siirtymät ja rikkomattomat invariantit |
| `docs/JOKI_UI_UX_STANDARD.md` | Sitova käyttöliittymä- ja DataTable-standardi |
| `docs/JOKI_VALIDATION_GATES.md` | Definition of Ready, Definition of Done ja portit |
| `docs/JOKI_CURRENT_STATE.md` | Mitä tiedetään nyt ja mitä repo-auditoinnin on vahvistettava |
| `docs/JOKI_DECISION_LOG.md` | Hyväksyttyjen päätösten historia |
| `docs/JOKI_RISK_REGISTER.md` | Avoimet riskit ja estävät päätökset |
| `docs/JOKI_RELEASE_CHECKLIST.md` | Julkaisun ja palautumisen tarkistuslista |
| `docs/templates/FEATURE_BRIEF.md` | Toteutuskelpoisen ominaisuuden määrittely |
| `docs/templates/UX_REVIEW.md` | Todisteisiin perustuva UX-katselmus |
| `docs/templates/PERMISSION_MATRIX.md` | Rooli- ja resurssikohtainen käyttöoikeusmalli |

## Työjärjestys

1. Täytä `JOKI_CURRENT_STATE.md` oikeasta reposta löytyvällä näytöllä.
2. Ratkaise `JOKI_RISK_REGISTER.md`-tiedoston blockerit ennen niitä koskevaa toteutusta.
3. Tee jokaisesta merkittävästä ominaisuudesta `FEATURE_BRIEF`.
4. Vie brief porttien G0–G3 läpi ennen tuotantokoodia.
5. Vie toteutus G4–G6 läpi ennen julkaisua.
6. Mittaa tuotannossa G7 ja päivitä päätökset todellisen käytön perusteella.

## Tärkeä rajaus

Tätä pakettia luotaessa varsinaista JOKI-repositoriota ei ollut käytettävissä. Siksi teknologiasta, nykyisestä tietomallista, testikattavuudesta tai integraatioiden toteutustavasta ei ole tehty oletuksia. Projektipäällikön ensimmäinen tehtävä on todentaa ne koodista, konfiguraatiosta ja ajettavista testeistä.
