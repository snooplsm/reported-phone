import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet"
import { DivIcon, Icon, LatLng, LatLngBounds, Map } from "leaflet"
import Box from '@mui/material/Box';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from "react";
import { BuildableComplaint } from "./App";
import { fetchAddress, UsableExif } from "./FileUtils";
import { GeoSearchAutocomplete } from "./GeoSearchAutocomplete";
import { GeoSearchResponse } from "./GeoSearchResponse";

interface GeoIp {
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;

}

interface MapOptions {
  complaints: BuildableComplaint[],
  onComplaintsChanged: (complaints:BuildableComplaint[]) => void,
  selected?: [BuildableComplaint, UsableExif]
  sx?:any
}

type MarkerProps = {
  center: LatLng,
  children: React.ReactNode,
  marker: CustomMapMarker,
  onDragEnd: (latLng: number[], marker:CustomMapMarker) => void
}

interface CustomMapMarker {
  location: LatLng,
  complaint: BuildableComplaint,
  file: UsableExif
}

const myCustomColour = '#cecece'

const markerHtmlStyles = `
  background-color: ${myCustomColour};
  width: 2rem;
  height: 2rem;
  display: block;
  left: -1rem;
  top: -.5rem;
  position: relative;
  border-radius: 2rem 2rem 0;
  transform: rotate(45deg);
  font-size: .7rem;
  border: 2px solid #000000`

const sidewalkIcon = new L.DivIcon({
  className: "my-custom-pin",
  iconAnchor: [0, 32],
  // labelAnchor: [-6, 0],
  popupAnchor: [0, -36],
  html: `<div style="${markerHtmlStyles}"></div>`
  //<div style="transform: rotate(-45deg);">MS</div>
})

const DraggableMarker = ({ center, children, onDragEnd, marker }: MarkerProps) => {
  const [draggable] = useState(true)
  const [position, setPosition] = useState(center)  
  const [mar, setMark] = useState(marker)
  const markerRef = useRef<L.Marker>(null)
  const eventHandlers = useMemo(
      () => ({
          dragend() {
              const marker = markerRef.current
              if (marker != null) {
                  setPosition(marker.getLatLng())
                  onDragEnd([marker.getLatLng().lat, marker.getLatLng().lng], mar)
              }
          },
      }),
      [],
  )

  useEffect(() => {
      setPosition(center)
  }, [center])

  return (
      <Marker
          draggable={draggable}
          eventHandlers={eventHandlers}
          icon={sidewalkIcon}
          position={position}
          ref={markerRef}>
          {children}
      </Marker>
  )
}

export const SelectedMap = ({complaints, onComplaintsChanged, selected, sx}:MapOptions) => {

  const [userPosition, setUserPosition] = useState<LatLng>(new LatLng(51.505, -0.09))

  const [map, setMap] = useState<L.Map>()

  const [markers, setMarkers] = useState<CustomMapMarker[]>()

  const [initial, setInitial] = useState<GeoSearchResponse>()

  const onChange = (geo:GeoSearchResponse) => {
    if (geo) {
      changeComplaints([geo.features[0].geometry.coordinates[1], geo.features[0].geometry.coordinates[0]], geo,
        selected || [markers![0].complaint, markers![0].file,])
      
    }
  }


  const onDragEnd = (latLng: number[], marker:CustomMapMarker) => {
    const fetch = async (): Promise<GeoSearchResponse> => {
        const results = await fetchAddress(latLng[0], latLng[1])
        console.log(results)
        if (results) {
            return results
        } else {
            throw Error("I dunno")
        }
    }
    fetch()
        .then(ok => {
          changeComplaints(latLng, ok, [marker.complaint, marker.file])
        })
  }

  const changeComplaints = (latLng: number[], geo:GeoSearchResponse, complaint:[BuildableComplaint,UsableExif]) => {
    let matched = false
    const complaints2 = complaints.map(c =>
      c == complaint[0]
          ? { 
              ...c, 
              files: c.files.map(file=> {
                if(file.file==complaint[1].file) {
                  matched = true
                  return {
                    ...file,
                    geo: geo,
                    location: new LatLng(latLng[0],latLng[1])
                  }
                } else {
                  return file
                }
              }), 
          }
          : c
      );
      const newAddress = geo.features[0].properties.street_address
      onComplaintsChanged(complaints2)
      setInitial(geo)
  }

  useEffect(()=> {
    if(selected) {
      setInitial(selected[1].geo)
    }
  }, [selected])
  

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
    let init:GeoSearchResponse | undefined = undefined
    complaints.forEach(complaint=> {
      complaint.files.forEach(x=> {
        const mapMarker:CustomMapMarker = {
          location: x.location!,
          complaint: complaint,
          file: x
        }
        if(x.geo) {
          init = x.geo
        }
        mapMarkers.push(mapMarker)        
      })
    })
    setMarkers(mapMarkers)
    if(init) {
      setInitial(init)
    }
  }, [complaints])

  return (
    <Box sx={{
      // backgroundColor: "red",
      ...sx
    }}>
    <GeoSearchAutocomplete initial={initial} onChange={onChange}/>
    <Box sx={{
      marginTop: 1
    }}></Box>
    <MapContainer style={{
      height: '30vh',
      width: '100%',
    }} 
    ref={(m) => setMap(m as L.Map)}
    center={userPosition} zoom={16} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers && markers.length>0 && markers.map(x=> {
        return <DraggableMarker marker={x} center={x.location} onDragEnd={onDragEnd}>
          &&
          <Tooltip 
            opacity={.55}
            offset={[20, 0]}      
          >
            <Box component={"img"} sx={{
              width: "100px",
              height: "100px"
            }}
            src={URL.createObjectURL(x.file.file)}
            ></Box><br/>
            {x.complaint.complaint.type}<br/>
            {x.file.geo?.features[0].properties.street_address}
          </Tooltip>
        </DraggableMarker>
      })}
      {markers?.length==0 && <Marker position={userPosition}/>}
      
    </MapContainer>
    </Box>
  )
}