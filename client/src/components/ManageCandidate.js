import React from 'react'
import Base from './Base'
import { TextField, Stack, Button, Typography, MenuItem } from '@mui/material'
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
const ManageCandidate = () => {
    return (
        <Base>
            <Button startIcon={<ArrowBackIcon />} component={Link} to="/candidates" sx={{ mb: 3 }}>Go back</Button>
            <Stack spacing={3} sx={{ alignItems: "center" }}>
                <Typography variant='h5'>New Candidates</Typography>
                <TextField fullWidth variant='outlined' label="Candidate Voter Id" required />
                <TextField fullWidth variant='outlined' label="Candidate Name" required />
                <TextField fullWidth variant='outlined' label="Email" required />
                <TextField fullWidth variant='outlined' label="Mobile " required />
                <TextField fullWidth variant='outlined' select label="Select Constituency" required >
                    <MenuItem value="1">Mahim</MenuItem>
                    <MenuItem value="2">Bandra</MenuItem>
                </TextField>
                <Button variant="contained">Add</Button>
            </Stack>
        </Base >
    )
}

export default ManageCandidate