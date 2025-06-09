import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {

  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]); // Initialized as empty array

  useEffect(() => {
    // Only proceed if products array is loaded and cartItems has data
    if (products.length > 0 && Object.keys(cartItems).length > 0) { // Check if products is loaded AND cartItems has keys
      const tempData = [];
      for (const items in cartItems) {
        // Ensure cartItems[items] is an object before iterating its properties
        if (typeof cartItems[items] === 'object' && cartItems[items] !== null) {
          for (const item in cartItems[items]) {
            if (cartItems[items][item] > 0) {
              tempData.push({
                _id: items,
                size: item,
                quantity: cartItems[items][item]
              })
            }
          }
        }
      }
      setCartData(tempData);
    } else {
      // If products or cartItems are not ready, clear cartData to prevent rendering issues
      setCartData([]);
    }
  }, [cartItems, products]) // Dependencies are correct

  return (
    <div className='border-t pt-14'>

      <div className=' text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div>
        {
          // Add a conditional render for cartData before mapping
          cartData && cartData.length > 0 ? (
            cartData.map((item, index) => {

              const productData = products.find((product) => product._id === item._id);

              // CRITICAL CHECK: Ensure productData is found before rendering
              if (!productData) {
                console.warn(`Product with ID ${item._id} not found in products list for cart.`);
                return null; // Skip rendering this cart item if product data is missing
              }

              return (
                <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                  <div className=' flex items-start gap-6'>
                    {/* Ensure productData.image exists and has elements before accessing [0] */}
                    <img className='w-16 sm:w-20' src={productData.image && productData.image.length > 0 ? productData.image[0] : assets.default_image_placeholder} alt={productData.name} />
                    <div>
                      <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                      <div className='flex items-center gap-5 mt-2'>
                        <p>{currency}{productData.price}</p>
                        <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                      </div>
                    </div>
                  </div>
                  <input onChange={(e) => {
                    const value = Number(e.target.value);
                    // Only update if value is a number and greater than 0
                    if (!isNaN(value) && value > 0) {
                      updateQuantity(item._id, item.size, value);
                    } else if (e.target.value === '') {
                        // Optionally handle empty input or set to 0 later (e.g., when blurring)
                        // For now, prevent setting to 0 if input is empty
                    }
                  }} className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' type="number" min={1} defaultValue={item.quantity} />
                  <img onClick={() => updateQuantity(item._id, item.size, 0)} className='w-4 mr-4 sm:w-5 cursor-pointer' src={assets.bin_icon} alt="Remove" />
                </div>
              )

            })
          ) : (
            // Display a message if cart is empty or loading
            <div className="text-center py-20 text-gray-600">
              {Object.keys(cartItems).length === 0 ? "Your cart is empty." : "Loading cart..."}
            </div>
          )
        }
      </div>

      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal />
          <div className=' w-full text-end'>
            <button onClick={() => navigate('/place-order')} className='bg-black text-white text-sm my-8 px-8 py-3'>PROCEED TO CHECKOUT</button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Cart