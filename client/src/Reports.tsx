import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getComplaints, getNeighborhood, getReports, subscribeToReports } from "./Api";
import { ComplaintType } from "@reported/shared/src/ComplaintType";
import {ComplaintFieldsFragment, NeighborhoodFieldsFragment, ReportFieldsFragment } from "@reported/shared/src/generated/graphql";
import { ReportsMap } from "./ReportsMap";

export type ReportsParams = {
    complaint?: string; // Define the type parameter as a string
    neighborhood?: string;
  };

  
export const Reports = () => {

    const params = useParams<ReportsParams>()

    const [reports, setReports] = useState<ReportFieldsFragment[]>([])
    const [neighborhood, setNeighborhood] = useState<NeighborhoodFieldsFragment>()
    const [complaints, setComplaints] = useState<ComplaintFieldsFragment[]>()
    
    useEffect(() => {
        console.log("Subscribing to report updates")
        const sub = subscribeToReports([params.neighborhood || "East Kensington"],(reports)=> {
            console.log("new reports", reports)
        }, ()=> {})
        return () => {
            sub.unsubscribe();
        }
    }, [params])

    useEffect(()=> {
        if (!params.complaint || !params.neighborhood) {
            throw new Error("Missing required parameters.");
        }

        const parms = {
            complaint: params.complaint || ComplaintType.missing_crosswalk, // Ensure it's a string
            neighborhood: params.neighborhood || "East Kensington", // Ensure it's a string
        }

        async function fetchReports() {
            
            try {
                const reports = await getReports(parms);                
                setReports(reports)
                // reports[0].location.street
                return reports
            } catch (error) {
                console.error("Error fetching reports:", error);
            }
        }

        async function fetchNeighborhood() {
            try {
                const neighborhood = await getNeighborhood(parms)
                setNeighborhood(neighborhood)
                return neighborhood
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
    },[params])

    return <Box>

        <ReportsMap reports={reports} neighborhood={neighborhood} />
    </Box>
}