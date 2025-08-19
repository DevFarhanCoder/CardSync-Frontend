const integrations = [
  { name: 'HubSpot', desc: 'Sync contacts & activities' },
  { name: 'Salesforce', desc: 'Push leads to CRM' },
  { name: 'Google Contacts', desc: 'Two-way sync' },
  { name: 'Slack', desc: 'Share cards via slash commands' },
  { name: 'Zapier', desc: '2,000+ automations' },
]

export default function Integrations() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Integrations</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {integrations.map((i, idx)=>(
          <div key={idx} className="card p-5 flex items-center justify-between">
            <div>
              <div className="font-semibold">{i.name}</div>
              <div className="text-sm text-[var(--subtle)]">{i.desc}</div>
            </div>
            <button className="btn btn-gold">Connect</button>
          </div>
        ))}
      </div>
    </div>
  )
}
