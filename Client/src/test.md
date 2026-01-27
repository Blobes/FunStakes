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
