import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const RateDriver = (props) => {
    const [rating, setRating] = useState(5)
    const navigate = useNavigate()

    const submitHandler = async (e) => {
        e.preventDefault()

        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/rate`, {
                rideId: props.ride._id,
                rating: rating
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })

            props.setRatePanel(false)
            navigate('/home')
        } catch (err) {
            console.error("Error rating driver", err)
        }
    }

    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setRatePanel(false)
                navigate('/home')
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            
            <h3 className='text-2xl font-semibold mb-5 text-center mt-4'>Rate your Captain</h3>
            
            <div className='flex items-center justify-between p-4 border-2 border-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3 '>
                    <img className='h-12 rounded-full object-cover w-12' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="" />
                    <h2 className='text-lg font-medium capitalize'>{props.ride?.captain?.fullname?.firstname}</h2>
                </div>
            </div>

            <div className='flex gap-2 justify-between flex-col items-center mt-6'>
                <p className='text-gray-600 mb-2'>How was your ride?</p>
                <div className='flex gap-4 text-4xl text-yellow-400'>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <i 
                            key={star} 
                            className={star <= rating ? "ri-star-fill cursor-pointer" : "ri-star-line cursor-pointer text-gray-300"}
                            onClick={() => setRating(star)}
                        ></i>
                    ))}
                </div>

                <div className='mt-8 w-full'>
                    <form onSubmit={submitHandler}>
                        <button className='w-full mt-5 text-lg flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg'>Submit Rating</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RateDriver
