import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowRight, Bell, Bike, CheckCircle2, ChevronDown, CircleDot,
  Clock3, FileText, Home, ImagePlus, Lightbulb, MapPin, Menu, MessageSquare,
  MoreHorizontal, Navigation, Plus, Search, Settings, ShieldCheck, Sparkles,
  Trash2, TrendingUp, Users, X, Zap,
} from 'lucide-react'
import { appConfig } from './config'

type Status = 'Submitted' | 'Under review' | 'In progress' | 'Resolved'
type Category = 'Roads' | 'Waste' | 'Lighting' | 'Water' | 'Public spaces'
type Report = {
  id: string; title: string; category: Category; status: Status; location: string
  date: string; priority: 'High' | 'Medium' | 'Low'; description: string; initials: string
}

const seedReports: Report[] = [
  { id: 'CW-1048', title: 'Large pothole on Ngong Road', category: 'Roads', status: 'In progress', location: 'Hurlingham, Nairobi', date: 'Today, 9:42 AM', priority: 'High', description: 'A deep pothole has formed near the pedestrian crossing, forcing vehicles into the oncoming lane.', initials: 'AM' },
  { id: 'CW-1047', title: 'Streetlight not working', category: 'Lighting', status: 'Under review', location: 'Kilimani, Nairobi', date: 'Yesterday, 4:18 PM', priority: 'Medium', description: 'The streetlight outside the community library has been off for three nights.', initials: 'JO' },
  { id: 'CW-1046', title: 'Overflowing rubbish collection point', category: 'Waste', status: 'Submitted', location: 'Lavington, Nairobi', date: 'Oct 26, 11:06 AM', priority: 'Medium', description: 'Waste has been left around the collection point and is blocking the footpath.', initials: 'NK' },
  { id: 'CW-1042', title: 'Leaking water pipe', category: 'Water', status: 'Resolved', location: 'Westlands, Nairobi', date: 'Oct 22, 8:31 AM', priority: 'Low', description: 'A small but persistent leak was flooding the edge of the road.', initials: 'EW' },
]

const navItems = [
  { label: 'Overview', icon: Home }, { label: 'My reports', icon: FileText },
  { label: 'Community map', icon: MapPin }, { label: 'Notifications', icon: Bell, count: 3 },
]

function isReport(value: unknown): value is Report {
  if (!value || typeof value !== 'object') return false
  const report = value as Partial<Report>
  return typeof report.id === 'string' &&
    typeof report.title === 'string' &&
    typeof report.description === 'string' &&
    typeof report.location === 'string' &&
    typeof report.date === 'string' &&
    typeof report.initials === 'string' &&
    ['Roads', 'Waste', 'Lighting', 'Water', 'Public spaces'].includes(report.category ?? '') &&
    ['Submitted', 'Under review', 'In progress', 'Resolved'].includes(report.status ?? '') &&
    ['High', 'Medium', 'Low'].includes(report.priority ?? '')
}

function loadReports(): Report[] {
  try {
    const stored = JSON.parse(localStorage.getItem('civicwatch-reports') || 'null')
    return Array.isArray(stored) && stored.every(isReport) ? stored : seedReports
  } catch {
    return seedReports
  }
}

