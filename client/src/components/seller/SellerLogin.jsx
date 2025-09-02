import React, { useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useState } from 'react'

const SellerLogin = () => {
    
    const {isSeller, setIsSeller, navigate} = useAppContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setIsSeller(true);        
    }

    useEffect(() => {
        if(isSeller){
            navigate("/seller");
        }
    }, [isSeller])

  return !isSeller && (
    <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center text-sm text-gray-600'> 
        <div className='flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200'>
            <p className='text-2xl font-medium m-auto'><span className='text-primary'>Seller</span> Login</p>
            <div className='w-full'>
                <p>Email</p>
                <input placeholder='Enter your email' type="email" required value={email} onChange={(e) => setEmail(e.target.value)}  className='w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-primary' />
            </div>
            <div className='w-full'>
                <p>Password</p>
                <input placeholder='Enter your password' type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className='w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-primary' />
            </div>
            <button type='submit' className='w-full bg-primary text-white rounded-lg px-4 py-2 mt-2 hover:bg-primary/90'>Login</button>
        </div>
    </form>
  )
}

export default SellerLogin