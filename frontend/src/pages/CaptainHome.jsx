import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CaptainDetails from '../components/CaptainDetails'
import RidePopUp from '../components/RidePopUp'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ConfirmRidePopUp from '../components/ConfirmRidePopUp'
import { useEffect, useContext } from 'react'
import { SocketContext } from '../context/SocketContext'
import { CaptainDataContext } from '../context/CapatainContext'
import axios from 'axios'
import LiveTracking from '../components/LiveTracking'

const CaptainHome = () => {

    const [ ridePopupPanel, setRidePopupPanel ] = useState(false)
    const [ confirmRidePopupPanel, setConfirmRidePopupPanel ] = useState(false)

    const ridePopupPanelRef = useRef(null)
    const confirmRidePopupPanelRef = useRef(null)
    const [ ride, setRide ] = useState(null)

    const { socket } = useContext(SocketContext)
    const { captain } = useContext(CaptainDataContext)

    useEffect(() => {
        socket.emit('join', {
            userId: captain._id,
            userType: 'captain'
        })
        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {

                    socket.emit('update-location-captain', {
                        userId: captain._id,
                        location: {
                            ltd: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    })
                })
            }
        }

        const locationInterval = setInterval(updateLocation, 10000)
        updateLocation()

        // return () => clearInterval(locationInterval)
    }, [])

    socket.on('new-ride', (data) => {

        setRide(data)
        setRidePopupPanel(true)

    })

    async function confirmRide() {

        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`, {

            rideId: ride._id,
            captainId: captain._id,


        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })

        setRidePopupPanel(false)
        setConfirmRidePopupPanel(true)

    }


    useGSAP(function () {
        if (ridePopupPanel) {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ ridePopupPanel ])

    useGSAP(function () {
        if (confirmRidePopupPanel) {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ confirmRidePopupPanel ])

    return (
        <div className='h-[100dvh] relative overflow-hidden'>
            {/* Fixed top bar */}
            <div className='fixed p-4 top-0 flex items-center justify-between w-full z-10 pointer-events-none'>
                <img
                    className='w-14 sm:w-16 drop-shadow-md pointer-events-auto'
                    src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
                    alt="Uber"
                />
                <div className='pointer-events-auto flex gap-2'>
                    <Link to='/captain/trips' className='bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors'>
                        <i className="ri-history-line text-xl"></i>
                    </Link>
                    <Link to='/captain/logout' className='bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-red-50 text-red-500 transition-colors'>
                        <i className="text-lg font-medium ri-logout-box-r-line"></i>
                    </Link>
                </div>
            </div>

            {/* Full-screen map */}
            <div className='absolute inset-0 w-full h-full'>
                <LiveTracking />
            </div>

            {/* Captain details card pinned to bottom */}
            <div className='absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-6 z-10'>
                {/* Drag handle */}
                <div className='flex justify-center mb-3'>
                    <div className='w-10 h-1 bg-gray-300 rounded-full'></div>
                </div>
                <CaptainDetails />
            </div>

            {/* Ride popup */}
            <div ref={ridePopupPanelRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white rounded-t-3xl shadow-2xl px-4 py-4 pt-10 max-h-[85dvh] overflow-y-auto'>
                <RidePopUp
                    ride={ride}
                    setRidePopupPanel={setRidePopupPanel}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    confirmRide={confirmRide}
                />
            </div>

            {/* Confirm ride popup */}
            <div ref={confirmRidePopupPanelRef} className='fixed w-full h-[100dvh] z-20 bottom-0 translate-y-full bg-white rounded-t-3xl shadow-2xl px-4 py-4 pt-10 overflow-y-auto'>
                <ConfirmRidePopUp
                    ride={ride}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    setRidePopupPanel={setRidePopupPanel}
                />
            </div>
        </div>
    )
}

export default CaptainHome