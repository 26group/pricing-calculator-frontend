import { createClient, User } from '@workos-inc/authkit-js';
export { getClaims } from '@workos-inc/authkit-js';
import * as React from 'react';

type Client = Pick<Awaited<ReturnType<typeof createClient>>, "signIn" | "signUp" | "getUser" | "getAccessToken" | "signOut" | "switchToOrganization">;
type CreateClientOptions = NonNullable<Parameters<typeof createClient>[1]>;

interface Impersonator {
    email: string;
    reason: string | null;
}
interface State {
    isLoading: boolean;
    user: User | null;
    role: string | null;
    roles: string[] | null;
    organizationId: string | null;
    permissions: string[];
    featureFlags: string[];
    impersonator: Impersonator | null;
}

interface ContextValue extends Client, State {
}

declare function useAuth(): ContextValue;

interface AuthKitProviderProps extends CreateClientOptions {
    clientId: string;
    children: React.ReactNode;
}
declare function AuthKitProvider(props: AuthKitProviderProps): React.JSX.Element;

export { AuthKitProvider, type Impersonator, useAuth };
