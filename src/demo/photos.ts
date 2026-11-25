/** Photos an investor picks, per item id, as object URLs. Never uploaded or saved. */
export type PhotoStore = ReadonlyMap<string, readonly string[]>;

/** Picked photos per item; with the bundled illustration that makes 3 */
export const MAX_PICKED = 2;

export function addPhoto(store: PhotoStore, itemId: string, url: string): { store: PhotoStore; added: boolean } {
  const list = store.get(itemId) ?? [];
  if (list.length >= MAX_PICKED) return { store, added: false };
  return { store: new Map(store).set(itemId, [...list, url]), added: true };
}

export function removePhoto(store: PhotoStore, itemId: string, url: string): PhotoStore {
  const list = store.get(itemId);
  if (list === undefined) return store;
  return new Map(store).set(
    itemId,
    list.filter((u) => u !== url),
  );
}

export function removeItemPhotos(store: PhotoStore, itemId: string): { store: PhotoStore; revoked: string[] } {
  const list = store.get(itemId);
  if (list === undefined) return { store, revoked: [] };
  const next = new Map(store);
  next.delete(itemId);
  return { store: next, revoked: [...list] };
}

export function allUrls(store: PhotoStore): string[] {
  return [...store.values()].flat();
}
