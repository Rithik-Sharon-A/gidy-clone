import { useNavigate } from 'react-router-dom';

function Rewards() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center max-w-md">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Rewards</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your rewards page is coming soon!
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}

export default Rewards;
