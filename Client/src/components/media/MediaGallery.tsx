import { useMemo } from 'react';
import { Box, ImageList, ImageListItem, Typography } from '@mui/material';
import { MediaStyle, SingleMediaProps } from './SingleMedia';
import { useTheme } from "@mui/material/styles";
import { useStyles } from '@/hooks/style';


interface MediaGalleryProps {
    mediaList: SingleMediaProps[];
    style?: MediaStyle
}

export const MediaGallery = ({ mediaList, style }: MediaGalleryProps) => {
    const theme = useTheme();
    const { applyBGOverlay: applyOverlay } = useStyles();

    // 1. Define patterns to ensure the 4-column grid is always full
    const LAYOUT_PATTERNS: Record<number, { cols: number; rows: number }[]> = {
        1: [{ cols: 4, rows: 2 }],
        2: [{ cols: 2, rows: 2 }, { cols: 2, rows: 2 }],
        3: [{ cols: 4, rows: 2 }, { cols: 2, rows: 1 }, { cols: 2, rows: 1 }],
        4: [{ cols: 2, rows: 2 }, { cols: 2, rows: 1 }, { cols: 2, rows: 1 },
        { cols: 4, rows: 1 }],
        5: [{ cols: 2, rows: 2 }, { cols: 2, rows: 1 }, { cols: 2, rows: 1 },
        { cols: 2, rows: 1 }, { cols: 2, rows: 1 }],
        6: [{ cols: 2, rows: 2 }, { cols: 2, rows: 1 }, { cols: 2, rows: 1 },
        { cols: 1, rows: 1 }, { cols: 1, rows: 1 }, { cols: 2, rows: 1 }],
    };

    const displayData = useMemo(() => {
        const stableItems = [...mediaList].sort((a, b) =>
            (a.id || a.media.src).localeCompare(b.id || b.media.src)
        );
        const count = Math.min(stableItems.length, 6);
        const sliced = stableItems.slice(0, count);
        const pattern = LAYOUT_PATTERNS[count];

        return sliced.map((item, index) => ({
            ...item,
            rows: pattern[index].rows,
            cols: pattern[index].cols,
        }));

        // Only re-run if the actual list of media changes (e.g., a new post)
    }, [mediaList]);

    const remainingCount = mediaList.length - 6;

    return (
        <ImageList
            sx={{
                width: '100%',
                height: 'auto',
                borderRadius: theme.radius[2],
                overflow: 'hidden',
                bgcolor: theme.palette.gray.trans[1],
                margin: 0,
                ...style?.container?.base,
                [theme.breakpoints.down("md")]: {
                    ...style?.container?.smallScreen
                },
            }}
            variant="quilted"
            cols={4}
            rowHeight={150}>

            {displayData.map((item, index) => {
                const isLastItem = index === 5 && remainingCount > 0;
                const { id, media, onClick, cols, rows } = item;
                const mediaType = media.type ?? "image";

                return (
                    <ImageListItem
                        key={id}
                        cols={cols}
                        rows={rows}
                        onClick={() => onClick && onClick(id)}
                        sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            ...applyOverlay()
                        }} >

                        {mediaType === "video" ? (
                            <Box component="video"
                                src={media.src}
                                autoPlay loop muted playsInline
                                sx={{
                                    display: 'block',
                                    ...style?.content,
                                }}
                            />
                        ) : (
                            <Box component="img"
                                // Note: We use the pattern cols/rows for the URL optimization
                                src={`${media.src}?w=${cols * 150}&h=${rows * 150}&fit=crop&auto=format`}
                                alt={media.title}
                                loading="lazy"
                                sx={{
                                    display: 'block',
                                    ...style?.content,
                                    objectFit: 'cover'
                                }}
                            />
                        )}

                        {isLastItem && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: theme.palette.gray.trans.overlay(),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: "column",
                                    zIndex: 2,
                                    padding: theme.boxSpacing(4),
                                }} >
                                <Typography variant="h6" textAlign="center">
                                    +{remainingCount}
                                </Typography> Media
                            </Box>
                        )}
                    </ImageListItem>
                );
            })}
        </ImageList >
    );
};