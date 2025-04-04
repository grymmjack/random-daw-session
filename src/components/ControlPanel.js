import React from 'react';

const ControlPanel = ({ 
  settings, 
  setSettings, 
  onRandomize, 
  onInitialize, 
  tempo, 
  timeSelectValue, 
  onTimeInputChange
}) => {
  return (
    <div className="control-panel clear">
      <div className="constraints-section">
        <h2>Constraints</h2>
        <label>
          <input
            type="checkbox"
            name="timeConstraint"
            checked={settings.timeConstraint}
            onChange={(e) => setSettings(prev => ({ ...prev, timeConstraint: e.target.checked }))}
          />
          Time Constraint:
          <select 
            name="timeConstraintValue"
            className="normal time-input" 
            value={timeSelectValue} 
            onChange={onTimeInputChange} 
            disabled={!settings.timeConstraint} 
            style={{ marginLeft: '8px' }} 
          >
            <option value="Random">Random</option>
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">60 min</option>
            <option value="120">120 min</option>
            <option value="180">180 min</option>
          </select>
        </label>
        
        <label>
          <input
            type="checkbox"
            name="useConstraint"
            checked={settings.useConstraint}
            onChange={(e) => setSettings(prev => ({ ...prev, useConstraint: e.target.checked }))}
          />
          Use Constraint
        </label>
        
        <label>
          <input
            type="checkbox"
            name="theme"
            checked={settings.theme}
            onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.checked }))}
          />
          Theme Idea
        </label>
        
        <label>
          <input
            type="checkbox"
            name="arrangement"
            checked={settings.arrangement}
            onChange={(e) => setSettings(prev => ({ ...prev, arrangement: e.target.checked }))}
          />
          Arrangement Idea
        </label>
        
        <label>
          <input
            type="checkbox"
            name="soundDesign"
            checked={settings.soundDesign}
            onChange={(e) => setSettings(prev => ({ ...prev, soundDesign: e.target.checked }))}
          />
          Sound Design Idea
        </label>
        
        <label>
          <input
            type="checkbox"
            name="mix"
            checked={settings.mix}
            onChange={(e) => setSettings(prev => ({ ...prev, mix: e.target.checked }))}
          />
          Mix Idea
        </label>
      </div>

      <div className="actions-section">
        <button id="randomize" onClick={onRandomize}>Randomize</button>
        <button id="initialize" onClick={onInitialize}>Initialize</button>
      </div>
      
      {tempo && <span id="tempo">Tempo: {tempo}</span>}
    </div>
  );
};

export default ControlPanel;
