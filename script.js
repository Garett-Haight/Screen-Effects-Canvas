var img = new Image();
img.src = 'rhino.jpg';
var canvas = document.getElementById('c');
var ctx = canvas.getContext('2d');
var data;
var imageData;
img.onload = function() {
  ctx.drawImage(img, 0, 0);
  img.style.display = 'none';
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  data = imageData.data;
};


console.log(data);

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

  var shiftChannel = function(shift, channel) {
    if(typeof shift === 'undefined') {
      shift = 1;
    }
    // default is value for red
    var start = 0;;
    switch(channel){
      case 'green':
        start = 1;
        break;
      case 'blue':
        start = 2;
        break;
      case alpha:
        start = 3;
        break;
    }
    // rows
    for(var i = 0; i < img.height; i++) {
      console.log(i);
      //columns
      for(var j = (i * img.width * 4) + start; j < (i+1) * img.width * 4; j+=4) {
        if(data[j + 4 * shift] !== null) {
          data[j] = data[j + 4];
        }
      }
    }

    // red channel vertical gradient
    // for(var i = 0; i < data.length; i+=4) {
    //   var r = i / data.length;
    //   data[i] = Math.round(255 * r);
    // }




    // vertical stripes
    // for(var i = 0; i < data.length; i += 4) {;
    //   if((i/4) % 2) {
    //     data[i] = 255;
    //   }
    //   else {
    //     data[i] = 0;
    //   }
    // }
    ctx.putImageData(imageData, 0, 0);
  }