import ModalFrame from './ModalFrame.jsx'
import { X } from 'lucide-react'
import { useState } from 'react'
import { T, getAvatarColor } from '../theme.js'
import { supabase } from '../supabaseClient.js'
import Avatar from './Avatar.jsx'

const VIBES = ["🎉 Party animal", "🏕️ Adventurous", "🤙 Chill", "🏃 Active", "🍕 Foodie", "🎮 Gamer", "💬 Outgoing", "🎨 Creative", "🌿 Nature lover"]
const YEARS = ["1st", "2nd", "3rd", "4th", "5th", "Alumni"]

// Crop to a centered square and shrink to 400x400 JPEG before uploading
async function resizeToSquare(file, size = 400) {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  canvas.getContext('2d').drawImage(bitmap, sx, sy, side, side, 0, 0, size, size)
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/jpeg', 0.85)
  )
}

function EditProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name:    user.name    || "",
    college: user.college || "",
    year:    user.year    || "",
    age:     user.age     || "",
    bio:     user.bio     || "",
    vibes:   user.vibes   || [],
  })
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const [error, setError] = useState("")
    const [photoBlob, setPhotoBlob]       = useState(null)
  const [photoPreview, setPhotoPreview] = useState(user.avatarUrl || "")
  const [removed, setRemoved]           = useState(false)
  const [uploading, setUploading]       = useState(false)
    

  const toggleVibe = (vibe) => {
    if (form.vibes.includes(vibe)) {
      update("vibes", form.vibes.filter(v => v !== vibe))
    } else if (form.vibes.length < 5) {
      update("vibes", [...form.vibes, vibe])
    }
  }

    const handlePickPhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return setError("Please choose an image file.")
    try {
      const blob = await resizeToSquare(file)
      setPhotoBlob(blob)
      setPhotoPreview(URL.createObjectURL(blob))
      setRemoved(false)
      setError("")
    } catch {
      setError("Couldn't read that image. Try another one.")
    }
  }

  const handleRemovePhoto = () => {
    setPhotoBlob(null)
    setPhotoPreview("")
    setRemoved(true)
  }

    const handleSubmit = async () => {
    if (!form.name.trim())    return setError("Name can't be empty!")
    if (!form.college.trim()) return setError("College can't be empty!")

    let avatarUrl = removed ? null : (user.avatarUrl || null)
    const path = `${user.id}/avatar.jpg`

    if (photoBlob) {
      setUploading(true)
      const { error: upError } = await supabase.storage
        .from('avatars')
        .upload(path, photoBlob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' })
      if (upError) {
        setUploading(false)
        return setError("Couldn't upload photo: " + upError.message)
      }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      avatarUrl = `${data.publicUrl}?v=${Date.now()}`   // makes the new photo show immediately
      setUploading(false)
    } else if (removed) {
      await supabase.storage.from('avatars').remove([path])
    }

    onSave({
      ...form,
      age: parseInt(form.age) || null,
      avatarUrl,
    })
  }

  return (
    <ModalFrame title="Edit profile" onClose={onClose}>

        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Edit profile</h2>
          <button aria-label="Close edit profile" onClick={onClose} style={styles.closeBtn} className="tap"><X size={19} /></button>
        </div>

        <div style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <Avatar
              url={photoPreview}
              className="avatar"
              style={{ width: 72, height: 72, fontSize: 22, background: getAvatarColor(form.name) }}
            >
              {form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
            </Avatar>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="tap" style={styles.photoBtn}>
                {photoPreview ? "Change photo" : "Add photo"}
                <input type="file" accept="image/*" onChange={handlePickPhoto} style={{ display: "none" }} />
              </label>
              {photoPreview && (
                <button type="button" onClick={handleRemovePhoto} style={styles.photoRemove}>Remove photo</button>
              )}
            </div>
          </div>

          <label htmlFor="edit-name" style={styles.label}>Full name *</label>
          <input
            id="edit-name" value={form.name}
            onChange={e => update("name", e.target.value)}
            placeholder="Your name"
            style={styles.input}
          />

          <label htmlFor="edit-college" style={styles.label}>College *</label>
          <input
            id="edit-college" value={form.college}
            onChange={e => update("college", e.target.value)}
            placeholder="Your college"
            style={styles.input}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Year</label>
              <div style={styles.chipRow}>
                {YEARS.map(y => (
                  <button
                    key={y}
                    onClick={() => update("year", y)}
                    className="chip-tap" aria-pressed={form.year === y}
                    style={{
                      ...styles.chip,
                      background: form.year === y ? T.purple : T.muted,
                      color: form.year === y ? T.onAccent : T.textSec,
                      fontWeight: form.year === y ? "700" : "400",
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label htmlFor="edit-age" style={styles.label}>Age</label>
          <input
            type="number"
            min="17"
            max="30"
            id="edit-age" value={form.age}
            onChange={e => update("age", e.target.value)}
            placeholder="Your age"
            style={{ ...styles.input, width: "30%" }}
          />

          <label htmlFor="edit-bio" style={styles.label}>Bio</label>
          <textarea
            id="edit-bio" value={form.bio}
            onChange={e => update("bio", e.target.value)}
            placeholder="Tell people about yourself..."
            rows={3}
            style={{ ...styles.input, resize: "none" }}
          />

          <label style={styles.label}>Your vibes (up to 5)</label>
          <div style={styles.chipRow}>
            {VIBES.map(vibe => (
              <button
                key={vibe}
                onClick={() => toggleVibe(vibe)}
                className="chip-tap" aria-pressed={form.vibes.includes(vibe)}
                style={{
                  ...styles.chip,
                  background: form.vibes.includes(vibe) ? T.lavender : T.muted,
                  color:      form.vibes.includes(vibe) ? T.purple : T.textSec,
                  border:     form.vibes.includes(vibe) ? `1.5px solid ${T.purple}` : "1.5px solid transparent",
                  fontWeight: form.vibes.includes(vibe) ? "600" : "400",
                }}
              >
                {vibe}
              </button>
            ))}
          </div>

           <button onClick={handleSubmit} style={styles.submitBtn} className="tap" disabled={uploading}>
            {uploading ? "Uploading photo..." : "Save changes"}
          </button>
        </div>
    </ModalFrame>
  )
}


const styles = {
  header:      { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 14px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 },
  headerTitle: { margin: 0, fontSize: 18, fontWeight: "700", color: T.text },
  closeBtn:    { background: T.muted, border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", fontSize: 14, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" },
  form:        { overflowY: "auto", padding: "20px 20px 40px" },
  label:       { display: "block", fontSize: 12, fontWeight: "600", color: T.textMut, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, marginTop: 4 },
  input:       { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.muted, fontSize: 16, fontFamily: "inherit", marginBottom: 16, color: T.text },
  chipRow:     { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip:        { padding: "7px 14px", borderRadius: 20, border: "1.5px solid transparent", fontSize: 13, fontFamily: "inherit", cursor: "pointer", color: "#fff" },
  error:       { background: T.dangerBg, color: T.orange, padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16, border: `1px solid ${T.border}` },
  submitBtn:   { width: "100%", padding: 14, borderRadius: 12, border: "none", background: T.orange, color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "inherit", cursor: "pointer" },
  photoBtn:    { display: "inline-block", padding: "8px 14px", borderRadius: 10, background: T.muted, color: T.text, fontSize: 13, fontWeight: "600", cursor: "pointer", textAlign: "center" },
  photoRemove: { background: "none", border: "none", color: T.textMut, fontSize: 12, fontFamily: "inherit", cursor: "pointer", padding: 0, textAlign: "left" },
}

export default EditProfileModal
