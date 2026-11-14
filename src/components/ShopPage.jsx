import { useSearchParams } from 'react-router-dom'
import ProductCard from './ProductCard'
import { categories, products } from '../data/catalog'

const filters = ['All', ...categories.map(({ name }) => name)]

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') || 'All'
  const searchQuery = (searchParams.get('q') || '').trim()
  const query = searchQuery.toLowerCase()
  const hasCategoryFilter = selectedCategory !== 'All'
  const hasSearchFilter = Boolean(searchQuery)
  const matchingProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesQuery = !query || [product.name, product.sku, product.category, product.description]
      .some((field) => field.toLowerCase().includes(query))

    return matchesCategory && matchesQuery
  })

  function selectCategory(category) {
    const nextParams = new URLSearchParams(searchParams)
    if (category === 'All') {
      nextParams.delete('category')
    } else {
      nextParams.set('category', category)
    }

    setSearchParams(nextParams)
  }

  function clearSearch() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('q')
    setSearchParams(nextParams)
  }

  function clearCategory() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('category')
    setSearchParams(nextParams)
  }

  function clearAll() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('q')
    nextParams.delete('category')
    setSearchParams(nextParams)
  }

  const emptyStateMessage = hasSearchFilter && hasCategoryFilter
    ? `No products in ${selectedCategory} match "${searchQuery}".`
    : hasSearchFilter
      ? `No products match "${searchQuery}".`
      : hasCategoryFilter
        ? `No products are available in ${selectedCategory}.`
        : 'No products found.'

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
      <div className="shop-result-info" aria-live="polite" aria-atomic="true">
        <span>{matchingProducts.length} {matchingProducts.length === 1 ? 'product' : 'products'}</span>
        {matchingProducts.length === 0 && <span className="sr-only">{emptyStateMessage}</span>}
        {hasCategoryFilter && <button className="clear-filters" type="button" onClick={clearCategory}>Clear category</button>}
        {(hasSearchFilter || hasCategoryFilter) && <button className="clear-filters" type="button" onClick={clearAll}>Clear all</button>}
      </div>
    </div>

    {matchingProducts.length > 0
      ? <div className="product-grid">{matchingProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      : <div className="shop-empty-state"><h2>{emptyStateMessage}</h2><p>Try adjusting your search or filters to browse the full collection.</p><div className="shop-empty-actions">
        {hasSearchFilter && <button className="clear-filters" type="button" onClick={clearSearch}>Clear search</button>}
        {hasCategoryFilter && <button className="clear-filters" type="button" onClick={clearCategory}>Clear category</button>}
        {hasSearchFilter && hasCategoryFilter && <button className="clear-filters" type="button" onClick={clearAll}>Clear all</button>}
      </div></div>}
  </section>
}
