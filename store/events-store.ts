/**
 * Flag partagé : indique que la liste des events doit être rafraîchie
 * (ex: un vote vient de se terminer sur la page detail)
 */
let _eventsNeedRefresh = false;

export const markEventsNeedRefresh = () => { _eventsNeedRefresh = true; };
export const consumeEventsNeedRefresh = () => {
  const v = _eventsNeedRefresh;
  _eventsNeedRefresh = false;
  return v;
};
