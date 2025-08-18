import { useState, useEffect, useRef } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import { type PluginListenerHandle } from '@capacitor/core';

export const useFormLogic = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [isError, setIsError] = useState<boolean>(false);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const keyboardListeners = useRef<PluginListenerHandle[]>([]);

    useEffect(() => {
        const setupKeyboardListeners = async () => {
            const showKeyboardListener = await Keyboard.addListener('keyboardWillShow', () => {
                setIsKeyboardOpen(true);
            });
            const hideKeyboardListener = await Keyboard.addListener('keyboardWillHide', () => {
                setIsKeyboardOpen(false);
            });
            keyboardListeners.current = [showKeyboardListener, hideKeyboardListener];
        };

        setupKeyboardListeners();

        return () => {
            keyboardListeners.current.forEach(listener => listener.remove());
        };
    }, []);

    const showMessage = (message: string, isError: boolean = false) => {
        setToastMessage(message);
        setIsError(isError);
        setShowToast(true);
    };

    return {
        loading,
        setLoading,
        showToast,
        setShowToast,
        toastMessage,
        isError,
        isKeyboardOpen,
        showMessage
    };
};