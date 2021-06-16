
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream; 
let recorder;
let videoFile;

const files ={
    input : "recording.webm",
    output:"output.mp4",
    thumb : "thumbnail.jpg"
}

const downloadFile = (fileUrl, fileName) =>{

    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

}

const handleDownload = async () => {

    actionBtn.removeEventListener("click",handleDownload);

    actionBtn.innerText="Transcoding...";
    
    actionBtn.disabled = true;

    const ffmpeg = createFFmpeg({
        corePath: "http://localhost:3000/public/ffmpeg-core.js",
        log: true
    });
    await ffmpeg.load();

    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

    await ffmpeg.run("-i", files.input, "-r", "60", files.output); // get the input file

    await ffmpeg.run(
        "-i",
        files.input,
        "-ss",
        "00:00:01",
        "-frames:v",
        "1",
        files.thumb
    );

    const mp4File = ffmpeg.FS("readFile", files.output);
    const thumFile = ffmpeg.FS("readFile", "thumnail.jpg");

    const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
    const thumBlob = new Blob([thumFile.buffer], { type: "image/jpg" });

    const mp4Url = URL.createObjectURL(mp4Blob);
    const thumUrl = URL.createObjectURL(thumBlob);

    downloadFile(mp4Url , "MyRecording.mp4");
    downloadFile(thumUrl , "MyThumbnail.jpg");

    ffmpeg.FS("unlink", files.input);
    ffmpeg.FS("unlink", files.output);
    ffmpeg.FS("unlink" , files.thumb);

    URL.revokeObjectURL(mp4Url);
    URL.revokeObjectURL(thumUrl);
    URL.revokeObjectURL(videoFile);

    actionBtn.disabled=false;
    actionBtn.innerText="Record Again";
    actionBtn.addEventListener("click", handleStart);

}

// const handleStop = () => {
//     actionBtn.innerText = "Download Recroding";
//     actionBtn.removeEventListener("click", handleStop);
//     actionBtn.addEventListener("click", handleDownload);
//     recorder.stop();
// }

const handleStart = () => {
    actionBtn.innerText = "Stop Recroding";
    actionBtn.removeEventListener("click", handleStart);
    actionBtn.addEventListener("click", handleStop);

    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
        videoFile = URL.createObjectURL(e.data);
        console.log(videoFile);
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
    }

    recorder.start();
    
    setTimeout(()=>{
        recorder.stop();
    },5000)

};

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    });
    video.srcObject = stream;
    video.play();
}
init();

actionBtn.addEventListener("click", handleStart);