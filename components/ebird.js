class Bird {
    getBirds(lat, long) {
        $.ajax({
            url: "https://api.ebird.org/v2/data/obs/geo/recent",
            method: "GET",
            data: {
                lat: lat,
                lng: long,
            },
            headers: { "X-eBirdApiToken": eBirdKey },
            success: this.displayBirds
        })
    }
    displayBirds(birds) {
        var birdsContainer = document.getElementById("birds");

        for (var i = 0; i < 10; i++) {
            var bird = document.createElement("div");
            bird.textContent = birds[i].sciName;
            birdsContainer.append(bird);
        }
    }
}