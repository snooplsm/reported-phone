import { BuildableComplaint } from "./App";

import { client } from './ApolloClient'
import { PresignedUrlInput, Mut, PresignedUrlsDocument, PresignedUrlsMutation, PresignedUrl, CreateReportsMutation, CreateReportsDocument, Report, ReportInput, LocationInput, CoordinatesInput, FileInput, GetAllNeighborhoodsQuery, GetAllNeighborhoodsDocument, GetReportsForNeighborhoodQuery, GetReportsForNeighborhoodDocument, ReportFilterInput, ReportFieldsFragment, NeighborhoodFieldsFragment, GetNeighborhoodQuery, GetNeighborhoodDocument, GetAllComplaintsQuery, GetAllComplaintsDocument, ComplaintFieldsFragment } from "@reported/shared/src/generated/graphql.ts";

import axios from "axios";
import { ReportsParams } from "./Reports";

axios.interceptors.request.use((config) => {
    console.log("🚀 Final Headers Before Sending:", config.headers);
    return config;
});


const saveBlobToFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Free up memory
};

const uploadFileXHR = (file: File, presignedUrl: PresignedUrl) => {
    return new Promise<boolean>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(presignedUrl.method, presignedUrl.url, true);

        // ✅ Set required headers
        xhr.setRequestHeader("content-type", presignedUrl.contentType); // 🔹 Ensure Content-Type is correct
        xhr.setRequestHeader("If-None-Match", "*")
        // 🔥 Track upload progress
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                console.log(`📤 Upload progress: ${percent}%`);
            }
        };

        // ✅ Handle upload success
        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status==412) {
                console.log("✅ Upload successful!");
                resolve(true);
            } else {
                console.error("❌ Upload failed:", xhr.status, xhr.responseText);
                reject(false);
            }
        };

        // ❌ Handle network errors
        xhr.onerror = () => {
            console.error("❌ Upload failed due to network error.");
            reject(false);
        };

        // 🚀 Send the file
        xhr.send(file);
    });
};

const uploadFile = async (file: File, u: PresignedUrl): Promise<boolean> => {
    const response = await uploadFileXHR(file, u)
    return response
}

export const getReports = async(params:ReportsParams): Promise<ReportFieldsFragment[]> => {

    const filters: ReportFilterInput = {
        ...(params.complaint && { complaint: params.complaint }),
        neighborhood: params.neighborhood || "Fishtown",        
    };
    const resp = await client.query<GetReportsForNeighborhoodQuery>({
        query: GetReportsForNeighborhoodDocument,
        variables: {
            filters
        }
    })
    return resp.data.reportsForNeighborhood || []
}

export const getNeighborhood = async(params:ReportsParams): Promise<NeighborhoodFieldsFragment> => {

    const name = params.neighborhood || "East Kensington"
    const resp = await client.query<GetNeighborhoodQuery>({
        query: GetNeighborhoodDocument,
        variables: {
            name
        }
    })
    return resp.data.neighborhood!
}

export const getComplaints = async(): Promise<ComplaintFieldsFragment[]> => {

    const resp = await client.query<GetAllComplaintsQuery>({
        query: GetAllComplaintsDocument,
        variables: {
            
        }
    })
    return resp.data.complaints!
}


export const uploadReport = async (complaints: BuildableComplaint[]): Promise<any> => {

    const files = complaints.flatMap(x => x.files)
    const keys = files.map(x => {
        return {
            key: `${x.hash}${x.file.name.includes(".") ? x.file.name.substring(x.file.name.lastIndexOf(".")) : ".jpg"}`,
            contentType: x.file.type
        }
    })
    const resp = await client.mutate<PresignedUrlsMutation>({
        mutation: PresignedUrlsDocument,
        variables: {
            keys
        }
    })

    const urls = resp!.data!.presignedUrls!.map(x => x!)

    const fileToUrl = new Map(files.map((x,index)=> [x, urls[index]]))

    const results = await Promise.all(urls!.map(async (presigned, index) => {
        return await uploadFile(files[index].file, presigned!)
    }))

    if (results.every(x => x == true)) {

        const reports = complaints.map((complaint) => {
            const geo = complaint.files.find(file => file.geo && file.location);
            if (!geo) throw new Error("No valid geo location found in files");

            const feature = geo!.geo!.features[0];
            if (!feature) throw new Error("No features found in geo data");

            const { properties, geometry } = feature;

            const location: LocationInput = {
                building_number: properties.address_low,
                city: properties.city || "Philadelphia",
                state: properties.state || "PA",
                street: properties.street_full!,
                zip: properties.zip_code!,
                coordinates: {
                    lat: geometry.coordinates[1],
                    lng: geometry.coordinates[0]
                } as CoordinatesInput
            };
            const files = complaint.files.map(x=> {
                const p = fileToUrl.get(x)!
                return {
                    bucket_name: p.bucketName,
                    key: p.key,
                    url: p.url,
                    mime_type: p.contentType,
                    file_name: x.file.name,
                    file_size: x.file.size,
                    width: x.width,
                    height: x.height
                } as FileInput
            })
            return {
                complaint: complaint.complaint.type,
                time: complaint.time,
                location: location,
                files
            } as ReportInput
        })
        const report = await client.mutate<CreateReportsMutation>({
            mutation: CreateReportsDocument,
            variables: {
                reports
            }
        })
        console.log(report)
    }
    console.log("uploaded")
}