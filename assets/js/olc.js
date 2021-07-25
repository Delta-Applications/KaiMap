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
OLC=function(){var n="23456789CFGHJMPQRVWX";return{encode:function(r,e){var t,i,o=[],u=0,f=20;for(r+=90,e+=180;u<11;u+=2)8===u&&(o[u++]="+"),o[u]=n[t=0|r/f],o[u+1]=n[i=0|e/f],r-=t*f,e-=i*f,f/=20;return o.join("")+n[4*(0|r/f/4)+(0|e/f/5)]},decode:function(r){var e,t,i,o=20,u=(r=r.split(0)[0].split("").map((function(r){return(r=n.indexOf(r))>-1?r:NaN})).filter(isFinite)).length,f=u>10?10:u;for(e=t=i=0;i<f;i+=2)e+=r[i]*o,t+=r[i+1]*o,o/=20;return u>10&&(e+=(o=125e-6)*(0|r[10]/5),t+=o*(r[10]%4)),[e-90,t-180].map((function(n){return Math.round(1e6*n)/1e6}))}}}();
