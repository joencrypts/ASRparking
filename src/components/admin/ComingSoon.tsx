import React from 'react';
import { Zap, CreditCard, Wrench } from 'lucide-react';

interface ComingSoonProps {
  feature: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ feature }) => {
  const getIcon = () => {
    switch (feature) {
      case 'EV Charging Stations':
        return <Zap className="w-16 h-16 text-orange-500" />;
      case 'Subscriptions':
        return <CreditCard className="w-16 h-16 text-blue-500" />;
      default:
        return <Wrench className="w-16 h-16 text-gray-500" />;
    }
  };

  const getDescription = () => {
    switch (feature) {
      case 'EV Charging Stations':
        return 'Manage electric vehicle charging stations, monitor usage, and handle billing for EV charging services.';
      case 'Subscriptions':
        return 'Offer monthly and yearly parking subscriptions with automated billing and member management.';
      default:
        return 'This feature is currently under development and will be available soon.';
    }
  };

  const getFeatures = () => {
    switch (feature) {
      case 'EV Charging Stations':
        return [
          'Real-time charging station monitoring',
          'Usage analytics and reporting',
          'Automated billing for charging sessions',
          'Station maintenance scheduling',
          'Mobile app integration'
        ];
      case 'Subscriptions':
        return [
          'Monthly and yearly subscription plans',
          'Automated recurring billing',
          'Member dashboard and benefits',
          'Priority parking allocation',
          'Subscription analytics'
        ];
      default:
        return [
          'Advanced features',
          'Enhanced functionality',
          'Improved user experience',
          'Better performance',
          'Additional integrations'
        ];
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-16 px-6">
          {getIcon()}
          
          <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-4">
            {feature}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {getDescription()}
          </p>
          
          <div className="inline-flex items-center px-6 py-3 bg-orange-100 text-orange-800 rounded-full font-medium">
            🚧 Coming Soon
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Planned Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {getFeatures().map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">✓</span>
                </div>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-6 bg-gray-50 text-center">
          <p className="text-gray-600">
            Stay tuned for updates! This feature is actively being developed and will be available in a future release.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;