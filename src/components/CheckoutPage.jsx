import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
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
  const { cartItems, itemCount, subtotal } = useCart()
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [attemptedContinue, setAttemptedContinue] = useState(false)
  const [detailsReady, setDetailsReady] = useState(false)
  const [shippingMethod, setShippingMethod] = useState('standard')
  const errors = Object.fromEntries(allFields.map((field) => [field.name, validateField(field.name, values[field.name])]))

  if (cartItems.length === 0) return <Navigate to="/shop" replace />

  const safeSubtotal = Number.isFinite(subtotal) ? Math.max(0, subtotal) : 0
  const standardDeliveryCost = safeSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_DELIVERY_RATE
  const shippingCost = shippingMethod === 'express' ? EXPRESS_DELIVERY_RATE : standardDeliveryCost
  const orderTotal = Math.max(0, safeSubtotal + shippingCost)
  const shippingMethodName = shippingMethod === 'express' ? 'Express delivery' : 'Standard delivery'

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
            <button className="button button-dark checkout-continue" type="submit">Continue to delivery <Icon name="arrow" size={17} /></button>
            <p className="checkout-valid-message" aria-live="polite">{detailsReady ? 'Your customer details and delivery selection are valid and ready for the next checkout step.' : ''}</p>
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
          <div className="checkout-summary-row"><span>Items</span><span>{itemCount}</span></div>
          <div className="checkout-summary-row"><span>Items subtotal</span><strong>{formatCurrency(safeSubtotal)}</strong></div>
          <div className="checkout-summary-row"><span>{shippingMethodName}</span><strong>{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</strong></div>
          <div className="checkout-summary-row checkout-summary-total"><span>Order total</span><strong>{formatCurrency(orderTotal)}</strong></div>
          <p className="checkout-demo-note">This is a checkout layout preview only. No information is submitted and no order is placed.</p>
        </aside>
      </div>
    </main>
    <Footer />
  </div>
}

export default function CheckoutPage() {
  return <CheckoutContents />
}
