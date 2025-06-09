import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const updateProduct = async (id) => {
    try {
      const response = await axios.put(backendUrl + '/api/product/update', 
        {
          id,
          price: Number(editingProduct.price),
          stockQuantity: Number(editingProduct.stockQuantity)
        }, 
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        setList(list.map(product =>
          product._id === id ? { 
            ...product, 
            price: Number(editingProduct.price),
            stockQuantity: Number(editingProduct.stockQuantity),
            inStock: Number(editingProduct.stockQuantity) > 0
          } : product
        ));
        setEditingProduct(null);
        toast.success('Product updated successfully');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update product: ' + (error.response?.data?.message || error.message));
    }
  };

  const startEditing = (product) => {
    setEditingProduct({
      _id: product._id,
      price: product.price,
      stockQuantity: product.stockQuantity || 0
    });
  };

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <div className='p-4'>
      <p className='mb-2'>All Products List</p>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse border border-gray-300'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='border p-2'>Image</th>
              <th className='border p-2'>Name</th>
              <th className='border p-2'>Category</th>
              <th className='border p-2'>Price</th>
              <th className='border p-2'>Stock Quantity</th>
              <th className='border p-2'>Status</th>
              <th className='border p-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item._id}>
                <td className='border p-2'>
                  <img src={item.image[0]} alt={item.name} className='w-20 h-20 object-cover' />
                </td>
                <td className='border p-2'>{item.name}</td>
                <td className='border p-2'>{item.category}</td>
                <td className='border p-2'>
                  {editingProduct?._id === item._id ? (
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        price: e.target.value
                      })}
                      className='w-24 p-1 border rounded'
                    />
                  ) : (
                    `₹${item.price}`
                  )}
                </td>
                <td className='border p-2'>
                  {editingProduct?._id === item._id ? (
                    <input
                      type="number"
                      min="0"
                      value={editingProduct.stockQuantity}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        stockQuantity: e.target.value
                      })}
                      className='w-24 p-1 border rounded'
                    />
                  ) : (
                    item.stockQuantity || 0
                  )}
                </td>
                <td className='border p-2'>
                  <span className={item.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}>
                    {item.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className='border p-2'>
                  {editingProduct?._id === item._id ? (
                    <div className='space-x-2'>
                      <button
                        onClick={() => updateProduct(item._id)}
                        className='bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600'
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className='bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600'
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className='space-x-2'>
                      <button
                        onClick={() => startEditing(item)}
                        className='bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeProduct(item._id)}
                        className='bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600'
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default List