import { Box, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../config";

const ElectionContext = createContext();

const ElectionProvider = ({ children }) => {
    const [searchParams] = useSearchParams()
    const isVotingTab = searchParams.get("election")
    const [loading, setLoading] = useState(isVotingTab ? false : true)
    const navigate = useNavigate()
    const [user, setUser] = useState({
        name: "",
        publicAddress: "",
        authToken: ""
    })
    useEffect(() => {
        const verifyAuth = async () => {
            let user = localStorage.getItem("user")
            try {
                if (user) {
                    user = JSON.parse(user)
                    await axios.get(`${API_BASE_URL}/auth/verifyAuth`, {
                        headers: {
                            'Authorization': `Bearer ${user.authToken}`
                        }
                    })
                    setUser(user)
                } else {
                    navigate("/")
                }
                setLoading(false)
            } catch (error) {
                setLoading(false)
                if (user) localStorage.removeItem("user")
                navigate("/")
            }
        }
        if (!isVotingTab) verifyAuth()
    }, [])

    if (loading) {
        return (
            <Box sx={{ width: '100vw', height: '100vh', display: 'grid', placeItems: 'center', alignContent: 'center' }}>
                <CircularProgress color="primary" sx={{ mb: 2 }} />
                <Typography variant="body1" color="primary">Loading...</Typography>
            </Box>
        )
    }
    const value = { user, setUser }
    return (
        <ElectionContext.Provider value={value}>
            {children}
        </ElectionContext.Provider>
    );
};

export const useElection = () => {
    return useContext(ElectionContext);
};

export default ElectionProvider;
