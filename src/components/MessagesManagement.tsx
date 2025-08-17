import { useState } from 'react';
import { useContactMessages } from '@/hooks/useContactMessages';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const MessagesManagement = () => {
  const { messages, loading, error, fetchMessages, markAsRead } = useContactMessages();
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRefresh = () => {
    fetchMessages();
  };

  const handleMarkAsRead = async (id: string) => {
    setIsUpdating(true);
    await markAsRead(id);
    setIsUpdating(false);
  };

  const selectedMessageData = messages.find(msg => msg.id === selectedMessage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
          <p className="text-gray-600">Manage customer inquiries and messages</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-500">
          {error}
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <Mail className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No messages yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium">Messages ({messages.length})</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`p-4 cursor-pointer transition-colors ${selectedMessage === message.id ? 'bg-gray-50' : 'hover:bg-gray-50'} ${!message.read ? 'border-l-4 border-blue-500' : ''}`}
                  onClick={() => setSelectedMessage(message.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium truncate">{message.name}</h4>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{message.subject}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{message.email}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
            {selectedMessageData ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{selectedMessageData.subject}</h3>
                    <p className="text-sm text-gray-500">
                      From: {selectedMessageData.name} ({selectedMessageData.email})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!selectedMessageData.read && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMarkAsRead(selectedMessageData.id)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                  <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                    {selectedMessageData.message}
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Received: {new Date(selectedMessageData.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center">
                <div>
                  <Mail className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Select a message to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};