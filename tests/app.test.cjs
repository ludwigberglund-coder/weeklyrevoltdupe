// Tests without dependencies. Run: node --test tests/app.test.cjs
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function environment(withApp) {
  const saved = new Map();
  const events = {};
  const nodes = {};
  function node() {
    return {
      innerHTML: "", textContent: "", value: "",
      dataset: {}, disabled: false, open: false, files: [],
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(type, callback) { this["_on" + type] = callback; },
      setAttribute() {}, removeAttribute() {}, querySelector() { return null; }
    };
  }
  ["main-view", "page-heading", "page-subtitle", "exercise-dialog", "dialog-body", "import-file", "toast"].forEach(function (id) {
    nodes[id] = node();
  });
  const document = {
    title: "",
    getElementById(id) { return nodes[id] || null; },
    querySelectorAll() { return []; },
    addEventListener(type, callback) { events[type] = callback; }
  };
  const localStorage = {
    getItem(key) { return saved.has(key) ? saved.get(key) : null; },
    setItem(key, value) { saved.set(key, String(value)); }
  };
  const window = { scrollTo() {}, addEventListener() {}, confirm() { return true; } };
  const context = vm.createContext({
    window, document, localStorage, navigator: {}, location: { protocol: "http:", hostname: "test" },
    Date, Intl, structuredClone, setTimeout, clearTimeout, console
  });
  for (const file of ["js/program.js", "js/storage.js"].concat(withApp ? ["js/app.js"] : [])) {
    vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  }
  return { window, document, nodes, saved, events };
}

test("10 weeks rise from 5 to 50 reps", function () {
  const { window } = environment(false);
  const weeks = window.LINDA_PROGRAM.weeks;
  assert.equal(window.LINDA_PROGRAM.totalDays, 70);
  assert.equal(weeks.length, 10);
  assert.deepEqual(Array.from(weeks, w => w.reps), [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
  for (const week of weeks) assert.ok(window.LINDA_PROGRAM.exercises[week.secondary]);
  assert.equal(weeks[0].secondary, "rygglyft");
});

test("local records persist and can be restored from a backup", function () {
  const { window } = environment(false);
  const storage = window.LINDA_STORAGE;
  let record = storage.load();
  const today = storage.today();
  assert.equal(record.startDate, today);
  record.days[today] = { done: { armhavningar: true }, boost: false, overrides: {} };
  assert.equal(storage.save(record), true);
  assert.equal(storage.load().days[today].done.armhavningar, true);
  const restored = storage.validateImport({ app: "lindas-revolt", data: storage.load() });
  assert.equal(restored.days[today].done.armhavningar, true);
  assert.throws(() => storage.validateImport({ app: "different-app", data: record }));
  assert.equal(storage.clampReps(0), null);
  assert.equal(storage.clampReps(501), null);
  assert.equal(storage.clampReps(12), 12);
});

test("renders the daily checklist and checks exercises off", function () {
  const { nodes, events, window } = environment(true);
  const html = () => nodes["main-view"].innerHTML;
  assert.match(html(), /Hej|Dina dagliga|Armhävningar/);
  assert.match(html(), /Rygglyft/);
  assert.match(html(), /5 st/);
  function click(dataset) {
    const button = { dataset, disabled: false };
    events.click({ target: { closest() { return button; } } });
  }
  click({ action: "toggle-exercise", exercise: "armhavningar" });
  assert.equal(window.LINDA_STORAGE.load().days[window.LINDA_STORAGE.today()].done.armhavningar, true);
  assert.match(html(), /1 av 2 övningar klara/);
  click({ action: "toggle-exercise", exercise: "rygglyft" });
  assert.equal(window.LINDA_STORAGE.load().days[window.LINDA_STORAGE.today()].done.rygglyft, true);
  assert.match(html(), /Dagens övningar är klara/);
  click({ tab: "progress" });
  assert.match(html(), /Din träningskalender/);
  click({ tab: "program" });
  assert.match(html(), /Alla veckor/);
  assert.match(html(), /Vecka|VECKA/);
  click({ tab: "settings" });
  assert.match(html(), /Exportera säkerhetskopia/);
});
