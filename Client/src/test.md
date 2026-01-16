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
