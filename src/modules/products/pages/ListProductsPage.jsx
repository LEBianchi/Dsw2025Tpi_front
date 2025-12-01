import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import { getAdminProducts } from '../services/list';

const productStatusOptions = [
  { label: 'Estado de Producto (Todos)', value: '' },
  { label: 'Activo', value: 'true' },
  { label: 'Inactivo', value: 'false' },
];

function ListProductsPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(5);

  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const statusToSend = status === '' ? null : status;

      console.log('🔍 Buscando:', { searchTerm, status: statusToSend, pageNumber, pageSize });

      const result = await getAdminProducts(searchTerm, statusToSend, pageNumber, pageSize);
      const { data, error } = result;

      if (error) throw error;

      const lista = data?.productItems || data?.items || [];
      const totalItems = data?.total || 0;

      setProducts(lista);
      setTotal(totalItems);

    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [status, pageNumber, pageSize]);

  const handleSearch = () => {
    setPageNumber(1);
    fetchProducts();
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

  return (
    <div className="p-4 space-y-4">

      <Card className="p-4 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col gap-4">

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
            <button
              onClick={() => navigate('/admin/products/create')}
              className="bg-purple-100 text-purple-700 px-4 py-2 rounded-md font-medium hover:bg-purple-200 transition"
            >
              Crear Producto
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Buscar"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-purple-100 text-purple-700 p-2 rounded-md hover:bg-purple-200"
              >
                🔍
              </button>
            </div>

            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200 min-w-[220px]"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPageNumber(1);
              }}
            >
              {productStatusOptions.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded shadow-sm">No hay productos.</div>
        ) : (
          products.map((product) => (
            <Card key={product.id || product.sku} className="hover:shadow-md transition-shadow bg-white rounded-lg p-4 border border-gray-100">
              <div className="flex justify-between items-center">

                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900">
                    {product.sku} - {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Stock: {product.stockQuantity} - {product.isActive ? 'Activo' : 'Inactivo'}
                  </p>
                </div>

                <button
                  className="bg-purple-100 text-purple-700 px-6 py-2 rounded-md font-medium hover:bg-purple-200 transition"
                  onClick={() => console.log('Ver detalle', product.id)}
                >
                  Ver
                </button>

              </div>
            </Card>
          ))
        )}
      </div>

      {total > 0 && (
        <div className="flex justify-center items-center gap-4 py-4 text-sm text-gray-600">
          <button
            disabled={pageNumber === 1}
            onClick={() => setPageNumber(p => p - 1)}
            className="hover:text-black disabled:opacity-30 disabled:hover:text-gray-600 flex items-center gap-1"
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            <span className="bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded">
              {pageNumber}
            </span>
          </div>

          <button
            disabled={pageNumber >= totalPages}
            onClick={() => setPageNumber(p => p + 1)}
            className="hover:text-black disabled:opacity-30 disabled:hover:text-gray-600 flex items-center gap-1"
          >
            Next →
          </button>
        </div>
      )}

    </div>
  );
}

export default ListProductsPage;