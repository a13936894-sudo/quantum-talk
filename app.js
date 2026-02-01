let roomName, username, avatar;
let roomData = {};
let userData = {};

function loadData() {
  roomData = JSON.parse(localStorage.getItem("QT_ROOMS") || "{}");
}

function saveData() {
  localStorage.setItem("QT_ROOMS", JSON.stringify(roomData));
}

function joinRoom() {
  username = document.getElementById("username").value.trim();
  avatar = document.getElementById("avatar").value.trim() || "🙂";
  roomName = document.getElementById("room").value.trim();
  const pass = document.getElementById("roomPass").value;

  if (!username || !roomName) {
    alert("Username & Room required");
    return;
  }

  loadData();

  if (!roomData[roomName]) {
    roomData[roomName] = {
      password: pass,
      users: {},
      chat: []
    };
  } else if (roomData[roomName].password !== pass) {
    alert("Wrong room password");
    return;
  }

  if (!roomData[roomName].users[username]) {
    roomData[roomName].users[username] = {
      avatar,
      diamonds: 100
    };
  }

  userData = roomData[roomName].users[username];
  saveData();
  showApp();
}

function showApp() {
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("roomNameDisplay").textContent = roomName;
  document.getElementById("userDisplay").textContent = username;
  document.getElementById("userAvatar").textContent = avatar;
  renderUsers();
  renderChat();
  renderDiamonds();
}

function leaveRoom() {
  saveData();
  location.reload();
}

function renderUsers() {
  const ul = document.getElementById("usersUL");
  ul.innerHTML = "";

  const users = roomData[roomName].users;
  for (let u in users) {
    const li = document.createElement("li");
    li.textContent = `${users[u].avatar} ${u} | 💎 ${users[u].diamonds}`;
    li.onclick = () => sendDiamonds(u);
    ul.appendChild(li);
  }
}

function sendDiamonds(target) {
  if (target === username) return;
  const amt = parseInt(prompt("Send diamonds?"));
  if (!amt || amt <= 0 || userData.diamonds < amt) return;

  userData.diamonds -= amt;
  roomData[roomName].users[target].diamonds += amt;
  saveData();
  renderUsers();
  renderDiamonds();
}

function renderDiamonds() {
  document.getElementById("userDiamonds").textContent = userData.diamonds;
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;

  roomData[roomName].chat.push(`${avatar} ${username}: ${msg}`);
  saveData();
  input.value = "";
  renderChat();
}

function renderChat() {
  const box = document.getElementById("chatBox");
  box.innerHTML = "";
  roomData[roomName].chat.forEach(m => {
    const p = document.createElement("p");
    p.textContent = m;
    box.appendChild(p);
  });
  box.scrollTop = box.scrollHeight;
}

function sendGift(gift, cost) {
  if (userData.diamonds < cost) {
    alert("Not enough diamonds");
    return;
  }
  userData.diamonds -= cost;
  roomData[roomName].chat.push(
    `${avatar} ${username} sent ${gift}`
  );
  saveData();
  renderChat();
  renderDiamonds();
}
