export const categories = [
  { name: 'Watches', description: 'Time, well spent', image: 'photo-1523275335684-37898b6baf30', number: '01' },
  { name: 'Electronics', description: 'A little more connected', image: 'photo-1505740420928-5e560c06d30e', number: '02' },
  { name: 'Accessories', description: 'The finishing touches', image: 'photo-1526170375885-4d8ecf77b99f', number: '03' },
  { name: 'Lifestyle', description: 'Made for your everyday', image: 'photo-1490312278390-ab64016e0aa9', number: '04' },
]

export const products = [
  { id: 'watch-01', name: 'Classic Chronograph', category: 'Watches', price: 189, label: 'Bestseller', image: 'photo-1523275335684-37898b6baf30' },
  { id: 'audio-01', name: 'Studio Wireless Headphones', category: 'Electronics', price: 129, label: 'New arrival', image: 'photo-1505740420928-5e560c06d30e' },
  { id: 'camera-01', name: 'Everyday Film Camera', category: 'Accessories', price: 89, label: '', image: 'photo-1526170375885-4d8ecf77b99f' },
  { id: 'home-01', name: 'Ceramic Pour Over Set', category: 'Lifestyle', price: 54, label: '', image: 'photo-1490312278390-ab64016e0aa9' },
]

export const imageUrl = (photo, width = 720) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=85`
