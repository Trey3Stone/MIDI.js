//import {Player} from "./playback";

class Renderer {
	private static SIZE_SECONDS: number = 3;

	private static KEY_DRAW_OFFSETS = [
		0,
		1,
		1,
		2,
		2,
		3,
		4,
		4,
		5,
		5,
		6,
		6
	]

	private static NOTES = [
		'c' ,
		'c#',
		'd' ,
		'd#',
		'e' ,
		'f' ,
		'f#',
		'g' ,
		'g#',
		'a' ,
		'a#',
		'b'
	]

	private canvas = <HTMLCanvasElement> document.getElementById("canvas");
	private ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');

	//let noteImage;

	private nextEvent: number;

	constructor(public player?: Player) {
		if (player) player.renderer = this;
		this.refresh();
		this.drawCanvas();
	}

	private refresh() {
		const dpr = window.devicePixelRatio || 1;

		let width = window.innerWidth;
		let height = window.innerHeight;

		this.canvas.style.width = width + "px";
		this.canvas.style.height = height + "px";

		this.canvas.width = width * dpr;
		this.canvas.height = height * dpr;


/*
		let keyWidth = width/52;
		let noteWidth = keyWidth / 3;
		let xOffset = (keyWidth - noteWidth) / 2;
		let yOffset = height / 250;



		makeCapsule(noteWidth, noteHeight);
		this.ctx.shadowBlur = 10;
		this.ctx.stroke(note["path"]);
		*/

	}

	private drawCanvas() {
		console.log("drawing")
		this.ctx.save();

		let width = this.canvas.width;
		const keyWidth = width/52;
		let height = this.canvas.height - Math.ceil(width / 10);

		this.ctx.lineWidth = 0;
		this.ctx.strokeStyle = "rgb(60, 60, 60)";


		this.ctx.beginPath();

		for (let i = 2; i < 52; i+=7) {
			this.ctx.moveTo(i * keyWidth, 0);
			this.ctx.lineTo(i * keyWidth, height);
		}


		for (let i = 0; i < Math.ceil(2*Renderer.SIZE_SECONDS); i++) {
			let y = i / Renderer.SIZE_SECONDS * height / 2;
			this.ctx.moveTo(0, height - y);
			this.ctx.lineTo(width, height - y);
		}

		this.ctx.stroke();


		height = Math.ceil(width / 10);

		this.ctx.translate(0, this.canvas.height - height)

		this.ctx.beginPath();
		this.ctx.rect(0, 0, width, height);
		this.ctx.clip();

		this.ctx.strokeStyle = "rgb(16, 16, 16)";
		
		const keyHeight = height;

		var xFill = 0;
		this.ctx.fillStyle = "rgb(255, 255, 255)";
		
		this.ctx.lineWidth = 2;

		for (var i = 0; i < 88; i++) {
			if (Renderer.NOTES[(9+i)%12][1] == '#') {
				continue;
			}
			
			this.fillRoundedRect(xFill+1, 0, keyWidth-2, keyHeight-2, keyWidth/8);
			xFill = xFill + keyWidth;
		}

		xFill = 0;
		this.ctx.fillStyle = "rgb(0, 0, 0)";

		for (var i = 0; i < 88; i++) {
			if (Renderer.NOTES[(9+i)%12][1] != '#') {
				xFill = xFill + keyWidth;
				continue;
			}

			this.fillRoundedRect(xFill - keyWidth/4, 0, keyWidth/2, keyHeight*0.6-2, keyWidth/8);		
		}

		this.ctx.fillStyle = "rgb(255, 255, 255)";
		this.ctx.lineWidth = 8;
		this.fillRoundedRect(0, 0, width, 4, 2);

		this.ctx.restore();

	}

