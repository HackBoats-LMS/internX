import Link from 'next/link'

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-xl border border-gray-100 text-center">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        
        <h2 className="text-3xl font-bold mb-3 text-gray-900">Payment Successful!</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Welcome aboard! Your transaction was successful. We've sent a confirmation and your receipt to your email address. 
        </p>

        <Link 
          href="/dashboard"
          className="inline-block w-full py-3.5 rounded-xl bg-green-500 text-white font-semibold text-lg hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
