import './App.css'
import Box from '@mui/material/Box';
import { Complaint, Complaints } from './Complaints';
import { SelectedImage } from './SelectedImage';
import { SelectedMap } from './SelectedMap';
import { useEffect, useState } from 'react';
import { UsableExif } from './FileUtils';
import { LoadingButton } from "@mui/lab";
import { uploadReport } from './Api';
import { useNavigate } from 'react-router-dom';

export interface BuildableComplaint {
  complaint: Complaint,
  time: Date,
  files: UsableExif[]
}

function App() {

  const [complaints, setComplaints] = useState<BuildableComplaint[]>([])

  const [selected, setSelected] = useState<[BuildableComplaint,UsableExif]>()

  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate();

  const saveReport = () => {
    setSubmitting(true)
    uploadReport(complaints)
    .then(ok=> {
      
    }).finally(()=> {
      setSubmitting(false)
    })
  }

  const onFiles = async (complaint: Complaint, files: UsableExif[]) => {
    let existing = complaints.find(x => x.complaint == complaint)
    const newComplaints = [...complaints]
    if (!existing) {
      existing = {
        complaint,
        time: files[0].time!,
        files
      }
      newComplaints.push(existing)
    } else {
      const set = new Set(existing.files)
      for (const file of files) {
        if (!set.has(file)) {
          existing.files.push(file)
          set.add(file)
        }
      }      
    }
    setComplaints(newComplaints)
    console.log(newComplaints)
  }

  return (
    <><Box>
      <Complaints onFiles={onFiles} />
      <Box sx={{
        alignItems: 'center'
      }}>
        <SelectedImage sx={{
          marginTop: 1
        }} complaints={complaints}
        onImageSelected={setSelected}
        onComplaintsChanged={(comp)=> setComplaints(comp)}
        />
        <SelectedMap
          sx={{
            marginTop: 2
          }}
         complaints={complaints}
         selected={selected}
         onComplaintsChanged={(comp)=> setComplaints(comp)}
         />
      </Box>
      <LoadingButton sx={{
        height: "10vh",
        marginTop: 1,
        minWidth: 200,
        fontSize: 20
      }}
      loading={submitting} 
      disabled={complaints.length==0}
      variant="contained"
      onClick={saveReport}>Save</LoadingButton>
    </Box>
    </>
  )
}

export default App
