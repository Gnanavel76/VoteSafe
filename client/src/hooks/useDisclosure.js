import React, { useEffect, useState } from 'react'

const useDisclose = () => {
    const [open, setOpen] = useState(false)
    const onOpen = () => {
        setOpen(true)
    }
    const onClose = () => {
        setOpen(false)
    }
    const onToggle = () => {
        setOpen(prev => !prev)
    }
    return [open, onOpen, onClose, onToggle]
}

export default useDisclose