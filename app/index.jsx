import { Redirect } from 'expo-router';
import { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';

export default function Index() {
  const { isSessionLoaded, session } = useContext(SessionContext);

  if (!isSessionLoaded) {
    return null; 
  }

  if (session?.id) {
    return <Redirect href="/components/Home"/>;
  }

  return <Redirect href="Login"/>;
}

