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
   this.node.gain.linearRampToValueAtTime(0, time);
   time += this.a;
   this.node.gain.linearRampToValueAtTime(1, time);
   time += this.d;
   this.node.gain.linearRampToValueAtTime(this.g, time);
   time += this.s;
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
function Block(context){
   this.context = context;
   this.envelope = new Envelope(context, 2, 10, 30, 100, 0.5);
}

Block.prototype.play = function(note) {
   this.oscillator = this.context.createOscillator();
   this.oscillator.type = 'sine';
   this.oscillator.frequency.value = midi[note];
	this.oscillator.connect(this.envelope.node);
   this.envelope.connect(this.context.destination);
   this.oscillator.start(0);
   this.envelope.play(this);
};

Block.prototype.stop = function(){
	this.oscillator.stop(0);
	this.oscillator.disconnect();
   this.envelope.disconnect();
};

