import { Icon } from './Icons'

export default function Footer() {
  return <footer className="site-footer" id="contact">
    <div className="footer-main">
      <div className="footer-brand"><a className="wordmark footer-wordmark" href="#home"><span className="brand-mark">S</span><span>shop<span className="wordmark-light">sphere</span></span></a><p>Everyday essentials. Modern technology. Better living.</p><a className="footer-email" href="mailto:hello@shopsphere.example">hello@shopsphere.example</a></div>
      <div className="footer-column"><h3>Explore</h3><a href="#shop">Shop all</a><a href="#watches">Watches</a><a href="#electronics">Electronics</a><a href="#accessories">Accessories</a></div>
      <div className="footer-column"><h3>About</h3><a href="#about">Our story</a><a href="#contact">Contact us</a><a href="#shipping">Shipping & returns</a><a href="#faq">FAQs</a></div>
      <div className="footer-social"><h3>Stay in the know</h3><p>Good things, occasional emails. No noise.</p><form onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="newsletter">Email address</label><input id="newsletter" type="email" placeholder="Your email address" /><button type="submit" aria-label="Subscribe"><Icon name="arrow" /></button></form><a href="https://instagram.com" aria-label="Instagram" className="social-link"><Icon name="instagram" /></a></div>
    </div>
    <div className="footer-bottom"><span>© 2026 ShopSphere. All rights reserved.</span><span>Discover more. Shop smarter.</span><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div></div>
  </footer>
}
