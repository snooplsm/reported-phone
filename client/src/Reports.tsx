import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getComplaints, getNeighborhood, getReports, subscribeToReports } from "./Api";
import { ComplaintType } from "@reported/shared/src/ComplaintType";
import {ComplaintFieldsFragment, NeighborhoodFieldsFragment, ReportFieldsFragment } from "@reported/shared/src/generated/graphql";
import { ReportsMap } from "./ReportsMap";

export type ReportsParams = {
    complaints?: string; // Define the type parameter as a string
    neighborhoods?: string;
  };

  
export const Reports = () => {

    const params = useParams<ReportsParams>()

    const [reports, setReports] = useState<ReportFieldsFragment[]>([])
    const [neighborhoods, setNeighborhoods] = useState<NeighborhoodFieldsFragment[]>([])
    const [complaints, setComplaints] = useState<ComplaintFieldsFragment[]>()
    const [selectedComplaints, setSelectedComplaints] = useState<string[]>()

    const [searchParams] = useSearchParams()
    console.log(searchParams.toString())
    useEffect(() => {
        console.log("Subscribing to report updates")
        const sub = subscribeToReports((params.neighborhoods || "East Kensington").split("|"),(reports)=> {
            console.log("new reports", reports)
        }, ()=> {})
        return () => {
            sub.unsubscribe();
        }
    }, [params])

    useEffect(()=> {
        if (!params.neighborhoods) {
            throw new Error("Missing required parameters.");
        }

        const parms = {
            complaints: params.complaints,
            neighborhoods: params.neighborhoods || "East Kensington", // Ensure it's a string
        }
        

        async function prepareComplaints() {
            const complaints = (params.complaints || "").split("|") || []
            setSelectedComplaints(complaints)
        }

        async function fetchReports() {
            
            try {
                const reports = await getReports(parms, searchParams);                
                setReports(reports)
                // reports[0].location.street
                return reports
            } catch (error) {
                console.error("Error fetching reports:", error);
            }
        }

        async function fetchNeighborhood() {
            try {
                const neighborhoods = await getNeighborhood(parms)
                setNeighborhoods(neighborhoods)
                return neighborhoods
            } catch (error) {
                console.error("Error fetching neighborhood:", error)
            }
        }

        async function fetchComplaints() {
            try {
                const complaints = await getComplaints()
                setComplaints(complaints)
                return complaints
            } catch (error) {
                console.error("Error fetching neighborhood:", error)
            }
        }
        
        fetchReports();
        fetchNeighborhood();
        fetchComplaints();
        prepareComplaints();
    },[params])

    return <Box>

        <ReportsMap reports={reports} complaints={selectedComplaints} neighborhoods={neighborhoods} />
    </Box>
}