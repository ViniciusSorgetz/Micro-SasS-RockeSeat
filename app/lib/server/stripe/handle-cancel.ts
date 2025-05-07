import { db } from "@/lib/firebase";
import "server-only";

import Stripe from "stripe";

export default async function handleCancelSubscription(
  event: Stripe.CustomerSubscriptionDeletedEvent
) {
  console.log(
    "Assinatura cancelada com sucesso. Enviar um e-mail de cancelamento de acesso."
  );

  const customerId = event.data.object.customer;

  const userRef = await db
    .collection("users")
    .where("stripeCustomer", "==", customerId)
    .get();

  if (userRef.empty) {
    throw new Error("User not found");
  }

  const userId = userRef.docs[0].id;

  db.collection("users").doc(userId).update({
    subscriptionStatus: "inactive",
  });
}
