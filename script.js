const scenes = [
    {
        id: 1,
        duration: 15000, /* Increased from 12000 */
        type: 'split-with-phones',
        leftImage: 'assets/images/boy_room_phone.png',
        rightImage: 'assets/images/girl_room_dinner.png',
        brightness: 0.4,
        leftMessage: { text: "Thank you for your kindness welcome. but I cannot arrive in time.", delay: "delay-2" },
        rightMessage: { text: "Would you please come to have dinner?", delay: "delay-1" }
    },
    {
        id: 2,
        duration: 12000, /* Increased from 8000 */
        type: 'split-with-phones', /* Changed to split-with-phones */
        leftImage: 'assets/images/boy_reading.png',
        rightImage: 'assets/images/girl_stocks.png',
        brightness: 0.0,
        leftMessage: { text: "I will join in a minute.", delay: "delay-2" },
        rightMessage: { text: "Do you have time for trade?", delay: "delay-1" }
    },
    {
        id: 3,
        duration: 12000, /* Increased from 8000 */
        type: 'split-with-phones', /* Changed to split-with-phones */
        leftImage: 'assets/images/boy_gift.png',
        rightImage: 'assets/images/girl_chocolate.png',
        brightness: 0.2,
        leftMessage: { text: "please check if you receive the gift.", delay: "delay-2" },
        rightMessage: { text: "I am happy with the chocolate", delay: "delay-1" }
    },
    {
        id: 4,
        duration: 15000, /* Increased from 10000 */
        type: 'full',
        image: 'assets/images/meeting_bridge.png',
        brightness: 0.5,
        leftMessage: { text: "where are you?", delay: "delay-2" },
        rightMessage: { text: "I am here.", delay: "delay-1" }
    }
];

let currentSceneIndex = 0;
let isPlaying = false;
let lastTime = 0;
let totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);
let sceneTimeElapsed = 0;

const stage = document.getElementById('stage');
const progressBar = document.getElementById('milky-way-progress');
const playPauseBtn = document.getElementById('play-pause-btn');
const muteBtn = document.getElementById('mute-btn');
const audio = document.getElementById('bg-music');
const transitionOverlay = document.getElementById('transition-overlay');
const endScreen = document.getElementById('end-screen');
const replayBtn = document.getElementById('replay-btn');

function init() {
    renderScenes();
    updateSceneVisibility();

    playPauseBtn.addEventListener('click', togglePlay);
    muteBtn.addEventListener('click', toggleMute);
    replayBtn.addEventListener('click', replayStory);

    requestAnimationFrame(gameLoop);
}

function renderScenes() {
    stage.innerHTML = '';
    scenes.forEach((scene, index) => {
        const sceneEl = document.createElement('div');
        sceneEl.classList.add('scene');
        sceneEl.id = `scene-${index}`;

        if (scene.type === 'split-with-phones') {
            const container = document.createElement('div');
            container.classList.add('split-container');

            // Left Side (Boy)
            const left = document.createElement('div');
            left.classList.add('split-screen', 'left');
            left.style.backgroundImage = `url('${scene.leftImage}')`;

            if (scene.leftMessage) {
                const leftPhone = document.createElement('div');
                leftPhone.classList.add('phone-popup');
                leftPhone.innerHTML = `
                    <div class="phone-notch"></div>
                    <div class="phone-screen-content">
                        <div class="message-bubble sent ${scene.leftMessage.delay}">${scene.leftMessage.text}</div>
                    </div>
                `;
                left.appendChild(leftPhone);
            }

            // Right Side (Girl)
            const right = document.createElement('div');
            right.classList.add('split-screen', 'right');
            right.style.backgroundImage = `url('${scene.rightImage}')`;

            if (scene.rightMessage) {
                const rightPhone = document.createElement('div');
                rightPhone.classList.add('phone-popup');
                rightPhone.innerHTML = `
                    <div class="phone-notch"></div>
                    <div class="phone-screen-content">
                        <div class="message-bubble sent ${scene.rightMessage.delay}">${scene.rightMessage.text}</div>
                    </div>
                `;
                right.appendChild(rightPhone);
            }

            container.appendChild(left);
            container.appendChild(right);
            sceneEl.appendChild(container);

        } else if (scene.type === 'split') {
            const container = document.createElement('div');
            container.classList.add('split-container');

            const left = document.createElement('div');
            left.classList.add('split-screen', 'left');
            left.style.backgroundImage = `url('${scene.leftImage}')`;

            const right = document.createElement('div');
            right.classList.add('split-screen', 'right');
            right.style.backgroundImage = `url('${scene.rightImage}')`;

            container.appendChild(left);
            container.appendChild(right);
            sceneEl.appendChild(container);

        } else {
            const full = document.createElement('div');
            full.classList.add('full-screen');
            full.style.backgroundImage = `url('${scene.image}')`;

            // Add phones for full screen if messages exist
            if (scene.leftMessage) {
                const leftPhone = document.createElement('div');
                leftPhone.classList.add('phone-popup', 'left-pos');
                leftPhone.innerHTML = `
                    <div class="phone-notch"></div>
                    <div class="phone-screen-content">
                        <div class="message-bubble sent ${scene.leftMessage.delay}">${scene.leftMessage.text}</div>
                    </div>
                `;
                full.appendChild(leftPhone);
            }

            if (scene.rightMessage) {
                const rightPhone = document.createElement('div');
                rightPhone.classList.add('phone-popup', 'right-pos');
                rightPhone.innerHTML = `
                    <div class="phone-notch"></div>
                    <div class="phone-screen-content">
                        <div class="message-bubble sent ${scene.rightMessage.delay}">${scene.rightMessage.text}</div>
                    </div>
                `;
                full.appendChild(rightPhone);
            }

            sceneEl.appendChild(full);
        }

        stage.appendChild(sceneEl);
    });
}

