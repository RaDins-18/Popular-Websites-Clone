// Global variables
let currentSong = new Audio();
let songs;
let currPlaylist = "Hip-Hop-Albums";
let currFolder = "Open-Letter";

// Get all the songs.
async function getSongs(playlist, folder) {
    currPlaylist = playlist;
    currFolder = folder;
    let url = await fetch(`http://127.0.0.1:3000/Songs/${playlist}/${folder}/`);
    let response = await url.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchorTag = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < anchorTag.length; i++) {
        const element = anchorTag[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${playlist}/${folder}/`)[1].replaceAll("%20", " ").replaceAll("%2C", ",").replace(".mp3", ""));
        }
    }

    // Show all the songs in the playlist.
    let ul = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    ul.innerHTML = "";
    for (const song of songs) {
        ul.innerHTML = ul.innerHTML + `<li class="flex justify-space-between align-center border rounded bg-gray c-p">
                                           <div class="flex justify-center align-center g-3">
                                               <img src="../Assets/music-note.png" alt="music-note">
                                               <div class="info flex column g-5"">
                                                   <div class="over-none f-1">${song.split(" - ")[0]}</div>
                                                   <div class="over-none f-1">${song.split(" - ")[1]}</div>
                                               </div>
                                           </div>
                                           <img src="../Assets/play-1.png" alt="play-1">
                                       </li>`;
    }

    // Attach an event listener to each song.
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach( e => {
        e.addEventListener("click", ()=>{
            playMusic(`${e.querySelector(".info").firstElementChild.innerHTML} - ${e.querySelector(".info").lastElementChild.innerHTML}.mp3`);
        })
    })

    return songs;
}

function sToM(secs) {
    if (isNaN(secs) || secs < 0) {
        return "Invalid input";
    }

    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(remainingSecs).padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}

function playMusic (track, pause=false) {
    currentSong.src = `http://127.0.0.1:3000/Songs/${currPlaylist}/${currFolder}/${track}`;
    if(!pause){
        currentSong.play();
        play.src = "../Assets/pause.png";
    }

    document.querySelector(".song-name").innerHTML = track.replace(".mp3", "");
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";

    // Change background color of current song.
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach( e => {
        if (currentSong.src.split(`/${currFolder}/`)[1].replaceAll("%20", " ").replaceAll("%2C", ",") == `${e.querySelector(".info").firstElementChild.innerHTML} - ${e.querySelector(".info").lastElementChild.innerHTML}.mp3`) {
            e.style.backgroundColor = "rgb(35, 35, 35)";
        } else {
            e.style.backgroundColor = "#121212";
        }
    });
}

async function displayAlbums() {
    // Get playlists.
    let url = await fetch("http://127.0.0.1:3000/Songs/");
    let response = await url.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);
    for (let i = 0; i < array.length; i++) {
        let e = array[i];
        if (e.href.includes("/Songs") && e.href.includes(".htaccess") == false) {
            let playlist = e.href.split("/").slice(-2)[0];

            // Get albums.
            let url = await fetch(`http://127.0.0.1:3000/Songs/${playlist}/info.json`);
            let response = await url.json();
            let playlists = document.querySelector(".playlists");
            playlists.innerHTML = playlists.innerHTML + `<div class="playlist flex column">
                                                            <h1 class="f-4 m-3">${response.name}</h1>
                                                            <div class="cards-container ${playlist}-cards-container flex">
                                                            </div>
                                                         </div>`;

            // Get songs.
            let playlistUrl = await fetch(`http://127.0.0.1:3000/Songs/${playlist}/`);
            let playlistResponse = await playlistUrl.text();
            let div = document.createElement("div");
            div.innerHTML = playlistResponse;
            let anchors = div.getElementsByTagName("a");
            let array = Array.from(anchors);
            for (let i = 0; i < array.length; i++) {
                let e = array[i];
                if (e.href.includes(`/${playlist}/`)) {
                    let folder = e.href.split("/").slice(-2)[0];
                    if (folder != playlist) {
                        // Get folders.
                        let songUrl = await fetch(`http://127.0.0.1:3000/Songs/${playlist}/${folder}/info.json`);
                        let songResponse = await songUrl.json();
                        let cardsContainer = document.querySelector(`.${playlist}-cards-container`);
                        cardsContainer.innerHTML = cardsContainer.innerHTML + `<div data-playlist="${playlist}" data-folder="${folder}" class="card rounded p-3 flex column c-p">
                                                                                   <div class="play flex align-center justify-center">
                                                                                       <svg width="28" hight="28" viewBox="0 0 20 25" fill="#000" xmlns="http://www.w3.org/2000/svg">
                                                                                           <path d="M5 20V4L19 12L5 20Z" stroke="#1ED760" stroke-width="1.5" stroke-linejoin="round" />
                                                                                       </svg>
                                                                                   </div>
                                                                                   <img class="rounded" draggable="false" src="${songResponse.url}" alt="img">
                                                                                   <h2 class="f-3 m-4">${songResponse.title}</h2>
                                                                                   <p class="c-light-white f-2">${songResponse.artist}</p>
                                                                               </div>`;
                    }
                }
            }
        }
    }
    
    // Load the playlist whenever card is clicked.
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.playlist}`, `${item.currentTarget.dataset.folder}`);

            // Play first song.
            playMusic(`${songs[0]}.mp3`);
        })
    })
}

// Show all the songs in playlist.
(async function main() {
    // Add all songs in the songs variable.
    await getSongs(currPlaylist, currFolder);

    // Play music.
    playMusic(`${songs[0]}.mp3`, true);

    // Display all the albums on the page.
    displayAlbums();
    
    // Attach an event listener to play and pause.
    play.addEventListener("click", ()=> {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "../Assets/pause.png";
        } else {
            currentSong.pause();
            play.src = "../Assets/play.png";
        }
    })

    // Listen for timeupdate event.
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${sToM(currentSong.currentTime)} / ${sToM(currentSong.duration)}`;
        document.querySelector(".circle").style.left = currentSong.currentTime / currentSong.duration * 100 + "%";

        // Song autoplay.
        if (sToM(currentSong.currentTime) == sToM(currentSong.duration)) {
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ").replace(".mp3", ""));
            if ((index+1) < songs.length){
                playMusic(`${songs[index+1]}.mp3`);
            }
        }
    })

    // Add an event listener to seek bar.
    document.querySelector(".seek-bar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener to hamburger.
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left-side").style.left = "0%";
    })

    // Add an event listener to close.
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left-side").style.left = "-120%";
    })

    // Add an event listener to previous.
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ").replace(".mp3", ""));
        if ((index-1) >= 0){
            playMusic(`${songs[index-1]}.mp3`);
        }
    })
        
    // Add an event listener to next.
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ").replace(".mp3", ""));
        if ((index+1) < songs.length){
            playMusic(`${songs[index+1]}.mp3`);
        }
    })

    // Add an event listener to volume.
    document.querySelector(".range").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("Assets/mute.png", "Assets/volume-up.png");
        } else {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("Assets/volume-up.png", "Assets/mute.png");
        }
    })

    // Add event listener to mute the track.
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("/Assets/volume-up.png")){
            e.target.src = e.target.src.replace("Assets/volume-up.png", "Assets/mute.png");
            document.querySelector(".range").value = 0;
            currentSong.volume = 0;
        } else{
            e.target.src = e.target.src.replace("Assets/mute.png", "Assets/volume-up.png");
            document.querySelector(".range").value = 80;
            currentSong.volume = 0.80;
        }
    })
})()