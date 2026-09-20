import { Link } from 'react-router-dom';
import { VEHICLE_CGL_TEXT, TOOL_RENTAL_CONTRACT_TEXT } from '../data/legalTexts';

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

          <Section title="Barème des franchises — Location de véhicules">
            <p>La franchise correspond à la somme qui reste à la charge du Locataire en cas de sinistre responsable ou non identifié, dans la limite de ce montant, et indépendamment du dépôt de garantie (caution) versé à la réservation.</p>
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '14px 16px', margin: '14px 0', fontSize: 14, color: '#7c2d12', lineHeight: 1.6 }}>
              Le détail des montants par catégorie de véhicule est en cours de publication. En attendant, le montant applicable à votre location vous est communiqué avant la réservation et rappelé sur le contrat signé lors de la remise du véhicule — n'hésitez pas à nous contacter (<a href="mailto:contact@prestolocation.re" style={{ color: '#7c2d12', fontWeight: 700 }}>contact@prestolocation.re</a> — 06 93 83 96 54) pour toute question à ce sujet.
            </div>
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
