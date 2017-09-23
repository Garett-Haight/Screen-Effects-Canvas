class ImageEffect {
    constructor(img, canvas) {
        this.canvas = document.getElementById(canvas);
        this.ctx = this.canvas.getContext('2d');
        this.data;
        this.imageData;
        this.history = [];
        this.historyWindow = document.getElementById("history");
        this.img = new Image();
        this.img.src = img;
        this.img.onload = () => {
            this.ctx.drawImage(this.img, 0, 0);
            this.img.style.display = 'none';
            this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.data = this.imageData.data;
            this.originalImg = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.overflow = [];
        };
    }

    shiftChannel(shiftX, channel, shiftY) {
        // overflow will need to be recalculated after this transformation
        this.overflow = [];
        var newImg = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        var newData = newImg.data
        // default is value for red
        var start = 0;
        switch (channel) {
            case 'green':
                start = 1;
                break;
            case 'blue':
                start = 2;
                break;
            case 'alpha':
                start = 3;
                break;
        }

        // rows
        for (var i = 0; i < this.img.height; i++) {
            //columns
            for (var j = (i * this.img.width * 4) + start; j < (i + 1) * this.img.width * 4; j += 4) {
                // shift right
                // j is the first channel of the current pixel
                // this currently only works on a single axis at a time
                if (shiftX !== 0) {
                    if (j + (4 * -shiftX) < 0) {
                        // if less than zero, pull from end of the array
                        newData[j] = this.data[this.data.length + (j + (4 * -shiftX))];
                    } else if (j + (4 * -shiftX) > (this.data.length - 1)) {
                        newData[j] = this.data[(j + (4 * -shiftX)) - this.data.length];
                    } else {
                        newData[j] = this.data[j + (4 * -shiftX)];
                    }
                }
                if (shiftY !== 0) {
                    if (j + (this.imageData.width * 4 * -shiftY) > this.data.length) {
                        newData[j] = this.data[(j + (this.imageData.width * 4 * -shiftY)) - this.data.length];
                    } else if (j + (this.imageData.width * 4 * -shiftY) < 0) {
                        newData[j] = this.data[this.data.length + (j + (this.imageData.width * 4 * -shiftY))];
                    } else {
                        newData[j] = this.data[j + (this.imageData.width * 4 * -shiftY)];
                    }
                }
            }
        }
        this.imageData = newImg;
        this.data = newData;
        this.ctx.putImageData(newImg, 0, 0);
    }

    noise(density = 0.1, monochromatic = true) {
        var offset;
        for (var i = 0; i < this.data.length; i += 4) {
            if (Math.random() <= density) {
                if (monochromatic) {
                    offset = Math.random() * 255;
                    this.data[i] = offset;
                    this.data[i + 1] = offset;
                    this.data[i + 2] = offset;
                } else {
                    for (var j = 0; j < 2; j++) {
                        this.data[i + j] = Math.random() * 255;
                    }
                }
            }
        }
        this.ctx.putImageData(this.imageData, 0, 0);
    }

    smooth() {
        var mtx = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ];
        this.apply(mtx, 'red');
        this.apply(mtx, 'green');
        this.apply(mtx, 'blue');
        this.updateHistory({name: "smooth"});
    }
    edgeDetection() {
        var mtx = [
            [-1, -1, -1],
            [-1, 8, -1],
            [-1, -1, -1]
        ];
        this.apply(mtx, 'red');
        this.apply(mtx, 'green');
        this.apply(mtx, 'blue');
        this.updateHistory({name: "edgeDetection"});
    }
    boxBlur() {
        var mtx = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ];
        var factor = 1/9;
        this.apply(mtx, 'red');
        this.apply(mtx, 'green');
        this.apply(mtx, 'blue');
        this.updateHistory({name: "boxBlur"});
    }
    // approximation
    gaussianBlur3x3() {
        var mtx = [
            [1, 2, 1],
            [2, 4, 2],
            [1, 2, 1]
        ];
        var factor = 16;
        this.apply(mtx, 'red', factor);
        this.apply(mtx, 'green', factor);
        this.apply(mtx, 'blue', factor);
        this.updateHistory({name: "gaussianBlur3x3"});
    }
    gaussianBlur5x5() {
        var mtx = [
            [1,  4,  6,  4, 1],
            [4, 16, 24, 16, 4],
            [6, 24, 36, 24, 6],
            [4, 16, 24, 16, 4],
            [1,  4,  6,  4, 1],
        ];
        var factor = 256;
        this.apply(mtx, 'red', factor);
        this.apply(mtx, 'green', factor);
        this.apply(mtx, 'blue', factor);
        this.updateHistory({name: "gaussianBlur5x5"});
    }
    sharpen() {
        var mtx = [  
        [0, -1,  0],
        [-1,  5, -1],
        [0, -1,  0]
        ];
        this.apply(mtx, 'red');
        this.apply(mtx, 'green');
        this.apply(mtx, 'blue');
        this.updateHistory({name: "sharpen"});
    }
    brighten(amt) {
        for(var i = 0; i < this.data.length; i+=4) {
            for(var j = 0; j < 3; j++) {
                // overflow handles values above 255 and below 0 so no information is lost to array clamping
                this.data[i + j] = this.overflow[i + j] = (this.overflow[i + j] == undefined) ? this.data[i + j] + amt : this.overflow[i + j] + amt;
            }
        }
        this.ctx.putImageData(this.imageData, 0, 0);
        this.updateHistory({name: "brighten", value: amt});
    }
    // TODO: edge handling
    apply(matrix, channel, factor=1) {
        this.overflow = [];
        var start = 0;
        var newImg = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        var newData = newImg.data;
        switch (channel) {
            case 'green':
                start = 1;
                break;
            case 'blue':
                start = 2;
                break;
            case 'alpha':
                start = 3;
                break;
        }
        var edge = ((matrix[0].length - 1) / 2) * 4; 
        for (var i = edge / 4; i < this.img.height - (edge / 4); i++) {
            for (var j = (i * this.img.width * 4) + start + edge; j < ((i + 1) * this.img.width * 4) - edge; j += 4) {
                var avg = 0;
                for (var k = 0; k < matrix.length; k++) {
                    for (var l = 0; l < matrix[k].length; l++) {
                        var px = j // start at the current pixel and channel
                        + (this.imageData.width * 4 * (k - 1)) // offset to appropriate row
                        + ((l - 1) * 4); // offset to appropriate column
                        avg += this.data[px] * matrix[k][l]; // multiply by the cooresponding matrix value
                    }
                }
                if (factor==1) {
                    avg /= matrix.length * matrix[0].length;
                }
                else {
                    avg /= factor;
                }
                newData[j] = avg;
            }
        }
        this.imageData = newImg;
        this.data = newData;
        this.ctx.putImageData(newImg, 0, 0);
    }
    // Highlights the currently selected pixel 
    selectedPixel(p){
        var newImg = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        var newData = newImg.data
        newData[p] = 255;
        newData[p + 1] = 0;
        newData[p + 2] = 0;
        this.ctx.putImageData(newImg, 0, 0);
    }
    updateHistory(obj) {
        this.history.push(obj);
        while(this.historyWindow.hasChildNodes()) {
            this.historyWindow.removeChild(this.historyWindow.lastChild);
        }

        this.history.forEach((e)=>{
            var li = document.createElement('li');
            li.innerText = e.name;
            this.historyWindow.appendChild(li);
        });
    }
}

