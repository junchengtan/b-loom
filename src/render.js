//buttons
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectorBtn = document.getElementById('videoSelectBtn')
videoSelectorBtn.onclick = getVideoSources;


const { desktopCapturer, remote } = require('electron');
//remote allows us to build native menus in front-end code
const { Menu } = remote;


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

// async function selectSource(source) {
//     videoSelectorBtn.innerText = source.name;
//     const constraints = {
//         audio: false,
//         video: {
//             mandatory: {
//                 chromeMediaSource: 'desktop',
//                 chromeMediaSourceID: source.id
//             }
//         } 
//     };
//     //create stream
//     const stream = await navigator.mediaDevices.getUserMedia(constraints);
//     videoElement.srcObject = stream;
//     videoElement.play();
// }


