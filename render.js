//import {Player} from "./playback";
var Renderer = /** @class */ (function () {
    function Renderer(player) {
        this.player = player;
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext('2d');
        if (player)
            player.renderer = this;
        this.refresh();
        this.drawCanvas();
    }
    Renderer.prototype.refresh = function () {
        var dpr = window.devicePixelRatio || 1;
        var width = window.innerWidth;
        var height = window.innerHeight;
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
    };
    Renderer.prototype.drawCanvas = function () {
        console.log("drawing");
        this.ctx.save();
        var width = this.canvas.width;
        var keyWidth = width / 52;
        var height = this.canvas.height - Math.ceil(width / 10);
        this.ctx.lineWidth = 0;
        this.ctx.strokeStyle = "rgb(60, 60, 60)";
        this.ctx.beginPath();
        for (var i_1 = 2; i_1 < 52; i_1 += 7) {
            this.ctx.moveTo(i_1 * keyWidth, 0);
            this.ctx.lineTo(i_1 * keyWidth, height);
        }
        for (var i_2 = 0; i_2 < Math.ceil(2 * Renderer.SIZE_SECONDS); i_2++) {
            var y = i_2 / Renderer.SIZE_SECONDS * height / 2;
            this.ctx.moveTo(0, height - y);
            this.ctx.lineTo(width, height - y);
        }
        this.ctx.stroke();
        height = Math.ceil(width / 10);
        this.ctx.translate(0, this.canvas.height - height);
        this.ctx.beginPath();
        this.ctx.rect(0, 0, width, height);
        this.ctx.clip();
        this.ctx.strokeStyle = "rgb(16, 16, 16)";
        var keyHeight = height;
        var xFill = 0;
        this.ctx.fillStyle = "rgb(255, 255, 255)";
        this.ctx.lineWidth = 2;
        for (var i = 0; i < 88; i++) {
            if (Renderer.NOTES[(9 + i) % 12][1] == '#') {
                continue;
            }
            this.fillRoundedRect(xFill + 1, 0, keyWidth - 2, keyHeight - 2, keyWidth / 8);
            xFill = xFill + keyWidth;
        }
        xFill = 0;
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        for (var i = 0; i < 88; i++) {
            if (Renderer.NOTES[(9 + i) % 12][1] != '#') {
                xFill = xFill + keyWidth;
                continue;
            }
            this.fillRoundedRect(xFill - keyWidth / 4, 0, keyWidth / 2, keyHeight * 0.6 - 2, keyWidth / 8);
        }
        this.ctx.fillStyle = "rgb(255, 255, 255)";
        this.ctx.lineWidth = 8;
        this.fillRoundedRect(0, 0, width, 4, 2);
        this.ctx.restore();
    };
    Renderer.prototype.fillRoundedRect = function (x, y, w, h, r) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.beginPath();
        this.ctx.arc(r, r, r, Math.PI, 3 * Math.PI / 2);
        this.ctx.arc(w - r, r, r, 3 * Math.PI / 2, 0);
        this.ctx.arc(w - r, h - r, r, 0, Math.PI / 2);
        this.ctx.arc(r, h - r, r, Math.PI / 2, Math.PI);
        this.ctx.closePath();
        //ctx.strokeStyle = "rgb(40, 40, 40)";
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.restore();
    };
    Renderer.prototype.fillLightRect = function (x, y, w, h, r) {
        //w = Math.max(w, 2*r);
        h = Math.max(h, 2 * r);
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.beginPath();
        this.ctx.arc(r, r, r, Math.PI, 3 * Math.PI / 2);
        this.ctx.arc(w - r, r, r, 3 * Math.PI / 2, 0);
        this.ctx.arc(w - r, h - r, r, 0, Math.PI / 2);
        this.ctx.arc(r, h - r, r, Math.PI / 2, Math.PI);
        this.ctx.closePath();
        this.ctx.shadowColor = this.ctx.strokeStyle;
        this.ctx.shadowBlur = 10;
        this.ctx.stroke();
        this.ctx.restore();
    };
    Renderer.prototype.makeRoundedRect = function (w, h, r) {
        var path = new Path2D();
        path.arc(r, r, r, Math.PI, 3 * Math.PI / 2);
        path.arc(w - r, r, r, 3 * Math.PI / 2, 0);
        path.arc(w - r, h - r, r, 0, Math.PI / 2);
        path.arc(r, h - r, r, Math.PI / 2, Math.PI);
        path.closePath();
        return path;
    };
    Renderer.prototype.makeCapsule = function (w, h) {
        h = Math.max(h, w);
        var r = w / 2;
        var path = new Path2D();
        path.arc(r, r, r, Math.PI, 0);
        path.arc(r, h - r, r, 0, Math.PI);
        path.closePath();
        return path;
    };
    Renderer.prototype.fillKeyBurst = function (x, y, w, r) {
        var RES = 10;
        var ANG = Math.PI / 4;
        var STEP = 2 * ANG / RES;
        this.ctx.save();
        this.ctx.translate(x + w / 2, y);
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2, 0);
        this.ctx.arc(0, w / 2, r + w / 2, -3 * Math.PI / 4, -Math.PI / 4);
        this.ctx.lineTo(w / 2, 0);
        this.ctx.closePath();
        var grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, r);
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
    };
    Renderer.prototype.drawNotes = function (player, track) {
        var times = [];
        var fps;
        /*
        function refreshLoop() {
            window.requestAnimationFrame(function () {
                var now = performance.now();
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
        */

        function timeToY(target, current) {
            return height * (1 - (target - current) / Renderer.SIZE_SECONDS);
        }
        var noteI = 0;
        var notes = track.notes;
        var width = this.canvas.width;
        var height = this.canvas.height - Math.ceil(this.canvas.width / 10);
        var keyWidth = width / 52;
        var noteWidth = keyWidth / 3;
        var xOffset = (keyWidth - noteWidth) / 2;
        var yOffset = height / 250;
        var drawNotes_r = function (player, curNotes) {
            var curTime = player.getTime();
            //console.log(curNotes.length);
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect(0, 0, width, height);
            this.ctx.clip();
            this.ctx.clearRect(0, 0, width, height);
            this.ctx.lineWidth = 0;
            this.ctx.strokeStyle = "rgb(60, 60, 60)";
            this.ctx.beginPath();
            for (var i = 2; i < 52; i += 7) {
                this.ctx.moveTo(i * keyWidth, 0);
                this.ctx.lineTo(i * keyWidth, height);
            }
            for (var i = 0; i < Math.ceil(2 * Renderer.SIZE_SECONDS); i++) {
                var time = Math.ceil(2 * curTime + i);
                var y = (time - 2 * curTime) / Renderer.SIZE_SECONDS * height / 2;
                this.ctx.moveTo(0, height - y);
                this.ctx.lineTo(width, height - y);
            }
            this.ctx.stroke();
            if (curTime <= 0) {
                var y = timeToY(0, curTime);
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(width, y);
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "rgb(200, 200, 200)";
                this.ctx.stroke();
            }
            //this.ctx.fillStyle = "rgb(255,0,255)";
            //console.log(width * curTime / track.duration);
            //this.ctx.fillRect(0, 0, width * curTime / track.duration, 20);
            
            this.ctx.lineWidth = 4;
            while (noteI < notes.length) {
                var note = notes[noteI];
                if (note.start <= (curTime + Renderer.SIZE_SECONDS)) {
                    var noteHeight = note.duration / Renderer.SIZE_SECONDS * height - 2 * yOffset;
                    note.path = this.makeCapsule(noteWidth, noteHeight);
                    //console.log(note[""])
                    curNotes.push(note);
                    noteI++;
                }
                else {
                    break;
                }
            }
            curNotes = curNotes.filter(function (note) {
                return note.end > curTime;
            });
            //if (curNotes.length > 0)
            //console.log(curNotes[0]["end"]);
            //console.log(curNotes.length);
            for (var _i = 0, curNotes_1 = curNotes; _i < curNotes_1.length; _i++) {
                var note = curNotes_1[_i];
                var noteX = (2 + (Math.floor(note.key / 12) - 2) * 7 + Renderer.KEY_DRAW_OFFSETS[note.key % 12]) * keyWidth;
                var noteY = timeToY(note.end, curTime);
                if (this.keyIsSharp(note.key))
                    noteX -= keyWidth / 2;
                var hue = (4 * curTime + 10 * note.start + 720 * (163 * (1 + note.channel) % 16) / 16);
                var color = "hsl(" + hue + ", 80%, " + ((note.start > curTime) ? "60%" : "80%") + ")";
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
                this.nextEvent = window.requestAnimationFrame(function (timestamp) {
                    drawNotes_r(player, curNotes);
                });
            }
        }.bind(this);
        //if (nextEvent !== undefined) {
        cancelAnimationFrame(this.nextEvent);
        //nextEvent = undefined;
        drawNotes_r(player, []);
    };
    Renderer.prototype.keyIsSharp = function (key) {
        return (key & 1) == +((key % 12) < 5);
    };
    Renderer.SIZE_SECONDS = 3;
    Renderer.KEY_DRAW_OFFSETS = [
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
    ];
    Renderer.NOTES = [
        'c',
        'c#',
        'd',
        'd#',
        'e',
        'f',
        'f#',
        'g',
        'g#',
        'a',
        'a#',
        'b'
    ];
    return Renderer;
}());
//# sourceMappingURL=render.js.map