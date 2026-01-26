When the code was this (initial code), everything works fine. Initial code: interface PostProps { post: Post; style?: GenericObject<string>; } export const PostCard = ({ post, style = {} }: PostProps) => { const theme = useTheme(); const { authUser, loginStatus, setModalContent } = useAppContext(); const { handlePostLike, getPendingLike, setPendingLike, clearPendingLike, fetchAuthor, } = usePost(); const [isLiking, setLiking] = useState(false); const [latestPost, setLatestPost] = useState<Post>(post); const [author, setAuthor] = useState<IUser | null>(null); const [message, setMessage] = useState<string | null>(null); const { authorId, content, postImage, createdAt, likes, status } = latestPost; const userId = authUser?.\_id ?? ""; const alreadyLiked = latestPost.likes.includes(authUser?.\_id ?? ""); // Fetch Author const handleAuthor = useCallback(async () => { if (!authorId) return; const res = await fetchAuthor(authorId); if (res) setAuthor(res); else setMessage("Failed to load author"); }, [authorId]); // Reconcile pending likes + author useEffect(() => { handleAuthor(); const pending = getPendingLike(post.\_id); if (pending !== null) { setLatestPost((prev) => { const liked = prev.likes.includes(userId); return pending && !liked ? { ...prev, likes: [...prev.likes, userId] } : !pending && liked ? { ...prev, likes: prev.likes.filter((id) => id !== userId) } : prev; }); } }, [authUser, post._id, getPendingLike, handleAuthor, userId]); // Like Handler const handleLike = async () => { if (!authUser || loginStatus !== "AUTHENTICATED") { setModalContent({ content: <AuthStepper /> }); return; } const userId = authUser.\_id; // Optimistically update setLatestPost((prev) => ({ ...prev, likes: !alreadyLiked ? [...prev.likes, userId] : prev.likes.filter((id) => id !== userId), })); setPendingLike(post.\_id, !alreadyLiked); setLiking(true); // Sync like on server try { const res = await handlePostLike(post.\_id); if (res) { setLatestPost(res); } } catch (err) { console.error("Failed to sync like:", err); clearPendingLike(post.\_id); } finally { setTimeout(() => setLiking(false), 200); } }; // ✅ Early return if (!author) return ( <Empty tagline={message || "Loading author..."} style={{ container: { margin: theme.boxSpacing(8, 8, 0, 8), }, }} /> ); const authorFullName = author ? ${author.firstName} ${author.lastName} : ""; return status === "DELETED" ? ( <Empty tagline={"This post has been deleted by the author."} style={{ container: { margin: theme.boxSpacing(8, 8, 0, 8), }, }} /> ) : ( <Card sx={{ backgroundColor: "unset", backgroundImage: "unset", borderRadius: "unset", padding: theme.boxSpacing(6, 0), display: "flex", flexDirection: "column", gap: theme.gap(4), ...style, }}> {/_ Post Header _/} <CardHeader sx={{ padding: theme.boxSpacing(0, 8, 0, 4) }} avatar={ <UserAvatar userInfo={{ firstName: author.firstName, lastName: author.lastName, profileImage: author.profileImage, }} style={{ width: "40px", height: "40px", fontSize: "20px" }} aria-label={authorFullName} /> } action={ <IconButton> <MoreHoriz sx={{ fill: theme.palette.gray[200] }} /> </IconButton> } title={ <Typography variant="body2"> <b>{authorFullName}</b> </Typography> } subheader={ <Typography variant="body3" sx={{ color: theme.palette.gray[200] }}> {createdAt.toString()} </Typography> } /> {/_ Content _/} <CardContent sx={{ padding: theme.boxSpacing(0, 8) }}> <Typography variant="body2">{content}</Typography> </CardContent> {/_ Media _/} {postImage && postImage !== "" && ( <CardMedia component="img" image={postImage} alt="Post image" /> )} {/_ Actions _/} <CardActions sx={{ padding: theme.boxSpacing(0, 4) }} disableSpacing> <Stack direction="row" gap={theme.gap(2)} width="100%"> <IconButton sx={{ padding: theme.boxSpacing(4), borderRadius: theme.radius[3], }} onClick={handleLike}> <Heart style={{ width: 22, marginRight: theme.boxSpacing(2), ...(isLiking && { animation: ${heartBeat} 0.3s linear }), fill: alreadyLiked ? red[500] : "none", stroke: alreadyLiked ? red[500] : (theme.palette.gray[200] as string), }} /> <Typography variant="body2"> <b>{summarizeNum(likes.length)}</b> </Typography> </IconButton> <IconButton sx={{ padding: theme.boxSpacing(4), borderRadius: theme.radius[3], }}> <Bookmark sx={{ width: 22, mr: theme.boxSpacing(2), fill: theme.palette.gray[200], }} /> <Typography variant="body2"> <b>12.4k</b> </Typography> </IconButton> </Stack> <IconButton> <Share sx={{ fill: theme.palette.gray[200] }} /> </IconButton> </CardActions> </Card> ); };

const STATIC_CACHE = "funstakes-static-v9";
const API_CACHE = "funstakes-api-v9";

self.addEventListener("install", (event) => {
self.skipWaiting();
});

self.addEventListener("activate", (event) => {
event.waitUntil(
caches
.keys()
.then((keys) =>
Promise.all(
keys
.filter((k) => ![STATIC_CACHE, API_CACHE].includes(k))
.map((k) => caches.delete(k))
)
)
);
self.clients.claim();
});

self.addEventListener("fetch", (event) => {
const { request } = event;
const url = new URL(request.url);

if (request.method !== "GET") return;

/_ NEVER CACHE AUTH _/
if (url.pathname.startsWith("/api/auth")) return;

/_ NEXT STATIC ASSETS _/
if (url.pathname.startsWith("/\_next/static")) {
event.respondWith(cacheFirst(request, STATIC_CACHE));
return;
}

/_ STATIC WEB PAGES _/
if (url.pathname === "/" || url.pathname.startsWith("/web")) {
event.respondWith(cacheFirst(request, STATIC_CACHE));
return;
}

/_ TIMELINE PAGES _/
if (url.pathname.startsWith("/timeline")) {
event.respondWith(networkFirst(request, STATIC_CACHE));
return;
}

/_ API DATA _/
if (
url.pathname.startsWith("/api/posts") ||
url.pathname.startsWith("/api/users")
) {
event.respondWith(networkFirst(request, API_CACHE));
return;
}
});

/_ ---------- STRATEGIES ---------- _/

async function cacheFirst(request, cacheName) {
const cache = await caches.open(cacheName);
const cached = await cache.match(request);
if (cached) return cached;

const fresh = await fetch(request);
cache.put(request, fresh.clone());
return fresh;
}

async function networkFirst(request, cacheName) {
const cache = await caches.open(cacheName);
try {
const fresh = await fetch(request);
cache.put(request, fresh.clone());
return fresh;
} catch {
const cached = await cache.match(request);
if (cached) return cached;

    return new Response(JSON.stringify({ offline: true }), {
      headers: { "Content-Type": "application/json" },
    });

}
}
{/_ <AppButton
variant="outlined"
style={{
            fontSize: "13px",
            padding: theme.boxSpacing(1, 4),
            borderColor: theme.palette.gray[100],
          }}>
Profile
</AppButton> _/}

const handleKeyDown = (e: KeyboardEvent) => {
// Example: Trigger when 'n' is pressed (and user isn't typing in an input)
if (e.key === "n" && (e.target as HTMLElement).tagName !== "INPUT") {
openMobileUserNav(e);
}

      // OR Example: Cmd + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openMobileUserNav(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

const handleVisibility = () => {
if (document.visibilityState === "visible" && isOnline === true)
!isOnAuthRoute && verifyAuth();
};
// document.addEventListener("visibilitychange", handleVisibility);
// document.removeEventListener("visibilitychange", handleVisibility);

Lightmode
success: {
light: "#CBD3F1",
main: "#425BEF",
dark: "#161C3D",
},
error: {
light: "#CBD3F1",
main: red[400],
dark: "#1D0505",
},

Darkmode
success: {
light: "#10142C",
main: "#506AFF",
dark: "#BBC4E8", //7E92FF
},
error: {
light: "#10142C",
main: red[300],
dark: red[100],
},

// ─────────────────────────────
// 2️⃣ AUTH MODAL STATE REACTIONS
// ─────────────────────────────
useEffect(() => {
let intervalId: NodeJS.Timeout | null = null;
// AUTHENTICATED or not on app route close modal
if (
loginStatus === "AUTHENTICATED" ||
loginStatus === "UNKNOWN" ||
!isOnAppRoute
) {
closeModal();
return;
}
// Not allowed → redirect + exit
if (!isAllowedRoutes) {
router.replace(clientRoutes.about.path);
return;
}

    const showModal = () => {
      openModal({
        content: <AuthStepper />,
        onClose: () => closeModal(),
      });
    };
    // show once
    showModal();
    // repeat every 10 mins
    intervalId = setInterval(showModal, 60 * 1000 * 10);
    // single cleanup
    return () => {
      if (intervalId) clearInterval(intervalId);
    };

}, [
loginStatus,
isOnline(),
isOnAppRoute,
isAllowedRoutes,
router,
clientRoutes.path,
pathname,
]);

if (!existingVisitor) {
setCookie(
"existingVisitor",
(Math.random() _ 1e6).toFixed(0).toString(),
60 _ 24 \* 7
);
}

// const handleFocus = () => {
// !isOnAuthRoute && verifyAuth();
// };

// window.addEventListener("focus", handleFocus);

const CTA = () => {
const theme = useTheme();
return (
<Stack sx={{ gap: theme.gap(10) }}>
<Typography component="h6" variant="h6">
Join Funstakes Today
</Typography>
<Image
src={img.logo}
alt="logo"
style={{
          width: "100%",
          height: "150px",
          objectFit: "cover",
          borderRadius: `${theme.radius[2]}`,
          margin: theme.boxSpacing(2, 0),
        }}
/>
<Stack direction="row" sx={{ gap: theme.gap(6), width: "100%" }}>
<AppButton
variant="outlined"
style={{
            fontSize: "13px",
            padding: theme.boxSpacing(2, 4),
            borderColor: theme.palette.gray[100],
            width: "100%",
          }}>
Login
</AppButton>
<AppButton
variant="contained"
style={{
            fontSize: "13px",
            padding: theme.boxSpacing(2, 4),
            borderColor: theme.palette.gray[100],
            width: "100%",
          }}>
Sign Up
</AppButton>
</Stack>
</Stack>
);
};

// Renders a simple nav list
export const RenderSimpleList: React.FC<RenderListProps> = ({
list,
itemAction,
style = {},
}) => {
const { handleLinkClick } = useSharedHooks();

return (
<>
{list.map((item, index) => {
if (!item.title && item.element) {
// Render the "element" alone if there's no title (Divider, custom element, etc.)
return <React.Fragment key={index}>{item.element}</React.Fragment>;
}
return (
<ItemWrapper
key={index}
url={item.url ?? "#"}
onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
const page = {
title: item.title,
path: item.url ?? "#",
};
handleLinkClick(e, page as SavedPage);

              if (item.action) item.action();
              if (itemAction) itemAction();
            }}
            role="link"
            tabIndex={0}
            sx={{
              ...style,
            }}>
            {item.element}
            {item.title && (
              <Typography variant="button">{item.title}</Typography>
            )}
          </ItemWrapper>
        );
      })}
    </>

);
};

