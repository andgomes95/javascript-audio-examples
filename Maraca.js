var midi = [];
for (var i = 0; i < 127; i++){
   var arg = ((parseFloat(i) - 69.0)/12.0);
   midi[i] = Math.pow(2.0, arg) * 440.0;
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
WhiteNoise = function(context) {
  var that = this;
  this.x = 0; // Initial sample number
  this.context = context;
  this.node = context.createScriptProcessor(1024, 0, 1);
  this.node.onaudioprocess = function(e) { that.process(e) };
}

WhiteNoise.prototype.process = function(e) {
  var data = e.outputBuffer.getChannelData(0);
  for (var i = 0; i < data.length; ++i) {
      data[i] = (Math.random() * 2) - 1;
  }
}

WhiteNoise.prototype.connect = function(src) {
  this.node.connect(src);
}


WhiteNoise.prototype.stop = function() {
  this.node.disconnect();
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
function Maraca(context){
   this.context = context;
   this.envelope = new Envelope(context, 40, 0, 10, 80, 0.5);
   this.filter = context.createBiquadFilter();
   this.whiteNoise = new WhiteNoise(this.context);
   this.lfo = context.createOscillator();
   this.lfo_gain = context.createGain();
}

Maraca.prototype.stop = function(time){
   this.lfo.stop(0);
   this.envelope.disconnect();
   this.whiteNoise.stop(0);
}


Maraca.prototype.play = function(note) {
   this.lfo.frequency.value = 1;
   this.lfo.connect(this.lfo_gain);
   this.lfo.start(0);

   this.lfo_gain.gain.value = 2000;
   this.lfo_gain.connect(this.filter.frequency);

   this.filter.type = 'bandpass';
   this.filter.frequency.value = 200;
   this.filter.gain.value = 20;
   this.filter.Q.value = 0.2;
   this.filter.connect(this.envelope.node);

   this.envelope.connect(this.context.destination);
   this.envelope.play(this);

   this.whiteNoise.connect(this.filter);
}

