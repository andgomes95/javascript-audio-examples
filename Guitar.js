var midi = [];
for (var i = 0; i < 127; i++){
   var arg = ((parseFloat(i) - 69.0)/12.0);
   midi[i] = Math.pow(2.0, arg) * 440.0;
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
function Envelope(context, a, d, s, r, g) {
  this.node = context.createGain()
  this.context = context;
  this.node.gain.value = 0;
  this.a = a / 1000.0;
  this.d = d / 1000.0;
  this.s = s / 1000.0;
  this.r = r / 1000.0;
  this.g = g;
}

Envelope.prototype.play = function(obj) {
   var time = this.context.currentTime;
   // Zero
   this.node.gain.linearRampToValueAtTime(0, time);
   // Attack time
   time += this.a;
   this.node.gain.linearRampToValueAtTime(1, time);
   // Decay time
   time += this.d;
   this.node.gain.linearRampToValueAtTime(0.5, time);
   // Sustain time (do nothing)
   time += this.s;
   // Release time
   time += this.r;
   this.node.gain.linearRampToValueAtTime(0, time);
   var note_time = this.a + this.d + this.s + this.r;
   note_time *= 1000.0;
   setTimeout(function(){obj.stop()}, note_time);
};

Envelope.prototype.connect = function(src) {
  this.node.connect(src);
};

Envelope.prototype.disconnect = function() {
  this.node.disconnect();
};


//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
function makeDistortionCurve( amount ) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
function Guitar(context){
   this.context = context;
   this.node = this.context.createScriptProcessor(4096, 0, 1);
   this.envelope = new Envelope(context, 200, 90, 500, 350, 0.7);
   this.volume = this.context.createGain();
   this.distortion = this.context.createWaveShaper();
}

Guitar.prototype.stop = function(time){
   this.node.disconnect();
   this.envelope.disconnect();
}


Guitar.prototype.play = function(note) {

   var frequency = midi[note];
   var impulse = 0.0001 * this.context.sampleRate;

   var N = Math.round(this.context.sampleRate / frequency);
   var y = new Float32Array(N);
   var n = 0;
   this.node.onaudioprocess = function (e) {
     var output = e.outputBuffer.getChannelData(0);
     for (var i = 0; i < e.outputBuffer.length; ++i) {
       var xn = (--impulse >= 0) ? Math.random()-0.5 : 0;
       output[i] = y[n] = xn + (y[n] + y[(n + 1) % N]) / 2;
       if (++n >= N) n = 0;
     }
   }
   
   this.volume.gain.value = 2;

   this.distortion.curve = makeDistortionCurve(1000);

   this.volume.connect(context.destination);
   this.distortion.connect(this.volume);
   this.envelope.connect(this.distortion);
   this.node.connect(this.envelope.node);
   this.envelope.play(this);
}

