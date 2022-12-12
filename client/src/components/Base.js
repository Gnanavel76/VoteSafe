import React from 'react'
import logo from "../images/logo.svg"
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Button } from "@mui/material"
import InboxIcon from '@mui/icons-material/MoveToInbox';
import { Link, NavLink, useParams, useSearchParams } from 'react-router-dom';
import { useElection } from '../store/ElectionProvider';
import Dropdown from './Dropdown';

const getActiveStyle = (isActive) => {
    return isActive ?
        {
            backgroundColor: '#233c7b14',
            boxShadow: 'inset -3px 0px 0 #233c7b',
            fontWeight: 600,
            color: '#233c7b'
        }
        :
        {}
}
const Base = ({ children }) => {
    const { electionId } = useParams()
    const [searchParams] = useSearchParams();
    const isVotingTab = searchParams.get("election")
    const { user } = useElection()
    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Drawer variant="permanent" sx={{ width: isVotingTab ? 0 : 280, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: isVotingTab ? 0 : 280, boxSizing: 'border-box', py: 4 } }}>
                <Box display="flex" alignItems="center" flexDirection="column" gap={1.5}>
                    <img src={logo} alt="VoteSafe" />
                    <Typography variant='h6' align="center" sx={{ mb: 6, fontWeight: 600 }}>VoteSafe</Typography>
                </Box>
                {!isVotingTab && <List>
                    <ListItem button component={NavLink} to={`/election/${electionId}/constituency`} key={'Constituency'} style={({ isActive }) => getActiveStyle(isActive)}>
                        <ListItemText primary={'Constituency'} sx={{ fontWeight: 'inherit', letterSpacing: '0.2px' }} />
                    </ListItem>
                    <ListItem button component={NavLink} to={`/election/${electionId}/voters`} key={'Voters'} style={({ isActive }) => getActiveStyle(isActive)}>
                        <ListItemText primary={'Voters'} sx={{ fontWeight: 'inherit', letterSpacing: '0.2px' }} />
                    </ListItem>
                    <ListItem button component={NavLink} to={`/election/${electionId}/candidates`} key={'Candidates'} style={({ isActive }) => getActiveStyle(isActive)}>
                        <ListItemText primary={'Candidates'} sx={{ fontWeight: 'inherit', letterSpacing: '0.2px' }} />
                    </ListItem>
                    {/* <ListItem button component={NavLink} to={`/election/${electionId}/vote`} key={'Vote'} style={({ isActive }) => getActiveStyle(isActive)}>
                        <ListItemText primary={'Vote'} sx={{ fontWeight: 'inherit', letterSpacing: '0.2px' }} />
                    </ListItem> */}
                    <ListItem button component={NavLink} to={`/election/${electionId}/results`} key={'Result'}>
                        <ListItemText primary={'Result'} />
                    </ListItem>
                </List>}
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1 }}>
                <AppBar position='relative'>
                    <Toolbar sx={{ justifyContent: isVotingTab ? 'center' : 'flex-end' }}>
                        <Typography variant='h6' align="center" sx={{ fontWeight: 600 }}>VoteSafe</Typography>
                        {(user?.authToken && !isVotingTab) && <Dropdown title={`Hi, ${user.name}`} sx={{ color: 'white' }} items={[{ title: "Logout" }]} />}
                    </Toolbar>
                </AppBar>
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            </Box>
        </Box >
    )
}

export default Base