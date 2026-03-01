'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        // Customize the login appearance
        appearance: {
          theme: 'light',
          accentColor: '#676FFF', // Change to your brand color
        },
        // Create embedded wallets for users who don't have one (The "Stealth Wallet")
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        // Restrict login methods to Email/SMS for easy tenant onboarding
        // or allow Metamask for "power users"
        loginMethods: ['email', 'sms'],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
