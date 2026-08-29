import React, { useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

export default function ShakerBoard() {
  const { shaker, addToShaker, removeFromShaker, clearShaker, ingredients, cocktails, loadCustomData, initializeConfig, isReady } = useStore();
  const fileInputRef = useRef(null);

  useEffect(() => {
    initializeConfig();
  }, [initializeConfig]);


  const handleExport = () => {
    const dataStr = JSON.stringify({ ingredients, cocktails }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'drink_log_collection.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json.ingredients && json.cocktails) {
          loadCustomData(json.ingredients, json.cocktails);
        } else {
          alert('Invalid JSON structure (无效结构). Must contain "ingredients" and "cocktails".');
        }
      } catch (err) {
        alert('Failed to parse JSON (解析失败).');
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  const matchedCocktails = useMemo(() => {
    if (shaker.length === 0) return [];
    
    const shakerIds = shaker.map(item => item.id);
    
    return cocktails.filter(cocktail => {
      if (shaker.length === 1) {
        // Tasting Mode: Only single-ingredient recommendations
        return cocktail.requires.length === 1 && cocktail.requires[0] === shakerIds[0];
      } else {
        // Mixing Mode: Cocktails must contain ALL current ingredients, AND must not be single-ingredient bottles
        return shakerIds.every(shakerId => cocktail.requires.includes(shakerId)) && cocktail.requires.length > 1;
      }
    });
  }, [shaker, cocktails]);

  if (!isReady) {
    return (
      <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 'bold' }}>
        <motion.div
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          // FETCHING CONFIG...
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      gap: '2rem'
    }}>
      <header style={{ borderBottom: '3px solid var(--text-color)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <h1 style={{ margin: 0 }}>Drink_log</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="brutalist-button" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderStyle: 'dashed' }} onClick={handleExport}>
            [ EXPORT .JSON ]
          </button>
          <button className="brutalist-button" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderStyle: 'dashed' }} onClick={() => fileInputRef.current.click()}>
            [ IMPORT .JSON ]
          </button>
          <input type="file" accept=".json" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImport} />
          <div style={{ fontFamily: 'var(--font-mono)', background: 'var(--text-color)', color: 'var(--bg-color)', padding: '0.2rem 0.5rem', fontWeight: 'bold' }}>// SHAKER MODE</div>
        </div>
      </header>

      {/* Top: Ingredients Selection */}
      <div style={{ flexShrink: 0, background: 'rgba(244,244,242,0.9)', padding: '1rem', border: '3px solid var(--text-color)' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'inline-block' }} className="highlight-yellow">[01] 调酒台 (INGREDIENTS)</h2>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.8rem', fontFamily: 'var(--font-mono)' }}>// BASES (基酒)</h3>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              {ingredients.bases.map(item => (
                <IngredientButton key={item.id} item={item} onClick={() => addToShaker(item)} />
              ))}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.8rem', fontFamily: 'var(--font-mono)' }}>// MODIFIERS (辅料)</h3>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              {ingredients.modifiers.map(item => (
                <IngredientButton key={item.id} item={item} onClick={() => addToShaker(item)} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Center: The Shaker */}
      <div className="panel" style={{ flexShrink: 0, minHeight: '160px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem' }} className="highlight-magenta">[02] 摇酒壶 (THE SHAKER)</h2>
          {shaker.length > 0 && (
            <button 
              className="brutalist-button" 
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              onClick={clearShaker}
            >
              倒掉清空 (EMPTY)
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1, alignContent: 'flex-start' }}>
          <AnimatePresence>
            {shaker.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 0.5 }} 
                exit={{ opacity: 0 }}
                style={{ fontFamily: 'var(--font-mono)', width: '100%', textAlign: 'center', marginTop: '1rem' }}
              >
                // Shaker is empty. Throw ingredients here.
              </motion.div>
            )}
            {shaker.map((item, index) => {
              // 修复：不能在 map 循环中使用 useMemo，改用基于 index 或 id 的确定性随机数
              const rotation = ((index * 13) % 20) - 10; 
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.5, y: -50, rotate: rotation - 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotate: rotation }}
                  exit={{ opacity: 0, scale: 0.5, y: 50 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  onClick={() => removeFromShaker(item.id)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    border: '3px solid var(--text-color)',
                    background: 'var(--bg-color)',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    boxShadow: '4px 4px 0px rgba(0,0,0,0.2)'
                  }}
                  whileHover={{ scale: 1.05, rotate: 0, boxShadow: '6px 6px 0 var(--accent-magenta)' }}
                >
                  <div style={{ width: '14px', height: '14px', background: item.color, border: '2px solid var(--text-color)' }}></div>
                  <span style={{ fontSize: '1.1rem' }}>{item.name}</span>
                  <span style={{ opacity: 0.5, fontSize: '0.9rem', marginLeft: '0.5rem', fontFamily: 'var(--font-mono)' }}>[X]</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom: Derived Cocktails (Infinite Scroll Area) */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', flexShrink: 0 }} className="highlight-cyan">
          {shaker.length === 1 ? '[03] 纯饮鉴赏 (TASTING NOTES)' : '[03] 匹配酒单 (DERIVED SPECS)'}
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignContent: 'start',
          paddingBottom: '2rem'
        }}>
          <AnimatePresence>
            {matchedCocktails.map((cocktail) => (
              <motion.div
                key={cocktail.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="panel"
                style={{ 
                  background: 'var(--bg-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                {/* 标题修复：使用黑色背景青色文字，并允许换行 */}
                <h3 style={{ 
                  fontSize: '1.4rem', 
                  lineHeight: '1.3', 
                  background: 'var(--text-color)', 
                  color: 'var(--accent-cyan)', 
                  padding: '0.5rem',
                  display: 'inline-block',
                  wordWrap: 'break-word',
                  border: '2px solid var(--text-color)'
                }}>
                  {cocktail.name}
                </h3>
                
                <p style={{ fontSize: '1rem', lineHeight: '1.5', fontFamily: 'var(--font-mono)' }}>{cocktail.desc}</p>
                
                {/* 确切酒谱 (SPECS) 区域 */}
                <div style={{ 
                  marginTop: '0.5rem', 
                  background: 'var(--bg-color)', 
                  border: '2px dashed var(--text-color)', 
                  padding: '1rem', 
                  fontFamily: 'var(--font-mono)' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--accent-magenta)', fontSize: '0.9rem' }}>
                      // SPECS
                    </div>
                  </div>
                  
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {cocktail.specs.map((spec, idx) => (
                      <li key={idx} style={{ 
                        borderBottom: idx !== cocktail.specs.length - 1 ? '1px dotted var(--text-color)' : 'none',
                        paddingBottom: idx !== cocktail.specs.length - 1 ? '0.4rem' : '0',
                        marginBottom: idx !== cocktail.specs.length - 1 ? '0.4rem' : '0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem'
                      }}>
                        <span>{spec.text || spec}</span>
                        {spec.ratio && (
                          <span style={{ 
                            background: 'var(--text-color)', 
                            color: 'var(--accent-cyan)', 
                            padding: '0 0.4rem', 
                            fontWeight: 'bold',
                            flexShrink: 0,
                            display: 'inline-block'
                          }}>
                            [{spec.ratio}]
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '2px dashed var(--text-color)' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>// REQUIRES</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {cocktail.requires.map(req => (
                      <span key={req} style={{ fontSize: '0.85rem', padding: '0.2rem 0.5rem', border: '2px solid var(--text-color)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                        {req.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {cocktail.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '0.8rem', background: 'var(--text-color)', color: 'var(--accent-yellow)', padding: '0.2rem 0.5rem', fontWeight: 'bold' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {shaker.length === 1 && matchedCocktails.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ gridColumn: '1 / -1', opacity: 0.6, fontFamily: 'var(--font-mono)', fontSize: '1.2rem', padding: '2rem', border: '3px dashed var(--text-color)', textAlign: 'center' }}>
              // 暂无该基酒的代表性纯饮推荐 (NO TASTING NOTES).<br/>
              // 试着加入更多辅料，进入调酒推演模式.
            </motion.div>
          )}

          {shaker.length >= 2 && matchedCocktails.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ gridColumn: '1 / -1', opacity: 0.6, fontFamily: 'var(--font-mono)', fontSize: '1.2rem', padding: '2rem', border: '3px dashed var(--text-color)', textAlign: 'center' }}>
              // 错误的方向 (DEAD END).<br/>
              // 数据库中不存在包含此组合的经典配方，请清空重试.
            </motion.div>
          )}
        </div>
      </div>

    </div>
  );
}

function IngredientButton({ item, onClick }) {
  return (
    <button 
      className="brutalist-button" 
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
    >
      <div style={{ width: '12px', height: '12px', background: item.color, border: '2px solid var(--text-color)' }}></div>
      {item.name}
    </button>
  );
}
