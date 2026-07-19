import { zip } from 'fflate'

/** Trigger a browser download for a Blob under `filename`. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Give the download a tick to start before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Trigger a browser download for a same-origin URL (server sets the name). */
export function downloadUrl(url) {
  const a = document.createElement('a')
  a.href = url
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/**
 * Bundle multiple { blob, filename } items into a single ZIP and download it.
 * Level 0 (store): jpg/png payloads are already compressed.
 */
export async function downloadZip(items, zipName = 'snag.zip') {
  const entries = {}
  for (const { blob, filename } of items) {
    const buf = new Uint8Array(await blob.arrayBuffer())
    entries[uniqueName(entries, filename)] = buf
  }

  const archive = await new Promise((resolve, reject) => {
    zip(entries, { level: 0 }, (err, data) => (err ? reject(err) : resolve(data)))
  })

  downloadBlob(new Blob([archive], { type: 'application/zip' }), zipName)
}

// Avoid clobbering when two files share a name.
function uniqueName(entries, name) {
  if (!entries[name]) return name
  const dot = name.lastIndexOf('.')
  const base = dot === -1 ? name : name.slice(0, dot)
  const ext = dot === -1 ? '' : name.slice(dot)
  let i = 1
  while (entries[`${base} (${i})${ext}`]) i++
  return `${base} (${i})${ext}`
}
