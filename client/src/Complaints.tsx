import { Box, Paper, Typography } from "@mui/material"
import { ChangeEvent, useRef } from "react"
import { exifGetter, UsableExif } from "./FileUtils"

export enum ComplaintType {
    blocked_bike_lane = 'blocked bike lane',
    blocked_crosswalk = 'blocked crosswalk',
    missing_crosswalk = 'missing crosswalk'
}

export interface Complaint {
    type: ComplaintType
    svg?: string
}

export const complaints: Complaint[] = [{
    type: ComplaintType.blocked_bike_lane,
    svg: 'bikelane.svg'
},
{
    type: ComplaintType.blocked_crosswalk,
    svg: 'crosswalk.svg'
},
{
    type: ComplaintType.missing_crosswalk,
    svg: 'missingcrosswalk.svg'
}
]

interface ComplaintProps {
    complaint: Complaint,
    onFiles?: (complaint:Complaint, file:UsableExif[])=>void
}

export const ComplaintView = ({ complaint, onFiles = ()=>{} }: ComplaintProps) => {

    const onFile = async (e:ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.currentTarget.files || [])
        const metaFile = await Promise.all(files.map(async (x) => await exifGetter(x)));
        onFiles(complaint, metaFile)
    }

    const onClickComplaint = async () => {
        hiddenInput.current?.click()
    }

    const hiddenInput = useRef<HTMLInputElement>(null)

    return <Paper
        elevation={3}
        onClick={onClickComplaint}
        sx={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            aspectRatio: '1/1'
        }}>
        <input onChange={onFile} ref={hiddenInput} multiple hidden type="file" accept="image/jpeg, image/heic, video/*" />
        <Box
            sx={{
                height: '120px',
                objectFit: 'cover'
            }}
            component="img"
            src={`${import.meta.env.BASE_URL}images/complaint/${complaint.svg}`}
        />
        <Box
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                //   backgroundColor: 'rgba(0, 0, 0, 0.1)', // Semi-transparent overlay
            }}
        >

            {/* Main Text */}
            <Typography
                variant="caption"
                color="white" // Main text color
                sx={{
                    fontSize: '.8rem',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
                    zIndex: 1, // Ensure it’s above the shadow
                }}
            >
                {complaint.type}
            </Typography>
        </Box>
    </Paper>
}

interface ComplaintsProps {
    onFiles?: (complaint:Complaint, file:UsableExif[])=>void
}

export const Complaints = ({onFiles = ()=> {}}:ComplaintsProps) => {
    return <Box sx={{
        gap: 2,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    }}>
        {complaints.map(x => {
            return <ComplaintView complaint={x} onFiles={onFiles} />
        })}
    </Box>
}