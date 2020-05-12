var eBird = new Bird();

function initMap() {
    var uluru = { lat: -25.344, lng: 131.036 };
    var map = new google.maps.Map(
        document.getElementById("map"), { zoom: 4, center: uluru });
    var geocoder = new google.maps.Geocoder();

    document.getElementById("submit").addEventListener("click", function () {
        geocodeAddress(geocoder, map);
    });
}

function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById("address").value;
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });
            var lat = results[0].geometry.location.lat();
            var long = results[0].geometry.location.lng();

            eBird.getBirds(lat, long);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}