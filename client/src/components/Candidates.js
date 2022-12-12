import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { InputAdornment, TextField, Stack, Button, Box, Typography, Container, Modal, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody, IconButton, Chip, Breadcrumbs, Tooltip, Checkbox, Grid } from '@mui/material'
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
import { useElection } from '../store/ElectionProvider'
import { API_BASE_URL } from '../config'
import { toast } from 'react-toastify'
import { MdModeEdit, MdRemoveRedEye } from "react-icons/md";
import { AiFillEyeInvisible } from "react-icons/ai";
import ElectionForm from './Forms/ElectionForm'

import Base from './Base'
import { useParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import Search from './Search'
import ConsituencyForm from './Forms/ConsituencyForm'
import dayjs from 'dayjs'
import CandidateForm from './Forms/CandidateForm'
import { formatBytes } from '../util'
import CandidateCard from './CandidateCard'
const FILE_SIZE = 26214400
const SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png']
const schema = yup.object().shape({
    candidateId: yup.string().trim().required("Candidate id is required").matches(/^[A-Za-z0-9]+$/, "Should contain only alphabets and digits").min(2, "Should contain atleast 2 characters").max(12, "Should not exceed 12 characters"),
    voterId: yup.string().trim().required("Select voter"),
    consituencyKey: yup.string().trim().required("Select constituency"),
    party: yup.string().nullable().notRequired()
        .when('party', {
            is: (value) => value?.length,
            then: (yup) => yup.matches(/^[A-Za-z]+$/, "Should contain only alphabets").min(2, 'Should contain atleast 2 alphabets').max(20, 'Should not exceed 20 alphabets'),
        }),
    partyImage: yup.mixed()
        .required("Please select a image")
        .test(
            'fileSize',
            `File size exceeds ${formatBytes(FILE_SIZE)}`,
            value => value && value.size <= FILE_SIZE
        )
        .test(
            'fileType',
            `Only ${SUPPORTED_FORMATS.join(", ")} allowed`,
            value => value && SUPPORTED_FORMATS.includes(value.type?.split("/")[1])
        ),
}, [["party", "party"]]);

const defaultFormValues = {
    candidateId: '',
    voterId: '',
    consituencyKey: '',
    party: '',
    partyImage: null,
}

const Candidates = () => {
    const [candidate, setCandidate] = useState([])
    const { electionId } = useParams()
    const [edit, setEdit] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [constituencyAddress, setConstituencyAdress] = useState(null)
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultFormValues
    });

    const [openCandidateForm, onOpenCandidateForm, onCloseCandidateForm] = useDisclose()
    const { user } = useElection()
    const navigate = useNavigate()

    useEffect(() => {
        if (user.authToken) getAllCandidate()
    }, [])

    const getAllCandidate = () => {
        axios
            .get(`${API_BASE_URL}/getCandidateList/${electionId}`, {
                headers: { 'Authorization': `Bearer ${user.authToken}` }
            })
            .then((res) => {
                console.log("Candidate: ", res.data);
                setCandidate(res.data.data);
            });
    }

    const editConstituency = (constituencyAddress, id, name) => {
        setEdit(true)
        setConstituencyAdress(constituencyAddress)
        methods.reset({ id, name })
        onOpenCandidateForm()
    }

    const disableConstituency = (constituencyAddress, status) => {
        axios
            .delete(`${API_BASE_URL}/disableConsituency/${electionId}`,
                {
                    headers: { 'Authorization': `Bearer ${user.authToken}` },
                    data: {
                        consituencyKey: constituencyAddress
                    }
                }).then(res => {
                    getAllCandidate()
                    toast.success(`Constituency ${!status === true ? 'enabled ' : 'disabled '} successfully`)
                })
    }

    const closeForm = () => {
        methods.reset(defaultFormValues)
        onCloseCandidateForm()
        setEdit(false)
        setConstituencyAdress(null)
    }
    const filteredCandidate = candidate.filter(c => {
        return (c.candidateId + c.name).toLowerCase().includes(searchValue.toLowerCase())
    })

    if (!user.authToken) {
        return <Navigate to="/" replace={true} />
    }
    return (
        <Base>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Typography color="text.primary" component={Link} to={`/elections`}>Elections</Typography>
                <Typography color="text.primary">{electionId}</Typography>
            </Breadcrumbs>
            <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>Candidates Details</Typography>
            <Button onClick={onOpenCandidateForm} variant="contained" sx={{ mb: 2, display: 'block', marginLeft: 'auto' }}>New Candidate</Button>
            <Search value={searchValue} onChange={setSearchValue} />
            <Grid container spacing={2}>
                {filteredCandidate.map((candidate) => {
                    return <Grid key={candidate.candidateId} item xs={12} sm={6} md={4} lg={3}>
                        <CandidateCard {...candidate} />
                    </Grid>
                })}
            </Grid>
            <FormProvider {...methods}>
                <CandidateForm open={openCandidateForm} onClose={closeForm} edit={edit} refresh={getAllCandidate} />
            </FormProvider>
        </Base >
    )
}

export default Candidates