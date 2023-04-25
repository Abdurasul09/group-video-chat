const APP_ID = "6fb70323a9e04ff8a83138309fa3a806";
const TOKEN =
  "007eJxTYPCNDncP13KO4+d2yY9XOvzq16xbfV+Dl8ncjPjgozUrn0mBwSwtydzA2Mg40TLVwCQtzSLRwtjQ2MLYwDIt0TjRwsBs+1T3lIZARoYqJidGRgYIBPFZGHITM/MYGACWKhy0";
const CHANNEL = "main";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = [];
let remoteUsers = {};

let joinAndDisplayLocalStream = async () => {

	client.on('user-published', handleUserJoined)
	client.on('user-left', handleUserLeft)

  let UID = await client.join(APP_ID, CHANNEL, TOKEN, null);
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks() 
  let player = `<div class="video-container" id="user-container-${UID}">
											<div class="video-player" id="user-${UID}"></div>
								</div>`;
  document
    .getElementById("video-streams")
    .insertAdjacentHTML("beforeend", player);

  localTracks[1].play(`user-${UID}`);

  await client.publish([localTracks[0], localTracks[1]]);
};

let joinStream = async () => {
  await joinAndDisplayLocalStream();
  document.getElementById("join-btn").style.display = "none";
  document.getElementById("stream-controls").style.display = "flex";
};

let handleUserJoined = async (user, mediaType) => {
	remoteUsers[user.uid] = user 
	await client.subscribe(user, mediaType)

	if (mediaType === 'video'){
			let player = document.getElementById(`user-container-${user.uid}`)
			if (player != null){
					player.remove()
			}

			player = `<div class="video-container" id="user-container-${user.uid}">
											<div class="video-player" id="user-${user.uid}"></div> 
							 </div>`
			document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

			user.videoTrack.play(`user-${user.uid}`)
	}

	if (mediaType === 'audio'){
			user.audioTrack.play()
	}
}

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid]
	document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
	for(let i = 0; localTracks.length > i; i++) {
		localTracks[i].stop()
		localTracks[i].close()
	}
	await client.leave()
	document.getElementById('join-btn').style.display = 'block'
	document.getElementById('stream-controls').style.display = 'none'
	document.getElementById('video-streams').innerHTML = ''
}

let toggleMic = async (e) => {
	if(localTracks[0].muted){
		await localTracks[0].setMuted(false)
		document.getElementById('mic-btn').innerHTML = `
		    <span class="material-symbols-outlined">
		      mic
	      </span>
			`
	}else{
		await localTracks[0].setMuted(true)
		document.getElementById('mic-btn').innerHTML = `
		    <span class="material-symbols-outlined">
		      mic_off
	      </span>
			`
		document.querySelector('#mic-btn span').style.color = 'crimson'
	}
}

let toggleCamera = async (e) => {
	if(localTracks[1].muted){
			await localTracks[1].setMuted(false)
			document.getElementById('camera-btn').innerHTML = `
			  <span class="material-symbols-outlined">
			    videocam
			  </span>
			`
			// e.target.innerText = 'Camera on'
			e.target.style.backgroundColor = 'cadetblue'
	}else{
			await localTracks[1].setMuted(true)
			document.getElementById('camera-btn').innerHTML = `
			  <span class="material-symbols-outlined">
			    videocam_off
			  </span>
			`
			document.querySelector('#camera-btn span').style.color = 'crimson'
	}
}

document.getElementById("join-btn").addEventListener("click", joinStream);
document.getElementById("leave-btn").addEventListener("click", leaveAndRemoveLocalStream);
document.getElementById("mic-btn").addEventListener("click", toggleMic);
document.getElementById("camera-btn").addEventListener("click", toggleCamera);
