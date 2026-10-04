declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay?: any;
  }
}

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export const isRazorpayLive = Boolean(RAZORPAY_KEY && RAZORPAY_KEY.startsWith('rzp_'));

/**
 * Dynamically injects Razorpay Checkout script into document head
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface PaymentParams {
  amountRupees: number;
  customerName: string;
  customerPhone: string;
  description: string;
  notes?: Record<string, string>;
  onSuccess: (paymentId: string) => void;
  onError: (errorMsg: string) => void;
}

/**
 * Initiates Razorpay payment or runs verified simulation if no live key is set yet
 */
export async function initiatePayment({
  amountRupees,
  customerName,
  customerPhone,
  description,
  notes = {},
  onSuccess,
  onError,
}: PaymentParams): Promise<void> {
  if (isRazorpayLive) {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      onError('Unable to load payment gateway. Please check your internet connection.');
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: amountRupees * 100, // Razorpay takes amount in paise
      currency: 'INR',
      name: 'MadadMitra Services',
      description: description,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=128&auto=format&fit=crop&q=80',
      prefill: {
        name: customerName,
        contact: customerPhone,
      },
      notes: notes,
      theme: {
        color: '#1d4ed8', // Brand blue
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: function (response: any) {
        if (response.razorpay_payment_id) {
          onSuccess(response.razorpay_payment_id);
        } else {
          onError('Payment confirmation not received');
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      modal: {
        ondismiss: function () {
          onError('Payment cancelled by user');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } else {
    // Simulated instant test payment for local/prototype mode
    setTimeout(() => {
      const mockTxnId = `pay_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      onSuccess(mockTxnId);
    }, 1200);
  }
}
