import { imageUrl } from '../data/catalog'

export default function ProductCard({ product }) {
  return <article className="product-card">
    <a className="product-image-wrap" href="#shop" aria-label={`View ${product.name}`}>
      <img src={imageUrl(product.image, 700)} alt={product.name} loading="lazy" />
      {product.label && <span className="product-label">{product.label}</span>}
      <span className="quick-view">Discover <span aria-hidden="true">↗</span></span>
    </a>
    <div className="product-meta"><div><p className="product-category">{product.category}</p><h3><a href="#shop">{product.name}</a></h3></div><p className="product-price">${product.price}</p></div>
  </article>
}
