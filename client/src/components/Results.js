import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { InputAdornment, TextField, Stack, Button, Box, Typography, Container, Modal, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody, IconButton, Chip, Breadcrumbs, Tooltip, Checkbox, Grid, Avatar, MenuItem } from '@mui/material'
import { Link as RLink, useNavigate, Navigate, Link } from "react-router-dom"
import Navbar from './Navbar'
import useDisclose from '../hooks/useDisclosure'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers'
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from "react-hook-form";
import LoadingButton from '@mui/lab/LoadingButton';
import * as yup from "yup";
import dayjs from "dayjs"
import { useElection } from '../store/ElectionProvider'
import { API_BASE_URL } from '../config'
import { toast } from 'react-toastify'
import { MdModeEdit, MdOutlineClose, MdRemoveRedEye } from "react-icons/md";
import { AiFillEyeInvisible } from "react-icons/ai";
import ElectionForm from './Forms/ElectionForm'
import Base from './Base'
import { useParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import Search from './Search'
import VoterForm from './Forms/VoterForm'
import { formatBytes } from '../util'
import VoterCard from './VoterCard'
const Results = () => {
    const { user } = useElection()
    const { electionId } = useParams()
    const [constituency, setConstituency] = useState([])
    const [candidates, setCandidates] = useState([])
    const [selectedConstituency, setSelectedConstituency] = useState("")
    const getAllConstituency = () => {
        axios
            .get(`${API_BASE_URL}/getAllConsituency/${electionId}`, {
                headers: { 'Authorization': `Bearer ${user.authToken}` }
            })
            .then((res) => {
                console.log("Consituency: ", res.data);
                setConstituency(res.data);
            });
    }
    const getCandidateVotes = () => {
        if (selectedConstituency !== "") {
            axios
                .post(`${API_BASE_URL}/getCandidateVotes/${electionId}`, {
                    consituencyKey: selectedConstituency
                }, {
                    headers: { 'Authorization': `Bearer ${user.authToken}` }
                })
                .then((res) => {
                    setCandidates(res.data.votes)
                });
        }
    }
    useEffect(() => {
        getAllConstituency()
    }, [])
    useEffect(() => {
        getCandidateVotes()
    }, [selectedConstituency])
    console.log(selectedConstituency);
    return (
        <Base>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Typography color="text.primary" component={Link} to={`/elections`}>Elections</Typography>
                <Typography color="text.primary">{electionId}</Typography>
            </Breadcrumbs>
            <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>Results</Typography>
            <TextField select fullWidth variant='outlined' label="Select Constituency" value={selectedConstituency} onChange={(e) => setSelectedConstituency(e.target.value)}>
                <MenuItem value="">Select Constituency</MenuItem>
                {constituency.map((option) => (
                    <MenuItem key={option.consituencyId} value={option.consituencyKey}>
                        {option.consituencyId + " - " + option.name}
                    </MenuItem>
                ))}
            </TextField>
            {
                candidates.length > 0 ?
                    candidates.map(c => {
                        return <Stack direction="row" spacing={2} sx={{ alignItems: 'center', bgcolor: 'white', padding: 2, borderRadius: 3 }}>
                            <img src={c.partyImage} alt="" style={{ borderRadius: "50%", width: "60px", height: "60px", margin: "0 auto" }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ mb: 0.2 }}>{c.name}</Typography>
                                <Typography variant="caption1">{c.party || 'Unaffiliated'}</Typography>
                            </Box>
                            <Typography variant="h6">Votes: {c.votes}</Typography>
                        </Stack>
                    })
                    :
                    <Typography variant="h6">No candidates found</Typography>
            }
        </Base>
    )
}

export default Results