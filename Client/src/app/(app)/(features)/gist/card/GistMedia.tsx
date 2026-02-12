"use client"

import { useTheme } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { useController } from "@/hooks/global";
import { MediaStyle, SingleMedia, MediaProps } from "@/components/media/SingleMedia";
import { GalleryProps, MediaGallery } from "@/components/media/MediaGallery";
import { useCallback, useMemo } from "react";


export const GistMedia = ({ mediaList, style }: GalleryProps) => {
    const theme = useTheme();
    const { openModal } = useController()

    const mediaStyle = useMemo(() => ({
        container: {
            base: { borderRadius: theme.radius[3] },
            smallScreen: { borderRadius: 0 },
            ...style?.container
        },
        content: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            ...style?.content
        },
    }), [theme.radius, style]);

    const handleMedia = useCallback((id?: string) => {
        if (!id) return;
        openModal({ content: <Typography>Media id: {id}</Typography> });
    }, [openModal]);

    const mappedList = useMemo(() => {
        return mediaList.map((media, index) => (
            {
                ...media,
                id: media.id || `${index}-${media.src}`,
                onClick: handleMedia
            }
        ))
    }, [mediaList, handleMedia]);

    const singleMedia = mappedList[0];

    return mediaList.length < 2 ? <SingleMedia {...singleMedia}
        style={{ container: mediaStyle.container }} /> : (
        <MediaGallery mediaList={mappedList} style={{ ...mediaStyle }} />
    )
}