function App() {
  const [active, setActive] = useState('Overview')
  const [reports, setReports] = useState<Report[]>(loadReports)
  const [showReportForm, setShowReportForm] = useState(false)
  const [selected, setSelected] = useState<Report | null>(null)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<'Citizen' | 'Admin'>('Citizen')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [toast, setToast] = useState('')
  useEffect(() => { localStorage.setItem('civicwatch-reports', JSON.stringify(reports)) }, [reports])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        document.querySelector<HTMLInputElement>('.search input')?.focus()
      }
      if (event.key === 'Escape') {
        setMobileNavOpen(false)
        setShowReportForm(false)
        setSelected(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filteredReports = useMemo(() => reports.filter(r =>
    `${r.title} ${r.location} ${r.category}`.toLowerCase().includes(query.toLowerCase())), [reports, query])
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2800) }
  const updateStatus = (id: string, status: Status) => {
    setReports(current => current.map(r => r.id === id ? { ...r, status } : r))
    notify(`Report ${id} moved to ${status.toLowerCase()}.`)
    setSelected(null)
  }

  const navigate = (next: string) => {
    setActive(next)
    setMobileNavOpen(false)
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><ShieldCheck size={20} /></div><div><strong>CivicWatch</strong><span>AI-powered civic action</span></div></div>
      <div className="workspace-label">MY WORKSPACE</div>
      <nav>{navItems.map(item => <button key={item.label} className={active === item.label ? 'nav-item active' : 'nav-item'} onClick={() => navigate(item.label)}><item.icon size={18}/><span>{item.label}</span>{item.count && <em>{item.count}</em>}</button>)}</nav>
      {role === 'Admin' && <><div className="workspace-label admin-label">OPERATIONS</div><button className={active === 'Admin dashboard' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('Admin dashboard')}><TrendingUp size={18}/><span>Admin dashboard</span></button><button className={active === 'Review queue' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('Review queue')}><ShieldCheck size={18}/><span>Review queue</span><em className="orange">8</em></button></>}
      <div className="sidebar-bottom"><button className="nav-item"><Settings size={18}/><span>Settings</span></button><div className="profile"><div className="avatar">AM</div><div><strong>Angela Mwangi</strong><small>Citizen account</small></div><MoreHorizontal size={17}/></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu" aria-label="Toggle navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(open => !open)}><Menu size={21}/></button><div className="breadcrumb"><span>Workspace</span><ChevronDown size={14}/><strong>{active}</strong></div><div className="top-actions"><div className="search"><Search size={17}/><input aria-label="Search reports" placeholder="Search reports..." value={query} onChange={e => setQuery(e.target.value)}/><kbd>⌘ K</kbd></div><button className="icon-btn notification" aria-label="Notifications" onClick={() => navigate('Notifications')}><Bell size={19}/><i /></button><div className="role-switch"><button className={role === 'Citizen' ? 'selected' : ''} onClick={() => setRole('Citizen')}>Citizen</button><button className={role === 'Admin' ? 'selected' : ''} onClick={() => setRole('Admin')}>Admin</button></div></div></header>
      {active === 'Overview' && <Overview reports={reports} onNew={() => setShowReportForm(true)} onSelect={setSelected} onViewAll={() => setActive('My reports')} />}
      {active === 'My reports' && <ReportsPage reports={filteredReports} onSelect={setSelected} onNew={() => setShowReportForm(true)} />}
      {active === 'Community map' && <MapPage reports={filteredReports} onSelect={setSelected} />}
      {active === 'Notifications' && <Notifications />}
      {(active === 'Admin dashboard' || active === 'Review queue') && <AdminPage reports={filteredReports} onSelect={setSelected} onUpdate={updateStatus} />}
    </main>
    {showReportForm && <ReportModal onClose={() => setShowReportForm(false)} onSubmit={(report) => { setReports(current => [report, ...current]); setShowReportForm(false); notify('Your report was submitted for review.') }} />}
    {selected && <DetailModal report={selected} onClose={() => setSelected(null)} onUpdate={updateStatus} admin={role === 'Admin'} />}
    {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
  </div>
}

function PageTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div>{action}</div>
}

function Overview({ reports, onNew, onSelect, onViewAll }: { reports: Report[]; onNew: () => void; onSelect: (r: Report) => void; onViewAll: () => void }) {
  return <div className="page"><PageTitle eyebrow="Tuesday, 28 October 2026" title="Good morning, Angela." action={<button className="primary-btn" onClick={onNew}><Plus size={18}/> Report an issue</button>} /><p className="intro">Help make Nairobi safer, cleaner, and more connected.</p>
    <section className="stats-grid">{[['My reports','12','+3 this month',FileText,'blue'],['In progress','4','2 need your attention',Clock3,'amber'],['Resolved','7','+18% from last month',CheckCircle2,'green'],['Community impact','89','issues reported nearby',Users,'purple']].map(([label,value,detail,Icon,color]) => <div className="stat-card" key={label as string}><div className={`stat-icon ${color}`}><Icon size={19}/></div><div className="stat-label">{label as string}</div><strong>{value as string}</strong><span>{detail as string}</span></div>)}</section>
    <section className="content-grid"><div className="panel recent-panel"><div className="panel-head"><div><h2>Recent reports</h2><p>Your latest activity and updates</p></div><button className="text-btn" onClick={onViewAll}>View all <ArrowRight size={15}/></button></div><div className="report-list">{reports.slice(0, 3).map(r => <ReportRow key={r.id} report={r} onClick={() => onSelect(r)} />)}</div></div><div className="panel progress-panel"><div className="panel-head"><div><h2>Impact this month</h2><p>Community progress</p></div><span className="trend"><TrendingUp size={14}/> 18.4%</span></div><div className="impact-number">7 <span>issues resolved</span></div><div className="mini-chart"><div className="chart-grid"><span/><span/><span/><span/></div><svg viewBox="0 0 360 110" preserveAspectRatio="none"><path d="M0 92 C30 80 38 87 64 68 S95 76 124 55 S153 63 178 46 S211 65 235 38 S270 58 292 30 S324 36 360 12" fill="none" stroke="#38a889" strokeWidth="3"/><path d="M0 92 C30 80 38 87 64 68 S95 76 124 55 S153 63 178 46 S211 65 235 38 S270 58 292 30 S324 36 360 12 V110 H0Z" fill="url(#chartFill)" opacity=".7"/><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#38a889" stopOpacity=".25"/><stop offset="1" stopColor="#38a889" stopOpacity="0"/></linearGradient></defs></svg></div><div className="chart-labels"><span>Oct 1</span><span>Oct 8</span><span>Oct 15</span><span>Oct 22</span><span>Today</span></div></div></section>
    <section className="panel map-preview"><div className="panel-head"><div><h2>Issues around you</h2><p>Public reports in Nairobi</p></div><button className="text-btn" onClick={onViewAll}>Open map <ArrowRight size={15}/></button></div><MapCanvas reports={reports} compact onSelect={onSelect}/></section>
  </div>
}

function ReportRow({ report, onClick }: { report: Report; onClick: () => void }) {
  const Icon = report.category === 'Roads' ? AlertTriangle : report.category === 'Lighting' ? Lightbulb : report.category === 'Waste' ? Trash2 : report.category === 'Water' ? Zap : Bike
  return <button className="report-row" onClick={onClick}><div className="report-icon"><Icon size={18}/></div><div className="report-main"><strong>{report.title}</strong><span><MapPin size={13}/> {report.location} <i>•</i> {report.date}</span></div><StatusPill status={report.status}/><ArrowRight size={16} className="row-arrow"/></button>
}
function StatusPill({ status }: { status: Status }) { return <span className={`status-pill ${status.replace(' ', '-').toLowerCase()}`}><i/> {status}</span> }

function ReportsPage({ reports, onSelect, onNew }: { reports: Report[]; onSelect: (r: Report) => void; onNew: () => void }) {
  return <div className="page"><PageTitle eyebrow="Your activity" title="My reports" action={<button className="primary-btn" onClick={onNew}><Plus size={18}/> New report</button>} /><div className="filter-bar"><button className="filter active">All reports <span>{reports.length}</span></button><button className="filter">Active <span>5</span></button><button className="filter">Resolved <span>7</span></button><div className="filter-spacer"/><button className="outline-btn"><ChevronDown size={16}/> Most recent</button></div><div className="panel full-list"><div className="report-list">{reports.map(r => <ReportRow key={r.id} report={r} onClick={() => onSelect(r)} />)}</div></div></div>
}

function MapPage({ reports, onSelect }: { reports: Report[]; onSelect: (r: Report) => void }) {
  return <div className="page"><PageTitle eyebrow="Open data" title="Community map" action={<button className="outline-btn"><Navigation size={16}/> Locate me</button>} /><div className="map-toolbar"><div className="map-search"><Search size={16}/><input placeholder="Search an area in Nairobi..." /></div><button className="outline-btn">All categories <ChevronDown size={15}/></button><button className="outline-btn">All statuses <ChevronDown size={15}/></button></div><div className="map-large"><MapCanvas reports={reports} onSelect={onSelect}/><div className="map-legend"><strong>Map legend</strong><span><i className="dot red"/> High priority</span><span><i className="dot amber-dot"/> In progress</span><span><i className="dot green-dot"/> Resolved</span></div></div></div>
}
function MapCanvas({ reports, onSelect, compact = false }: { reports: Report[]; onSelect: (r: Report) => void; compact?: boolean }) {
  return <div className={`map-canvas ${compact ? 'compact' : ''}`}><div className="map-water"/><div className="map-road road-a"/><div className="map-road road-b"/><div className="map-road road-c"/><div className="map-road road-d"/><div className="map-label label-1">Kilimani</div><div className="map-label label-2">Hurlingham</div><div className="map-label label-3">Lavington</div>{reports.map((r, i) => <button key={r.id} className={`map-pin pin-${i + 1} ${r.status === 'Resolved' ? 'resolved' : r.priority === 'High' ? 'high' : ''}`} onClick={() => onSelect(r)}><CircleDot size={13}/></button>)}<div className="map-controls"><button>+</button><button>−</button></div></div>
}

function Notifications() { return <div className="page"><PageTitle eyebrow="Stay informed" title="Notifications" action={<button className="outline-btn">Mark all as read</button>} /><div className="panel notifications"><Notification icon={<CheckCircle2/>} title="Your report was assigned" body="Large pothole on Ngong Road was assigned to Roads & Transport team." time="2 hours ago" green/><Notification icon={<MessageSquare/>} title="New update on CW-1048" body="A field officer added a note: “Works scheduled for tomorrow morning.”" time="Yesterday"/><Notification icon={<Sparkles/>} title="Your community made an impact" body="7 issues were resolved in Nairobi this month. Thank you for speaking up." time="Oct 25" green/></div><p className="provider-note"><Sparkles size={14}/> AI suggestions are powered by {appConfig.aiProvider} ({appConfig.aiModel}) through your server API.</p></div> }
function Notification({icon,title,body,time,green=false}:{icon:React.ReactNode;title:string;body:string;time:string;green?:boolean}) { return <div className="notification-row"><div className={`notification-icon ${green ? 'green' : ''}`}>{icon}</div><div><strong>{title}</strong><p>{body}</p><small>{time}</small></div><span className="unread-dot"/></div> }

function AdminPage({ reports, onSelect, onUpdate }: { reports: Report[]; onSelect: (r: Report) => void; onUpdate: (id: string, status: Status) => void }) {
  return <div className="page"><PageTitle eyebrow="Operations centre" title="Review queue" action={<button className="outline-btn"><Settings size={16}/> Manage teams</button>} /><div className="admin-stats"><div><span>Open queue</span><strong>8</strong><em>↓ 12% this week</em></div><div><span>Awaiting assignment</span><strong>3</strong><em className="warn">Needs attention</em></div><div><span>Avg. resolution time</span><strong>3.2 <small>days</small></strong><em>↑ 0.8d vs last month</em></div><div><span>AI classifications</span><strong>94%</strong><em>Human reviewed</em></div></div><div className="panel full-list admin-table"><div className="panel-head"><div><h2>All community reports</h2><p>Review, assign, and keep residents updated.</p></div><div className="table-actions"><button className="outline-btn"><ChevronDown size={15}/> Filter</button><button className="outline-btn"><MoreHorizontal size={16}/></button></div></div><div className="table-head"><span>REPORT</span><span>CATEGORY</span><span>STATUS</span><span>PRIORITY</span><span> </span></div>{reports.map(r => <button className="admin-row" key={r.id} onClick={() => onSelect(r)}><div><strong>{r.title}</strong><small>{r.id} · {r.location}</small></div><span>{r.category}</span><StatusPill status={r.status}/><span className={`priority ${r.priority.toLowerCase()}`}>{r.priority}</span><ArrowRight size={16}/></button>)}</div></div>
}

function ReportModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: Report) => void }) {
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [category, setCategory] = useState<Category>('Roads')
  const submit = () => { if (!title.trim() || !description.trim()) return; onSubmit({ id: `CW-${1050 + Math.floor(Math.random() * 40)}`, title, description, category, status: 'Submitted', location: 'Nairobi, Kenya', date: 'Just now', priority: 'Medium', initials: 'AM' }) }
  return <div className="modal-backdrop"><div className="modal report-modal"><div className="modal-head"><div><div className="eyebrow">New community report</div><h2>What needs attention?</h2><p>Give us enough detail to help the right team act quickly.</p></div><button className="close-btn" aria-label="Close report form" onClick={onClose}><X size={19}/></button></div><label>Report title<input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Broken streetlight near the library"/></label><label>Category<select value={category} onChange={e => setCategory(e.target.value as Category)}>{['Roads','Waste','Lighting','Water','Public spaces'].map(c => <option key={c}>{c}</option>)}</select></label><label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what you noticed, when it happens, and who it affects." rows={4}/></label><div className="ai-tip"><Sparkles size={17}/><div><strong>{appConfig.aiProvider}-assisted review</strong><p>Our classifier will suggest urgency and route your report to the right team. A person always makes the final decision.</p></div></div><div className="upload-box"><ImagePlus size={20}/><span><strong>Add a photo</strong> (optional)</span><small>JPG, PNG up to 10MB</small></div><div className="location-box"><MapPin size={18}/><div><strong>Location</strong><span>Nairobi, Kenya · Use map to refine</span></div><button>Change</button></div><div className="modal-actions"><button className="outline-btn" onClick={onClose}>Cancel</button><button className="primary-btn" onClick={submit} disabled={!title.trim() || !description.trim()}>Submit report <ArrowRight size={16}/></button></div></div></div>
}

function DetailModal({ report, onClose, onUpdate, admin }: { report: Report; onClose: () => void; onUpdate: (id: string, status: Status) => void; admin: boolean }) {
  return <div className="modal-backdrop"><div className="modal detail-modal"><div className="modal-head"><div><span className="report-id">{report.id}</span><h2>{report.title}</h2><p><MapPin size={14}/> {report.location} · Reported {report.date}</p></div><button className="close-btn" onClick={onClose}><X size={19}/></button></div><div className="detail-grid"><div><div className="detail-photo"><AlertTriangle size={32}/><span>Evidence photo</span></div><h3>Description</h3><p className="detail-copy">{report.description}</p></div><div className="timeline"><h3>Progress</h3><div className="timeline-item done"><i><CheckCircle2 size={15}/></i><div><strong>Report submitted</strong><small>Oct 28, 2026 · You</small></div></div><div className={`timeline-item ${report.status !== 'Submitted' ? 'done' : ''}`}><i><ShieldCheck size={15}/></i><div><strong>Under review</strong><small>{report.status === 'Submitted' ? 'Waiting for review' : 'Reviewed by CivicWatch team'}</small></div></div><div className={`timeline-item ${report.status === 'In progress' || report.status === 'Resolved' ? 'done' : ''}`}><i><Zap size={15}/></i><div><strong>Work in progress</strong><small>{report.status === 'In progress' || report.status === 'Resolved' ? 'Assigned to Roads & Transport' : 'Not started yet'}</small></div></div><div className={`timeline-item ${report.status === 'Resolved' ? 'done' : ''}`}><i><CheckCircle2 size={15}/></i><div><strong>Resolved</strong><small>{report.status === 'Resolved' ? 'Verified by administrator' : 'Pending completion'}</small></div></div></div></div><div className="ai-summary"><Sparkles size={17}/><div><strong>AI review suggestion</strong><p>Likely <b>{report.category.toLowerCase()}</b> issue · <b>{report.priority.toLowerCase()}</b> urgency</p><small>Confidence 92% · Human review required</small></div></div>{admin && <div className="admin-controls"><span>Update status</span><button onClick={() => onUpdate(report.id, 'Under review')}>Review</button><button onClick={() => onUpdate(report.id, 'In progress')}>Assign</button><button className="resolve-btn" onClick={() => onUpdate(report.id, 'Resolved')}>Resolve</button></div>}</div></div>
}

export default App
