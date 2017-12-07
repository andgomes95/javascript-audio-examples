
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
   this.node.gain.cancelScheduledValues(time);
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
function Harpsichord(context){
   this.context = context;
   this.envelope = new Envelope(context, 100, 54, 3, 50, 0.5);
}

Harpsichord.prototype.play = function(note) {
   var modulator_gain = 20000;
   var modulator_freq = 1;
   var carrier_freq = midi[note];

   this.carrier = this.context.createOscillator();
   this.modulator = this.context.createOscillator();
   this.modulatorGain = this.context.createGain();

   this.carrier.frequency.value = carrier_freq;
   this.modulator.frequency.value = (carrier_freq * modulator_freq);
   this.modulatorGain.gain.value = modulator_gain;

   this.carrier.connect(this.envelope.node);
   this.modulator.connect(this.modulatorGain);
   this.modulatorGain.connect(this.carrier.frequency);
   this.envelope.connect(this.context.destination);

   this.carrier.start(0);
   this.modulator.start(0);
   this.envelope.play(this);
};


Harpsichord.prototype.stop = function(){
   this.carrier.stop(0);
   this.modulator.stop(0);
   this.carrier.disconnect();
   this.modulator.disconnect();
   this.envelope.disconnect();
};
