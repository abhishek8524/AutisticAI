import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LaunchScreen from './components/LaunchScreen';
import NonLoginMapView from './components/NonLoginMapView';
import LoggedInMapView from './components/LoggedInMapView';

function App() {
  const { isAuthenticated, isLoading } = useAuth0();
  const [showMap, setShowMap] = useState(false);

  const handleExploreMap = () => {
    setShowMap(true);
  };

  const handleBackToHome = () => {
    setShowMap(false);
  };

  if (!showMap) {
    return <LaunchScreen onExploreMap={handleExploreMap} />;
  }

  if (isAuthenticated) {
    return <LoggedInMapView onBackToHome={handleBackToHome} />;
  }

  if (!isLoading) {
    return <NonLoginMapView onExploreMap={handleExploreMap} />;
  }

  return null;
}

export default App;
