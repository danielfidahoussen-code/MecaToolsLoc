import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { PriceProvider } from './context/PriceContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import MentionsLegales from './pages/MentionsLegales';
import CGV from './pages/CGV';
import Confidentialite from './pages/Confidentialite';
import LogoPreview from './pages/LogoPreview';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Vehicules from './pages/Vehicules';
import CarReservationSuccess from './pages/CarReservationSuccess';
import CarContract from './pages/CarContract';

export default function App() {
  return (
    <AuthProvider>
      <PriceProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop/>
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
                  <Route path="/checkout/success" element={<CheckoutSuccess/>}/>
                  <Route path="/a-propos" element={<About/>}/>
                  <Route path="/faq" element={<FAQ/>}/>
                  <Route path="/contact" element={<Contact/>}/>
                  <Route path="/mentions-legales" element={<MentionsLegales/>}/>
                  <Route path="/cgv" element={<CGV/>}/>
                  <Route path="/confidentialite" element={<Confidentialite/>}/>
                  <Route path="/logo-preview" element={<LogoPreview/>}/>
                  <Route path="/vehicules" element={<Vehicules/>}/>
                  <Route path="/vehicules/success" element={<CarReservationSuccess/>}/>
                  <Route path="/vehicules/contrat/:id" element={<CarContract/>}/>
                  {/* Redirections depuis l'ancienne URL "autres-services" */}
                  <Route path="/autres-services" element={<Navigate to="/vehicules" replace/>}/>
                  <Route path="/autres-services/success" element={<Navigate to="/vehicules/success" replace/>}/>
                  <Route path="/autres-services/contrat/:id" element={<Navigate to="/vehicules" replace/>}/>
                </Routes>
                <Footer/>
              </>
            }/>
          </Routes>
        </BrowserRouter>
      </CartProvider>
      </PriceProvider>
    </AuthProvider>
  );
}
