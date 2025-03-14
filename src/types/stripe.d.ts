
// Type definitions for Stripe.js
interface StripeCheckoutOptions {
  lineItems: Array<{
    price: string;
    quantity: number;
  }>;
  mode: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
}

interface StripeCheckoutResult {
  error?: {
    message: string;
  };
}

interface Stripe {
  redirectToCheckout(options: StripeCheckoutOptions): Promise<StripeCheckoutResult>;
}

interface Window {
  Stripe: (apiKey: string) => Stripe;
}
