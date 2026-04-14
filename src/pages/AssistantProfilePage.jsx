import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const emptyForm = {
  nom: '',
  sexe: '',
  ministere: '',
  date_formation: '',
  date_assistanat: '',
  telephone: '',
  pays: '',
  ville: '',
  centres_assistes: '',
}

export default function AssistantProfilePage({
  profile,
  assistantId = null,
  classId = null,
  onBack = null,
}) {
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [resolvedAssistantId, setResolvedAssistantId] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    init()
  }, [assistantId, classId])

  async function init() {
    setLoadingData(true)
    setMessage('')
    setResolvedAssistantId(null)
    setForm(emptyForm)

    if (assistantId) {
      await loadAssistantById(assistantId)
      setLoadingData(false)
      return
    }

    if (classId) {
      await loadAssistantByClass(classId)
      setLoadingData(false)
      return
    }

    setIsEditing(true)
    setLoadingData(false)
  }

  async function loadAssistantById(id) {
    const { data, error } = await supabase
      .from('assistant_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.log(error)
      setMessage("Erreur chargement profil assistant")
      setIsEditing(true)
      return
    }

    if (data) {
      setResolvedAssistantId(data.id)
      fillForm(data)
      return
    }

    setIsEditing(true)
  }

  async function loadAssistantByClass(targetClassId) {
    const { data, error } = await supabase
      .from('assistant_profiles')
      .select('*')
      .eq('class_id', targetClassId)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.log(error)
      setMessage("Erreur chargement profil assistant")
      setIsEditing(true)
      return
    }

    if (data) {
      setResolvedAssistantId(data.id)
      fillForm(data)
      return
    }

    setForm(emptyForm)
    setIsEditing(true)
  }

  function fillForm(data) {
    setForm({
      nom: data?.nom || '',
      sexe: data?.sexe || '',
      ministere: data?.ministere || '',
      date_formation: data?.date_formation || '',
      date_assistanat: data?.date_assistanat || '',
      telephone: data?.telephone || '',
      pays: data?.pays || '',
      ville: data?.ville || '',
      centres_assistes: data?.centres_assistes || '',
    })
    setIsEditing(false)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function saveProfile(e) {
    e.preventDefault()
    setMessage('')

    if (!form.nom.trim()) {
      setMessage('Le nom est obligatoire')
      return
    }

    setLoading(true)

    const payload = {
      class_id: classId || null,
      nom: form.nom.trim(),
      sexe: form.sexe || null,
      ministere: form.ministere.trim() || null,
      date_formation: form.date_formation || null,
      date_assistanat: form.date_assistanat || null,
      telephone: form.telephone.trim() || null,
      pays: form.pays.trim() || null,
      ville: form.ville.trim() || null,
      centres_assistes: form.centres_assistes.trim() || null,
    }

    let error = null
    let data = null

    if (resolvedAssistantId) {
      const result = await supabase
        .from('assistant_profiles')
        .update(payload)
        .eq('id', resolvedAssistantId)
        .select()
        .single()

      error = result.error
      data = result.data
    } else {
      const result = await supabase
        .from('assistant_profiles')
        .insert([payload])
        .select()
        .single()

      error = result.error
      data = result.data
    }

    setLoading(false)

    if (error) {
      console.log(error)
      setMessage('Erreur enregistrement profil assistant')
      return
    }

    if (data) {
      setResolvedAssistantId(data.id)
      fillForm(data)
    } else {
      setIsEditing(false)
    }

    setMessage(resolvedAssistantId ? 'Profil modifié' : 'Profil créé')
  }

  const fieldsDisabled = !!resolvedAssistantId && !isEditing

  if (loadingData) {
    return (
      <div style={styles.page}>
        {onBack && (
          <button type="button" style={styles.backButton} onClick={onBack}>
            ← Retour
          </button>
        )}

        <div style={styles.card}>
          <h2 style={styles.title}>Profil assistant</h2>
          <p style={styles.metaCenter}>Chargement...</p>
          {message ? <p style={styles.message}>{message}</p> : null}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {onBack && (
        <button type="button" style={styles.backButton} onClick={onBack}>
          ← Retour
        </button>
      )}

      <div style={styles.card}>
        <h2 style={styles.title}>
          {!resolvedAssistantId
            ? 'Créer mon profil'
            : isEditing
            ? 'Modifier mon profil'
            : 'Mon profil'}
        </h2>

        <form onSubmit={saveProfile}>
          <input
            style={styles.input}
            name="nom"
            placeholder="Nom"
            value={form.nom}
            onChange={handleChange}
            disabled={fieldsDisabled}
          />

          <select
            style={styles.input}
            name="sexe"
            value={form.sexe}
            onChange={handleChange}
            disabled={fieldsDisabled}
          >
            <option value="">Choisir le sexe</option>
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
          </select>

          <input
            style={styles.input}
            name="ministere"
            placeholder="Ministère"
            value={form.ministere}
            onChange={handleChange}
            disabled={fieldsDisabled}
          />

          <label style={styles.fieldLabel}>Date de formation</label>
          <input
            style={styles.input}
            type="date"
            name="date_formation"
            value={form.date_formation}
            onChange={handleChange}
            disabled={fieldsDisabled}
          />

          <label style={styles.fieldLabel}>Date d’assistanat</label>
          <input
            style={styles.input}
            type="date"
            name="date_assistanat"
            value={form.date_assistanat}
            onChange={handleChange}
            disabled={fieldsDisabled}
          />

          <input
            style={styles.input}
            name="telephone"
            placeholder="Numéro"
            value={form.telephone}
            onChange={handleChange}
            disabled={fieldsDisabled}
          />

          <input
            style={styles.input}
            name="pays"
            placeholder="Pays"
            value={form.pays}
            onChange={handleChange}
            disabled={fieldsDisabled}
          />

          <input
            style={styles.input}
            name="ville"
            placeholder="Ville"
            value={form.ville}
            onChange={handleChange}
            disabled={fieldsDisabled}
          />

          <textarea
            style={styles.textarea}
            name="centres_assistes"
            placeholder="Centres assistés"
            value={form.centres_assistes}
            onChange={handleChange}
            disabled={fieldsDisabled}
          />

          {resolvedAssistantId && !isEditing && (
            <button
              type="button"
              style={styles.editButton}
              onClick={() => setIsEditing(true)}
            >
              Modifier
            </button>
          )}

          {(!resolvedAssistantId || isEditing) && (
            <button style={styles.button} disabled={loading}>
              {loading
                ? 'Enregistrement...'
                : resolvedAssistantId
                ? 'Enregistrer les modifications'
                : 'Enregistrer'}
            </button>
          )}
        </form>

        {message ? <p style={styles.message}>{message}</p> : null}
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Aperçu</h3>

        <div style={styles.detailRow}>
          <span style={styles.label}>Nom</span>
          <span style={styles.value}>{form.nom || '-'}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>Sexe</span>
          <span style={styles.value}>{form.sexe || '-'}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>Ministère</span>
          <span style={styles.value}>{form.ministere || '-'}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>Date de formation</span>
          <span style={styles.value}>{form.date_formation || '-'}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>Date d’assistanat</span>
          <span style={styles.value}>{form.date_assistanat || '-'}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>Numéro</span>
          <span style={styles.value}>{form.telephone || '-'}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>Pays</span>
          <span style={styles.value}>{form.pays || '-'}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>Ville</span>
          <span style={styles.value}>{form.ville || '-'}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>Centres assistés</span>
          <span style={{ ...styles.value, whiteSpace: 'pre-wrap' }}>
            {form.centres_assistes || '-'}
          </span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    padding: 20,
    maxWidth: 760,
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    background: '#f7f1fb',
    minHeight: '100vh',
    boxSizing: 'border-box',
  },

  backButton: {
    marginBottom: 16,
    padding: '12px 16px',
    borderRadius: 12,
    border: '2px solid #999',
    background: '#fff',
    fontWeight: 'bold',
    color: '#2b0a78',
  },

  card: {
    background: '#ffffff',
    border: '2px solid #e3d8f5',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    boxShadow: '0 8px 18px rgba(43, 10, 120, 0.08)',
    boxSizing: 'border-box',
  },

  title: {
    marginTop: 0,
    marginBottom: 16,
    textAlign: 'center',
    color: '#2b0a78',
    fontSize: 32,
    fontWeight: 'bold',
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: 16,
    textAlign: 'center',
    color: '#6f5b84',
    fontSize: 24,
    fontWeight: 'bold',
  },

  fieldLabel: {
    display: 'block',
    marginBottom: 8,
    color: '#6f5b84',
    fontWeight: 'bold',
    fontSize: 16,
  },

  input: {
    width: '100%',
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    border: '2px solid #d8c8ef',
    fontSize: 16,
    boxSizing: 'border-box',
    background: '#fff',
  },

  textarea: {
    width: '100%',
    minHeight: 120,
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    border: '2px solid #d8c8ef',
    fontSize: 16,
    boxSizing: 'border-box',
    resize: 'vertical',
    background: '#fff',
  },

  editButton: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    border: '2px solid #2b0a78',
    background: '#fff',
    color: '#2b0a78',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },

  button: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(90deg,#2b0a78,#d4148e)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  message: {
    marginTop: 14,
    fontWeight: 'bold',
    color: '#d4148e',
    textAlign: 'center',
    fontSize: 18,
  },

  metaCenter: {
    textAlign: 'center',
    color: '#666',
  },

  detailRow: {
    display: 'grid',
    gridTemplateColumns: '150px 1fr',
    gap: 12,
    padding: '10px 0',
    borderBottom: '1px solid #f0e6ff',
    alignItems: 'start',
  },

  label: {
    fontWeight: 'bold',
    color: '#5f5473',
    wordBreak: 'break-word',
  },

  value: {
    color: '#333',
    wordBreak: 'break-word',
  },
}
