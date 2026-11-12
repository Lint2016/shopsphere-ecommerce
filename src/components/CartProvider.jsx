import { useMemo, useState } from 'react'
import { CartContext } from './cart-context'

export default function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  const value = useMemo(() => ({
    itemCount,
    getQuantityInBag(productId) {
      return items.find((item) => item.productId === productId)?.quantity ?? 0
    },
    addToBag(product, requestedQuantity) {
      const currentQuantity = items.find((item) => item.productId === product.id)?.quantity ?? 0
      const availableQuantity = Math.max(0, product.stock - currentQuantity)
      const quantity = Math.min(Math.max(0, Math.floor(requestedQuantity)), availableQuantity)

      if (quantity === 0) return 0

      const existingItem = items.find((item) => item.productId === product.id)
      if (existingItem) {
        setItems(items.map((item) => item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item))
      } else {
        setItems([...items, { productId: product.id, quantity }])
      }

      return quantity
    },
  }), [itemCount, items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
