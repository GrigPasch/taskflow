import styles from './SharedPage.module.css'

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
      </div>
      <div className={styles.content} style={{ maxWidth: 520 }}>
        <div className={styles.settingsCard}>
          <h2 className={styles.settingsCardTitle}>Workspace</h2>
          {[
            { label: 'Workspace name', type: 'text', default: 'My Company Workspace' },
            { label: 'Default view', type: 'select', options: ['List', 'Board', 'Timeline'] },
          ].map(f => (
            <div key={f.label} className={styles.formRow}>
              <label className={styles.formLabel}>{f.label}</label>
              {f.type === 'select'
                ? <select className={styles.formInput} style={{ height: 34, padding: '0 10px' }}>
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                : <input className={styles.formInput} defaultValue={f.default} />
              }
            </div>
          ))}
        </div>

        <div className={styles.settingsCard}>
          <h2 className={styles.settingsCardTitle}>Notifications</h2>
          {['Task assignments', 'Due date reminders', 'Comments & mentions', 'Status updates', 'New member joins'].map(label => (
            <div key={label} className={styles.toggleRow}>
              <span>{label}</span>
              <div className={styles.toggle}>
                <div className={styles.toggleThumb} />
              </div>
            </div>
          ))}
        </div>

        <button style={{ padding: '8px 20px', background: 'var(--coral)', color: '#fff', borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>
          Save settings
        </button>
      </div>
    </div>
  )
}
