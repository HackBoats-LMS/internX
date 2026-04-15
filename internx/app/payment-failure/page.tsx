import Link from 'next/link'

export default function PaymentFailurePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-xl border border-gray-100 text-center">
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
        
        <h2 className="text-3xl font-bold mb-3 text-gray-900">Payment Failed</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          We couldn't process your payment. Please ensure your card details are correct or try a different payment method.
        </p>

        <Link 
          href="/payment"
          className="inline-block w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-lg hover:bg-black shadow-lg transition-all"
        >
          Try Again
        </Link>
      </div>
    </div>
  )
}
