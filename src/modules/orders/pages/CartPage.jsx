import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/createServices';
import useAuth from '../../auth/hook/useAuth';
import LoginForm from '../../auth/components/LoginForm';

function CartPage() {
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [shippingAddress, setShippingAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart');

      if (stored) {
        const parsed = JSON.parse(stored);

        setCartItems(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.error('Error cargando carrito, reseteando...', e);
      localStorage.removeItem('cart');
      setCartItems([]);
    }
  }, []);

  const updateCartState = (newItems) => {
    setCartItems(newItems);

    if (newItems.length === 0) {
      localStorage.removeItem('cart');
    } else {
      localStorage.setItem('cart', JSON.stringify(newItems));
    }
  };

  const changeQuantity = (productId, delta) => {
    const updated = cartItems.map((item) => {

      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);

        return { ...item, quantity: newQty };
      }

      return item;
    });

    updateCartState(updated);
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter((item) => item.productId !== productId);

    updateCartState(updated);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const processOrder = async () => {

    console.group('🔍 DIAGNÓSTICO DE AUTH');
    console.log('👤 Objeto User completo:', user);
    console.log('🆔 CustomerId esperado:', user?.customerId);
    console.log('🔐 Token en LocalStorage:', localStorage.getItem('token'));
    console.log('✅ IsAuthenticated:', isAuthenticated);
    console.groupEnd();

    console.log('🛒 CONTENIDO DEL CARRITO:', cartItems);

    try {

      if (!shippingAddress.trim() || !billingAddress.trim()) {
        alert('Por favor completa las direcciones de envío y facturación.');

        return;
      }

      setProcessingOrder(true);

      const orderPayload = {
        customerId: user?.customerId || user?.id || user?.sub,
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        notes: notes,
        items: cartItems.map((item) => ({

          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await createOrder(orderPayload);

      localStorage.removeItem('cart');
      setCartItems([]);

      alert('¡Pedido creado exitosamente!');
      navigate('/');
    } catch (error) {
      console.error('Error creando orden:', error);

      const msg = error.response?.data?.title || 'Error al procesar el pedido.';

      alert(`Error: ${msg}`);
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleFinalize = () => {
    if (!cartItems.length) return;

    if (!isAuthenticated) {
      setShowLoginModal(true);

      return;
    }

    processOrder();
  };

  const handleLoginSuccess = async () => {
    setShowLoginModal(false);

  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F5FB] font-sans text-gray-800">

      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
            <div className="font-bold text-2xl tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
              LOGO
            </div>
            <nav className="hidden md:flex gap-4 text-sm font-medium text-gray-500">
              <button onClick={() => navigate('/')} className="hover:text-black cursor-pointer px-3 py-1">
                Productos
              </button>
              <span className="text-black cursor-pointer bg-gray-100 px-3 py-1 rounded-md">
                Carrito de compras
              </span>
            </nav>
            <button className="md:hidden text-2xl">☰</button>
          </div>

        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">

            <div className="text-7xl mb-4 text-gray-300">🛒</div>
            <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
            <button onClick={() => navigate('/')} className="mt-2 bg-purple-600 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition">
              Volver al catálogo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

            <section className="flex-1 space-y-4">
              {cartItems.map((item) => {
                const subtotal = item.price * item.quantity;

                return (
                  <article key={item.productId} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4 flex flex-col gap-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                      <p className="text-xs text-gray-500">Sub Total: ${subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <button  onClick={() => changeQuantity(item.productId, -1)} className=" text-base w-8 h-8 border rounded">-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => changeQuantity(item.productId, 1)} className="text-base w-8 h-8 border rounded">+</button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-red-500 text-sm">Borrar</button>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="w-full lg:w-96 space-y-4">

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Datos de Envío</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Dirección de Envío</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Calle, número, ciudad..."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Dirección de Facturación</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Igual a envío..."
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Notas (Opcional)</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                      rows="2"
                      placeholder="Instrucciones especiales..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 lg:sticky lg:top-24 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Resumen</h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Cantidad total: <span className="font-semibold">{totalItems}</span></p>
                  <p>Total estimado: <span className="font-semibold text-lg text-black">${totalAmount.toFixed(2)}</span></p>
                </div>

                <button
                  onClick={handleFinalize}
                  disabled={processingOrder}
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-full transition disabled:opacity-60"
                >
                  {processingOrder ? 'Procesando...' : 'Confirmar Compra'}
                </button>
              </div>
            </aside>

          </div>
        )}
      </main>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="relative bg-white p-4 rounded-lg">
            <button onClick={handleCloseModal} className="absolute right-2 top-2 text-gray-500 hover:text-black">✕</button>
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;