const APP_ID = "c020045940234e0a9c462cce2193fa99";

let client;
let localTrack;
let roomName;

function log(msg) {
  document.getElementById("log").innerHTML += `<p>${msg}</p>`;
}

async function joinRoom() {
  roomName = document.getElementById("room").value;
  if (!roomName) return alert("Enter room code");

  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  await client.join(APP_ID, roomName, null, null);

  localTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish([localTrack]);

  document.getElementById("controls").style.display = "block";
  log("✅ Joined room: " + roomName);
}

function mute() {
  localTrack.setEnabled(false);
  log("🔇 Muted");
}

function leave() {
  localTrack.close();
  client.leave();
  document.getElementById("controls").style.display = "none";
  log("❌ Left room");
}

function sendGift(gift) {
  log("🎁 Gift sent: " + gift);
}
