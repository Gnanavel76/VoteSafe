import React, { useState } from 'react'
import { Box, Grid, Link, TextField, Typography } from '@mui/material'
import { Link as RLink, useNavigate } from "react-router-dom"
import LoadingButton from '@mui/lab/LoadingButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { toast } from 'react-toastify'
import logo from "../images/logo.svg"
import axios from 'axios'
import { useElection } from '../store/ElectionProvider';
import { getAccount, handleSignMessage } from '../util';
import { API_BASE_URL } from '../config';
const schema = yup.object({
    name: yup.string().required("Name is required").min(2, "Should contain atleast 2 characters").max(50, "Should not exceed 50 characters"),
}).required();

const SignUp = () => {
    const [loading, setLoading] = useState(false)
    const { user, setUser } = useElection()
    const navigate = useNavigate()
    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: ''
        }
    });

    const onSubmit = async (data) => {
        setLoading(true)
        const { name } = data
        try {
            let publicAddress
            if (!user.publicAddress) {
                publicAddress = await getAccount()
            }
            if (publicAddress) {
                const { data } = await axios.post(`${API_BASE_URL}/auth`, { publicAddress })
                const { signature } = await handleSignMessage(publicAddress, data.nonce)
                const { data: user } = await axios.post(`${API_BASE_URL}/auth/create`, {
                    name,
                    publicAddress,
                    signature,
                    token: data.token,
                })
                localStorage.setItem("user", JSON.stringify(user))
                setUser(user);
                setLoading(false)
                navigate("/elections")
            }
        } catch (error) {
            setLoading(false)
            toast.error(error?.response?.data.error || error.message)
        }
    }
    return (
        <Grid container alignItems="center" justifyContent="center" sx={{ minHeight: "100vh" }}>
            <Grid item xl={3} lg={4} md={6} sm={7} xs={10}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box px={3} py={5} sx={{ display: "flex", flexDirection: "column", alignItems: "center", border: 1.8, borderColor: 'card.border', borderRadius: 2 }}>
                        <Box sx={{ mb: 1.5 }}>
                            <img src={logo} alt='VoteSafe' />
                        </Box>
                        <Typography variant='h6' mb={5} color="primary.main" sx={{ fontWeight: "700" }}>Create Account</Typography>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => <TextField {...field} sx={{ mb: 3 }} fullWidth label="Name" variant="standard" error={errors?.name ? true : false} helperText={errors?.name ? errors.name.message : ""} />}
                        />
                        <LoadingButton type="submit" loading={loading} sx={{ mb: 2 }} variant="contained">Sign Up</LoadingButton>
                        <Typography variant='body2' color="text.secondary" sx={{ fontWeight: "500" }}>
                            Already have an account?
                            <Link component={RLink} to="/" variant='body2' color="primary.main" sx={{ fontWeight: "500", textDecoration: 'none', ml: 0.5 }}>Log In</Link>
                        </Typography>
                    </Box>
                </form>
            </Grid>
        </Grid>
    )
}

export default SignUp