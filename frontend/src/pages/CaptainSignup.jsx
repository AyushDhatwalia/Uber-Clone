import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CaptainDataContext } from '../context/CapatainContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const CaptainSignup = () => {

  const navigate = useNavigate()

  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ firstName, setFirstName ] = useState('')
  const [ lastName, setLastName ] = useState('')

  const [ vehicleColor, setVehicleColor ] = useState('')
  const [ vehiclePlate, setVehiclePlate ] = useState('')
  const [ vehicleCapacity, setVehicleCapacity ] = useState('')
  const [ vehicleType, setVehicleType ] = useState('')


  const { captain, setCaptain } = React.useContext(CaptainDataContext)


  const submitHandler = async (e) => {
    e.preventDefault()
    const captainData = {
      fullname: {
        firstname: firstName,
        lastname: lastName
      },
      email: email,
      password: password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: vehicleCapacity,
        vehicleType: vehicleType
      }
    }

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, captainData)

    if (response.status === 201) {
      const data = response.data
      setCaptain(data.captain)
      localStorage.setItem('token', data.token)
      navigate('/captain-home')
    }

    setEmail('')
    setFirstName('')
    setLastName('')
    setPassword('')
    setVehicleColor('')
    setVehiclePlate('')
    setVehicleCapacity('')
    setVehicleType('')

  }
  return (
    <div className='h-[100dvh] flex flex-col justify-between px-6 py-8 overflow-y-auto'>
      <div>
        <img className='w-12 sm:w-14 mb-8' src="https://www.svgrepo.com/show/505031/uber-driver.svg" alt="Captain" />

        <form onSubmit={submitHandler}>
          <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1'>Captain's Name</h3>
          <div className='flex gap-3 mb-5'>
            <input
              required
              className='bg-gray-100 w-1/2 rounded-xl px-4 py-3 border-0 text-base outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 transition-all'
              type="text"
              placeholder='First name'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              required
              className='bg-gray-100 w-1/2 rounded-xl px-4 py-3 border-0 text-base outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 transition-all'
              type="text"
              placeholder='Last name'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1'>Email</h3>
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='bg-gray-100 mb-5 rounded-xl px-4 py-3 border-0 w-full text-base outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 transition-all'
            type="email"
            placeholder='email@example.com'
          />

          <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1'>Password</h3>
          <input
            className='bg-gray-100 mb-5 rounded-xl px-4 py-3 border-0 w-full text-base outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 transition-all'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            placeholder='Create a password'
          />

          <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1'>Vehicle Details</h3>
          <div className='flex gap-3 mb-4'>
            <input
              required
              className='bg-gray-100 w-1/2 rounded-xl px-4 py-3 border-0 text-base outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 transition-all'
              type="text"
              placeholder='Color'
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
            />
            <input
              required
              className='bg-gray-100 w-1/2 rounded-xl px-4 py-3 border-0 text-base outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 transition-all'
              type="text"
              placeholder='Plate number'
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
            />
          </div>
          <div className='flex gap-3 mb-6'>
            <input
              required
              className='bg-gray-100 w-1/2 rounded-xl px-4 py-3 border-0 text-base outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 transition-all'
              type="number"
              placeholder='Capacity'
              value={vehicleCapacity}
              onChange={(e) => setVehicleCapacity(e.target.value)}
            />
            <select
              required
              className='bg-gray-100 w-1/2 rounded-xl px-4 py-3 border-0 text-base outline-none focus:ring-2 focus:ring-black text-gray-700 transition-all'
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="" disabled>Vehicle type</option>
              <option value="car">Car</option>
              <option value="auto">Auto</option>
              <option value="moto">Moto</option>
            </select>
          </div>

          <button className='bg-black text-white font-semibold mb-4 rounded-xl px-4 py-3.5 w-full text-base active:scale-95 transition-transform'>
            Create Captain Account
          </button>
        </form>

        <p className='text-center text-sm text-gray-600'>
          Already have an account?{' '}
          <Link to='/captain-login' className='text-black font-semibold underline'>Login here</Link>
        </p>
      </div>

      <div className='mt-4'>
        <p className='text-xs text-gray-400 leading-relaxed'>
          This site is protected by reCAPTCHA and the{' '}
          <span className='underline'>Google Privacy Policy</span> and{' '}
          <span className='underline'>Terms of Service apply</span>.
        </p>
      </div>
    </div>
  )
}

export default CaptainSignup