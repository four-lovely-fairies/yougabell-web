export const getStoredSelectedChildId = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem("home:selected-child-id");
};

export const setStoredSelectedChildId = (childId: string) => {
  window.localStorage.setItem("home:selected-child-id", childId);
};

export const clearStoredSelectedChildId = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem("home:selected-child-id");
};
