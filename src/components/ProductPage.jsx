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
  const [quantityDraft, setQuantityDraft] = useState('1')
  const [bagFeedback, setBagFeedback] = useState('')
  const [previousRemainingStock, setPreviousRemainingStock] = useState(product.stock)
  const matchingQuantity = getQuantityInBag(product.id)
  const remainingStock = Math.max(0, product.stock - matchingQuantity)
  if (previousRemainingStock !== remainingStock) {
    setPreviousRemainingStock(remainingStock)
    const currentQuantity = Number(quantityDraft)
    const currentIsWholeNumber = /^\d+$/.test(quantityDraft) && Number.isSafeInteger(currentQuantity)
    if (currentIsWholeNumber && currentQuantity > remainingStock) {
      setQuantityDraft(remainingStock > 0 ? String(remainingStock) : '')
    }
  }
  const quantityNumber = Number(quantityDraft)
  const quantityIsWholeNumber = /^\d+$/.test(quantityDraft) && Number.isSafeInteger(quantityNumber)
  const quantityIsValid = remainingStock > 0
    && quantityDraft.trim() !== ''
    && quantityIsWholeNumber
    && quantityNumber > 0
    && quantityNumber <= remainingStock
  let quantityValidationMessage = ''

  if (remainingStock > 0) {
    if (quantityDraft.trim() === '') {
      quantityValidationMessage = 'Enter a quantity.'
    } else if (!Number.isFinite(quantityNumber)) {
      quantityValidationMessage = 'Enter a valid whole-number quantity.'
    } else if (quantityNumber < 1) {
      quantityValidationMessage = 'Quantity must be at least 1.'
    } else if (!Number.isInteger(quantityNumber) || !quantityIsWholeNumber) {
      quantityValidationMessage = 'Enter a whole-number quantity.'
    } else if (quantityNumber > remainingStock) {
      quantityValidationMessage = `Only ${remainingStock} ${remainingStock === 1 ? 'item is' : 'items are'} available.`
    }
  }

  const relatedProducts = products.filter((item) => item.category === product.category && item.id !== product.id)

  function changeQuantity(direction) {
    setBagFeedback('')
    setQuantityDraft((currentDraft) => {
      const currentQuantity = Number(currentDraft)
      const currentIsValid = /^\d+$/.test(currentDraft)
        && Number.isSafeInteger(currentQuantity)
        && currentQuantity > 0
        && currentQuantity <= remainingStock

      if (remainingStock === 0) return ''
      if (!currentIsValid) return '1'

      const nextQuantity = direction === 'increase' ? currentQuantity + 1 : currentQuantity - 1
      return String(Math.max(1, Math.min(remainingStock, nextQuantity)))
    })
  }

  function addSelectedQuantity() {
    if (!quantityIsValid) return

    const acceptedQuantity = addToBag(product, quantityNumber)
    if (acceptedQuantity === 0) {
      setBagFeedback(`Could not add ${product.name}; no stock remains.`)
    } else if (acceptedQuantity < quantityNumber) {
      setBagFeedback(`${acceptedQuantity} ${acceptedQuantity === 1 ? 'item' : 'items'} added. Stock limited the addition to the available quantity.`)
    } else {
      setBagFeedback(`${acceptedQuantity} ${acceptedQuantity === 1 ? 'item' : 'items'} added to your bag.`)
    }
  }

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
                <div className="quantity-control" role="group" aria-label="Quantity">
                  <button type="button" aria-label="Decrease quantity" disabled={remainingStock === 0 || (quantityIsValid && quantityNumber <= 1)} onClick={() => changeQuantity('decrease')}>−</button>
                  <label className="sr-only" htmlFor="product-quantity">Quantity</label>
                  <input id="product-quantity" type="number" min="1" max={remainingStock} step="1" value={quantityDraft} disabled={remainingStock === 0} aria-invalid={Boolean(quantityValidationMessage)} aria-describedby={quantityValidationMessage ? 'product-quantity-validation' : undefined} onChange={(event) => {
                    setQuantityDraft(event.target.value)
                    setBagFeedback('')
                  }} />
                  <button type="button" aria-label="Increase quantity" disabled={remainingStock === 0 || (quantityIsValid && quantityNumber >= remainingStock)} onClick={() => changeQuantity('increase')}>+</button>
                </div>
                <button className="button button-dark add-to-bag" type="button" disabled={!quantityIsValid} onClick={addSelectedQuantity}>Add to Bag <Icon name="bag" size={16} /></button>
              </div>
              {quantityValidationMessage && <p className="quantity-validation" id="product-quantity-validation" role="alert">{quantityValidationMessage}</p>}
              <p className="bag-feedback" aria-live="polite" aria-atomic="true">{bagFeedback}</p>

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
