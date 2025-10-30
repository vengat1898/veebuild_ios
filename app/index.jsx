// index.jsx
import { Redirect } from 'expo-router';
import { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';

export default function Index() {
  const { isSessionLoaded, session } = useContext(SessionContext);

  if (!isSessionLoaded) {
    return null; 
  }
  
  console.log('Session details:', session);
  
  // Check if user is properly logged in (not a guest)
  const isProperlyLoggedIn = session?.id && 
                            session?.id !== 'guest_user' && 
                            session?.mobile && 
                            session?.mobile !== '' && 
                            session?.type !== 'guest';

  console.log('Is properly logged in:', isProperlyLoggedIn);
  
  if (isProperlyLoggedIn) {
    return <Redirect href="/components/Home"/>;
  }

  return <Redirect href="/Login"/>;
}