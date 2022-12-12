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
const FILE_SIZE = 26214400
const SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png']
const schema = yup.object({
    voterId: yup.string().trim().required("Voter Id is required").matches(/^[A-Za-z0-9]+$/, "Should contain only alphabets and digits").min(12, "Should contain exactly 12 characters").max(12, "Should contain exactly 12 characters"),
    voterImage: yup.mixed()
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
    name: yup.string().trim().required("Name  is required").matches(/^[A-Za-z0-9\s]+$/, "Should contain only alphabets").min(5, "Should contain atleast 5 characters").max(50, "Should not exceed 50 characters"),
    dob: yup.date().nullable().required("DoB is required"),
    phoneNo: yup.string().trim().required("Mobile number is required").matches(/^[0-9]+$/, "Should contain only digits").min(10, "Should contain exactly 10 characters").max(10, "Should not exceed 10 characters"),
    voterAddress: yup.string().trim().required("Address  is required").matches(/^[A-Za-z0-9\s:.,-]+$/, "Should contain only alphabets digits - . : ,").min(10, "Should contain atleast 10 characters").max(100, "Should not exceed 100 characters"),
    consituencyKey: yup.string().trim().required("Constituency is required").matches(/^[A-Za-z0-9\s]+$/, "Should contain only alphabets and digits").min(2, "Should contain atleast 2 characters").max(50, "Should not exceed 50 characters"),
    voterETHaccount: yup.string().trim().required("Voter ETH account is required"),
}).required();

const defaultFormValues = {
    voterId: '',
    voterImage: null,
    name: '',
    dob: null,
    phoneNo: '',
    voterAddress: '',
    consituencyKey: '',
    voterETHaccount: '',
}

const Voters = () => {
    const { electionId } = useParams()
    const [edit, setEdit] = useState(false)
    const [constituency, setConstituency] = useState([])
    const [voters, setVoters] = useState([])
    const [ethAccounts, setEthAccounts] = useState([])
    const [searchValue, setSearchValue] = useState("")
    const [constituencyAddress, setConstituencyAdress] = useState(null)
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultFormValues
    });

    const [openVoterForm, onOpenVoterForm, onCloseVoterForm] = useDisclose()
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

    const getVotersETHAccounts = async () => {
        const res = await axios.get(`${API_BASE_URL}/accounts`, {
            headers: { 'Authorization': `Bearer ${user.authToken}` }
        })
        setEthAccounts(res.data);
    }

    const closeForm = () => {
        methods.reset(defaultFormValues)
        onCloseVoterForm()
        setEdit(false)
        setConstituencyAdress(null)
    }
    const filteredVoters = voters.filter(v => {
        return (v.voterId).toLowerCase().includes(searchValue.toLowerCase())
    })

    useEffect(() => {
        if (user.authToken) {
            getAllConstituency()
            getVotersETHAccounts()
            getVoterList()
        }
    }, [electionId])

    if (!user.authToken) {
        return <Navigate to="/" replace={true} />
    }
    return (
        <Base>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Typography color="text.primary" component={Link} to={`/elections`}>Elections</Typography>
                <Typography color="text.primary">{electionId}</Typography>
            </Breadcrumbs>
            <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>Voter Details</Typography>
            <Button onClick={onOpenVoterForm} variant="contained" sx={{ mb: 2, display: 'block', marginLeft: 'auto' }}>New Voter</Button>
            <Search value={searchValue} onChange={setSearchValue} placeholder={"Search by voter id..."} />
            <Grid container spacing={2}>
                {filteredVoters.map((voter, index) => {
                    return <Grid item xs={12} sm={6} md={4} lg={3}>
                        <VoterCard key={voter.id} {...voter} voterIndex={index} />
                    </Grid>
                })}
            </Grid>
            <FormProvider {...methods}>
                <VoterForm open={openVoterForm} onClose={closeForm} edit={edit} electionAddress={electionId} constituency={constituency} ethAccounts={ethAccounts} constituencyAddress={constituencyAddress} refresh={getVoterList} />
            </FormProvider>
        </Base >
    )
}

export default Voters