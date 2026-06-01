import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: 'Inter, sans-serif', fontWeight: 600 } }}/>
          <Routes>
            <Route path="/admin" element={<><Navbar/><Admin/><Footer/></>}/>
            <Route path="/*" element={
              <>
                <Navbar/>
                <Routes>
                  <Route path="/" element={<Home/>}/>
                  <Route path="/catalogue" element={<Catalogue/>}/>
                  <Route path="/produit/:id" element={<ProductDetail/>}/>
                  <Route path="/checkout" element={<Checkout/>}/>
                  <Route path="/a-propos" element={<About/>}/>
                  <Route path="/faq" element={<FAQ/>}/>
                  <Route path="/contact" element={<Contact/>}/>
                </Routes>
                <Footer/>
              </>
            }/>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
