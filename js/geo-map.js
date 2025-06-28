// Geolocation: display only coordinates, not a map

document.addEventListener("DOMContentLoaded", function () {
  const getLocationBtn = document.getElementById("getLocationBtn");
  if (!getLocationBtn) return;

  getLocationBtn.addEventListener("click", function () {
    const geoError = document.getElementById("geoError");
    const geoCoords = document.getElementById("geoCoords");
    geoError.textContent = "";
    geoCoords.textContent = "";
    if (!navigator.geolocation) {
      geoError.textContent = "Geolocation is not supported by your browser.";
      return;
    }
    getLocationBtn.disabled = true;
    getLocationBtn.textContent = "Locating...";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        geoCoords.textContent = `Latitude: ${position.coords.latitude.toFixed(
          6
        )}, Longitude: ${position.coords.longitude.toFixed(6)}`;
        getLocationBtn.disabled = false;
        getLocationBtn.textContent = "Show My Location Coordinates";
      },
      (err) => {
        geoError.textContent = "Unable to retrieve your location.";
        getLocationBtn.disabled = false;
        getLocationBtn.textContent = "Show My Location Coordinates";
      }
    );
  });
});
