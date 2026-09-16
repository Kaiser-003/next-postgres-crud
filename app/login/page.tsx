// import Link from "next/link";

// export default function LoginPage() {
//   return (
//     <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
//       <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
//         {/* Header */}
//         <div className="mb-8 text-center">
//           <h1 className="text-3xl font-bold text-slate-900">
//             Welcome Back
//           </h1>

//           <p className="mt-2 text-sm text-slate-500">
//             Login to your account
//           </p>
//         </div>

        
//         <form className="space-y-5">
//           {/* Email */}
//           <div>
//             <label
//               htmlFor="email"
//               className="mb-2 block text-sm font-medium text-slate-700"
//             >
//               Email Address
//             </label>

//             <input
//               id="email"
//               name="email"
//               type="email"
//               placeholder="Enter your email"
//               className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <label
//               htmlFor="password"
//               className="mb-2 block text-sm font-medium text-slate-700"
//             >
//               Password
//             </label>

//             <input
//               id="password"
//               name="password"
//               type="password"
//               placeholder="Enter your password"
//               className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//             />
//           </div>

//           {/* Forgot Password */}
//           <div className="flex justify-end">
//             <Link
//               href="#"
//               className="text-sm font-medium text-blue-600 hover:text-blue-700"
//             >
//               Forgot Password?
//             </Link>
//           </div>

//           {/* Login Button */}
//           <button
//             type="submit"
//             className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
//           >
//             Login
//           </button>
//         </form>

//         {/* Registration Link */}
//         <p className="mt-6 text-center text-sm text-slate-500">
//           Don't have an account?{" "}
//           <Link
//             href="/register"
//             className="font-semibold text-blue-600 hover:text-blue-700"
//           >
//             Register
//           </Link>
//         </p>
//       </div>
//     </main>
//   );
// }

import Link from "next/link";

export default function LoginPage() {
  return (
    <main className = "flex items-center justify-center bg-slate-100 min-h-screen px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className ="text-center mb-8 ">
          <h1 className="text-3xl font-bold text-blue-600">Welcome Back</h1>
        <p className="text-sm mt-2 text-orange-500">Login to your account</p>
        </div>

        <form className="space-y-5">
          <label 
          htmlFor="email"
          className="block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm  transition focus:border-blue-500 text-slate-900"
          />

           <label 
          htmlFor="password"
          className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm  transition focus:border-blue-500 text-slate-900"
          />

          <div className="flex justify-end">
            <Link href="#"
            className="text-sm font-medium  text-blue-600 hover:text-blue-700">
              Forgot Password?
            </Link>
          </div>

          <button className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700">
            Login
          </button>

        </form>

        <p className = "m-6 text-center text-sm text-slate-500">
          Dont have an account?{""}
         
         <Link
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Register
          </Link>
          </p>
      </div>
    </main>
  )
}