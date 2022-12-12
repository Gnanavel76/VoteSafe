import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Election from "./components/Election";
import Voters from "./components/Voters";
import Candidates from "./components/Candidates";
import Vote from "./components/Vote";

import Constituency from "./components/Constituency";
import ManageCandidate from "./components/ManageCandidate";
import ManageVoter from "./components/ManageVoter";
import DeployContract from "./components/DeployContract";
import ElectionProvider from "./store/ElectionProvider";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";
import Home from "./components/Home";
import { createTheme, ThemeProvider } from '@mui/material';
import SignUp from "./components/SignUp";

import VoterDetail from "./components/VoterDetail";
import Results from "./components/Results";
import CandidateDetail from "./components/CandidateDetail";


const theme = createTheme({
  palette: {
    primary: {
      main: "#233c7b"
    },
    secondary: {
      light: '#ead2ac',
      main: "#f7a654",
      dark: '#ff8901'
    },
    text: {
      secondary: '#454545'
    },
    card: {
      border: '#e6e6e6'
    }
  },
  typography: {
    fontFamily: 'Poppins, sans-serif'
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
        disableElevation: true
      },
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '1rem',
          textTransform: 'initial',
          lineHeight: '1.2',
          padding: '9px 30px',
        })
      },
      variants: [{
        props: { variant: 'contained', color: 'primary' },
        style: ({ theme }) => ({
          '&:hover': {
            backgroundColor: theme.palette.primary.main
          },
          "&.Mui-disabled": {
            backgroundColor: theme.palette.primary.main,
            opacity: 0.5,
            color: "white"
          },
          "&.Mui-disabled>.MuiLoadingButton-loadingIndicator": {
            opacity: 0.8,
            color: "white"
          }
        })
      }]
    }
  }
});

const App = () => {
  useEffect(() => {
    window.web3 = new window.Web3(window.ethereum)
  }, [])
  // useEffect(() => {
  //   window.ethereum.on('accountsChanged', (accounts) => {
  //     console.log(accounts?.[0]);
  //   });
  // }, []);
  return (
    <ThemeProvider theme={theme}>
      <ElectionProvider>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/createAccount" element={<SignUp />} />
          <Route path="/deployContract" element={<DeployContract />} />
          <Route path="/elections" element={<Election />} />
          <Route path="/election/:electionId">
            <Route path="constituency" element={<Constituency />} />
            <Route path="addCandidate" element={<ManageCandidate />} />
            <Route path="voters" element={<Voters />} />
            <Route path="voters/:voterId" element={<VoterDetail />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="candidates/:candidateKey" element={<CandidateDetail />} />
            <Route path="vote" element={<Vote />} />
            <Route path="results" element={<Results />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </ElectionProvider>
    </ThemeProvider>
  )
}


export default App
