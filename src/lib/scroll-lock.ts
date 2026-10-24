/**
 * Mobilon a teljes képernyős chat alatt lezárja az oldal görgetését.
 *
 * Az iOS Safari a body `overflow: hidden` beállítását görgetéskor és a
 * billentyűzet megnyitásakor nem tartja be: az alatta lévő oldal elmozdul,
 * és kilátszik a lábléc. A megbízható zár a body rögzítése a mostani
 * görgetési pozícióban; feloldáskor visszaállítjuk a pozíciót.
 *
 * A visszatérő függvény oldja fel a zárat.
 */
export function lockPageScroll(): () => void {
  if (window.innerWidth >= 640) return () => {};
  const { body } = document;
  const scrollY = window.scrollY;
  const prev = { position: body.style.position, top: body.style.top, width: body.style.width };
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.width = "100%";
  return () => {
    body.style.position = prev.position;
    body.style.top = prev.top;
    body.style.width = prev.width;
    window.scrollTo(0, scrollY);
  };
}
