var map;
var marker;
var circle;
var geocoder;
var body = document.querySelector("body");

var mapsScript = document.createElement("script");
var scriptSrc = "https://maps.googleapis.com/maps/api/js?key=" + mapsKey + "&callback=initMap";
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
}

function addMarker(location) {
    if (marker) {
        deleteMarker(marker);
    }
    if (circle) {
        deleteMarker(circle);
    }
    marker = new google.maps.Marker({
        position: location,
        map: map
    });
    map.setCenter(marker.position);
    map.setZoom(7);
    circle = new google.maps.Circle({
        strokeColor: "#808080",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#808080",
        fillOpacity: 0.35,
        map: map,
        center: marker.position,
        radius: 50000
    });

    var lat = marker.position.lat();
    var long = marker.position.lng();
    getBirds(lat, long);
}

function deleteMarker(marker) {
    marker.setMap(null);
    marker = null;
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

function getBirds(lat, long) {
    $.ajax({
        url: "https://api.ebird.org/v2/data/obs/geo/recent",
        method: "GET",
        data: {
            lat: lat,
            lng: long,
            dist: 50,
            maxResults: 9
        },
        headers: { "X-eBirdApiToken": eBirdKey },
        success: displayBirds
    })
}
function displayBirds(birds) {
    var birdsContainer = document.getElementById("birds");

    while (birdsContainer.firstChild) {
        birdsContainer.removeChild(birdsContainer.lastChild);
    }

    if (birds.length > 1) {
        for (var i = 0; i < 9; i++) {
            var bird = document.createElement("div");
            var icon = document.createElement("button");
            var name = document.createElement("p");
            bird.setAttribute("class", "bird");
            icon.setAttribute("class", "icon collapsible");
            name.textContent = birds[i].comName;
            icon.append(name);
            bird.append(icon);
            birdsContainer.append(bird);
            search(birds[i].sciName, bird, icon);
        }
    } else {
        var message = document.createElement("p");
        message.textContent = "No recent sightings nearby (50km radius)";
        birdsContainer.append(message);
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

    var collapsible = document.querySelectorAll(".collapsible");
    for (var i = 0; i < collapsible.length; i++) {
        collapsible[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var info = this.nextElementSibling;
            if (info.style.display !== "none") {
                info.style.display = "none";
            } else {
                info.style.display = "block";
            }
        })
    }
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
