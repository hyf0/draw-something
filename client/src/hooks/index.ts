import { useEffect, useRef } from 'react';

export function useDocumentTitle(title: string) {
  const prevTitleRef = useRef('');
  useEffect(() => {
    prevTitleRef.current = document.title;
    document.title = title;
    return () => {
      document.title = prevTitleRef.current;
    }
  }, [title]);
}
