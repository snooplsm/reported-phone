import { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import dayjs from "dayjs";

export interface DateRange {
  label: string;
  startDate: Date;
  endDate: Date;
}

interface DateRangeSelectorProps {
  onSelect: (range: DateRange | null) => void;
  defaultValues: DateRange[]
}

const DateRangeSelector = ({ onSelect, defaultValues }: DateRangeSelectorProps) => {
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);

  // Generate last 12 months dynamically
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = dayjs().subtract(i, "month");
    return {
      label: date.format("MMM YY"), // Full month name + Year
      startDate: date.startOf("month").toDate(),
      endDate: date.endOf("month").toDate()
    };
  });

  // Define predefined date ranges
  const dateRanges: DateRange[] = [
    {
      label: "This Month " + dayjs().startOf("month").format("MMM YY"),
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate()
    },
    ...last12Months,
    {
      label: dayjs().startOf("year").format("YYYY"),
      startDate: dayjs().startOf("year").toDate(),
      endDate: dayjs().endOf("year").toDate()
    },
    {
      label: dayjs().subtract(1, "year").startOf("year").format("YYYY"),
      startDate: dayjs().subtract(1, "year").toDate(),
      endDate: dayjs().subtract(1, "year").toDate()
    },
  ];

  useEffect(()=> {
    const selectedValues = dateRanges.filter(range=> {
      return defaultValues.some(x=> {
        return x.startDate.getTime() == range.startDate.getTime() && x.endDate.getTime() == range.endDate.getTime()
      })
    })
    if(selectedValues.length>0) {
      setSelectedRange(selectedValues[0])
    }
  }, [defaultValues])

  return (
    <Autocomplete
      options={dateRanges}
      getOptionLabel={(option) => option.label}
      value={selectedRange}
      onChange={(_, newValue) => {
        setSelectedRange(newValue);
        onSelect(newValue);
      }}
      renderInput={(params) => <TextField {...params} label="Date Range" variant="outlined" />}
      sx={{ minWidth: 250 }}
    />
  );
};

export default DateRangeSelector;