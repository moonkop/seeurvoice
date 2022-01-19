
document.querySelector("#btn_useSys").addEventListener('click',()=>{
    init('sys')
})
document.querySelector("#btn_useMic").addEventListener('click',()=>{
    init('mic')
})
// set up canvas context for visualizer

var canvas = document.querySelector('.visualizer');
var canvasCtx = canvas.getContext("2d");

var intendedWidth = document.querySelector('.wrapper').clientWidth;
canvas.setAttribute('width', intendedWidth);

console.log('draw')
let style =  'rgb(255,0,0)';
//    console.log(style);

canvasCtx.fillStyle = style;
canvasCtx.fillRect(500, 500, 100, 100);

var WIDTH = canvas.width;
HEIGHT = canvas.height;
window.addEventListener('resize',()=>{
    console.log('resize');
    WIDTH = document.querySelector('.wrapper').clientWidth;

    canvas.setAttribute('width', WIDTH);

})
function init(type) {

    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var voiceSelect = document.getElementById("voice");
    var source;
    var stream;

    // grab the mute button to use below

    var mute = document.querySelector('.mute');

    //set up the different audio nodes we will use for the app

    var analyser = audioCtx.createAnalyser();
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.1;

    var distortion = audioCtx.createWaveShaper();
    var gainNode = audioCtx.createGain();
    var biquadFilter = audioCtx.createBiquadFilter();
    var convolver = audioCtx.createConvolver();





    var drawVisual;
    //main block for doing the audio recording

    if (type=='mic') {
        var constraints = {
            audio: true
        }
        navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            //     source.connect(audioCtx.destination);
            //    analyser.connect(audioCtx.destination);
            visualize();
            voiceChange();

        }).catch(function(err) {
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
            var source1=stream.getTracks().filter(item => item.kind == 'audio')[0];
            console.log(source);
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            visualize();
            voiceChange();
        });
    }

    function visualize() {

        analyser.fftSize = 16384;
        var bufferLengthAlt = analyser.frequencyBinCount;
        console.log(bufferLengthAlt);
        var dataArrayAlt = new Uint8Array(bufferLengthAlt);

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        let arrays = [];
        let times = 0;
        console.log(canvasCtx)
        var drawAlt = function() {
            if (times > WIDTH) {
                times = 0;
            }
            analyser.getByteFrequencyData(dataArrayAlt);
            var barWidth = (WIDTH / bufferLengthAlt) * 2.5;
            var barHeight;
            var x = 0;
            let max = 0;
            for (let i = 0; i < dataArrayAlt.length; i++) {
                if (dataArrayAlt[max] < dataArrayAlt[i]) {
                    max=i
                }
            }
          //  dataArrayAlt[max]=255
            mute.textContent = max;
            for (var i = 0; i < 1024; i++) {
                barHeight = dataArrayAlt[i];
                let style =  'hsl('+ (256-barHeight*2) +',100%,50%)';
            //    console.log(style);
                canvasCtx.fillStyle = style;
                canvasCtx.fillRect(times, i, 1, 1);

            }
            let style =  'rgb(255,255,255)';
            //    console.log(style);
            canvasCtx.fillStyle = style;
            canvasCtx.fillRect(times, max, 2, 2);

            times += 1;

        };

        setInterval(drawAlt, 0);

    }





}
