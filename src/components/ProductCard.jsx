import { imageUrl } from '../data/catalog'
import { formatCurrency } from '../utils/currency'
import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return <article className="product-card">
    <Link className="product-image-wrap" to={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
      <img src={imageUrl(product.image, 700)} alt={product.name} loading="lazy" />
      {product.label && <span className="product-label">{product.label}</span>}
      <span className="quick-view">Discover <span aria-hidden="true">↗</span></span>
    </Link>
    <div className="product-meta"><div><p className="product-category">{product.category}</p><h3><Link to={`/products/${product.slug}`}>{product.name}</Link></h3></div><p className="product-price">{formatCurrency(product.price)}</p></div>
  </article>
}
