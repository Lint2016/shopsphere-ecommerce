import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from './ProductCard'
import { categories, products } from '../data/catalog'

const filters = ['All', ...categories.map(({ name }) => name)]
const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
]
const urlSortValues = sortOptions.filter(({ value }) => value !== 'featured').map(({ value }) => value)
const pageSizes = [6, 9, 12]
const productOrder = new Map(products.map((product, index) => [product.id, index]))

function parsePriceBound(value) {
  if (value === null || value.trim() === '') return null

  const price = Number(value)
  return Number.isFinite(price) && price >= 0 ? price : null
}

function parsePage(value) {
  if (value === null || !/^\d+$/.test(value)) return null

  const page = Number(value)
  return Number.isSafeInteger(page) && page > 0 ? page : null
}

function parsePageSize(value) {
  const limit = Number(value)
  return pageSizes.includes(limit) && String(limit) === value ? limit : null
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedPage = searchParams.get('page')
  const parsedPage = parsePage(requestedPage)
  const requestedLimit = searchParams.get('limit')
  const parsedLimit = parsePageSize(requestedLimit)
  const pageSize = parsedLimit ?? 6
  const urlMinPrice = searchParams.get('minPrice') ?? ''
  const urlMaxPrice = searchParams.get('maxPrice') ?? ''
  const [priceDrafts, setPriceDrafts] = useState({ urlMinPrice, urlMaxPrice, min: urlMinPrice, max: urlMaxPrice, error: '' })
  if (priceDrafts.urlMinPrice !== urlMinPrice || priceDrafts.urlMaxPrice !== urlMaxPrice) {
    setPriceDrafts({ urlMinPrice, urlMaxPrice, min: urlMinPrice, max: urlMaxPrice, error: '' })
  }
  const draftsMatchUrl = priceDrafts.urlMinPrice === urlMinPrice && priceDrafts.urlMaxPrice === urlMaxPrice
  const minPriceDraft = draftsMatchUrl ? priceDrafts.min : urlMinPrice
  const maxPriceDraft = draftsMatchUrl ? priceDrafts.max : urlMaxPrice
  const priceValidationError = draftsMatchUrl ? priceDrafts.error : ''

  const selectedCategory = searchParams.get('category') || 'All'
  const requestedSort = searchParams.get('sort')
  const selectedSort = urlSortValues.includes(requestedSort) ? requestedSort : 'featured'
  const searchQuery = (searchParams.get('q') || '').trim()
  const minPrice = parsePriceBound(searchParams.get('minPrice'))
  const maxPrice = parsePriceBound(searchParams.get('maxPrice'))
  const hasInvalidPriceRange = minPrice !== null && maxPrice !== null && minPrice > maxPrice
  const requestedInStock = searchParams.get('inStock') === 'true'
  const priceValidationMessage = priceValidationError || (hasInvalidPriceRange
    ? 'Minimum price must be less than or equal to maximum price.'
    : '')
  const query = searchQuery.toLowerCase()
  const hasCategoryFilter = selectedCategory !== 'All'
  const hasSearchFilter = Boolean(searchQuery)
  const hasMinPriceFilter = searchParams.has('minPrice')
  const hasMaxPriceFilter = searchParams.has('maxPrice')
  const hasAnyFilters = hasSearchFilter || hasCategoryFilter || hasMinPriceFilter || hasMaxPriceFilter || requestedInStock
  const matchingProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesQuery = !query || [product.name, product.sku, product.category, product.description]
      .some((field) => field.toLowerCase().includes(query))
    const matchesPrice = !hasInvalidPriceRange
      && (minPrice === null || product.price >= minPrice)
      && (maxPrice === null || product.price <= maxPrice)
    const matchesStock = !requestedInStock || product.stock > 0

    return matchesCategory && matchesQuery && matchesPrice && matchesStock
  })
  const sortedProducts = [...matchingProducts].sort((first, second) => {
    let comparison = 0

    if (selectedSort === 'price-asc') {
      comparison = first.price - second.price
    } else if (selectedSort === 'price-desc') {
      comparison = second.price - first.price
    } else if (selectedSort === 'name-asc') {
      comparison = first.name.localeCompare(second.name, undefined, { sensitivity: 'base' })
    } else if (selectedSort === 'name-desc') {
      comparison = second.name.localeCompare(first.name, undefined, { sensitivity: 'base' })
    }

    return comparison || productOrder.get(first.id) - productOrder.get(second.id)
  })

  const totalPages = Math.ceil(sortedProducts.length / pageSize)
  const effectivePage = totalPages === 0 ? 1 : Math.min(parsedPage ?? 1, totalPages)
  const firstProductIndex = (effectivePage - 1) * pageSize
  const currentPageProducts = sortedProducts.slice(firstProductIndex, firstProductIndex + pageSize)
  const displayedRangeStart = sortedProducts.length === 0 ? 0 : firstProductIndex + 1
  const displayedRangeEnd = Math.min(firstProductIndex + pageSize, sortedProducts.length)

  useEffect(() => {
    const normalizedPage = effectivePage === 1 ? null : String(effectivePage)
    const normalizedLimit = pageSize === 6 ? null : String(pageSize)
    const needsPageCorrection = requestedPage !== normalizedPage
    const needsLimitCorrection = requestedLimit !== normalizedLimit

    if (!needsPageCorrection && !needsLimitCorrection) return

    const nextParams = new URLSearchParams(searchParams)
    if (normalizedPage === null) nextParams.delete('page')
    else nextParams.set('page', normalizedPage)
    if (normalizedLimit === null) nextParams.delete('limit')
    else nextParams.set('limit', normalizedLimit)

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true })
    }
  }, [effectivePage, pageSize, parsedLimit, parsedPage, requestedLimit, requestedPage, searchParams, setSearchParams])

  function updateFilterParams(nextParams) {
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  function selectPageSize(limit) {
    const nextParams = new URLSearchParams(searchParams)
    if (limit === 6) nextParams.delete('limit')
    else nextParams.set('limit', String(limit))
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  function selectPage(page) {
    if (page < 1 || page > totalPages || page === effectivePage) return

    const nextParams = new URLSearchParams(searchParams)
    if (page === 1) nextParams.delete('page')
    else nextParams.set('page', String(page))
    setSearchParams(nextParams)
  }

  function selectCategory(category) {
    const nextParams = new URLSearchParams(searchParams)
    if (category === 'All') {
      nextParams.delete('category')
    } else {
      nextParams.set('category', category)
    }

    updateFilterParams(nextParams)
  }

  function clearSearch() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('q')
    updateFilterParams(nextParams)
  }

  function clearCategory() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('category')
    updateFilterParams(nextParams)
  }

  function clearMinPrice() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('minPrice')
    updateFilterParams(nextParams)
  }

  function clearMaxPrice() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('maxPrice')
    updateFilterParams(nextParams)
  }

  function clearPriceFilters() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('minPrice')
    nextParams.delete('maxPrice')
    updateFilterParams(nextParams)
  }

  function clearStock() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('inStock')
    updateFilterParams(nextParams)
  }

  function clearAll() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('q')
    nextParams.delete('category')
    nextParams.delete('minPrice')
    nextParams.delete('maxPrice')
    nextParams.delete('inStock')
    updateFilterParams(nextParams)
  }

  function selectSort(sort) {
    const nextParams = new URLSearchParams(searchParams)
    if (sort === 'featured') {
      nextParams.delete('sort')
    } else {
      nextParams.set('sort', sort)
    }

    updateFilterParams(nextParams)
  }

  function applyPriceFilters(event) {
    event.preventDefault()
    const nextMinPrice = parsePriceBound(minPriceDraft)
    const nextMaxPrice = parsePriceBound(maxPriceDraft)
    const hasInvalidBound = (minPriceDraft.trim() !== '' && nextMinPrice === null)
      || (maxPriceDraft.trim() !== '' && nextMaxPrice === null)

    if (hasInvalidBound || (nextMinPrice !== null && nextMaxPrice !== null && nextMinPrice > nextMaxPrice)) {
      setPriceDrafts({
        urlMinPrice,
        urlMaxPrice,
        min: minPriceDraft,
        max: maxPriceDraft,
        error: 'Enter valid non-negative prices, with minimum no greater than maximum.',
      })
      return
    }

    const nextParams = new URLSearchParams(searchParams)
    if (nextMinPrice === null) nextParams.delete('minPrice')
    else nextParams.set('minPrice', String(nextMinPrice))
    if (nextMaxPrice === null) nextParams.delete('maxPrice')
    else nextParams.set('maxPrice', String(nextMaxPrice))
    setPriceDrafts({ urlMinPrice, urlMaxPrice, min: minPriceDraft, max: maxPriceDraft, error: '' })
    updateFilterParams(nextParams)
  }

  function toggleInStock(checked) {
    const nextParams = new URLSearchParams(searchParams)
    if (checked) nextParams.set('inStock', 'true')
    else nextParams.delete('inStock')
    updateFilterParams(nextParams)
  }

  const emptyFilterDescriptions = [
    hasSearchFilter && `search "${searchQuery}"`,
    hasCategoryFilter && `category ${selectedCategory}`,
    minPrice !== null && `minimum price R${minPrice}`,
    maxPrice !== null && `maximum price R${maxPrice}`,
    requestedInStock && 'in-stock only',
  ].filter(Boolean)
  const emptyStateMessage = emptyFilterDescriptions.length > 0
    ? `No products match these filters: ${emptyFilterDescriptions.join(', ')}.`
    : 'No products found.'
  const individualClearActions = [
    hasSearchFilter && { label: 'Clear search', onClick: clearSearch },
    hasCategoryFilter && { label: 'Clear category', onClick: clearCategory },
    hasMinPriceFilter && { label: 'Clear minimum price', onClick: clearMinPrice },
    hasMaxPriceFilter && { label: 'Clear maximum price', onClick: clearMaxPrice },
    hasMinPriceFilter && hasMaxPriceFilter && { label: 'Clear price filters', onClick: clearPriceFilters },
    requestedInStock && { label: 'Clear stock', onClick: clearStock },
  ].filter(Boolean)

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
      <div className="shop-sort-control">
        <label htmlFor="shop-sort">Sort by</label>
        <select id="shop-sort" value={selectedSort} onChange={(event) => selectSort(event.target.value)}>
          {sortOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <form className="shop-price-filters" onSubmit={applyPriceFilters} aria-label="Filter by price">
        <div className="shop-price-inputs">
          <label htmlFor="shop-min-price">Minimum price (R)</label>
          <input id="shop-min-price" type="number" min="0" step="0.01" value={minPriceDraft} onChange={(event) => setPriceDrafts({ urlMinPrice, urlMaxPrice, min: event.target.value, max: maxPriceDraft, error: '' })} aria-describedby={priceValidationMessage ? 'shop-price-validation' : undefined} aria-invalid={Boolean(priceValidationMessage)} />
          <label htmlFor="shop-max-price">Maximum price (R)</label>
          <input id="shop-max-price" type="number" min="0" step="0.01" value={maxPriceDraft} onChange={(event) => setPriceDrafts({ urlMinPrice, urlMaxPrice, min: minPriceDraft, max: event.target.value, error: '' })} aria-describedby={priceValidationMessage ? 'shop-price-validation' : undefined} aria-invalid={Boolean(priceValidationMessage)} />
        </div>
        <button className="shop-price-apply" type="submit">Apply</button>
        {priceValidationMessage && <span className="shop-price-validation" id="shop-price-validation" role="alert">{priceValidationMessage}</span>}
      </form>
      <label className="shop-stock-filter"><input type="checkbox" checked={requestedInStock} onChange={(event) => toggleInStock(event.target.checked)} /> In-stock only</label>
      <div className="shop-result-info" aria-live="polite" aria-atomic="true">
        <span>{displayedRangeStart}–{displayedRangeEnd} of {matchingProducts.length} {matchingProducts.length === 1 ? 'product' : 'products'}</span>
        {matchingProducts.length === 0 && <span className="sr-only">{emptyStateMessage}</span>}
        {individualClearActions.map(({ label, onClick }) => <button className="clear-filters" type="button" key={label} onClick={onClick}>{label}</button>)}
        {hasAnyFilters && <button className="clear-filters" type="button" onClick={clearAll}>Clear all filters</button>}
      </div>
    </div>

    {matchingProducts.length > 0
      ? <div className="product-grid">{currentPageProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      : <div className="shop-empty-state"><h2>{emptyStateMessage}</h2><p>Try adjusting your search or filters to browse the full collection.</p><div className="shop-empty-actions">
        {individualClearActions.map(({ label, onClick }) => <button className="clear-filters" type="button" key={label} onClick={onClick}>{label}</button>)}
        {hasAnyFilters && <button className="clear-filters" type="button" onClick={clearAll}>Clear all filters</button>}
      </div></div>}

    {matchingProducts.length > 0 && <div className="shop-pagination-bar">
      <div className="shop-page-size-control">
        <label htmlFor="shop-page-size">Products per page</label>
        <select id="shop-page-size" value={pageSize} onChange={(event) => selectPageSize(Number(event.target.value))}>
          {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </div>
      {totalPages > 1 && <nav className="shop-pagination" aria-label="Product pages">
        <button className="shop-page-button shop-page-direction" type="button" onClick={() => selectPage(effectivePage - 1)} disabled={effectivePage === 1} aria-label="Previous page">Previous</button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <button
          className={`shop-page-button${page === effectivePage ? ' is-current' : ''}`}
          type="button"
          key={page}
          onClick={() => selectPage(page)}
          aria-label={`Page ${page}`}
          aria-current={page === effectivePage ? 'page' : undefined}
        >{page}</button>)}
        <button className="shop-page-button shop-page-direction" type="button" onClick={() => selectPage(effectivePage + 1)} disabled={effectivePage === totalPages} aria-label="Next page">Next</button>
      </nav>}
    </div>}
  </section>
}
