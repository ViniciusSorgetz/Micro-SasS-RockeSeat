"use client";

import { useStripe } from "@/hooks/useStripe";

export default function Pagamentos() {
  const {
    createPaymentStripeCheckout,
    createSubscriptionStripeCheckout,
    handleCreateStripePortal,
  } = useStripe();

  return (
    <div className="flex flex-col gap-5 items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Pagamentos</h1>
      <button
        className="border rounded-md px-4 p-2 cursor-pointer"
        onClick={() => createPaymentStripeCheckout({ testId: "123" })}
      >
        Criar Pagamento Stripe
      </button>
      <button
        className="border rounded-md px-4 p-2 cursor-pointer"
        onClick={() => createSubscriptionStripeCheckout({ testId: "123" })}
      >
        Criar Assinatura Stripe
      </button>
      <button
        className="border rounded-md px-4 p-2 cursor-pointer"
        onClick={handleCreateStripePortal}
      >
        Criar Portal de Pagamentos Stripe
      </button>
    </div>
  );
}
