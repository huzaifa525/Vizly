const DashboardPage = () => {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-96 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Vizly
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your self-hosted business intelligence platform
          </p>
          <div className="space-x-4">
            <a href="/connections" className="btn-primary">
              Connect a Database
            </a>
            <a href="/queries" className="btn-secondary">
              Create a Query
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
