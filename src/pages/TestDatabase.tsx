import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestDatabase = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      addLog('Testing database connection...');

      // Test basic connection
      const { data, error } = await supabase
        .from('orders')
        .select('count')
        .limit(1);

      if (error) {
        addLog(`❌ Database error: ${error.message}`);
        addLog(`Error details: ${JSON.stringify(error)}`);
      } else {
        addLog('✅ Database connection successful');
      }

      // Test if orders table exists
      addLog('Testing orders table...');
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);

      if (ordersError) {
        addLog(`❌ Orders table error: ${ordersError.message}`);
      } else {
        addLog(`✅ Orders table exists, found ${ordersData?.length || 0} orders`);
      }

      // Test cart_items table
      addLog('Testing cart_items table...');
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .limit(1);

      if (cartError) {
        addLog(`❌ Cart items table error: ${cartError.message}`);
      } else {
        addLog(`✅ Cart items table exists, found ${cartData?.length || 0} items`);
      }

    } catch (error) {
      addLog(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Database Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testDatabaseConnection}
              disabled={loading}
              className="btn-blvck"
            >
              {loading ? 'Testing...' : 'Test Database Connection'}
            </Button>

            {testResults.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Test Results:</h3>
                <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono mb-1">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestDatabase;