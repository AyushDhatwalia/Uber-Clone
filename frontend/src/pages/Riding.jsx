import React, { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useContext } from 'react'
import { SocketContext } from '../context/SocketContext'
import { useNavigate } from 'react-router-dom'
import LiveTracking from '../components/LiveTracking'
import RateDriver from '../components/RateDriver'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const Riding = () => {
    const location = useLocation()
    const { ride } = location.state || {} // Retrieve ride data
    const { socket } = useContext(SocketContext)
    const navigate = useNavigate()

    const [ratePanel, setRatePanel] = useState(false)
    const ratePanelRef = useRef(null)

    socket.on("ride-ended", () => {
        setRatePanel(true)
    })

    useGSAP(function () {
        if (ratePanel) {
            gsap.to(ratePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(ratePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ ratePanel ])

    return (
        <div className='h-[100dvh] relative overflow-hidden flex flex-col justify-end'>
            {/* Home button */}
            <Link
                to='/home'
                className='fixed right-4 top-4 h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md z-10 hover:bg-gray-100 transition-colors'
            >
                <i className="text-lg font-medium ri-home-5-line"></i>
            </Link>

            {/* Full-screen map */}
            <div className='absolute inset-0 w-full h-full z-[-1]'>
                <LiveTracking />
            </div>

            {/* Ride info card */}
            <div className='bg-white rounded-t-3xl shadow-2xl px-4 pt-4 pb-6 max-h-[50dvh] overflow-y-auto'>
                {/* Drag handle */}
                <div className='flex justify-center mb-3'>
                    <div className='w-10 h-1 bg-gray-300 rounded-full'></div>
                </div>

                <div className='flex items-center justify-between mb-4'>
                    <img className='h-14 rounded-lg object-cover' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="Vehicle" />
                    <div className='text-right'>
                        <h2 className='text-base font-semibold capitalize'>{ride?.captain.fullname.firstname}</h2>
                        <h4 className='text-xl font-bold tracking-wide'>{ride?.captain.vehicle.plate}</h4>
                        <p className='text-xs text-gray-500'>Maruti Suzuki Alto</p>
                    </div>
                </div>

                <div className='w-full space-y-0 border rounded-xl overflow-hidden'>
                    <div className='flex items-center gap-4 p-3 border-b'>
                        <i className="text-lg ri-map-pin-2-fill text-gray-700"></i>
                        <div>
                            <p className='text-sm text-gray-500'>Destination</p>
                            <p className='text-sm font-medium leading-tight'>{ride?.destination}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4 p-3'>
                        <i className="ri-currency-line text-gray-700"></i>
                        <div>
                            <p className='text-sm text-gray-500'>Fare</p>
                            <p className='text-base font-semibold'>₹{ride?.fare} <span className='text-xs font-normal text-gray-500'>Cash</span></p>
                        </div>
                    </div>
                </div>

                <button className='w-full mt-4 bg-green-600 text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform'>
                    Make a Payment
                </button>
            </div>

            <div ref={ratePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <RateDriver ride={ride} setRatePanel={setRatePanel} />
            </div>
        </div>
    )
}

export default Riding