import React, { useState } from 'react'
import { Typography, AppBar, Toolbar, Link, Container, Button } from '@mui/material'
import logo from "../images/logo.svg"
import { useElection } from '../store/ElectionProvider'
import { toast } from 'react-toastify';
import axios from 'axios'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { getAccount, handleSignMessage } from '../util';
import Dropdown from './Dropdown';
import { API_BASE_URL } from '../config';

const Navbar = (props) => {
    const { } = props
    const navigate = useNavigate()
    const { user, setUser } = useElection()
    const [loading, setLoading] = useState(false)
    const [searchParams] = useSearchParams();

    // const connect = () => {
    //     window.ethereum
    //         .request({
    //             method: 'eth_requestAccounts',
    //             params: [],
    //         })
    //         .then((res) => console.log('request accounts', res))
    //         .catch((e) => console.log('request accounts ERR', e));
    // };

    const login = async () => {
        try {
            const publicAddress = await getAccount()

            if (publicAddress) {
                const { data } = await axios.get(`${API_BASE_URL}/auth/nonce/${publicAddress}`)
                const { signature } = await handleSignMessage(publicAddress, data.nonce)
                console.log('Signature: ', signature);
                console.log('PublicAddress: ', publicAddress);
                const { data: user } = await axios.post(`${API_BASE_URL}/auth/login`, {
                    publicAddress,
                    signature
                })
                localStorage.setItem("user", JSON.stringify(user))
                setUser(user);
                setLoading(false)
                navigate("/elections")
            }
        } catch (error) {
            const err = error?.response?.data.error || error.message
            if (err === "User doesn't exist") {
                navigate("/createAccount")
                toast.info("You don't have an account. Create a new one")
            } else {
                toast.error(err)
            }
        }
    }

    return (
        <AppBar position="static" sx={{ py: 0.8, bgcolor: 'white', color: 'primary.main', boxShadow: 0, borderBottom: 1.5, borderColor: 'grey.400' }}>
            <Container maxWidth="xl">
                <Toolbar>
                    <img src={logo} alt="VoteSafe" />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2.5, fontWeight: 600, letterSpacing: 0.3 }}>
                        VoteSafe
                    </Typography>
                    {user?.authToken ?
                        <Dropdown title={`Hi, ${user.name}`} items={[{ title: "Logout" }]} />
                        :
                        <Button variant="contained" onClick={login}>Login</Button>

                    }
                </Toolbar>
            </Container>
        </AppBar >
    )
}

export default Navbar