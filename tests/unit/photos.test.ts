import { describe, expect, it } from 'vitest';
import { addPhoto, allUrls, MAX_PICKED, removeItemPhotos, removePhoto, type PhotoStore } from '@/demo/photos';

const empty: PhotoStore = new Map();

describe('photo store', () => {
  it('takes up to MAX_PICKED photos per item', () => {
    expect(MAX_PICKED).toBe(2);
    let store = addPhoto(empty, 'item-1', 'blob:a').store;
    const second = addPhoto(store, 'item-1', 'blob:b');
    expect(second.added).toBe(true);
    store = second.store;
    const third = addPhoto(store, 'item-1', 'blob:c');
    expect(third.added).toBe(false);
    expect(third.store.get('item-1')).toEqual(['blob:a', 'blob:b']);
  });

  it('removes one photo and keeps the others in order', () => {
    let store = addPhoto(empty, 'item-1', 'blob:a').store;
    store = addPhoto(store, 'item-1', 'blob:b').store;
    expect(removePhoto(store, 'item-1', 'blob:a').get('item-1')).toEqual(['blob:b']);
  });

  it("removes an item's photos and says which to revoke, leaving other items", () => {
    let store = addPhoto(empty, 'item-1', 'blob:a').store;
    store = addPhoto(store, 'item-2', 'blob:z').store;
    const { store: after, revoked } = removeItemPhotos(store, 'item-1');
    expect(revoked).toEqual(['blob:a']);
    expect(after.has('item-1')).toBe(false);
    expect(after.get('item-2')).toEqual(['blob:z']);
    expect(allUrls(after)).toEqual(['blob:z']);
  });

  it('never changes the store it was given', () => {
    const store = addPhoto(empty, 'item-1', 'blob:a').store;
    addPhoto(store, 'item-1', 'blob:b');
    expect(store.get('item-1')).toEqual(['blob:a']);
  });
});
