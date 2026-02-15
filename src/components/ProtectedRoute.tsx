import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from './SessionProvider';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session, loading, isAdmin } = useSession();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !session) {
            navigate('/login');
        } else if (!loading && session && !isAdmin) {
            navigate('/');
        }
    }, [session, loading, isAdmin, navigate]);

    if (loading || !session || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-brand-pinkLight border-t-brand-pink rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
