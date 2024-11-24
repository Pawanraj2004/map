document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(map);

  const places = [
    {
      name: "Wildlife Crossing, I-75 Florida, USA",
      freq: 15,
      coords: [27.994402, -81.760254],
    },
    { name: "NH-66, Karnataka, India", freq: 12, coords: [13.0139, 74.7963] },
    { name: "Bruce Highway, Australia", freq: 9, coords: [-19.271, 146.817] },
    { name: "Route 93, Alberta, Canada", freq: 8, coords: [51.1784, -115.5708] },
  ];

  const locationInput = document.getElementById("location-input");
  const reportButton = document.getElementById("report-button");
  const liveLocationButton = document.getElementById("live-location-button");

  const getAccidentIcon = (frequency, isNew = false) => {
    const color = isNew ? "blue" : frequency >= 10 ? "red" : "green";
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  const getAddressFromCoordinates = async (lat, lon) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    );
    const data = await response.json();
    return `${data.address?.road || ""}, ${data.address?.city || ""}`;
  };

  const getCoordsByPlaceName = async (name) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        name
      )}`
    );
    const data = await response.json();
    return data.length ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
  };

  places.forEach((place) => {
    L.marker(place.coords, { icon: getAccidentIcon(place.freq) })
      .addTo(map)
      .bindPopup(`<b>${place.name}</b><br>Accidents Reported: ${place.freq}`);
  });

  reportButton.addEventListener("click", async () => {
    const location = locationInput.value.trim();
    if (!location) {
      alert("Please enter a location.");
      return;
    }

    const coords = await getCoordsByPlaceName(location);
    if (coords) {
      L.marker(coords, { icon: getAccidentIcon(0, true) })
        .addTo(map)
        .bindPopup(`<b>${location}</b><br>New accident reported here.`)
        .openPopup();
      map.setView(coords, 10);
    } else {
      alert("Location not found.");
    }
  });

  liveLocationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await getAddressFromCoordinates(latitude, longitude);
        L.marker([latitude, longitude], { icon: getAccidentIcon(0, true) })
          .addTo(map)
          .bindPopup(`<b>Your Location</b><br>${address}`)
          .openPopup();
        map.setView([latitude, longitude], 10);
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  });
});
