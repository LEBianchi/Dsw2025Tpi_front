import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import Button from '../../shared/components/Button';

import Card from '../../shared/components/Card';

import { listOrders } from '../services/listServices';


const orderStatus = {
  ALL: 'Todos',
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELED: 'Canceled',
};

function ListOrdersPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState(orderStatus.ALL);
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
        status: status
      };
      console.log("1. Enviando filtros al servicio:", filters);

      const data = await listOrders(filters);

      console.log("2. Respuesta del Backend:", data);
      console.log("3. Chequeo de propiedades: ");
      console.log("   - data.total:", data?.total);
      console.log("   - data.items:", data?.items); 
      console.log("   - data.productItems:", data?.productItems);

      const listaFinal = data?.items || data?.productItems || [];
      
      console.log("4. Lista final a guardar en estado:", listaFinal);

      if (listaFinal.length === 0) {
        console.warn("La lista está vacía. ¿La base de datos tiene órdenes?");
      }

      setTotal(data?.total || 0);
      setOrders(listaFinal);

    } catch (error) {
      console.error(" Error  en fetchOrders:", error); //esto se activa si  
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status, pageSize, pageNumber]);

  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = async () => {
    console.log("Buscando manualmente:", searchTerm);
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
    className='text-lg w-full border-b focus:outline-none focus:border-purple-500 py-2 pl-2 pr-12' // Agregué padding right para que el texto no se pise con el botón
  />
  
  <Button 
    className='h-11 w-11 flex justify-center items-center absolute right-0 !bg-purple-100 rounded-lg' // !bg-purple-100 fuerza el color lila
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
        stroke="#6b21a8" // <--- COLOR VIOLETA OSCURO (Purple-800)
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
            <option value={orderStatus.ALL}>Todos</option>
            <option value={orderStatus.PENDING}>Pendientes</option>
            <option value={orderStatus.COMPLETED}>Completadas</option>
            <option value={orderStatus.CANCELED}>Canceladas</option>
          </select>
        </div>
      </Card>

      <div className='mt-4 flex flex-col gap-4'>
        {loading ? (
          <div className='text-center p-4 bg-white rounded shadow'>
             <span>Buscando datos...</span>
          </div>
        ) : orders.length > 0 ? (
          orders.map(order => (
            <Card key={order.orderId || Math.random()} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                <h1 className='text-xl font-bold text-gray-800'>
                #{order.clientName || order.customerName || 'Consumidor Final'}
                </h1>

                <p className='text-sm text-gray-600'>
                {order.status}
                </p>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>

                  <Button onClick={() => console.log("Ver detalle", order.orderId)}>
                    Ver
                  </Button>
                </div>
              </div>
            </Card>
          ))
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