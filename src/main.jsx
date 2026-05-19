import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BadgeDollarSign,
  BookOpenCheck,
  Building2,
  Car,
  Check,
  ChevronDown,
  Filter,
  GraduationCap,
  Home,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  Trophy,
  X
} from 'lucide-react';
import './styles.css';

const storageKey = 'portal-school-organizer-schools';

const emptySchool = {
  name: '',
  status: 'Interested',
  conference: '',
  athleticOffer: '',
  academicOffer: '',
  distance: '',
  living: 'Dorms',
  cost: '',
  hasMajor: true,
  coach: '',
  nextStep: '',
  notes: ''
};

const starterSchools = [
  {
    id: crypto.randomUUID(),
    name: 'Coastal Carolina',
    status: 'Call Scheduled',
    conference: 'Sun Belt',
    athleticOffer: '$12,000',
    academicOffer: '$8,500',
    distance: '630',
    living: 'Apartment stipend',
    cost: '$24,000',
    hasMajor: true,
    coach: 'Coach Miller',
    nextStep: 'Send updated fall transcript',
    notes: 'Likes middle infield depth and wants video from last bullpen day.'
  },
  {
    id: crypto.randomUUID(),
    name: 'Indiana State',
    status: 'Offer',
    conference: 'MVC',
    athleticOffer: '$18,000',
    academicOffer: '$6,000',
    distance: '520',
    living: 'Off-campus apartment',
    cost: '$21,500',
    hasMajor: true,
    coach: 'Coach Ramirez',
    nextStep: 'Compare total package by Friday',
    notes: 'Strong culture fit. Need to confirm CS internship support.'
  },
  {
    id: crypto.randomUUID(),
    name: 'Charleston Southern',
    status: 'Interested',
    conference: 'Big South',
    athleticOffer: 'Pending',
    academicOffer: '$10,000',
    distance: '780',
    living: 'Dorms',
    cost: '$28,200',
    hasMajor: true,
    coach: 'Coach Evans',
    nextStep: 'Follow up after admissions pre-read',
    notes: 'Good playing-time path, warmer weather, smaller campus.'
  }
];

function loadSchools() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : starterSchools;
  } catch {
    return starterSchools;
  }
}

