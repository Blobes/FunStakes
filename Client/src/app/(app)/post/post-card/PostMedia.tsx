"use client"

import { useTheme } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { useController } from "@/hooks/global";
import { MediaStyle, SingleMedia, SingleMediaProps } from "@/components/media/SingleMedia";
import { MediaGallery } from "@/components/media/MediaGallery";
import { useCallback, useMemo } from "react";


interface PostMediaProps {
    mediaList: SingleMediaProps[];
    style?: MediaStyle
}
export const PostMedia = ({ mediaList, style }: PostMediaProps) => {
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
        return mediaList.map((item, index) => (
            {
                ...item,
                id: item.id || `${index}-${item.media.src}`,
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