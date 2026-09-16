import React, { createContext, useContext, useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'alert' | 'success';
}

interface SignalRContextType {
  toasts: NotificationToast[];
  removeToast: (id: string) => void;
  connection: signalR.HubConnection | null;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    const hubConn = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/orders', {
        accessTokenFactory: () => user?.token || '',
      })
      .withAutomaticReconnect()
      .build();

    hubConn.start()
      .then(() => {
        setConnection(hubConn);
        if (user) {
          hubConn.invoke('JoinCustomerGroup', user.userID.toString()).catch(() => {});
          if (user.role === 'Merchant') {
            hubConn.invoke('JoinMerchantGroup', user.userID.toString()).catch(() => {});
          }
        }
      })
      .catch((err) => console.log('SignalR connection error (reconnecting automatically):', err));

    hubConn.on('OrderStatusChanged', (data: { orderId: number; newStatus: string }) => {
      addToast({
        id: Math.random().toString(),
        title: `Order #${data.orderId} Updated`,
        message: `Status is now: ${data.newStatus}`,
        type: 'order',
      });
    });

    hubConn.on('OrderStatusNotification', (data: { orderId: number; newStatus: string }) => {
      addToast({
        id: Math.random().toString(),
        title: `Order #${data.orderId} Notification`,
        message: `Your package status is now ${data.newStatus}!`,
        type: 'success',
      });
    });

    hubConn.on('LowStockAlert', (data: { productId: number; productName: string; currentStock: number }) => {
      addToast({
        id: Math.random().toString(),
        title: '⚠️ Low Stock Alert',
        message: `Product "${data.productName}" only has ${data.currentStock} units remaining!`,
        type: 'alert',
      });
    });

    return () => {
      hubConn.stop().catch(() => {});
    };
  }, [user]);

  const addToast = (toast: NotificationToast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      removeToast(toast.id);
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <SignalRContext.Provider value={{ toasts, removeToast, connection }}>
      {children}
      {/* Real-time Toast Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              t.type === 'alert'
                ? 'bg-amber-500/90 text-white border-amber-600'
                : t.type === 'order'
                ? 'bg-indigo-600/95 text-white border-indigo-700'
                : 'bg-emerald-600/95 text-white border-emerald-700'
            }`}
          >
            <div>
              <p className="font-bold text-sm tracking-wide">{t.title}</p>
              <p className="text-xs mt-1 text-slate-100">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-3 text-white/80 hover:text-white text-sm font-semibold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const ctx = useContext(SignalRContext);
  if (!ctx) throw new Error('useSignalR must be used within a SignalRProvider');
  return ctx;
};
