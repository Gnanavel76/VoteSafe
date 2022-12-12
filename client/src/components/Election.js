import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { TextField, Stack, Button, Box, Typography, Container, Modal, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody, IconButton, Chip } from '@mui/material'
import { Link as RLink, useNavigate, Navigate } from "react-router-dom"
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
import ElectionForm from './Forms/ElectionForm'
import dayjs from 'dayjs'

const schema = yup.object({
    name: yup.string().required("Election name is required").matches(/^[A-Za-z0-9\s]+$/, "Should contain only alphabets and digits").min(5, "Should contain atleast 5 characters").max(50, "Should not exceed 50 characters"),
    startsOn: yup.date().nullable().required("Election commence time is required"),
    endsOn: yup.date().nullable().required("Election closing time is required")
    // .test(
    //     'endsOn',
    //     'asd',
    //     (value) => console.log(value),
    // ),
}).required();

const defaultFormValues = {
    name: '',
    startsOn: null,
    endsOn: null,
}

const Election = () => {
    const [election, setElection] = useState([])
    const [edit, setEdit] = useState(false)
    const [electionAddress, setElectionAdress] = useState(null)
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultFormValues
    });

    const [openElectionForm, onOpenElectionForm, onCloseElectionForm] = useDisclose()
    const { user } = useElection()
    const navigate = useNavigate()

    useEffect(() => {
        if (user.authToken) getElectionList()
    }, [])

    const getElectionList = () => {
        axios.get(API_BASE_URL + "/getAllElection", {
            headers: { 'Authorization': `Bearer ${user.authToken}` }
        }).then((res) => {
            setElection(res.data.reverse());
        });
    }
    const editElection = (electionAddress, electionName, electionStartsOn, electionEndsOn) => {
        setEdit(true)
        setElectionAdress(electionAddress)
        methods.reset({
            name: electionName,
            startsOn: new Date(electionStartsOn * 1000),
            endsOn: new Date(electionEndsOn * 1000),
        })
        onOpenElectionForm()
    }
    const closeForm = () => {
        methods.reset(defaultFormValues)
        onCloseElectionForm()
        setEdit(false)
        setElectionAdress(null)
    }
    const getElectionStatus = (startsOn, endsOn, isElectionClosed) => {
        const now = dayjs().unix()
        if (now < startsOn) return { label: "Not yet started", color: '#ffcc80' }
        if (now > startsOn && now < endsOn) return { label: "Active", color: '#81d4fa' }
        if (now > endsOn || isElectionClosed) return { label: "Completed", color: '#69f0ae' }
    }
    if (!user.authToken) {
        return <Navigate to="/" replace={true} />
    }
    return (
        <>
            <Navbar />
            <Container maxWidth="xl">
                <Box px={3} py={4}>
                    <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>Election Details</Typography>
                    <Button onClick={onOpenElectionForm} variant="contained" sx={{ mb: 3, display: 'block', marginLeft: 'auto' }}>New Election</Button>
                    <TableContainer component={Paper}>
                        <Table stickyHeader aria-label='simple table'>
                            <TableHead>
                                <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#e4e3f1', fontWeight: 600, letterSpacing: 0.8, fontSize: '1rem', textTransform: 'uppercase' } }}>
                                    <TableCell>Sr.No</TableCell>
                                    <TableCell>Election name</TableCell>
                                    <TableCell>Starts On</TableCell>
                                    <TableCell>Closes On</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ '& .MuiTableRow-root:nth-child(even)': { bgcolor: '#f5f4fb' } }}>
                                {election.map((election, index) => {
                                    const { electionAddress, electionName, electionStartsOn, electionEndsOn, isElectionClosed } = election
                                    const { label, color } = getElectionStatus(electionStartsOn, electionEndsOn, isElectionClosed)
                                    return <TableRow
                                        key={index}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& .MuiTableCell-root': { py: 1.5, fontSize: '1rem' } }}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{electionName}</TableCell>
                                        <TableCell>{dayjs(electionStartsOn * 1000).format("DD/MM/YYYY hh:mm A")}</TableCell>
                                        <TableCell>{dayjs(electionEndsOn * 1000).format("DD/MM/YYYY hh:mm A")}</TableCell>
                                        <TableCell>
                                            <Chip label={label} sx={{ borderRadius: 1, bgcolor: color, fontSize: '1rem', fontWeight: 600, letterSpacing: '0.5px' }} />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color='primary' onClick={() => navigate(`/election/${electionAddress}/constituency`)}>
                                                <MdRemoveRedEye />
                                            </IconButton>
                                            <IconButton color='primary' onClick={() => editElection(electionAddress, electionName, electionStartsOn, electionEndsOn)}>
                                                <MdModeEdit />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                })}

                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Container>
            <FormProvider {...methods}>
                <ElectionForm open={openElectionForm} onClose={closeForm} edit={edit} electionAddress={electionAddress} refresh={getElectionList} />
            </FormProvider>
        </>
    )
}

export default Election