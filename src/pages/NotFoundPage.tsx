import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 text-center">
      <div className="max-w-md space-y-4">
        <div className="inline-flex p-4 rounded-3xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 mb-2">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">404</h1>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Page Not Found</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          The route you are trying to access does not exist or has been moved.
        </p>
        <div className="pt-4">
          <Button variant="primary" size="md" onClick={() => navigate('/dashboard')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
