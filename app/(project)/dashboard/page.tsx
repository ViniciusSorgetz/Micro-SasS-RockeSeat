import { handleAuth } from "@/actions/handleAuth";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  // Só é possível fazer um await no lado do servidor
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-5 items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Protected Dashboard</h1>
      <p>
        {session?.user?.email ? session?.user?.email : "Usuário não logado."}
      </p>
      {session?.user?.email && (
        <form action={handleAuth}>
          <button
            type="submit"
            className="border rounded-md px-4 p-2 cursor-pointer"
          >
            Logout
          </button>
        </form>
      )}
      <Link href="/pagamentos" className="border rounded-md px-4 p-2">
        Pagamentos
      </Link>
    </div>
  );
}
