import { usePage } from "@/hooks/page";
import { useGlobalContext } from "../GlobalContext";
import { clientRoutes } from "@/helpers/routes";
import { delay } from "@/helpers/global";
import { IPage } from "@/types";
import { getFromLocalStorage } from "@/helpers/storage";

export const useOffline = () => {
  const { setOfflineMode } = useGlobalContext();
  const { navigateTo } = usePage();

  const switchToOfflineMode = () => {
    setOfflineMode(true);
    setTimeout(() => {
      navigateTo(clientRoutes.offline, {
        type: "element",
        savePage: false,
        loadPage: true,
      });
    }, 10);
  };

  const switchToOnlineMode = () => {
    setOfflineMode(false);
    const savedPage = getFromLocalStorage<IPage>() || clientRoutes.home;
    navigateTo(savedPage, { type: "element", loadPage: true });
  };

  return {
    switchToOfflineMode,
    switchToOnlineMode,
  };
};
