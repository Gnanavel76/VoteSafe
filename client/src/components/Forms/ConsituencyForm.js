import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { TextField, Stack, Button, Box, Typography, Container, Modal, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody, IconButton } from '@mui/material'
import { Link as RLink, useNavigate, Navigate } from "react-router-dom"
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

const ConsituencyForm = (props) => {
    const { open, onClose, edit, electionAddress, constituencyAddress, refresh } = props
    const { user } = useElection()
    const [loading, setLoading] = useState(false)
    const { control, handleSubmit, formState: { errors }, reset } = useFormContext();
    const onSubmit = async (data) => {
        setLoading(true)
        const { id, name } = data
        try {
            if (edit) {
                await axios
                    .put(`${API_BASE_URL}/updateConsituency/${electionAddress}`, {
                        consituencyKey: constituencyAddress,
                        consituencyId: id,
                        consituencyName: name
                    }, {
                        headers: { 'Authorization': `Bearer ${user.authToken}` }
                    })
                toast.success("Constituency updated successfully")
            } else {
                await axios
                    .post(`${API_BASE_URL}/addConsituency/${electionAddress}`, {
                        consituencyId: id,
                        consituencyName: name,
                    }, {
                        headers: { 'Authorization': `Bearer ${user.authToken}` }
                    })
                toast.success("Constituency created successfully")
            }
            refresh()
            onClose()
        } catch (error) {
            toast.error(error?.response?.data || error.message)
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
                flexDirection: 'column'
            }}>
                <IconButton color='primary' sx={{ alignSelf: 'flex-end' }} onClick={onClose}>
                    <MdOutlineClose />
                </IconButton>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2.2} sx={{ alignItems: "center" }}>
                        <Typography variant='h5' sx={{ mb: 2 }}>{edit ? "Edit Constituency" : "New Constituency"}</Typography>
                        <Controller
                            name="id"
                            control={control}
                            render={({ field }) => <TextField {...field} fullWidth variant='outlined' label="Constituency Id" error={errors?.id ? true : false} helperText={errors?.id ? errors.id.message : ""} />}
                        />
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => <TextField {...field} fullWidth variant='outlined' label="Constituency Name" error={errors?.name ? true : false} helperText={errors?.name ? errors.name.message : ""} />}
                        />
                        <LoadingButton type="submit" loading={loading} variant="contained">{edit ? "Save" : "Create"}</LoadingButton>
                    </Stack>
                </form>
            </Box>
        </Modal>
    )
}

export default ConsituencyForm