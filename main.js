const API_KEY = "0381831b-3ca1-4640-9972-60724bd35677";
const form = document.getElementById("form");

let profiles = [];
let currentIndex = 0;
let currentUUID = "";

const cute_name_icons = {
  Apple: "🍎",
  Banana: "🍌",
  Blueberry: "🫐",
  Coconut: "🥥",
  Cucumber: "🥒",
  Grapes: "🍇",
  Kiwi: "🥝",
  Lemon: "🍋",
  Lime: "🟢",
  Mango: "🥭",
  Orange: "🍊",
  Papaya: "🍈",
  Peach: "🍑",
  Pear: "🍐",
  Pineapple: "🍍",
  Pomegranate: "🫐",
  Raspberry: "🍓",
  Strawberry: "🍓",
  Tomato: "🍅",
  Watermelon: "🍉",
  Zucchini: "🥒"
};

const forgeTimes = {
    PERFECT_AMBER_GEM: 12 * 60 * 60 * 1000
}

const forgeNames = {
    PERFECT_AMBER_GEM: 'Perfect Amber'
}

const forgeIcons = {
    PERFECT_AMBER_GEM: '🔶'
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    main(document.getElementById("username").value.trim());
});

async function main(username) {
    const uuid = await getUUID(username);

    if (!uuid) {
        console.log("Invalid username");
        return;
    }

    await grabStats(uuid);
}

async function getUUID(username) {
    const res = await fetch(`https://api.ashcon.app/mojang/v2/user/${username}`);
    const data = await res.json();

    if (!data.uuid) return null;

    return data.uuid.replaceAll("-", "");
}

function shortenNumber(num) {
    num = Math.trunc(num);

    const digits = num.toString().length;
    let unit = "";

    if (digits >= 10) {
        unit = "b";
        num = Math.round(num / 1e8) / 10;
    } else if (digits >= 7) {
        unit = "m";
        num = Math.round(num / 1e5) / 10;
    } else if (digits >= 4) {
        unit = "k";
        num = Math.round(num / 1e2) / 10;
    }

    return (num + unit)

}

async function grabStats(uuid) {
    const url = `https://api.hypixel.net/v2/skyblock/profiles?key=${API_KEY}&uuid=${uuid}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.success || !data.profiles.length) {
        console.log("API error:", data.cause);
        return;
    }

    profiles = data.profiles;
    currentUUID = uuid;

    currentIndex = profiles.findIndex(p => p.selected === true);
    showProfile();
}

function getForge(prefix) {
  const forge = prefix.forge?.forge_processes?.forge_1;
  if (!forge) return "No forge data";

  let html = "<br><br>";
  const now = Date.now();

  for (const item in forge) {
    const process = forge[item];

    if (!forgeTimes[process.id]) {
      html += `<div id="forge">Slot ${process.slot}: Unknown (${forgeNames[process.id]})</div>`;
      continue;
    }

    const remaining = (process.startTime + forgeTimes[process.id]) - now;

    if (remaining <= 0) {
      html += `<div id="forge">Slot ${process.slot}: ${forgeNames[process.id]} ${forgeIcons[process.id]} ✅ </div>`;
    } else {
      const minutes = Math.ceil(remaining / 60000);
      html += `<div id="forge">Slot ${process.slot}: ${forgeNames[process.id]} ⏳ ${minutes} minutes left </div>`;
    }
  }
  return html;
}

function showProfile() {
    const profile = profiles[currentIndex];
    const prefix = profile.members?.[currentUUID];
    document.getElementById("profile_id").innerHTML = profile.cute_name + cute_name_icons[profile.cute_name]
    document.getElementById("highest_dmg").innerHTML = shortenNumber(prefix.player_stats.highest_critical_damage);
    document.getElementById("mithril_powder_available").innerHTML = shortenNumber(prefix.mining_core.powder_mithril_total)
    document.getElementById("total_mithril_powder").innerHTML = shortenNumber((prefix.mining_core.powder_spent_mithril) + (prefix.mining_core.powder_mithril_total))
    document.getElementById("gemstone_powder_available").innerHTML = shortenNumber(prefix.mining_core.powder_gemstone_total)
    document.getElementById("total_gemstone_powder").innerHTML = shortenNumber((prefix.mining_core.powder_spent_gemstone) + (prefix.mining_core.powder_gemstone_total));
    document.getElementById("forge_status").innerHTML = getForge(prefix);
}

document.getElementById("next").addEventListener("click", () => {
    if (!profiles.length) return;
    currentIndex = (currentIndex + 1) % profiles.length;
    showProfile();
});

document.getElementById("prev").addEventListener("click", () => {
    if (!profiles.length) return;
    currentIndex = (currentIndex - 1 + profiles.length) % profiles.length;
    showProfile();
});