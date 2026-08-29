import React from 'react';
import useStore from '../store/useStore';
import { INGREDIENTS } from '../data/ingredients';
import RecipeOverview from './RecipeOverview';

export default function BuilderFlow() {
  const { step, currentBuild, setIngredient, nextStep, prevStep } = useStore();

  const handleSelect = (type, item) => {
    setIngredient(type, item);
    nextStep();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <SelectionPanel 
            title="01 / 基酒 (BASE)" 
            options={INGREDIENTS.bases} 
            onSelect={(item) => handleSelect('base', item)} 
          />
        );
      case 1:
        return (
          <SelectionPanel 
            title="02 / 酸 (SOUR)" 
            options={INGREDIENTS.sours[currentBuild.base.id] || []} 
            onSelect={(item) => handleSelect('sour', item)} 
            onBack={prevStep}
          />
        );
      case 2:
        return (
          <SelectionPanel 
            title="03 / 甜 (SWEET)" 
            options={INGREDIENTS.sweets[currentBuild.base.id] || []} 
            onSelect={(item) => handleSelect('sweet', item)} 
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <SelectionPanel 
            title="04 / 风味 (FLAVOR)" 
            options={INGREDIENTS.flavors[currentBuild.base.id] || []} 
            onSelect={(item) => handleSelect('flavor', item)} 
            onBack={prevStep}
          />
        );
      case 4:
        return <RecipeOverview onBack={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
      }}>
        {/* Header */}
        <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--text-color)', paddingBottom: '1rem' }}>
          <h1 style={{ margin: 0 }}>Drink_log</h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ opacity: step >= 0 ? 1 : 0.3 }}>基酒</span>
            <span style={{ opacity: step >= 1 ? 1 : 0.3 }}>酸</span>
            <span style={{ opacity: step >= 2 ? 1 : 0.3 }}>甜</span>
            <span style={{ opacity: step >= 3 ? 1 : 0.3 }}>风味</span>
          </div>
        </header>

        {/* Dynamic Content */}
        {renderStep()}
      </div>
    </div>
  );
}

function SelectionPanel({ title, options, onSelect, onBack }) {
  if (!options || options.length === 0) {
    return (
      <div className="panel">
        <h2>{title}</h2>
        <p style={{ margin: '1rem 0' }}>该路径下未找到匹配的约束条件。</p>
        <button className="brutalist-button" onClick={() => onSelect({ id: 'none', name: '无 (None)', description: '跳过此步骤。' })}>
          跳过 (SKIP)
        </button>
        {onBack && (
          <button className="brutalist-button" style={{ marginLeft: '1rem' }} onClick={onBack}>
            返回 (BACK)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="panel" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>{title}</h2>
      
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {options.map((opt) => (
          <div 
            key={opt.id} 
            className="panel brutalist-button" 
            style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            onClick={() => onSelect(opt)}
          >
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-acid)' }}>{opt.name}</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, textTransform: 'none' }}>{opt.description}</p>
          </div>
        ))}
      </div>

      {onBack && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
          <button className="brutalist-button" onClick={onBack}>
            &lt; 上一步
          </button>
        </div>
      )}
    </div>
  );
}
