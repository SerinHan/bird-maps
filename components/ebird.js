class Bird {
    getBirds(lat, long) {
        $.ajax({
            url: "https://api.ebird.org/v2/data/obs/geo/recent",
            method: "GET",
            data: {
                lat: lat,
                lng: long,
                sort: "species"
            },
            headers: { "X-eBirdApiToken": eBirdKey },
            success: function (response) { console.log(response) }
        })
    }
}