////////////////////
////UTILITY////////////
///////////////////
const utility = (() => {
  
  let degToCompass = function (degree) {
    var val = Math.floor((degree / 22.5) + 0.5);
    var arr = ["N", "N-NE", "NE", "E-NE", "E", "E-SE", "SE", "S-SE", "S", "S-SW", "SW", "W-SW", "W", "W-NW", "NW", "N-NW"];
    return arr[(val % 16)];
  };

  let roundToTwo = function (num) {
    return +(Math.round(num + "e+2") + "e-2");
  }
  let getColorFrom0to1 = function (value) {
    //value from 0 to 1
    var hue = ((1 - value) * 120).toString(10);
    return ["hsl(", hue, ",100%,50%)"].join("");
  }




  let getRelativeTime = function (d1, d2) {
    d2 = new Date().getTime() / 1000
    d1 = new Date(d1).getTime()
    var elapsed = d1 - d2
    return moment.duration(elapsed, "seconds").humanize(true);
  }


  let formatBytes = function (bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return {
    degToCompass,
    getColorFrom0to1,
    formatBytes,
    roundToTwo,
    getRelativeTime
  };
})();