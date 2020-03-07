const NOTE_STEP = Math.pow(2, 1/12);

const A0_FREQ = 27.5;

function decodeFile(file) {
	console.log("decoding");

	var data = new DataView(file);
	
	var chunkId = String.fromCharCode.apply(String, [data.getUint8(0), data.getUint8(1), data.getUint8(2), data.getUint8(3)]);
	var chunkLen = data.getUint32(4);
 	
 	var format = data.getUint16(8);
 	var ntracks = data.getUint16(10);
 	var tickdiv = data.getUint16(12);

 	if (tickdiv & 0x8000 != 0) {
 		alert("Timecodes not implemented yet");
 		return;
 	}

 	if (format != 1) {
 		alert("Format not implemented yet");
 		return;
 	}

 	var ppqn = tickdiv & 0x7fff;

	chunkLen = data.getUint32(18);

	var start = 14;

	var i = start;

	function readChunk() {
		console.log("reading");

		chunkId = String.fromCharCode.apply(String,
			[data.getUint8(i), data.getUint8(i+1), data.getUint8(i+2), data.getUint8(i+3)]);

		if (chunkId != "MTrk") {
			alert("Malformed track chunk");
			return;
		}

		chunkLen = data.getUint32(i+4);

		start = i + 8;
		i = start;

		let events = [];
		let lastStatus = 0;

		let dt = 0;
		let time = 0;

		while(i < start + chunkLen - 1) {
			var next = data.getUint8(i++);

			dt = (dt << 7) | (next & 0x7f);
			if ((next & 0x80) == 0) {
				time += dt;
				dt = 0;
				event = {"time" : time};

				event["status"] = data.getUint8(i++);
				if (event["status"] < 128) {
					event["status"] = lastStatus;
					i--;
				} else {
					lastStatus = event["status"];
				}

				switch(event["status"] >> 4) {
					case 0x8:
						event["channel"] = event["status"] & 0xF;
						event["key"] = data.getUint8(i++);
						event["velocity"] = data.getUint8(i++);
						break;
					case 0x9:
						event["channel"] = event["status"] & 0xF;
						event["key"] = data.getUint8(i++);
						event["velocity"] = data.getUint8(i++);
						break;
					case 0xA:
						i+=2;
						break;
					case 0xB:
						i+=2;
						break;
					case 0xC:
						i+=1;
						break;
					case 0xD:
						i+=1;
						break;
					case 0xE:
						i+=2;
						break;
					case 0xF:
						if (event["status"] == 0xFF) {
							let opt = data.getUint8(i++);
							event["status"] = 0xFF00 | opt;
							//console.log("New meta event: " + opt + " " + data.getUint8(i) + " " + (i - 1 - start));
							switch(opt) {
								case 0x51:
									i++;
									let tempo = data.getUint8(i++);
									tempo = (tempo << 8) | data.getUint8(i++);
									tempo = (tempo << 8) | data.getUint8(i++);

									BPM = 60000000/tempo;

									let timeStep = tempo / (1000000 * ppqn);

									event["step"] = timeStep;

									break;
								default:
									var length = data.getUint8(i++);
									i+=length;
							}	
						}
						
						break;
					default:
						alert("Something broke.");
						console.log("ERROR");
						return;
				}

				events.push(event);
				
				
			}
			
		}
		i = start + chunkLen;
		return events;
	}

	function mergeStreams(a, b) {
		var i = 0;
		while (b.length > 0) {
			if (a[i] == undefined || b[0]["time"] < a[i]["time"]) {
				a.splice(i, 0, b.shift());
			}

			i++
		}

		return a;
	}

	let stream = readChunk();

	console.log("length: " + stream.length);
	for (let n = 1; n < ntracks; n++) {
		let track = readChunk();
		mergeStreams(stream, track);
	}

	const DEFAULT_BPM = 120;
	let track = compileMidi(stream, 60 / (DEFAULT_BPM*ppqn));

	console.log("Duration: " + track.duration);

	console.log("done decoding");
	return track;
}

function midiToFreq(note) {
	return A0_FREQ * Math.pow(2, (note-21)/12);
}

function compileMidi(events, timeStep) {
	console.log("compiling");

	let notes = [];
	let openNotes = {};

	let time = 0;
	let lastTime = 0;
	let endTime = 0;

	for (let i = 0; i < events.length; i++) {
		let event = events[i];
		time += timeStep * (event["time"] - lastTime);
		lastTime = event["time"];

		if (event["status"] == 0xFF51) {
			// Change tempo
			timeStep = event["step"];

			//console.log("new timeStep: " + timeStep);
		} else if (event["status"] >> 4 == 0x9 && event["velocity"] != 0) {
/*
			let note = {
				"start" : time,
				"key" : event["key"],
				"channel" : event["channel"],
				"velocity" : event["velocity"]
			};
*/
			let note = new Note(
				event["channel"],
				event["key"],
				event["velocity"],
				time
			);

			let noteId = event["channel"] + " " + event["key"];
			let noteIndex = notes.push(note) - 1;			

			if (noteId in openNotes && openNotes[noteId].length > 0) {
				//console.log("Warning: Note already open (" + noteId + ") " + time);
			} else {
				openNotes[noteId] = [];
			}
			openNotes[noteId].push(noteIndex);
		} else if ((event["status"] >> 4 == 0x8) || (event["status"] >> 4 == 0x9 && event["velocity"] == 0)) {
			// Close note

			endTime = time;

			let noteId = event["channel"] + " " + event["key"];
			if (noteId in openNotes && openNotes[noteId].length > 0) {
				let noteIndex = openNotes[noteId].shift();
				notes[noteIndex].close(time);

				//delete openNotes[noteId];
			} else {
				console.log("Warning: Note already closed (" + noteId + ")");
			}
		} else {
			//console.log("Warning: Unsupported event (" + event["status"] + ")");
		}
	}

	for (let note in openNotes) {
		if (openNotes[note].length == 0) continue;
		console.log("Warning: Note left open (" + note + ")");
	}

	console.log("done compiling");
	return new Track(notes, endTime);
}

function Note(channel, key, vel, start, end) {
	this.channel = channel;
	this.key = key;
	this.vel = vel;

	this.start = start;
	this.end = end || null;

	this.freq = midiToFreq(key);
	this.duration = end && (end - start) || null;

	this.close = function(end) {
		this.end = end;
		this.duration = end - start;
	}
}

function Track(notes, duration) {
	this.notes = notes || [];
	this.duration = duration || null;
}