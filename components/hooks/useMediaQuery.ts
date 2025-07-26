
import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
        
        // Swith to the new addEventListener/removeEventListener syntax
        mediaQueryList.addEventListener('change', listener);
        
        // Clean up the listener on component unmount
        return () => mediaQueryList.removeEventListener('change', listener);
    }, [query]);

    return matches;
};