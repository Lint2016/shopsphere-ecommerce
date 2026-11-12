import { useMemo, useRef, useState } from 'react'
import { CartContext } from './cart-context'
import { products } from '../data/catalog'

function normalizeQuantity(value) {
  return Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0
}

function addProduct(items, product, requestedQuantity) {
  const currentQuantity = items.find((item) => item.productId === product.id)?.quantity ?? 0
  const availableQuantity = Math.max(0, product.stock - currentQuantity)
  const quantity = Math.min(normalizeQuantity(requestedQuantity), availableQuantity)

  if (quantity === 0) return { items, quantity: 0 }

  const existingItem = items.find((item) => item.productId === product.id)
  const nextItems = existingItem
    ? items.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item)
    : [...items, { productId: product.id, quantity }]

  return { items: nextItems, quantity }
}

function setProductQuantity(items, productId, requestedQuantity) {
  const product = products.find((catalogProduct) => catalogProduct.id === productId)
  if (!product) return items

  const quantity = Math.min(normalizeQuantity(requestedQuantity), product.stock)
  if (quantity === 0) return items.filter((item) => item.productId !== productId)

  return items.map((item) => item.productId === productId ? { ...item, quantity } : item)
}

export default function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const itemsRef = useRef(items)
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const cartItems = items.flatMap((item) => {
    const product = products.find((catalogProduct) => catalogProduct.id === item.productId)
    return product ? [{ product, quantity: item.quantity }] : []
  })
  const subtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)

  const value = useMemo(() => ({
    itemCount,
    cartItems,
    subtotal,
    getQuantityInBag(productId) {
      return items.find((item) => item.productId === productId)?.quantity ?? 0
    },
    addToBag(product, requestedQuantity) {
      const { items: latestItems, quantity } = addProduct(itemsRef.current, product, requestedQuantity)
      if (quantity === 0) return 0

      itemsRef.current = latestItems
      setItems((currentItems) => addProduct(currentItems, product, requestedQuantity).items)
      return quantity
    },
    updateQuantity(productId, requestedQuantity) {
      const product = products.find((catalogProduct) => catalogProduct.id === productId)
      if (!product) return

      itemsRef.current = setProductQuantity(itemsRef.current, productId, requestedQuantity)
      setItems((currentItems) => setProductQuantity(currentItems, productId, requestedQuantity))
    },
    removeFromBag(productId) {
      itemsRef.current = itemsRef.current.filter((item) => item.productId !== productId)
      setItems((currentItems) => currentItems.filter((item) => item.productId !== productId))
    },
  }), [cartItems, itemCount, items, subtotal])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
