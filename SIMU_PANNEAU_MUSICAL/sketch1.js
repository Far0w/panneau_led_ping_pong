function preload(){
  sound = loadSound('raingurl.mp3');
}

function setup(){
  let cnv = createCanvas(1000,1000);
  cnv.mouseClicked(togglePlay);
  fft = new p5.FFT(0.7,64);
  sound.amp(0.2);
}

function draw(){
  background(220);

  let spectrum = fft.analyze();
  noStroke();
  fill(255, 0, 255);
  for (let i = 0; i< spectrum.length; i++){
    let x = map(i, 0, spectrum.length, 0, width);
    let h = -height + map(spectrum[i], 0, 255, height, 0);
    rect(x, height, width / spectrum.length, h )
  }

  stroke(20);
  fill(color(20,20,20))

  text('tap to play', 20, 20);
}

function togglePlay() {
  if (sound.isPlaying()) {
    sound.pause();
  } else {
    sound.loop();
  }
}