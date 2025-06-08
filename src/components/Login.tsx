const Login: React.FC = () => {
  // ... existing state and handlers ...

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20">
            <img src="/logo.png" alt="ASR Parking Logo" className="w-full h-full object-contain" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          ASR Parking
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      {/* Rest of the component remains the same */}
      // ... existing code ...
    </div>
  );
};

export default Login; 