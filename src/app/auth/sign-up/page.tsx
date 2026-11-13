import Navbar from "../../components/Navbar";
import AuthForm from "../AuthForm";

export default function SignUpPage() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl justify-center px-5 py-12 sm:px-8 sm:py-16">
        <AuthForm mode="sign-up" />
      </main>
    </div>
  );
}
