import "server-only";
import { db } from "@/lib/firebase";
import stripe from "@/lib/stripe";

export default async function getOrCreateCustomer(
  userId: string,
  userEmail: string
) {
  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (stripeCustomerId) {
      return stripeCustomerId;
    }

    const stripeCustomer = await stripe.customers.create({
      email: userEmail,
      name: userDoc?.data()?.name,
      metadata: {
        userId,
      },
    });

    await userRef.update({
      stripeCustomer: stripeCustomer.id,
    });

    return stripeCustomer.id;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get or create customer");
  }
}
