type RouterLike = {
  push: (href: string) => void;
};

type HistoryLike = {
  readonly length: number;
  back: () => void;
};

export function goBackFromMissionTimer({
  router,
  history,
}: {
  router: RouterLike;
  history: HistoryLike | null | undefined;
}) {
  if (history && history.length > 1) {
    history.back();
    return;
  }

  router.push("/mission");
}
