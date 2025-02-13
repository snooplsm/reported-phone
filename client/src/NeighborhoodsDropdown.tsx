import { useEffect, useState } from "react";
import { Autocomplete, TextField, CircularProgress, Chip } from "@mui/material";
import { NeighborhoodFieldsFragment } from "@reported/shared/src/generated/graphql";
import { getNeighborhoods } from "./api"; // ✅ Replace with actual API call

// Define Props Type
interface NeighborhoodAutocompleteProps {
  onSelect: (values: NeighborhoodFieldsFragment[]) => void;
  defaultValues?: NeighborhoodFieldsFragment[]
  sx?: any
}

const NeighborhoodAutocomplete =  ({ onSelect, sx = {}, defaultValues = [] }:NeighborhoodAutocompleteProps) => {

  console.log("defaultValues", defaultValues)

  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodFieldsFragment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<NeighborhoodFieldsFragment[]>(defaultValues || []);

  useEffect(() => {
    const filteredDefaults = neighborhoods.filter((n) => 
      defaultValues.some((dv) => dv.id === n.id)
    );
    setSelectedNeighborhoods(filteredDefaults);
  }, [neighborhoods, defaultValues])

  useEffect(() => {
    async function fetchNeighborhoods() {
      try {
        const data: NeighborhoodFieldsFragment[] = await getNeighborhoods(); // ✅ Ensure it returns correct type
        setNeighborhoods(data);
      } catch (error) {
        console.error("Failed to load neighborhoods:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNeighborhoods();
  }, []);

  return (
    <Autocomplete
        sx={{
            ...sx
        }
        }
        multiple
      options={neighborhoods}
      value={selectedNeighborhoods}
      getOptionLabel={(option) => option.name} // ✅ Display neighborhood name
      loading={loading}
      onChange={(_, newValue) => {
        setSelectedNeighborhoods(newValue ?? []); // ✅ Prevent null values
        onSelect(newValue ?? []);
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip key={option.id} label={option.name} {...getTagProps({ index })} />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Neighborhoods"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default NeighborhoodAutocomplete;