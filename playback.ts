//import {Renderer} from "./render";

enum states {
	STOPPED,
	PLAYING,
	PAUSED,
};

class Player {
	private static VOLUME: number = 0.2;
	private static PLAYBACK_DELAY: number = 2;

	public static states = states;
	public state: states = states.STOPPED;

	//public renderer: Renderer = null;

	private nextEvent: number;
	private startTime: number;

	private audioCtx: AudioContext;

	private waves: Wave[] = [];


	constructor(public renderer?: Renderer) {
		if (renderer) renderer.player = this;
		this.audioCtx = new window.AudioContext
		this.audioCtx.suspend();
	}

	public getTime() {
		return this.audioCtx.currentTime - this.startTime;
	}

	private getWave() {
		var wave = this.waves.shift();
		if (wave == undefined) {
			//console.log("New wave " + (++wc));
			wave = new Wave(this.audioCtx);
		}

		wave.vol.connect(this.audioCtx.destination);

		return wave;
	}

	public play(track) {
		console.log("playing");
		if (this.state = states.PLAYING) {
			this.stop();
		}

		this.startTime = this.audioCtx.currentTime + Player.PLAYBACK_DELAY;

		this.state = states.PLAYING;

		

		var wc = 0;

		// TODO: Percussion as sine?

		//TODO: HANDLE MULTIPLE IN ONE PASS

		let noteI = -1;

		// TODO: let this access this, or remove it
		let playMidi_r = function() {
			let curTime = this.getTime();

			//console.log(curTime + " sec");

			//while (keys[0] != undefined && (keys[0]["start"] <= (audioCtx.currentTime + 0.1))) {
			//do {
				//console.log("note");
			//var note = track.notes.shift();
			let note = track.notes[++noteI];
			//
			//console.log(curTime);

			if ((note.start - curTime) >= 0.1) {
				console.log("Warning: Excessive note latency - " + (noteI));
			}

			let wave = this.getWave();
			wave.osc.frequency.value = note.freq;

			//let bassBoost = (1+399*(110 - note["key"])/110) / 400;
			let bassBoost = (1 + 3*Math.pow((110-note.key)/87, 2)) / 4;
			//bassBoost = 1;

			let volume = bassBoost * Player.VOLUME * note.vel / 127;
			//console.log(volume);
			//console.log(note["key"] + " " + note["velocity"]);

			wave.vol.gain.setTargetAtTime(volume, note.start + this.startTime, 0.005);
			
			//wave["vol"].gain.value = VOL
			//wave["vol"].gain.value = VOLUME;
			if (note.end - curTime > 0.25) {
				wave.vol.gain.setTargetAtTime(volume/10, note.start + this.startTime + 0.2, 0.6);
			}
			
			//console.log(note["key"]);
			wave.vol.gain.setTargetAtTime(0, note.end + this.startTime, 0.005);
			wave.vol.gain.cancelScheduledValues(note.end + this.startTime + 0.05);
			//wave["vol"].gain.setValueAtTime(0, note["end"] + 0.1);

			setTimeout(function() {
					//wave["vol"].gain.cancelScheduledValues(0);
					//wave["vol"].gain.value = 0;
					wave.vol.disconnect(this.audioCtx.destination);
					this.waves.push(wave);
			}.bind(this), (note.end - curTime)*1000 + 100);

			//console.log(keys[0]["start"]);
			//} while(keys[0]["start"] == key["start"]);

			//console.log("c: "+keys.length);
			if (noteI < track.notes.length - 1) {
				this.nextEvent = setTimeout(playMidi_r, (track.notes[noteI + 1].start - curTime)*1000);
				//console.log("next");
			} else {
				setTimeout(function() {
					this.stop();
				}, (note.end - curTime)*1000);
			}
		}.bind(this);

		for (var i = 0; i < 20; i++) {
			this.waves.push(new Wave(this.audioCtx));
		}

		this.audioCtx.resume().then(function() {
			console.log("start " + ((track.notes[0].start - this.getTime())*1000));
			this.nextEvent = setTimeout(playMidi_r, (track.notes[0].start - this.getTime())*1000, 0);
		}.bind(this));
	}

	public stop() {
		console.log("stopping");
		console.log(this.nextEvent)
		clearTimeout(this.nextEvent);
		this.nextEvent = undefined;
		this.state = states.STOPPED;

		this.audioCtx.suspend();
	}
}

class Wave {
	public osc: OscillatorNode;
	public vol: GainNode;
	
	constructor(audioCtx: AudioContext) {
		this.osc = audioCtx.createOscillator();
		this.vol = audioCtx.createGain();

		this.osc.type = "triangle";
		this.vol.gain.value = 0;

		this.osc.connect(this.vol);
		this.osc.start();
	}
}