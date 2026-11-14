import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from './Icons'
import { useCart } from './cart-context'

const links = ['Watches', 'Electronics', 'Accessories', 'Lifestyle']

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { itemCount } = useCart()
  const urlQuery = searchParams.get('q') || ''
  const [previousUrlQuery, setPreviousUrlQuery] = useState(urlQuery)

  if (urlQuery !== previousUrlQuery) {
    setPreviousUrlQuery(urlQuery)
    setSearchQuery(urlQuery)
  }

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus()
    }
  }, [searchOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  function toggleMenu() {
    if (menuOpen) {
      setMenuOpen(false)
    } else {
      setSearchOpen(false)
      setMenuOpen(true)
    }
  }

  function toggleSearch() {
    if (searchOpen) {
      setSearchOpen(false)
    } else {
      setMenuOpen(false)
      setSearchOpen(true)
    }
  }

  function clearSearch() {
    setSearchQuery('')
    const nextParams = new URLSearchParams(location.search)
    nextParams.delete('q')
    const nextSearch = nextParams.toString()
    navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`, { replace: true })
  }

  function submitSearch(event) {
    event.preventDefault()
    const query = searchQuery.trim()
    if (!query) {
      clearSearch()
      return
    }

    const nextParams = location.pathname === '/shop'
      ? new URLSearchParams(location.search)
      : new URLSearchParams()
    nextParams.set('q', query)
    navigate(`/shop?${nextParams.toString()}`)
  }

  return <>
    <div className="announcement">complimentary shipping on orders over R1,000</div>
    <header className="site-header">
      <button className="icon-button menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={toggleMenu}><Icon name="menu" /></button>
      <Link className="wordmark" to="/" aria-label="ShopSphere home" onClick={closeMenu}><span className="brand-mark">S</span><span>shop<span className="wordmark-light">sphere</span></span></Link>
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} id="main-navigation" aria-label="Main navigation">
        <Link to="/shop" onClick={closeMenu}>Shop</Link>
        {links.map((link) => <Link key={link} to={`/shop?category=${encodeURIComponent(link)}`} onClick={closeMenu}>{link}</Link>)}
      </nav>
      <div className="header-actions">
        <button className="icon-button search-toggle" type="button" aria-label="Search products" aria-expanded={searchOpen} aria-controls="header-search-panel" onClick={toggleSearch}><Icon name="search" /></button>
        <Link className="cart-link" to="/cart" aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}><Icon name="bag" /><span className="cart-count" aria-hidden="true">{itemCount}</span></Link>
      </div>
      <form id="header-search-panel" className="search-panel" role="search" hidden={!searchOpen} onSubmit={submitSearch}><label className="sr-only" htmlFor="site-search">Search products</label><input ref={searchInputRef} id="site-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="What are you looking for?" /><button type="submit" aria-label="Submit search"><Icon name="search" /></button>{searchQuery && <button className="search-clear" type="button" aria-label="Clear search" onClick={clearSearch}>Clear</button>}</form>
    </header>
  </>
}
