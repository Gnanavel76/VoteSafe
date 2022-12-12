import { Box, Chip, Grid, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import React from 'react'
import { useNavigate } from 'react-router-dom'
const VoterCard = (props) => {
    const { voterId, voterImage, name, dob, phoneNo, voterIndex, status } = props
    const navigate = useNavigate()
    return (
        <Box p={3} sx={{ borderRadius: 2, boxShadow: 2, bgcolor: 'white', cursor: "pointer" }} onClick={() => navigate(`${voterIndex}`)}>
            <img src={voterImage} alt={name} style={{ borderRadius: "50%", width: "80px", height: "80px", margin: "0 auto 1rem" }} />
            <Box>
                <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '75px' }}>Voter Id</Typography>
                    <Typography variant="subtitle2" sx={{ marginRight: 0.3 }}>:</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{voterId}</Typography>
                </Stack>
                <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '75px' }}>Name</Typography>
                    <Typography variant="subtitle2" sx={{ marginRight: 0.3 }}>:</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{name}</Typography>
                </Stack>
                <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '75px' }}>Mobile no.</Typography>
                    <Typography variant="subtitle2" sx={{ marginRight: 0.3 }}>:</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{phoneNo}</Typography>
                </Stack>
                <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '75px' }}>Age</Typography>
                    <Typography variant="subtitle2" sx={{ marginRight: 0.3 }}>:</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{dayjs().year() - dayjs(dob * 1000).year()}</Typography>
                </Stack>
                <Stack direction="row">
                    <Typography variant="subtitle2" sx={{ minWidth: '75px' }}>Status</Typography>
                    <Typography variant="subtitle2" sx={{ marginRight: 0.3 }}>:</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word", fontWeight: 'bold', color: `${status === true ? 'success.main' : 'error.main'}` }}>{status === true ? 'Enabled' : 'Disabled'}</Typography>
                </Stack>
                {/* <Stack direction="row" sx={{ marginBottom: 0.8, alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '75px' }}>Voted</Typography>
                    <Chip label={'Voted'} />
                </Stack> */}
                {/* <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '75px' }}>Address</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{voterAddress}</Typography>
                </Stack> */}
            </Box>
        </Box>
    )
}

export default VoterCard