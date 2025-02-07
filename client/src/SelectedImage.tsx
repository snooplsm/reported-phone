import { Box, IconButton, Paper, Typography } from "@mui/material"
import { BuildableComplaint } from "./App"
import { useEffect, useState } from "react"
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { UsableExif } from "./FileUtils";
import CancelIcon from "@mui/icons-material/Cancel";

<CancelIcon sx={{ fontSize: 40, color: "red" }} />

interface SelectedProps {
    complaints?: BuildableComplaint[],
    sx: any,
    onImageSelected?: (image: [BuildableComplaint, UsableExif] | undefined) => void
    onComplaintsChanged?: (complaints: BuildableComplaint[]) => void
}

export const SelectedImage = ({ complaints, sx, onImageSelected, onComplaintsChanged }: SelectedProps) => {

    const [images, setImages] = useState<[BuildableComplaint, UsableExif][]>([]);

    const [maxHeight, setMaxHeight] = useState(200)

    const [width, setWidth] = useState("100%")

    const [selected, setSelected] = useState<[BuildableComplaint, UsableExif]>()

    const onRemoveClicked = (image: [BuildableComplaint, UsableExif]) => {
        const newComplaints = complaints?.map(x => {
            return {
                ...x,
                files: x.files.filter(k => k.file != image[1].file)
            }
        })?.filter(x=>x.files.length>0) || []
        onComplaintsChanged?.(newComplaints)
    }

useEffect(() => {
    const newImages: [BuildableComplaint, UsableExif][] = []
    complaints?.forEach(c => {
        c.files.forEach(file => {
            newImages.push([c, file])
        })
    })
    setImages(newImages)
    const length = newImages?.length || 1
    const rows = Math.ceil(length / 3.0)
    const maxH = 300 / rows
    setMaxHeight(maxH)
    const width = 100 / (length % 3)
    setWidth(`${width}%`)
}, [complaints])

return <Box
    id="myimagescontainer"
    sx={{
        height: 300,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        gap: 2,
        ...sx
    }}>
    {(images?.length || 0) <= 0 && <Box sx={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        display: "flex",
        alignItems: 'center'
    }}><Typography>Choose an image and upload it by clicking an icon above.</Typography>
    </Box>}
    {(images?.length || 0) > 0 && <>
        {images?.map(image =>
            <ReportImage
                image={image}
                width={width}
                maxHeight={maxHeight}
                images={images}
                selected={selected}
                onRemoveClicked={onRemoveClicked}
                setSelected={setSelected}
                onImageSelected={onImageSelected} />
        )}

    </>}

</Box>
}

interface ReportImageProps {
    selected: [BuildableComplaint, UsableExif] | undefined
    setSelected: (selected: [BuildableComplaint, UsableExif] | undefined) => void
    onImageSelected?: (image: [BuildableComplaint, UsableExif] | undefined) => void
    width: string
    maxHeight: number
    image: [BuildableComplaint, UsableExif]
    images: [BuildableComplaint, UsableExif][]
    onRemoveClicked: (image: [BuildableComplaint, UsableExif]) => void
}

const ReportImage = ({ setSelected, onImageSelected, selected, image, width, maxHeight, images, onRemoveClicked }: ReportImageProps) => {
    return <Paper
        elevation={5}
        onClick={() => {
            if (selected == image) {
                setSelected(undefined)
                onImageSelected?.(undefined)
            } else {
                setSelected(image)
                onImageSelected?.(image)
            }
        }}
        sx={{
            width: width,
            cursor: "pointer",
            height: maxHeight,
            borderRadius: "16px", // Ensure Paper has rounded corners

            position: "relative"
        }}
    ><Box
            component={"img"}
            sx={{
                width: "100%",
                height: "100%",
                // aspectRatio: '1/1',
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: "1"
            }}
            src={image[1].url} />
        <Box
            sx={{
                position: "absolute",
                bottom: 2,
                right: 10,
                textAlign: "right",
                color: "#dedede",
                padding: "5px 0",
                fontSize: '.9rem',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
                zIndex: 1, // Ensure it’s above the shadow
            }}
        >
            {image[0].complaint.type}<br />{image[1].geo?.features[0]?.properties?.street_address}
        </Box>
        <IconButton
            onClick={() => {
                onRemoveClicked(image)
            }}
            sx={{
                position: "absolute",
                top: -20,
                left: -20,
                fontSize: 24,
            }}
        >
            <CancelIcon
                sx={{
                    backgroundColor: "white",
                    borderRadius: "50%",
                    padding: "2px",
                }}
            />
        </IconButton>
        {selected && selected[1].file == image[1].file && images.length > 1 && <CheckCircleIcon
            sx={{
                position: "absolute",
                top: -12,
                right: -10,
                color: "#1976d2",
                backgroundColor: "white",
                borderRadius: "50%",
                padding: "2px",
                fontSize: 24,
            }}
        />}
    </Paper>
}