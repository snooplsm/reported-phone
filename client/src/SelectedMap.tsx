import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet"
import { LatLng, LatLngBounds, Map } from "leaflet"
import Box from '@mui/material/Box';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from "react";
import { BuildableComplaint } from "./App";
import { Complaint } from "./Complaints";
import { UsableExif } from "./FileUtils";

interface GeoIp {
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;

}

interface MapOptions {
  complaints: BuildableComplaint[],
  sx?:any
}

interface CustomMapMarker {
  location: LatLng,
  complaint: Complaint,
  file: UsableExif
}

export const SelectedMap = ({complaints, sx}:MapOptions) => {

  const [userPosition, setUserPosition] = useState<LatLng>(new LatLng(51.505, -0.09))

  const [map, setMap] = useState<L.Map>()

  const [markers, setMarkers] = useState<CustomMapMarker[]>()

  useEffect(() => {
    const fetchGeoLocation = async () => {
      // Check for cached data
      let geo: GeoIp | null = null;
      const cachedGeo = localStorage.getItem("geoLocation");

      if (cachedGeo) {
        geo = JSON.parse(cachedGeo);
      } else {
        // If no cache, fetch the data
        const response = await fetch("https://ipapi.co/json/");
        geo = await response.json();
        // Cache the result
        localStorage.setItem("geoLocation", JSON.stringify(geo));
      }

      // After cache or fetch, set user position
      if (geo) {
        const loc = new LatLng(geo.latitude, geo.longitude);
        setUserPosition(loc);
        if (map) {
          console.log(loc)
          map.setView(loc, map.getZoom());
        }
      }
    };

    fetchGeoLocation().catch(console.error);
  }, [map]);

  useEffect(()=> {
    if(!complaints || complaints.length==0) {
      return
    }
    const latLngs = complaints?.flatMap(x=>x.files.map(x=>x.location)).filter(x=>x!=null)
    const bounds = new LatLngBounds(latLngs)
    if(map) {
      map.setMaxBounds(bounds)
      map.setView(bounds.getCenter(), map.getZoom())
    }
    const mapMarkers:CustomMapMarker[] = []
    complaints.forEach(complaint=> {
      complaint.files.forEach(x=> {
        const mapMarker:CustomMapMarker = {
          location: x.location!,
          complaint: complaint.complaint,
          file: x
        }
        mapMarkers.push(mapMarker)
        setMarkers(mapMarkers)
      })
    })
  }, [complaints])

  return (
    <Box sx={{
      backgroundColor: "red",
      ...sx
    }}>
    <MapContainer style={{
      height: '30vh',
      width: '100%',
    }} 
    ref={(m) => setMap(m as L.Map)}
    center={userPosition} zoom={14.3} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers && markers.length>0 && markers.map(x=> {
        return <Marker position={x.location}>
          <Tooltip>
            {x.complaint.type}<br/>
            {x.file.geo?.features[0].properties.street_address}
          </Tooltip>
        </Marker>
      })}
      {markers?.length==0 && <Marker position={userPosition}/>}
      
    </MapContainer>
    </Box>
  )
}