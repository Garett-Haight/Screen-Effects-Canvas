class ImageEffect {
  constructor(img, canvas) {
      this.canvas = document.getElementById(canvas);
      this.ctx = this.canvas.getContext('2d');
      this.data;
      this.imageData;
      this.img = new Image();
      this.img.src = img;
      this.img.onload = () => {
          this.ctx.drawImage(this.img, 0, 0);
          this.img.style.display = 'none';
          this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
          this.data = this.imageData.data;
      };
  }

  shiftChannel(shiftX, channel, shiftY) {
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

  noise(density=0.1, monochromatic=true) {
    var offset;
    for(var i = 0; i < this.data.length; i+=4) {
      if(Math.random() <= density) {
        if (monochromatic) {
          offset = Math.random() * 255;
          this.data[i] = offset;
          this.data[i + 1] = offset;
          this.data[i + 2] = offset;
        }
        else {
          for(var j = 0; j < 2; j++) {
            this.data[i + j] = Math.random() * 255;
          }
        }
      }
    }
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  // should write a generalized way to apply matrix transformations
  smooth(size) {
    var newImg = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var newData = newImg.data;
    // red channel
    for(var i = Math.ceil((size - 1 )/ 2); i < this.data.length - (size - 1)/2; i+=4) {
        var avg = 0;
        avg += this.data[i - (this.imageData.width * 4) - 4];
        avg += this.data[i - (this.imageData.width * 4)];
        avg += this.data[i - (this.imageData.width * 4) + 4];
        avg += this.data[i - 4];
        avg += this.data[i];
        avg += this.data[i + 4];
        avg += this.data[i + (this.imageData.width * 4) - 4];
        avg += this.data[i + (this.imageData.width * 4)];
        avg += this.data[i + (this.imageData.width * 4) + 4];
        avg /= 9;
        newData[i] = avg;
    }
    this.ctx.putImageData(newImg, 0, 0);
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
            ie.smooth(ie.smooth(3));
        break;
  }
});