// animation: isOpen
// ? `${moveIn({
              //     dir: entryDir,
              //     from: "-0px",
              //     to: "4px",
              //   })} 0.2s linear forwards`
// : `${moveOut({
              //     dir: entryDir,
              //     from: "4px",
              //     to: "-10px",
              //   })} 0.2s linear forwards`,

{/_ {isTimed && (
<Box
sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: 2,
                  animation: progressWidthAnim,
                  backgroundColor:
                    msg.msgStatus === "SUCCESS"
                      ? theme.palette.success.main
                      : msg.msgStatus === "INFO"
                      ? theme.palette.info.main
                      : theme.palette.error.main,
                }}
/>
)} _/}

// const progressWidthAnim = `${shrinkWidth} ${progressDur}s linear forwards`;

const isTimed = msg.behavior === "TIMED";
const isOpen = !!msg.id;
//Set the snackbar timer
setSBTimer();

        const progressDur = msg.duration
          ? msg.duration
          : snackBarMsg.defaultDur;


           // const boxAnimation =
        //   progressDur > 0
        //     ? `${fadeIn} 0.2s linear forwards, ${moveIn({
        //       dir: entryDir,
        //       to: "10px",
        //     })} 0.2s linear forwards`
        //     : `${fadeOut} 0.2s linear forwards, ${moveOut({
        //       dir: entryDir,
        //     })} 0.2s linear forwards`;
