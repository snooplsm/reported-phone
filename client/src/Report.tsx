import { ComplaintType } from "./Complaints"
import { Feature } from "./GeoSearchResponse"

interface Reports {
    reports: Report[]
}

interface Report {
    complaint: ComplaintType
    files: FileUpload[]
    location: Feature
}

interface FileUpload {
    file_name:string
    s3_url: string
    s3_key:string
    bucket_name:string
    width?: number
    height?: number
    duration?: number
    parent?: string
    mime_type: string
}