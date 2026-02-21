'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/app/store';
import { initializeAuth } from '@/store/features/auth/authSlice';

const Page = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, isInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Initialize auth from localStorage on mount
    dispatch(initializeAuth());
    setIsReady(true);
  }, [dispatch]);

  useEffect(() => {
    // Redirect after auth is initialized
    if (isReady && isInitialized) {
      if (isAuthenticated) {
        router.push('/ghanapolitan/articles');
      } else {
        router.push('/login');
      }
    }
  }, [isReady, isAuthenticated, isInitialized, router]);

  // Show nothing while redirecting
  return <div />;
};

export default Page;