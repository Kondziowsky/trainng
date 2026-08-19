import type { Skin } from '../types';
import { defaultSkin } from './default';

/**
 * Skin registry.
 *
 * Adding a future (possibly purchasable) theme is a two-line change: create
 * `./midnight.ts` exporting a `Skin`, then add it here. Nothing in the UI layer
 * needs to know it exists.
 */
export const SKINS: readonly Skin[] = [defaultSkin];

export const DEFAULT_SKIN_ID = defaultSkin.id;

export function getSkin(skinId: string): Skin {
  return SKINS.find((skin) => skin.id === skinId) ?? defaultSkin;
}
