// LOAD PROFILE
let profile = JSON.parse(localStorage.getItem("profile")) || {
  name: "",
  diamonds: 500,
  avatar: "https://i.imgur.com/OV8F8Yk.png"
};

let micSeats = {};
let chatHistory = JSON.parse(localStorage.getItem("chat")) || [];

// LOGIN
function login() {
  const name = document.getElementById("usernameInput").value.trim();
  if (!name) return alert("Enter name");

  profile.name = name;
  saveProfile();

  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("mainUI").classList.remove("hidden");

  renderProfile();
  renderChat();
}

// SAVE
function saveProfile() {
  localStorage.setItem("profile", JSON.stringify(profile));
}

// PROFILE UI
function renderProfile() {
  document.getElementById("usernameText").innerText = profile.name;
  document.getElementById("diamondText").innerText = profile.diamonds;
  document.getElementById("avatarImg").src = profile.avatar;
}

// ROOM
function createRoom() {
  const code = document.getElementById("roomCode").value;
  if (!code) return alert("Enter room code");
  alert("Joined room: " + code);
}

// MIC
function takeMic(n) {
  if (micSeats[n]) return alert("Mic taken");
  micSeats[n] = profile.name;
  alert("You took mic " + n);
}

// CHAT
function sendMessage() {
  const msg = document.getElementById("chatInput").value;
  if (!msg) return;

  chatHistory.push(profile.name + ": " + msg);
  localStorage.setItem("chat", JSON.stringify(chatHistory));
  document.getElementById("chatInput").value = "";
  renderChat();
}

function renderChat() {
  const box = document.getElementById("chatBox");
  box.innerHTML = "";
  chatHistory.forEach(m => {
    const div = document.createElement("div");
    div.innerText = m;
    box.appendChild(div);
  });
}

// GIFTS
function sendGift(gift, cost) {
  if (profile.diamonds < cost) return alert("Not enough diamonds");
  profile.diamonds -= cost;
  saveProfile();
  renderProfile();
  alert("Gift sent " + gift);
}
