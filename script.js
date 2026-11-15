const video = document.getElementById("video");
const fileInput = document.getElementById("fileInput");
const videoList = document.getElementById("videoList");
const videoTitle = document.getElementById("videoTitle");

let videos = [];
let currentIndex = -1;

function addVideos(files) {
    Array.from(files).forEach(file => {
        if (!file.type.startsWith("video/")) return;

        videos.push({
            name: file.name,
            url: URL.createObjectURL(file),
            file: file
        });
    });

    renderVideos();
}

fileInput.addEventListener("change", e => {
    addVideos(e.target.files);
    fileInput.value = "";
});

function renderVideos(filter = "") {
    videoList.innerHTML = "";

    const filtered = videos
        .map((v, i) => ({...v, index: i}))
        .filter(v => v.name.toLowerCase().includes(filter.toLowerCase()));

    if (!filtered.length) {
        videoList.innerHTML = '<p class="empty">No videos found.</p>';
        return;
    }

    filtered.forEach(v => {
        const card = document.createElement("div");
        card.className = "video-card" +
            (v.index === currentIndex ? " active" : "");

        const icon = document.createElement("div");
        icon.className = "icon";
        icon.textContent = "🎬";

        const name = document.createElement("p");
        name.textContent = v.name;

        const playBtn = document.createElement("button");
        playBtn.textContent = "PLAY VIDEO";
        playBtn.addEventListener("click", () => playVideo(v.index));

        card.append(icon, name, playBtn);

        card.addEventListener("click", e => {
            if (e.target !== playBtn) playVideo(v.index);
        });

        videoList.appendChild(card);
    });
}

function playVideo(index) {
    currentIndex = index;

    video.src = videos[index].url;
    videoTitle.textContent = videos[index].name;

    video.play().catch(() => {
        document.getElementById("play").textContent = "▶";
    });

    document.getElementById("play").textContent = "Ⅱ";

    renderVideos(document.getElementById("search").value);
}

document.getElementById("play").onclick = () => {
    if (!video.src) return;

    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
};

video.addEventListener("play", () => {
    document.getElementById("play").textContent = "Ⅱ";
});

video.addEventListener("pause", () => {
    document.getElementById("play").textContent = "▶";
});

document.getElementById("back").onclick = () => {
    video.currentTime = Math.max(0, video.currentTime - 10);
};

document.getElementById("forward").onclick = () => {
    if (Number.isFinite(video.duration)) {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
    }
};

document.getElementById("fullscreen").onclick = () => {
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
    }
};

document.getElementById("volume").oninput = e => {
    video.volume = Number(e.target.value);
};

document.getElementById("speed").onchange = e => {
    video.playbackRate = Number(e.target.value);
};

document.getElementById("search").oninput = e => {
    renderVideos(e.target.value);
};

document.getElementById("themeBtn").onclick = () => {
    document.body.classList.toggle("light");

    document.getElementById("themeBtn").textContent =
        document.body.classList.contains("light") ? "☀️" : "🌙";
};

document.getElementById("subtitle").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file || !video.src) {
        alert("First select a video.");
        return;
    }

    const oldTrack = video.querySelector("track");
    if (oldTrack) oldTrack.remove();

    const track = document.createElement("track");
    track.kind = "subtitles";
    track.label = "Subtitle";
    track.srclang = "en";
    track.src = URL.createObjectURL(file);
    track.default = true;

    video.appendChild(track);

    track.addEventListener("load", () => {
        if (video.textTracks.length) {
            video.textTracks[0].mode = "showing";
        }
    });
});

video.addEventListener("ended", () => {
    document.getElementById("play").textContent = "▶";
});

window.addEventListener("beforeunload", () => {
    videos.forEach(v => URL.revokeObjectURL(v.url));
});

renderVideos();
