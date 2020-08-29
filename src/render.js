//buttons
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectorBtn = document.getElementById('videoSelectBtn')
videoSelectorBtn.onclick = getVideoSources;

let mediaRecorder;
const recordedChunks = [];

const { desktopCapturer, remote } = require('electron');
//remote allows us to build native menus in front-end code
const { Menu } = remote;

startBtn.onclick = e => {
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
};

stopBtn.onclick = e => {
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
  };

//get vid sources

async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });
    const VideoMenuOptions = Menu.buildFromTemplate(
        inputSources.map(source => {
            return{
                label: source.name,
                click: () => selectSource(source)
            }
        })
    ) 
    VideoMenuOptions.popup();
}



async function selectSource(source) {
    videoSelectorBtn.innerText = source.name;
    const constraints = {
        audio: false,
        video: {
        mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id
        }
        }
  };
  
    //create stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    videoElement.play();

    //create Media recorder
    const options = { mimeType: 'video/webm; codecs=vp9'};
    mediaRecorder = new MediaRecorder(stream, options);

    //register event handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
}

const { dialog } = remote; 
const { writeFile, write } = require('fs');

function handleDataAvailable(e) {
    console.log('video data available');
    recordedChunks.push(e.data);

}


async function handleStop(e) {
    const blob = new Blob(recordedChunks, { 
        type: 'video/webm; codecs=vp9'
    });
    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });
    console.log(filePath);
    writeFile(filePath, buffer, () => console.log('video saved successfully'));
}