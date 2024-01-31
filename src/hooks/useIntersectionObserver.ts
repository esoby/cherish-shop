import { useCallback, useEffect, useRef, useState } from "react";

export const useIntersectionObserver = (
  isFetchingNextPage: boolean,
  hasNextPage: boolean | undefined,
  fetchNextPage: () => void
) => {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    setNode(node);
  }, []);

  // node 값 변경 시마다 옵저버 설정
  useEffect(() => {
    if (isFetchingNextPage) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    if (node) observer.current.observe(node);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [node, isFetchingNextPage, hasNextPage, fetchNextPage]);

  return lastElementRef;
};
