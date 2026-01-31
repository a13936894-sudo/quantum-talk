const APP_ID = "c020045940234e0a9c462cce2193fa99";

let client, localTrack, roomName, username, avatar;
let userData = { diamonds: 1000 };
let roomData = {};

function log(msg) { document.getElementById("log").innerHTML += `<p>${msg}</p>`; }
function saveRoomData() { localStorage.setItem("QuantumTalkRooms", JSON.stringify(roomData)); }
function loadRoomData() { roomData = JSON.parse(localStorage.getItem("QuantumTalkRooms") || "{}"); }

function joinRoom() {
  username = document.getElementById("username").value.trim();
  avatar = document.getElementById("avatar").value.trim() || "🙂";
  roomName = document.getElementById("room").value.trim();
  const roomPass = document.getElementById("roomPass").value;
  if (!username || !roomName) return alert("Username and Room Code required");
  loadRoomData();
  if (!roomData[roomName]) roomData[roomName] = { password: roomPass || "", users: {}, chat: [] };
  else if (roomData[roomName].password && roomData[roomName].password !== roomPass) return alert("Incorrect room password!");
  if (!roomData[roomName].users[username]) roomData[roomName].users[username] = { avatar, diamonds: 1000 };
  userData = roomData[roomName].users[username];
  saveRoomData();
  initAgora(); showUI(); renderUsers(); renderChat(); renderDiamonds();
}

async function initAgora() {
  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  await client.join(APP_ID, roomName, null, null);
  localTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish([localTrack]);
  log("✅ Joined voice room: " + roomName);
  window.addEventListener("beforeunload", leaveRoom);
}

function showUI() {
  document.getElementById("login").style.display = "none";
  document.getElementById("controls").style.display = "block";
  document.getElementById("roomNameDisplay").textContent = roomName;
  document.getElementById("userDisplay").textContent = username;
  document.getElementById("userAvatar").textContent = avatar;
}

function toggleMute() { const enabled = localTrack.enabled; localTrack.setEnabled(!enabled); log(enabled ? "🔇 Muted" : "🎙️ Unmuted"); }
function leaveRoom() { if(localTrack) localTrack.close(); if(client) client.leave(); document.getElementById("controls").style.display = "none"; document.getElementById("login").style.display = "block"; log("❌ Left room"); }

function renderUsers() {
  const ul = document.getElementById("usersUL");
  ul.innerHTML = "";
  const users = roomData[roomName].users;
  for (let user in users) {
    const li = document.createElement("li");
    li.textContent = `${users[user].avatar} ${user} | 💎 ${users[user].diamonds}`;
    li.onclick = () => {
      const amount = parseInt(prompt(`Send diamonds to ${user}?`));
      if (!amount || amount <=0 || userData.diamonds < amount) return alert("Invalid amount");
      userData.diamonds -= amount; users[user].diamonds += amount;
      roomData[roomName].users[username] = userData; saveRoomData(); renderDiamonds(); renderUsers(); animateDiamonds(user); log(`💎 Sent ${amount} diamonds to ${user}`);
    };
    ul.appendChild(li);
  }
}

function renderDiamonds() { document.getElementById("userDiamonds").textContent = userData.diamonds; }

function sendMessage() {
  const msg = document.getElementById("chatInput").value.trim(); if (!msg) return;
  roomData[roomName].chat.push(`${avatar} ${username}: ${msg}`);
  saveRoomData(); renderChat(); document.getElementById("chatInput").value = "";
}

function renderChat() {
  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML = "";
  roomData[roomName].chat.forEach(msg => chatBox.innerHTML += `<p>${msg}</p>`);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendGift(gift, cost) {
  if(userData.diamonds < cost) return alert("Not enough diamonds!");
  userData.diamonds -= cost;
  const users = Object.keys(roomData[roomName].users).filter(u => u !== username);
  if(users.length > 0) {
    const receiver = users[Math.floor(Math.random() * users.length)];
    roomData[roomName].users[receiver].diamonds += cost;
    roomData[roomName].users[username] = userData; saveRoomData(); renderDiamonds(); renderUsers();
    animateGiftUltra(gift, receiver); log(`🎁 Gift ${gift} sent to ${receiver} (+${cost}💎)`);
  } else { log(`🎁 Gift ${gift} sent, no other users.`); }
}

function animateGiftUltra(gift, receiver) {
  const numGifts = Math.floor(Math.random()*3)+1;
  for(let i=0;i<numGifts;i++){
    const x = Math.random()*(window.innerWidth-50);
    const nameEl = document.createElement("div");
    nameEl.classList.add("floating-name"); nameEl.textContent = username;
    nameEl.style.left = `${x}px`; nameEl.style.bottom = `50px`;
    document.body.appendChild(nameEl); setTimeout(()=>nameEl.remove(),2000);
    const giftEl = document.createElement("div");
    giftEl.classList.add(gift==="👑"?"rainbow":"gift-animation"); giftEl.textContent=gift;
    giftEl.style.left=`${x}px`; giftEl.style.bottom=`50px`;
    document.body.appendChild(giftEl); setTimeout(()=>giftEl.remove(),2000);
    for(let d=0;d<5;d++){
      const diamond=document.createElement("div"); diamond.classList.add("diamond"); diamond.textContent="💎";
      diamond.style.left=`${x+Math.random()*30}px`; diamond.style.bottom="50px"; document.body.appendChild(diamond);
      setTimeout(()=>diamond.remove(),1500);
    }
    for(let p=0;p<3;p++){
      const particle=document.createElement("div"); particle.classList.add("particle"); particle.textContent="✨";
      particle.style.left=`${x+Math.random()*20}px`; particle.style.bottom="50px"; document.body.appendChild(particle);
      setTimeout(()=>particle.remove(),1000);
    }
    const ulItems=document.getElementById("usersUL").children;
    for(let li of ulItems){ if(li.textContent.includes(receiver)){ li.classList.add("avatar-sparkle"); setTimeout(()=>li.classList.remove("avatar-sparkle"),1000); } }
    if(navigator.vibrate) navigator.vibrate(100);
    // optional sound: const audio = new Audio('URL_TO_SOUND.mp3'); audio.play();
  }
}
