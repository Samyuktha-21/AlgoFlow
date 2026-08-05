import {
  CompassAnimation, WaterAnimation, LightAnimation, PuzzleAnimation,
  ChainAnimation, BooksAnimation, CabinetAnimation, ForestAnimation,
  MountainAnimation, NetworkAnimation, TargetAnimation, BlocksAnimation,
  MazeAnimation, CircuitAnimation,
} from './CardAnimations'

/* Map themeId → animation component. Kept out of CardAnimations.jsx so that
   file exports components only (fast refresh). */
export const CARD_ANIMATIONS = {
  compass:  CompassAnimation,
  water:    WaterAnimation,
  light:    LightAnimation,
  puzzle:   PuzzleAnimation,
  chain:    ChainAnimation,
  books:    BooksAnimation,
  cabinet:  CabinetAnimation,
  forest:   ForestAnimation,
  mountain: MountainAnimation,
  network:  NetworkAnimation,
  target:   TargetAnimation,
  blocks:   BlocksAnimation,
  maze:     MazeAnimation,
  circuit:  CircuitAnimation,
}
