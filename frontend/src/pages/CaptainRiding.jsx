import React, { useRef, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import LiveTracking from '../components/LiveTracking'
import axios from 'axios'
import { calculateDistance } from '../utils/distance'

const CaptainRiding = () => {

    const [ finishRidePanel, setFinishRidePanel ] = useState(false)
    const [ distance, setDistance ] = useState(null)
    const finishRidePanelRef = useRef(null)
    const location = useLocation()
    const rideData = location.state?.ride

    useEffect(() => {
        let watchId;
        const getDistanceAndTrack = () => {
            if (!rideData?.destLat || !rideData?.destLng) return;
            
            // Track captain location continuously
            if (navigator.geolocation) {
                watchId = navigator.geolocation.watchPosition(position => {
                    const dist = calculateDistance(
                        position.coords.latitude, 
                        position.coords.longitude, 
                        rideData.destLat, 
                        rideData.destLng
                    )
                    setDistance(dist)
                })
            }
        }
        getDistanceAndTrack()

        return () => {
            if (watchId && navigator.geolocation) {
                navigator.geolocation.clearWatch(watchId)
            }
        }
    }, [rideData])


    useGSAP(function () {
        if (finishRidePanel) {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ finishRidePanel ])


    return (
        <div className='h-[100dvh] relative flex flex-col justify-end overflow-hidden'>

            {/* Fixed top bar */}
            <div className='fixed p-4 top-0 flex items-center justify-between w-full z-10 pointer-events-none'>
                <img
                    className='w-14 sm:w-16 drop-shadow-md pointer-events-auto'
                    src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
                    alt="Uber"
                />
                <Link
                    to='/captain-home'
                    className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md pointer-events-auto hover:bg-gray-100 transition-colors'
                >
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>

            {/* Full-screen live map */}
            <div className='h-[100dvh] fixed w-full top-0 z-[-1]'>
                <LiveTracking />
            </div>

            {/* Bottom action bar */}
            <div
                className='bg-yellow-400 rounded-t-3xl shadow-2xl px-5 pt-3 pb-6 z-10 cursor-pointer'
                onClick={() => setFinishRidePanel(true)}
            >
                {/* Drag handle */}
                <div className='flex justify-center mb-3'>
                    <i className="text-3xl text-gray-700 ri-arrow-up-wide-line"></i>
                </div>
                <div className='flex items-center justify-between'>
                    <h4 className='text-xl font-semibold'>{distance ? `${distance} KM away` : 'Calculating...'}</h4>
                    <button
                        className='bg-green-600 text-white font-semibold py-3 px-8 rounded-xl active:scale-95 transition-transform'
                        onClick={(e) => { e.stopPropagation(); setFinishRidePanel(true); }}
                    >
                        Complete Ride
                    </button>
                </div>
            </div>

            {/* Finish ride panel */}
            <div
                ref={finishRidePanelRef}
                className='fixed w-full z-[500] bottom-0 translate-y-full bg-white rounded-t-3xl shadow-2xl px-4 py-4 pt-10 max-h-[85dvh] overflow-y-auto'
            >
                <FinishRide
                    ride={rideData}
                    setFinishRidePanel={setFinishRidePanel}
                />
            </div>
        </div>
    )
}

export default CaptainRiding