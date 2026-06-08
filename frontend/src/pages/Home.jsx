import React, { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import { SocketContext } from '../context/SocketContext';
import { useContext } from 'react';
import { UserDataContext } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import LiveTracking from '../components/LiveTracking';

const Home = () => {
    const [ pickup, setPickup ] = useState('')
    const [ destination, setDestination ] = useState('')
    const [ panelOpen, setPanelOpen ] = useState(false)
    const vehiclePanelRef = useRef(null)
    const confirmRidePanelRef = useRef(null)
    const vehicleFoundRef = useRef(null)
    const waitingForDriverRef = useRef(null)
    const panelRef = useRef(null)
    const panelCloseRef = useRef(null)
    const [ vehiclePanel, setVehiclePanel ] = useState(false)
    const [ confirmRidePanel, setConfirmRidePanel ] = useState(false)
    const [ vehicleFound, setVehicleFound ] = useState(false)
    const [ waitingForDriver, setWaitingForDriver ] = useState(false)
    const [ pickupSuggestions, setPickupSuggestions ] = useState([])
    const [ destinationSuggestions, setDestinationSuggestions ] = useState([])
    const [ activeField, setActiveField ] = useState(null)
    const [ fare, setFare ] = useState({})
    const [ vehicleType, setVehicleType ] = useState(null)
    const [ ride, setRide ] = useState(null)

    const navigate = useNavigate()

    const { socket } = useContext(SocketContext)
    const { user } = useContext(UserDataContext)

    useEffect(() => {
        socket.emit("join", { userType: "user", userId: user._id })
    }, [ user ])

    useEffect(() => {
        if (navigator.geolocation && !pickup) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                    if (response.data && response.data.display_name) {
                        setPickup(response.data.display_name);
                    }
                } catch (error) {
                    console.error("Error fetching location", error);
                }
            });
        }
    }, [])

    socket.on('ride-confirmed', ride => {


        setVehicleFound(false)
        setWaitingForDriver(true)
        setRide(ride)
    })

    socket.on('ride-started', ride => {
        console.log("ride")
        setWaitingForDriver(false)
        navigate('/riding', { state: { ride } }) // Updated navigate to include ride data
    })


    const handlePickupChange = (e) => {
        setPickup(e.target.value)
    }

    const handleDestinationChange = (e) => {
        setDestination(e.target.value)
    }

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (pickup.length >= 3) {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                        params: { input: pickup },
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                    setPickupSuggestions(response.data)
                } catch (err) {
                    console.error(err)
                }
            } else {
                setPickupSuggestions([])
            }
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [pickup])

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (destination.length >= 3) {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                        params: { input: destination },
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                    setDestinationSuggestions(response.data)
                } catch (err) {
                    console.error(err)
                }
            } else {
                setDestinationSuggestions([])
            }
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [destination])

    const submitHandler = (e) => {
        e.preventDefault()
    }

    useGSAP(function () {
        if (panelOpen) {
            gsap.to(panelRef.current, {
                height: '70%',
                padding: 24
                // opacity:1
            })
            gsap.to(panelCloseRef.current, {
                opacity: 1
            })
        } else {
            gsap.to(panelRef.current, {
                height: '0%',
                padding: 0
                // opacity:0
            })
            gsap.to(panelCloseRef.current, {
                opacity: 0
            })
        }
    }, [ panelOpen ])


    useGSAP(function () {
        if (vehiclePanel) {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ vehiclePanel ])

    useGSAP(function () {
        if (confirmRidePanel) {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ confirmRidePanel ])

    useGSAP(function () {
        if (vehicleFound) {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ vehicleFound ])

    useGSAP(function () {
        if (waitingForDriver) {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ waitingForDriver ])


    async function findTrip() {
        setVehiclePanel(true)
        setPanelOpen(false)

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
            params: { pickup, destination },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })


        setFare(response.data)


    }

    async function createRide() {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, {
            pickup,
            destination,
            vehicleType
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })


    }

    return (
        <div className='h-[100dvh] relative overflow-hidden bg-gray-100'>
            {/* Uber Logo */}
            <img
                className='w-14 sm:w-16 absolute left-4 top-4 z-10 drop-shadow-md'
                src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
                alt="Uber"
            />

            {/* Top Right Menu */}
            <div className='absolute right-4 top-4 z-10 flex gap-2'>
                <Link to='/user/trips' className='bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors'>
                    <i className="ri-history-line text-xl"></i>
                </Link>
                <Link to='/user/logout' className='bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-red-50 text-red-500 transition-colors'>
                    <i className="ri-logout-box-r-line text-xl"></i>
                </Link>
            </div>

            {/* Full-screen Map */}
            <div className='absolute inset-0 w-full h-full'>
                <LiveTracking />
            </div>

            {/* Bottom overlay panel */}
            <div className='flex flex-col justify-end h-[100dvh] absolute top-0 w-full pointer-events-none'>
                {/* Search bar card */}
                <div className='pointer-events-auto bg-white rounded-t-3xl shadow-2xl relative'>
                    {/* Drag handle */}
                    <div className='flex justify-center pt-3 pb-1'>
                        <div className='w-10 h-1 bg-gray-300 rounded-full'></div>
                    </div>

                    {/* Close panel arrow */}
                    <h5
                        ref={panelCloseRef}
                        onClick={() => setPanelOpen(false)}
                        className='absolute opacity-0 right-5 top-4 text-2xl cursor-pointer text-gray-500 hover:text-black transition-colors z-10'
                    >
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>

                    <div className='px-5 pb-4 pt-2'>
                        <h4 className='text-xl sm:text-2xl font-semibold mb-3'>Find a trip</h4>
                        <form className='relative' onSubmit={submitHandler}>
                            {/* Vertical line decoration */}
                            <div className="absolute h-12 w-0.5 top-[50%] -translate-y-1/2 left-4 bg-gray-700 rounded-full"></div>

                            <input
                                onClick={() => { setPanelOpen(true); setActiveField('pickup') }}
                                value={pickup}
                                onChange={handlePickupChange}
                                className='bg-gray-100 focus:bg-gray-200 transition-colors px-10 py-3 text-base rounded-xl w-full outline-none placeholder:text-gray-500'
                                type="text"
                                placeholder='Add a pick-up location'
                            />
                            <input
                                onClick={() => { setPanelOpen(true); setActiveField('destination') }}
                                value={destination}
                                onChange={handleDestinationChange}
                                className='bg-gray-100 focus:bg-gray-200 transition-colors px-10 py-3 text-base rounded-xl w-full mt-3 outline-none placeholder:text-gray-500'
                                type="text"
                                placeholder='Enter your destination'
                            />
                        </form>
                        <button
                            onClick={findTrip}
                            className='bg-black text-white px-4 py-3 rounded-xl mt-3 w-full font-semibold text-base active:scale-95 transition-transform'
                        >
                            Find Trip
                        </button>
                    </div>

                    {/* Suggestions panel - slides open */}
                    <div ref={panelRef} className='overflow-y-auto h-0'>
                        <div className='px-4 pb-4'>
                            <LocationSearchPanel
                                suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                                setPanelOpen={setPanelOpen}
                                setVehiclePanel={setVehiclePanel}
                                setPickup={setPickup}
                                setDestination={setDestination}
                                activeField={activeField}
                                setActiveField={setActiveField}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicle selection panel */}
            <div
                ref={vehiclePanelRef}
                className='fixed w-full z-10 bottom-0 translate-y-full bg-white rounded-t-3xl shadow-2xl px-4 py-4 pt-10 max-h-[85dvh] overflow-y-auto'
            >
                <VehiclePanel
                    selectVehicle={setVehicleType}
                    fare={fare}
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehiclePanel={setVehiclePanel}
                />
            </div>

            {/* Confirm ride panel */}
            <div
                ref={confirmRidePanelRef}
                className='fixed w-full z-10 bottom-0 translate-y-full bg-white rounded-t-3xl shadow-2xl px-4 py-4 pt-10 max-h-[85dvh] overflow-y-auto'
            >
                <ConfirmRide
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehicleFound={setVehicleFound}
                />
            </div>

            {/* Looking for driver panel */}
            <div
                ref={vehicleFoundRef}
                className='fixed w-full z-10 bottom-0 translate-y-full bg-white rounded-t-3xl shadow-2xl px-4 py-4 pt-10 max-h-[85dvh] overflow-y-auto'
            >
                <LookingForDriver
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setVehicleFound={setVehicleFound}
                />
            </div>

            {/* Waiting for driver panel */}
            <div
                ref={waitingForDriverRef}
                className='fixed w-full z-10 bottom-0 bg-white rounded-t-3xl shadow-2xl px-4 py-4 pt-10 max-h-[85dvh] overflow-y-auto translate-y-full'
            >
                <WaitingForDriver
                    ride={ride}
                    setVehicleFound={setVehicleFound}
                    setWaitingForDriver={setWaitingForDriver}
                    waitingForDriver={waitingForDriver}
                />
            </div>
        </div>
    )
}

export default Home