function updateSceneVisibility() {
    const sceneEls = document.querySelectorAll('.scene');
    sceneEls.forEach((el, index) => {
        if (index === currentSceneIndex) {
            el.classList.add('active');
            if (isPlaying) {
                el.classList.add('animate-messages');
            } else {
                el.classList.remove('animate-messages');
            }
        } else {
            el.classList.remove('active');
            el.classList.remove('animate-messages');
        }
    });

    const currentScene = scenes[currentSceneIndex];
    transitionOverlay.style.opacity = currentScene.brightness;
}

function togglePlay() {
    if (isPlaying) {
        isPlaying = false;
        playPauseBtn.innerText = "Play";
        audio.pause();
    } else {
        isPlaying = true;
        playPauseBtn.innerText = "Pause";
        audio.play().catch(e => console.log("Audio play failed:", e));

        const currentEl = document.getElementById(`scene-${currentSceneIndex}`);
        if (currentEl) currentEl.classList.add('animate-messages');

        lastTime = performance.now();
        gameLoop(lastTime);
    }
}

function toggleMute() {
    audio.muted = !audio.muted;
    muteBtn.innerText = audio.muted ? "Unmute" : "Mute";
}

function replayStory() {
    endScreen.classList.add('hidden');
    currentSceneIndex = 0;
    sceneTimeElapsed = 0;
    updateSceneVisibility();
    isPlaying = true;
    audio.currentTime = 0;
    audio.play();
    playPauseBtn.innerText = "Pause";

    const currentEl = document.getElementById(`scene-${currentSceneIndex}`);
    if (currentEl) currentEl.classList.add('animate-messages');

    lastTime = performance.now();
    gameLoop(lastTime);
}

function gameLoop(timestamp) {
    if (!isPlaying) return;

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    sceneTimeElapsed += deltaTime;

    const currentScene = scenes[currentSceneIndex];

    if (sceneTimeElapsed >= currentScene.duration) {
        sceneTimeElapsed = 0;
        currentSceneIndex++;
        if (currentSceneIndex >= scenes.length) {
            currentSceneIndex = scenes.length - 1;
            isPlaying = false;
            playPauseBtn.innerText = "Replay";
            progressBar.style.width = '100%';
            endScreen.classList.remove('hidden');
            return;
        } else {
            updateSceneVisibility();
        }
    }

    // Update progress bar
    let timePastScenes = 0;
    for (let i = 0; i < currentSceneIndex; i++) {
        timePastScenes += scenes[i].duration;
    }
    const totalTimeElapsed = timePastScenes + sceneTimeElapsed;
    const percent = Math.min((totalTimeElapsed / totalDuration) * 100, 100);

    progressBar.style.width = `${percent}%`;

    if (isPlaying) {
        requestAnimationFrame(gameLoop);
    }
}

init();
