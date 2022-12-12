import React, { useEffect, useRef } from 'react'
import { Avatar, FormHelperText, IconButton } from '@mui/material'
import { FaUserCircle } from "react-icons/fa";
import { useFormContext } from 'react-hook-form';
import { getBase64 } from '../util';
const ProfileImage = (props) => {
    const { fieldname } = props
    const { register, formState: { errors }, setValue, getValues, setError } = useFormContext();
    const { name, ref } = register(fieldname);
    const imgRef = useRef(null)
    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (file) {
            try {
                imgRef.current = await getBase64(file)
                console.log(name);
                setValue(name, file, { shouldValidate: true })
            } catch (error) {
                setError(name, "Error occurred while reading file. Try again!")
            }
        }
    }

    let image = null
    if (imgRef.current !== null) {
        image = imgRef.current
    } else if (getValues(fieldname)) {
        image = getValues(fieldname)
    }

    return (
        <>
            <IconButton color="primary" aria-label="upload picture" component="label">
                {
                    image
                        ?
                        <Avatar src={image} sx={{ width: 80, height: 80, bgcolor: 'transparent' }} />
                        :
                        <FaUserCircle style={{ width: '80px', height: '80px', color: '#94a3b8' }} />
                }
                <input ref={ref} onChange={handleFileChange} hidden accept="image/*" type="file" />

            </IconButton>
            {errors[fieldname] && <FormHelperText error sx={{ marginTop: "0!important" }}>{errors[fieldname].message}</FormHelperText>}
        </>

    )
}

export default ProfileImage