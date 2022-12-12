import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { TextField, Stack, Button, Box, Typography, Container, Modal, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody, IconButton, MenuItem } from '@mui/material'
import { Link as RLink, useNavigate, Navigate, useParams } from "react-router-dom"
import Navbar from '../Navbar'
import useDisclose from '../../hooks/useDisclosure'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers'
import { yupResolver } from '@hookform/resolvers/yup';
import { useFormContext, Controller } from "react-hook-form";
import LoadingButton from '@mui/lab/LoadingButton';
import * as yup from "yup";
import dayjs from "dayjs"
import { useElection } from '../../store/ElectionProvider'
import { API_BASE_URL } from '../../config'
import { toast } from 'react-toastify'
import { MdOutlineClose } from "react-icons/md";
import ProfileImage from '../ProfileImage'
import { jsonToFormdata } from '../../util'

const CandidateForm = (props) => {
    const { electionId } = useParams()
    const { open, onClose, edit, candidateKey, refresh } = props
    const { user } = useElection()
    const [loading, setLoading] = useState(false)
    const [voters, setVoters] = useState([])
    const [constituency, setConstituency] = useState([])
    const { control, handleSubmit, formState: { errors }, watch } = useFormContext();
    const onSubmit = async (data) => {
        setLoading(true)
        try {
            if (edit) {
                const formData = jsonToFormdata({ ...data })
                const res = await axios
                    .put(`${API_BASE_URL}/${electionId}/updateCandidate/${candidateKey}`, formData, {
                        headers: { 'Authorization': `Bearer ${user.authToken}` }
                    })
                toast.success(res.data.message)
            } else {
                const formData = jsonToFormdata({ ...data })
                const res = await axios
                    .post(`${API_BASE_URL}/addCandidate/${electionId}`, formData, {
                        headers: { 'Authorization': `Bearer ${user.authToken}` },
                        'Content-Type': 'multipart/form-data'
                    })
                toast.success(res.data.message)
            }
            refresh()
            onClose()
        } catch (error) {
            toast.error(error?.response?.data.error || error.message)
        }
        setLoading(false)
    }
    const getVoterList = async () => {
        const res = await axios.get(`${API_BASE_URL}/getVoterList/${electionId}`, {
            headers: { 'Authorization': `Bearer ${user.authToken}` }
        })
        setVoters(res.data.voters);
    }
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
    useEffect(() => {
        if (user.authToken) {
            getVoterList()
            getAllConstituency()
        }
    }, [])
    const voterId = watch("voterId")
    return (

        <Modal open={open}>
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
                <IconButton color='primary' sx={{ alignSelf: 'flex-end' }} onClick={onClose}>
                    <MdOutlineClose />
                </IconButton>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2.2} sx={{ alignItems: "center" }}>
                        <Typography variant='h5' sx={{ mb: 2 }}>{edit ? "Edit Candidate" : "New Candidate"}</Typography>
                        {!edit && <Controller
                            name="voterId"
                            control={control}
                            render={({ field }) => <TextField select {...field} fullWidth variant='outlined' label="Select Voter" error={errors?.voterId ? true : false} helperText={errors?.voterId ? errors.voterId.message : ""}
                            >
                                <MenuItem value="">Select Voter</MenuItem>
                                {voters.map((option) => (
                                    <MenuItem key={option.voterId} value={`${option.voterIndex}${option.voterId}`}>
                                        {option.voterId + " - " + option.name}
                                    </MenuItem>
                                ))}
                            </TextField>}
                        />}
                        {voterId && <><ProfileImage fieldname="partyImage" />
                            <Controller
                                name="candidateId"
                                control={control}
                                render={({ field }) => <TextField {...field} fullWidth variant='outlined' label="Candidate Id" error={errors?.candidateId ? true : false} helperText={errors?.candidateId ? errors.candidateId.message : ""} />}
                            />
                            <Controller
                                name="party"
                                control={control}
                                render={({ field }) => <TextField {...field} fullWidth variant='outlined' label="Party name" error={errors?.party ? true : false} helperText={errors?.party ? errors.party.message : ""} />}
                            />
                            <Controller
                                name="consituencyKey"
                                control={control}
                                render={({ field }) => <TextField select {...field} fullWidth variant='outlined' label="Select Consituency" error={errors?.consituencyKey ? true : false} helperText={errors?.consituencyKey ? errors.consituencyKey.message : ""}
                                >
                                    <MenuItem value="">Select Constituency</MenuItem>
                                    {constituency.map((option) => (
                                        <MenuItem key={option.consituencyId} value={option.consituencyId}>
                                            {option.consituencyId + " - " + option.name}
                                        </MenuItem>
                                    ))}
                                </TextField>}
                            />
                            <LoadingButton type="submit" loading={loading} variant="contained">{edit ? "Save" : "Create"}</LoadingButton></>}
                    </Stack>
                </form>
            </Box>
        </Modal>
    )
}

export default CandidateForm