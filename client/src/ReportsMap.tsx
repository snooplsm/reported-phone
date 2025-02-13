import { Box, Card, CardContent, IconButton, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import { NeighborhoodFieldsFragment, ReportFieldsFragment } from "@reported/shared/src/generated/graphql"
import L, { LatLng, LatLngBounds } from "leaflet"
import {TileLayer, Marker, Popup, GeoJSON} from "react-leaflet"
import { useEffect, useState } from "react"
import { MapContainer } from "react-leaflet"
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NeighborhoodAutocomplete from "./NeighborhoodsDropdown"
import { generatePath, useParams, useNavigate, useSearchParams } from "react-router-dom"
import { ReportsParams } from "./Reports"
import {parseDateString} from "./Api"
import ComplaintMultiSelector from "./ComplaintMultiselector"
import DateRangeSelector, { DateRange } from "./DateRangeSelector"
import dayjs from "dayjs"

interface ReportsMapProps {
    reports?: ReportFieldsFragment[]
    neighborhoods?: NeighborhoodFieldsFragment[]
    complaints?: string[]
}

export const ReportsMap = ({ reports = [], neighborhoods, complaints }: ReportsMapProps) => {
    const [userPosition, setUserPosition] = useState<L.LatLng>(new L.LatLng(51.505, -0.09))
    const [map, setMap] = useState<L.Map | null>(null)
    
    const params = useParams<ReportsParams>()
    const navigate = useNavigate()

    const [searchParams] = useSearchParams();

    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    const now = new Date()

    const [start,setStart] = useState<Date | undefined>(parseDateString(startDate) ||  new Date(now.getFullYear(), now.getMonth(), 1))
    const [end,setEnd] = useState<Date | undefined>(parseDateString(endDate, true) ||  new Date(now.getFullYear(), now.getMonth()+1, 0))

    console.log(start)
    console.log(end)

    const goToReports = (neighborhoods:NeighborhoodFieldsFragment[], complaints:string[]) => {
        const url = generatePath("/reports/:neighborhoods/:complaints", {
          neighborhoods: neighborhoods.map(x=>x.name).join("|") || "East Kensington",
          complaints: complaints.join("|")
        });

        const pa =  new URLSearchParams()        
        pa.append('start', (start && dayjs(start).format("YYYYMMDD")) || "")
        pa.append('end', (end && dayjs(end).format("YYYYMMDD")) || "")
        
        navigate(url+"?"+pa.toString());
      };

    useEffect(() => {
        if(reports.length>0 && neighborhoods==null) {
            const bounds = new LatLngBounds(reports.map(x=>x.location.coordinates).map(l=>new LatLng(l.lat,l.lng)))
            if(map) {
                map.setMaxBounds(bounds)
            }            
        }

    }, [reports, map])



    useEffect(()=> {
        if(neighborhoods && neighborhoods.length>0) {
            const lats:LatLng[] = []
            neighborhoods.forEach(neighborhood=> {
                neighborhood.geojson.coordinates.forEach(coord=> {
                    for(const k of coord) {
                        for(const l of k) {
                            lats.push(new LatLng(l[1],l[0]))
                        }
                    }
                })
            })
            
            const bounds = new LatLngBounds(lats)
            if(map) {
                map.whenReady(()=> {
                    map.setMaxBounds(bounds)
                })                
            }
        }
    }, [neighborhoods])

    const geoJsonStyle = {
        color: "blue", // Border color
        weight: 2, // Border thickness
        opacity: 0.8,
        fillColor: "lightblue", // Inside color
        fillOpacity: 0.4,
      };

    return (
        <Box>
            <Box sx={{ marginTop: 1 }}></Box>
            <MapContainer
                style={{ height: '50vh', width: '100%' }}
                ref={(m) => { if (m) setMap(m as L.Map) }}
                center={userPosition}
                zoom={13}
                scrollWheelZoom={true}
            >
                <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                    {neighborhoods?.map(neighborhood=><GeoJSON
                        key={neighborhood.id}
                        data={neighborhood.geojson}
                        style={geoJsonStyle}
                        onEachFeature={(feature, layer) => {
                        if (feature.properties?.name) {
                            layer.bindPopup(feature.properties.name); // Show name in popup
                        }
                        }}
                    /> )}                
                {reports.map(x=> {
                    return <Marker 
                        position={
                            new LatLng(x.location.coordinates.lat, x.location.coordinates.lng)
                        }
                    >
                         <Popup>{x.location.street}</Popup>
                    </Marker>
                })}
            </MapContainer>
            <Box sx={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: 1,
              gap: 1
            }}>
            <NeighborhoodAutocomplete         
                defaultValues={neighborhoods||[]}
                onSelect={(value: NeighborhoodFieldsFragment[]) => {
                    goToReports(value, complaints || [])
            } }/>
            <ComplaintMultiSelector defaultValues={complaints||[]} onSelect={(complaints)=>{
              goToReports(neighborhoods, complaints.map(x=>x.name))
            }}/>
            <DateRangeSelector onSelect={(range)=> {
              setStart(range?.startDate)
              setEnd(range?.endDate)
              
              goToReports(neighborhoods, complaints)
              
            }}
            defaultValues={[{
              label: "",
              startDate: start,
              endDate: end
            } as DateRange]}/>
            </Box>
            <TableContainer component={Paper}>
      <Table>
        {/* ✅ Table Head */}
        <TableHead>
          <TableRow>
            <TableCell>Actions</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Attatchments</TableCell>
          </TableRow>
        </TableHead>

        {/* ✅ Table Body */}
        <TableBody>
          {reports.map((complaint) => (
            <TableRow key={complaint.id}>
              <TableCell>
                <OverflowMenu onDelete={()=> {

                }}/>
                </TableCell>
              <TableCell>{complaint.location.building_number} {complaint.location.street}</TableCell>
              <TableCell>{dayjs(complaint.time).format("M/DD/YY h:mm a")}</TableCell>
              <TableCell>{complaint.files.map((x,index)=><a href={x.url}>{index+1}</a>,)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
        </Box>
    )
}

interface ReportCardProps {
    report: ReportFieldsFragment
}

const ReportCard = ({report}:ReportCardProps) => {
    return <Card>
        <CardContent>
            {report.location.building_number} {report.location.street}
        </CardContent>
    </Card>
}


interface OverflowMenuProps {
    onDelete: ()=> void
}

export const OverflowMenu = ({onDelete}:OverflowMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end", // Move to right
        alignItems: "center",
        position: "relative", // Enable absolute positioning if needed
        p: 1, // Padding for spacing
      }}
    >
      {/* More Options Button */}
      <IconButton
        onClick={handleClick}
        sx={{
          
        }}
      >
        <MoreVertIcon />
      </IconButton>

      {/* Overflow Menu */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={()=>{
            onDelete()
            handleClose()}}>delete</MenuItem>
      </Menu>
    </Box>
  );
};