import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicProducts } from '../services/list';

function ClientProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(8);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [quantities, setQuantities] = useState({});

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize],
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const { data, error } = await getPublicProducts(
        searchTerm,
        pageNumber,
        pageSize,
      );

      if (error) throw error;

      const items = data?.productItems;
      const totalFromApi = data?.total;

      setTotal(typeof totalFromApi === 'number' ? totalFromApi : 0);
      setProducts(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error al cargar productos: ', error);
      setTotal(0);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pageNumber, pageSize, searchTerm]);

  const handleSearch = () => {
    setPageNumber(1);
  };

  const getQuantity = (productId) => {
    return quantities[productId] ?? 0;
  };

  const changeQuantity = (productId, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] ?? 0;
      const next = current + delta;

      return {
        ...prev,
        [productId]: next < 0 ? 0 : next,
      };
    });
  };

  const handleAddToCart = (product) => {
    const quantity = getQuantity(product.sku);

    if (quantity < 1) {
      alert('Debes seleccionar al menos 1 unidad.');

      return;
    }

    let cart = [];

    try {
      const stored = localStorage.getItem('cart');

      cart = stored ? JSON.parse(stored) : [];
    } catch {
      cart = [];
    }

    const existingIndex = cart.findIndex((item) => item.productId === product.id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        price: product.currentUnitPrice,
        quantity: quantity,
        image: product.image || null,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Se agregaron ${quantity} unidades de ${product.name} al carrito.`);

    changeQuantity(product.sku, -quantity);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">

      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">

            <div
              className="flex items-center gap-2 cursor-pointer group select-none"
              onClick={() => navigate('/')}
            >
              {/*Icono de la bolista de compras*/}
              <div className="relative w-9 h-9">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm transition-transform group-hover:scale-110 duration-300 ease-out">
                  <defs>
                    <linearGradient id="logoGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#9333ea" /> {/* Purple-600 */}
                      <stop offset="1" stopColor="#c084fc" /> {/* Purple-400 */}
                    </linearGradient>
                  </defs>
                  <path d="M9 11V8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8V11" stroke="url(#logoGradient)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z" fill="url(#logoGradient)" className="opacity-20" />
                  <path d="M5 9H19L20 21H4L5 9Z" stroke="url(#logoGradient)" strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="12" cy="14" r="1.5" fill="white" />
                </svg>
              </div>
              {/*fin del icono*/}

              <div className="flex flex-col leading-none justify-center">
                <span className="font-extrabold text-xl tracking-tight text-gray-800 group-hover:text-purple-700 transition-colors">
                  DSW2025<span className="text-purple-600">App</span>
                </span>
                <span className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.2em] ml-0.5">
                  Store
                </span>
              </div>
            </div>

            <nav className="hidden md:flex gap-4 text-sm font-medium text-gray-500">
              <span className="text-black cursor-pointer bg-gray-100 px-3 py-1 rounded-md">
                Productos
              </span>
              <button
                onClick={() => navigate('/cart')}
                className="hover:text-black cursor-pointer px-3 py-1"
              >
                Carrito de compras
              </button>
            </nav>

            <button className="md:hidden text-2xl">☰</button>
          </div>

          <div className="w-full md:max-w-md relative">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 transition-shadow"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              🔍
            </button>
          </div>

          <div className="hidden md:flex gap-3 text-sm">
            <button
              onClick={() => navigate('/login')}
              className="bg-purple-100 text-purple-900 px-4 py-2 rounded-md font-medium hover:bg-purple-200 transition"
            >
              Iniciar Sesión
            </button>
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition">
              Registrarse
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-400">
            Cargando catálogo...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-2">No se encontraron productos.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                handleSearch();
              }}
              className="text-purple-600 underline"
            >
              Ver todos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const qty = getQuantity(product.sku);

              return (
                <div
                  key={product.sku}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col border border-gray-100"
                >
                  <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3
                      className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2 h-8 overflow-hidden">
                      {product.description || 'Sin descripción disponible'}
                    </p>

                    <div className="text-lg font-bold text-gray-900 mb-4">
                      ${product.currentUnitPrice}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => changeQuantity(product.sku, -1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black font-bold"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-medium bg-gray-50 rounded border border-gray-200 py-0.5">
                          {qty}
                        </span>
                        <button
                          onClick={() => changeQuantity(product.sku, 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold py-2 px-3 rounded transition-colors uppercase tracking-wide"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 text-sm text-gray-600">
          <button
            disabled={pageNumber === 1}
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ← Anterior
          </button>

          <span className="font-medium">
            Página {pageNumber} de {totalPages}
          </span>

          <button
            disabled={pageNumber >= totalPages}
            onClick={() => setPageNumber((p) => (p < totalPages ? p + 1 : p))}
            className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            Siguiente →
          </button>
        </div>
      </main>
    </div>
  );
}

export default ClientProductsPage;