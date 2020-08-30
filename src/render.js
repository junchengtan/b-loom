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


// function startRecord() {
//     electron.desktopCapturer.getSources({types: ['window', 'screen']}, (error, sources) => {
//       if (error) throw error
//       for (let i = 0; i < sources.length; ++i) {
//         if (sources[i].name === "foo") {
//           navigator.mediaDevices.getUserMedia({
//             audio: false,
//             video: {
//               mandatory: {
//                 chromeMediaSource: 'desktop',
//                 chromeMediaSourceId: sources[i].id,
//                 minWidth: 1280,
//                 maxWidth: 1280,
//                 minHeight: 720,
//                 maxHeight: 720
//               }
//             }
//           })
//             .then((stream) => handleStream(stream))
//             .catch((e) => handleError(e))
//           return
//         }
//       }
//     });
// }

// function handleStream(stream) {
//     navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(mediaStream){
//       var audioTracks = mediaStream.getAudioTracks();
//       //add video and audio sound
//       var medias = $("audio,video");
//       for (var i = 0; i < medias.length; i++) {
//         var tmpStream = medias[i].captureStream();  // mainWindow = new BrowserWindow({webPreferences: {experimentalFeatures: true} })
//         if(tmpStream) {
//           var tmpTrack = tmpStream.getAudioTracks()[0];
//           audioTracks.push(tmpTrack);
//         }
//       }

//       // mix audio tracks
//       if(audioTracks.length > 0){
//         var mixAudioTrack = mixTracks(audioTracks);
//         stream.addTrack(mixAudioTrack);
//       }

//       stream.addTrack(audioTrack);
//       recorder = new MediaRecorder(stream);
//       recorder.ondataavailable = function(event) {
//         // deal with your stream
//       };
//       recorder.start(1000);
//     }).catch(function(err) {
//       //console.log("handle stream error");
//     })
// }

//   function mixTracks(tracks) {
//     var ac = new AudioContext();
//     var dest = ac.createMediaStreamDestination();
//     for(var i=0;i<tracks.length;i++) {
//       const source = ac.createMediaStreamSource(new MediaStream([tracks[i]]));
//       source.connect(dest);
//     }
//     return dest.stream.getTracks()[0];
//   }