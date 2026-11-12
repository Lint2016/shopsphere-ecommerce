import { useSearchParams } from 'react-router-dom'
import ProductCard from './ProductCard'
import { categories, products } from '../data/catalog'

const filters = ['All', ...categories.map(({ name }) => name)]

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') || 'All'
  const matchingProducts = selectedCategory === 'All'
    ? products
    : products.filter((product) => product.category === selectedCategory)

  function selectCategory(category) {
    if (category === 'All') {
      setSearchParams({})
      return
    }

    setSearchParams({ category })
  }

  return <section className="shop-catalog section-wrap" id="shop" aria-labelledby="shop-title">
    <div className="shop-heading">
      <p className="eyebrow">A world of good things</p>
      <h1 id="shop-title">Shop the <em>collection.</em></h1>
      <p className="shop-intro">Thoughtful finds for everyday living, gathered in one place.</p>
    </div>

    <div className="shop-toolbar">
      <div className="category-filters" role="group" aria-label="Filter products by category">
        {filters.map((category) => <button
          className={`filter-button${selectedCategory === category ? ' is-active' : ''}`}
          type="button"
          key={category}
          aria-pressed={selectedCategory === category}
          onClick={() => selectCategory(category)}
        >{category}</button>)}
      </div>
      <div className="shop-result-info" aria-live="polite">
        <span>{matchingProducts.length} {matchingProducts.length === 1 ? 'product' : 'products'}</span>
        {selectedCategory !== 'All' && <button className="clear-filters" type="button" onClick={() => selectCategory('All')}>Clear filters</button>}
      </div>
    </div>

    {matchingProducts.length > 0
      ? <div className="product-grid">{matchingProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      : <div className="shop-empty-state"><h2>No products found</h2><p>There are no products in this selection. Clear the filters to browse the full collection.</p><button className="button button-dark" type="button" onClick={() => selectCategory('All')}>Clear filters</button></div>}
  </section>
}
