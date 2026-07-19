import { Box, useTheme } from '@mui/material'
import { keyframes } from '@mui/system'
import { PuffyStar } from './PuffyStar'
import { stickerSwatches } from '../../theme/palette'

// A slow bob + slight rotation so each star feels alive but calm.
const float = keyframes`
  0%   { transform: translateY(0)     rotate(var(--rot)); }
  50%  { transform: translateY(-14px) rotate(calc(var(--rot) + 4deg)); }
  100% { transform: translateY(0)     rotate(var(--rot)); }
`

// Scatter layout. Positions are percentages so the field stays responsive.
// `mobile: true` keeps a star on phones; `mTop`/`mLeft` reposition it there so
// it sits in an open background gap rather than under the content column.
const STARS = [
  { color: 'pink',  size: 132, mobileSize: 76, top: '11%', left: '4%',  mTop: '5%',  mLeft: '72%', rot: -14, delay: 0,   dur: 9,    mobile: true },
  { color: 'lemon', size: 92,                  top: '70%', left: '9%',  rot: 10,  delay: 1.4, dur: 11,   mobile: false },
  { color: 'lilac', size: 150, mobileSize: 84, top: '57%', left: '85%', rot: 16,  delay: 0.6, dur: 10,   mobile: false },
  { color: 'blue',  size: 108, mobileSize: 66, top: '6%',  left: '84%', mTop: '30%', mLeft: '82%', rot: -8,  delay: 2.1, dur: 12,   mobile: true },
  { color: 'mint',  size: 80,  mobileSize: 60, top: '85%', left: '6%',  mTop: '52%', mLeft: '2%',  rot: 22,  delay: 0.9, dur: 9.5,  mobile: true },
  { color: 'peach', size: 96,  mobileSize: 66, top: '90%', left: '80%', mTop: '73%', mLeft: '80%', rot: -18, delay: 1.7, dur: 10.5, mobile: true },
  { color: 'blue',  size: 66,                  top: '30%', left: '2%',  rot: 12,  delay: 2.6, dur: 10,   mobile: false },
  { color: 'lilac', size: 72,  mobileSize: 56, top: '40%', left: '88%', mTop: '90%', mLeft: '6%',  rot: -12, delay: 0.3, dur: 11.5, mobile: true },
  { color: 'peach', size: 78,                  top: '3%',  left: '38%', rot: -6,  delay: 1.1, dur: 9.8,  mobile: false },
]

/**
 * Fixed, non-interactive decorative layer of puffy pastel stars scattered
 * behind the app content. Respects prefers-reduced-motion.
 */
export function StarField() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const dim = isDark ? 0.6 : 0.72

  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {STARS.map((star, i) => {
        // Vivid light swatch in both themes so stars stay candy-like.
        const fill = stickerSwatches[star.color].light
        const glow = isDark ? `drop-shadow(0 0 14px ${fill}66)` : 'none'
        const mobileSize = star.mobileSize ?? star.size
        const top = star.mTop ? { xs: star.mTop, md: star.top } : star.top
        const left = star.mLeft ? { xs: star.mLeft, md: star.left } : star.left
        return (
          <Box
            key={i}
            sx={{
              '--rot': `${star.rot}deg`,
              position: 'absolute',
              top,
              left,
              opacity: dim,
              filter: `blur(0.3px) ${glow}`,
              transform: `rotate(${star.rot}deg)`,
              animation: `${float} ${star.dur}s ease-in-out ${star.delay}s infinite`,
              display: star.mobile ? 'block' : { xs: 'none', md: 'block' },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          >
            <PuffyStar
              color={fill}
              sx={{
                width: { xs: mobileSize, md: star.size },
                height: { xs: mobileSize, md: star.size },
              }}
            />
          </Box>
        )
      })}
    </Box>
  )
}
