/* Lokal lagring. Ingen inloggning, spårning eller server. */
(function () {
  "use strict";
  const KEY = "lindas-revolt-data-v1";
  let memoryCopy = null;
  let storageAvailable = true;

  function today() {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  }
  function validDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + "T12:00:00");
    return !Number.isNaN(date.getTime()) && date.getFullYear() === +value.slice(0, 4) &&
      date.getMonth() + 1 === +value.slice(5, 7) && date.getDate() === +value.slice(8, 10);
  }
  function clampReps(value) {
    const n = Number(value);
    return Number.isInteger(n) && n >= 1 && n <= 500 ? n : null;
  }
  function clean(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw) || raw.schema !== 1 ||
        !validDate(raw.startDate)) throw new Error("Filen har inte rätt format.");
    if (raw.startDate > today()) throw new Error("Startdatum kan inte ligga i framtiden.");
    const days = {};
    const input = raw.days && typeof raw.days === "object" && !Array.isArray(raw.days) ? raw.days : {};
    Object.keys(input).slice(0, 200).forEach(function (date) {
      if (!validDate(date) || date < raw.startDate || date > today()) return;
      const item = input[date];
      if (!item || typeof item !== "object") return;
      const done = {};
      if (item.done && typeof item.done === "object") {
        Object.keys(item.done).slice(0, 10).forEach(function (id) {
          if (Object.prototype.hasOwnProperty.call(window.LINDA_PROGRAM.exercises, id) &&
              item.done[id] === true) done[id] = true;
        });
      }
      const overrides = {};
      if (item.overrides && typeof item.overrides === "object") {
        Object.keys(item.overrides).slice(0, 10).forEach(function (id) {
          const number = clampReps(item.overrides[id]);
          if (Object.prototype.hasOwnProperty.call(window.LINDA_PROGRAM.exercises, id) && number !== null) overrides[id] = number;
        });
      }
      days[date] = { done: done, boost: item.boost === true, overrides: overrides };
    });
    return { schema: 1, startDate: raw.startDate, days: days };
  }
  function blank() { return { schema: 1, startDate: today(), days: {} }; }
  function load() {
    try {
      const previous = localStorage.getItem(KEY);
      if (previous) {
        memoryCopy = clean(JSON.parse(previous));
        return structuredClone(memoryCopy);
      }
      memoryCopy = blank();
      localStorage.setItem(KEY, JSON.stringify(memoryCopy));
      return structuredClone(memoryCopy);
    } catch (error) {
      // Keep the app usable in private modes; tell the user data cannot persist.
      if (error && (error.name === "QuotaExceededError" || error.name === "SecurityError")) storageAvailable = false;
      memoryCopy = memoryCopy || blank();
      return structuredClone(memoryCopy);
    }
  }
  function save(record) {
    memoryCopy = clean(record);
    try {
      localStorage.setItem(KEY, JSON.stringify(memoryCopy));
      storageAvailable = true;
      return true;
    } catch (_) {
      storageAvailable = false;
      return false;
    }
  }
  function validateImport(record) {
    if (!record || record.app !== "lindas-revolt" || !record.data) throw new Error("Det är inte en säkerhetskopia från Lindas Revolt.");
    return clean(record.data);
  }
  window.LINDA_STORAGE = {
    today: today, validDate: validDate, clampReps: clampReps, load: load, save: save, blank: blank,
    validateImport: validateImport, isAvailable: function () { return storageAvailable; }
  };
})();
