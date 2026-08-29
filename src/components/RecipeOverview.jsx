import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useStore from '../store/useStore';

export default function RecipeOverview({ onBack }) {
  const { currentBuild, saveRecipe, resetBuild } = useStore();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    const newRecipe = {
      id: uuidv4(),
      title: title || 'Untitled Spec',
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      build: currentBuild,
      createdAt: new Date().toISOString()
    };
    saveRecipe(newRecipe);
    // After saving, resetBuild is called by the store, which resets step to 0
  };

  return (
    <div className="panel" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '2rem', color: 'var(--accent-magenta)' }}>最终配方 (FINAL SPEC)</h2>
      
      {/* Structuralist Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 'var(--grid-gap)', 
        background: 'var(--text-color)', 
        border: 'var(--border-width) solid var(--text-color)',
        marginBottom: '2rem'
      }}>
        <SpecItem label="基酒 (BASE)" value={currentBuild.base?.name} />
        <SpecItem label="酸 (SOUR)" value={currentBuild.sour?.name} />
        <SpecItem label="甜 (SWEET)" value={currentBuild.sweet?.name} />
        <SpecItem label="风味 (FLAVOR)" value={currentBuild.flavor?.name} />
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>配方名称 (RECIPE ALIAS)</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如: 实验性苦艾酒 V1"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'var(--border-width) solid var(--text-color)',
              color: 'var(--text-color)',
              padding: '0.8rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>标签 (TAGS - 逗号分隔)</label>
          <input 
            type="text" 
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="实验性, 酸爽, 强烈"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'var(--border-width) solid var(--text-color)',
              color: 'var(--text-color)',
              padding: '0.8rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button className="brutalist-button" onClick={handleSave} style={{ flex: 1, borderColor: 'var(--accent-acid)', color: 'var(--accent-acid)' }}>
          记录配方 (COMMIT SPEC)
        </button>
        <button className="brutalist-button" onClick={resetBuild} style={{ flex: 1, borderColor: 'var(--accent-magenta)', color: 'var(--accent-magenta)' }}>
          放弃 (ABORT)
        </button>
      </div>

      <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
        <button className="brutalist-button" onClick={onBack}>
          &lt; 返回调整风味
        </button>
      </div>
    </div>
  );
}

function SpecItem({ label, value }) {
  return (
    <div style={{ background: 'var(--bg-color)', padding: '1rem' }}>
      <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem' }}>// {label}</div>
      <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
        {value || '无 (NULL)'}
      </div>
    </div>
  );
}
