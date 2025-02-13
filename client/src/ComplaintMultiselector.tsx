import { useEffect, useState } from "react";
import { Autocomplete, TextField, Chip } from "@mui/material";
import { complaintTypesJson } from "@reported/shared/src/ComplaintType";

// Assuming complaintTypesJson is imported from where ComplaintType is defined

// Define the type for complaints
interface ComplaintFieldsFragment {
  name: string;
}

interface ComplaintSelectorProps {
  onSelect: (values: ComplaintFieldsFragment[]) => void;
  defaultValues: string[]
}

const ComplaintMultiSelector = ({ onSelect, defaultValues }: ComplaintSelectorProps) => {
  const [selectedComplaints, setSelectedComplaints] = useState<ComplaintFieldsFragment[]>([]);

  useEffect(()=> {
    const filteredDefaults = complaintTypesJson.filter((n) => 
      defaultValues.some((dv) => dv === n.name)
    );
    setSelectedComplaints(filteredDefaults)
  }, [defaultValues])

  return (
    <Autocomplete
      multiple
      options={complaintTypesJson} // Use complaintTypesJson as options
      getOptionLabel={(option) => option.name} // Display the name
      value={selectedComplaints}
      onChange={(_, newValue) => {
        setSelectedComplaints(newValue);
        onSelect(newValue);
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip key={option.name} label={option.name} {...getTagProps({ index })} />
        ))
      }
      renderInput={(params) => <TextField {...params} label="Select Complaints" variant="outlined" />}
      sx={{ width: 300 }} // Adjust size if needed
    />
  );
};

export default ComplaintMultiSelector;