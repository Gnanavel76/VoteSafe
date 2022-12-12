import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { TextField, Stack, Button, Box, Typography, Container, Modal, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody, IconButton, FormControl, InputLabel, MenuItem } from '@mui/material'
import { Link as RLink, useNavigate, Navigate } from "react-router-dom"
import Navbar from '../Navbar'
import useDisclose from '../../hooks/useDisclosure'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers'
import { yupResolver } from '@hookform/resolvers/yup';
import { useFormContext, Controller } from "react-hook-form";
import LoadingButton from '@mui/lab/LoadingButton';
import * as yup from "yup";
import dayjs from "dayjs"
import { useElection } from '../../store/ElectionProvider'
import { API_BASE_URL } from '../../config'
import { toast } from 'react-toastify'
import { MdOutlineClose } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import ProfileImage from '../ProfileImage'
import { jsonToFormdata } from '../../util'

const VoterForm = (props) => {
    const { open, onClose, edit, electionAddress, constituency, ethAccounts, voterIndex, refresh } = props
    const { user } = useElection()
    const [loading, setLoading] = useState(false)
    const { control, handleSubmit, formState: { errors }, reset, setError } = useFormContext();

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            if (edit) {

                const formData = jsonToFormdata({ ...data, dob: dayjs(data.dob).unix() })
                const result = await axios
                    .put(`${API_BASE_URL}/${electionAddress}/updateVoter/${voterIndex}`, formData, {
                        headers: { 'Authorization': `Bearer ${user.authToken}` },
                        'Content-Type': 'multipart/form-data'
                    })
                toast.success(result.data.message)
            } else {
                // alert(dayjs(data.dob).unix());
                // return
                const formData = jsonToFormdata({ ...data, dob: dayjs(data.dob).unix() })
                await axios
                    .post(`${API_BASE_URL}/addVoter/${electionAddress}`, formData, {
                        headers: { 'Authorization': `Bearer ${user.authToken}` },
                        'Content-Type': 'multipart/form-data'
                    })
                toast.success("Voter created successfully")
            }
            refresh()
            onClose()
        } catch (error) {
            if (error?.response?.data?.error === 'Voter already exist!') {
                setError("voterId", { type: 'custom', message: 'Voter id already exist' })
            } else {
                toast.error(error?.response?.data?.error || error.message)
            }
        }
        setLoading(false)
    }
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
                        <Typography variant='h5'>{edit ? "Edit Voter Information" : "New Voter"}</Typography>
                        <ProfileImage fieldname="voterImage" />
                        <Controller
                            name="voterId"
                            control={control}
                            render={({ field }) => <TextField {...field} fullWidth variant='outlined' label="Voter Id" error={errors?.voterId ? true : false} helperText={errors?.voterId ? errors.voterId.message : ""} />}
                        />
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => <TextField {...field} fullWidth variant='outlined' label="Name" error={errors?.name ? true : false} helperText={errors?.name ? errors.name.message : ""} />}
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Controller
                                name="dob"
                                control={control}
                                render={({ field }) => <DatePicker
                                    {...field}
                                    maxDate={dayjs().subtract(18, "years")}
                                    defaultCalendarMonth={dayjs().subtract(18, "years")}
                                    inputFormat={"DD/MM/YYYY"}
                                    renderInput={(params) => <TextField fullWidth {...params} error={errors?.dob ? true : false} helperText={errors?.dob ? errors.dob.message : ""} />}
                                    label="Date of Birth"
                                />}
                            />
                        </LocalizationProvider>
                        <Controller
                            name="phoneNo"
                            control={control}
                            render={({ field }) => <TextField {...field} fullWidth variant='outlined' label="Mobile no." error={errors?.phoneNo ? true : false} helperText={errors?.phoneNo ? errors.phoneNo.message : ""} />}
                        />
                        <Controller
                            name="voterAddress"
                            control={control}
                            render={({ field }) => <TextField {...field} fullWidth variant='outlined' multiline maxRows={3} label="Address" error={errors?.voterAddress ? true : false} helperText={errors?.voterAddress ? errors.voterAddress.message : ""} />}
                        />
                        <Controller
                            name="consituencyKey"
                            control={control}
                            render={({ field }) => <TextField select {...field} fullWidth variant='outlined' label="Constituency" error={errors?.consituencyKey ? true : false} helperText={errors?.consituencyKey ? errors.consituencyKey.message : ""}
                            >
                                {constituency.map((option) => (
                                    <MenuItem key={option.consituencyId} value={option.consituencyId}>
                                        {option.consituencyId + " - " + option.name}
                                    </MenuItem>
                                ))}
                            </TextField>}
                        />
                        <Controller
                            name="voterETHaccount"
                            control={control}
                            render={({ field }) => <TextField select {...field} fullWidth variant='outlined' label="ETH Account" error={errors?.voterETHaccount ? true : false} helperText={errors?.voterETHaccount ? errors.voterETHaccount.message : ""}
                            >
                                {ethAccounts.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>}
                        />
                        <LoadingButton type="submit" loading={loading} variant="contained">{edit ? "Save" : "Create"}</LoadingButton>
                    </Stack>
                </form>
            </Box>
        </Modal>
    )
}

export default VoterForm