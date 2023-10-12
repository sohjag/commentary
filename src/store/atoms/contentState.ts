import { atom } from "recoil";

export const contentState = atom<{
  isLoading: boolean;
  link: string | null;
  source: string | null;
  rootUrl: string | null;
  contentId: string | null;
}>({
  key: "videoState",
  default: {
    isLoading: true,
    link: null,
    source: null,
    rootUrl: null,
    contentId: null,
  },
});
