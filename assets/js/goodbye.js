window.goodbye = function () {
  kaiads.DisplayFullScreenAd();

  document.getElementById("goodbye").style.display = "block";

  if (localStorage.clickcount) {
    localStorage.clickcount = Number(localStorage.clickcount) + 1;
  } else {
    localStorage.clickcount = 1;
  }

  if (localStorage.clickcount == 3) {
    message();
  } else {
    document.getElementById("ciao").style.display = "block";
    setTimeout(function () {
      kaiads.DisplayFullScreenAd();

      window.close();
    }, 4000);
  }

  function message() {
    kaiads.DisplayFullScreenAd();
    setTimeout(function () {
      localStorage.clickcount = 1;

      window.close();
    }, 6000);
  }
};
