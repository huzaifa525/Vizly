const VisualizationsPage = () => {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Visualizations
        </h1>
        <button className="btn-primary">
          Create Visualization
        </button>
      </div>

      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          No visualizations yet. Create charts and graphs from your query results.
        </p>
      </div>
    </div>
  );
};

export default VisualizationsPage;