	private fillRoundedRect(x: number, y: number, w: number, h: number, r: number) {
		this.ctx.save();

		this.ctx.translate(x, y);

		this.ctx.beginPath();
		this.ctx.arc(r, r, r, Math.PI, 3*Math.PI/2);
		this.ctx.arc(w - r, r, r, 3*Math.PI/2, 0);
		this.ctx.arc(w - r, h - r, r, 0, Math.PI/2);
		this.ctx.arc(r, h - r, r, Math.PI/2, Math.PI);

		this.ctx.closePath();

		//ctx.strokeStyle = "rgb(40, 40, 40)";
		
		this.ctx.stroke();

		this.ctx.fill();

		this.ctx.restore();
	}

	private fillLightRect(x, y, w, h, r) {

		//w = Math.max(w, 2*r);
		h = Math.max(h, 2*r);

		this.ctx.save();

		this.ctx.translate(x, y);

		this.ctx.beginPath();
		this.ctx.arc(r, r, r, Math.PI, 3*Math.PI/2);
		this.ctx.arc(w - r, r, r, 3*Math.PI/2, 0);
		this.ctx.arc(w - r, h - r, r, 0, Math.PI/2);
		this.ctx.arc(r, h - r, r, Math.PI/2, Math.PI);

		this.ctx.closePath();

		this.ctx.shadowColor = <string> this.ctx.strokeStyle;
		this.ctx.shadowBlur = 10;

		this.ctx.stroke();

		this.ctx.restore();
	}

	private makeRoundedRect(w, h, r) {
		let path = new Path2D();

		path.arc(r, r, r, Math.PI, 3*Math.PI/2);
		path.arc(w - r, r, r, 3*Math.PI/2, 0);
		path.arc(w - r, h - r, r, 0, Math.PI/2);
		path.arc(r, h - r, r, Math.PI/2, Math.PI);

		path.closePath();

		return path;
	}

	private makeCapsule(w, h) {
		h = Math.max(h, w);
		let r = w/2;

		let path = new Path2D();

		path.arc(r, r, r, Math.PI, 0);
		path.arc(r, h - r, r, 0, Math.PI);

		path.closePath();

		return path;
	}

	private fillKeyBurst(x, y, w, r) {
		const RES = 10;
		const ANG = Math.PI / 4;
		const STEP = 2 * ANG / RES;

		this.ctx.save();
		
		this.ctx.translate(x + w/2, y);

		this.ctx.beginPath();
		this.ctx.moveTo(-w/2, 0);
		this.ctx.arc(0, w/2, r + w/2, -3*Math.PI/4, -Math.PI/4);
		this.ctx.lineTo(w/2, 0);
		this.ctx.closePath();

		let grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, r);
		grad.addColorStop(0, this.ctx.fillStyle + "");
		grad.addColorStop(0.25, this.ctx.fillStyle + "90");
		grad.addColorStop(0.5, this.ctx.fillStyle + "40");
		grad.addColorStop(0.75, this.ctx.fillStyle + "10");
		grad.addColorStop(0.875, this.ctx.fillStyle + "04");
		grad.addColorStop(1, this.ctx.fillStyle + "00");

		this.ctx.fillStyle = grad;

		this.ctx.shadowBlur = 10;
		this.ctx.fill();