function App() {
  const [schools, setSchools] = useState(loadSchools);
  const [form, setForm] = useState(emptySchool);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [majorFilter, setMajorFilter] = useState('All');

  function persist(nextSchools) {
    setSchools(nextSchools);
    localStorage.setItem(storageKey, JSON.stringify(nextSchools));
  }

  function submitSchool(event) {
    event.preventDefault();
    if (!form.name.trim()) return;

    const school = {
      ...form,
      id: editingId ?? crypto.randomUUID(),
      name: form.name.trim()
    };

    const nextSchools = editingId
      ? schools.map((item) => (item.id === editingId ? school : item))
      : [school, ...schools];

    persist(nextSchools);
    setEditingId(null);
    setForm(emptySchool);
  }

  function editSchool(school) {
    setEditingId(school.id);
    setForm({ ...school });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function removeSchool(id) {
    persist(schools.filter((school) => school.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(emptySchool);
    }
  }

  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      const matchesQuery = [school.name, school.conference, school.coach, school.nextStep]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'All' || school.status === statusFilter;
      const matchesMajor =
        majorFilter === 'All' ||
        (majorFilter === 'Computer science' ? school.hasMajor : !school.hasMajor);

      return matchesQuery && matchesStatus && matchesMajor;
    });
  }, [schools, query, statusFilter, majorFilter]);

  const stats = useMemo(() => {
    const offers = schools.filter((school) => school.status === 'Offer').length;
    const avgDistance =
      schools.reduce((sum, school) => sum + Number(school.distance || 0), 0) /
      Math.max(schools.filter((school) => school.distance).length, 1);
    const csCount = schools.filter((school) => school.hasMajor).length;

    return [
      { label: 'Schools', value: schools.length, icon: Building2 },
      { label: 'Offers', value: offers, icon: Trophy },
      { label: 'Avg miles', value: Math.round(avgDistance), icon: Car },
      { label: 'CS programs', value: csCount, icon: BookOpenCheck }
    ];
  }, [schools]);

  return (
    <main>
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">
            <Sparkles size={16} />
            Transfer portal board
          </span>
          <h1>College Baseball School Organizer</h1>
          <p>
            Compare coaches, offers, fit, costs, majors, and the next move for every program
            recruiting you.
          </p>
        </div>

        <div className="stat-grid" aria-label="Recruiting board summary">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article className="stat" key={stat.label}>
                <Icon size={20} />
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="workspace">
        <form className="school-form" onSubmit={submitSchool}>
          <div className="section-title">
            <div>
              <span className="kicker">{editingId ? 'Update school' : 'Add school'}</span>
              <h2>{editingId ? form.name : 'New program'}</h2>
            </div>
            {editingId && (
              <button
                type="button"
                className="icon-button"
                aria-label="Cancel editing"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptySchool);
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <label>
            School
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="University name"
            />
          </label>

          <div className="form-grid">
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
              >
                <option>Interested</option>
                <option>Call Scheduled</option>
                <option>Visit Planned</option>
                <option>Offer</option>
                <option>Committed</option>
                <option>Passed</option>
              </select>
            </label>
            <label>
              Conference
              <input
                value={form.conference}
                onChange={(event) => setForm({ ...form, conference: event.target.value })}
                placeholder="SEC, ACC, Sun Belt..."
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Athletic offer
              <input
                value={form.athleticOffer}
                onChange={(event) => setForm({ ...form, athleticOffer: event.target.value })}
                placeholder="$ amount or pending"
              />
            </label>
            <label>
              Academic offer
              <input
                value={form.academicOffer}
                onChange={(event) => setForm({ ...form, academicOffer: event.target.value })}
                placeholder="$ amount"
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Distance from home
              <input
                type="number"
                min="0"
                value={form.distance}
                onChange={(event) => setForm({ ...form, distance: event.target.value })}
                placeholder="Miles"
              />
            </label>
            <label>
              Cost of attendance
              <input
                value={form.cost}
                onChange={(event) => setForm({ ...form, cost: event.target.value })}
                placeholder="After aid"
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Living situation
              <input
                value={form.living}
                onChange={(event) => setForm({ ...form, living: event.target.value })}
                placeholder="Dorms, apartment, stipend..."
              />
            </label>
            <label>
              Coach contact
              <input
                value={form.coach}
                onChange={(event) => setForm({ ...form, coach: event.target.value })}
                placeholder="Coach name"
              />
            </label>
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={form.hasMajor}
              onChange={(event) => setForm({ ...form, hasMajor: event.target.checked })}
            />
            <span>Has computer science major</span>
          </label>

          <label>
            Next step
            <input
              value={form.nextStep}
              onChange={(event) => setForm({ ...form, nextStep: event.target.value })}
              placeholder="Call, transcript, visit, deadline..."
            />
          </label>

          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Fit, playing time, roster needs, admissions details..."
            />
          </label>

          <button className="primary-action" type="submit">
            {editingId ? <Save size={18} /> : <Plus size={18} />}
            {editingId ? 'Save program' : 'Add program'}
          </button>
        </form>

        <section className="board">
          <div className="toolbar">
            <label className="search-box">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search schools, coaches, conferences"
              />
            </label>
            <div className="filter-group">
              <label>
                <Filter size={16} />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option>All</option>
                  <option>Interested</option>
                  <option>Call Scheduled</option>
                  <option>Visit Planned</option>
                  <option>Offer</option>
                  <option>Committed</option>
                  <option>Passed</option>
                </select>
                <ChevronDown size={16} />
              </label>
              <label>
                <GraduationCap size={16} />
                <select
                  value={majorFilter}
                  onChange={(event) => setMajorFilter(event.target.value)}
                >
                  <option>All</option>
                  <option>Computer science</option>
                  <option>No CS major</option>
                </select>
                <ChevronDown size={16} />
              </label>
            </div>
          </div>

          <div className="school-list">
            {filteredSchools.map((school) => (
              <article className="school-card" key={school.id}>
                <div className="card-topline">
                  <div>
                    <span className={`status status--${school.status.replace(/\s/g, '').toLowerCase()}`}>
                      {school.status}
                    </span>
                    <h3>{school.name}</h3>
                    <p>{school.conference || 'Conference TBD'}</p>
                  </div>
                  <div className="card-actions">
                    <button className="icon-button" aria-label={`Edit ${school.name}`} onClick={() => editSchool(school)}>
                      <Save size={17} />
                    </button>
                    <button className="icon-button danger" aria-label={`Delete ${school.name}`} onClick={() => removeSchool(school.id)}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <div className="metrics">
                  <Metric icon={BadgeDollarSign} label="Athletic" value={school.athleticOffer || 'Unknown'} />
                  <Metric icon={GraduationCap} label="Academic" value={school.academicOffer || 'Unknown'} />
                  <Metric icon={Car} label="Distance" value={school.distance ? `${school.distance} mi` : 'Unknown'} />
                  <Metric icon={Home} label="Living" value={school.living || 'Unknown'} />
                </div>

                <div className="detail-strip">
                  <span>
                    <BadgeDollarSign size={15} />
                    COA: {school.cost || 'Unknown'}
                  </span>
                  <span className={school.hasMajor ? 'positive' : 'negative'}>
                    {school.hasMajor ? <Check size={15} /> : <X size={15} />}
                    {school.hasMajor ? 'Computer science' : 'No CS major'}
                  </span>
                </div>

                {(school.coach || school.nextStep || school.notes) && (
                  <div className="notes">
                    {school.coach && <p><strong>Coach:</strong> {school.coach}</p>}
                    {school.nextStep && <p><strong>Next:</strong> {school.nextStep}</p>}
                    {school.notes && <p>{school.notes}</p>}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="metric">
      <Icon size={17} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
