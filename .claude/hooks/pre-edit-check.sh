#!/bin/bash
# JOKI Myynti-Peli — Pre-edit tarkistus
# Lukee muokattavan tiedoston ja tarkistaa säännöt ennen koodimuutosta.

INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('file_path',''))" 2>/dev/null)

if [ -z "$FILE" ]; then exit 0; fi

BASENAME=$(basename "$FILE")

# ─── SIDEBAR-SÄÄNTÖ ────────────────────────────────────────────────
if [[ "$BASENAME" == "RightPanel.tsx" ]]; then
  echo "⚠️  SIDEBAR-SÄÄNTÖ: RightPanel = VAIN lähettämistä varten."
  echo "   Saapuva data (kumppanin ehdotukset, asiakkaan kommentit) → KESKELLE, EI sidebariin."
  echo "   Tarkista ennen muutosta: näytänkö LÄHETETTÄVÄÄ vai SAAPUVAA dataa?"
  echo ""
fi

# ─── PORTAALISEGMENTIT ─────────────────────────────────────────────
case "$FILE" in
  */pages/work-order/*)
    echo "📁 SEGMENTTI: MYYJÄ — älä tuo tänne kumppanin tai asiakkaan logiikkaa."
    ;;
  */pages/partner/PartnerCatering*)
    echo "📁 SEGMENTTI: CATERING-KUMPPANI — näkee vain oman cateringinsa."
    echo "   ❌ Ei myyjän dataa. ❌ Ei toisen kumppanin dataa. ❌ Ei globaalia proposalSectionsia ilman partnerId-filtteriä."
    ;;
  */pages/partner/PartnerAV*)
    echo "📁 SEGMENTTI: AV-KUMPPANI — näkee vain AV-osion."
    echo "   ❌ Ei catering-dataa. ❌ Ei myyjän sivuja."
    ;;
  */pages/client/*)
    echo "📁 SEGMENTTI: ASIAKAS — read-only, näkee vain myyjän lähettämän ehdotuksen."
    ;;
  */components/layout/RightPanel.tsx|*/components/layout/UnifiedLayout.tsx|*/context/*)
    echo "📁 SEGMENTTI: JAETTU — muutos vaikuttaa KAIKKIIN portaaleihin. Tarkista erikseen myyjä, kumppani ja asiakas."
    ;;
esac

# ─── CATERING-SPEKSIN MUISTUTUS ────────────────────────────────────
if [[ "$BASENAME" == "CateringPage.tsx" ]] || [[ "$BASENAME" == "PartnerCateringPage.tsx" ]]; then
  echo ""
  echo "📋 CATERING-FLOW (lue docs/JOKI_CATERING_SPEC.md jos epäselvää):"
  echo "   Myyjä: tapahtumapyyntö + aikataulu + huomiot → Tallenna → kortti → + → sidebar → Lähetä kumppanille"
  echo "   Kumppani: näkee briiffin → valitsee menut → + → sidebar → Lähetä myyjälle"
  echo "   Myyjä: hyväksyy → yleiskuva → + → sidebar → Lähetä asiakkaalle"
fi

echo ""
exit 0
