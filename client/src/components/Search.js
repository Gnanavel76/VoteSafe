import React from 'react'
import { InputBase } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';

const Search = (props) => {
    const { value, onChange, placeholder } = props
    return (
        <InputBase value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "Search..."} endAdornment={<SearchIcon sx={{ ml: 1 }} />} sx={{ bgcolor: 'white', py: 1.2, px: 2.3, boxShadow: 1, borderRadius: 10, mb: 2, width: '100%' }} />
    )
}

export default Search