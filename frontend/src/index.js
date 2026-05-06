import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderNotificationProvider } from './context/OrderNotificationContext';
import App from './App';
import './styles.css';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <OrderNotificationProvider>
          <Router>
          <App />
          <ToastContainer
            position="top-center"
            autoClose={1500}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick={true}
            rtl={false}
            pauseOnFocusLoss={true}
            draggable={false}
            pauseOnHover={true}
            theme="light"
            closeButton={true}
            toastClassName="custom-toast"
            bodyClassName="custom-toast-body"
            progressClassName="custom-progress"
            limit={1}
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'auto',
              maxWidth: '600px',
            }}
          />
          <style>{`
            /* Custom Toast Styling */
            .Toastify__toast-container {
              width: auto;
              max-width: 600px;
              padding: 0;
            }

            .Toastify__toast {
              background: #FFE4E1;
              border: 2px solid #F06292;
              border-radius: 20px;
              padding: 32px 40px;
              box-shadow: 0 12px 32px rgba(240, 98, 146, 0.35);
              font-family: 'Poppins', sans-serif;
              margin-bottom: 16px;
              min-height: 80px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: relative;
            }

            .Toastify__toast--success {
              background: #FFE4E1;
              border: 2px solid #F06292;
            }

            .Toastify__toast--error {
              background: #FFE4E1;
              border: 2px solid #F06292;
            }

            .Toastify__toast--info {
              background: #FFE4E1;
              border: 2px solid #F06292;
            }

            .Toastify__toast--warning {
              background: #FFE4E1;
              border: 2px solid #F06292;
            }

            .Toastify__toast-body {
              color: #F06292;
              font-weight: 700;
              font-size: 1.2rem;
              padding: 0;
              line-height: 1.6;
              text-align: center;
              flex: 1;
              margin-right: 16px;
            }

            .Toastify__progress-bar {
              background: linear-gradient(90deg, #F06292 0%, #EC407A 100%);
              height: 4px;
              border-radius: 0 0 18px 18px;
            }

            /* Remove custom animations that might interfere */
            .custom-toast {
              /* Let react-toastify handle the animations */
            }

            .Toastify__close-button {
              color: #F06292 !important;
              opacity: 1 !important;
              font-size: 1.4rem !important;
              font-weight: bold !important;
              line-height: 1 !important;
              padding: 0 !important;
              min-width: auto !important;
              height: auto !important;
              display: block !important;
              cursor: pointer !important;
              transition: all 0.3s ease !important;
              background: transparent !important;
              border: none !important;
              flex-shrink: 0 !important;
              pointer-events: auto !important;
            }

            .Toastify__close-button:hover {
              opacity: 0.7 !important;
              transform: scale(1.2) !important;
            }

            /* Show the default SVG */
            .Toastify__close-button > svg {
              display: block !important;
              width: 20px !important;
              height: 20px !important;
            }

            /* Hide the icon */
            .Toastify__toast-icon {
              display: none;
            }

            /* Let react-toastify handle animations natively */

            @media (max-width: 768px) {
              .Toastify__toast-container {
                max-width: calc(100vw - 40px);
              }

              .Toastify__toast {
                padding: 28px 32px;
                min-height: 70px;
              }

              .Toastify__toast-body {
                font-size: 1.1rem;
                margin-right: 12px;
              }

              .Toastify__close-button {
                font-size: 1.6rem !important;
                min-width: 26px !important;
                height: 26px !important;
                top: 10px !important;
                right: 10px !important;
              }

              .Toastify__close-button:after {
                font-size: 1.4rem !important;
              }
            }

            @media (max-width: 480px) {
              .Toastify__toast-container {
                max-width: calc(100vw - 30px);
              }

              .Toastify__toast {
                padding: 24px 28px;
                min-height: 60px;
              }

              .Toastify__toast-body {
                font-size: 1rem;
                margin-right: 8px;
              }

              .Toastify__close-button {
                font-size: 1.4rem !important;
                min-width: 24px !important;
                height: 24px !important;
                top: 8px !important;
                right: 8px !important;
              }

              .Toastify__close-button:after {
                font-size: 1.2rem !important;
              }
            }
          `}</style>
        </Router>
        </OrderNotificationProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
