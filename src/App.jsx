import Header from './components/Header'
import Footer from './components/Footer'
import ProductCard from './components/ProductCard'
import { Icon } from './components/Icons'
import { categories, imageUrl, products } from './data/catalog'
import './App.css'

function App() {
  return <div className="page-shell" id="home">
    <Header />
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line" /> Thoughtfully chosen, just for you</p><h1 id="hero-title">The little things<br />make <em>life better.</em></h1><p className="hero-description">Everyday essentials. Modern technology. Better living. Find pieces that feel right at home in your world.</p><a className="button button-dark" href="#shop">Shop the collection <Icon name="arrow" size={17} /></a><div className="hero-note"><span className="hero-note-star">✳</span><span>Considered finds<br /><strong>for everyday living</strong></span></div></div>
        <div className="hero-visual"><img src={imageUrl('photo-1490312278390-ab64016e0aa9', 1300)} alt="A calm, sunlit home with thoughtfully arranged everyday objects" /><div className="hero-stamp"><span>GOOD DESIGN</span><span className="stamp-star">✳</span><span>GOOD LIVING</span></div><div className="hero-image-caption"><span>Make room for better.</span><span>01 — 04</span></div></div>
      </section>

      <section className="category-section section-wrap" id="shop" aria-labelledby="category-title">
        <div className="section-heading"><div><p className="eyebrow">A world of good things</p><h2 id="category-title">Find your <em>something.</em></h2></div><a className="text-link" href="#featured">Explore all <Icon name="arrow" size={16} /></a></div>
        <div className="category-grid">{categories.map((category) => <a className="category-card" href={`#${category.name.toLowerCase()}`} id={category.name.toLowerCase()} key={category.name}><img src={imageUrl(category.image, 800)} alt={`${category.name} collection`} loading="lazy" /><span className="category-number">{category.number}</span><span className="category-info"><span><strong>{category.name}</strong><small>{category.description}</small></span><span className="category-arrow"><Icon name="arrow" size={18} /></span></span></a>)}</div>
      </section>

      <section className="featured-section" id="featured" aria-labelledby="featured-title"><div className="section-wrap"><div className="section-heading"><div><p className="eyebrow">Good things, picked for you</p><h2 id="featured-title">The <em>edit.</em></h2></div><a className="text-link" href="#shop">Shop all products <Icon name="arrow" size={16} /></a></div><div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></div></section>

      <section className="promo-section section-wrap" id="about"><div className="promo-panel"><div className="promo-copy"><p className="eyebrow">A little more, for a little less</p><h2>Good finds.<br /><em>Good feeling.</em></h2><p>Make your everyday a little more thoughtful. Take 15% off your first order, on us.</p><a className="button button-light" href="#shop">Find your something <Icon name="arrow" size={17} /></a><small>Use code <strong>HELLO15</strong> at checkout</small></div><div className="promo-photo"><img src={imageUrl('photo-1490481651871-ab68de25d43d', 1000)} alt="Thoughtfully curated everyday accessories" loading="lazy" /><span className="promo-photo-tag">A considered collection <span>✳</span></span></div><span className="promo-watermark" aria-hidden="true">S</span></div></section>

      <section className="values-strip" aria-label="The ShopSphere promise"><div><span>✳</span><p>Picked with purpose</p></div><div><span>↗</span><p>Made for real life</p></div><div><span>♡</span><p>A little more thoughtful</p></div></section>
    </main>
    <Footer />
  </div>
}

export default App
