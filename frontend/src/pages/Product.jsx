import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null); // Initialize as null or empty object
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  useEffect(() => {
    if (!products || products.length === 0) {
      // If products from context are not available, log or handle
      console.log("Products not loaded yet or empty from ShopContext.");
      return; // Exit if products are not ready
    }

    const foundProduct = products.find(item => item._id === productId); // Use find for single item
    if (foundProduct) {
      setProductData(foundProduct);
      // Check if image array exists and has elements before accessing [0]
      if (foundProduct.image && foundProduct.image.length > 0) {
        setImage(foundProduct.image[0]);
      } else {
        setImage(assets.default_image_placeholder); // Or a placeholder image
      }
    } else {
      setProductData(null); // Product not found
      console.log("Product not found with ID:", productId);
    }

  }, [productId, products]); // Depend on productId and products

  // --- Add Loading/Not Found State ---
  if (productData === null) {
    // You can render a loading spinner or a "Product Not Found" message here
    return <div className='text-center py-20'>Loading product data... or Product not found.</div>;
  }
  // --- End Loading/Not Found State ---


  return (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
              {/* Check if productData.image exists and is an array before mapping */}
              {productData.image && Array.isArray(productData.image) && productData.image.length > 0 ? (
                productData.image.map((item,index)=>(
                  <img onClick={()=>setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
                ))
              ) : (
                <p>No additional images</p> // Fallback if no images
              )}
          </div>
          <div className='w-full sm:w-[80%]'>
              <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          {!productData.inStock && (
            <p className='text-red-500 mt-2'>Out of stock</p>
          )}
          <div className=' flex items-center gap-1 mt-2'>
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_dull_icon} alt="" className="w-3 5" />
              <p className='pl-2'>(20)</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
              <p>Select Size</p>
              <div className='flex gap-2'>
                {/* Check if productData.sizes exists and is an array before mapping */}
                {productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0 ? (
                  productData.sizes.map((item,index)=>(
                    <button onClick={()=>setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} key={index}>{item}</button>
                  ))
                ) : (
                  <p>No size options available</p> // Fallback if no sizes
                )}
              </div>
          </div>
          <button
            onClick={() => addToCart(productData._id, size)}
            className={`px-8 py-3 text-sm ${!productData.inStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-black active:bg-gray-700'} text-white`}
            disabled={!productData.inStock}
          >
            {productData.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
          </button>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Original product.</p>
              <p>Cash on delivery is available on this product.</p>
              <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
          <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
        </div>
      </div>

      {/* --------- display related products ---------- */}

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

    </div>
  )
}

export default Product