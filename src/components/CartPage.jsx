import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/currency'
import { imageUrl } from '../data/catalog'
import { useCart } from './cart-context'
import Footer from './Footer'
import Header from './Header'
import { Icon } from './Icons'

const complimentaryShippingThreshold = 1000

function EmptyCart() {
  return <section className="cart-empty section-wrap" aria-labelledby="cart-title">
    <p className="eyebrow">A little space for something good</p>
    <h1 id="cart-title">Your bag is <em>empty.</em></h1>
    <p>Find a thoughtful everyday favourite and it will appear here.</p>
    <Link className="button button-dark" to="/shop">Explore the shop <Icon name="arrow" size={17} /></Link>
  </section>
}

function CartLine({ item, updateQuantity, removeFromBag }) {
  const { product, quantity } = item

  return <li className="cart-line">
    <div className="cart-product-info">
      <Link className="cart-line-image" to={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
        <img src={imageUrl(product.image, 300)} alt="" loading="lazy" />
      </Link>
      <div className="cart-line-product">
        <p className="product-category">{product.category}</p>
        <h2><Link to={`/products/${product.slug}`}>{product.name}</Link></h2>
        <p className="cart-sku">SKU: {product.sku}</p>
        <button className="cart-remove" type="button" onClick={() => removeFromBag(product.id)}>Remove</button>
      </div>
    </div>
    <div className="cart-line-price">
      <span className="cart-mobile-label">Unit price</span>
      <span>{formatCurrency(product.price)}</span>
    </div>
    <div className="cart-line-quantity">
      <label className="cart-mobile-label" htmlFor={`quantity-${product.id}`}>Quantity</label>
      <div className="quantity-control">
        <button type="button" aria-label={`Decrease ${product.name} quantity`} disabled={quantity <= 1} onClick={() => updateQuantity(product.id, quantity - 1)}>−</button>
        <input id={`quantity-${product.id}`} type="number" min="1" max={product.stock} value={quantity} aria-label={`${product.name} quantity`} onChange={(event) => {
          if (event.target.value === '') return
          updateQuantity(product.id, Number(event.target.value))
        }} />
        <button type="button" aria-label={`Increase ${product.name} quantity`} disabled={quantity >= product.stock} onClick={() => updateQuantity(product.id, quantity + 1)}>+</button>
      </div>
    </div>
    <div className="cart-line-subtotal">
      <span className="cart-mobile-label">Item subtotal</span>
      <strong>{formatCurrency(product.price * quantity)}</strong>
    </div>
  </li>
}

function CartContents() {
  const { cartItems, itemCount, subtotal, updateQuantity, removeFromBag } = useCart()
  const shippingProgress = Math.min(100, (subtotal / complimentaryShippingThreshold) * 100)
  const qualifiesForComplimentaryShipping = subtotal >= complimentaryShippingThreshold
  const amountToThreshold = Math.max(0, complimentaryShippingThreshold - subtotal)

  if (cartItems.length === 0) return <EmptyCart />

  return <section className="cart-page-content section-wrap" aria-labelledby="cart-title">
    <div className="cart-page-heading">
      <div><p className="eyebrow">A good start</p><h1 id="cart-title">Your <em>bag.</em></h1></div>
      <Link className="text-link" to="/shop">Continue shopping <Icon name="arrow" size={16} /></Link>
    </div>

    <div className="cart-layout">
      <section className="cart-items-panel" aria-label="Items in your bag">
        <div className="cart-column-headings" aria-hidden="true"><span>Product</span><span>Unit price</span><span>Quantity</span><span>Subtotal</span></div>
        <ul className="cart-items-list">
          {cartItems.map((item) => <CartLine key={item.product.id} item={item} updateQuantity={updateQuantity} removeFromBag={removeFromBag} />)}
        </ul>
      </section>

      <aside className="order-summary" aria-labelledby="order-summary-title">
        <h2 id="order-summary-title">Order summary</h2>
        <div className="summary-row"><span>Items</span><span>{itemCount}</span></div>
        <div className="summary-row summary-subtotal"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
        <div className="shipping-progress-copy" aria-live="polite">
          {qualifiesForComplimentaryShipping
            ? 'Complimentary shipping threshold reached in this demo.'
            : `${formatCurrency(amountToThreshold)} to the R1,000 complimentary shipping threshold.`}
        </div>
        <div className="shipping-progress" role="progressbar" aria-label="Progress toward complimentary shipping threshold" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(shippingProgress)}>
          <span style={{ width: `${shippingProgress}%` }} />
        </div>
        <p className="shipping-demo-note">This is a frontend demonstration. Shipping costs would be calculated during a future checkout.</p>
        <p className="cart-demo-note">No order or payment is placed from this page.</p>
      </aside>
    </div>
  </section>
}

export default function CartPage() {
  return <div className="page-shell cart-page">
    <Header />
    <main><CartContents /></main>
    <Footer />
  </div>
}
