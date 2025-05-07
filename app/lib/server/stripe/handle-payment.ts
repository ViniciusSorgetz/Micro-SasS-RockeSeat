import { db } from "@/lib/firebase";
import "server-only";

import Stripe from "stripe";

export default async function handleStripePayment(
  event: Stripe.CheckoutSessionCompletedEvent
) {
  if (event.data.object.payment_status === "paid") {
    console.log(
      "Pagamento realizado com sucesso. Enviar um e-mail de liberar acesso."
    );

    const metadata = event.data.object.metadata;

    const userId = metadata?.userId;

    if (!userId) {
      throw new Error("User not found");
    }

    await db.collection("users").doc(userId).update({
      stripeSubscriptionId: event.data.object.subscription,
      subscriptionStatus: "active",
    });
  }
}
