# PORTAALISEGMENTIT — PAKOLLINEN VALVONTA

Tämä dokumentti on PAKOLLINEN lukea ennen kuin muutetaan mitään JOKI-tiedostoa.

---

## MYYJÄ

Myyjän portaali. Myyjä on tapahtuman omistaja.

Tiedostot:
- src/pages/work-order/OverviewPage.tsx
- src/pages/work-order/CateringPage.tsx
- src/pages/work-order/SpacesPage.tsx
- src/pages/work-order/SchedulePage.tsx
- src/pages/work-order/ServicesPage.tsx
- src/pages/work-order/AVProductionPage.tsx
- src/pages/work-order/PerustiedotPage.tsx
- src/pages/work-order/CustomSectionPage.tsx
- src/pages/work-order/OfferPage.tsx

Myyjän navigaatio: Yleiskuva, Tilat, Aikataulu, Catering, Lisäpalvelut & AV, Yhteenveto

---

## ASIAKAS

Asiakkaan portaali. Asiakas näkee vain myyjän lähettämän ehdotuksen.

Tiedostot:
- src/pages/client/ClientPortal.tsx
- src/pages/client/ProposalView.tsx

Asiakkaan navigaatio: Ehdotus (yksi sivu)

---

## CATERING-KUMPPANI

Catering-kumppanin portaali. Kumppani näkee VAIN catering-osion.

Tiedostot:
- src/pages/partner/PartnerCateringPage.tsx
- src/pages/partner/PartnerProductsPage.tsx

Catering-kumppanin navigaatio: Catering, Tuotteet, Aikataulu, Keskustelu
EI yleiskuvaa. EI myyjän sivuja.

---

## AV-KUMPPANI

AV-kumppanin portaali. Kumppani näkee VAIN AV-osion.

Tiedostot:
- src/pages/partner/PartnerAVProductionPage.tsx

AV-kumppanin navigaatio: AV / tekniikka, Aikataulu, Keskustelu
EI yleiskuvaa. EI myyjän sivuja. EI catering-sivuja.

---

## JAETUT TIEDOSTOT

Nämä vaikuttavat KAIKKIIN portaaleihin:

- src/components/layout/RightPanel.tsx
- src/components/layout/UnifiedLayout.tsx
- src/components/layout/ModeSwitcher.tsx
- src/components/layout/ModeRouter.tsx
- src/context/WorkOrderContext.tsx
- src/context/TeamContext.tsx
- src/context/ModeContext.tsx
- src/data/types.ts
- src/data/mock.ts

---

## SÄÄNNÖT

1. ÄLÄ muuta toisen portaalin tiedostoja ilman lupaa
2. ÄLÄ lisää yleiskuvaa kumppaniportaaleihin
3. ÄLÄ lisää myyjän navigaatiota kumppaneille
4. ÄLÄ anna kumppanin nähdä toisen kumppanin osioita
5. JAETUN tiedoston muutos → tarkista vaikutus KAIKKIIN portaaleihin
6. KYSY AINA lupa ennen segmenttirajan ylittämistä

## ENNEN JOKAISTA MUUTOSTA

Kysy itseltäsi:
- Mihin portaaliin tämä tiedosto kuuluu?
- Vaikuttaako muutos toiseen portaaliin?
- Onko tämä jaettu tiedosto?

Jos vastaus on epäselvä → PYSÄHDY ja kysy.
