import React, { useEffect, useRef } from 'react';
import { useLoginGoogleMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function GoogleAuthButton({ text = 'signin_with' }: { text?: 'signin_with' | 'signup_with' | 'continue_with' }) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [loginGoogle] = useLoginGoogleMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const handleGoogleResponse = async (response: any) => {
        try {
            const result = await loginGoogle({ token: response.credential }).unwrap();
            dispatch(setCredentials({ user: result.user, token: result.token }));
            toast.success(result.message || t('auth.login_success'));
            navigate('/');
        } catch (err: any) {
            toast.error(err.data?.message || t('auth.google_login_failed'));
        }
    };

    useEffect(() => {
        // Robust language detection
        const currentLang = i18n.language || 'en';
        // Check if language starts with 'ar' to handle cases like 'ar-EG'
        const langCode = currentLang.startsWith('ar') ? 'ar' : 'en';

        const scriptUrl = `https://accounts.google.com/gsi/client?hl=${langCode}`;
        const scriptId = 'google-gsi-script';

        const style = 'outline'; // Force outline theme

        const initializeGoogleBtn = () => {
            // @ts-ignore
            if (!window.google || !buttonRef.current) return;

            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
            if (!clientId) {
                console.error("Google Client ID is missing");
                return;
            }

            // Cleanup previous button iframe if any to prevent duplicates
            buttonRef.current.innerHTML = '';

            try {
                // @ts-ignore
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    use_fedcm_tap: true,
                    ux_mode: 'popup',
                    context: text === 'signup_with' ? 'signup' : 'signin',
                });

                const parentWidth = buttonRef.current.parentElement?.offsetWidth || 400;
                const btnWidth = Math.min(Math.max(parentWidth, 200), 400);

                // @ts-ignore
                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: style,
                    size: 'large',
                    width: btnWidth,
                    text: text,
                    shape: 'pill',
                    logo_alignment: 'left',
                    locale: langCode // Explicitly pass locale
                });
            } catch (error) {
                console.error("Google Sign-In initialization error:", error);
            }
        };

        const loadScript = () => {
            // Remove any existing script first to be safe
            const oldScript = document.getElementById(scriptId);
            if (oldScript) oldScript.remove();

            const script = document.createElement('script');
            script.src = scriptUrl;
            script.id = scriptId;
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleBtn;
            document.head.appendChild(script);
        };

        const checkAndLoad = () => {
            const existingScript = document.getElementById(scriptId) as HTMLScriptElement;

            if (existingScript) {
                // If script exists but language doesn't match
                if (existingScript.src !== scriptUrl) {
                    existingScript.remove();
                    // @ts-ignore
                    window.google = undefined; // Force clear
                    loadScript();
                } else {
                    // Script matches, checks if loaded
                    // @ts-ignore
                    if (window.google) {
                        initializeGoogleBtn();
                    } else {
                        existingScript.onload = initializeGoogleBtn;
                    }
                }
            } else {
                // No known script found, verify if rogue script exists
                const rogueScript = document.querySelector('script[src^="https://accounts.google.com/gsi/client"]');
                if (rogueScript && rogueScript.id !== scriptId) rogueScript.remove();

                loadScript();
            }
        };

        checkAndLoad();

        return () => {
            const script = document.getElementById(scriptId);
            if (script) {
                script.removeEventListener('load', initializeGoogleBtn);
            }
        };
    }, [i18n.language, text]);

    return (
        <div className="w-full flex justify-center">
            <div ref={buttonRef} className="w-full h-auto min-h-[44px] flex justify-center"></div>
        </div>
    );
}
