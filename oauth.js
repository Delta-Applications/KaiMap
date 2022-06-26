function getToken(callback) {
    const code = location.search.split("?code=")[1];
  
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  
    var urlencoded = new URLSearchParams();
    urlencoded.append("code", code);
    urlencoded.append("grant_type", "authorization_code");
    urlencoded.append(
      "redirect_uri",
      "https://delta-applications.github.io/KaiMap/oauth.html"
    );
    urlencoded.append("client_id", "D5agvdYlQRR7Ej7w7W8tX1-jR-wN0WuLORcY6Oj5X58");
    urlencoded.append("client_secret", "SijDY_eTxQ1Go8KlQfBZFmxhWTO2j2elQb1TGQIDrDk");

    
    //read_prefs+write_notes+read_gpx+write_gpx
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };
  
    return fetch(
      "https://www.openstreetmap.org/oauth2/token",
      requestOptions
    ).then((response) => response.json());
  }
  
  getToken().then((result) => {
    console.log(result);
    localStorage.setItem("openstreetmap_token", result.access_token);
    document.getElementById("success").innerText =
      "you are now successfully connected to the osm service";
  
    window.dispatchEvent(
      new CustomEvent("tokens", {
        detail: result,
      })
    );
    window.close();
  });
  