		this.ctx.restore();
	}

	public drawNotes(player, track) {
		
		
		const times = [];
		let fps;

		function refreshLoop() {
		  window.requestAnimationFrame(() => {
		    const now = performance.now();
		    while (times.length > 0 && times[0] <= now - 1000) {
		      times.shift();
		    }
		    times.push(now);
		    fps = times.length;
		    console.log(fps);
		    refreshLoop();
		  });
		}

		refreshLoop();

		

		console.log("DRAWING " + this.nextEvent);


		function timeToY(target, current) {
			return height * (1 - (target - current) / Renderer.SIZE_SECONDS);
		}

		let noteI = 0;

		let notes = track.notes;

		let width = this.canvas.width;
		let height = this.canvas.height - Math.ceil(this.canvas.width/10);

		let keyWidth = width/52;
		let noteWidth = keyWidth / 3;
		let xOffset = (keyWidth - noteWidth) / 2;
		let yOffset = height / 250;

		let drawNotes_r = function(player, curNotes) {
			let curTime = player.getTime();

			//console.log(curNotes.length);
			
			this.ctx.save();

			this.ctx.beginPath();
			this.ctx.rect(0, 0, width, height);
			this.ctx.clip();

			this.ctx.clearRect(0, 0, width, height);

			this.ctx.lineWidth = 0;
			this.ctx.strokeStyle = "rgb(60, 60, 60)";


			this.ctx.beginPath();

			for (let i = 2; i < 52; i+=7) {
				this.ctx.moveTo(i * keyWidth, 0);
				this.ctx.lineTo(i * keyWidth, height);
			}


			for (let i = 0; i < Math.ceil(2*Renderer.SIZE_SECONDS); i++) {
				let time = Math.ceil(2*curTime + i);
				let y = (time - 2*curTime) / Renderer.SIZE_SECONDS * height / 2;
				this.ctx.moveTo(0, height - y);
				this.ctx.lineTo(width, height - y);
			}

			this.ctx.stroke();

			if (curTime <= 0) {
				let y = timeToY(0, curTime);
				this.ctx.beginPath()
				this.ctx.moveTo(0, y);
				this.ctx.lineTo(width, y);

				this.ctx.lineWidth = 2;
				this.ctx.strokeStyle = "rgb(200, 200, 200)";

				this.ctx.stroke()
			}
			

			this.ctx.fillStyle = "rgb(255,0,255)";
			//console.log(width * curTime / track.duration);
			this.ctx.fillRect(0, 0, width * curTime / track.duration, 20);

			
			this.ctx.lineWidth = 4;

			while (noteI < notes.length) {
				var note = notes[noteI];
				if (note.start <= (curTime + Renderer.SIZE_SECONDS)) {
					let noteHeight = note.duration / Renderer.SIZE_SECONDS * height - 2*yOffset;

					note.path = this.makeCapsule(noteWidth, noteHeight);
					//console.log(note[""])

					curNotes.push(note);
					
					noteI++;
				} else {
					break;
				}
			}

			curNotes = curNotes.filter(function(note) {
				return note.end > curTime;
			});

			//if (curNotes.length > 0)
				//console.log(curNotes[0]["end"]);

			//console.log(curNotes.length);

			for (var note of curNotes) {			
				let noteX = (2 + (Math.floor(note.key / 12) - 2) * 7  + Renderer.KEY_DRAW_OFFSETS[note.key % 12]) * keyWidth;
				let noteY = timeToY(note.end, curTime);

				if (this.keyIsSharp(note.key))
					noteX -= keyWidth / 2;

				let hue = (4*curTime + 10*note.start + 720 * (163*(1+note.channel)%16) / 16);
				let color = `hsl(${hue}, 80%, ${(note.start > curTime) ? "60%" : "80%"})`;

				this.ctx.fillStyle = color;
				this.ctx.strokeStyle = color;
				this.ctx.shadowColor = color;

				if (note.start <= curTime) {
					this.fillKeyBurst(noteX, height, keyWidth, keyWidth);
				}

				this.ctx.save();
				this.ctx.translate(noteX + xOffset, noteY + yOffset);

				this.ctx.shadowBlur = 10;
				this.ctx.stroke(note.path);

				this.ctx.restore();

			}


			this.ctx.restore();

			if (curNotes.length > 0 || noteI < notes.length) {
				this.nextEvent = window.requestAnimationFrame(function(timestamp) {
					drawNotes_r(player, curNotes);
				});
			}
		}.bind(this);

		//if (nextEvent !== undefined) {
		cancelAnimationFrame(this.nextEvent);
			//nextEvent = undefined;
		

		drawNotes_r(player, []);
	}

	private keyIsSharp(key) {
		return (key & 1) == +((key % 12) < 5);
	}
}
