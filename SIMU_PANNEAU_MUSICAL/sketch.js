let nombreLEDs = [17,10];
let resolution = 50;
let pingPongBallSize = 14;

let audioSpectrum;
let bassVolume = 0;

let defaultLEDColor = [50,255,50]; // Si couleur = (0,0,0), led éteinte par défaut

let t = 0; // Augmente en f° des aigus
let t_special = 0; // Augmente en f° des graves
let timeIncrement = 0.0001;


let fontOG;

let sounds_mp3 = ["Fatima Yamaha - Whats a girl to do.mp3", "Fatima Yamaha - Whats a girl to do.mp3", "Yaeji - Raingurl.mp3","Justice - Genesis.mp3", "MIA - Paper Planes.mp3"];
//sounds_mp3 = ["MIA - Paper Planes.mp3", "MIA - Paper Planes.mp3"];
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

let leftTopCorner = [190,120]; // Position du coin haut gauche du panneau
let sizePanel = [625,350]; // Taille en pixel du panneau
let ecart = []; // Ecart des LEDs sur chaque axe, calculé dans le setup()

// COLORS
let bgColor;
let pingPongBallColor;
let graphBgColor;
let colorGraph;    
//-- END COLORS

let cornerLines = [];


class LED{
    
    constructor(LEDColor, LEDPosition, LEDSize){
        this.color = LEDColor;
        this.positionMat = LEDPosition; // Position sur la matrice
        this.position = [leftTopCorner[0] + this.positionMat[0]*ecart[0], leftTopCorner[1] + this.positionMat[1]*ecart[1]]; // Position sur l'écran (découle de la position sur la matrice)
        this.size = LEDSize;
        this.isOn = true;
		this.colorSum = 0; // Permet d'avoir un équivalent de la luminosité de la LED, pour définir le rayon du halo lumineux.
    }
    
    showLED(){
        //this.newColor = color(255,0,0);
        noStroke();
        if(this.isOn){
            this.newColor = color(red(this.color),green(this.color),blue(this.color),30);
			this.colorSum = map( red(this.color) + green(this.color) + blue(this.color), 0, 400, 0, 100)*0.01; 
			fill(this.newColor);
            ellipse(this.position[0] , this.position[1], this.size*5*this.colorSum, this.size*5*this.colorSum); // Créer l'effet de halo

			fill(this.color);
			ellipse(this.position[0] , this.position[1], this.size, this.size);
        }
        
		else{
			this.newColor = color(defaultLEDColor[0],defaultLEDColor[1],defaultLEDColor[2],30);
			this.colorSum = map( defaultLEDColor[0] + defaultLEDColor[1] + defaultLEDColor[2], 0, 400, 0, 100)*0.01; 
			fill(this.newColor);
            ellipse(this.position[0] , this.position[1], this.size*2*this.colorSum + bassVolume*2, this.size*2*this.colorSum + bassVolume*2); // Créer l'effet de halo

			fill(color(defaultLEDColor[0], defaultLEDColor[1], defaultLEDColor[2]));
			ellipse(this.position[0] , this.position[1], this.size, this.size);
		}
        
                
    }
    
    updateColor(newColor){
        if (red(newColor) + green(newColor) + blue(newColor) != 0){ // red(x) >= 0, green(x) >= 0 & blue(x) >= 0
            this.color = newColor;
            this.isOn = true;
        }
        else{
            this.color = color(255,255,255);
            this.isOn = false;
        }
        
        this.showLED();
    }
}

class CornerLine{
    // Offre 4 possibilités : Départ coin gauche supérieur ou inférieur ou départ coin droit supérieur ou inférieur
    // Coins de départ supérieur gauche : Type 1, puis après dans le sens des aiguilles d'une montre
    // Il faut voir la droite comme une droite d'équation :  y = this.a * x + this.b 
    
    constructor(lineType, lineSpeed, lineOffset){ // coinDepart = 1, 2 , 3 ou 4
        
        this.type = lineType;
        this.speed = lineSpeed;
        this.offset = lineOffset;
        this.a = 0;
        this.b = 0;
        
        switch(this.type){
            case 1:
                this.a = -1;
                break;
            case 2:
               this.a = 1;
               break;
            case 3:
               this.a = -1;
               break;
            case 4:
               this.a = 1;
               break;
            default:
                print("CornerLine :: lineType doit être compris entre 1 et 4 !");
		}  

	}
    
    updateLine(showPrimitive){
        
        
        switch(this.type){
            case 1:
                this.b = (t*this.speed)%(3*nombreLEDs[1]*resolution) + 0*nombreLEDs[1]*resolution + this.offset;
                break;
            case 2:
               this.b = (t*this.speed)%(3*nombreLEDs[1]*resolution) - 2*nombreLEDs[1]*resolution + this.offset;
               break;
            case 3:
               this.b = (-t*this.speed)%(3*nombreLEDs[1]*resolution) + 3*nombreLEDs[1]*resolution + this.offset;
               break;
            case 4:
               this.b = (-t*this.speed)%(3*nombreLEDs[1]*resolution) + 1*nombreLEDs[1]*resolution + this.offset;
               break;
       }
        
        if (showPrimitive){
            //drawLine(this.a,this.b);     // type 2
        }
       
    }
    
}

