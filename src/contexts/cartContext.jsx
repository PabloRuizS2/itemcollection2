import React, { createContext, useState } from 'react'
import {
  addDoc,
  collection,
  getFirestore,
  updateDoc,
  doc,
  getDocs,
  writeBach
} from 'firebase/firestore'

export const CartContext = createContext()

function CartProvider(props) {
  const [cartItems, setCartItems] = useState([])
  function sendOrder(userForm) {
    const { name, email, phone } = userForm
    const db = getFirestore()
    const total = cartItems.reduce((acc, item) => {
      return acc + item.price * item.quantity
    }, 0)
    const filteredCartItems = cartItems.map(
      ({ id, title, image, price, quantity }) => {
        return { id, title, price }
      }
    )
    console.log('totalll', total)
    const order = {
      buyer: { name, email, phone },
      items: filteredCartItems,
      date: new Date(),
      total
    }
    console.log('order', order)
    const orderCollection = collection(db, 'orders')
    addDoc(orderCollection, order)
      .then(res => console.log(res.id))
      .catch(err => console.log('error', err))
  }
  function getOrders() {
    const db = getFirestore()
    const orderCollection = collection(db, 'orders')

    getDocs(orderCollection).then(querySnapshot => {
      querySnapshot.forEach(function (doc) {
        console.log(doc.id, ' => ', doc.data())
      })
    })
  }

  function handleSubmit() {
    console.log('submited')
  }

  function clearCart() {
    setCartItems([])
  }
  function isInCart(id) {
    cartItems.find(product => product.id === id)
  }

  function removeProduct(id) {
    setCartItems(cartItems.filter(product => product.id !== id))
  }

  function addProduct(item, quantity) {
    // let newCart;

    setCartItems(cartItems => {
      let productWasAlreadyInCart = false
      const newCartItems = [...cartItems].map(product => {
        if (product.id === item.id) {
          productWasAlreadyInCart = true
          return { ...product, quantity: (product.quantity += quantity) }
        } else {
          return product
        }
      })

      if (!productWasAlreadyInCart) {
        newCartItems.push({ ...item, quantity })
      }

      return newCartItems
    })
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        clearCart,
        setCartItems,
        isInCart,
        removeProduct,
        addProduct,
        sendOrder,
        getOrders,
        handleSubmit
      }}
    >
      {props.children}
    </CartContext.Provider>
  )
}

export default CartProvider
