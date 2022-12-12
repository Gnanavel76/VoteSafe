import React from 'react'
import { Button, Box, Typography, AppBar, Toolbar, Link, Container } from '@mui/material'
import { Link as RLink, Navigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useElection } from '../store/ElectionProvider'
const Home = () => {
    const { user } = useElection()
    if (user.authToken) {
        return <Navigate to="/elections" replace={true} />
    }
    return (
        <Navbar />
    )
}

export default Home