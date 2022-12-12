import React, { useState } from 'react'
import { Button, Menu, MenuItem } from '@mui/material'
import { MdKeyboardArrowDown } from "react-icons/md";
const Dropdown = (props) => {
    const { title, items, sx } = props
    const [anchorEl, setAnchorEl] = useState(null)
    const onOpen = (event) => setAnchorEl(event.currentTarget);
    const onClose = () => setAnchorEl(null);

    return (
        <>
            <Button onClick={onOpen} endIcon={<MdKeyboardArrowDown />} sx={{ px: 0, color: "black", "&:hover": { bgcolor: 'transparent' }, ...sx }}>
                {title}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={onClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    "& .MuiPaper-root": { minWidth: '180px', boxShadow: 1 }
                }}
            >
                {
                    items.map((item, index) => {
                        return (
                            <MenuItem key={index} onClick={onClose}>{item.title}</MenuItem>
                        )
                    })
                }
            </Menu>
        </>
    )
}

export default Dropdown