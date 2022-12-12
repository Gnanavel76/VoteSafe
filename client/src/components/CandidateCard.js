import { Box, Chip, Grid, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import React from 'react'
import { useNavigate } from 'react-router-dom'
const CandidateCard = (props) => {
    const { candidateKey, candidateId, name, phoneNo, dob, party, partyImage, candidateStatus } = props
    const navigate = useNavigate()
    return (
        <Box p={3} sx={{ borderRadius: 2, boxShadow: 2, bgcolor: 'white', cursor: "pointer" }} onClick={() => navigate(`${candidateKey}`)}>
            <img src={partyImage} alt={party} style={{ borderRadius: "50%", width: "80px", height: "80px", margin: "0 auto 1rem" }} />
            <Box>
                <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '90px' }}>Candidate Id</Typography>
                    <Typography variant="subtitle2" sx={{ marginRight: 0.3 }}>:</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{candidateId}</Typography>
                </Stack>
                <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '90px' }}>Party Name</Typography>
                    <Typography variant="subtitle2" sx={{ marginRight: 0.3 }}>:</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{party === "" ? 'Unaffiliated' : party}</Typography>
                </Stack>
                <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '90px' }}>Name</Typography>
                    <Typography variant="subtitle2" sx={{ marginRight: 0.3 }}>:</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{name}</Typography>
                </Stack>
                <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '90px' }}>Mobile no.</Typography>
                    <Typography variant="subtitle2" sx={{ marginRight: 0.3 }}>:</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{phoneNo}</Typography>
                </Stack>
                <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '90px' }}>Age</Typography>
                    <Typography variant="subtitle2" sx={{ marginRight: 0.3 }}>:</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{dayjs().year() - dayjs(dob * 1000).year()}</Typography>
                </Stack>
                <Stack direction="row">
                    <Typography variant="subtitle2" sx={{ minWidth: '90px' }}>Status</Typography>
                    <Typography variant="subtitle2" sx={{ marginRight: 0.3 }}>:</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word", fontWeight: 'bold', color: `${candidateStatus === true ? 'success.main' : 'error.main'}` }}>{candidateStatus === true ? 'Enabled' : 'Disabled'}</Typography>
                </Stack>
                {/* <Stack direction="row">
                    <Typography variant="subtitle2" sx={{ minWidth: '90px' }}>Status</Typography>
                    <Typography variant="subtitle2" sx={{ marginRight: 0.3 }}>:</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word", fontWeight: 'bold', color: `${status === true ? 'success.main' : 'error.main'}` }}>{status === true ? 'Enabled' : 'Disabled'}</Typography>
                </Stack> */}
                {/* <Stack direction="row" sx={{ marginBottom: 0.8, alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '90px' }}>Voted</Typography>
                    <Chip label={'Voted'} />
                </Stack> */}
                {/* <Stack direction="row" sx={{ marginBottom: 0.8 }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '90px' }}>Address</Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'justify', wordWrap: "break-word" }}>{voterAddress}</Typography>
                </Stack> */}
            </Box>
        </Box>
    )
}

export default CandidateCard