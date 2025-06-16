import React, { useContext, useState, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
    // Only Razorpay is the method now, so we can initialize it directly
    const [method, setMethod] = useState('razorpay'); 
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    });

    // Ensure Razorpay script is loaded
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Clean up the script when the component unmounts
            document.body.removeChild(script);
        };
    }, []);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(data => ({ ...data, [name]: value }));
    };

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount, // Amount is in currency subunits (e.g., paise)
            currency: order.currency,
            name: 'Your Store Name', // Your store name
            description: 'Order Payment',
            image: assets.logo, // Optional: Your company logo from assets
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                console.log("Razorpay success response:", response);
                try {
                    const { data } = await axios.post(backendUrl + '/api/order/verifyRazorpay', response, { headers: { token } });
                    if (data.success) {
                        toast.success("Payment successful and order placed!");
                        setCartItems({}); // Clear cart on successful order
                        navigate('/orders'); // Redirect to orders page
                    } else {
                        toast.error(data.message || "Payment verification failed. Please contact support.");
                    }
                } catch (error) {
                    console.error("Error during payment verification:", error);
                    toast.error("An error occurred during payment verification. Please try again or contact support.");
                }
            },
            prefill: {
                name: formData.firstName + ' ' + formData.lastName,
                email: formData.email,
                contact: formData.phone
            },
            notes: {
                address: `${formData.street}, ${formData.city}, ${formData.state}, ${formData.zipcode}, ${formData.country}`
            },
            theme: {
                color: "#3399CC"
            }
        };

        const rzp = new window.Razorpay(options);

        rzp.on('payment.failed', function (response) {
            console.error("Razorpay payment failed:", response.error);
            toast.error(response.error.description || "Payment failed. Please try again.");
            // You might want to navigate back to cart or show a specific error page
        });

        rzp.open();
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            let orderItems = [];

            for (const productId in cartItems) {
                for (const size in cartItems[productId]) {
                    if (cartItems[productId][size] > 0) {
                        const itemInfo = products.find(product => product._id === productId);
                        if (itemInfo) {
                            // Deep copy to avoid modifying the original product object
                            const itemClone = structuredClone(itemInfo); 
                            itemClone.size = size;
                            itemClone.quantity = cartItems[productId][size];
                            orderItems.push(itemClone);
                        }
                    }
                }
            }

            if (orderItems.length === 0) {
                toast.error("Your cart is empty! Please add items before placing an order.");
                return;
            }

            // Basic form validation
            const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'zipcode', 'country', 'phone'];
            for (const field of requiredFields) {
                if (!formData[field]) {
                    toast.error(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}!`);
                    return;
                }
            }
            if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
                toast.error("Please enter a valid email address.");
                return;
            }
            if (!/^\d{10}$/.test(formData.phone)) { // Simple 10-digit phone number validation
                toast.error("Please enter a valid 10-digit phone number.");
                return;
            }


            let orderData = {
                address: formData,
                items: orderItems,
                // Ensure amount is in currency subunits (e.g., paise) if your getCartAmount is in base units (rupees)
                // If getCartAmount already returns paise, remove * 100
                amount: (getCartAmount() + delivery_fee) * 100 
            };

            // Since only Razorpay is left, we can directly call its logic
            const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, { headers: { token } });
            if (responseRazorpay.data.success) {
                initPay(responseRazorpay.data.order);
            } else {
                toast.error(responseRazorpay.data.message || "Failed to create Razorpay order.");
            }

        } catch (error) {
            console.error("Error placing order:", error);
            // Use optional chaining for safer access to error response data
            toast.error(error.response?.data?.message || error.message || "An unexpected error occurred while placing your order.");
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side (Delivery Information) ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
                    <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
                </div>
                <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
                <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' />
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' />
                    <input onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='State' />
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Zipcode' />
                    <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Country' />
                </div>
                <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
            </div>

            {/* ------------- Right Side (Cart Total & Payment) ------------------ */}
            <div className='mt-8'>
                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>

                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    {/* Only Razorpay option remains */}
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            {/* Since it's the only option, the radio dot will always be green */}
                            <p className='min-w-3.5 h-3.5 border rounded-full bg-green-400'></p>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt="Razorpay Logo" />
                            <span>Pay with Razorpay</span>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8'>
                        <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>PLACE ORDER</button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;