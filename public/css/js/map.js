const mapDiv = document.getElementById("map");

if(mapDiv){
   const coordinates = JSON.parse(mapDiv.dataset.coordinates);

   const map = L.map('map').setView([coordinates[1], coordinates[0]], 9);

   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
   }).addTo(map);

   L.marker([coordinates[1], coordinates[0]])
      .addTo(map);
}
