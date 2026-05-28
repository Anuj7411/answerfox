/* Mount: tab between the 5 foundation screens. */

const SCREENS = [
  { id: 'landing',   label: '01 · Landing',   ember: '#F89444', Comp: () => <Landing /> },
  { id: 'pricing',   label: '02 · Pricing',   ember: '#E8AA2A', Comp: () => <Pricing /> },
  { id: 'dashboard', label: '03 · Dashboard', ember: '#F89444', Comp: () => <Dashboard /> },
  { id: 'fixstudio', label: '04 · Fix Studio', ember: '#FFA500', Comp: () => <FixStudio /> },
  { id: 'signin',    label: '05 · Sign in',   ember: '#C6553C', Comp: () => <SignIn /> },
];

function App() {
  const [active, setActive] = React.useState('landing');
  const screen = SCREENS.find((s) => s.id === active) || SCREENS[0];

  return (
    <div>
      <nav className="sw">
        {SCREENS.map((s) => (
          <button
            key={s.id}
            className={s.id === active ? 'on' : ''}
            onClick={() => setActive(s.id)}
            title={s.label}
          >
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              background: s.ember, marginRight: 8, verticalAlign: '-1px',
              boxShadow: '0 0 0 3px ' + s.ember + '22',
            }}></span>
            {s.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', alignSelf: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(26,24,20,0.5)', letterSpacing: '0.08em' }}>
          slate family · v3.3 · 1440 × 900
        </span>
      </nav>

      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        background: '#f0eee9', padding: '24px 24px 80px',
      }}>
        <div style={{
          boxShadow: '0 30px 80px -40px rgba(26,24,20,0.45)',
          borderRadius: 18,
          overflow: 'hidden',
        }}>
          {screen.Comp()}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
