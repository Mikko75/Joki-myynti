# JOKI Catering Spec — Asiakkaan lomakkeesta kumppanin toimeksiannoksi

Version: 1.0
Status: Pakollinen speksi

---

## 1. Yleisnäkymä — asiakkaalle lähetettävät ehdotukset

Tämä on jo olemassa oleva ja säilytettävä toimintamalli.

Myyjän Yleisnäkymässä on tapahtuman osiot:
- Tilat
- AV / Lisäpalvelut
- Catering
- Aikataulu

Myyjä voi lisätä haluamansa osiot asiakkaalle lähetettävään ehdotukseen plus-toiminnolla.

Prosessi:
**Yleisnäkymän osio → + → RightPanel "Ehdotus asiakkaalle" → Lähetä**

Myyjä voi lähettää:
- Pelkät tilat
- Tilat ja aikataulun
- Tilat, aikataulun ja Cateringin
- Kaikki valmiit osiot

Kaikkien osioiden ei tarvitse olla valmiita.

**Älä muuta Yleisnäkymän kortteja, asiakkaan RightPanelia tai nykyistä lähetyslogiikkaa.**

---

## 2. Asiakkaan alustava aikataulu

Asiakas lähettää lomakkeella esim:

```
08:00 Rakennus alkaa
12:00 Ovet avautuvat
12:30 Tervetulokahvi
13:00 CEO keynote
13:45 Paneelikeskustelu
14:30 Kahvitauko
18:00 Iltagaala
```

### Odotettu toiminta

- Lomakkeen aikataulutieto siirtyy tapahtuman yhteiseen Aikataulu-osioon
- Aikataulu näkyy myös myyjän Catering-osiossa
- **Yksi aikataulu, useita näkymiä**
- Jos myyjä muuttaa kellonajan Catering-osiossa → näkyy Aikataulu-osiossa
- Jos myyjä muuttaa kellonajan Aikataulu-osiossa → näkyy Catering-osiossa

### Tekstin jäsentäminen

- Tunnista `HH:MM teksti` rivit
- Älä keksi puuttuvia kellonaikoja tai kestoja
- Säilytä alkuperäinen lomaketeksti
- Älä luo aikataulurivejä kahteen kertaan

---

## 3. Myyjän Catering-osio

### Tarkoitus

Myyjä näkee asiakkaan tiedot ja valmistelee Catering-kumppaneille lähetettävän pyynnön.

**Myyjän ei tarvitse luoda tarjoiluhetkikortteja, valita menuja tai hallita tuotteita.**

### Näkymän rakenne

```
CATERING

TechVision Summit 2027
Nordic Digital Oy · 13.11.2027 · 450 henkilöä

──────────────────────────────────────

TAPAHTUMAN KUVAUS
Vuosittainen teknologiakonferenssi...

──────────────────────────────────────

TAPAHTUMAN AIKATAULU
08:00  Rakennus alkaa
12:00  Ovet avautuvat
12:30  Tervetulokahvi
...

+ Lisää aikataulumerkintä

──────────────────────────────────────

MYYJÄN HUOMIOT CATERINGILLE
[ Vapaamuotoinen tekstikenttä ]

──────────────────────────────────────

KESKUSTELU
[ Nykyinen keskustelukomponentti ]

──────────────────────────────────────

OIKEA SIVUPALKKI
Ehdotus Catering-kumppaneille
[ Valittu lähetettävä sisältö ]
[ Valitse kumppani(t) ]
[ Lähetä ehdotus ]
```

### Myyjän oikeudet

Myyjä voi:
- Muuttaa aikataulun kellonaikoja
- Muokata ohjelmamerkintöjen tekstejä
- Lisätä/poistaa aikataulumerkintöjä
- Kirjoittaa Catering-huomioita
- Lähettää tiedot kumppaneille
- Keskustella kumppanien kanssa
- Tarkastella kumppanien ehdotuksia

Myyjä EI:
- Luo Catering-tuotteita
- Muokkaa tuoteluetteloa
- Rakenna kumppanin menuja
- Joudu luomaan tarjoiluhetkikortteja ennen lähettämistä

---

## 4. Lähettäminen Catering-kumppaneille

### Ehdotusajattelu säilyy

Myyjä kokoaa lähetettävän sisällön Catering-RightPaneliin:
- Tapahtuman perustiedot
- Osallistujamäärä
- Tapahtuman kuvaus
- Ajantasainen aikataulu
- Myyjän Catering-huomiot

### Useita kumppaneita

Myyjä voi lähettää saman pyynnön esim. kahdelle kumppanille:
- Catering A (Mauno)
- Catering B (Unica)

Kumppanit eivät näe toistensa tarjouksia.

### Tärkeä rajaus

**Se ettei myyjä luo tarjoiluhetkikortteja tässä vaiheessa EI tarkoita RightPanelin poistamista.**

Jos nykyinen Catering-RightPanel tukee vain valmiita kortteja, selvitä pienin muutos
jolla myös tapahtuman lähtötiedot voidaan lisätä samaan lähetyskokonaisuuteen.

Älä luo toista RightPanelia tai rinnakkaista lähetyspolkua.

---

## 5. Catering-kumppanin työskentely

Kumppani näkee:
- Tapahtuman tiedot
- Osallistujamäärä
- Yhteinen aikataulu
- Myyjän Catering-huomiot

Kumppani rakentaa oman ehdotuksensa:
- Käyttää olemassa olevia menuja ja tuotteita
- Liittää tarjoilut aikataulun kohtiin
- Täydentää hinnat
- Lähettää ehdotuksen myyjälle nykyisellä RightPanelilla

**Catering omistaa tuotteet ja menujen sisällöt.**

Tapahtumakohtaiset muutokset eivät saa muuttaa globaalia master-menua.

---

## 6. Kahden ehdotuksen vastaanotto

Myyjä näkee Catering A ja Catering B ehdotukset erillisinä:

| | Catering A | Catering B |
|---|---|---|
| Tervetulokahvi | Menu A1 | Menu B1 |
| Kahvitauko | Menu A2 | Menu B2 |
| Iltagaala | Menu A3 | Menu B3 |
| **Hinta** | 14 500 € | 16 200 € |

- A ei korvaa B:tä
- Myyjä näkee kumman kumppanin ehdotus
- Myyjä valitsee asiakkaalle esitettävän vaihtoehdon
- Kumppanin sisäiset ostohinnat eivät siirry asiakkaalle

---

## 7. Asiakkaalle lähetettävä ehdotus

Myyjä palaa Yleisnäkymään ja lisää:
- Tilat
- Aikataulu
- Catering (valitun kumppanin ehdotus)

**Yleisnäkymä → + → Ehdotus asiakkaalle → Lähetä**

Asiakas näkee: tilat, aikataulu, menut, asiakashinnat.
Asiakas EI näe: hylättyä vaihtoehtoa, kilpailutusta, sisäisiä muistiinpanoja.

### Myyjän oikeus ohittaa kumppanikierros

Myyjä voi lähettää Catering-sisällön suoraan asiakkaalle ilman kumppanin hyväksyntää.
Tämä ei anna myyjälle tuotteiden muokkausoikeutta.

---

## 8. Dynaamisuus

Ehdotuksen lähettäminen ei päätä suunnittelua.

Esimerkki:
1. Myyjä lähettää Catering A menut asiakkaalle
2. Asiakas: "Voisiko olla enemmän kasvisvaihtoehtoja?"
3. Myyjä keskustelee Catering A kanssa
4. Catering A muokkaa menua
5. Myyjä lähettää päivitetyn ehdotuksen asiakkaalle

**Sama EVENT koko ajan.**

Keskustelu toimii:
- Myyjä ↔ Asiakas
- Myyjä ↔ Catering A
- Myyjä ↔ Catering B

---

## 9. Mitä EI saa muuttaa

1. EVENT- ja PROPOSAL-perusmallia
2. RightPanelia
3. Yleisnäkymän asiakasehdotuskortteja
4. Toimivaa asiakastarjouksen lähetysprosessia
5. AV, tilojen tai muiden toimivien osioiden logiikkaa

Älä:
- Rakenna uutta Catering-portaalia
- Rakenna erillistä partner inboxia
- Rakenna toista aikataulujärjestelmää
- Pakota myyjää luomaan kortteja ennen lähettämistä
- Anna myyjälle Catering-tuotteiden muokkausoikeutta
- Yhdistä kahden kumppanin ehdotuksia vahingossa
- Tee laajaa tietomallirefaktorointia

---

## 10. Hyväksymistestit

| # | Testi | Kriteeri |
|---|-------|---------|
| 1 | Asiakas lähettää lomakkeen | Liidi syntyy |
| 2 | Myyjä avaa tapahtuman | Tiedot näkyvät |
| 3 | Myyjä avaa Aikataulun | Lomakkeen ohjelma näkyy |
| 4 | Myyjä avaa Cateringin | Sama ohjelma näkyy |
| 5 | Myyjä muuttaa kellonaikaa | Muutos molemmissa osioissa |
| 6 | Myyjä lisää Catering-huomion | Tallentuu |
| 7 | Myyjä lähettää Catering A ja B | Molemmat saavat pyynnön |
| 8 | Catering A lisää menut ja hinnat | Tallentuu tapahtumaan |
| 9 | Catering B tekee oman ehdotuksen | A säilyy erillisenä |
| 10 | Molemmat lähettävät myyjälle | Myyjä näkee kaksi vaihtoehtoa |
| 11 | Myyjä valitsee Catering A | Valittu sisältö voidaan lähettää asiakkaalle |
| 12 | Myyjä lähettää asiakkaalle | Yleisnäkymä + RightPanel toimii |
| 13 | Asiakas kommentoi | Keskustelu toimii |
| 14 | Catering tekee muutoksen | Päivitetty ehdotus voidaan lähettää uudelleen |
| 15 | Sivut päivitetään | Tallennetut tiedot säilyvät |

---

## 11. Lopullinen tuoteajatus

JOKI ei ole järjestelmä jossa täytetään kentät ja painetaan Lähetä.

JOKI on tapahtuman ympärille rakentuva dynaaminen yhteistyö- ja ehdotusalusta.

- Asiakas antaa tarpeen
- Myyjä rakentaa tapahtumaa
- Kumppanit täydentävät omat palvelunsa
- Myyjä valitsee asiakkaalle esitettävän kokonaisuuden
- Asiakas kommentoi ja pyytää muutoksia

**Yksi tapahtuma. Useita kumppaneita. Useita ehdotuskierroksia. Yksi yhtenäinen toimintamalli.**
