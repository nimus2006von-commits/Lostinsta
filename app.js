const STORAGE_KEY = "direkt-people-v1";
const USAGE_KEY = "direkt-usage-v1";

const USERNAME_RE = /^[A-Za-z0-9._]{1,30}$/;

let people = [];

function loadPeople() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    people = raw ? JSON.parse(raw) : [];
  } catch {
    people = [];
  }
  if (!Array.isArray(people)) people = [];
  people = people.filter(
    (p) => p && typeof p.name === "string" && typeof p.username === "string"
  );
}

function savePeople() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
}

function loadUsage() {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    const usage = raw ? JSON.parse(raw) : {};
    if (usage.date !== todayString()) {
      return { date: todayString(), opens: 0 };
    }
    return { opens: Number(usage.opens) || 0, date: usage.date };
  } catch {
    return { date: todayString(), opens: 0 };
  }
}

function saveUsage(usage) {
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function cleanUsername(value) {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

const listEl = document.getElementById("people-list");
const emptyEl = document.getElementById("empty-state");
const statTodayEl = document.getElementById("stat-today");
const statPeopleEl = document.getElementById("stat-people");
const form = document.getElementById("add-form");
const inputName = document.getElementById("input-name");
const inputUsername = document.getElementById("input-username");

function render() {
  listEl.innerHTML = "";

  for (const person of people) {
    const item = document.createElement("li");
    item.className = "person";

    const info = document.createElement("div");
    info.className = "person-info";

    const name = document.createElement("div");
    name.className = "person-name";
    name.textContent = person.name;

    const username = document.createElement("div");
    username.className = "person-username";
    username.textContent = "@" + person.username;

    info.append(name, username);

    const buttons = document.createElement("div");
    buttons.className = "person-buttons";

    const storyBtn = document.createElement("button");
    storyBtn.type = "button";
    storyBtn.className = "btn btn-story";
    storyBtn.textContent = "Story";
    storyBtn.addEventListener("click", () => {
      openUrl(`https://instagram.com/stories/${person.username}/`);
    });

    const messageBtn = document.createElement("button");
    messageBtn.type = "button";
    messageBtn.className = "btn btn-message";
    messageBtn.textContent = "Sporočilo";
    messageBtn.addEventListener("click", () => {
      openUrl(`https://ig.me/m/${person.username}`);
    });

    buttons.append(storyBtn, messageBtn);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-remove";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", `Odstrani ${person.name}`);
    removeBtn.addEventListener("click", () => {
      people = people.filter((p) => p !== person);
      savePeople();
      render();
    });

    item.append(info, buttons, removeBtn);
    listEl.appendChild(item);
  }

  emptyEl.hidden = people.length > 0;

  const usage = loadUsage();
  statTodayEl.textContent = usage.opens;
  statPeopleEl.textContent = people.length;
}

function openUrl(url) {
  const usage = loadUsage();
  usage.opens += 1;
  saveUsage(usage);
  statTodayEl.textContent = usage.opens;
  window.open(url, "_blank", "noopener");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = inputName.value.trim();
  const username = cleanUsername(inputUsername.value);

  if (!name || !USERNAME_RE.test(username)) {
    alert("Uporabniško ime naj vsebuje samo črke, številke, piko in podčrtaj.");
    return;
  }
  if (people.some((p) => p.username === username)) {
    alert("Ta oseba je že na seznamu.");
    return;
  }

  people.push({ name, username });
  savePeople();
  render();

  inputName.value = "";
  inputUsername.value = "";
  inputName.focus();
});

document.getElementById("btn-export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(people, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "direkt-ljudje.json";
  link.click();
  URL.revokeObjectURL(url);
});

document.getElementById("btn-import").addEventListener("click", () => {
  document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("invalid");
      let added = 0;
      for (const entry of imported) {
        const name = String(entry.name || "").trim().slice(0, 40);
        const username = cleanUsername(String(entry.username || ""));
        if (!name || !USERNAME_RE.test(username)) continue;
        if (people.some((p) => p.username === username)) continue;
        people.push({ name, username });
        added += 1;
      }
      savePeople();
      render();
      alert(`Uvoženih: ${added}`);
    } catch {
      alert("Datoteke ni bilo mogoče prebrati.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
});

loadPeople();
render();
