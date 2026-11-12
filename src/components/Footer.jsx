import { Icon } from './Icons'
import { Link } from 'react-router-dom'

export default function Footer() {
  return <footer className="site-footer" id="contact">
    <div className="footer-main">
      <div className="footer-brand"><Link className="wordmark footer-wordmark" to="/"><span className="brand-mark">S</span><span>shop<span className="wordmark-light">sphere</span></span></Link><p>Everyday essentials. Modern technology. Better living.</p><a className="footer-email" href="mailto:hello@shopsphere.example">hello@shopsphere.example</a></div>
      <div className="footer-column"><h3>Explore</h3><Link to="/shop">Shop all</Link><Link to="/shop?category=Watches">Watches</Link><Link to="/shop?category=Electronics">Electronics</Link><Link to="/shop?category=Accessories">Accessories</Link></div>
      <div className="footer-column"><h3>About</h3><Link to="/#about">Our story</Link><Link to="/#contact">Contact us</Link><a href="#shipping">Shipping &amp; returns</a><a href="#faq">FAQs</a></div>
      <div className="footer-social"><h3>Stay in the know</h3><p>Good things, occasional emails. No noise.</p><form onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="newsletter">Email address</label><input id="newsletter" type="email" placeholder="Your email address" /><button type="submit" aria-label="Subscribe"><Icon name="arrow" /></button></form><a href="https://instagram.com" aria-label="Instagram" className="social-link"><Icon name="instagram" /></a></div>
    </div>
    <div className="footer-bottom"><span>© 2026 ShopSphere. All rights reserved.</span><span>Discover more. Shop smarter.</span><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div></div>
  </footer>
}
