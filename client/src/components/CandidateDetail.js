import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { InputAdornment, TextField, Stack, Button, Box, Typography, Container, Modal, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody, IconButton, Chip, Breadcrumbs, Tooltip, Checkbox, Grid, Avatar } from '@mui/material'
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
import { MdModeEdit, MdRemoveRedEye } from "react-icons/md";
import { AiFillEyeInvisible } from "react-icons/ai";
import ElectionForm from './Forms/ElectionForm'
import Base from './Base'
import { useParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import Search from './Search'
import VoterForm from './Forms/VoterForm'
import { formatBytes } from '../util'
import VoterCard from './VoterCard'
import CandidateForm from './Forms/CandidateForm'
const FILE_SIZE = 26214400
const SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png']
const schema = yup.object().shape({
    candidateId: yup.string().trim().required("Candidate id is required").matches(/^[A-Za-z0-9]+$/, "Should contain only alphabets and digits").min(2, "Should contain atleast 2 characters").max(12, "Should not exceed 12 characters"),
    consituencyKey: yup.string().trim().required("Select constituency"),
    party: yup.string().nullable().notRequired()
        .when('party', {
            is: (value) => value?.length,
            then: (yup) => yup.matches(/^[A-Za-z]+$/, "Should contain only alphabets").min(2, 'Should contain atleast 2 alphabets').max(20, 'Should not exceed 20 alphabets'),
        })
}, [["party", "party"]]);

const defaultFormValues = {
    candidateId: '',
    consituencyKey: '',
    party: '',
    partyImage: null,
}

const CandidateDetail = () => {
    const { electionId, candidateKey } = useParams()
    const [edit, setEdit] = useState(false)
    const [candidate, setCandidate] = useState(null)
    const [voters, setVoters] = useState([])
    const [constituency, setConstituency] = useState([])

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultFormValues
    });

    const [openCandidateForm, onOpenCandidateForm, onCloseCandidateForm] = useDisclose()
    const { user } = useElection()

    const getAllConstituency = async () => {
        const res = await axios.get(`${API_BASE_URL}/getAllConsituency/${electionId}`, {
            headers: { 'Authorization': `Bearer ${user.authToken}` }
        })
        setConstituency(res.data);
    }

    const getVoterList = async () => {
        const res = await axios.get(`${API_BASE_URL}/getVoterList/${electionId}`, {
            headers: { 'Authorization': `Bearer ${user.authToken}` }
        })
        setVoters(res.data.voters);
    }

    const getCandidate = async () => {
        const res = await axios.get(`${API_BASE_URL}/${electionId}/getCandidate/${candidateKey}`, {
            headers: { 'Authorization': `Bearer ${user.authToken}` }
        })
        const { data } = res.data
        setCandidate({ ...data });
    }

    const editCandidate = () => {
        setEdit(true)
        methods.reset({ ...candidate, dob: dayjs(candidate.dob * 1000) })
        onOpenCandidateForm()
    }
    const disableCandidate = (candidateKey) => {
        axios
            .delete(`${API_BASE_URL}/disableCandidate/${electionId}`,
                {
                    headers: { 'Authorization': `Bearer ${user.authToken}` },
                    data: {
                        candidateKey: candidateKey
                    }
                }).then(res => {
                    getCandidate()
                    toast.success(`Voter ${!candidate.candidateStatus === true ? 'enabled ' : 'disabled '} successfully`)
                })
    }

    const closeForm = () => {
        methods.reset(defaultFormValues)
        onCloseCandidateForm()
        setEdit(false)
    }

    useEffect(() => {
        if (user.authToken) {
            getAllConstituency()
            getVoterList()
        }
    }, [electionId])

    useEffect(() => {
        if (user.authToken) {
            getCandidate()
        }
    }, [candidateKey])

    if (!user.authToken) {
        return <Navigate to="/" replace={true} />
    }

    return (
        <Base>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Typography color="text.primary" component={Link} to={`/elections`}>Elections</Typography>
                <Typography color="text.primary">{electionId}</Typography>
            </Breadcrumbs>
            <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>Candidate Detail</Typography>
            {candidate !== null &&
                <>
                    <Button onClick={editCandidate} variant="contained" sx={{ mb: 2, marginRight: 2 }}>Edit Candidate Detail</Button>
                    <Button onClick={() => disableCandidate(candidate.candidateKey)} variant="contained" color={candidate.candidateStatus === true ? 'error' : 'success'} sx={{ mb: 2, }}>{candidate.candidateStatus === true ? 'Disable Candidate' : 'Enable Candidate'}</Button>
                    <Box sx={{ bgcolor: 'white', borderRadius: 2, padding: 3 }}>
                        <Avatar src={candidate.partyImage} sx={{ width: 80, height: 80, marginBottom: 3 }} />
                        <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                            <Typography variant="h6" sx={{ minWidth: '210px' }}>Candidate Id</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{candidate.candidateId}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                            <Typography variant="h6" sx={{ minWidth: '210px' }}>Party Name</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{candidate.party === "" ? 'Unaffiliated' : candidate.party}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                            <Typography variant="h6" sx={{ minWidth: '210px' }}>Enrolled Constituency</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{candidate.standingConsituencyKey}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 1 }}>
                            <Typography variant="h6" sx={{ minWidth: '210px' }}>Candidate Status</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word", fontWeight: 'bold', color: `${candidate.candidateStatus === true ? 'success.main' : 'error.main'}` }}>{candidate.candidateStatus === true ? 'Enabled' : 'Disabled'}</Typography>
                        </Stack>
                        <Typography variant="h6" sx={{ margin: '1.5rem 0 1rem', borderBottom: 1, paddingBottom: '0.1rem' }}>Personal Details</Typography>
                        <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                            <Typography variant="h6" sx={{ minWidth: '210px' }}>Voter Id</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{candidate.voterId}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                            <Typography variant="h6" sx={{ minWidth: '210px' }}>Name</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{candidate.name}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                            <Typography variant="h6" sx={{ minWidth: '210px' }}>Mobile no.</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{candidate.phoneNo}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                            <Typography variant="h6" sx={{ minWidth: '210px' }}>Age</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{dayjs().year() - dayjs(candidate.dob * 1000).year()}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                            <Typography variant="h6" sx={{ minWidth: '210px' }}>Address</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{candidate.voterAddress}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                            <Typography variant="h6" sx={{ minWidth: '210px' }}>Constituency</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{candidate.consituencyKey}</Typography>
                        </Stack>
                    </Box>
                    <FormProvider {...methods}>
                        <CandidateForm open={openCandidateForm} onClose={closeForm} edit={edit} candidateKey={candidateKey} refresh={getCandidate} />
                    </FormProvider>
                </>}
        </Base >
    )
}

export default CandidateDetail