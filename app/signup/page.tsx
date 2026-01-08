import SignupForm from "@/app/signup/signupForm";

export const metadata = {
  title: "Sign Up | Admin",
};

export default function SignupPage() {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-start justify-center bg-transparent px-4">
      <div className="flex flex-col items-left p-4 w-84 rounded-lg border border-[#e0e0e0] bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-lg mt-5 mb-18">
        <SignupForm />
      </div>
    </div>
  );
}

