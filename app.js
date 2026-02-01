/* ===============================
   QUANTUM TALK ULTRA – APP.JS
   Frontend-only Intelligence Core
   =============================== */

/* ---------- GLOBAL STATE ---------- */
let QT = {
  rooms: {},
  currentRoom: null,
  currentUser: null,
  avatarType: "emoji", // emoji | image
};

/* ---------- STORAGE ---------- */
function loadRooms() {
  QT.rooms = JSON.parse(localStorage.getItem("QT_ROOMS") || "{}");
}

function saveRooms() {
  localStorage.setItem("QT_ROOMS", JSON.stringify(QT.rooms));
}

/* ---------- DOM SHORTCUT ---------- */
const $ = id => document.getElementById(id);

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadRooms();
  $("joinBtn").onclick = joinRoom;
});

/* ---------- JOIN / CREATE ROOM ---------- */
function joinRoom() {
  const username = $("username").value.trim();
  const avatarEmoji = $("avatar").value.trim() || "🙂";
  const room = $("room").value.trim();
  const pass = $("roomPass").value;
  const avatarFile = $("avatarFile").files[0];

  if (!username || !room) {
    alert("Username and Room ID required");
    return;
  }

  if (!QT.rooms[room]) {
    QT.rooms[room] = {
      password: pass || "",
      users: {},
      chat: [],
      created: Date.now()
    };
  } else if (QT.rooms[room].password !== pass) {
    alert("Wrong room password");
    return;
  }

  if (!QT.rooms[room].users[username]) {
    QT.rooms[room].users[username] = {
      name: username,
      avatar: avatarEmoji,
      avatarImg: null,
      diamonds: 500,
      joined: Date.now(),
      lastReward: 0
    };
  }

  QT.currentRoom = room;
  QT.currentUser = username;

  if (avatarFile) {
    const reader = new FileReader();
    reader.onload = () => {
      QT.rooms[room].users[username].avatarImg = reader.result;
      QT.avatarType = "image";
      saveRooms();
      enterApp();
    };
    reader.readAsDataURL(avatarFile);
  } else {
    QT.avatarType = "emoji";
    saveRooms();
    enterApp();
  }
}

/* ---------- ENTER APP ---------- */
function enterApp() {
  $("login").classList.add("hidden");
  $("app").classList.remove("hidden");

  $("roomNameDisplay").textContent = QT.currentRoom;
  updateProfile();
  renderUsers();
  renderChat();

  setInterval(syncUI, 1000);
}

/* ---------- PROFILE ---------- */
function updateProfile() {
  const user = QT.rooms[QT.currentRoom].users[QT.currentUser];

  $("userDisplay").textContent = user.name;
  $("userDiamonds").textContent = user.diamonds;
  $("profileName").textContent = user.name;
  $("profileDiamonds").textContent = user.diamonds;

  if (user.avatarImg) {
    $("userAvatar").style.backgroundImage = `url(${user.avatarImg})`;
    $("userAvatar").style.backgroundSize = "cover";
    $("userAvatar").textContent = "";
  } else {
    $("userAvatar").textContent = user.avatar;
  }
}

/* ---------- USERS ---------- */
function renderUsers() {
  const box = $("usersUL");
  box.innerHTML = "";

  const users = QT.rooms[QT.currentRoom].users;

  Object.values(users).forEach(u => {
    const div = document.createElement("div");
    div.className = "user";

    const left = document.createElement("div");
    left.textContent = `${u.avatar || "🙂"} ${u.name}`;

    const right = document.createElement("div");
    right.textContent = `💎 ${u.diamonds}`;

    div.appendChild(left);
    div.appendChild(right);

    div.onclick = () => {
      if (u.name === QT.currentUser) return;
      sendDiamonds(u.name);
    };

    box.appendChild(div);
  });
}

/* ---------- CHAT ---------- */
function sendMessage() {
  const input = $("chatInput");
  const msg = input.value.trim();
  if (!msg) return;

  QT.rooms[QT.currentRoom].chat.push({
    user: QT.currentUser,
    text: msg,
    time: Date.now()
  });

  input.value = "";
  saveRooms();
  renderChat();
}

function renderChat() {
  const box = $("chatBox");
  box.innerHTML = "";

  QT.rooms[QT.currentRoom].chat.forEach(m => {
    const div = document.createElement("div");
    div.className = "msg" + (m.user === QT.currentUser ? " me" : "");
    div.textContent = `${m.user}: ${m.text}`;
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

/* ---------- DIAMONDS ---------- */
function sendDiamonds(target) {
  const amount = parseInt(prompt("Send diamonds to " + target));
  if (!amount || amount <= 0) return;

  const room = QT.rooms[QT.currentRoom];
  const me = room.users[QT.currentUser];

  if (me.diamonds < amount) {
    alert("Not enough diamonds");
    return;
  }

  me.diamonds -= amount;
  room.users[target].diamonds += amount;

  room.chat.push({
    user: "SYSTEM",
    text: `${QT.currentUser} sent 💎 ${amount} to ${target}`,
    time: Date.now()
  });

  saveRooms();
  syncUI();
}

/* ---------- GIFTS ---------- */
function sendGift(gift, cost) {
  const room = QT.rooms[QT.currentRoom];
  const me = room.users[QT.currentUser];

  if (me.diamonds < cost) {
    alert("Not enough diamonds");
    return;
  }

  me.diamonds -= cost;

  room.chat.push({
    user: "🎁 GIFT",
    text: `${QT.currentUser} sent ${gift}`,
    time: Date.now()
  });

  saveRooms();
  syncUI();
}

/* ---------- REWARDS ---------- */
function rewardMe() {
  const user = QT.rooms[QT.currentRoom].users[QT.currentUser];
  const now = Date.now();

  if (now - user.lastReward < 24 * 60 * 60 * 1000) {
    alert("Reward already claimed today");
    return;
  }

  const reward = Math.floor(Math.random() * 100) + 50;
  user.diamonds += reward;
  user.lastReward = now;

  QT.rooms[QT.currentRoom].chat.push({
    user: "SYSTEM",
    text: `${QT.currentUser} received daily reward 💎 ${reward}`,
    time: now
  });

  saveRooms();
  syncUI();
}

/* ---------- CLEAR CHAT (ADMIN) ---------- */
function clearChat() {
  if (!confirm("Clear chat for everyone?")) return;
  QT.rooms[QT.currentRoom].chat = [];
  saveRooms();
  renderChat();
}

/* ---------- SYNC ---------- */
function syncUI() {
  saveRooms();
  updateProfile();
  renderUsers();
  renderChat();
}

/* ---------- EXIT ---------- */
function leaveRoom() {
  saveRooms();
  location.reload();
}
