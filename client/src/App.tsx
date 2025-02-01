import './App.css'
import Box from '@mui/material/Box';
import { Complaint, Complaints } from './Complaints';
import { SelectedImage } from './SelectedImage';
import { SelectedMap } from './SelectedMap';
import { useState } from 'react';
import { UsableExif } from './FileUtils';

export interface BuildableComplaint {
  complaint: Complaint
  files: UsableExif[]
}

function App() {

  const [complaints, setComplaints] = useState<BuildableComplaint[]>([])

  const onFiles = async (complaint: Complaint, files: UsableExif[]) => {
    let existing = complaints.find(x => x.complaint == complaint)
    const newComplaints = [...complaints]
    if (!existing) {
      existing = {
        complaint,
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
        }} complaints={complaints}/>
        <SelectedMap
          sx={{
            marginTop: 1
          }}
         complaints={complaints}/>
      </Box>
    </Box>
    </>
  )
}

export default App
