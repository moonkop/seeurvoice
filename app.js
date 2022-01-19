document.querySelector("#btn_useSys").addEventListener('click', () => {
    init('sys')
})
document.querySelector("#btn_useMic").addEventListener('click', () => {
    init('mic')
})

let canvas = document.querySelector('.visualizer');
let canvasCtx = canvas.getContext("2d");
let intendedWidth = document.querySelector('.wrapper').clientWidth;
canvas.setAttribute('width', intendedWidth);
let WIDTH = canvas.width;
HEIGHT = canvas.height;
window.addEventListener('resize', () => {
    console.log('resize');
    let clientWidth = document.querySelector('.wrapper').clientWidth;
    if (WIDTH != clientWidth) {
        WIDTH = clientWidth
        canvas.setAttribute('width', WIDTH);
    }
})

function init(type) {
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let source;
    let freq = document.querySelector('#freq');
    let analyser = audioCtx.createAnalyser();
    let delay=audioCtx.createDelay(100)
     delay.delayTime.value = 3.0; 
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.1;

    if (type == 'mic') {
        navigator.mediaDevices.getUserMedia({
                audio: true
            }
        ).then(function (stream) {
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            analyser.connect(delay);
         //   delay.connect(audioCtx.destination)

            visualize();

        }).catch(function (err) {
            console.log('The following gUM error occured: ' + err);
        })
    } else if (type == 'sys') {
        navigator.mediaDevices.getDisplayMedia({
            video: {
                frameRate: 1,
            },
            audio: true,
        }).then((stream) => {
            console.log(stream);
            console.log(stream.getTracks());
            console.log(stream.getTracks().filter(item => item.kind == 'audio'));
            let source1 = stream.getTracks().filter(item => item.kind == 'audio')[0];
            console.log(source);
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            visualize();
        });
    }

    function visualize() {
        analyser.fftSize = 32768;
        let bufferLengthAlt = analyser.frequencyBinCount;
        console.log(bufferLengthAlt);
        let dataArrayAlt = new Uint8Array(bufferLengthAlt);
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        let times = 0;
        console.log(canvasCtx)
        let drawAlt = function () {
            if (times > WIDTH) {
                times = 0;
            }
            analyser.getByteFrequencyData(dataArrayAlt);
            let barHeight;
            let max = 0;
            for (let i = 0; i < dataArrayAlt.length; i++) {
                if (dataArrayAlt[max] < dataArrayAlt[i]) {
                    max = i
                }
            }
            freq.textContent = (max/139*200).toFixed(0);
            for (let i = 0; i < 1024; i++) {
                barHeight = dataArrayAlt[i];
                let style = 'hsl(' + (256 - barHeight * 2) + ',100%,50%)';
                canvasCtx.fillStyle = style;
                canvasCtx.fillRect(times, i, 1, 1);

            }
            let style = 'rgb(255,255,255)';
            canvasCtx.fillStyle = style;
            canvasCtx.fillRect(times, max, 2, 2);
            times += 1;
        };
        setInterval(drawAlt, 0);
    }
}
