var eBird = new Bird();

function initMap() {
    var uluru = { lat: -25.344, lng: 131.036 };
    var map = new google.maps.Map(
        document.getElementById("map"), { zoom: 4, center: uluru });
}

var srcString = "https://maps.googleapis.com/maps/api/js?key=" + mapsKey + "&callback=initMap";
var mapScript = document.createElement("script");
mapScript.src = srcString;
mapScript.defer = true;
mapScript.async = true;
document.querySelector("body").append(mapScript);