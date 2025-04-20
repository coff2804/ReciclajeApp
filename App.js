import React, { useEffect, useState } from 'react';
import { auth, database } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snapshot = await get(ref(database, `usuarios/${user.uid}`));
          const datos = snapshot.val();
          if (datos?.rol) {
            setUserRole(datos.rol);
          } else {
            setUserRole('sin-rol');
          }
        } catch (error) {
          console.error('Error al obtener rol:', error);
          setUserRole('sin-rol');
        }
      } else {
        setUserRole(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return <AppNavigator userRole={isLoading ? null : userRole} />;
}
