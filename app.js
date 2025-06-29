// Load the addresses from the JSON file
fetch('addresses.json')
    .then(response => response.json())
    .then(data => {
        const addresses = data;
        initializeMap(addresses);
    })
    .catch(error => console.error('Error loading addresses:', error));

function initializeMap(addresses) {
    // Initialize the Leaflet map and center it on New Jersey
    const map = L.map('map').setView([40.0583, -74.4057], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 18,
    }).addTo(map);

    // Create markers for each address and add them to the map
    const markers = {};
    addresses.forEach(address => {
        const marker = L.marker([address.lat, address.lng]).addTo(map);
        marker.bindPopup(`<b>${address.name}</b><br>${address.address}`);
        const category = address.category.toLowerCase();
        if (!markers[category]) {
            markers[category] = [];
        }
        markers[category].push(marker);
    });

    // Category button click event handlers
    document.getElementById('museumBtn').addEventListener('click', () => toggleMarkers('museum', markers, map));
    document.getElementById('zooBtn').addEventListener('click', () => toggleMarkers('zoo', markers, map));
    document.getElementById('playgroundBtn').addEventListener('click', () => toggleMarkers('playground', markers, map));
    document.getElementById('farmBtn').addEventListener('click', () => toggleMarkers('farm', markers, map));
    document.getElementById('hikingBtn').addEventListener('click', () => toggleMarkers('hiking', markers, map));
    document.getElementById('eventBtn').addEventListener('click', () => toggleMarkers('event', markers, map));

    // Search input event handler
    document.getElementById('searchInput').addEventListener('input', () => {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        addresses.forEach(address => {
            const marker = L.marker([address.lat, address.lng]);
            if (
                address.name.toLowerCase().includes(searchTerm) ||
                address.address.toLowerCase().includes(searchTerm)
            ) {
                marker.addTo(map);
            } else {
                map.removeLayer(marker);
            }
        });
    });
}

// Function to show or hide markers based on category
function toggleMarkers(category, markers, map) {
    Object.keys(markers).forEach(key => {
        if (key === category) {
            markers[key].forEach(marker => marker.addTo(map));
        } else {
            markers[key].forEach(marker => map.removeLayer(marker));
        }
    });
}