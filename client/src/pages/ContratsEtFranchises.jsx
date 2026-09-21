import { Link } from 'react-router-dom';
import { VEHICLE_CGL_TEXT, TOOL_RENTAL_CONTRACT_TEXT } from '../data/legalTexts';

// Barème des franchises par catégorie de véhicule — en attente des montants réels
// (voir CLAUDE.md). Remplacer `null` par les montants une fois reçus, ex. franchise: 1000.
const FRANCHISE_TABLE = [
  { cat: 'Catégories 1, 2, 3', franchise: null, assurance: null, nonRachetable: null },
  { cat: 'Catégories 4, 5, 6, 7', franchise: null, assurance: null, nonRachetable: null },
  { cat: 'Catégories 8, 9, 10', franchise: null, assurance: null, nonRachetable: null },
];

export default function ContratsEtFranchises() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Contrats & Franchises</h1>
          <p>Contrats de location et barème des franchises — à titre informatif</p>
        </div>
      </div>
      <div className="page">
        <div className="container" style={{ maxWidth: 800 }}>

          <div style={{ background: 'var(--light)', border: '1px solid var(--gray-200)', borderRadius: 10, padding: '14px 18px', marginBottom: 36, fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.7 }}>
            Les textes ci-dessous sont fournis <strong>à titre informatif</strong> pour que vous puissiez en prendre connaissance avant votre réservation. Le document qui fait foi reste, dans tous les cas, le <strong>contrat papier signé sur place</strong> lors de la remise du matériel ou du véhicule. Ils complètent nos <Link to="/cgv" style={{ color: 'var(--accent)', fontWeight: 600 }}>Conditions Générales de Vente</Link>.
          </div>

          <Section title="Réduisez votre franchise">
            <p>En louant votre véhicule, vous pouvez également réduire votre franchise (en option) selon les conditions ci-dessous. Il suffit de nous l'indiquer lors de votre réservation.</p>
            <FranchiseTable/>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 14, fontStyle: 'italic' }}>
              Les détériorations intérieures, les brûlures et les dégâts aux pneumatiques restent à la charge du Client.
            </p>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 6 }}>
              Une question sur votre franchise ? <a href="mailto:contact@prestolocation.re" style={{ color: 'var(--accent)', fontWeight: 600 }}>contact@prestolocation.re</a> — 06 93 83 96 54.
            </p>
          </Section>

          <Section title="Contrat de location de véhicule (CGL)">
            <div style={{ background: 'var(--light)', borderRadius: 10, padding: '16px 18px', fontSize: 13, lineHeight: 1.8, color: 'var(--gray-700)', whiteSpace: 'pre-wrap', border: '1px solid var(--gray-200)' }}>
              {VEHICLE_CGL_TEXT}
            </div>
          </Section>

          <Section title="Contrat de location de matériel / outillage">
            <div style={{ background: 'var(--light)', borderRadius: 10, padding: '16px 18px', fontSize: 13, lineHeight: 1.8, color: 'var(--gray-700)', whiteSpace: 'pre-wrap', border: '1px solid var(--gray-200)' }}>
              {TOOL_RENTAL_CONTRACT_TEXT}
            </div>
          </Section>

          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 40 }}>
            Dernière mise à jour : septembre 2026
          </p>
        </div>
      </div>
    </div>
  );
}

function euros(v) {
  return v == null ? <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>à venir</span> : `${v} €`;
}

function FranchiseTable() {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--gray-200)', boxShadow: '0 2px 10px rgba(34,4,4,.05)', margin: '16px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: 'var(--primary)' }}>
            {['Catégorie', 'Franchise', 'Assurance supplémentaire (par jour)', 'Franchise non rachetable'].map((h, i) => (
              <th key={i} style={{ padding: '14px 16px', textAlign: i === 0 ? 'left' : 'center', color: 'white', fontWeight: 700, fontSize: 13, letterSpacing: 0.3 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FRANCHISE_TABLE.map((row, i) => (
            <tr key={row.cat} style={{ background: i % 2 ? 'var(--light)' : 'white' }}>
              <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary)' }}>{row.cat}</td>
              <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700 }}>{euros(row.franchise)}</td>
              <td style={{ padding: '14px 16px', textAlign: 'center' }}>{euros(row.assurance)}</td>
              <td style={{ padding: '14px 16px', textAlign: 'center' }}>{euros(row.nonRachetable)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontWeight: 700, fontSize: 20, color: 'var(--primary)', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid var(--gray-200)' }}>{title}</h2>
      <div style={{ color: 'var(--gray-600)', lineHeight: 1.8, fontSize: 15 }}>
        {children}
      </div>
    </div>
  );
}
