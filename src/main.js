/* global mapboxgl */

const { getIpfs, PeerLocationEmitter } = require('./ipfs')

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-v9',
  zoom: 2,
  center: [-36.517187, 36.521387]
})

map.addControl(new mapboxgl.NavigationControl(), 'top-left')

getIpfs((err, ipfs) => {
  if (err) throw err

  const markers = {}

  new PeerLocationEmitter(ipfs)
    .on('add', ({ id, location }) => {
      const div = document.createElement('div')
      const img = document.createElement('img')
      img.className = 'peer hidden'
      img.src = 'images/ipfs-logo.png'
      img.width = 16
      div.appendChild(img)

      const popupText = [
        location.city,
        location.region_code,
        location.country_name,
        location.planet
      ].filter(Boolean).join(', ')

      markers[id] = new mapboxgl.Marker(div)
        .setLngLat([location.longitude, location.latitude])
        .setPopup(new mapboxgl.Popup({ closeButton: false }).setText(popupText))
        .addTo(map)

      setTimeout(() => { img.className = 'peer' }, 300)
    })
    .on('remove', id => {
      if (markers[id]) {
        markers[id].remove()
        delete markers[id]
      }
    })
    .on('error', err => console.error('Peer location error', err))
})
