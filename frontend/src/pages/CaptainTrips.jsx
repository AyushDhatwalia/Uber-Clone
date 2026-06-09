import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const CaptainTrips = () => {
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/captain-history`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                })
                setTrips(response.data)
            } catch (error) {
                console.error("Error fetching trips", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTrips()
    }, [])

    return (
        <div className='h-screen bg-gray-100 flex flex-col'>
            {/* Header */}
            <div className='bg-white shadow-md px-4 py-4 flex items-center justify-between z-10'>
                <div className='flex items-center gap-4'>
                    <Link to='/captain-home' className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors'>
                        <i className="ri-arrow-left-line text-xl font-bold"></i>
                    </Link>
                    <h2 className='text-2xl font-bold'>Ride History</h2>
                </div>
            </div>

            {/* Trips List */}
            <div className='flex-1 overflow-y-auto p-4'>
                {loading ? (
                    <div className='flex justify-center mt-10'>
                        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
                    </div>
                ) : trips.length === 0 ? (
                    <div className='text-center mt-20'>
                        <i className="ri-steering-2-line text-6xl text-gray-300"></i>
                        <p className='text-gray-500 mt-4 text-lg'>You haven't completed any rides yet.</p>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {trips.map((trip) => (
                            <div key={trip._id} className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                                <div className='flex justify-between items-center mb-4'>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        trip.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                        trip.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                                    </span>
                                    <span className='font-bold text-lg'>₹{trip.fare}</span>
                                </div>
                                
                                <div className='flex flex-col gap-4'>
                                    <div className='flex items-start gap-4 relative'>
                                        <div className='mt-1 flex flex-col items-center gap-1 absolute top-0 bottom-0'>
                                            <div className='w-2 h-2 bg-black rounded-full'></div>
                                            <div className='w-0.5 h-full bg-gray-300'></div>
                                            <div className='w-2 h-2 bg-black rounded-sm'></div>
                                        </div>
                                        <div className='ml-8'>
                                            <p className='text-sm text-gray-500 font-medium'>Pickup</p>
                                            <h3 className='text-base font-semibold leading-tight'>{trip.pickup}</h3>
                                        </div>
                                    </div>
                                    <div className='flex items-start gap-4'>
                                        <div className='ml-8'>
                                            <p className='text-sm text-gray-500 font-medium'>Destination</p>
                                            <h3 className='text-base font-semibold leading-tight'>{trip.destination}</h3>
                                        </div>
                                    </div>
                                </div>

                                {trip.user && (
                                    <div className='mt-4 pt-4 border-t border-gray-100 flex items-center gap-3'>
                                        <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden'>
                                            <i className="ri-user-smile-fill text-gray-400 text-xl"></i>
                                        </div>
                                        <div>
                                            <p className='text-sm font-medium'>Passenger: {trip.user.fullname.firstname}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CaptainTrips
