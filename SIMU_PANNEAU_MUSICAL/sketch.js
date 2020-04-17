let nombreLEDs = [17,10];
let pingPongBallSize = 14;

let fontOG;

let sounds_mp3 = ["Fatima Yamaha - Whats a girl to do.mp3", "Fatima Yamaha - Whats a girl to do.mp3", "Yaeji - Raingurl.mp3","Justice - Genesis.mp3", "MIA - Paper Planes.mp3"];
let sounds = [];
let sonChoisi;

let playButton;
let volumeSlider;
let radio;
let inputTailleX;
let inputTailleY;

let bgImg;
let bgImgAlpha;
let tableauLED = []; // tableauLED[x][y]

// COLORS
let bgColor;
let pingPongBallColor;
let graphBgColor;
let colorGraph;
    
//-- END COLORS

function preload(){
    bgImg = loadImage("image_SIMU.jpg");
    bgImgAlpha = loadImage("image_SIMU_alpha.png");
    fontOG = loadFont('font_og.otf');
    for (let i = 0; i < sounds_mp3.length; i++){
        sounds.push(loadSound(sounds_mp3[i]));
        print("Son n°" + str(i) + " : " + sounds_mp3[i] + " chargé.");
    }
    
}


function setup() {
    
    // COLORS
    
    bgColor = color(200);
    graphBgColor = color(150);
    colorGraph = color(220);
    pingPongBallColor = color(245)
    
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
    
    inputTailleX = createInput("17");
    inputTailleY = createInput("10");
    
    radio = createRadio();
    for (let i = 1; i < sounds_mp3.length; i++){
        radio.option(split(sounds_mp3[i], '.')[0],str(i));
    }
    
    
    // -- END RAW UI
    
    
    // OTHERS
    sonChoisi = "0";
    
    fft = new p5.FFT(0.85,64);
    createTableauLED();
    drawLEDs(true);
    
    //-- OTHERS
    
    
}


function draw() {

    background(bgColor);
    image(bgImg, 0, 0);
    
    
    
    graph.noStroke();
    image(graph, 0, 700, 1000, 200);
    
    // ACTUALISATION TAILLE TABLEAU
    
    if ( (tableauLED.length != int(inputTailleY) || tableauLED[0].length != int(inputTailleX) )){
        nombreLEDs = [inputTailleX.value(),inputTailleY.value()];
        createTableauLED();
    }
    
    // -- FIN ACTUALISATION TAILLE TABLEAU
    
    
    if (sonChoisi != 0){
        sounds[sonChoisi].amp(volumeSlider.value());
        createTableauLED();
    }
    
    drawLEDs(false);
    image(bgImgAlpha, 0, 0);
    
    drawSpectrum();
    drawVolume();
    
}


function jouerSon(){
    sonChoisi = radio.value();

    if (sonChoisi != 0){
        let selectedSound = sounds[sonChoisi];
        print("selectedSound : " + selectedSound + " |sounds : " + sounds + " | sonChoisi :" + sonChoisi);
        if (selectedSound.isPlaying()) {
            selectedSound.pause();
        } else {
            selectedSound.loop();
        }
        
    }
    
    
}


function createTableauLED(){
    tableauLED = [];
    
   for(let x = 0; x < nombreLEDs[0]; x++){
       let ligne = [];  
        for(let y = 0; y < nombreLEDs[1]; y++){
           ligne.push(pingPongBallColor);
       }
       tableauLED.push(ligne);
   }
    
}


function drawLEDs(drawBackground){

    let leftTopCorner = [190,120];
    let size = [625,350];
    
    if(drawBackground){
        fill(color(255,0,0,150));
        rect(leftTopCorner[0], leftTopCorner[1], size[0], size[1]);
    }
    
    let ecart = [size[0]/(nombreLEDs[0]-1), size[1]/(nombreLEDs[1]-1)];
    
    for (let LEDx = 0; LEDx < nombreLEDs[0]; LEDx ++){
        for (let LEDy = 0; LEDy < nombreLEDs[1]; LEDy ++){
            fill(pingPongBallColor);
            noStroke();
            ellipse(leftTopCorner[0] + LEDx*ecart[0], leftTopCorner[1] + LEDy*ecart[1], pingPongBallSize, pingPongBallSize);
        }
    }
}


function drawSpectrum(){
    let spectrum = fft.analyze();
    stroke(colorGraph);
    fill(colorGraph);
    for (let i = 0; i< int(spectrum.length*0.8); i++){ // *0.8 pour prendre que les 80% des fréquences les plus basses du spectre audible
    let x = map(i, 0, int(spectrum.length*0.8), 0, width);
        let h = height - map(spectrum[i], 0, 255, 0, 300);
        let xx = map(spectrum[i], 0, 255, -10, 6);
        let amplitudeModif = int( (1 / ( 1 + exp(-xx))) * 255);
        let barColor = color(amplitudeModif+20,amplitudeModif*0.5+20,20);
        
        let h_modif = height - map(amplitudeModif, 0, 255, 0, 300);
        noStroke();
        fill(255);
        rect(x, height, width / (spectrum.length*0.8), h - 900 );
        stroke(barColor);
        fill(barColor);
        rect(x, height, width / (spectrum.length*2), h_modif - 900 );
    }
}


function drawVolume(){
    let posTextVolume = [830,630];
    textSize(30);
    textFont(fontOG);
    text("hiMid Volume : " + int(fft.getEnergy("highMid")), posTextVolume[0], posTextVolume[1] );
    
}