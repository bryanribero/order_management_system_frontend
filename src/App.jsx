import {
  Route,
  Routes,
  useLocation,
  BrowserRouter,
  Navigate,
} from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import { AnimatePresence } from 'framer-motion'
import PublicRoute from './components/routes/PublicRoute'
import PrivateRoute from './components/routes/PrivateRoute'
import Products from './pages/Products'
import Couriers from './pages/Couriers'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import { ProductProvider } from './context/ProductContext'
import { CourierProvider } from './context/CourierContext'
import { CustomerProvider } from './context/CustomerContext'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Navigate to={'/login'} replace />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/products"
          element={
            <PrivateRoute>
              <ProductProvider>
                <Products />
              </ProductProvider>
            </PrivateRoute>
          }
        />
        <Route
          path="/couriers"
          element={
            <PrivateRoute>
              <CourierProvider>
                <Couriers />
              </CourierProvider>
            </PrivateRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <CustomerProvider>
                <Customers />
              </CustomerProvider>
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/:customerId"
          element={
            <PrivateRoute>
              <CustomerProvider>
                <CustomerDetail />
              </CustomerProvider>
            </PrivateRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
