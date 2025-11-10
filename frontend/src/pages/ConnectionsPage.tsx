const ConnectionsPage = () => {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Database Connections
        </h1>
        <button className="btn-primary">
          Add Connection
        </button>
      </div>

      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          No database connections yet. Add your first connection to get started.
        </p>
      </div>
    </div>
  );
};

export default ConnectionsPage;
