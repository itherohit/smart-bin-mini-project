mapboxgl.accessToken = 'pk.eyJ1IjoiaXRoZXJvaGl0IiwiYSI6ImNrdzF1YXp4cTAzdmgyb3FseG5hdmFmaXcifQ.7CWWZ6moGmGJAtk1hduLug';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [79.0184,10.728], // starting position [lng, lat]
    zoom: 9 // starting zoom
});

map.on('load', function() {
    map.addSource('points', {
        'type': 'geojson',
        'data': datapoints
    });
});