import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const loading = emailLoading || googleLoading;

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailLoading(true);
        setError(null);
        setMessage(null);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            }
        } catch (error: any) {
            setError(error.error_description || error.message);
        } finally {
            setEmailLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            setError(error.message);
            setGoogleLoading(false);
        }
        // On success, Supabase handles the redirect, so the page will navigate away.
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-[#18191A] flex flex-col items-center justify-center p-4">
            <img
                src="https://i.postimg.cc/c4yPXcZC/logo-1.png"
                alt="App Logo"
                className="h-16 mb-8"
            />
            <div className="w-full max-w-sm bg-white dark:bg-[#242526] rounded-lg shadow-xl p-8">
                <h2 className="text-2xl font-bold text-center text-neutral-800 dark:text-neutral-100 mb-6">
                    {isLogin ? 'Welcome Back' : 'Create an Account'}
                </h2>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 border-2 border-transparent focus:ring-2 focus:ring-accent focus:outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 border-2 border-transparent focus:ring-2 focus:ring-accent focus:outline-none"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {message && <p className="text-sm text-green-500">{message}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-accent-text-over bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
                        >
                            {emailLoading ? (
                                <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                                isLogin ? 'Sign In' : 'Sign Up'
                            )}
                        </button>
                    </div>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white dark:bg-[#242526] px-2 text-neutral-500 dark:text-neutral-400">
                            OR
                        </span>
                    </div>
                </div>

                <div>
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center py-2 px-4 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-[#3A3B3C] hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
                    >
                        {googleLoading ? (
                             <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                            <>
                                <i className="fa-brands fa-google mr-3 text-lg"></i>
                                Continue with Google
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => { 
                            if(loading) return;
                            setIsLogin(!isLogin); 
                            setError(null); 
                            setMessage(null); 
                        }} 
                        className="text-sm font-medium text-accent hover:underline disabled:opacity-50"
                        disabled={loading}
                    >
                        {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
