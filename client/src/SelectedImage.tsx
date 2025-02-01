import { Box, Paper, Typography } from "@mui/material"
import { BuildableComplaint } from "./App"
import { useEffect, useState } from "react"

interface SelectedProps {
    complaints?:BuildableComplaint[],
    sx: any
}

export const SelectedImage = ({complaints, sx}:SelectedProps) => {

    const [images, setImages] = useState<string[]>()

    const [maxHeight, setMaxHeight] = useState(200)

    const [width, setWidth] = useState("100%")

    useEffect(()=> {
        const images = complaints?.flatMap(x=>x.files).map(x=>URL.createObjectURL(x.file))
        setImages(images)
        const length = images?.length || 1
        const rows = Math.ceil(length / 3.0)
        const maxH = 300 / rows
        setMaxHeight(maxH)
        const width = 100 / (length % 3)
        setWidth(`${width}%`)
    }, [complaints])

    return <Box sx={{
        height: 300,
        ...sx
    }}>
        {(images?.length || 0) <= 0 && <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}><Typography>Choose an image and upload it by clicking an icon above.</Typography>
        </Box>}
        {(images?.length||0)>0 && <>
            {images?.map(image=>
                <Paper
                    elevation={5}
                    sx={{
                        width: width,
                        height: maxHeight,
                        borderRadius: "16px", // Ensure Paper has rounded corners
                        overflow: "hidden"
                    }}
                ><Box
                sx={{
                    width: "100%",
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                    objectPosition: 'center'
                }}
                component={"img"}
                src={image}/>
                </Paper>
            )}
            
        </>}

    </Box>
}