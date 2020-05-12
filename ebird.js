class Bird {
    getBirds() {
        $.ajax({
            url: "https://api.ebird.org/v2/data/obs/KZ/recent",
            method: "GET",
            headers: { "X-eBirdApiToken": eBirdKey },
            success: function (response) { console.log(response) }
        })
    }
}