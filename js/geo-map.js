// Geolocation and map display using Leaflet.js and OpenStreetMap

document.addEventListener("DOMContentLoaded", function () {
  const getLocationBtn = document.getElementById("getLocationBtn");
  if (!getLocationBtn) return;

  getLocationBtn.addEventListener("click", function () {
    const geoError = document.getElementById("geoError");
    geoError.textContent = "";
    if (!navigator.geolocation) {
      geoError.textContent = "Geolocation is not supported by your browser.";
      return;
    }
    getLocationBtn.disabled = true;
    getLocationBtn.textContent = "Locating...";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        showMap(position.coords.latitude, position.coords.longitude);
        getLocationBtn.disabled = false;
        getLocationBtn.textContent = "Show My Location on Map";
      },
      (err) => {
        geoError.textContent = "Unable to retrieve your location.";
        getLocationBtn.disabled = false;
        getLocationBtn.textContent = "Show My Location on Map";
      }
    );
  });
});

function showMap(lat, lng) {
  const geoMap = document.getElementById("geoMap");
  geoMap.style.display = "block";
  geoMap.innerHTML = "";
  if (window.L && geoMap._leaflet_id) {
    window.L.map(geoMap).remove();
  }
  const map = window.L.map(geoMap).setView([lat, lng], 13);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
  window.L.marker([lat, lng]).addTo(map).bindPopup("You are here!").openPopup();
}
