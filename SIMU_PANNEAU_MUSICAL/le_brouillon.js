let matrixSize = [17,10];
let resolution = 50;
let tableauCase = [];

let t = 0;
let timeIncrement = 1;

let cornerLines = [];

class Case{ // Il faudra dans le futur combinée la classe Case et la classe LED, elles possèdent les mêmes paramètres à l'exception de la position, pour les LED la position rps sa position en pixels dans le canva, alors que pour la case elle représente sa position dans le tableau.
    
    constructor(casePosition, caseColor){
        this.color = caseColor;
        this.position = casePosition;
        this.isOn = true;
        this.center = [this.position[0]*resolution + int(resolution/2), this.position[1]*resolution + int(resolution/2)]
    }
    
    showCase(){
        //this.newColor = color(255,0,0);
        noStroke();
        
        fill(this.color);
        ellipse(this.center[0], this.center[1], resolution/5, resolution/5);
                
    }
    
    updateColor(newColor){
        if (red(newColor) + green(newColor) + blue(newColor) != 0){
            //print(newColor);
            this.color = newColor;
        }
        else{
            this.color = color(255,255,255);
            this.isOn = false;
        }
        
        this.showCase();
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
                print("CornerLine :: lineType doit être compris entre 1 et 4!");
       }  

   }
    
    updateLine(showPrimitive){
        
        
        switch(this.type){
            case 1:
                this.b = (t*this.speed)%(3*matrixSize[1]*resolution) + 0*matrixSize[1]*resolution + this.offset;
                break;
            case 2:
               this.b = (t*this.speed)%(3*matrixSize[1]*resolution) - 2*matrixSize[1]*resolution + this.offset;
               break;
            case 3:
               this.b = (-t*this.speed)%(3*matrixSize[1]*resolution) + 3*matrixSize[1]*resolution + this.offset;
               break;
            case 4:
               this.b = (-t*this.speed)%(3*matrixSize[1]*resolution) + 1*matrixSize[1]*resolution + this.offset;
               break;
       }
        
        if (showPrimitive){
            drawLine(this.a,this.b);     // type 2
        }
       
    }
    
}

function setup(){
    
    createCanvas(matrixSize[0] * resolution, matrixSize[1] * resolution); 
    background(240);
    createTableau();
    
    cornerLines[0] = new CornerLine(4,20, 0);
    cornerLines[1] = new CornerLine(2,20, 90);
    cornerLines[2] = new CornerLine(4,30, 290);
    cornerLines[3] = new CornerLine(2,30, 200);

}

function draw(){
    
    background(240);
    
    drawTableau();
    
    for(let lineIndex = 0; lineIndex < cornerLines.length; lineIndex ++){
        cornerLines[lineIndex].updateLine(true);
    }
    
    turnOffAllLEDs();
    
    updateTableau(cornerLines);
    
    t += timeIncrement;
    
}


function createTableau(){
    
    tableauCase = [];
    
    for(let x = 0; x < matrixSize[0]; x++){
        let ligne = [];  
    for(let y = 0; y < matrixSize[1]; y++){
        
        let CaseObject = new Case([x,y], color(0,0,0));
        ligne.push(CaseObject);
        
       }
        
       tableauCase.push(ligne);
   }
    
}


function drawTableau(){
    
    stroke(0);
    strokeWeight(2);
    
    for (let CaseX = 0; CaseX < matrixSize[0]; CaseX ++){
        line(CaseX*resolution,0,CaseX*resolution,matrixSize[1]*resolution); // Affiche les lignes horizontales du tableau 
        for (let CaseY = 0; CaseY < matrixSize[1]; CaseY ++){
            if(CaseX == 1){
                line(0,CaseY*resolution, matrixSize[0]*resolution, CaseY*resolution); // Affiche les lignes verticales du tableau,la condition CaseX == 1 choisie car vérifiée qu'1 seule fois
               }
            /*if(distanceCaseDroite(tableauCase[CaseX][CaseY], -1, t%(3*matrixSize[1]*resolution) - 2*matrixSize[1]*resolution) < 20){
               tableauCase[CaseX][CaseY].updateColor(color(255,0,0));
               }
            else{
               tableauCase[CaseX][CaseY].updateColor(color(0,0,0)); 
            }*/
            tableauCase[CaseX][CaseY].showCase(); 
        }
    }
    
}

function updateTableau(listeFigures){
    
    for(let lineIndex = 0; lineIndex < listeFigures.length; lineIndex ++){
        print(lineIndex);
        let selectedLineSlope = listeFigures[lineIndex].a;
        let selectedLineB = listeFigures[lineIndex].b;
        
        for (let CaseX = 0; CaseX < matrixSize[0]; CaseX ++){
            for (let CaseY = 0; CaseY < matrixSize[1]; CaseY ++){
                if(distanceCaseDroite(tableauCase[CaseX][CaseY], selectedLineSlope, selectedLineB) < 20){ // 20 : déterminé arbitrairement
                   tableauCase[CaseX][CaseY].updateColor(color(255,0,0));
                   }
                /*else{
                   tableauCase[CaseX][CaseY].updateColor(color(0,0,0)); 
                }*/
                tableauCase[CaseX][CaseY].showCase(); 
            }
        }
    }
    
}

function turnOffAllLEDs(){
    for (let CaseX = 0; CaseX < matrixSize[0]; CaseX ++){
        for (let CaseY = 0; CaseY < matrixSize[1]; CaseY ++){ 
            tableauCase[CaseX][CaseY].updateColor(color(0,0,0)); 
        }
    }
}


function drawLine(a,b, lineColor = color(225,20,20,100)){ //Dessine une ligne d'équation y = a*x + b
    stroke(lineColor);
    strokeWeight(10);
    line(0,b,matrixSize[0]*resolution, a*matrixSize[0]*resolution + b);
}

function distanceCaseDroite(selectedCase, aD, bD){  // Droite d'équation y = aD * x + bD
    
    let dist = 0;
    let coordPt = selectedCase.center;
    dist = abs(aD * coordPt[0] - 1 * coordPt[1] + bD ) / sqrt(aD*aD + 1);
    return dist;
    
}