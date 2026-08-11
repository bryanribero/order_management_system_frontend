import { Package, TriangleAlert, PackageX, DollarSign } from 'lucide-react'
import './products.css'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import ComponentTransition from '../effects/ComponentTransition'
import SearchInput from '../components/SearchInput'
import { useState } from 'react'
import SelectInput from '../components/SelectCategory'
import { useEffect } from 'react'
import TableProducts from '../components/TableProducts'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { authenticatedFetch } from '../services/authenticatedFetch'
import Pagination from '../components/Pagination'
import ProductModal from '../components/ProductModal'
import { formatPrice } from '../utils/formatPrice'
import { ProductContext } from '../context/ProductContext'

export default function Products() {
  const [inputProduct, setInputProduct] = useState('')
  const [categories, setCategories] = useState([])
  const [idCategory, setIdCategory] = useState('')
  const [products, setProducts] = useState([])
  const { accessToken, setAccessToken } = useContext(AuthContext)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] =
    useState(false)
  const [isUpdateProductModalOpen, setIsUpdateProductModalOpen] =
    useState(false)
  const [stats, setStats] = useState({})
  const { idProduct, setIdProduct } = useContext(ProductContext)

  const updateProduct = async (body) => {
    const updateBody = Object.fromEntries(
      Object.entries(body).filter(([, value]) => value !== '')
    )

    try {
      const response = await authenticatedFetch(
        `https://order-management-system-995e.onrender.com/api/products/${idProduct}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateBody),
        },
        accessToken,
        setAccessToken
      )

      if (response.status === 400) {
        const data = await response.json()

        throw data
      }

      setIdProduct('')

      await Promise.all([fetchProducts(), fetchStats()])
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const createProduct = async (body) => {
    try {
      const response = await authenticatedFetch(
        'https://order-management-system-995e.onrender.com/api/products',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
        accessToken,
        setAccessToken
      )

      if (response.status === 400) {
        const data = await response.json()

        throw data
      }

      await Promise.all([fetchProducts(), fetchStats()])
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const fetchProducts = async () => {
    const params = new URLSearchParams({
      page: currentPage,
      limit: 5,
    })

    if (inputProduct.trim()) {
      params.append('word', inputProduct.trim())
    }

    if (idCategory) {
      params.append('id_category', idCategory)
    }

    try {
      const response = await authenticatedFetch(
        `https://order-management-system-995e.onrender.com/api/products?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        accessToken,
        setAccessToken
      )

      if (!response.ok) {
        throw new Error('No se pudieron obtener los productos')
      }

      const data = await response.json()
      setTotalPages(data.pagination.totalPages)
      setProducts(data.products)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchStats = async () => {
    const response = await authenticatedFetch(
      `https://order-management-system-995e.onrender.com/api/products/stats`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      accessToken,
      setAccessToken
    )

    const data = await response.json()

    console.log(data)

    data.totalInventoryValue = formatPrice(data.totalInventoryValue)
    setStats(data)
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          'https://order-management-system-995e.onrender.com/api/categories'
        )

        if (!response.ok) {
          console.error('Error con la peticion de categorías')
          return []
        }

        const data = await response.json()
        setCategories(data.categories)
      } catch (error) {
        console.error(error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const allFetchPromises = async () => {
      await Promise.all([fetchProducts(), fetchStats()])
    }

    allFetchPromises()
  }, [currentPage, idCategory, inputProduct])

  return (
    <div className="layout">
      <Navbar />
      <ComponentTransition>
        <main className="container-products-main">
          <header className="container-header-products">
            <div className="container-products-title">
              <h1 className="title-products">Productos</h1>
              <p className="sub-title-products">
                Gestioná el catálogo de productos de tu negocio.
              </p>
            </div>

            <button
              className="add-product"
              onClick={() => setIsCreateProductModalOpen(true)}
            >
              Nuevo producto
            </button>
          </header>
          <div className="products-layout">
            <section className="cards-layout">
              <StatCard
                icon={Package}
                title={'Total productos'}
                value={stats?.count}
                text={'Todos los productos registrados'}
              />
              <StatCard
                icon={TriangleAlert}
                title={'Bajo stock'}
                value={stats?.lowStock}
                text={'Productos con stock bajo'}
                variant="yellow"
              />
              <StatCard
                icon={PackageX}
                title={'Sin stock'}
                value={stats?.outOfStock}
                text={'Productos sin stock disponibles'}
                variant="red"
              />
              <StatCard
                icon={DollarSign}
                title={'Valor total inventario'}
                value={`$${stats?.totalInventoryValue}`}
                text={'Valor estimado según stock actual'}
              />
            </section>

            <section className="products-table-section">
              <div className="products-filters">
                <SearchInput
                  placeholderInput={'Buscar producto...'}
                  inputProduct={inputProduct}
                  setInputProduct={setInputProduct}
                />
                <SelectInput
                  categories={categories}
                  idCategory={idCategory}
                  setIdCategory={setIdCategory}
                />
              </div>
              <div className="products-table">
                <TableProducts
                  products={products}
                  onProductDeleted={fetchProducts}
                  onStatsDeleted={fetchStats}
                  onOpenEdit={() => setIsUpdateProductModalOpen(true)}
                />
                <Pagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                />
              </div>
            </section>
          </div>
        </main>
      </ComponentTransition>
      <ProductModal
        isOpen={isCreateProductModalOpen}
        onClose={setIsCreateProductModalOpen}
        categories={categories}
        titleText={'Nuevo producto'}
        subTitle={'Agregá un producto al catálogo.'}
        loadingTextButton={'Creando producto...'}
        textButton={'Crear producto'}
        onSubmit={createProduct}
      />
      <ProductModal
        isOpen={isUpdateProductModalOpen}
        onClose={setIsUpdateProductModalOpen}
        categories={categories}
        titleText={'Actualizar producto'}
        subTitle={'Actualizá un producto del catálogo.'}
        loadingTextButton={'Actualizando producto...'}
        textButton={'Actualizar producto'}
        onSubmit={updateProduct}
      />
    </div>
  )
}
