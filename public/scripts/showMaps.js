mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: att.geometry.coordinates, // starting position [lng, lat]
        zoom: 9 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(att.geometry.coordinates)
    .addTo(map);