var ie;

ie = new ImageEffect('rhino.jpg', "c");
document.getElementById('controls').addEventListener('click', (e) => {
    // bubble bubble delegate!
    switch (e.target.id) {
        case 'rup':
            ie.shiftChannel(0, 'red', -1);
            break;
        case 'rleft':
            ie.shiftChannel(-1, 'red', 0);
            break;
        case 'rright':
            ie.shiftChannel(1, 'red', 0);
            break;
        case 'rdown':
            ie.shiftChannel(0, 'red', 1);
            break;
        case 'bup':
            ie.shiftChannel(0, 'blue', -1);
            break;
        case 'bleft':
            ie.shiftChannel(-1, 'blue', 0);
            break;
        case 'bright':
            ie.shiftChannel(1, 'blue', 0);
            break;
        case 'bdown':
            ie.shiftChannel(0, 'blue', 1);
            break;
        case 'gup':
            ie.shiftChannel(0, 'green', -1);
            break;
        case 'gleft':
            ie.shiftChannel(-1, 'green', 0);
            break;
        case 'gright':
            ie.shiftChannel(1, 'green', 0);
            break;
        case 'gdown':
            ie.shiftChannel(0, 'green', 1);
            break;
        case 'make_noise':
            ie.noise(
                document.getElementById("noise").value / 100,
                document.getElementById("mono").checked
            );
            break;
        case 'smooth':
            ie.smooth(3);
            break;
        case 'edge':
            ie.edgeDetection();
    }
});

var brightness = document.getElementById("brightness");
var original_brightness = brightness.value;
brightness.addEventListener("change", function(e) {
    ie.brighten(e.target.value - original_brightness);
    original_brightness = e.target.value;
});