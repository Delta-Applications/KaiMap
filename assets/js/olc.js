/**
 * TinyOLC - Open Location Code for smallest applications
 * Differences from Google's open-source JS implementation:
 * - less than 600 bytes minified (as opposed to over 4.5 KB from Google)
 * - only 2 methods exposed - encode (lat, lng => str) and decode (str => [lat, lng])
 * - only floating point degrees accepted as encoding input (positive as N and E, negative as S and W)
 * - no short code resolution
 * - no area encoding, only points with 11-digit resolution
 * - assuming the block lower left corner only when decoding a low-res code
 * - no validation checks
 * - public domain
 * @author Luxferre 2020
 * @license Unlicense <unlicense.org>
 */


OLC = (function () {
  var alpha = "23456789CFGHJMPQRVWX";
  return {
    encode: function (lat, lng) {
      var res = [],
        i = 0,
        latr,
        lngr,
        fact = 20;
      for (lat += 90, lng += 180; i < 11; i += 2) {
        //main step
        if (i === 8) res[i++] = "+";
        res[i] = alpha[(latr = 0 | (lat / fact))];
        res[i + 1] = alpha[(lngr = 0 | (lng / fact))];
        lat -= latr * fact;
        lng -= lngr * fact;
        fact /= 20;
      }
      return (
        res.join("") +
        alpha[4 * (0 | (lat / fact / 4)) + (0 | (lng / fact / 5))]
      ); //additional step
    },
    decode: function (code) {
      code = code
        .split(0)[0]
        .split("")
        .map(function (c) {
          return (c = alpha.indexOf(c)) > -1 ? c : NaN;
        })
        .filter(isFinite);
      var lat,
        lng,
        i,
        fact = 20,
        l = code.length,
        bl = l > 10 ? 10 : l;
      for (lat = lng = i = 0; i < bl; i += 2) {
        //main step
        lat += code[i] * fact;
        lng += code[i + 1] * fact;
        fact /= 20;
      }
      if (l > 10) {
        //additional step
        fact = 125e-6;
        lat += fact * (0 | (code[10] / 5));
        lng += fact * (code[10] % 4);
      }
      return [lat - 90, lng - 180].map(function (n) {
        return Math.round(n * 1e6) / 1e6;
      });
    },
  };
})();


// OSM Short links functions

// License: GNU General Public License 2.0, http://www.gnu.org/licenses/old-licenses/gpl-2.0.txt

// makeShortCode taken from:
// https://github.com/openstreetmap/openstreetmap-website/blob/e84b2bd22f7c92fb7a128a91c999f86e350bf04d/app/assets/javascripts/application.js
// Important when using makeShortCode: provide args as numbers, not as strings!

OSMShortCode = (function () {
  function interleave(x, y) {
    x = (x | (x << 8)) & 0x00ff00ff;
    x = (x | (x << 4)) & 0x0f0f0f0f;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;
    y = (y | (y << 8)) & 0x00ff00ff;
    y = (y | (y << 4)) & 0x0f0f0f0f;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;
    return (x << 1) | y;
  }
  let char_array = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_~";
  return {
    encode: function (lat, lon, zoom) {
      var x = Math.round((lon + 180.0) * ((1 << 30) / 90.0));
      var y = Math.round((lat + 90.0) * ((1 << 30) / 45.0));
      // JavaScript only has to keep 32 bits of bitwise operators, so this has to be
      // done in two parts. each of the parts c1/c2 has 30 bits of the total in it
      // and drops the last 4 bits of the full 64 bit Morton code.
      var str = "";
      var c1 = interleave(x >>> 17, y >>> 17),
        c2 = interleave((x >>> 2) & 0x7fff, (y >>> 2) & 0x7fff);
      for (var i = 0; i < Math.ceil((zoom + 8) / 3.0) && i < 5; ++i) {
        digit = (c1 >> (24 - 6 * i)) & 0x3f;
        str += char_array.charAt(digit);
      }
      for (var i = 5; i < Math.ceil((zoom + 8) / 3.0); ++i) {
        digit = (c2 >> (24 - 6 * (i - 5))) & 0x3f;
        str += char_array.charAt(digit);
      }
      for (var i = 0; i < ((zoom + 8) % 3); ++i) {
        str += "-";
      }
      return str;
    },

    decode: function (sc) {
      var i = 0;
      var x = 0;
      var y = 0;
      var z = -8;
      for (i = 0; i < sc.length; i++) {
        ch = sc.charAt(i);
        digit = char_array.indexOf(ch);
        if (digit == -1) break;
        // distribute 6 bits into x and y
        x <<= 3;
        y <<= 3;
        for (j = 2; j >= 0; j--) {
          x |= ((digit & (1 << (j + j + 1))) == 0 ? 0 : (1 << j));
          y |= ((digit & (1 << (j + j))) == 0 ? 0 : (1 << j));
        }
        z += 3;
      }
      x = x * Math.pow(2, 2 - 3 * i) * 90 - 180;
      y = y * Math.pow(2, 2 - 3 * i) * 45 - 90;
      // adjust z
      if (i < sc.length && sc.charAt(i) == "-") {
        z -= 2;
        if (i + 1 < sc.length && sc.charAt(i + 1) == "-") {
          z++;
        }
      }
      return new Array(y, x, z);
    }
  }
})();