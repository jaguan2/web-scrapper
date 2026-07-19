import { Box, Typography, useTheme } from '@mui/material'
import { keyframes } from '@mui/system'
import { PuffyStar } from '../decor/PuffyStar'

// Gentle twinkle for the footer's little decorations.
const twinkle = keyframes`
  0%, 100% { transform: translateY(0) rotate(var(--rot)); opacity: var(--op); }
  50%      { transform: translateY(-6px) rotate(calc(var(--rot) + 6deg)); opacity: 1; }
`

const DECOR = [
  { color: 'lemon', size: 34, top: '20%', left: '8%',  rot: -12, op: 0.85, dur: 7,   hideDown: true },
  { color: 'pink',  size: 30, top: '58%', left: '17%', rot: 10,  op: 0.8,  dur: 6,   hideDown: true },
  { color: 'blue',  size: 22, top: '26%', left: '30%', rot: -18, op: 0.7,  dur: 8,   hideDown: true },
  { color: 'lilac', size: 26, top: '64%', left: '82%', rot: 14,  op: 0.8,  dur: 6.5, hideDown: false },
  { color: 'mint',  size: 20, top: '70%', left: '70%', rot: -8,  op: 0.7,  dur: 9,   hideDown: true },
]

/** Spacious footer band with puffy-star decorations. */
export function Footer() {
  const theme = useTheme()

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        mt: { xs: 6, md: 10 },
        px: { xs: 3, md: 6 },
        py: { xs: 5, md: 7 },
        background: `linear-gradient(180deg, transparent 0%, ${
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.5)'
        } 100%)`,
      }}
    >
      {DECOR.map((d, i) => {
        const fill = theme.snag.stickers[d.color]
        const glow =
          theme.palette.mode === 'dark' ? `drop-shadow(0 0 10px ${fill}66)` : 'none'
        return (
          <Box
            key={i}
            aria-hidden
            sx={{
              position: 'absolute',
              top: d.top,
              left: d.left,
              '--rot': `${d.rot}deg`,
              '--op': d.op,
              opacity: d.op,
              filter: glow,
              transform: `rotate(${d.rot}deg)`,
              animation: `${twinkle} ${d.dur}s ease-in-out infinite`,
              display: d.hideDown ? { xs: 'none', md: 'block' } : 'block',
              pointerEvents: 'none',
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          >
            <PuffyStar color={fill} size={d.size} />
          </Box>
        )
      })}

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1080,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700 }}>
          No ads. No trackers. Just your media.
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontWeight: 500, fontSize: 14 }}>
          Downloads are for content you have the right to save. Be kind to creators.
        </Typography>
      </Box>
    </Box>
  )
}
