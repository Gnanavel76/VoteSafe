import React, { useCallback, useEffect, useRef, useState } from 'react'
import Base from './Base'
import { TextField, Stack, Button, Typography, MenuItem } from '@mui/material'
import { Link, useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { jsonToFormdata } from '../util';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useElection } from '../store/ElectionProvider';
import * as faceapi from 'face-api.js';
import captureVideoFrame from "capture-video-frame/capture-video-frame";
import { Box } from '@mui/system';
const Vote = () => {
    const navigate = useNavigate()
    const { electionId } = useParams()
    const [electionName, setElectionName] = useState("Lokshabha election")
    const { user } = useElection()
    const [voterId, setVoterId] = useState("")
    const [voter, setVoter] = useState(null)
    const [candidates, setCandidates] = useState([])
    const [voterImage, setVoterImage] = useState(null)
    const [timer, setTimer] = useState(0)
    const canvasRef = useRef()
    const onSubmit = async () => {
        try {
            const res = await axios
                .get(`${API_BASE_URL}/${electionId}/getVoterById/${voterId}`, {
                    headers: { 'Authorization': `Bearer ${user.authToken}` },
                })
            if (res.data.status) {
                setVoter(res.data.voter[0])
            }
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }
    const loadModels = async () => {
        return Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
            faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
            faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ])
            .then(() => true)
            .catch(err => err)
    }
    const sendFace = async () => {
        try {
            const formData = new FormData();
            formData.append("face", voterImage);
            formData.append("voterIndex", voter.voterIndex);
            formData.append("voterId", voter.voterId);
            formData.append("voterImage", voter.voterImage);
            formData.append("voterImage", voter.voterImage);
            formData.append("consituencyKey", voter.consituencyKey);
            formData.append("voterETHAccount", voter.voterETHaccount);
            const res = await axios
                .post(`${API_BASE_URL}/detectFace/${electionId}`, formData, {
                    headers: { "Content-Type": "application/multipart/form-data; charset=UTF-8" },
                })
            setCandidates(res.data.candidates)
            setTimer(120)
        } catch (error) {
            setVoterImage(null)
            setVoterId("")
            setVoter(null)
            setCandidates([])
            setTimer(0)
            toast.error("Face not matched. Try again")
        }
    }
    const videoRef = useCallback(async (node) => {
        if (node !== null && voterImage === null) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            node.srcObject = stream;
            node.muted = true;
            await loadModels()
            let intervalId = null
            console.log(node);
            console.log(voterImage);
            console.log(node.paused);
            node.addEventListener('play', () => {
                console.log("Added Event Listeneer");
                if (intervalId === null) {
                    intervalId = setInterval(async () => {
                        const detections = await faceapi.detectAllFaces(
                            node,
                            new faceapi.TinyFaceDetectorOptions()
                        ).withFaceLandmarks().withFaceExpressions()
                        console.log(detections);
                        if (detections.length === 1) {
                            node.pause();
                            node.srcObject.getTracks()[0].stop()
                            const frame = captureVideoFrame("voterImage", "png");
                            console.log(frame.blob);
                            setVoterImage(frame.blob)
                            clearInterval(intervalId)
                        }
                    }, 1000)
                }
                console.log(intervalId);
            }, { once: true })
            console.log("In");
        }
    })
    useEffect(() => {
        if (voterImage !== null) {
            sendFace()
                .then(res => console.log(res))
        }
    }, [voterImage])
    const vote = async (candidateId) => {
        try {
            const res = await axios
                .post(`${API_BASE_URL}/castVote/${electionId}`, {
                    voterETHAccount: voter.voterETHaccount,
                    voterIndex: voter.voterIndex,
                    consituencyId: voter.consituencyKey,
                    candidateId
                })
            toast.success("Vote casted successfully")
            setVoterImage(null)
            setVoterId("")
            setVoter(null)
            setCandidates([])
            setTimer(0)
            // if (res.data.isVoted) {
            //     window.location.href = `http://localhost:3000/election/${electionId}/vote?election=true`;
            // }
        } catch (error) {
            setVoterImage(null)
            setVoterId("")
            setVoter(null)
            setCandidates([])
            setTimer(0)
            toast.error(error?.response?.data.error || error.message)
        }
    }
    useEffect(() => {
        if (candidates.length > 0) {
            const timerId = setInterval(() => setTimer(timer => --timer), 1000)
            return () => clearInterval(timerId)
        }
        if (candidates.length > 0 && timer === 0) {
            setVoterImage(null)
            setVoterId("")
            setVoter(null)
            setCandidates([])
            setTimer(0)
        }
    }, [candidates.length])
    useEffect(() => {
        if (candidates.length > 0 && timer === 0) {
            // setVoterImage(null)
            // setVoterId("")
            // setVoter(null)
            // setCandidates([])
            // setTimer(0)
            window.location.reload()
        }
    }, [timer])
    return (
        <Base>
            {/* <Button startIcon={<ArrowBackIcon />} component={Link} to="/candidates" sx={{ mb: 3, padding: 0, '&:hover': { bgcolor: 'transparent' } }}>Go back</Button> */}
            {!voter && <Stack spacing={3} sx={{ alignItems: "center", maxWidth: '600px', margin: '0 auto', bgcolor: 'white', borderRadius: 3, padding: 3 }}>
                <Typography variant='h5'>{electionName}</Typography>
                <TextField fullWidth variant='outlined' label="Enter Voter Id" required value={voterId} onChange={(e) => setVoterId(e.target.value)} />
                <Button variant="contained" onClick={onSubmit}>Submit</Button>
            </Stack>}
            {
                (voter && candidates.length === 0) &&
                <Stack spacing={3} sx={{ alignItems: "center", maxWidth: '600px', margin: '0 auto', bgcolor: 'white', borderRadius: 3, padding: 3 }}>
                    <div className="ratio ratio-4x3 text-center" style={{ width: '100%', margin: '0 auto', height: '394px', position: 'relative' }}>
                        <video id="voterImage" ref={videoRef} autoPlay style={{ display: 'block', margin: '0 auto', position: 'absolute', width: '100%', height: '100%' }}></video>
                        <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto', position: 'absolute', width: '100%', height: '100%' }} />
                    </div>
                    <Button variant="contained" color="error" onClick={() => window.location.reload()}>Cancel</Button>
                </Stack>
            }
            {
                candidates.length > 0 &&
                <Stack spacing={2}>
                    <Typography variant="h6" color="red" sx={{ textAlign: "center", }}>This window will timeout in {timer} secs</Typography>
                    <Stack direction="column" spacing={2}>
                        {candidates.map(c => {
                            return <Stack key={c.candidateId} direction="row" spacing={2} sx={{ alignItems: 'center', bgcolor: 'white', padding: 2, borderRadius: 3 }}>
                                <img src={c.partyImage} alt="" style={{ borderRadius: "50%", width: "60px", height: "60px", margin: "0 auto 1rem" }} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" sx={{ mb: 0.2 }}>{c.name}</Typography>
                                    <Typography variant="caption1">{c.party || 'Unaffiliated'}</Typography>
                                </Box>
                                <Button variant='contained' onClick={() => vote(c.candidateId)}>Vote</Button>
                            </Stack>
                        })}
                    </Stack>
                </Stack>
            }
        </Base >
    )
}

export default Vote