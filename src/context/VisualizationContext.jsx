import { createContext, useContext, useReducer, useRef, useEffect } from 'react'

const VisualizationContext = createContext(null)

const SPEEDS = { '0.25x': 3200, '0.5x': 1600, '1x': 800, '2x': 400, '4x': 200 }

const initialState = {
  steps: [],
  currentIndex: 0,
  isPlaying: false,
  speed: '1x',
  isFinished: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEPS':
      return { ...initialState, steps: action.payload, speed: state.speed }
    case 'PLAY':
      return state.isFinished ? state : { ...state, isPlaying: true }
    case 'PAUSE':
      return { ...state, isPlaying: false }
    case 'NEXT': {
      if (state.currentIndex >= state.steps.length - 1)
        return { ...state, isPlaying: false, isFinished: true }
      return { ...state, currentIndex: state.currentIndex + 1, isFinished: false }
    }
    case 'PREV': {
      if (state.currentIndex <= 0)
        return { ...state, isPlaying: false }
      return { ...state, currentIndex: state.currentIndex - 1, isPlaying: false, isFinished: false }
    }
    case 'RESET':
      return { ...state, currentIndex: 0, isPlaying: false, isFinished: false }
    case 'SET_SPEED':
      return { ...state, speed: action.payload }
    case 'ADVANCE': {
      const next = state.currentIndex + 1
      if (next >= state.steps.length)
        return { ...state, isPlaying: false, isFinished: true }
      return { ...state, currentIndex: next }
    }
    default:
      return state
  }
}

export function VisualizationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const timerRef = useRef(null)

  useEffect(() => {
    if (state.isPlaying) {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'ADVANCE' })
      }, SPEEDS[state.speed])
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [state.isPlaying, state.speed])

  useEffect(() => {
    if (state.isFinished) clearInterval(timerRef.current)
  }, [state.isFinished])

  const currentStep = state.steps[state.currentIndex] || null

  return (
    <VisualizationContext.Provider value={{
      ...state,
      currentStep,
      setSteps: (steps) => dispatch({ type: 'SET_STEPS', payload: steps }),
      play:     () => dispatch({ type: 'PLAY' }),
      pause:    () => dispatch({ type: 'PAUSE' }),
      next:     () => dispatch({ type: 'NEXT' }),
      prev:     () => dispatch({ type: 'PREV' }),
      reset:    () => dispatch({ type: 'RESET' }),
      setSpeed: (s) => dispatch({ type: 'SET_SPEED', payload: s }),
    }}>
      {children}
    </VisualizationContext.Provider>
  )
}

export const useVisualization = () => {
  const ctx = useContext(VisualizationContext)
  if (!ctx) throw new Error('useVisualization must be used within VisualizationProvider')
  return ctx
}
