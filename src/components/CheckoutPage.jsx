import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { formatCurrency } from '../utils/currency'
import { useCart } from './cart-context'
import Footer from './Footer'
import Header from './Header'
import { Icon } from './Icons'

const initialValues = {
  fullName: '',
  email: '',
  phone: '',
  streetAddress: '',
  suburb: '',
  city: '',
  province: '',
  postalCode: '',
}

const contactFields = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name', placeholder: 'Your name' },
  { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email', placeholder: 'you@example.com' },
  { name: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel', placeholder: 'e.g. 082 123 4567' },
]

const addressFields = [
  { name: 'streetAddress', label: 'Street address', autoComplete: 'street-address', placeholder: 'Street and number', wide: true },
  { name: 'suburb', label: 'Suburb', autoComplete: 'address-level3', placeholder: 'Suburb' },
  { name: 'city', label: 'City or town', autoComplete: 'address-level2', placeholder: 'City or town' },
  { name: 'province', label: 'Province', autoComplete: 'address-level1', placeholder: 'Province' },
  { name: 'postalCode', label: 'Postal code', autoComplete: 'postal-code', placeholder: 'Postal code' },
]

const allFields = [...contactFields, ...addressFields]
const FREE_SHIPPING_THRESHOLD = 1000
const STANDARD_DELIVERY_RATE = 75
const EXPRESS_DELIVERY_RATE = 150
const PROMOTION_CODE = 'HELLO15'
const PROMOTION_DISCOUNT_PERCENT = 15

function validateField(name, rawValue) {
  const value = rawValue.trim()
  if (!value) return 'Please enter your ' + allFields.find((field) => field.name === name).label.toLowerCase() + '.'

  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
    return 'Enter a valid email address.'
  }

  if (name === 'phone') {
    if (!/^[\d+\s()-]+$/.test(value)) {
      return 'Enter a valid South African phone number.'
    }

    const formattedNumber = value.replace(/[\s()-]/g, '')
    let localNumber = formattedNumber

    if (formattedNumber.startsWith('+27')) {
      const nationalNumber = formattedNumber.slice(3)
      if (!/^\d{9}$/.test(nationalNumber)) return 'Enter a valid South African phone number.'
      localNumber = `0${nationalNumber}`
    } else if (formattedNumber.startsWith('0027')) {
      const nationalNumber = formattedNumber.slice(4)
      if (!/^\d{9}$/.test(nationalNumber)) return 'Enter a valid South African phone number.'
      localNumber = `0${nationalNumber}`
    }

    const hasSupportedPrefix = /^(06|07|08)\d{8}$/.test(localNumber)
      || /^01\d{8}$/.test(localNumber)
    if (!hasSupportedPrefix) return 'Enter a valid South African phone number.'
  }

  return ''
}

function CheckoutField({ field, value, error, showError, onChange, onBlur }) {
  const inputId = `checkout-${field.name}`
  const errorId = `${inputId}-error`
  const hasError = showError && Boolean(error)

  return <div className={`checkout-field${field.wide ? ' checkout-field-wide' : ''}${hasError ? ' has-error' : ''}`}>
    <label htmlFor={inputId}>{field.label}</label>
    <input
      id={inputId}
      name={field.name}
      type={field.type || 'text'}
      autoComplete={field.autoComplete}
      placeholder={field.placeholder}
      value={value}
      aria-invalid={hasError}
      aria-describedby={hasError ? errorId : undefined}
      onChange={(event) => onChange(field.name, event.target.value)}
      onBlur={() => onBlur(field.name)}
    />
    {hasError && <span className="checkout-field-error" id={errorId} role="alert">{error}</span>}
  </div>
}

