import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { imageUrl, products } from '../data/catalog'
import { formatCurrency } from '../utils/currency'
import { useCart } from './cart-context'
import Footer from './Footer'
import Header from './Header'
import ProductCard from './ProductCard'
import { Icon } from './Icons'

function ProductNotFound() {
  return <div className="product-not-found section-wrap">
    <p className="eyebrow">A little detour</p>
    <h1>We couldn’t find that <em>item.</em></h1>
    <p>That product link may have changed. Browse the collection to find something good.</p>
    <Link className="button button-dark" to="/shop">Back to the shop <Icon name="arrow" size={17} /></Link>
  </div>
}

function ProductContent({ product }) {
  const { addToBag, getQuantityInBag } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [addedQuantity, setAddedQuantity] = useState(0)
  const matchingQuantity = getQuantityInBag(product.id)
  const remainingStock = Math.max(0, product.stock - matchingQuantity)
  const quantityLimit = Math.max(1, remainingStock)
  const selectedQuantity = Math.min(quantity, quantityLimit)
  const relatedProducts = products.filter((item) => item.category === product.category && item.id !== product.id)

  return <>
          <div className="product-breadcrumb section-wrap"><Link to="/shop">Shop</Link><span aria-hidden="true">/</span><Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span></div>
          <section className="product-detail section-wrap" aria-labelledby="product-title">
            <div className="product-detail-image"><img src={imageUrl(product.image, 1200)} alt={product.name} />{product.label && <span className="product-label">{product.label}</span>}</div>
            <div className="product-detail-copy">
              <p className="eyebrow">{product.category}</p>
              <h1 id="product-title">{product.name}</h1>
              <p className="product-detail-price">{formatCurrency(product.price)}</p>
              <p className="product-description">{product.description}</p>

              <div className="demo-stock" aria-live="polite">
                <span className={`stock-indicator${remainingStock === 0 ? ' is-unavailable' : ''}`} aria-hidden="true" />
                <span>{remainingStock > 0 ? `Demo availability: ${remainingStock}` : 'Currently unavailable'}</span>
              </div>
              <p className="stock-note">Illustrative demonstration quantity; this is not live inventory.</p>

              <div className="product-purchase-controls">
                <div className="quantity-control" aria-label="Quantity">
                  <button type="button" aria-label="Decrease quantity" disabled={selectedQuantity <= 1 || remainingStock === 0} onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button>
                  <label className="sr-only" htmlFor="product-quantity">Quantity</label>
                  <input id="product-quantity" type="number" min="1" max={quantityLimit} value={selectedQuantity} disabled={remainingStock === 0} onChange={(event) => {
                    const nextQuantity = Number(event.target.value)
                    if (Number.isInteger(nextQuantity) && nextQuantity >= 1) {
                      setQuantity(Math.min(nextQuantity, quantityLimit))
                    }
                  }} />
                  <button type="button" aria-label="Increase quantity" disabled={selectedQuantity >= remainingStock || remainingStock === 0} onClick={() => setQuantity((current) => Math.min(remainingStock, current + 1))}>+</button>
                </div>
                <button className="button button-dark add-to-bag" type="button" disabled={remainingStock === 0} onClick={() => {
                  const acceptedQuantity = addToBag(product, selectedQuantity)
                  setAddedQuantity(acceptedQuantity)
                }}>Add to Bag <Icon name="bag" size={16} /></button>
              </div>
              <p className="bag-feedback" aria-live="polite">{addedQuantity > 0 ? `${addedQuantity} ${addedQuantity === 1 ? 'item' : 'items'} added to your bag.` : ''}</p>

              <div className="product-specifications">
                <h2>Details</h2>
                <dl>{Object.entries(product.specifications).map(([name, value]) => <div key={name}><dt>{name.replace(/([A-Z])/g, ' $1')}</dt><dd>{value}</dd></div>)}</dl>
              </div>
            </div>
          </section>

          {relatedProducts.length > 0 && <section className="related-products featured-section" aria-labelledby="related-title"><div className="section-wrap"><div className="section-heading"><div><p className="eyebrow">More from {product.category}</p><h2 id="related-title">You may also <em>like.</em></h2></div><Link className="text-link" to={`/shop?category=${encodeURIComponent(product.category)}`}>View category <Icon name="arrow" size={16} /></Link></div><div className="product-grid">{relatedProducts.map((relatedProduct) => <ProductCard key={relatedProduct.id} product={relatedProduct} />)}</div></div></section>}
  </>
}

export default function ProductPage() {
  const { slug } = useParams()
  const product = products.find((item) => item.slug === slug)

  return <div className="page-shell product-page">
    <Header />
    <main>{product ? <ProductContent key={slug} product={product} /> : <ProductNotFound />}</main>
    <Footer />
  </div>
}
