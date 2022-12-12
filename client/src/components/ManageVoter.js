import React, { useEffect, useState } from 'react'
import Base from './Base'
import { TextField, Stack, Button, Typography, MenuItem } from '@mui/material'
import { Link, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs"
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';

const ManageVoter = () => {
    const { electionId } = useParams()
    const [voters, setVoters] = useState({
        admin: "0x2E0110992Fbb7eD1e47802C3365C85B7d1Bd92CD",
        accounts: [],
        consituencyList: [],
        contractAddress: electionId,
        voterAddress: "",
        voterName: "",
        voterEmail: "",
        voterPhone: "",
        voterConsituency: "",
        voterAge: "",
        message: "",
        value: "",
    })
    useEffect(() => {
        // get the available consituency List
        axios
            .get(
                API_BASE_URL + "/api/v1/getConsituencyList/" + voters.contractAddress
            )
            .then((res) => {
                console.log(res);
                let arr = res.data;
                setVoters({
                    ...voters,
                    consituencyList: arr.map((arr) => ({
                        key: arr.consituencyId,
                        text: `${arr.consituencyId} | ${arr.name}`,
                        value: arr.consituencyId,
                    })),
                });
            });
    }, [])
    const onChange = (event) => {
        setVoters({ ...voters, [event.target.name]: event.target.value });
    }
    const onSubmit = () => {
        axios
            .post(API_BASE_URL + "/api/v1/addVoter/" + voters.contractAddress, {
                account: voters.admin,
                voterId: voters.voterAddress,
                name: voters.voterName,
                phoneNo: voters.voterPhone,
                consituency: voters.voterConsituency,
                age: voters.voterAge,
            })
            .then((res) => {
                // console.log(res);
                if (res.data.status)
                    toast.success(res.data.message)
                else {
                    toast.error(res.data.message)
                }
            });
    }

    return (
        <Base>
            <Button startIcon={<ArrowBackIcon />} component={Link} to="/voters" sx={{ mb: 3 }}>Go back</Button>
            <Stack spacing={3} sx={{ alignItems: "center" }}>
                <Typography variant='h5'>New Voter</Typography>
                <TextField fullWidth variant='outlined' label="Candidate Voter Id" required name="voterAddress" value={voters.voterAddress} onChange={onChange} />
                <TextField fullWidth variant='outlined' label="Candidate Name" required name="voterName" value={voters.voterName} onChange={onChange} />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Date of Birth"
                        maxDate={dayjs().subtract(18, 'year')}
                        onChange={() => { }}
                        renderInput={(params) => <TextField fullWidth {...params} />}
                    />
                </LocalizationProvider>
                <TextField fullWidth variant='outlined' label="Mobile" required name="voterPhone" value={voters.voterPhone} onChange={onChange} />
                <TextField fullWidth variant='outlined' label="Adress" required name="voterAddress" value={voters.voterAddress} onChange={onChange} />
                <TextField fullWidth variant='outlined' select label="Select Constituency" required name="voterConsituency" value={voters.voterConsituency} onChange={onChange} >
                    {voters.consituencyList.map(c => {
                        return <MenuItem key={c.key} value={c.value}>{c.text}</MenuItem>
                    })}
                </TextField>
                <Button variant="contained">Add</Button>
            </Stack>
        </Base >
    )
}

export default ManageVoter