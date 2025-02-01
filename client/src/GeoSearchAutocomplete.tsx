import React, { useState, useEffect } from "react";
import { Feature, GeoSearchResponse } from "./GeoSearchResponse";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";

interface GeoSearchProps {
    initial?: GeoSearchResponse,
    onChange?: (resp:GeoSearchResponse, value:Feature) => void
}


export const GeoSearchAutocomplete: React.FC<GeoSearchProps> = ({ onChange, initial }) => {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState<GeoSearchResponse>();
  const [options, setOptions] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const [selectedValue, setSelectedValue] = useState<Feature>();
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    if (initial?.features?.length) {
      setOptions(initial.features);
      setSelectedValue(initial.features[0]);
      setInputValue(initial.features[0]?.properties.label || "");
    }
  }, [initial]);

  const fetchGeoSearchResults = async (searchText: string) => {
    try {
      setLoading(true);
      
      const key = `autocomplete_${searchText.toLocaleLowerCase()}`
      let strData = localStorage.getItem(key)
      let data:GeoSearchResponse
      if(strData) {
        data = JSON.parse(strData)
      } else {
        const response = await fetch(
          `https://api.phila.gov/ais_doc/v1/reverse_geocode/search/${encodeURIComponent(searchText)}`
        );
        data= await response.json();
        localStorage.setItem(`autocomplete_${searchText.toLocaleLowerCase()}`, JSON.stringify(data))
      }      
      
      setResponse(data);
      setOptions(data.features || []);
    } catch (error) {
      console.error("Error fetching GeoSearch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value?: Feature) => {
    setSelectedValue(value);
    setInputValue(value?.properties.label || "");
    if (onChange && response) {
      onChange(response, value);
    }
  };

  useEffect(() => {
    if (query.trim().length > 0) {
      fetchGeoSearchResults(query);
    } else {
      setOptions(initial?.features || []);
      setInputValue(initial?.features[0]?.properties.label || "");
      setSelectedValue(initial?.features[0] || undefined);
    }
  }, [query, initial]);

  return (
    <Autocomplete
      open={open}
      value={selectedValue}
      inputValue={inputValue || ""}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      freeSolo={true}
      loading={loading}
      onChange={(event, value) => handleChange(value)}
      getOptionLabel={(option: any) => option?.properties?.label || ""}
      onInputChange={(event, value, reason) => {
        if (reason !== "reset") {
          setQuery(value);
          setInputValue(value);
        }
      }}
      isOptionEqualToValue={(option, value) =>
        option?.properties?.id === value?.properties?.id
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Philly Address"
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
      renderOption={(props, option) => (
        <li {...props}>
          {option.properties.label} {/* Customize display */}
        </li>
      )}
    />
  );
};