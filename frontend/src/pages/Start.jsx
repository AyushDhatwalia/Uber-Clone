import React from 'react'
import { Link } from 'react-router-dom'

const Start = () => {
  return (
    <div className='h-[100dvh] flex flex-col'>
      <div className='bg-cover bg-center bg-[url(https://images.unsplash.com/photo-1619059558110-c45be64b73ae?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] flex-1 flex flex-col justify-between'>
        <div className='pt-8 px-8'>
          <img className='w-16 sm:w-20' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber" />
        </div>
        <div className='bg-white rounded-t-3xl shadow-2xl px-6 pb-safe pb-8 pt-6'>
          <h2 className='text-2xl sm:text-3xl font-bold mb-2'>Get Started with Uber</h2>
          <p className='text-gray-500 text-sm mb-5'>Book a ride or drive with us.</p>
          <Link
            to='/login'
            className='flex items-center justify-center w-full bg-black text-white py-3.5 rounded-xl font-semibold text-base active:scale-95 transition-transform'
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Start