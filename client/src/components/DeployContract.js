import React from 'react'
import Base from './Base'
import { Stack, Button } from '@mui/material'
import axios from 'axios'
import { API_BASE_URL } from '../config'

const DeployContract = () => {
    const compile = () => {
        axios.post(API_BASE_URL + "/contract/compile").then((res) => {
            console.log(res.data);
        });
    }

    const deploy = () => {
        axios.post(API_BASE_URL + "/contract/deploy").then((res) => {
            console.log(res.data);
        });
    }
    return (
        <Base>
            <Stack direction="row" spacing={2}>
                <Button onClick={compile} variant="contained">Compile Contract</Button>
                <Button onClick={deploy} variant="contained">Deploy Contract</Button>
            </Stack>
        </Base>
    )
}

export default DeployContract