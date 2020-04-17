let nombreLEDs = [17,10];

let sounds_mp3 = ['Yaeji - Raingurl.mp3','Justice - Genesis.mp3', "Fatima Yamaha - Whats a girl to do.mp3"];
let sounds = [];
let sonChoisi;

let playButton;
let volumeSlider;
let radio;

let bgImg;
let tableauLED;

// COLORS
let bgColor;
let graphBgColor;
let colorGraph;
    
//-- END COLORS

function preload(){
    bgImg = loadImage("image_SIMU.jpg");
    for (let i = 0; i < sounds_mp3.length; i++){
        append(sounds, loadSound(sounds_mp3[i]));
        print("Son n°" + str(i+1) + " chargé.")
    }
    sonChoisi = sounds[0];
    
}


function setup() {
    
    // COLORS
    
    bgColor = color(200);
    graphBgColor = color(150);
    colorGraph = color(220);
    
    //-- END COLORS
    
    
    // UI

    createCanvas(1000, 900);
    graph = createGraphics(100,100);
    graph.background(graphBgColor);
    
    // -- END UI
    
    
    // RAW UI
    
    playButton = createButton("Play / Pause");
    playButton.size = (100,100);
    playButton.position = (100,10);
    playButton.mousePressed(jouerSon);
    
    volumeSlider = createSlider(0,1,0.5,0.1);
    
    radio = createRadio();
    for (let i = 0; i < sounds_mp3.length; i++){
        radio.option(i+1);
    }
    
    
    // -- END RAW UI
    
    
    // OTHERS
    
    fft = new p5.FFT(0.85,64);
    tableauLED = createTableauLED();
    
    //-- OTHERS
    
    
}


function draw() {

    background(bgColor);
    image(bgImg, 0, 0);
    
    graph.noStroke();
    image(graph, 0, 700, 1000, 200);
    
    let spectrum = fft.analyze();
    stroke(colorGraph);
    fill(colorGraph);
    for (let i = 0; i< int(spectrum.length*0.8); i++){ // *0.8 pour prendre que les 80% des fréquences les plus basses du spectre audible
    let x = map(i, 0, int(spectrum.length*0.8), 0, width);
        let h = height - map(spectrum[i], 0, 255, 0, 300);
        let xx = map(spectrum[i], 0, 255, -10, 6);
        let amplitudeModif = int( (1 / ( 1 + exp(-xx))) * 255);
        let barColor = color(amplitudeModif+20,amplitudeModif*0.5+20,20)
        
        let h_modif = height - map(amplitudeModif, 0, 255, 0, 300);
        noStroke();
        fill(255);
        rect(x, height, width / (spectrum.length*0.8), h - 900 );
        stroke(barColor);
        fill(barColor);
        rect(x, height, width / (spectrum.length*2), h_modif - 900 );
    }

    

    sonChoisi.amp(volumeSlider.value());
    
    
}


function jouerSon(){
    sonChoisi = sounds[int(radio.value())-1]
    if (sonChoisi.isPlaying()) {
        sonChoisi.pause();
    } else {
        sonChoisi.loop();
    }
    
}


function createTableauLED(){
   for(let y = 0; y < nombreLEDs[1]; y++){
       for(let x = 0; x < nombreLEDs[0]; x++){
           print(x);
       }
   }
}


function drawLEDs(){
    
}