function CheckoutContents() {
  const { cartItems, itemCount, subtotal, removeFromBag } = useCart()
  const navigate = useNavigate()
  const submissionLock = useRef(false)
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [attemptedContinue, setAttemptedContinue] = useState(false)
  const [detailsReady, setDetailsReady] = useState(false)
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const [orderSaved, setOrderSaved] = useState(false)
  const errors = Object.fromEntries(allFields.map((field) => [field.name, validateField(field.name, values[field.name])]))

  if (cartItems.length === 0 && !orderSaved) return <Navigate to="/shop" replace />

  const safeSubtotal = Number.isFinite(subtotal) ? Math.max(0, subtotal) : 0
  const standardDeliveryCost = safeSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_DELIVERY_RATE
  const shippingCost = shippingMethod === 'express' ? EXPRESS_DELIVERY_RATE : standardDeliveryCost
  const safeSubtotalCents = Math.round(safeSubtotal * 100)
  const discountCents = promoApplied ? Math.round(safeSubtotalCents * PROMOTION_DISCOUNT_PERCENT / 100) : 0
  const shippingCostCents = Math.round(Math.max(0, shippingCost) * 100)
  const orderTotal = Math.max(0, safeSubtotalCents - discountCents + shippingCostCents) / 100
  const shippingMethodName = shippingMethod === 'express' ? 'Express delivery' : 'Standard delivery'

  function releaseSubmissionLock(message) {
    submissionLock.current = false
    setIsSubmitting(false)
    setSubmissionError(message)
  }

  function updateField(name, value) {
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
    setDetailsReady(false)
  }

  function markTouched(name) {
    setTouched((currentTouched) => ({ ...currentTouched, [name]: true }))
    setDetailsReady(false)
  }

  function continueToDelivery(event) {
    event.preventDefault()
    setAttemptedContinue(true)

    const hasErrors = allFields.some((field) => validateField(field.name, values[field.name]))
    setDetailsReady(!hasErrors)
  }

  function selectShippingMethod(method) {
    setShippingMethod(method)
    setDetailsReady(false)
  }

  function applyPromotion(event) {
    event.preventDefault()
    if (promoApplied) return

    if (promoCode.trim().toUpperCase() === PROMOTION_CODE) {
      setPromoApplied(true)
      setPromoError('')
      setPromoCode(PROMOTION_CODE)
      return
    }

    setPromoApplied(false)
    setPromoError('That promotion code is not valid. Check the code and try again.')
  }

  function updatePromoCode(value) {
    setPromoCode(value)
    setPromoError('')
    if (promoApplied) setPromoApplied(false)
  }

  function removePromotion() {
    setPromoApplied(false)
    setPromoCode('')
    setPromoError('')
  }

  function placeDemoOrder() {
    if (submissionLock.current) return

    submissionLock.current = true
    setIsSubmitting(true)
    setSubmissionError('')

    const validationErrors = allFields.some((field) => validateField(field.name, values[field.name]))
    const isDeliveryMethodValid = shippingMethod === 'standard' || shippingMethod === 'express'
    const isCartValid = cartItems.length > 0
      && cartItems.every(({ product, quantity }) => product
        && typeof product.id === 'string'
        && typeof product.name === 'string'
        && typeof product.sku === 'string'
        && Number.isFinite(product.price)
        && product.price >= 0
      && Number.isSafeInteger(Math.round(product.price * 100))
      && Number.isInteger(product.stock)
        && Number.isInteger(quantity)
        && quantity > 0
        && quantity <= product.stock)
      && Number.isInteger(itemCount)
      && itemCount === cartItems.reduce((count, item) => count + item.quantity, 0)

    if (validationErrors || !isDeliveryMethodValid || !isCartValid || !Number.isSafeInteger(safeSubtotalCents)) {
      setAttemptedContinue(true)
      setDetailsReady(false)
      releaseSubmissionLock('Please review the checkout details, delivery method, and cart before placing your demo order.')
      return
    }

    if (promoApplied && promoCode.trim().toUpperCase() !== PROMOTION_CODE) {
      setPromoApplied(false)
      setSubmissionError('The promotion code state is no longer valid. Review the code and try again.')
      submissionLock.current = false
      setIsSubmitting(false)
      return
    }

    const snapshotItems = []
    for (const { product, quantity } of cartItems) {
      const unitPriceCents = Math.round(product.price * 100)
      const lineSubtotalCents = unitPriceCents * quantity
      if (!Number.isSafeInteger(lineSubtotalCents)) {
        releaseSubmissionLock('A product line total could not be verified. Please review your bag and try again.')
        return
      }

      snapshotItems.push(Object.freeze({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unitPriceCents,
        quantity,
        lineSubtotalCents,
      }))
    }
    const merchandiseSubtotalCents = snapshotItems.reduce((total, item) => total + item.lineSubtotalCents, 0)
    const expectedSubtotalCents = Math.round(safeSubtotal * 100)
    if (!Number.isSafeInteger(merchandiseSubtotalCents) || merchandiseSubtotalCents !== expectedSubtotalCents) {
      releaseSubmissionLock('The cart total could not be verified. Please review your bag and try again.')
      return
    }

    const deliveryCostCents = shippingMethod === 'express'
      ? EXPRESS_DELIVERY_RATE * 100
      : (merchandiseSubtotalCents >= FREE_SHIPPING_THRESHOLD * 100 ? 0 : STANDARD_DELIVERY_RATE * 100)
    const appliedDiscountCents = promoApplied
      ? Math.round(merchandiseSubtotalCents * PROMOTION_DISCOUNT_PERCENT / 100)
      : 0
    const totalCents = Math.max(0, merchandiseSubtotalCents - appliedDiscountCents + deliveryCostCents)

    if (![deliveryCostCents, appliedDiscountCents, totalCents].every(Number.isSafeInteger)) {
      releaseSubmissionLock('The order total could not be verified. Please try again.')
      return
    }

    if (typeof globalThis.crypto?.randomUUID !== 'function') {
      releaseSubmissionLock('This browser cannot generate a secure demo order reference. Please use a supported browser and retry.')
      return
    }

    const createdAtDate = new Date()
    const createdAt = createdAtDate.toISOString()
    const datePart = createdAt.slice(0, 10).replaceAll('-', '')
    let uuid
    try {
      uuid = globalThis.crypto.randomUUID().toUpperCase()
    } catch {
      releaseSubmissionLock('This browser could not generate a secure demo order reference. Please retry in a supported browser.')
      return
    }
    const reference = `SS-${datePart}-${uuid}`
    const storageKey = `shopsphere:demo-order:${reference}`
    const complimentary = shippingMethod === 'standard'
      && merchandiseSubtotalCents >= FREE_SHIPPING_THRESHOLD * 100
    const orderSnapshot = Object.freeze({
      schemaVersion: 1,
      reference,
      createdAt,
      currency: 'ZAR',
      customer: Object.freeze({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      }),
      deliveryAddress: Object.freeze({
        streetAddress: values.streetAddress.trim(),
        suburb: values.suburb.trim(),
        city: values.city.trim(),
        province: values.province.trim(),
        postalCode: values.postalCode.trim(),
      }),
      delivery: Object.freeze({
        method: shippingMethod,
        name: shippingMethodName,
        costCents: deliveryCostCents,
        complimentary,
      }),
      items: Object.freeze(snapshotItems),
      promotion: promoApplied
        ? Object.freeze({ code: PROMOTION_CODE, discountCents: appliedDiscountCents })
        : null,
      totals: Object.freeze({
        merchandiseSubtotalCents,
        shippingCents: deliveryCostCents,
        orderTotalCents: totalCents,
      }),
    })

    try {
      if (window.sessionStorage.getItem(storageKey) !== null) {
        releaseSubmissionLock('A demo order already uses this reference. Please retry to create a new reference.')
        return
      }
      window.sessionStorage.setItem(storageKey, JSON.stringify(orderSnapshot))
    } catch {
      releaseSubmissionLock('The demo order could not be saved in this browser session. Your bag is unchanged; please allow session storage and retry.')
      return
    }

    setOrderSaved(true)
    navigate(`/order-confirmation/${encodeURIComponent(reference)}`)
    cartItems.forEach(({ product }) => removeFromBag(product.id))
  }

  return <div className="page-shell checkout-page">
    <Header />
    <main className="checkout-main section-wrap">
      <div className="checkout-heading">
        <div>
          <p className="eyebrow">The next step</p>
          <h1>Checkout <em>preview.</em></h1>
        </div>
        <Link className="text-link" to="/cart"><Icon name="arrow" size={16} /> Return to your bag</Link>
      </div>

      <div className="checkout-layout">
        <form className="checkout-sections" noValidate onSubmit={continueToDelivery}>
          <section className="checkout-panel" aria-labelledby="contact-title">
            <p className="eyebrow">01</p>
            <h2 id="contact-title">Customer &amp; contact information</h2>
            <div className="checkout-fields">
              {contactFields.map((field) => <CheckoutField key={field.name} field={field} value={values[field.name]} error={errors[field.name]} showError={attemptedContinue || touched[field.name]} onChange={updateField} onBlur={markTouched} />)}
            </div>
          </section>

          <section className="checkout-panel" aria-labelledby="address-title">
            <p className="eyebrow">02</p>
            <h2 id="address-title">Delivery address</h2>
            <div className="checkout-fields">
              {addressFields.map((field) => <CheckoutField key={field.name} field={field} value={values[field.name]} error={errors[field.name]} showError={attemptedContinue || touched[field.name]} onChange={updateField} onBlur={markTouched} />)}
            </div>
          </section>

          <section className="checkout-panel" aria-labelledby="delivery-title">
            <p className="eyebrow">03</p>
            <h2 id="delivery-title">Delivery method</h2>
            <fieldset className="shipping-methods">
              <legend className="sr-only">Choose a delivery method</legend>
              <label className={`shipping-option${shippingMethod === 'standard' ? ' is-selected' : ''}`}>
                <input type="radio" name="shippingMethod" value="standard" checked={shippingMethod === 'standard'} onChange={() => selectShippingMethod('standard')} />
                <span className="shipping-option-copy"><strong>Standard delivery</strong><small>Reliable delivery to your address.</small></span>
                <strong className="shipping-option-price">{standardDeliveryCost === 0 ? 'FREE' : formatCurrency(STANDARD_DELIVERY_RATE)}</strong>
              </label>
              <label className={`shipping-option${shippingMethod === 'express' ? ' is-selected' : ''}`}>
                <input type="radio" name="shippingMethod" value="express" checked={shippingMethod === 'express'} onChange={() => selectShippingMethod('express')} />
                <span className="shipping-option-copy"><strong>Express delivery</strong><small>Priority delivery option.</small></span>
                <strong className="shipping-option-price">{formatCurrency(EXPRESS_DELIVERY_RATE)}</strong>
              </label>
            </fieldset>
          </section>

          <div className="checkout-continue-area">
            <button className="button button-dark checkout-continue" type="submit">Review checkout details <Icon name="arrow" size={17} /></button>
            <p className="checkout-valid-message" aria-live="polite">{detailsReady ? 'Your customer details and delivery selection are valid and ready for the next checkout step.' : ''}</p>
            {detailsReady && <button className="button button-dark checkout-place-order" type="button" onClick={placeDemoOrder} disabled={isSubmitting}>{isSubmitting ? 'Saving demo order…' : 'Place demo order'}</button>}
            {submissionError && <p className="checkout-submission-error" role="alert">{submissionError}</p>}
          </div>
        </form>

        <aside className="checkout-summary" aria-labelledby="checkout-summary-title">
          <h2 id="checkout-summary-title">Your order</h2>
          <ul className="checkout-order-items">
            {cartItems.map(({ product, quantity }) => <li key={product.id}>
              <span className="checkout-item-quantity" aria-label={`Quantity ${quantity}`}>{quantity}</span>
              <div className="checkout-item-details"><span>{product.name}</span><small>{formatCurrency(product.price)} each</small></div>
              <strong>{formatCurrency(product.price * quantity)}</strong>
            </li>)}
          </ul>
          <form className="promo-code-form" onSubmit={applyPromotion}>
            <label htmlFor="checkout-promo-code">Promotion code</label>
            <div className="promo-code-controls">
              <input
                id="checkout-promo-code"
                name="promotionCode"
                type="text"
                autoComplete="off"
                value={promoCode}
                aria-invalid={Boolean(promoError)}
                aria-describedby={promoError ? 'checkout-promo-error' : undefined}
                onChange={(event) => updatePromoCode(event.target.value)}
              />
              <button className="promo-apply-button" type="submit" disabled={promoApplied}>Apply</button>
            </div>
          </form>
          {promoError && <p className="promo-feedback-error" id="checkout-promo-error" role="alert">{promoError}</p>}
          {promoApplied && <>
            <p className="promo-feedback-success" role="status">HELLO15 applied: 15% off merchandise. First-order eligibility is not verified in this demo.</p>
            <button className="promo-remove-button" type="button" onClick={removePromotion}>Remove promotion</button>
          </>}
          <div className="checkout-summary-row"><span>Items</span><span>{itemCount}</span></div>
          <div className="checkout-summary-row"><span>Items subtotal</span><strong>{formatCurrency(safeSubtotal)}</strong></div>
          <div className="checkout-summary-row"><span>{shippingMethodName}</span><strong>{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</strong></div>
          {promoApplied && <div className="checkout-summary-row checkout-discount-row"><span>HELLO15 discount</span><strong>−{formatCurrency(discountCents / 100)}</strong></div>}
          <div className="checkout-summary-row checkout-summary-total"><span>Order total</span><strong>{formatCurrency(orderTotal)}</strong></div>
          <p className="checkout-demo-note">This is a frontend demo. A demo order snapshot is saved in this browser session, but no real order or payment is processed.</p>
        </aside>
      </div>
    </main>
    <Footer />
  </div>
}

export default function CheckoutPage() {
  return <CheckoutContents />
}
