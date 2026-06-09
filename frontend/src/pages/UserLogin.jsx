import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const UserLogin = () => {
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ error, setError ] = useState('')

  const { user, setUser } = useContext(UserDataContext)
  const navigate = useNavigate()



  const submitHandler = async (e) => {
    e.preventDefault();
    setError('')

    const userData = {
      email: email,
      password: password
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, userData)

      if (response.status === 200) {
        const data = response.data
        setUser(data.user)
        localStorage.setItem('token', data.token)
        navigate('/home')
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password'
      setError(message)
    }

    setEmail('')
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
          New here?{' '}
          <Link to='/signup' className='text-black font-semibold underline'>Create an account</Link>
        </p>
      </div>

      <div className='mt-6'>
        <Link
          to='/captain-login'
          className='bg-green-600 flex items-center justify-center text-white font-semibold rounded-xl px-4 py-3.5 w-full text-base active:scale-95 transition-transform'
        >
          Sign in as Captain
        </Link>
      </div>
    </div>
  )
}

export default UserLogin