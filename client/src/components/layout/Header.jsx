import { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

/**
 * Top app bar: logo, supported-platform stickers, theme toggle. Gains a
 * frosted-glass backing once the page scrolls so content reads cleanly
 * beneath it.
 */
export function Header({ onGoHome }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Box
      component="header"
      sx={(theme) => ({
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 2, md: 4 },
        px: { xs: 2, md: 4 },
        py: 2.5,
        backgroundColor: scrolled
          ? theme.palette.mode === 'light'
            ? alpha(theme.palette.background.default, 0.62)
            : theme.snag.glass.bg
          : 'transparent',
        backdropFilter: scrolled
          ? theme.palette.mode === 'light'
            ? 'blur(18px) saturate(1.8)'
            : theme.snag.glass.blur
          : 'none',
        WebkitBackdropFilter: scrolled
          ? theme.palette.mode === 'light'
            ? 'blur(18px) saturate(1.8)'
            : theme.snag.glass.blur
          : 'none',
        borderBottom: '1px solid',
        borderColor: scrolled ? 'divider' : 'transparent',
        boxShadow: scrolled ? theme.snag.glass.shadow : 'none',
        transition:
          'background-color 240ms ease, box-shadow 240ms ease, border-color 240ms ease, backdrop-filter 240ms ease',
      })}
    >
      <Logo onGoHome={onGoHome} />

      {/* Decorative platform stickers — a quiet reminder of what Snag eats. */}
      <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
        {[
          { label: 'youtube', sticker: 'peach', tilt: -2 },
          { label: 'instagram', sticker: 'pink', tilt: 1.5 },
          { label: 'x / twitter', sticker: 'blue', tilt: -1 },
        ].map((p) => (
          <Typography
            key={p.label}
            component="span"
            sx={(theme) => ({
              px: 1.5,
              py: 0.25,
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 700,
              color: 'text.primary',
              bgcolor: theme.snag.stickers[p.sticker],
              border: `2px solid ${theme.snag.sticker.peel}`,
              boxShadow: theme.snag.sticker.shadow,
              transform: `rotate(${p.tilt}deg)`,
            })}
          >
            {p.label}
          </Typography>
        ))}
      </Box>

      <Box sx={{ flex: 1 }} />
      <ThemeToggle />
    </Box>
  )
}
