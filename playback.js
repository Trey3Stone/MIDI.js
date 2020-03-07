
function Player() {
	const VOLUME = 0.2;
	const PLAYBACK_DELAY = 2;

	const states = {
		STOPPED: 1,
		PLAYING: 2,
		PAUSED : 3
	};

	let state = states.STOPPED;

	let renderer = null;

	let nextEvent, startTime;

	let audioCtx = new (window.AudioContext || window.webkitAudioContext);
	audioCtx.suspend();

	let waves = [];

	this.getTime = function() {
		return audioCtx.currentTime - startTime;
	}

	this.play = function(track) {
		console.log("playing");
		if (state = states.PLAYING) {
			this.stop();
		}

		startTime = audioCtx.currentTime + PLAYBACK_DELAY;

		state = states.PLAYING;

		

		var wc = 0;

		function Wave() {		
			this.osc = audioCtx.createOscillator();
			this.vol = audioCtx.createGain();

			this.osc.type = "triangle";
			this.vol.gain.value = 0;

			this.osc.connect(this.vol);
			this.osc.start();

			console.log((++wc) + " waves");
		}

		// TODO: Percussion as sine?

		function getWave() {
			var wave = waves.shift();
			if (wave == undefined) {
				//console.log("New wave " + (++wc));
				wave = new Wave();
			}



			wave.vol.connect(audioCtx.destination);

			return wave;
		}

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

			let wave = getWave();
			wave.osc.frequency.value = note.freq;

			//let bassBoost = (1+399*(110 - note["key"])/110) / 400;
			let bassBoost = (1 + 3*Math.pow((110-note.key)/87, 2)) / 4;
			//bassBoost = 1;

			let volume = bassBoost * VOLUME * note.vel / 127;
			//console.log(volume);
			//console.log(note["key"] + " " + note["velocity"]);

			wave.vol.gain.setTargetAtTime(volume, 0, 0.005);
			
			//wave["vol"].gain.value = VOL
			//wave["vol"].gain.value = VOLUME;
			if (note.end - curTime > 0.25) {
				wave.vol.gain.setTargetAtTime(volume/10, note.start + startTime + 0.2, 0.6);
			}
			
			//console.log(note["key"]);
			wave.vol.gain.setTargetAtTime(0, note.end + startTime, 0.005);
			wave.vol.gain.cancelScheduledValues(note.end + startTime + 0.05);
			//wave["vol"].gain.setValueAtTime(0, note["end"] + 0.1);

			setTimeout(function() {
					//wave["vol"].gain.cancelScheduledValues(0);
					//wave["vol"].gain.value = 0;
					wave.vol.disconnect(audioCtx.destination);
					waves.push(wave);
			}, (note.end - curTime)*1000 + 100);

			//console.log(keys[0]["start"]);
			//} while(keys[0]["start"] == key["start"]);

			//console.log("c: "+keys.length);
			if (noteI < track.notes.length - 1) {
				nextEvent = setTimeout(playMidi_r, (track.notes[noteI + 1].start - curTime)*1000);
				//console.log("next");
			} else {
				setTimeout(function() {
					this.stop();
				}, (note.end - curTime)*1000);
			}
		}.bind(this);

		for (var i = 0; i < 20; i++) {
			waves.push(new Wave());
		}

		audioCtx.resume().then(function() {
			console.log("start " + ((track.notes[0].start - this.getTime())*1000));
			nextEvent = setTimeout(playMidi_r, (track.notes[0].start - this.getTime())*1000, 0);
		}.bind(this));
	}

	this.stop = function() {
		console.log("stopping");
		console.log(nextEvent)
		clearTimeout(nextEvent);
		nextEvent = undefined;
		state = states.STOPPED;

		audioCtx.suspend();
	}
}