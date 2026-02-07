import { usePage } from "@/hooks/page";
import { useGlobalContext } from "../GlobalContext";
import { clientRoutes } from "@/helpers/routes";
import { delay } from "@/helpers/global";
import { Page } from "@/types";
import { getFromLocalStorage } from "@/helpers/storage";

export const useOffline = () => {
  const { setOfflineMode, setGlobalLoading, setNetworkStatus } =
    useGlobalContext();
  const { navigateTo } = usePage();

  const switchToOfflineMode = async () => {
    setGlobalLoading(true);
    const offlinePage = clientRoutes.offline;
    navigateTo(offlinePage, { type: "element", savePage: false });
    // setNetworkStatus("OFFLINE");
    await delay(500);

    setGlobalLoading(false);
  };

  const switchToOnlineMode = () => {
    setOfflineMode(false);
    const savedPage = getFromLocalStorage<Page>() || clientRoutes.home;
    navigateTo(savedPage, { type: "element" });
  };

  return {
    switchToOfflineMode,
    switchToOnlineMode,
  };
};
