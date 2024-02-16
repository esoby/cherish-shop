import React, { useEffect, useRef, useState } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && imgRef.current) {
          const image = new Image();
          image.src = imgRef.current.dataset.src!;
          image.onload = () => {
            if (imgRef.current) {
              imgRef.current.src = imgRef.current.dataset.src!;
              setIsLoaded(true);
            }
          };
          observer.unobserve(imgRef.current);
        }
      });
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    // 이미 뷰포트에 있는 이미지를 로드
    const image = new Image();
    image.src = src;
    image.onload = () => {
      if (imgRef.current) {
        imgRef.current.src = src;
        setIsLoaded(true);
      }
    };

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <img
      data-src={src}
      ref={imgRef}
      style={!isLoaded ? { display: "none" } : {}}
      alt={alt}
      {...props}
    />
  );
};

export default LazyImage;
