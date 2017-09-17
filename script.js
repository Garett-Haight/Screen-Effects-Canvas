

var invert = function() {
    for (var i = 0; i < data.length; i += 4) {
      data[i]     = 255 - data[i];     // red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
    }
    ctx.putImageData(imageData, 0, 0);
  };

  var grayscale = function() {
    for (var i = 0; i < data.length; i += 4) {
      var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i]     = avg; // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
    }
    ctx.putImageData(imageData, 0, 0);
  };

  

  class ImageEffect {
    constructor(img, canvas){

      this.canvas = document.getElementById(canvas);
      this.ctx = this.canvas.getContext('2d');
      this.data;
      this.imageData;
      this.img = new Image();
      this.img.src = 'rhino.jpg';
      this.img.onload = () => {
        this.ctx.drawImage(this.img, 0, 0);
        this.img.style.display = 'none';
        this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.data = this.imageData.data;
      };
    }

    shiftChannel(shift, channel) {
      if(typeof shift === 'undefined') {
        shift = 1;
      }

      // default is value for red
      var start = 0;
      var newImg = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      var newData = newImg.data
      switch(channel){
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
      for(var i = 0; i < this.img.height; i++) {
        //columns
        for(var j = (i * this.img.width * 4) + start; j < (i+1) * this.img.width * 4; j+=4) {
          // shift right
          // j is the first channel of the current pixel
          newData[j] = this.data[j + (4 * -shift)];
        }
      }
      this.imageData = newImg;
      this.data = newData;
      this.ctx.putImageData(newImg, 0, 0);
    }
  }

  var ie = new ImageEffect('rhino.jpg', 'c');

  document.addEventListener('keydown', (e) => {
    if(e.keyCode === 39) {
      ie.shiftChannel(1, 'red');
    }
    else if(e.keyCode === 37) {
      ie.shiftChannel(-1, 'red');
    }
  });
