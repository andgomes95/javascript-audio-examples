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
function Pong(context){
   this.context = context;
   this.oscillator = this.context.createOscillator();
   this.lfo = this.context.createOscillator();
   this.gain = this.context.createGain();
   this.lfo_gain = this.context.createGain();
   this.envelope = new Envelope(context, 10, 10, 10, 10, 0.5);
   this.playing = false;
   this.oscillator.start(0);
   this.lfo.start(0);
}

Pong.prototype.stop = function(time){
//   this.lfo.stop(0);
//   this.oscillator.stop(0);
   this.gain.disconnect();
   this.lfo_gain.disconnect();
   this.oscillator.disconnect();
   this.envelope.disconnect();
   this.playing = false;
}


Pong.prototype.play = function(note) {
   if(this.playing == true)
      return;
   this.playing = true;
   this.lfo_gain.gain.value = 1000;
   this.gain.gain.value = 1;
   this.lfo.frequency.value = 10; // value in hertz
   this.oscillator.type = 'sine';
   this.oscillator.frequency.value = midi[note]; // value in hertz
   this.oscillator.connect(this.envelope.node);
   this.envelope.connect(this.gain);
   this.gain.connect(this.context.destination);
   this.lfo.connect(this.lfo_gain);
   this.lfo_gain.connect(this.oscillator.frequency);
   this.envelope.play(this);
}

