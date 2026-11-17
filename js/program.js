/* Lindas Revolt – programmets innehåll. Ändra veckor eller övningar här. */
(function () {
  "use strict";

  const exercises = {
    armhavningar: {
      name: "Armhävningar", short: "Armhävningar", icon: "↗", category: "Överkropp",
      detail: "En klassiker som tränar bröst, armar och bål.",
      steps: ["Placera händerna lite bredare än axlarna.", "Spänn magen och håll kroppen så rak du kan.", "Böj armbågarna lugnt och pressa dig upp igen."],
      easier: "Gör armhävningarna på knä eller med händerna mot en stadig bänk eller vägg.",
      note: "Det ska inte göra ont. Justera handplaceringen om handlederna protesterar."
    },
    rygglyft: {
      name: "Rygglyft", short: "Rygglyft", icon: "◡", category: "Rygg",
      detail: "En mjuk rörelse för ryggens muskler.",
      steps: ["Ligg på mage med blicken mot underlaget.", "Lyft bröstkorgen en liten bit utan att kasta upp huvudet.", "Sänk kontrollerat och upprepa."],
      easier: "Lyft bara någon centimeter och håll händerna nära kroppen.",
      note: "Prioritera ett litet kontrollerat lyft framför höjden."
    },
    knaboj: {
      name: "Knäböj", short: "Knäböj", icon: "⌄", category: "Ben",
      detail: "Träna ben och höfter i din egen takt.",
      steps: ["Stå med fötterna ungefär höft- eller axelbrett.", "Skjut höften bakåt och böj knäna så djupt det känns bra.", "Tryck genom fötterna och res dig upp."],
      easier: "Sätt dig ned mot en stadig stol och res dig igen.",
      note: "Gå bara så djupt som känns tryggt för knäna."
    },
    ryggpendlingar: {
      name: "Ryggpendlingar", short: "Ryggpendlingar", icon: "≈", category: "Rygg",
      detail: "Lätta växelvisa rörelser med fokus på kontroll och stabilitet.",
      steps: ["Ligg bekvämt på mage med armarna framför dig.", "Lyft motsatt arm och ben försiktigt, växla sedan sida.", "Arbeta långsamt utan att svanka kraftigt."],
      easier: "Lyft bara armarna eller bara benen, ett i taget.",
      note: "Detta är en förenklad teknikbeskrivning; anpassa rörelsen efter kroppen."
    },
    utfall: {
      name: "Utfall", short: "Utfall", icon: "↘", category: "Ben",
      detail: "Stärk benen och träna balansen.",
      steps: ["Stå stadigt och ta ett lagom långt steg framåt eller bakåt.", "Böj knäna kontrollerat utan att tappa balansen.", "Pressa tillbaka till stående och växla ben."],
      easier: "Håll i en stol som stöd och gör ett grunt utfall.",
      note: "Undvik djupa vinklar om knäna känns obekväma."
    },
    sneda_rygglyft: {
      name: "Sneda rygglyft", short: "Sneda rygglyft", icon: "⌁", category: "Rygg",
      detail: "En lugn variation av rygglyft som utmanar baksidan.",
      steps: ["Ligg på mage med avslappnade axlar.", "Gör ett litet rygglyft och för bröstkorgen försiktigt snett åt ena sidan.", "Sänk lugnt och växla sida."],
      easier: "Gör vanliga små rygglyft utan sidoförflyttning.",
      note: "Undvik att vrida hårt i ryggen."
    },
    hoftlyft: {
      name: "Höftlyft", short: "Höftlyft", icon: "⌃", category: "Säte",
      detail: "En skonsam favorit för säte och baksida.",
      steps: ["Ligg på rygg med böjda knän och fötterna i golvet.", "Spänn sätet och lyft höften så att kroppen bildar en mjuk linje.", "Sänk långsamt tillbaka."],
      easier: "Lyft höften kortare och vila mellan repetitionerna.",
      note: "Rörelsen ska kännas i sätet, inte som ett tryck i ländryggen."
    },
    sumoknaboj: {
      name: "Sumoknäböj", short: "Sumoknäböj", icon: "◇", category: "Ben",
      detail: "En bredare knäböj som utmanar ben och höfter.",
      steps: ["Ställ fötterna lite bredare än axlarna och vrid tårna lätt utåt.", "Böj knäna i samma riktning som tårna.", "Res dig kontrollerat och behåll en stolt hållning."],
      easier: "Gör en grund rörelse eller använd en stol som stöd.",
      note: "Anpassa fotbredden så att höfter och knän känns bekväma."
    },
    utfall_knalyft: {
      name: "Utfall till knälyft", short: "Utfall till knälyft", icon: "↟", category: "Ben & balans",
      detail: "Kombinera styrka och balans i en och samma rörelse.",
      steps: ["Ta ett lugnt steg bakåt till ett grunt utfall.", "Pressa dig upp och för det bakre knät försiktigt framåt/uppåt.", "Sätt ned foten och växla sida i din egen takt."],
      easier: "Håll i en stol eller hoppa över knälyftet.",
      note: "Välj en stabil och smärtfri rörelse."
    }
  };

  const weeks = [
    { number: 1, reps: 5, secondary: "rygglyft", perSide: false,
      title: "Vi börjar tillsammans", description: "Små steg gör stor skillnad. Vi börjar lugnt och hittar en skön vardagsrutin.", focus: "Hitta vanan" },
    { number: 2, reps: 10, secondary: "knaboj", perSide: false,
      title: "Lite starkare varje dag", description: "Nu växlar vi upp med knäböj. Ta den tid du behöver och fokusera på en trygg rörelse.", focus: "Starka ben" },
    { number: 3, reps: 15, secondary: "ryggpendlingar", perSide: true,
      title: "Bra jobbat, Linda!", description: "Vi bygger vidare med ryggpendlingar och arbetar lugnt med kroppens stabilitet.", focus: "Rygg & balans" },
    { number: 4, reps: 20, secondary: "utfall", perSide: false,
      title: "Du hittar din styrka", description: "Den här veckan provar vi utfall. Håll i en stol om du vill ha extra balans.", focus: "Kontroll" },
    { number: 5, reps: 25, secondary: "sneda_rygglyft", perSide: false,
      title: "Halvvägs!", description: "Det viktigaste är inte hur snabbt du blir klar, utan att du fortsätter dyka upp för dig själv.", focus: "Uthållighet" },
    { number: 6, reps: 30, secondary: "hoftlyft", perSide: false,
      title: "Du är på gång", description: "Höftlyft står på schemat. Dela gärna upp dagens repetitioner i flera små omgångar.", focus: "Säte & styrka" },
    { number: 7, reps: 35, secondary: "rygglyft", perSide: false,
      title: "Teknik före tempo", description: "Lyssna på kroppen och håll en teknik som känns bra. Alla repetitioner räknas.", focus: "Bra teknik" },
    { number: 8, reps: 40, secondary: "sumoknaboj", perSide: false,
      title: "Titta hur långt du kommit", description: "Den här veckan gör vi sumoknäböj. Du får gärna dela upp passet under dagen.", focus: "Benstyrka" },
    { number: 9, reps: 45, secondary: "ryggpendlingar", perSide: false,
      title: "Snart i mål", description: "Vi fokuserar på lugna, stabila ryggpendlingar och hittar kraft i varje repetition.", focus: "Stabilitet" },
    { number: 10, reps: 50, secondary: "utfall_knalyft", perSide: false,
      title: "Sista veckan – du är grym!", description: "Tio veckors fina insatser. Var stolt över varje gång du tog dig tid att röra på dig.", focus: "Målgång" }
  ];

  window.LINDA_PROGRAM = Object.freeze({
    version: 1,
    name: "Lindas Revolt",
    totalDays: weeks.length * 7,
    weeks: weeks,
    exercises: exercises
  });
})();
