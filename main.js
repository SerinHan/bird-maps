var map;
var mainMarker;
var markers = [];
var circle;
var geocoder;
var lat;
var long;
var body = document.querySelector("body");
var birdsContainer = document.getElementById("birds");
var mapContainer = document.querySelector(".map");
var tracking = document.getElementById("tracking");
var trackedBird = document.getElementById("trackedBird");
var clearButton = document.getElementById("clear");
clearButton.addEventListener("click", clearSightings);

var mapsScript = document.createElement("script");
var scriptSrc = "https://maps.googleapis.com/maps/api/js?key=" + mapsKey + "&callback=initMap";
var bounds;
var loc;

mapsScript.setAttribute("src", scriptSrc);
mapsScript.async = true;
mapsScript.defer = true;
body.append(mapsScript);

function initMap() {
    map = new google.maps.Map(
        document.getElementById("map"), { zoom: 1, center: { lat: 0, lng: 0 } });
    geocoder = new google.maps.Geocoder();

    document.getElementById("submit").addEventListener("click", function () {
        geocodeAddress(geocoder, map);
    });
    map.addListener('click', function (event) {
        addMarker(event.latLng);
    });
    bounds = new google.maps.LatLngBounds();
}

function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById("address").value;
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            addMarker(results[0].geometry.location);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function addMarker(location) {
    if (trackedBird.textContent) {
        trackedBird.textContent = null;
    }
    if (markers.length > 0) {
        for (var i = 0; i < markers.length; i++) {
            deleteMarker(markers[i]);
        }
    }
    if (mainMarker) {
        deleteMarker(mainMarker);
    }
    if (circle) {
        deleteMarker(circle);
    }
    mainMarker = new google.maps.Marker({
        position: location,
        map: map
    });
    map.setCenter(mainMarker.position);
    map.setZoom(6);
    circle = new google.maps.Circle({
        strokeColor: "#808080",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#808080",
        fillOpacity: 0.35,
        map: map,
        center: mainMarker.position,
        radius: 50000
    });

    lat = mainMarker.position.lat();
    long = mainMarker.position.lng();
    getBirds(lat, long);
}

function deleteMarker(marker) {
    marker.setMap(null);
    marker = null;
}

