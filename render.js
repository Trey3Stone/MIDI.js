
function Renderer() {

	const SIZE_SECONDS = 3;

	const KEY_DRAW_OFFSETS = [
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

	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext('2d');

	let noteImage;

	let nextEvent;

	this.init = function() {
		const dpr = window.devicePixelRatio || 1;

		let width = window.innerWidth;
		let height = window.innerHeight;

		canvas.style.width = width + "px";
		canvas.style.height = height + "px";

		canvas.width = width * dpr;
		canvas.height = height * dpr;


/*
		let keyWidth = width/52;
		let noteWidth = keyWidth / 3;
		let xOffset = (keyWidth - noteWidth) / 2;
		let yOffset = height / 250;



		makeCapsule(noteWidth, noteHeight);
		ctx.shadowBlur = 10;
		ctx.stroke(note["path"]);
		*/

	}

	function drawCanvas() {
		console.log("drawing")
		ctx.save();

		let width = canvas.width;
		const keyWidth = width/52;
		let height = canvas.height - Math.ceil(width / 10);

		ctx.lineWidth = 0;
		ctx.strokeStyle = "rgb(60, 60, 60)";


		ctx.beginPath();

		for (let i = 2; i < 52; i+=7) {
			ctx.moveTo(i * keyWidth, 0);
			ctx.lineTo(i * keyWidth, height);
		}


		for (let i = 0; i < Math.ceil(2*SIZE_SECONDS); i++) {
			let y = i / SIZE_SECONDS * height / 2;
			ctx.moveTo(0, height - y);
			ctx.lineTo(width, height - y);
		}

		ctx.stroke();


		height = Math.ceil(width / 10);

		ctx.translate(0, canvas.height - height)

		ctx.beginPath();
		ctx.rect(0, 0, width, height);
		ctx.clip();

		ctx.strokeStyle = "rgb(16, 16, 16)";
		
		const keyHeight = height;

		var xFill = 0;
		ctx.fillStyle = "rgb(255, 255, 255)";
		
		ctx.lineWidth = 2;

		for (var i = 0; i < 88; i++) {
			if (NOTES[(9+i)%12][1] == '#') {
				continue;
			}
			
			fillRoundedRect(xFill+1, 0, keyWidth-2, keyHeight-2, keyWidth/8);
			xFill = xFill + keyWidth;
		}

		xFill = 0;
		ctx.fillStyle = "rgb(0, 0, 0)";

		for (var i = 0; i < 88; i++) {
			if (NOTES[(9+i)%12][1] != '#') {
				xFill = xFill + keyWidth;
				continue;
			}

			fillRoundedRect(xFill - keyWidth/4, 0, keyWidth/2, keyHeight*0.6-2, keyWidth/8);		
		}

		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.lineWidth = 8;
		fillRoundedRect(0, 0, width, 4, 2);

		ctx.restore();

	}

	function fillRoundedRect(x, y, w, h, r) {
		ctx.save();

		ctx.translate(x, y);

		ctx.beginPath();
		ctx.arc(r, r, r, Math.PI, 3*Math.PI/2);
		ctx.arc(w - r, r, r, 3*Math.PI/2, 0);
		ctx.arc(w - r, h - r, r, 0, Math.PI/2);
		ctx.arc(r, h - r, r, Math.PI/2, Math.PI);

		ctx.closePath();

		//ctx.strokeStyle = "rgb(40, 40, 40)";
		
		ctx.stroke();

		ctx.fill();

		ctx.restore();
	}

	function fillLightRect(x, y, w, h, r) {

		//w = Math.max(w, 2*r);
		h = Math.max(h, 2*r);

		ctx.save();

		ctx.translate(x, y);

		ctx.beginPath();
		ctx.arc(r, r, r, Math.PI, 3*Math.PI/2);
		ctx.arc(w - r, r, r, 3*Math.PI/2, 0);
		ctx.arc(w - r, h - r, r, 0, Math.PI/2);
		ctx.arc(r, h - r, r, Math.PI/2, Math.PI);

		ctx.closePath();

		ctx.shadowColor = ctx.strokeStyle;
		ctx.shadowBlur = 10;

		ctx.stroke();

		ctx.restore();
	}

	function makeRoundedRect(w, h, r) {
		let path = new Path2D();

		path.arc(r, r, r, Math.PI, 3*Math.PI/2);
		path.arc(w - r, r, r, 3*Math.PI/2, 0);
		path.arc(w - r, h - r, r, 0, Math.PI/2);
		path.arc(r, h - r, r, Math.PI/2, Math.PI);

		path.closePath();

		return path;
	}

	function makeCapsule(w, h) {
		h = Math.max(h, w);
		let r = w/2;

		let path = new Path2D();

		path.arc(r, r, r, Math.PI, 0);
		path.arc(r, h - r, r, 0, Math.PI);

		path.closePath();

		return path;
	}

	function fillKeyBurst(x, y, w, r) {
		const RES = 10;
		const ANG = Math.PI / 4;
		const STEP = 2 * ANG / RES;

		ctx.save();
		
		ctx.translate(x + w/2, y);

		ctx.beginPath();
		ctx.moveTo(-w/2, 0);
		ctx.arc(0, w/2, r + w/2, -3*Math.PI/4, -Math.PI/4);
		ctx.lineTo(w/2, 0);
		ctx.closePath();

		let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
		grad.addColorStop(0, ctx.fillStyle);
		grad.addColorStop(0.25, ctx.fillStyle + "90");
		grad.addColorStop(0.5, ctx.fillStyle + "40");
		grad.addColorStop(0.75, ctx.fillStyle + "10");
		grad.addColorStop(0.875, ctx.fillStyle + "04");
		grad.addColorStop(1, ctx.fillStyle + "00");

		ctx.fillStyle = grad;

		ctx.shadowBlur = 10;
		ctx.fill();

		ctx.restore();
	}

	this.drawNotes = function(player, track) {
		
		/*
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
*/
		

		console.log("DRAW " + nextEvent);


		function timeToY(target, current) {
			return height * (1 - (target - current) / SIZE_SECONDS);
		}

		let noteI = 0;

		let notes = track.notes;

		let width = canvas.width;
		let height = canvas.height - Math.ceil(canvas.width/10);

		let keyWidth = width/52;
		let noteWidth = keyWidth / 3;
		let xOffset = (keyWidth - noteWidth) / 2;
		let yOffset = height / 250;

		function drawNotes_r(player, curNotes) {
			let curTime = player.getTime();

			//console.log(curNotes.length);
			
			ctx.save();

			ctx.beginPath();
			ctx.rect(0, 0, width, height);
			ctx.clip();

			ctx.clearRect(0, 0, width, height);

			ctx.lineWidth = 0;
			ctx.strokeStyle = "rgb(60, 60, 60)";


			ctx.beginPath();

			for (let i = 2; i < 52; i+=7) {
				ctx.moveTo(i * keyWidth, 0);
				ctx.lineTo(i * keyWidth, height);
			}


			for (let i = 0; i < Math.ceil(2*SIZE_SECONDS); i++) {
				let time = Math.ceil(2*curTime + i);
				let y = (time - 2*curTime) / SIZE_SECONDS * height / 2;
				ctx.moveTo(0, height - y);
				ctx.lineTo(width, height - y);
			}

			ctx.stroke();

			if (curTime <= 0) {
				let y = timeToY(0, curTime);
				ctx.beginPath()
				ctx.moveTo(0, y);
				ctx.lineTo(width, y);

				ctx.lineWidth = 2;
				ctx.strokeStyle = "rgb(200, 200, 200)";

				ctx.stroke()
			}
			

			ctx.fillStyle = "rgb(255,0,255)";
			//console.log(width * curTime / track.duration);
			ctx.fillRect(0, 0, width * curTime / track.duration, 200);


			ctx.lineWidth = 4;

			while (noteI < notes.length) {
				var note = notes[noteI];
				if (note.start <= (curTime + SIZE_SECONDS)) {
					let noteHeight = note.duration / SIZE_SECONDS * height - 2*yOffset;

					note.path = makeCapsule(noteWidth, noteHeight);
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
				let noteX = (2 + (Math.floor(note.key / 12) - 2) * 7  + KEY_DRAW_OFFSETS[note.key % 12]) * keyWidth;
				let noteY = timeToY(note.end, curTime);

				if (keyIsSharp(note.key))
					noteX -= keyWidth / 2;

				let hue = (4*curTime + 10*note.start + 720 * (163*(1+note.channel)%16) / 16);
				let color = `hsl(${hue}, 80%, ${(note.start > curTime) ? "60%" : "80%"})`;

				ctx.fillStyle = color;
				ctx.strokeStyle = color;
				ctx.shadowColor = color;

				if (note.start <= curTime) {
					fillKeyBurst(noteX, height, keyWidth, keyWidth);
				}

				ctx.save();
				ctx.translate(noteX + xOffset, noteY + yOffset);

				ctx.shadowBlur = 10;
				ctx.stroke(note.path);

				ctx.restore();

			}


			ctx.restore();

			if (curNotes.length > 0 || noteI < notes.length) {
				nextEvent = window.requestAnimationFrame(function(timestamp) {
					drawNotes_r(player, curNotes);
				});
			}
		}

		//if (nextEvent !== undefined) {
		cancelAnimationFrame(nextEvent);
			//nextEvent = undefined;
		

		drawNotes_r(player, []);
	}

	function keyIsSharp(key) {
		return (key & 1) == ((key % 12) < 5);
	}

	this.init();
	drawCanvas();
}
