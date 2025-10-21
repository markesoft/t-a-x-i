<template>
  <div>

    <div id="BackBtn" class="absolute z-50 rounded-full bg-white p-1 top-8 left-4" @click="goBack()">
      <ArrowLeftIcon :size="40" />
    </div>

    <div id="map" />

    <div id="VehicleSelection" class=" w-full">
      <div class="w-full h-2 border-t"></div>
      <div class="w-full text-center border-t-2 p-1.5 text-gray-700 text-lg font-semibold">
        Distance - {{ distance.text }}
      </div>

      <div class="scrollSection">

        <div class="bg-custom-gray">
          <div class="flex items-center px-4 py-5">
            <img width="75" src="/img/uber/ride.png">
            <div class="w-full ml-3">
              <div class="flex items-center justify-between">
                <div class="text-2xl mb-1">UberX</div>
                <div class="text-xl">{{ calculatePrice(1, distance.value) }}</div>
              </div>
              <div class="text-gray-500">{{ duration.text }}</div>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center px-4 py-5">
            <img width="75" src="/img/uber/comfort.png">
            <div class="w-full ml-3">
              <div class="flex items-center justify-between">
                <div class="text-2xl mb-1">Comfort</div>
                <div class="text-xl">£{{ calculatePrice(1.25, distance.value) }}</div>
              </div>
              <div class="text-gray-500">{{ duration.text }}</div>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center px-4 py-5">
            <img width="75" src="/img/uber/uberxl.png">
            <div class="w-full ml-3">
              <div class="flex items-center justify-between">
                <div class="text-2xl mb-1">UberXL</div>
                <div class="text-xl">£{{ calculatePrice(1.5, distance.value) }}</div>
              </div>
              <div class="text-gray-500">{{ duration.text }}</div>
            </div>
          </div>
        </div>

      </div>

      <div class="
          flex 
          items-center 
          justify-center 
          bg-white
          py-6 
          px-4
          w-full 
          absolute 
          bottom-0 
          shadow-inner
        ">
        <button class="
            bg-black 
            text-2xl 
            text-white
            py-4 
            px-4 
            rounded-sm
            w-full
          ">
          Confirm UberX
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import ArrowLeftIcon from 'vue-material-design-icons/ArrowLeft.vue';
import { useDirectionStore } from '@/stores/direction-store';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const router = useRouter()
const direction = useDirectionStore()

const distance = ref({ text: '', value: null })
const duration = ref({ text: '', value: null })
const latLng = ref({ start: { lat: null, lng: null }, end: { lat: null, lng: null } })
const map = ref(null)
const routingControl = ref(null)

onMounted(async () => {
  if (!direction.pickup || !direction.destination) { router.push('/') }
  setTimeout(() => { initMap() }, 50)
})

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove();
  }
})

const goBack = () => {
  router.push('/directions')
  direction.pickup = ''
  direction.destination = ''
}

const initMap = async () => {
  // Create the map
  map.value = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView([51.505, -0.09], 13);

  // Add tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value);

  if (direction.pickup && direction.destination) {
    await getDistance();
    getDirections();
  }

  return map.value;
}

const getDirections = async () => {
  try {
    // Get geocoded coordinates for pickup and destination
    const pickupCoords = await geocodeAddress(direction.pickup);
    const destinationCoords = await geocodeAddress(direction.destination);
    
    if (pickupCoords && destinationCoords) {
      latLng.value.start = pickupCoords;
      latLng.value.end = destinationCoords;
      
      // Create routing control
      if (routingControl.value) {
        map.value.removeControl(routingControl.value);
      }
      
      routingControl.value = L.Routing.control({
        waypoints: [
          L.latLng(pickupCoords.lat, pickupCoords.lng),
          L.latLng(destinationCoords.lat, destinationCoords.lng)
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        lineOptions: {
          styles: [
            { color: '#212121', weight: 6 }
          ]
        },
        createMarker: function(i, waypoint, n) {
          const marker = L.marker(waypoint.latLng, {
            draggable: false,
            icon: DefaultIcon
          });
          return marker;
        }
      }).addTo(map.value);
      
      // Fit bounds to show the entire route
      const bounds = L.latLngBounds([
        [pickupCoords.lat, pickupCoords.lng],
        [destinationCoords.lat, destinationCoords.lng]
      ]);
      map.value.fitBounds(bounds, { padding: [50, 50] });
    }
  } catch (error) {
    console.error('Error getting directions:', error);
  }
}

// Helper function to geocode addresses
const geocodeAddress = async (address) => {
  try {
    // Using Nominatim for geocoding (OpenStreetMap's geocoding service)
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

const getDistance = async () => {
  let res = await $fetch('/api/distance/' + direction.pickup + '/' + direction.destination)

  distance.value.text = res.data.rows[0].elements[0].distance.text
  distance.value.value = res.data.rows[0].elements[0].distance.value
  duration.value.text = res.data.rows[0].elements[0].duration.text
  duration.value.value = res.data.rows[0].elements[0].duration.value
}

const calculatePrice = (multiplier, price) => {
  let res = (price / 900) * multiplier
  return res.toFixed(2)
}
</script>

<style lang="scss">
#map {
  width: 100%;
  height: 45vh;
  top: 0px;
  left: 0px;
  z-index: 1;
}

/* Hide Leaflet attribution */
.leaflet-control-attribution {
  display: none;
}

/* Style Leaflet routing control */
.leaflet-routing-container {
  display: none;
}

#VehicleSelection {
  .scrollSection {
    height: calc(50vh - 120px);
    position: absolute;
    overflow-y: auto;
    width: 100%
  }

  .bg-custom-gray {
    background-color: rgb(237, 237, 237);
  }
}
</style>