function getBirds() {
    $.ajax({
        url: "https://api.ebird.org/v2/data/obs/geo/recent",
        method: "GET",
        data: {
            lat: lat,
            lng: long,
            dist: 50,
            maxResults: 50
        },
        headers: { "X-eBirdApiToken": eBirdKey },
        success: displayBirds
    })
}
function displayBirds(birds) {
    while (birdsContainer.firstChild) {
        birdsContainer.removeChild(birdsContainer.lastChild);
    }

    if (birds.length > 1) {
        for (var i = 0; i < birds.length; i++) {
            var bird = document.createElement("div");
            var icon = document.createElement("button");
            var name = document.createElement("p");
            var allSightings = document.createElement("button");

            bird.setAttribute("class", "bird");
            bird.setAttribute("class", birds[i].comName);

            icon.setAttribute("class", "collapsible");

            allSightings.addEventListener("click", getSightings);

            bird.append(icon);
            icon.append(allSightings, name);
            name.textContent = birds[i].comName;
            allSightings.textContent = "Sightings";
            allSightings.value = birds[i].speciesCode;

            birdsContainer.append(bird);
            search(birds[i].sciName, bird, icon);
        }
    } else {
        var message = document.createElement("p");
        message.textContent = "No recent sightings nearby (50km radius)";
        birdsContainer.append(message);
    }

    var collapsible = document.querySelectorAll(".collapsible");
    for (var i = 0; i < collapsible.length; i++) {
        collapsible[i].addEventListener("click", function () {
            if (event.target.value) {
                return;
            }
            this.classList.toggle("active");
            var info = this.nextElementSibling;
            if (info.style.display === "none") {
                info.style.display = "block";
            } else {
                info.style.display = "none";
            }
        })
    }
}
function search(birdName, bird, icon) {
    $.ajax({
        url: "https://en.wikipedia.org/w/api.php",
        data: {
            action: "query",
            list: "search",
            srsearch: birdName,
            format: "json",
            origin: "*"
        },
        success: function (response) {
            var title = response.query.search[0].title;
            var id = response.query.search[0].pageid;
            getExtract(title, id, bird);
            getImage(title, id, icon);
        }
    })
}
function getImage(title, id, icon) {
    $.ajax({
        url: "https://en.wikipedia.org/w/api.php",
        data: {
            action: "query",
            prop: "pageimages",
            titles: title,
            format: "json",
            origin: "*"
        },
        success: function (response) {
            var thumbnail = response.query.pages[id].thumbnail.source;
            displayImage(thumbnail, icon);
        }
    })
}
function displayImage(source, icon) {
    var image = document.createElement("img");
    image.setAttribute("src", source);
    icon.append(image);
}
function getExtract(title, id, bird) {
    $.ajax({
        url: "https://en.wikipedia.org/w/api.php",
        data: {
            action: "query",
            prop: "extracts",
            exlimit: 1,
            explaintext: 1,
            titles: title,
            format: "json",
            origin: "*"
        },
        success: function (response) {
            var extract = response.query.pages[id].extract;
            var split1 = extract.split("==");
            displayExtract(title, split1[0], bird);
        }
    })
}
function displayExtract(title, extract, bird) {
    var collapse = document.createElement("button");
    var info = document.createElement("div");
    var learnMore = document.createElement("a");
    var pageLink = "https://en.wikipedia.org/wiki/" + title.replace(" ", "_");

    learnMore.textContent = "Learn More";
    learnMore.setAttribute("href", pageLink);
    learnMore.setAttribute("target", "_blank");

    collapse.setAttribute("class", "collapsible");
    collapse.textContent = "Collapsible";

    info.style.display = "none";
    info.setAttribute("class", "info");
    info.insertAdjacentHTML("afterbegin", extract);
    info.append(learnMore);
    bird.append(info);
}
function getSightings(event) {
    var code = event.target.value;
    $.ajax({
        url: "https://api.ebird.org/v2/data/nearest/geo/recent/" + code,
        data: {
            lat: lat,
            lng: long,
        },
        headers: { "X-eBirdApiToken": eBirdKey },
        success: displaySightings
    })
}
function displaySightings(response) {
    if (markers.length > 0) {
        for (var i = 0; i < markers.length; i++) {
            deleteMarker(markers[i]);
        }
        bounds = new google.maps.LatLngBounds();
    }

    for (var i = 0; i < response.length; i++) {
        var sighting = new google.maps.Marker({
            position: { lat: response[i].lat, lng: response[i].lng },
            map: map
        });
        markers.push(sighting);
        loc = new google.maps.LatLng(sighting.position.lat(), sighting.position.lng());
        bounds.extend(loc);
    }
    trackedBird.textContent = response[0].comName;
    clearButton.classList.remove("hidden");

    for (var i = 0; i < birdsContainer.childElementCount; i++) {
        if (birdsContainer.children[i].classList.contains("tracked")) {
            birdsContainer.children[i].classList.remove("tracked");
        }
        if (birdsContainer.children[i].className === response[0].comName) {
            birdsContainer.children[i].classList.add("tracked");
        }
    }

    map.fitBounds(bounds);
    map.panToBounds(bounds);
}
function clearSightings() {
    if (markers.length > 0) {
        for (var i = 0; i < markers.length; i++) {
            deleteMarker(markers[i]);
        }
    }
    trackedBird.textContent = null;
    this.classList.add("hidden");
    for (var i = 0; i < birdsContainer.childElementCount; i++) {
        if (birdsContainer.children[i].classList.contains("tracked")) {
            birdsContainer.children[i].classList.remove("tracked");
        }
    }
}