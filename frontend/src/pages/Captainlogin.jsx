import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/CapatainContext'

const Captainlogin = () => {

  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')

  const { captain, setCaptain } = React.useContext(CaptainDataContext)
  const navigate = useNavigate()



  const submitHandler = async (e) => {
    e.preventDefault();
    const captain = {
      email: email,
      password
    }

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, captain)

    if (response.status === 200) {
      const data = response.data

      setCaptain(data.captain)
      localStorage.setItem('token', data.token)
      navigate('/captain-home')

    }

    setEmail('')
    setPassword('')
  }
  return (
    <div className='h-[100dvh] flex flex-col justify-between px-6 py-8 overflow-y-auto'>
      <div>
        <img className='w-12 sm:w-14 mb-8' src="https://www.svgrepo.com/show/505031/uber-driver.svg" alt="Captain" />

        <form onSubmit={submitHandler}>
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
            className='bg-gray-100 mb-6 rounded-xl px-4 py-3 border-0 w-full text-base outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 transition-all'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            placeholder='Enter your password'
          />

          <button className='bg-black text-white font-semibold mb-4 rounded-xl px-4 py-3.5 w-full text-base active:scale-95 transition-transform'>
            Login
          </button>
        </form>

        <p className='text-center text-sm text-gray-600'>
          New captain?{' '}
          <Link to='/captain-signup' className='text-black font-semibold underline'>Register as a Captain</Link>
        </p>
      </div>

      <div className='mt-6'>
        <Link
          to='/login'
          className='bg-orange-500 flex items-center justify-center text-white font-semibold rounded-xl px-4 py-3.5 w-full text-base active:scale-95 transition-transform'
        >
          Sign in as User
        </Link>
      </div>
    </div>
  )
}

export default Captainlogin