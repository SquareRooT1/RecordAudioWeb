// fork getUserMedia for multiple browser versions, for the future
// when more browsers support MediaRecorder

navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

// set up basic variables for app

var record = document.querySelector('.record');
var stop = document.querySelector('.stop');
var soundClips = document.querySelector('.sound-clips');
var canvas = document.querySelector('.visualizer');
var timeStamp = 0;

// disable stop button while not recording

stop.disabled = true;


// visualiser setup - create web audio api context and canvas

var audioCtx = new (window.AudioContext || webkitAudioContext)();
var canvasCtx = canvas.getContext("2d");

if(document.getElementById('recordInfoTxt').value != null){
  record.disabled = false;
  record.style.background = "red";
  console.log("test");
}
//main block for doing the audio recording

if (navigator.getUserMedia) {
  console.log('getUserMedia supported.');
  record.disabled = true;
  var constraints = { audio: true };
  var chunks = [];
  var store = [];

  var onSuccess = function(stream) {
    var mediaRecorder = new MediaRecorder(stream);

    visualize(stream);
    mediaRecorder.mimeType = 'audio/wav';

    record.onclick = function() {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");
      record.style.background = "red";
      timeStamp = new Date().getTime();
      stop.disabled = false;
      record.disabled = true;
    }

    stop.onclick = function() {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
      record.style.background = "";
      record.style.color = "";
      // mediaRecorder.requestData();

      stop.disabled = true;
      record.disabled = false;
    }

    mediaRecorder.onstop = function(e) {
      console.log("data available after MediaRecorder.stop() called.");

      var clipName = 'My unnamed Clip';
      console.log(clipName);
      var clipContainer = document.createElement('article');
      var clipLabel = document.createElement('p');
      var audio = document.createElement('audio');
      var deleteButton = document.createElement('button');
      var saveButton = document.createElement('button');

      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete';
      clipLabel.className = 'clipLabel';
      saveButton.textContent = 'Save';
      saveButton.className = 'save';

      if(clipName === null) {
        clipLabel.textContent = 'My unnamed clip';
      } else {
        clipLabel.textContent = clipName;
      }

      clipContainer.appendChild(audio);
      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(deleteButton);
      clipContainer.appendChild(saveButton);
      soundClips.appendChild(clipContainer);

      audio.controls = true;
      var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      chunks = [];
      var audioURL = window.URL.createObjectURL(blob);
      console.log(audioURL);
      audio.src = audioURL;
      console.log("recorder stopped");

      deleteButton.onclick = function(e) {
        evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
      }
      saveButton.onclick = function(e) {
        evtTgt = e.target;
        var i = 0;
        var child = evtTgt.parentNode.parentNode;
      }
    }

    mediaRecorder.ondataavailable = function(e) {
      console.log("trigger");
      chunks.push(e.data);
      var timeStampValue = timeStamp+".webm";
      var info = document.getElementById('recordInfoTxt').value;
      uploadFile(info+"/"+timeStampValue,e.data,info);
      saveAs(e.data,timeStampValue);

    }
  }

  function myFunction(){
    console.log("asd");
    record.style.background = "";
    record.style.color = "";
    record.disabled = false;
  }

  function uploadFile(fileName,file,info){
    var storageRef = firebase.storage().ref();
    var databaseRef= firebase.database().ref().child('auido');
    var userAgent = navigator.userAgent.toLowerCase();

    var metadata = {
    contentType: 'audio/mpeg',
    };
  var uploadTask = storageRef.child(fileName).put(file, metadata).then(function(snapshot){
      databaseRef.push({
          name : fileName,
          auidoDownloadUrl : snapshot.downloadURL,
          deviceType : userAgent,
          createdAt: firebase.database.ServerValue.TIMESTAMP
      }).then(function(snap){
        document.getElementsByClassName("clipLabel")[document.getElementsByClassName("clipLabel").length-1].textContent = snapshot.downloadURL;
      });
    });
  }




  var onError = function(err) {
    console.log('The following error occured: ' + err);
  }

  navigator.getUserMedia(constraints, onSuccess, onError);
} else {
   console.log('getUserMedia not supported on your browser!');
}

function getNodeIndex(node) {
    var index = 0;
    while ( (node = node.previousSibling) ) {
        if (node.nodeType != 3 || !/^\s*$/.test(node.data)) {
            index++;
        }
    }
    return index;
}


function visualize(stream) {
  var source = audioCtx.createMediaStreamSource(stream);

  var analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  WIDTH = canvas.width
  HEIGHT = canvas.height;

  draw()

  function draw() {

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = WIDTH * 1.0 / bufferLength;
    var x = 0;


    for(var i = 0; i < bufferLength; i++) {

      var v = dataArray[i] / 128.0;
      var y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

  }
}
