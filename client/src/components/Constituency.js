import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { InputAdornment, TextField, Stack, Button, Box, Typography, Container, Modal, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody, IconButton, Chip, Breadcrumbs, Tooltip, Checkbox } from '@mui/material'
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

const schema = yup.object({
    id: yup.string().trim().required("Constituency id is required").matches(/^[A-Za-z0-9\s]+$/, "Should contain only alphabets and digits").min(2, "Should contain atleast 2 characters").max(50, "Should not exceed 50 characters"),
    name: yup.string().trim().required("Constituency name  is required").matches(/^[A-Za-z0-9\s]+$/, "Should contain only alphabets and digits").min(2, "Should contain atleast 2 characters").max(50, "Should not exceed 50 characters"),
}).required();

const defaultFormValues = {
    id: '',
    name: '',
}

const Constituency = () => {
    const [constituency, setConstituency] = useState([])
    const { electionId } = useParams()
    const [edit, setEdit] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [constituencyAddress, setConstituencyAdress] = useState(null)
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultFormValues
    });

    const [openConstituencyForm, onOpenConstituencyForm, onCloseConstituencyForm] = useDisclose()
    const { user } = useElection()
    const navigate = useNavigate()

    useEffect(() => {
        if (user.authToken) getAllConstituency()
    }, [])

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

    const editConstituency = (constituencyAddress, id, name) => {
        setEdit(true)
        setConstituencyAdress(constituencyAddress)
        methods.reset({ id, name })
        onOpenConstituencyForm()
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
                    getAllConstituency()
                    toast.success(`Constituency ${!status === true ? 'enabled ' : 'disabled '} successfully`)
                })
    }

    const closeForm = () => {
        methods.reset(defaultFormValues)
        onCloseConstituencyForm()
        setEdit(false)
        setConstituencyAdress(null)
    }
    const filteredConstituency = constituency.filter(c => {
        return (c.consituencyId + c.name).toLowerCase().includes(searchValue.toLowerCase())
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
            <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>Constituency Details</Typography>
            <Button onClick={onOpenConstituencyForm} variant="contained" sx={{ mb: 2, display: 'block', marginLeft: 'auto' }}>New Constituency</Button>
            <Search value={searchValue} onChange={setSearchValue} />
            <TableContainer component={Paper}>
                <Table stickyHeader aria-label='simple table'>
                    <TableHead>
                        <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#e4e3f1', fontWeight: 600, letterSpacing: 0.8, fontSize: '1rem', textTransform: 'uppercase' } }}>
                            <TableCell>Sr.No</TableCell>
                            <TableCell>Constituency Id</TableCell>
                            <TableCell>Constituency Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ '& .MuiTableRow-root:nth-child(even)': { bgcolor: '#f5f4fb' } }}>
                        {
                            filteredConstituency.length > 0 ?
                                filteredConstituency.map((constituency, index) => {
                                    const { consituencyKey, consituencyId, name, status } = constituency
                                    return <TableRow
                                        key={index}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& .MuiTableCell-root': { py: 1.5, fontSize: '1rem' } }}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{consituencyId}</TableCell>
                                        <TableCell>{name}</TableCell>
                                        <TableCell>
                                            {
                                                status === true
                                                    ?
                                                    <Chip label="Active" sx={{ borderRadius: 1, bgcolor: "#81d4fa", fontSize: '1rem', fontWeight: 600, letterSpacing: '0.5px' }} />
                                                    :
                                                    <Chip label="Disabled" sx={{ borderRadius: 1, bgcolor: "#fecaca", color: '#991b1b', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.5px' }} />
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color='primary' onClick={() => editConstituency(consituencyKey, consituencyId, name)}>
                                                <MdModeEdit />
                                            </IconButton>
                                            <Tooltip title={status === true ? "Disable Constituency" : "Enable Constituency"}>
                                                <Checkbox checked={status} onChange={() => disableConstituency(consituencyKey, status)} />
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                })
                                :
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: 'center' }}>No entries found</TableCell>
                                </TableRow>
                        }

                    </TableBody>
                </Table>
            </TableContainer>
            <FormProvider {...methods}>
                <ConsituencyForm open={openConstituencyForm} onClose={closeForm} edit={edit} electionAddress={electionId} constituencyAddress={constituencyAddress} refresh={getAllConstituency} />
            </FormProvider>
        </Base >
    )
}

export default Constituency