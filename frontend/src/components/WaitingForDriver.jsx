import React, { useContext, useEffect, useState } from 'react'
import { SocketContext } from '../context/SocketContext'
import { calculateDistance } from '../utils/distance'

const WaitingForDriver = (props) => {
  const { socket } = useContext(SocketContext)
  const [distance, setDistance] = useState(null)
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    // Get user's location once
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const userLoc = {
          ltd: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(userLoc)

        // Instantly calculate distance if captain's location is in the ride object
        if (props.ride?.captain?.location?.ltd) {
          const initialDist = calculateDistance(
            userLoc.ltd, 
            userLoc.lng, 
            props.ride.captain.location.ltd, 
            props.ride.captain.location.lng
          )
          setDistance(initialDist)
        }
      })
    }

    const handleLocationUpdate = (location) => {
      if (userLocation) {
        const dist = calculateDistance(userLocation.ltd, userLocation.lng, location.ltd, location.lng)
        setDistance(dist)
      }
    }

    socket.on('captain-location-update', handleLocationUpdate)

    return () => {
      socket.off('captain-location-update', handleLocationUpdate)
    }
  }, [socket, userLocation])

  return (
    <div>
      <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
        props.waitingForDriver(false)
      }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>

      <div className='flex items-center justify-between'>
        <img className='h-12' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
        <div className='text-right'>
          <h2 className='text-lg font-medium capitalize'>{props.ride?.captain.fullname.firstname}</h2>
          <h4 className='text-xl font-semibold -mt-1 -mb-1'>{props.ride?.captain.vehicle.plate}</h4>
          <p className='text-sm text-gray-600'>Maruti Suzuki Alto</p>
          <h1 className='text-lg font-semibold'>  {props.ride?.otp} </h1>
          {distance && <p className='text-sm font-bold text-green-600 mt-1'>{distance} KM away</p>}
        </div>
      </div>

      <div className='flex gap-2 justify-between flex-col items-center'>
        <div className='w-full mt-5'>
          <div className='flex items-center gap-5 p-3 border-b-2'>
            <i className="ri-map-pin-user-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>562/11-A</h3>
              <p className='text-sm -mt-1 text-gray-600'>{props.ride?.pickup}</p>
            </div>
          </div>
          <div className='flex items-center gap-5 p-3 border-b-2'>
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>562/11-A</h3>
              <p className='text-sm -mt-1 text-gray-600'>{props.ride?.destination}</p>
            </div>
          </div>
          <div className='flex items-center gap-5 p-3'>
            <i className="ri-currency-line"></i>
            <div>
              <h3 className='text-lg font-medium'>₹{props.ride?.fare} </h3>
              <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaitingForDriver