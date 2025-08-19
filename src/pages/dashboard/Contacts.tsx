import DataTable from '@/components/DataTable'

const rows = Array.from({length: 18}).map((_,i)=>({ 
  name: ['Sarah Johnson','Michael Lee','Priya Shah','Akira Tanaka','John Carter'][i%5],
  company: ['Acme Inc','Globex','Innotech','BluePeak','Auraline'][i%5],
  email: ['sarah@acme.com','mlee@globex.io','priya@innotech.ai','akira@bluepeak.co','john@acme.com'][i%5],
  last: ['Today','Yesterday','2 days ago','3 days ago','1 week ago'][i%5],
}))

export default function Contacts() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Contacts</h2>
      <DataTable columns={[
        { key: 'name', label: 'Name' },
        { key: 'company', label: 'Company' },
        { key: 'email', label: 'Email' },
        { key: 'last', label: 'Last Activity' },
      ]} data={rows} />
    </div>
  )
}
