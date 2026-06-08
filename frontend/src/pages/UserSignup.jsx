import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'



const UserSignup = () => {
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ firstName, setFirstName ] = useState('')
  const [ lastName, setLastName ] = useState('')
  const [ error, setError ] = useState('')

  const navigate = useNavigate()

  const { user, setUser } = useContext(UserDataContext)




  const submitHandler = async (e) => {
    e.preventDefault()
    setError('')
    const newUser = {
      fullname: {
        firstname: firstName,
        lastname: lastName
      },
      email: email,
      password: password
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`, newUser)

      if (response.status === 201) {
        const data = response.data
        setUser(data.user)
        localStorage.setItem('token', data.token)
        navigate('/home')
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.'
      setError(message)
    }

    setEmail('')
    setFirstName('')
    setLastName('')
    setPassword('')
  }
  return (
    <div className='h-[100dvh] flex flex-col justify-between px-6 py-8 overflow-y-auto'>
      <div>
        <img className='w-14 sm:w-16 mb-8' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber" />

        <form onSubmit={submitHandler}>
          {error && (
            <div className='bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm flex items-center gap-2'>
              <i className="ri-error-warning-line text-base"></i>
              {error}
            </div>
          )}

          <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1'>Full Name</h3>
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
            className='bg-gray-100 mb-6 rounded-xl px-4 py-3 border-0 w-full text-base outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 transition-all'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            placeholder='Create a password'
          />

          <button className='bg-black text-white font-semibold mb-4 rounded-xl px-4 py-3.5 w-full text-base active:scale-95 transition-transform'>
            Create Account
          </button>
        </form>

        <p className='text-center text-sm text-gray-600'>
          Already have an account?{' '}
          <Link to='/login' className='text-black font-semibold underline'>Login here</Link>
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

export default UserSignup