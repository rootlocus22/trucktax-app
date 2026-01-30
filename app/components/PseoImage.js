"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function PseoImage({ src, alt, className, fallbackSrc, priority = false }) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={className}
            onError={() => {
                if (fallbackSrc && imgSrc !== fallbackSrc) {
                    setImgSrc(fallbackSrc);
                }
            }}
            quality={85}
            loading={priority ? "eager" : "lazy"}
        />
    );
}
