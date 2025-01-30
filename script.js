var map = L.map('map').setView([6.751977, 125.353731], 18); // Default view
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

var userLocation;
var userMarker;

const locations = {
    R101: [6.596518, 125.344981],
    R102: [6.751635, 125.353540],
    R103: [6.759306, 125.346363],
    // Custom Routes
    customRoute1: [
        [6.751635, 125.353540], // Starting point
        [6.759306, 125.346363], // Waypoint
        [6.765739, 125.344981]  // Ending point
    ],
    customRoute2: [
        [6.759306, 125.346363],
        [6.754832, 125.350214],
        [6.748951, 125.342816]
    ]
};

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            function (position) {
                userLocation = [position.coords.latitude, position.coords.longitude];
                if (!userMarker) {
                    userMarker = L.marker(userLocation, { draggable: true }).addTo(map)
                        .bindPopup('You are here')
                        .openPopup();

                    // Listen for marker drag events to update user location
                    userMarker.on('dragend', function (event) {
                        var newLatLng = event.target.getLatLng();
                        userLocation = [newLatLng.lat, newLatLng.lng];
                    });
                } else {
                    userMarker.setLatLng(userLocation);
                }
                map.setView(userLocation, 18);
            },
            function (error) {
                alert("Error retrieving your location: " + error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,  // Timeout after 10 seconds
                maximumAge: 0  // Don't use cached location
            }
        );
    } else {
        alert("Your browser does not support geolocation.");
    }
}

document.getElementById('routeToSelected').addEventListener('click', function () {
    var selectedLocation = document.getElementById('locationSelect').value;

    if (selectedLocation && locations[selectedLocation]) {
        if (Array.isArray(locations[selectedLocation][0])) {
            // Handle the custom route with multiple waypoints
            createCustomRoute(locations[selectedLocation]);
        } else {
            // Handle regular single destination routes
            createRoute(locations[selectedLocation]);
        }
    } else {
        alert("Please select a valid location.");
    }
});

function createRoute(destinationCoords) {
    if (!userLocation) {
        alert("User location not available.");
        return;
    }

    var routingControl = L.Routing.control({
        waypoints: [
            L.latLng(userLocation[0], userLocation[1]),
            L.latLng(destinationCoords[0], destinationCoords[1])
        ],
        routeWhileDragging: true,
        draggableWaypoints: false,
        addWaypoints: false
    });

    if (window.routingControl) {
        map.removeControl(window.routingControl);
    }

    window.routingControl = routingControl.addTo(map);
}

function createCustomRoute(routeCoordinates) {
    if (!userLocation) {
        alert("User location not available.");
        return;
    }

    // Add the user's location as the starting point
    var waypoints = [L.latLng(userLocation[0], userLocation[1])];

    // Add the custom route's waypoints
    routeCoordinates.forEach(coord => {
        waypoints.push(L.latLng(coord[0], coord[1]));
    });

    var routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        draggableWaypoints: false,
        addWaypoints: false
    });

    if (window.routingControl) {
        map.removeControl(window.routingControl);
    }

    window.routingControl = routingControl.addTo(map);
}

getUserLocation();  // Call to set the initial location
