import React, { useEffect } from 'react'
import { useState } from 'react'
import { assets, dummyOrders } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

function MyOrders() {
    
    const [myOrders, setMyOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const {currency, user, axios} = useAppContext();

    const fetchMyOrders = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/order/user', { withCredentials: true });
            if(data.success){
                console.log('Fetched orders:', data.orders.length, data.orders);
                setMyOrders(data.orders);
            } else {
                toast.error(data.message || "Failed to fetch orders");
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(user){
            fetchMyOrders();
        }
    },[user?._id]) // Only depend on user ID, not the entire user object

  return (
    <div className='mt-16 pb-16'>
        <div className='flex flex-col items-end w-max mb-8'>
            <p className='text-2xl font-medium uppercase'>My Orders</p>
            <div className='w-16 h-0.5 bg-primary rounded-full'></div>
        </div> 
        
        {loading ? (
            <div className='flex justify-center items-center py-8'>
                <p className='text-gray-500'>Loading orders...</p>
            </div>
        ) : myOrders.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8'>
                <p className='text-gray-500 text-lg mb-4'>No orders found</p>
                <p className='text-gray-400'>You haven't placed any orders yet.</p>
            </div>
        ) : (
            myOrders.map((order, index) => (
            <div key={order._id || index} className='border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl'>
                <p className='flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col'>
                    <span>OrderId : {order._id}</span>
                    <span>Payment : {order.paymentType}</span>
                    <span>Total Amount : {currency}{order.amount}</span>
                </p>

                {order.items.map((item, index) => (
                    <div className={`relative bg-white text-gray-500/70 ${order.items.length !== index + 1 && "border-b"} border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`} key={index} >
                        <div className='flex items-center mb-4 md:mb-0'>
                            <div className='bg-primary/10 p-4 rounded-lg'>
                                <img src={item.product.image[0]} alt="" className='w-16 h-16' />
                            </div>
                            <div className='ml-4 '>
                                <h2 className='text-xl font-medium text-gray-800'>{item.product.name}</h2>
                                <p>Category: {item.product.category}</p>
                            </div>
                        </div>
                        <div className='flex flex-col justify-center md:ml-8 mb-4 md:mb-0'>
                            <p>Quantity: {item.quantity || "1"}</p>
                            <p>Status: {order.status}</p>
                            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className='text-primary text-lg font-medium'>
                            Amount: {currency}{item.product.offerPrice * item.quantity}
                        </p>
                    </div>  
                ))}
            </div>
        ))
        )}
    </div>
  )
}

export default MyOrders