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
import fp from "../images/fp.png"
const FILE_SIZE = 26214400
const SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png']
const schema = yup.object({
    voterId: yup.string().trim().required("Voter Id is required").matches(/^[A-Za-z0-9]+$/, "Should contain only alphabets and digits").min(12, "Should contain exactly 12 characters").max(12, "Should contain exactly 12 characters"),
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

const VoterDetail = () => {
    const { electionId, voterId } = useParams()
    const [edit, setEdit] = useState(false)
    const [voter, setVoter] = useState(null)
    const [constituency, setConstituency] = useState([])
    const [ethAccounts, setEthAccounts] = useState([])

    const [fingerStatus, setFingerStatus] = useState({
        status: '',
        messsage: ''
    })



    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultFormValues
    });

    const [openVoterForm, onOpenVoterForm, onCloseVoterForm] = useDisclose()
    const [openFPModal, onOpenFPModal, onCloseFPModal] = useDisclose()
    const { user } = useElection()

    const getAllConstituency = async () => {
        const res = await axios.get(`${API_BASE_URL}/getAllConsituency/${electionId}`, {
            headers: { 'Authorization': `Bearer ${user.authToken}` }
        })
        setConstituency(res.data);
    }

    const getVoter = async () => {
        const res = await axios.get(`${API_BASE_URL}/${electionId}/getVoter/${voterId}`, {
            headers: { 'Authorization': `Bearer ${user.authToken}` }
        })
        const { data } = res.data
        setVoter({ ...data });
    }

    const editVoter = () => {
        setEdit(true)
        methods.reset({ ...voter, dob: dayjs(voter.dob * 1000) })
        onOpenVoterForm()
    }
    const disableVoter = (voterIndex) => {
        axios
            .delete(`${API_BASE_URL}/disableVoter/${electionId}`,
                {
                    headers: { 'Authorization': `Bearer ${user.authToken}` },
                    data: {
                        voterIndex: voterIndex
                    }
                }).then(res => {
                    getVoter()
                    toast.success(`Voter ${!voter.status === true ? 'enabled ' : 'disabled '} successfully`)
                })
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
    }

    useEffect(() => {
        if (user.authToken) {
            getAllConstituency()
            getVotersETHAccounts()
        }
    }, [electionId])

    useEffect(() => {
        if (user.authToken) {
            getVoter()
        }
    }, [voterId])


    if (!user.authToken) {
        return <Navigate to="/" replace={true} />
    }



    return (
        <Base>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Typography color="text.primary" component={Link} to={`/elections`}>Elections</Typography>
                <Typography color="text.primary">{electionId}</Typography>
            </Breadcrumbs>
            <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>Voter Detail</Typography>
            {voter !== null &&
                <>
                    <Button onClick={editVoter} variant="contained" sx={{ mb: 2, marginRight: 2 }}>Edit Voter Detail</Button>
                    <Button onClick={() => disableVoter(voter.voterIndex)} variant="contained" color={voter.status === true ? 'error' : 'success'} sx={{ mb: 2, }}>{voter.status === true ? 'Disable Voter' : 'Enable Voter'}</Button>
                    <Box sx={{ bgcolor: 'white', borderRadius: 2, padding: 3 }}>
                        <Avatar src={voter.voterImage} sx={{ width: 80, height: 80, marginBottom: 3 }} />
                        <Stack direction="row" sx={{ marginBottom: 1, alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ minWidth: '170px' }}>Status</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word", fontWeight: 'bold', color: `${voter.status === true ? 'success.main' : 'error.main'}` }}>{voter.status === true ? 'Enabled' : 'Disabled'}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 1 }}>
                            <Typography variant="h6" sx={{ minWidth: '170px' }}>Voter Id</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{voter.voterId}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 1 }}>
                            <Typography variant="h6" sx={{ minWidth: '170px' }}>Name</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{voter.name}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 1 }}>
                            <Typography variant="h6" sx={{ minWidth: '170px' }}>Mobile no.</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{voter.phoneNo}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 1 }}>
                            <Typography variant="h6" sx={{ minWidth: '170px' }}>Age</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{dayjs().year() - dayjs(voter.dob * 1000).year()}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 1 }}>
                            <Typography variant="h6" sx={{ minWidth: '170px' }}>Address</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{voter.voterAddress}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 1 }}>
                            <Typography variant="h6" sx={{ minWidth: '170px' }}>Consituency</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>
                                {voter.consituencyKey}
                            </Typography>
                        </Stack>
                        <Stack direction="row" sx={{ marginBottom: 1 }}>
                            <Typography variant="h6" sx={{ minWidth: '170px' }}>ETH Account</Typography>
                            <Typography variant="h6" sx={{ marginRight: 1 }}>:</Typography>
                            <Typography variant="h6" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{voter.voterETHaccount}</Typography>
                        </Stack>
                    </Box>
                    <FormProvider {...methods}>
                        <VoterForm open={openVoterForm} onClose={closeForm} edit={edit} electionAddress={electionId} voterIndex={voter.voterIndex} constituency={constituency} ethAccounts={ethAccounts} refresh={getVoter} />
                    </FormProvider>
                </>}
            {openFPModal && <Modal open={openFPModal}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    borderRadius: 2,
                    py: 3,
                    px: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh',
                    minWidth: '70vh',
                    overflow: 'auto'
                }}>
                    <IconButton color='primary' sx={{ alignSelf: 'flex-end' }} onClick={onCloseFPModal}>
                        <MdOutlineClose />
                    </IconButton>
                    <form onSubmit={() => { }}>
                        <Stack spacing={2.2} sx={{ alignItems: "center" }}>
                            <Typography variant='h5'>{edit ? "Edit Voter Information" : "Enroll Finger"}</Typography>
                            <Typography variant='h6'>{fingerStatus?.message}</Typography>
                            <img src={fp} style={{ maxWidth: '120px' }} />
                            <LoadingButton type="submit" loading={false} variant="contained">{edit ? "Save" : "Create"}</LoadingButton>
                        </Stack>
                    </form>
                </Box>
            </Modal>}
        </Base >
    )
}

export default VoterDetail