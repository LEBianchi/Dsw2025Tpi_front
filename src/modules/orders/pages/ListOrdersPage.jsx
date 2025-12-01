import { useEffect, useState } from 'react';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import { listOrders } from '../services/listServices';

const statusLabels = {
  'PENDING': 'Pendiente',
  'PROCESSING': 'Procesando',
  'SHIPPED': 'Enviado',
  'DELIVERED': 'Entregado',
  'CANCELLED': 'Cancelado',
};

const getStatusChipClass = (status) => {
  switch (status) {
    case 1:
      return 'bg-yellow-100 text-yellow-800';
    case 2:
      return 'bg-blue-100 text-blue-800';
    case 3:
      return 'bg-indigo-100 text-indigo-800';
    case 4:
      return 'bg-green-100 text-green-800';
    case 5:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

function ListOrdersPage() {

  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [total, setTotal] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const filters = {
        page: pageNumber,
        search: searchTerm,
      };

      if (status !== '') {
        filters.status = status;
      }

      console.log('1. Enviando filtros al servicio:', filters);

      const data = await listOrders(filters);

      console.log('2. Respuesta del Backend:', data);
      console.log('3. Chequeo de propiedades: ');
      console.log('   - data.total:', data?.total);
      console.log('   - data.items:', data?.items);
      console.log('   - data.productItems:', data?.productItems);

      const listaFinal = data?.items || data?.productItems || [];

      console.log('4. Lista final a guardar en estado:', listaFinal);

      if (listaFinal.length === 0) {
        console.warn('La lista está vacía. ¿La base de datos tiene órdenes?');
      }

      setTotal(data?.total || 0);
      setOrders(listaFinal);

    } catch (error) {
      console.error(' Error  en fetchOrders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    //Lo silencio porque si hago que le quiere se puede generar un bucle infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pageSize, pageNumber]);

  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = async () => {
    console.log('Buscando manualmente:', searchTerm);
    setPageNumber(1);
    await fetchOrders();
  };

  return (
    <div className="p-4">
      <Card>
        <div className='flex justify-between items-center mb-3'>
          <h1 className='text-3xl font-bold'>Ordenes</h1>
          <div className='h-11 w-11 sm:hidden'></div>
        </div>

        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex items-center gap-3 w-full relative'>
            <input
              value={searchTerm}
              onChange={(evt) => setSearchTerm(evt.target.value)}
              type="text"
              placeholder='Buscar ordenes...'
              className='text-lg w-full border-b focus:outline-none focus:border-purple-500 py-2 pl-2 pr-12'
            />

            <Button
              className='h-11 w-11 flex justify-center items-center absolute right-0 !bg-purple-100 rounded-lg'
              onClick={handleSearch}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
              >
                <path
                  d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
                  stroke="#6b21a8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>

          <select
            onChange={evt => {
              setStatus(evt.target.value);
              setPageNumber(1);
            }}
            className='text-lg border-b bg-transparent focus:outline-none py-2'
            value={status}
          >
            <option value="">Estado de Orden</option>
            <option value="1">Pendientes</option>
            <option value="2">Procesando</option>
            <option value="3">Enviadas</option>
            <option value="4">Entregadas</option>
            <option value="5">Canceladas</option>
          </select>
        </div>
      </Card>

      <div className='mt-4 flex flex-col gap-4'>
        {loading ? (
          <div className='text-center p-4 bg-white rounded shadow'>
            <span>Buscando datos...</span>
          </div>
        ) : orders.length > 0 ? (
          orders.map(order => {

            return (
              <Card key={order.orderId || Math.random()} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className='text-xl font-bold text-gray-800'>
                      #{order.clientName || order.customerName || 'Consumidor Final'}
                    </h1>

                    <p className='text-sm text-gray-600'>
                      {statusLabels[order.status] || 'Estado desconocido'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusChipClass(order.status)}`}
                    >
                      {statusLabels[order.status] || 'Estado desconocido'}
                    </span>

                    <Button onClick={() => console.log('Ver detalle', order.orderId)}>
                      Ver
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <p className="text-center text-gray-500">No se encontraron órdenes.</p>
            <p className="text-center text-xs text-gray-400">(Chequeá la consola para ver qué respondió el servidor simulado)</p>
          </Card>
        )}
      </div>

      <div className='flex justify-center items-center mt-6 mb-8 gap-4'>
        <button
          disabled={pageNumber === 1}
          onClick={() => setPageNumber(pageNumber - 1)}
          className='bg-gray-200 disabled:opacity-50 px-4 py-2 rounded hover:bg-gray-300 transition'
        >
          Atras
        </button>

        <span className="font-bold text-gray-700">{pageNumber} / {totalPages || 1}</span>

        <button
          disabled={pageNumber >= totalPages}
          onClick={() => setPageNumber(pageNumber + 1)}
          className='bg-gray-200 disabled:opacity-50 px-4 py-2 rounded hover:bg-gray-300 transition'
        >
          Siguiente
        </button>

        <select
          value={pageSize}
          onChange={evt => {
            setPageNumber(1);
            setPageSize(Number(evt.target.value));
          }}
          className='border rounded p-2 bg-white'
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
      </div>
    </div>
  );
}

export default ListOrdersPage;
