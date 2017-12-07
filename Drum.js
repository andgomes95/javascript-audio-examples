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
function Drum(context){
   this.context = context;
   this.oscillator = this.context.createOscillator();
   this.gain = this.context.createGain();
   this.envelope = new Envelope(context, 2, 1, 3, 10, 0.5);
}

Drum.prototype.stop = function(time){
   this.oscillator.stop(0);
   this.gain.disconnect();
   this.oscillator.disconnect();
   this.envelope.disconnect();
}


Drum.prototype.play = function(note) {
   this.gain.gain.value = 2;
   this.oscillator.type = 'sine';
   this.oscillator.frequency.value = midi[note]; // value in hertz
   this.oscillator.connect(this.envelope.node);
   this.envelope.connect(this.gain);
   this.gain.connect(this.context.destination);
   this.oscillator.start(0);
   this.envelope.play(this);
}

