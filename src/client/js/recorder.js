
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let starem;
let recorder;
let videoFile;

const handleDownload = () =>{
    const a = document.createElement("a");
    a.href = videoFile;
    a.download = "MyRecording.webm";
    document.body.appendChild(a);
    a.click();
}

const handleStop = () =>{
    startBtn.innerText="Download Recroding";
    startBtn.removeEventListener("click", handleStop);
    startBtn.addEventListener("click",handleDownload);
    recorder.stop();
}

const handleStart = () =>{
    startBtn.innerText="Stop Recroding";
    startBtn.removeEventListener("click",handleStart);
    startBtn.addEventListener("click",handleStop);

    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) =>{
        videoFile = URL.createObjectURL(e.data);
        video.srcObject=null;
        video.src=videoFile;
        video.loop=true;
        video.play();
    }
    recorder.start();
    
};

const init = async() =>{
    stream = await navigator.mediaDevices.getUserMedia({
        audio : true, 
        video:true
    });
    video.srcObject = stream;
    video.play();
}
init();

startBtn.addEventListener("click", handleStart);