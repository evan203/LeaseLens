import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'

const WISCONSIN_CAPITOL = [-89.3843, 43.0747]

export default function App() {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: WISCONSIN_CAPITOL,
      zoom: 13,
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')
  }, [])

  return (
    <div className="app-container">
      <div ref={mapContainer} className="map-container" />
      <div className="sidebar">
        <h1>LeaseLens</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
          fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium 
          doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
          veritatis et quasi architecto beatae vitae dicta sunt explicabo.
        </p>
      </div>
    </div>
  )
}
