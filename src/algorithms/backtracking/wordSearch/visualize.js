/**
 * AlgoFlow visualization wrapper.
 * generateSteps is the primary export used by the visualizer.
 */
export { generateSteps } from './steps.js'

/**
 * @param {any} input
 * @returns {Object} initial state configuration
 */
export function getInitialState(input) {
  return {
    data: Array.isArray(input) ? [...input] : input,
    currentStep: 0,
    totalSteps: 0,
    isPlaying: false,
    speed: 1,
  }
}

/**
 * @param {any} input
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateInput(input) {
  if (input === null || input === undefined)
    return { valid: false, error: 'Input is required' }
  if (Array.isArray(input) && input.length === 0)
    return { valid: false, error: 'Array must not be empty' }
  if (Array.isArray(input) && input.length > 60)
    return { valid: false, error: 'Max 60 elements for performance' }
  return { valid: true, error: null }
}