function preload(){
    bgImg = loadImage("fichiers/image_SIMU.jpg");
    bgImgAlpha = loadImage("fichiers/image_SIMU_alpha.png");
    fontOG = loadFont('fichiers/font_og.otf');
    for (let i = 0; i < sounds_mp3.length; i++){
        sounds.push(loadSound("fichiers/" + sounds_mp3[i]));
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
    
    //inputTailleX = createInput("17");
    //inputTailleY = createInput("10");
    
    radio = createRadio();
    for (let i = 1; i < sounds_mp3.length; i++){
        radio.option(split(sounds_mp3[i], '.')[0],str(i));
    }
    
    
    // -- END RAW UI
    
    
    // OTHERS
    sonChoisi = "0";
    ecart = [sizePanel[0]/(nombreLEDs[0]-1), sizePanel[1]/(nombreLEDs[1]-1)];
    
    cornerLines[0] = new CornerLine(4,20, 0);
    cornerLines[1] = new CornerLine(2,20, 0);
    cornerLines[2] = new CornerLine(1,30, 290);
    cornerLines[3] = new CornerLine(3,30, 200);
    
    fft = new p5.FFT(0.85,64);
    createTableauLED();
    updateMatrix(cornerLines);
    
    //-- OTHERS
    
    
}


function draw() {

	audioSpectrum = fft.analyze();

    background(bgColor);
    image(bgImg, 0, 0);
    
    
    
    graph.noStroke();
    image(graph, 0, 700, 1000, 200);
    
    // ACTUALISATION TAILLE TABLEAU
    
    /*if ( (tableauLED.length != int(inputTailleY) || tableauLED[0].length != int(inputTailleX) )){
        nombreLEDs = [inputTailleX.value(),inputTailleY.value()];
        createTableauLED();
    }*/
    
    // -- FIN ACTUALISATION TAILLE TABLEAU
    
    
    if (sonChoisi != 0){
        sounds[sonChoisi].amp(volumeSlider.value());
        createTableauLED();
    }
    
    //drawLEDs(false);
    
    for(let lineIndex = 0; lineIndex < cornerLines.length; lineIndex ++){
        cornerLines[lineIndex].updateLine(false);
    }
    
    turnOffAllLEDs();
    
    updateMatrix(cornerLines);
    
    
    image(bgImgAlpha, 0, 0); // Affichage du pian's DJ à l'avant plan
    
    //drawSpectrum(); // Affichage du spectre audio
    drawVolume(); // Affichage numérique du volume
    
    t += timeIncrement*3000 + int(timeIncrement*fft.getEnergy("mid","treble")*sq(fft.getEnergy("treble")*0.6)*0.02);
	t_special += bassVolume;

	if( int(t_special/100)%2 == 0){
		defaultLEDColor = [255,255,0];
	}
	else{
		defaultLEDColor = [50,255,50];
	}
    
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
            
            let LEDObject = new LED(pingPongBallColor, [x, y], pingPongBallSize);
            ligne.push(LEDObject);

       }
       tableauLED.push(ligne);
   }
    
}

function updateMatrix(listeFigures){
    
    for(let lineIndex = 0; lineIndex < listeFigures.length; lineIndex ++){
        //print(lineIndex);
        let selectedLineSlope = listeFigures[lineIndex].a;
        let selectedLineB = listeFigures[lineIndex].b;
        
        for (let CaseX = 0; CaseX < nombreLEDs[0]; CaseX ++){
            for (let CaseY = 0; CaseY < nombreLEDs[1]; CaseY ++){
                if(distanceCaseDroite(tableauLED[CaseX][CaseY], selectedLineSlope, selectedLineB) < 20){ // 20 : déterminé arbitrairement
                   tableauLED[CaseX][CaseY].updateColor(color(255,0,215));
                   }
                /*else{
                   tableauCase[CaseX][CaseY].updateColor(color(0,0,0)); 
                }*/
                tableauLED[CaseX][CaseY].showLED(); 
            }
        }
    }
    
}


function turnOffAllLEDs(){
    for (let CaseX = 0; CaseX < nombreLEDs[0]; CaseX ++){
        for (let CaseY = 0; CaseY < nombreLEDs[1]; CaseY ++){ 
            tableauLED[CaseX][CaseY].updateColor(color(0,0,0)); 
        }
    }
}


/*function drawLEDs(drawBackground){
    // drawBackground : booléen,  permet de vérifier si le cadre paramétré par (leftTopCorner et sizePanel) 
    if(drawBackground){
        fill(color(255,0,0,150));
        rect(leftTopCorner[0], leftTopCorner[1], sizePanel[0], sizePanel[1]);
    }
    
    for (let LEDx = 0; LEDx < nombreLEDs[0]; LEDx ++){
        for (let LEDy = 0; LEDy < nombreLEDs[1]; LEDy ++){
           tableauLED[LEDx][LEDy].showLED(); 
        }
    }

}*/


function drawSpectrum(){
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
	fill(30);
    textSize(30);
    textFont(fontOG);
    text("Mid+ Volume : " + int(fft.getEnergy("mid","treble")), posTextVolume[0], posTextVolume[1] );

	posTextVolume = [830,680];
	fill(30);
    textSize(30);
    textFont(fontOG);
	bassVolume = int(fft.getEnergy("bass")-240);
	if (bassVolume < 0){
		bassVolume = 0;
	}
    text("Low Volume : " + bassVolume, posTextVolume[0], posTextVolume[1] );
    
}

function drawLine(a,b, lineColor = color(255,20,20,100)){ //Dessine une ligne d'équation y = a*x + b
    stroke(lineColor);
    strokeWeight(10);
    line(0,b,nombreLEDs[0]*resolution, a*nombreLEDs[0]*resolution + b);
}

function distanceCaseDroite(selectedCase, aD, bD){  // Droite d'équation y = aD * x + bD
    
    let dist = 0;
    let coordPt = selectedCase.position;
    dist = abs(aD * coordPt[0] - 1 * coordPt[1] + bD ) / sqrt(aD*aD + 1);
    return dist;
    
}