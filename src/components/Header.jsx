import { useState } from 'react'
import { Icon } from './Icons'

const links = ['Shop', 'Watches', 'Electronics', 'Accessories', 'Lifestyle']

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  return <>
    <div className="announcement">A little something extra: complimentary shipping on orders over R1,000</div>
    <header className="site-header">
      <button className="icon-button menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Icon name="menu" /></button>
      <a className="wordmark" href="#home" aria-label="ShopSphere home"><span className="brand-mark">S</span><span>shop<span className="wordmark-light">sphere</span></span></a>
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        {links.map((link) => <a key={link} href={link === 'Shop' ? '#shop' : `#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{link}</a>)}
      </nav>
      <div className="header-actions">
        <button className="icon-button search-toggle" aria-label="Search products" aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}><Icon name="search" /></button>
        <a className="cart-link" href="#cart" aria-label="Shopping bag, 0 items"><Icon name="bag" /><span className="cart-count">0</span></a>
      </div>
      {searchOpen && <form className="search-panel" role="search" onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="site-search">Search products</label><input id="site-search" autoFocus placeholder="What are you looking for?" /><button type="submit" aria-label="Submit search"><Icon name="search" /></button></form>}
    </header>
  </>
}
