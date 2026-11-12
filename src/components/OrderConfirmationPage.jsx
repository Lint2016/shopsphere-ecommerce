import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatCurrency } from '../utils/currency'
import Footer from './Footer'
import Header from './Header'
import { Icon } from './Icons'

const FREE_SHIPPING_THRESHOLD_CENTS = 100000
const STANDARD_DELIVERY_CENTS = 7500
const EXPRESS_DELIVERY_CENTS = 15000

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isMoney(value) {
  return Number.isSafeInteger(value) && value >= 0
}

function hasValidTimestamp(value) {
  if (typeof value !== 'string') return false
  const date = new Date(value)
  return Number.isFinite(date.getTime()) && date.toISOString() === value
}

function isValidOrderSnapshot(order, routeReference) {
  if (!isRecord(order)
    || order.schemaVersion !== 1
    || order.reference !== routeReference
    || !/^SS-\d{8}-[0-9A-F]{8}(?:-[0-9A-F]{4}){3}-[0-9A-F]{12}$/.test(order.reference)
    || order.currency !== 'ZAR'
    || !hasValidTimestamp(order.createdAt)) return false

  if (order.reference.slice(3, 11) !== order.createdAt.slice(0, 10).replaceAll('-', '')) return false

  if (!isRecord(order.customer)
    || !['fullName', 'email', 'phone'].every((field) => hasText(order.customer[field]))
    || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(order.customer.email.trim())) return false

  if (!isRecord(order.deliveryAddress)
    || !['streetAddress', 'suburb', 'city', 'province', 'postalCode'].every((field) => hasText(order.deliveryAddress[field]))) return false

  if (!isRecord(order.delivery)
    || !['standard', 'express'].includes(order.delivery.method)
    || !hasText(order.delivery.name)
    || order.delivery.name !== (order.delivery.method === 'standard' ? 'Standard delivery' : 'Express delivery')
    || typeof order.delivery.complimentary !== 'boolean'
    || !isMoney(order.delivery.costCents)) return false

  if (!Array.isArray(order.items) || order.items.length === 0) return false
  const validItems = order.items.every((item) => isRecord(item)
    && hasText(item.productId)
    && hasText(item.name)
    && hasText(item.sku)
    && isMoney(item.unitPriceCents)
    && Number.isSafeInteger(item.quantity)
    && item.quantity > 0
    && isMoney(item.lineSubtotalCents)
    && item.lineSubtotalCents === item.unitPriceCents * item.quantity)
  if (!validItems) return false

  if (!isRecord(order.totals)
    || !isMoney(order.totals.merchandiseSubtotalCents)
    || !isMoney(order.totals.shippingCents)
    || !isMoney(order.totals.orderTotalCents)) return false

  const merchandiseSubtotalCents = order.items.reduce((total, item) => total + item.lineSubtotalCents, 0)
  if (!Number.isSafeInteger(merchandiseSubtotalCents)
    || merchandiseSubtotalCents !== order.totals.merchandiseSubtotalCents
    || order.totals.shippingCents !== order.delivery.costCents) return false

  const expectedShippingCents = order.delivery.method === 'express'
    ? EXPRESS_DELIVERY_CENTS
    : (merchandiseSubtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_DELIVERY_CENTS)
  const expectedComplimentary = order.delivery.method === 'standard'
    && merchandiseSubtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
  if (order.delivery.costCents !== expectedShippingCents
    || order.delivery.complimentary !== expectedComplimentary) return false

  let discountCents = 0
  if (order.promotion !== null) {
    if (!isRecord(order.promotion)
      || order.promotion.code !== 'HELLO15'
      || !isMoney(order.promotion.discountCents)) return false
    discountCents = Math.round(merchandiseSubtotalCents * 15 / 100)
    if (order.promotion.discountCents !== discountCents) return false
  }

  const expectedTotalCents = merchandiseSubtotalCents - discountCents + order.delivery.costCents
  return Number.isSafeInteger(expectedTotalCents)
    && order.totals.orderTotalCents === expectedTotalCents
}

function loadOrderSnapshot(reference) {
  try {
    const serializedOrder = window.sessionStorage.getItem(`shopsphere:demo-order:${reference}`)
    if (!serializedOrder) return null

    const order = JSON.parse(serializedOrder)
    return isValidOrderSnapshot(order, reference) ? order : null
  } catch {
    return null
  }
}

