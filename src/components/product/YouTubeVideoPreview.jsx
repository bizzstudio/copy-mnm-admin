// src/components/product/YouTubeVideoPreview.jsx
import React, { useMemo } from "react";
import { t } from "i18next";

const YouTubeVideoPreview = ({ url }) => {
    // פונקציה לחילוץ ID מה-URL של יוטיוב
    const getYouTubeId = (url) => {
        if (!url) return null;

        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    };

    const videoId = useMemo(() => getYouTubeId(url), [url]);

    if (!url || !videoId) {
        return (
            <div className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("YouTubeVideoUrlPlaceholder")}
                </p>
            </div>
        );
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return (
        <div className="w-full">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-md"
                    src={embedUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                    {url}
                </a>
            </div>
        </div>
    );
};

export default YouTubeVideoPreview;
