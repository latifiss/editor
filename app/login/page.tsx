import LoginForm from "@/app/login/loginForm";

export const metadata = {
  title: "Login | Admin",
};

export default function LoginPage() {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center bg-transparent px-4">
      <div className="flex flex-col items-left p-4 w-84 rounded-lg border border-[#e0e0e0] bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-lg mt-5 mb-18">
        <LoginForm />
      </div>
    </div>
  );
}
