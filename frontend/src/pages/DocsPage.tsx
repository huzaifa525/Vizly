import { Book, Database, FileCode, BarChart3, LayoutDashboard, CheckCircle2 } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const DocsPage = () => {
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
            <Book className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="heading-2">Documentation</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Learn how to use Vizly to analyze and visualize your data
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Getting Started */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-accent-600" />
            Getting Started
          </h2>
          <Card>
            <CardBody>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Vizly is a business intelligence platform that helps you connect to databases, write SQL queries,
                create visualizations, and build interactive dashboards. Follow these steps to get started:
              </p>
              <ol className="space-y-2 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li>Create a database connection</li>
                <li>Write and save SQL queries</li>
                <li>Create visualizations from your queries</li>
                <li>Build dashboards by combining visualizations</li>
              </ol>
            </CardBody>
          </Card>
        </section>

        {/* Database Connections */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-brand-600" />
            Database Connections
          </h2>
          <Card>
            <CardBody className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Creating a Connection</h3>
                <ol className="space-y-2 list-decimal list-inside text-gray-700 dark:text-gray-300 ml-4">
                  <li>Navigate to the <strong>Connections</strong> page from the sidebar</li>
                  <li>Click the <strong>Add Connection</strong> button</li>
                  <li>Fill in the connection details:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Connection Name:</strong> A friendly name for your connection</li>
                      <li><strong>Database Type:</strong> Choose from PostgreSQL, MySQL, or SQLite</li>
                      <li><strong>Host:</strong> The database server hostname or IP address (not required for SQLite)</li>
                      <li><strong>Port:</strong> The database port (default: 5432 for PostgreSQL, 3306 for MySQL)</li>
                      <li><strong>Username:</strong> Database username (not required for SQLite)</li>
                      <li><strong>Password:</strong> Database password (not required for SQLite)</li>
                      <li><strong>Database Name:</strong> The name of the database to connect to</li>
                      <li><strong>SSL:</strong> Enable SSL/TLS encryption (recommended for production)</li>
                    </ul>
                  </li>
                  <li>Click <strong>Create Connection</strong> to save</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Testing a Connection</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  After creating a connection, click the <strong>Test</strong> button on the connection card
                  to verify that Vizly can successfully connect to your database.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Badge variant="info" className="mb-2">Security Note</Badge>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All database passwords are encrypted using Fernet encryption before being stored.
                  Your credentials are kept secure and never exposed in plain text.
                </p>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* SQL Queries */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileCode className="h-5 w-5 text-brand-600" />
            SQL Queries
          </h2>
          <Card>
            <CardBody className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Writing Queries</h3>
                <ol className="space-y-2 list-decimal list-inside text-gray-700 dark:text-gray-300 ml-4">
                  <li>Navigate to the <strong>Queries</strong> page from the sidebar</li>
                  <li>Select a database connection from the dropdown in the query editor</li>
                  <li>Write your SQL query in the editor (syntax highlighting is provided)</li>
                  <li>Click <strong>Run Query</strong> to execute and see results</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Saving Queries</h3>
                <ol className="space-y-2 list-decimal list-inside text-gray-700 dark:text-gray-300 ml-4">
                  <li>After writing a query, click the <strong>Save</strong> button</li>
                  <li>Provide a descriptive name for your query</li>
                  <li>Optionally add a description to explain what the query does</li>
                  <li>Confirm the connection the query should run against</li>
                  <li>Click <strong>Save Query</strong> to save it for later use</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Managing Saved Queries</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Saved queries appear in the sidebar on the right side of the Queries page. For each saved query, you can:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>Run:</strong> Execute the query and load results into the editor</li>
                  <li><strong>Edit:</strong> Modify the query name, description, SQL, or connection</li>
                  <li><strong>Delete:</strong> Remove the query permanently</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Badge variant="warning" className="mb-2">Best Practice</Badge>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Save your frequently used queries with descriptive names. This makes it easy to reuse them
                  when creating visualizations and helps maintain consistency across your analytics.
                </p>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Visualizations */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-600" />
            Visualizations
          </h2>
          <Card>
            <CardBody className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Creating a Visualization</h3>
                <ol className="space-y-2 list-decimal list-inside text-gray-700 dark:text-gray-300 ml-4">
                  <li>Navigate to the <strong>Visualizations</strong> page from the sidebar</li>
                  <li>Click the <strong>Create Visualization</strong> button</li>
                  <li>Fill in the visualization details:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Name:</strong> A descriptive name for your visualization</li>
                      <li><strong>Chart Type:</strong> Select from various chart types (bar, line, pie, etc.)</li>
                      <li><strong>Query:</strong> Select a saved query that provides the data</li>
                      <li><strong>Configuration:</strong> Optional JSON configuration for advanced customization</li>
                    </ul>
                  </li>
                  <li>Click <strong>Create Visualization</strong> to save</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Available Chart Types</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Basic Charts:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <li>Table</li>
                      <li>Line Chart</li>
                      <li>Bar Chart</li>
                      <li>Pie Chart</li>
                      <li>Donut Chart</li>
                      <li>Area Chart</li>
                      <li>Scatter Plot</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Advanced Charts:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <li>Stacked/Grouped Bars</li>
                      <li>Bubble Chart</li>
                      <li>Heatmap</li>
                      <li>Treemap</li>
                      <li>Sunburst</li>
                      <li>Sankey Diagram</li>
                      <li>Funnel Chart</li>
                      <li>Radar Chart</li>
                      <li>Gauge</li>
                      <li>Candlestick</li>
                      <li>Box Plot</li>
                      <li>Waterfall</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Chart Configuration</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  The configuration field accepts JSON to customize your charts. Example configuration:
                </p>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl text-sm overflow-x-auto">
{`{
  "xAxis": "date",
  "yAxis": ["revenue", "profit"],
  "title": "Revenue vs Profit Over Time",
  "colors": ["#3B82F6", "#10B981"]
}`}
                </pre>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Viewing Visualizations</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Click the <strong>View</strong> button on any visualization card to see the rendered chart
                  with live data from the associated query. The visualization will open in a full-screen modal.
                </p>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Dashboards */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-brand-600" />
            Dashboards
          </h2>
          <Card>
            <CardBody className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Creating a Dashboard</h3>
                <ol className="space-y-2 list-decimal list-inside text-gray-700 dark:text-gray-300 ml-4">
                  <li>On the <strong>Dashboards</strong> page (home page), click <strong>Create Dashboard</strong></li>
                  <li>Enter a name for your dashboard</li>
                  <li>Optionally add a description</li>
                  <li>Choose visibility: Private (only you) or Public (shared with team)</li>
                  <li>Click <strong>Create Dashboard</strong> to save</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Adding Visualizations</h3>
                <ol className="space-y-2 list-decimal list-inside text-gray-700 dark:text-gray-300 ml-4">
                  <li>Click on a dashboard card to open the dashboard view</li>
                  <li>Click the <strong>Add Visualization</strong> button</li>
                  <li>Select one or more visualizations from the list</li>
                  <li>Click <strong>Add Selected</strong> to add them to the dashboard</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Arranging Dashboard Layout</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Dashboards use a responsive grid layout that you can customize:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>Drag:</strong> Click and hold the header of any visualization to drag it to a new position</li>
                  <li><strong>Resize:</strong> Drag the bottom-right corner of a visualization to resize it</li>
                  <li><strong>Remove:</strong> Click the trash icon on a visualization to remove it from the dashboard</li>
                  <li><strong>Refresh:</strong> Click the refresh icon to reload the data for a specific visualization</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  Layout changes are automatically saved as you make them.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Badge variant="success" className="mb-2">Pro Tip</Badge>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create multiple dashboards for different purposes: executive overview, sales metrics,
                  operational KPIs, etc. Use descriptive names and organize related visualizations together.
                </p>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Tips and Best Practices */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tips and Best Practices</h2>
          <Card>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent-600" />
                    Query Performance
                  </h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Use LIMIT clauses to restrict result sets when exploring data</li>
                    <li>Add appropriate WHERE conditions to filter data at the database level</li>
                    <li>Create indexes on frequently queried columns in your database</li>
                    <li>Avoid SELECT * in production queries; specify only needed columns</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent-600" />
                    Data Visualization
                  </h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Choose the right chart type for your data (trends = line, comparisons = bar, parts of whole = pie)</li>
                    <li>Use clear, descriptive names for queries and visualizations</li>
                    <li>Keep visualizations focused on a single insight or metric</li>
                    <li>Use consistent color schemes across related visualizations</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent-600" />
                    Dashboard Design
                  </h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Place the most important metrics at the top of your dashboard</li>
                    <li>Group related visualizations together</li>
                    <li>Don't overcrowd dashboards; create multiple focused dashboards instead</li>
                    <li>Test dashboards on different screen sizes to ensure readability</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent-600" />
                    Security
                  </h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Use read-only database users when possible</li>
                    <li>Enable SSL/TLS for database connections in production</li>
                    <li>Regularly review and update connection credentials</li>
                    <li>Set dashboards to Private unless they need to be shared</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Support */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Need Help?</h2>
          <Card>
            <CardBody>
              <p className="text-gray-700 dark:text-gray-300">
                If you encounter any issues or have questions about using Vizly, please contact your
                system administrator or refer to your organization's internal support channels.
              </p>
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default DocsPage;
