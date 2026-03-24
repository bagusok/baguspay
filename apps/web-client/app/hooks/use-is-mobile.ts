import { useMediaQuery } from 'usehooks-ts'

/**
 * Custom hook to detect if the screen width is mobile size.
 * You can adjust the breakpoint as needed.
 */
export const useIsMobile = (breakpoint: number = 768): boolean => {
  // Matches when screen width is less than or equal to breakpoint
  return useMediaQuery(`(max-width: ${breakpoint}px)`)
}
