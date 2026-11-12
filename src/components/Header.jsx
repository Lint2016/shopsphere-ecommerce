import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icons'
import { useCart } from './cart-context'

const links = ['Watches', 'Electronics', 'Accessories', 'Lifestyle']

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount } = useCart()

  function closeMenu() {
    setMenuOpen(false)
  }

  return <>
    <div className="announcement">complimentary shipping on orders over R1,000</div>
    <header className="site-header">
      <button className="icon-button menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name="menu" /></button>
      <Link className="wordmark" to="/" aria-label="ShopSphere home" onClick={closeMenu}><span className="brand-mark">S</span><span>shop<span className="wordmark-light">sphere</span></span></Link>
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} id="main-navigation" aria-label="Main navigation">
        <Link to="/shop" onClick={closeMenu}>Shop</Link>
        {links.map((link) => <Link key={link} to={`/shop?category=${encodeURIComponent(link)}`} onClick={closeMenu}>{link}</Link>)}
      </nav>
      <div className="header-actions">
        <button className="icon-button search-toggle" type="button" aria-label="Search products" aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}><Icon name="search" /></button>
        <Link className="cart-link" to="/cart" aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}><Icon name="bag" /><span className="cart-count" aria-hidden="true">{itemCount}</span></Link>
      </div>
      {searchOpen && <form className="search-panel" role="search" onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="site-search">Search products</label><input id="site-search" autoFocus placeholder="What are you looking for?" /><button type="submit" aria-label="Submit search"><Icon name="search" /></button></form>}
    </header>
  </>
}