function formatCents(cents) {
  return formatCurrency(cents / 100)
}

function ConfirmationUnavailable() {
  return <main className="confirmation-unavailable section-wrap" aria-labelledby="confirmation-unavailable-title">
    <p className="eyebrow">This demo session may have ended</p>
    <h1 id="confirmation-unavailable-title">Confirmation <em>unavailable.</em></h1>
    <p>We couldn’t find a valid order snapshot for this reference in the current browser session. You can continue browsing the ShopSphere collection.</p>
    <Link className="button button-dark" to="/shop">Continue shopping <Icon name="arrow" size={17} /></Link>
  </main>
}

function OrderConfirmation({ order }) {
  const orderDate = new Intl.DateTimeFormat('en-ZA', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(order.createdAt))

  return <main className="order-confirmation section-wrap" aria-labelledby="confirmation-title">
    <header className="confirmation-header">
      <span className="confirmation-mark" aria-hidden="true">✓</span>
      <p className="eyebrow">Demo order saved</p>
      <h1 id="confirmation-title">Thank you, {order.customer.fullName.split(' ')[0]}.<br /><em>Your order is confirmed.</em></h1>
      <p className="confirmation-reference">Order reference <strong>{order.reference}</strong></p>
      <p className="confirmation-date">Placed {orderDate}</p>
      <p className="confirmation-demo-note">This is a frontend demo. No real payment, fulfilment, or dispatch has been processed.</p>
    </header>

    <div className="confirmation-layout">
      <div className="confirmation-details">
        <section className="confirmation-panel" aria-labelledby="confirmation-customer-title">
          <h2 id="confirmation-customer-title">Customer details</h2>
          <dl>
            <div><dt>Name</dt><dd>{order.customer.fullName}</dd></div>
            <div><dt>Email</dt><dd>{order.customer.email}</dd></div>
            <div><dt>Phone</dt><dd>{order.customer.phone}</dd></div>
          </dl>
        </section>

        <section className="confirmation-panel" aria-labelledby="confirmation-delivery-title">
          <h2 id="confirmation-delivery-title">Delivery details</h2>
          <address>{order.deliveryAddress.streetAddress}<br />{order.deliveryAddress.suburb}<br />{order.deliveryAddress.city}, {order.deliveryAddress.province}<br />{order.deliveryAddress.postalCode}</address>
          <div className="confirmation-delivery-method"><span>{order.delivery.name}</span><strong>{order.delivery.complimentary ? 'FREE' : formatCents(order.delivery.costCents)}</strong></div>
        </section>
      </div>

      <aside className="confirmation-summary" aria-labelledby="confirmation-summary-title">
        <h2 id="confirmation-summary-title">Order summary</h2>
        <ul className="confirmation-items">
          {order.items.map((item) => <li key={item.productId}>
            <div className="confirmation-item-details">
              <strong>{item.name}</strong>
              <span>SKU: {item.sku}</span>
              <span>Qty {item.quantity} · {formatCents(item.unitPriceCents)} each</span>
            </div>
            <strong>{formatCents(item.lineSubtotalCents)}</strong>
          </li>)}
        </ul>
        {order.promotion && <div className="confirmation-total-row confirmation-promotion"><span>HELLO15 discount</span><strong>−{formatCents(order.promotion.discountCents)}</strong></div>}
        <div className="confirmation-total-row"><span>Merchandise subtotal</span><strong>{formatCents(order.totals.merchandiseSubtotalCents)}</strong></div>
        <div className="confirmation-total-row"><span>Shipping</span><strong>{order.delivery.complimentary ? 'FREE' : formatCents(order.totals.shippingCents)}</strong></div>
        <div className="confirmation-total-row confirmation-grand-total"><span>Order total</span><strong>{formatCents(order.totals.orderTotalCents)}</strong></div>
      </aside>
    </div>

    <div className="confirmation-footer-action"><Link className="button button-dark" to="/shop">Continue shopping <Icon name="arrow" size={17} /></Link></div>
  </main>
}

export default function OrderConfirmationPage() {
  const { reference = '' } = useParams()
  const order = useMemo(() => loadOrderSnapshot(reference), [reference])

  return <div className="page-shell confirmation-page">
    <Header />
    {order ? <OrderConfirmation order={order} /> : <ConfirmationUnavailable />}
    <Footer />
  </div>
}
