const audioCtx = new AudioContext();
const playRandomBtn = document.querySelector('.random-chord-btn');
const replayBtn = document.querySelector('.replay-btn');
const optionBoxes = [...document.querySelectorAll('.chord-option')];
const keyDropdown = document.querySelector('#key');
const chordBtns = [...document.querySelectorAll('.answer-buttons button')];
let currentAnswer;
const feedbackText = document.querySelector('.feedback');

function loadChoices() {
    const choices = optionBoxes.filter(box => box.checked);
    if (choices.length === 0) {
        alert(`Please select at least one option`);
        return;
    }
    return choices;
}

//TODO: either edit this choice, or use 'humanRandom'
function pickRandomChoice(choices) {
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
}

function processRandomChoice(choice) {
    let id = choice.id;
    let splitInfo = id.split('-');
    return splitInfo;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - 1)) + min;
}

function randomKey() {
    const keys = ['A', 'Ab', 'B', 'Bb', 'C', 'Db', 'D', 'E', 'Eb', 'F', 'Gb', 'G'];
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
}

async function getFile(audioContext, filepath) {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

async function setupSample(filePath) {
    const sample = await getFile(audioCtx, filePath);
    return sample;
}

function playSample(sample) {
    const sampleSource = audioCtx.createBufferSource();
    sampleSource.buffer = sample;
    sampleSource.connect(audioCtx.destination)
    sampleSource.start();
}

function playAudioFiles() {
    setupSample(currentAnswer.tonicizingProgFile).then((sample) => {
        playSample(sample);
    });
    const timer = setTimeout(() => {
        setupSample(currentAnswer.chordFile).then((sample) => {
            playSample(sample);
        });
        clearTimeout(timer);
    }, 5500);
    
}

function feedback(msg) {
    const para = document.createElement('p');
    para.classList.add('feedback');
    para.textContent = msg;
    feedbackText.appendChild(para);
}

function processGuess(evt) {
    const btn = evt.currentTarget;
    const [mode, chord] = btn.classList[0].split('-');
    console.log({mode, chord});
    const msg = (mode === currentAnswer.mode && chord === currentAnswer.chord) ? `Correct!` : `Nope... try again.`;
    feedback(msg);
    let displayTimer = setTimeout(() => {
        let para = feedbackText.firstChild;
        feedbackText.removeChild(para);
        clearTimeout(displayTimer);
    }, 2000);
}

function handleRandomChordBtnClick() {
    const choices = loadChoices();
    const choice = pickRandomChoice(choices);
    const key = keyDropdown.value === 'random' ? randomKey() : keyDropdown.value;
    const [mode, chord] = processRandomChoice(choice);
    const voicing = randomInt(1, 6);
    const tonicizingProgFile = `audio/tonicizing_progs/${mode}/tonicizing_prog_${key}.mp3`;
    const chordFile = `audio/individual_harmonies/${mode}/${chord}/${chord}(arr${voicing})_${key}.mp3`;

    currentAnswer = {
        choice,
        key,
        mode,
        chord,
        voicing,
        tonicizingProgFile,
        chordFile
    };

    console.log(currentAnswer);
    playAudioFiles();
}

playRandomBtn.addEventListener('click', handleRandomChordBtnClick);
replayBtn.addEventListener('click', playAudioFiles);
chordBtns.forEach(btn => btn.addEventListener('click', processGuess));

