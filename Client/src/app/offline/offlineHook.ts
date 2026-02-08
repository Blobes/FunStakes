import { usePage } from "@/hooks/page";
import { useGlobalContext } from "../GlobalContext";
import { clientRoutes } from "@/helpers/routes";
import { delay } from "@/helpers/global";
import { Page } from "@/types";
import { getFromLocalStorage } from "@/helpers/storage";

export const useOffline = () => {
  const { setOfflineMode } = useGlobalContext();
  const { navigateTo } = usePage();

  const switchToOfflineMode = () => {
    setOfflineMode(true);
    const offlinePage = clientRoutes.offline;
    navigateTo(offlinePage, {
      type: "element",
      savePage: false,
      loadPage: true,
    });
  };

  const switchToOnlineMode = () => {
    setOfflineMode(false);
    const savedPage = getFromLocalStorage<Page>() || clientRoutes.home;
    navigateTo(savedPage, { type: "element", loadPage: true });
  };

  return {
    switchToOfflineMode,
    switchToOnlineMode,
  };
};
