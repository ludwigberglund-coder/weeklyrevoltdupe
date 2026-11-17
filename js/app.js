/* Lindas Revolt: helt klientbaserad träningsapp. */
(function () {
  "use strict";

  const P = window.LINDA_PROGRAM;
  const S = window.LINDA_STORAGE;
  const main = document.getElementById("main-view");
  const heading = document.getElementById("page-heading");
  const subtitle = document.getElementById("page-subtitle");
  const dialog = document.getElementById("exercise-dialog");
  const dialogBody = document.getElementById("dialog-body");
  const fileInput = document.getElementById("import-file");
  const toastElement = document.getElementById("toast");
  let toastTimeout;
  const state = {
    data: S.load(),
    tab: "today",
    viewDate: S.today(),
    calendarMonth: S.today().slice(0, 7),
    dialogExercise: null
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function toDate(iso) {
    const a = iso.split("-").map(Number);
    return new Date(Date.UTC(a[0], a[1] - 1, a[2]));
  }
  function toISO(date) { return date.toISOString().slice(0, 10); }
  function addDays(iso, n) { const date = toDate(iso); date.setUTCDate(date.getUTCDate() + n); return toISO(date); }
  function diffDays(a, b) { return Math.round((toDate(a) - toDate(b)) / 86400000); }
  function activeDay() {
    const elapsed = diffDays(S.today(), state.data.startDate);
    return Math.max(0, Math.min(P.totalDays - 1, elapsed));
  }
  function endDate() { return addDays(state.data.startDate, P.totalDays - 1); }
  function maxDate() { return S.today() < endDate() ? S.today() : endDate(); }
  function dayNumber(date) { return diffDays(date, state.data.startDate); }
  function validProgramDay(date) { return S.validDate(date) && dayNumber(date) >= 0 && dayNumber(date) < P.totalDays; }
  function isAvailableDay(date) { return validProgramDay(date) && date <= S.today(); }
  function weekFor(date) {
    return P.weeks[Math.max(0, Math.min(P.weeks.length - 1, Math.floor(dayNumber(date) / 7)))];
  }
  function plannedIds(date) { return ["armhavningar", weekFor(date).secondary]; }
  function dayData(date) { return state.data.days[date] || { done: {}, boost: false, overrides: {} }; }
  function assignedReps(date, id) {
    const item = dayData(date);
    return (item.overrides && item.overrides[id]) || weekFor(date).reps + (item.boost ? 5 : 0);
  }
  function formattedReps(date, id) {
    const count = assignedReps(date, id);
    return count + " st" + (weekFor(date).perSide && id === weekFor(date).secondary ? "/sida" : "");
  }
  function completeCount(date) {
    return plannedIds(date).reduce(function (count, id) { return count + (dayData(date).done[id] === true ? 1 : 0); }, 0);
  }
  function isComplete(date) { return isAvailableDay(date) && completeCount(date) === 2; }
  function formatDate(iso) {
    return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "long" }).format(toDate(iso));
  }
  function formatWeekday(iso) {
    return new Intl.DateTimeFormat("sv-SE", { weekday: "short" }).format(toDate(iso)).replace(".", "");
  }
  function displayWeek(date) {
    return Math.max(1, Math.min(10, Math.floor(dayNumber(date) / 7) + 1));
  }
  function currentStats() {
    let completedDays = 0;
    let partialDays = 0;
    let repetitions = 0;
    const last = Math.min(activeDay(), P.totalDays - 1);
    for (let i = 0; i <= last; i++) {
      const date = addDays(state.data.startDate, i);
      const completed = completeCount(date);
      if (completed === 2) completedDays++;
      if (completed === 1) partialDays++;
      plannedIds(date).forEach(function (id) {
        if (dayData(date).done[id]) {
          repetitions += assignedReps(date, id) * (weekFor(date).perSide && id === weekFor(date).secondary ? 2 : 1);
        }
      });
    }
    let streak = 0;
    let cursor = Math.min(activeDay(), P.totalDays - 1);
    if (!isComplete(addDays(state.data.startDate, cursor))) cursor--;
    while (cursor >= 0 && isComplete(addDays(state.data.startDate, cursor))) {
      streak++; cursor--;
    }
    return { completedDays: completedDays, partialDays: partialDays, repetitions: repetitions, streak: streak };
  }
  function save() {
    const saved = S.save(state.data);
    if (!saved) toast("Kunde inte spara på enheten. Exportera en säkerhetskopia.");
    return saved;
  }
  function toast(message) {
    clearTimeout(toastTimeout);
    toastElement.textContent = message;
    toastElement.classList.add("is-visible");
    toastTimeout = setTimeout(function () { toastElement.classList.remove("is-visible"); }, 3700);
  }
  function warning() {
    return S.isAvailable() ? "" : '<div class="warning-strip" role="alert">Webbläsaren tillåter inte lokal lagring just nu. Dina ändringar kanske försvinner när du stänger sidan. Använd vanlig surfning och kontrollera enhetens lagringsinställningar.</div>';
  }
  function heroArt() {
    // Egen illustration. Inga bilder eller filmer från Weekly Revolt används.
    return '<svg viewBox="0 0 540 273" role="img" aria-label="Illustration av en person som tränar hemma" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="room" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d5b7a5"/><stop offset="1" stop-color="#b89082"/></linearGradient><linearGradient id="mat" x1="0" x2="1"><stop stop-color="#816c69"/><stop offset="1" stop-color="#68565b"/></linearGradient></defs>' +
      '<rect width="540" height="273" fill="url(#room)"/><path d="M0 184h540v89H0z" fill="#bf9e8c"/><path d="M351 0v180M372 0v180M393 0v180" stroke="#e3c9b6" opacity=".32" stroke-width="1.5"/>' +
      '<path d="M23 185V24q0-11 11-11h125q11 0 11 11v161" fill="#d6bda7" stroke="#d8c0ae" stroke-width="6"/><path d="M31 122h132M96 20v164" stroke="#c09e8b" stroke-width="4"/>' +
      '<rect x="429" y="115" width="84" height="8" rx="2" fill="#745b53"/><rect x="438" y="124" width="6" height="63" fill="#745b53"/><rect x="499" y="124" width="6" height="63" fill="#745b53"/>' +
      '<path d="M468 115q-26-21-18-47 21-4 27 21 13-27 29-23 2 36-24 49" fill="#62715d"/><rect x="467" y="105" width="21" height="20" rx="3" fill="#ece1d1"/>' +
      '<rect x="55" y="215" width="408" height="35" rx="18" fill="url(#mat)"/><ellipse cx="272" cy="243" rx="181" ry="8" fill="#866f64" opacity=".23"/>' +
      '<path d="M160 176 109 203 73 209" stroke="#433b40" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M163 176 113 185 62 213" stroke="#4b3f47" stroke-width="15" stroke-linecap="round" fill="none"/>' +
      '<path d="M72 210h-25M84 214H59" stroke="#e5d8ce" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M145 171 245 132 298 142 255 180 163 199z" fill="#d68f9c"/><path d="M157 190 213 165" stroke="#ac6378" stroke-width="5" opacity=".5"/>' +
      '<path d="M282 143 312 190 313 222M251 158 263 199 262 221" stroke="#e0b6a1" stroke-width="19" stroke-linejoin="round" stroke-linecap="round" fill="none"/><path d="M246 224h31M297 224h31" stroke="#574c49" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M278 123q8-14 25-14t25 15" fill="none" stroke="#503d37" stroke-width="20" stroke-linecap="round"/><ellipse cx="306" cy="101" rx="20" ry="24" fill="#e7bda7" transform="rotate(-14 306 101)"/><circle cx="291" cy="83" r="14" fill="#51413d"/><path d="M291 90q15-20 30-10" fill="none" stroke="#51413d" stroke-width="10" stroke-linecap="round"/><circle cx="315" cy="104" r="1.8" fill="#6e4f44"/>' +
      '<path d="M0 0h540v273H0z" fill="#fff3e5" opacity=".035"/></svg>';
  }
  function dayStrip(date) {
    const index = Math.floor(dayNumber(date) / 7);
    const start = addDays(state.data.startDate, index * 7);
    let html = '<div class="day-strip" role="group" aria-label="Välj dag under vecka ' + (index + 1) + '">';
    for (let i = 0; i < 7; i++) {
      const value = addDays(start, i);
      const selected = value === date;
      const done = isComplete(value);
      const enabled = isAvailableDay(value);
      html += '<button class="day-chip' + (selected ? ' is-selected' : '') + (done ? ' is-done' : '') +
        '" type="button" data-action="pick-day" data-date="' + value + '"' +
        (selected ? ' aria-pressed="true"' : ' aria-pressed="false"') +
        (!enabled ? ' disabled' : '') +
        ' aria-label="' + escapeHtml(formatDate(value)) + (done ? ', klar' : '') + '">' +
        '<span class="day-name">' + escapeHtml(formatWeekday(value)) + '</span>' +
        '<span class="day-num">' + toDate(value).getUTCDate() + '</span></button>';
    }
    html += '</div>';
    return html;
  }
  function exerciseRow(date, id) {
    const e = P.exercises[id];
    const done = dayData(date).done[id] === true;
    const available = isAvailableDay(date);
    return '<div class="exercise-row' + (done ? ' is-done' : '') + '">' +
      '<button type="button" class="exercise-row-button" data-action="toggle-exercise" data-exercise="' + id + '"' +
      (available ? '' : ' disabled') + ' aria-pressed="' + done + '" aria-label="' +
      (done ? 'Ta bort klarmarkering: ' : 'Markera klar: ') + escapeHtml(e.name) + '">' +
      '<span class="exercise-thumb"><span class="thumb-icon" aria-hidden="true">' + escapeHtml(e.icon) + '</span></span>' +
      '<span class="exercise-label"><span class="exercise-name">' + escapeHtml(e.short) + '</span>' +
      '<span class="exercise-meta">' + (done ? 'Bra jobbat! ✓' : escapeHtml(e.category)) + '</span></span>' +
      '<span class="exercise-right"><span class="exercise-reps">' + formattedReps(date, id) + '</span>' +
      '<span class="exercise-check" aria-hidden="true">' + (done ? '✓' : '') + '</span></span></button>' +
      '<button type="button" class="info-button" data-action="guide" data-exercise="' + id + '" aria-label="Visa instruktion för ' + escapeHtml(e.name) + '">Så gör du</button>' +
      '</div>';
  }
  function dailyCard(date) {
    const week = weekFor(date);
    const day = dayNumber(date) + 1;
    const done = completeCount(date);
    const record = dayData(date);
    return '<section class="daily-card card" aria-label="Dagens övningar">' +
      '<div class="visual-panel">' + heroArt() + '<span class="visual-topline">STARKARE TILLSAMMANS</span>' +
      '<span class="visual-stamp">EN DAG I TAGET ✳</span></div>' +
      '<div class="daily-content"><div class="daily-intro"><p class="daily-kicker">VECKA ' + week.number + ' · DAG ' + day + ' AV 70</p>' +
      '<h2>' + escapeHtml(week.title) + '</h2><p>' + escapeHtml(week.description) + '</p></div>' +
      '<div class="exercise-list">' + plannedIds(date).map(function (id) { return exerciseRow(date, id); }).join("") + '</div>' +
      (done === 2 ? '<div class="done-banner" role="status">✓ Dagens övningar är klara. Fint jobbat, Linda! 💗</div>' : '') +
      '<p class="check-help">Tryck på en övning för att bocka av den. Du kan dela upp repetitionerna under dagen.</p>' +
      '<div class="daily-actions"><button type="button" class="ghost-button' + (record.boost ? ' is-selected' : '') +
      '" data-action="boost"' + (!isAvailableDay(date) ? ' disabled' : '') + ' aria-pressed="' + !!record.boost +
      '">✦ Boost ' + (record.boost ? 'på' : '+5 repetitioner') + '</button><span class="inline-note">' +
      done + ' av 2 övningar klara</span></div></div></section>';
  }
  function renderToday() {
    const date = state.viewDate;
    const week = weekFor(date);
    const stats = currentStats();
    const completed = diffDays(S.today(), state.data.startDate) >= P.totalDays;
    return '<div class="section-stack">' + warning() +
      (completed ? '<div class="done-banner">🎉 Du har nått slutet av de 10 veckorna! Se tillbaka på allt du har gjort under Framsteg, eller börja en ny omgång under Mer.</div>' : '') +
      '<section class="day-select"><div class="section-header"><h2>Din vecka <span style="color:var(--rose)">✳</span></h2>' +
      '<span class="pill">Vecka ' + week.number + ' av 10</span></div>' +
      dayStrip(date) + '<div class="day-note"><span>' + (date === S.today() ? 'Idag, ' : '') +
      escapeHtml(formatDate(date)) + (date === S.today() ? '' : ' · Dag ' + (dayNumber(date) + 1)) + '</span>' +
      (date === S.today() || !isAvailableDay(S.today()) ? '' : '<button class="text-button" type="button" data-action="jump-today">Till idag</button>') +
      '</div></section>' +
      '<section><div class="section-header"><h2>Dina dagliga</h2><span class="pill pill-rose">' +
      (isComplete(date) ? '✓ Klart!' : '♡ För dig, Linda') + '</span></div>' +
      dailyCard(date) + '</section>' +
      '<section class="week-summary"><div><span class="tiny" style="font-weight:800;letter-spacing:.1em">DIN FINA FRAMGÅNG</span>' +
      '<h3>' + stats.completedDays + ' avklarade dagar</h3><p>Varje liten stund räknas. Fortsätt i din takt!</p></div>' +
      '<span class="flower" aria-hidden="true">✻</span></section>' +
      '<button type="button" class="btn-secondary btn-full" data-tab="program">Se hela 10-veckorsprogrammet →</button></div>';
  }
  function renderProgram() {
    const viewedWeek = displayWeek(state.viewDate);
    let html = '<div class="section-stack">' + warning() + '<div class="week-summary"><div><span class="tiny" style="font-weight:800;letter-spacing:.12em">TIO VECKOR FÖR DIG</span><h3>Från 5 till 50</h3>' +
      '<p>Två enkla övningar varje dag. Vi ökar försiktigt med fem repetitioner per vecka.</p></div><span class="flower" aria-hidden="true">✺</span></div>' +
      '<section><div class="section-header"><h2>Alla veckor</h2><p>10 veckor · 70 dagar</p></div>' +
      '<div class="section-stack" style="gap:10px">';
    P.weeks.forEach(function (week) {
      const start = addDays(state.data.startDate, (week.number - 1) * 7);
      const end = addDays(start, 6);
      const isCurrent = week.number === displayWeek(addDays(state.data.startDate, activeDay()));
      let complete = 0;
      for (let i = 0; i < 7; i++) { if (isComplete(addDays(start, i))) complete++; }
      html += '<details class="disclosure' + (isCurrent ? ' is-current' : '') + (complete === 7 ? ' is-complete' : '') + '"' +
        (week.number === viewedWeek ? ' open' : '') + '><summary><span class="week-number"><small>VECKA</small><strong>' + week.number + '</strong></span>' +
        '<span class="week-summary-meta"><strong>' + escapeHtml(week.focus) + '</strong><span>' + escapeHtml(formatDate(start)) + ' – ' +
        escapeHtml(formatDate(end)) + '</span></span><span class="week-count">' + complete + '/7 ✓</span></summary>' +
        '<div class="week-details"><p>' + escapeHtml(week.description) + '</p>' +
        '<div class="mini-exercises"><span class="mini-exercise">Armhävningar · ' + week.reps + ' st</span>' +
        '<span class="mini-exercise">' + escapeHtml(P.exercises[week.secondary].name) + ' · ' +
        week.reps + ' st' + (week.perSide ? '/sida' : '') + '</span></div>' +
        '<div style="margin-top:17px"><button type="button" class="btn-primary btn-small" data-action="open-week" data-week="' +
        week.number + '"' + (start > S.today() ? ' disabled' : '') + '>Visa dagarna →</button></div></div></details>';
    });
    return html + '</div></section></div>';
  }
  function calendar() {
    const parts = state.calendarMonth.split("-").map(Number);
    const first = new Date(Date.UTC(parts[0], parts[1] - 1, 1));
    const firstDay = (first.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(parts[0], parts[1], 0)).getUTCDate();
    const monthLabel = new Intl.DateTimeFormat("sv-SE", { month: "long", year: "numeric" }).format(first);
    const prevMonth = toISO(new Date(Date.UTC(parts[0], parts[1] - 2, 1))).slice(0, 7);
    const nextMonth = toISO(new Date(Date.UTC(parts[0], parts[1], 1))).slice(0, 7);
    let html = '<section class="calendar-card card"><div class="calendar-head"><h2>' + escapeHtml(monthLabel) +
      '</h2><div class="calendar-arrows"><button class="arrow-btn" type="button" data-action="month" data-month="' + prevMonth +
      '" aria-label="Föregående månad">‹</button><button class="arrow-btn" type="button" data-action="month" data-month="' + nextMonth +
      '"' + (nextMonth > S.today().slice(0, 7) ? ' disabled' : '') + ' aria-label="Nästa månad">›</button></div></div>' +
      '<div class="calendar-weekdays"><span>M</span><span>T</span><span>O</span><span>T</span><span>F</span><span>L</span><span>S</span></div>' +
      '<div class="calendar-grid">';
    for (let blank = 0; blank < firstDay; blank++) html += '<span class="calendar-day is-blank"></span>';
    for (let n = 1; n <= daysInMonth; n++) {
      const date = [parts[0], String(parts[1]).padStart(2, "0"), String(n).padStart(2, "0")].join("-");
      const available = isAvailableDay(date);
      const done = available && isComplete(date);
      const partial = available && !done && completeCount(date) > 0;
      html += '<button type="button" class="calendar-day' + (done ? ' is-done' : '') + (partial ? ' is-partial' : '') +
        (!validProgramDay(date) || date > S.today() ? ' is-outside' : '') + (date === S.today() ? ' is-today' : '') +
        '" data-action="pick-day" data-date="' + date + '"' + (available ? '' : ' disabled') +
        ' aria-label="' + escapeHtml(formatDate(date)) + (done ? ', klar' : partial ? ', påbörjad' : '') + '">' + n + '</button>';
    }
    return html + '</div><div class="calendar-legend"><span><i class="legend-dot"></i>Avklarat</span>' +
      '<span><i class="legend-dot is-partial"></i>Påbörjat</span></div></section>';
  }
  function renderProgress() {
    const stats = currentStats();
    const percent = Math.round((stats.completedDays / P.totalDays) * 100);
    return '<div class="section-stack">' + warning() +
      '<section class="overall-progress card"><div class="progress-ring" style="--pct:' + percent +
      '%"><div><strong>' + percent + '%</strong><small>avklarat</small></div></div>' +
      '<div class="progress-copy-side"><h2>Se vad du åstadkommit</h2><p>' + stats.completedDays +
      ' av 70 dagar avklarade. Du gör det här för dig själv, i din egen takt.</p></div></section>' +
      '<section class="stat-grid">' +
      statCard("✳", String(stats.completedDays), "Avklarade dagar") +
      statCard("♡", String(stats.streak), "Dagar i följd") +
      statCard("↗", stats.repetitions.toLocaleString("sv-SE"), "Totalt gjorda repetitioner") +
      statCard("◒", String(stats.partialDays), "Påbörjade dagar") + '</section>' +
      '<section><div class="section-header"><h2>Din träningskalender</h2></div>' + calendar() + '</section>' +
      '<div class="week-summary"><div><h3>Du gör framsteg 💗</h3><p>Vissa dagar är fulla av energi, andra går långsammare. Båda är okej.</p></div></div></div>';
  }
  function statCard(icon, number, label) {
    return '<div class="stat-card"><div class="stat-emoji" aria-hidden="true">' + icon + '</div><strong>' +
      number + '</strong><span>' + label + '</span></div>';
  }
  function renderSettings() {
    const stats = currentStats();
    return '<div class="section-stack">' + warning() +
      '<section class="settings-card"><h2>Din träningsperiod</h2><p>Du bestämmer själv vilken dag du börjar. Programmet räknar 70 dagar från startdatumet.</p>' +
      '<label for="start-date" class="form-label">Startdatum</label><div class="field-row"><div>' +
      '<input type="date" id="start-date" class="date-input" value="' + state.data.startDate +
      '" max="' + S.today() + '"></div>' +
      '<button type="button" class="btn-primary btn-small" data-action="save-start">Spara</button></div>' +
      '<p style="margin:12px 0 0">Om du ändrar startdatumet börjar du en ny omgång och tidigare avbockningar rensas. Exportera först om du vill spara dem.</p></section>' +
      '<section class="settings-card"><h2>Din säkerhetskopia</h2><p>Allt sparas på just den här enheten. Om du byter telefon eller rensar webbplatsdata kan historiken försvinna. Exportera en säkerhetskopia då och då.</p>' +
      '<div class="settings-actions"><button type="button" class="btn-primary btn-full" data-action="export">↓ Exportera säkerhetskopia</button>' +
      '<button type="button" class="btn-secondary btn-full" data-action="import">↑ Importera säkerhetskopia</button></div></section>' +
      '<section class="settings-card"><h2>Så använder du appen</h2><p>Öppna <strong>Idag</strong> och tryck på varje övning när du är klar. Använd <strong>Så gör du</strong> för tekniktips. Du kan fördela dagens repetitioner över flera tillfällen, eller välja boost när du vill ha en extra utmaning.</p>' +
      '<p>För att lägga till appen på iPhone: öppna den i Safari, tryck på <strong>Dela</strong> och välj <strong>Lägg till på hemskärmen</strong>.</p>' +
      '<p style="margin-bottom:0">Det här är Lindas privata träningsprojekt, inspirerat av ett välkänt upplägg för daglig rörelse. Ingen inloggning, prenumeration eller datainsamling.</p></section>' +
      '<section class="settings-card"><h2>Börja om</h2><p>Vill du köra tio nya veckor från början? Dina nuvarande resultat (' +
      stats.completedDays + ' avklarade dagar) raderas då från enheten.</p>' +
      '<button class="danger-button" type="button" data-action="reset">Nollställ och börja om</button></section>' +
      '<div class="settings-footer">Skapad med omtanke för Linda. <br>Små steg, stor skillnad. ✳</div></div>';
  }
  function render(scrollToTop) {
    if (state.tab === "today" && !isAvailableDay(state.viewDate)) {
      state.viewDate = maxDate();
    }
    const config = {
      today: ["Hej Linda! <span class=\"heading-flower\" aria-hidden=\"true\">✳</span>", "Små steg. Stor skillnad."],
      program: ["Ditt program", "En vecka i taget, i din egen takt."],
      progress: ["Dina framsteg", "Alla små steg blir något stort."],
      settings: ["För dig, Linda", "Här bestämmer du över din träningsstund."]
    };
    heading.innerHTML = config[state.tab][0];
    subtitle.textContent = config[state.tab][1];
    main.innerHTML = ({
      today: renderToday, program: renderProgram, progress: renderProgress, settings: renderSettings
    })[state.tab]();
    document.querySelectorAll("[data-tab]").forEach(function (button) {
      const selected = button.dataset.tab === state.tab;
      button.classList.toggle("is-active", selected);
      if (selected) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    document.title = (state.tab === "today" ? "Idag" : state.tab === "program" ? "Veckor" : state.tab === "progress" ? "Framsteg" : "Mer") + " · Lindas Revolt";
    if (scrollToTop) window.scrollTo({ top: 0, behavior: "instant" });
  }
  function openGuide(id) {
    const e = P.exercises[id];
    if (!e) return;
    state.dialogExercise = id;
    const date = isAvailableDay(state.viewDate) ? state.viewDate : maxDate();
    dialogBody.innerHTML = '<div class="dialog-art" aria-hidden="true">' + escapeHtml(e.icon) + '</div>' +
      '<p class="daily-kicker">' + escapeHtml(e.category.toUpperCase()) + '</p><h2 class="dialog-title">' +
      escapeHtml(e.name) + '</h2><p class="dialog-description">' + escapeHtml(e.detail) + '</p>' +
      '<h3 class="dialog-subtitle">Så gör du</h3><ol class="dialog-steps">' +
      e.steps.map(function (step) { return '<li>' + escapeHtml(step) + '</li>'; }).join("") + '</ol>' +
      '<div class="tip-box"><strong>Enklare variant:</strong> ' + escapeHtml(e.easier) + '</div>' +
      '<div class="tip-box"><strong>Kom ihåg:</strong> ' + escapeHtml(e.note) + '</div>' +
      '<form id="reps-form" class="dialog-form">' +
      '<div><label for="reps-number" class="form-label">Repetitioner för den här dagen</label>' +
      '<input id="reps-number" class="number-input" type="number" inputmode="numeric" min="1" max="500" step="1" value="' +
      assignedReps(date, id) + '" required></div>' +
      '<button type="submit" class="btn-primary btn-small">Spara</button></form>';
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }
  function closeGuide() {
    if (dialog.open && typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    state.dialogExercise = null;
  }
  function editDay(action, id) {
    const date = state.viewDate;
    if (!isAvailableDay(date)) return;
    if (!state.data.days[date]) state.data.days[date] = { done: {}, boost: false, overrides: {} };
    const item = state.data.days[date];
    if (action === "toggle") item.done[id] = item.done[id] !== true;
    if (action === "boost") item.boost = !item.boost;
    save();
    render(false);
    if (action === "toggle" && isComplete(date)) toast("Så fint jobbat, Linda! Dagen är klar 💗");
  }
  function switchTab(tab) {
    if (!["today", "program", "progress", "settings"].includes(tab)) return;
    state.tab = tab;
    render(true);
  }
  function jumpTo(date) {
    if (!isAvailableDay(date)) return;
    state.viewDate = date;
    state.calendarMonth = date.slice(0, 7);
    switchTab("today");
  }
  function setMonth(value) {
    if (!/^\d{4}-\d{2}$/.test(value)) return;
    const earliest = state.data.startDate.slice(0, 7);
    const latest = S.today().slice(0, 7);
    if (value >= earliest && value <= latest) { state.calendarMonth = value; render(false); }
  }
  function exportData() {
    const payload = { app: "lindas-revolt", exportedAt: new Date().toISOString(), data: state.data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lindas-revolt-sakerhetskopia-" + S.today() + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("Säkerhetskopian är redo att sparas.");
  }
  async function importData(file) {
    if (!file) return;
    if (file.size > 256 * 1024) { toast("Filen är för stor för en säkerhetskopia."); return; }
    try {
      const imported = S.validateImport(JSON.parse(await file.text()));
      if (!window.confirm("Vill du ersätta Lindas nuvarande träningshistorik med innehållet i säkerhetskopian?")) return;
      state.data = imported;
      state.viewDate = maxDate();
      state.calendarMonth = state.viewDate.slice(0, 7);
      save();
      switchTab("today");
      toast("Säkerhetskopian har importerats.");
    } catch (error) { toast(error && error.message ? error.message : "Kunde inte läsa filen."); }
    finally { fileInput.value = ""; }
  }
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: "Lindas Revolt", url: location.href });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(location.href); toast("Länken har kopierats."); }
      else toast("Kopiera länken från webbläsarens adressfält.");
    } catch (error) { if (error.name !== "AbortError") toast("Kunde inte dela länken."); }
  }
  document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action], [data-tab]");
    if (!button || button.disabled) return;
    if (button.dataset.tab) { switchTab(button.dataset.tab); return; }
    const action = button.dataset.action;
    if (action === "home") { jumpTo(maxDate()); return; }
    if (action === "share") { share(); return; }
    if (action === "guide") { openGuide(button.dataset.exercise); return; }
    if (action === "close-dialog") { closeGuide(); return; }
    if (action === "toggle-exercise" && plannedIds(state.viewDate).includes(button.dataset.exercise)) {
      editDay("toggle", button.dataset.exercise); return;
    }
    if (action === "boost") { editDay("boost"); return; }
    if (action === "pick-day") { jumpTo(button.dataset.date); return; }
    if (action === "jump-today") { jumpTo(maxDate()); return; }
    if (action === "open-week") {
      const number = Number(button.dataset.week);
      if (Number.isInteger(number) && number >= 1 && number <= 10)
        jumpTo(addDays(state.data.startDate, (number - 1) * 7));
      return;
    }
    if (action === "month") { setMonth(button.dataset.month); return; }
    if (action === "export") { exportData(); return; }
    if (action === "import") { fileInput.click(); return; }
    if (action === "save-start") {
      const el = document.getElementById("start-date");
      const proposed = el && el.value;
      if (!S.validDate(proposed) || proposed > S.today()) { toast("Välj ett giltigt datum, senast idag."); return; }
      if (proposed === state.data.startDate) { toast("Startdatumet är redan sparat."); return; }
      if (!window.confirm("Byta startdatum och ta bort alla tidigare avbockningar? Exportera först om du vill spara dem.")) return;
      state.data = { schema: 1, startDate: proposed, days: {} };
      state.viewDate = maxDate();
      state.calendarMonth = state.viewDate.slice(0, 7);
      save();
      switchTab("today");
      toast("En ny träningsperiod har startat!");
      return;
    }
    if (action === "reset") {
      if (!window.confirm("Vill du verkligen börja om? Alla sparade träningsdagar tas bort från den här enheten.")) return;
      state.data = S.blank();
      state.viewDate = S.today();
      state.calendarMonth = state.viewDate.slice(0, 7);
      save();
      switchTab("today");
      toast("Nu börjar din nya träningsresa! 💗");
    }
  });
  document.getElementById("reps-form"); // Formuläret skapas vid behov i dialogen.
  dialog.addEventListener("submit", function (event) {
    if (event.target.id !== "reps-form") return;
    event.preventDefault();
    const id = state.dialogExercise;
    if (!id || !isAvailableDay(state.viewDate)) return;
    const number = S.clampReps(dialog.querySelector("#reps-number").value);
    if (number === null) { toast("Ange 1–500 repetitioner."); return; }
    const date = state.viewDate;
    if (!state.data.days[date]) state.data.days[date] = { done: {}, boost: false, overrides: {} };
    state.data.days[date].overrides[id] = number;
    save();
    closeGuide();
    render(false);
    toast("Antalet repetitioner är sparat.");
  });
  dialog.addEventListener("click", function (event) { if (event.target === dialog) closeGuide(); });
  fileInput.addEventListener("change", function () { importData(fileInput.files && fileInput.files[0]); });

  // Visar appen direkt även utan service worker.
  render(false);
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () { /* Offline-läge är frivilligt. */ });
    });
  }
})();
