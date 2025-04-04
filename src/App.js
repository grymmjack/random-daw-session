import React, { useState, useEffect, useCallback } from 'react';

import './App.css';
import Cell from './components/Cell';
import ControlPanel from './components/ControlPanel';
import { 
  themes, mixThemes, arrangementIdeas, soundDesignIdeas, 
  daws, synthInstruments, drumInstruments, 
  synthEffects, drumEffects, sendEffects,
  randomPresetInstruments, instrumentCounts, 
  quotes 
} from './data/constants';

// Helper to get random item from array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to format time (seconds to MM:SS)
const formatTime = (totalSeconds) => {
  if (totalSeconds < 0) totalSeconds = 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

function App() {
  const [cells, setCells] = useState({
    daw: { locked: false, selected: '' },
    synthInstrument: { locked: false, selected: '' },
    synthEffect: { locked: false, selected: '' },
    drumInstrument: { locked: false, selected: '' },
    drumEffect: { locked: false, selected: '' },
    randomPresetInstrument0: { locked: false, selected: '' },
    randomPresetInstrument1: { locked: false, selected: '' },
    randomPresetInstrument2: { locked: false, selected: '' },
    randomPresetInstrumentCount: { locked: false, selected: '' },
    sendEffect: { locked: false, selected: '' },
  });

  const [countdown, setCountdown] = useState({
    initialTime: 15 * 60, // Store initial time in seconds
    timeRemaining: 15 * 60, // Store remaining time in seconds
    isTimerRunning: false,
    paused: false // Keep paused state if needed later, maybe for pause button
  });

  const [settings, setSettings] = useState({
    timeConstraint: false,
    useConstraint: false,
    theme: false,
    arrangement: false,
    soundDesign: false,
    mix: false
  });

  const [obliqueStrategy, setObliqueStrategy] = useState('');
  const [tempo, setTempo] = useState('');

  // --- Timer State (using select value) ---
  const [timeSelectValue, setTimeSelectValue] = useState('15'); // Default to "15" minutes

  const [displayedTheme, setDisplayedTheme] = useState('');
  const [displayedArrangement, setDisplayedArrangement] = useState('');
  const [displayedSoundDesign, setDisplayedSoundDesign] = useState('');
  const [displayedMix, setDisplayedMix] = useState('');

  const handleCellChange = (cellName, value) => {
    setCells(prev => ({
      ...prev,
      [cellName]: { ...prev[cellName], selected: value },
    }));
    // Special handling if the count changes, clear higher number instruments if needed
    if (cellName === 'randomPresetInstrumentCount') {
        const count = parseInt(value, 10);
        setCells(prev => ({
            ...prev,
            randomPresetInstrument1: count < 2 ? { ...prev.randomPresetInstrument1, selected: '' } : prev.randomPresetInstrument1,
            randomPresetInstrument2: count < 3 ? { ...prev.randomPresetInstrument2, selected: '' } : prev.randomPresetInstrument2,
        }));
    }
  };

  const toggleLock = (cellName) => {
    setCells(prev => ({
      ...prev,
      [cellName]: {
        ...prev[cellName],
        locked: !prev[cellName].locked
      }
    }));
  };

  // Start Timer
  const startTimer = () => {
    if (settings.timeConstraint && !countdown.isTimerRunning) {
      let minutesToStart = timeSelectValue === 'Random' ? 15 : parseInt(timeSelectValue, 10);
      if (isNaN(minutesToStart) || minutesToStart <= 0) minutesToStart = 15; // Default if invalid or Random

      const initialTimeSeconds = minutesToStart * 60;
      setCountdown(prev => ({ 
        ...prev, 
        initialTime: initialTimeSeconds,
        timeRemaining: initialTimeSeconds, // Reset to initial time when starting
        isTimerRunning: true, 
        paused: false 
      }));
    }
  };

  // Pause Timer
  const pauseTimer = () => {
    setCountdown(prev => ({ ...prev, paused: true, isTimerRunning: false }));
  };

  // Resume Timer
  const resumeTimer = () => {
    setCountdown(prev => ({ ...prev, paused: false, isTimerRunning: true }));
  }; 

  // Reset Timer
  const resetTimer = () => {
    let minutesToReset = timeSelectValue === 'Random' ? 15 : parseInt(timeSelectValue, 10);
    if (isNaN(minutesToReset) || minutesToReset <= 0) minutesToReset = 15; // Default if invalid or Random
    const initialTimeSeconds = minutesToReset * 60;
    setCountdown({
      initialTime: initialTimeSeconds,
      timeRemaining: initialTimeSeconds,
      isTimerRunning: false,
      paused: false
    });
  };

  // --- Timer Logic --- 
  useEffect(() => {
    let intervalId = null;

    if (countdown.isTimerRunning && !countdown.paused && countdown.timeRemaining > 0) {
      intervalId = setInterval(() => {
        setCountdown(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1000);
    } else if (countdown.timeRemaining <= 0 && countdown.isTimerRunning) {
      // Timer reached zero
      setCountdown(prev => ({ ...prev, isTimerRunning: false })); 
      // Optionally add an alert or sound effect here
      alert("Time's up!"); 
    }

    // Cleanup function to clear interval when component unmounts or dependencies change
    return () => clearInterval(intervalId);

  }, [countdown.isTimerRunning, countdown.paused, countdown.timeRemaining]); // Dependencies for the effect

  // Randomize function update
  const randomize = useCallback(() => {
    // Use existing settings, DO NOT randomize checkboxes
    const currentSettings = settings;
    let newTimeValue = timeSelectValue; // Keep current unless overridden

    // 2. Randomize Time Constraint value if checked
    if (currentSettings.timeConstraint) {
      const timeOptions = [15, 30, 45, 60, 120, 180];
      let chosenTime = timeSelectValue;
      if (chosenTime === 'Random') {
        chosenTime = getRandomItem(timeOptions);
      }
      // Ensure chosenTime is a number before proceeding
      const numericTime = parseInt(chosenTime, 10);

      if (!isNaN(numericTime) && numericTime > 0) {
         // Update the select dropdown display value if it was Random
         if (timeSelectValue === 'Random') {
            setTimeSelectValue(numericTime.toString());
         }
         newTimeValue = numericTime; // Store the numeric value for countdown setup
      } else {
         // Fallback if something went wrong (e.g., parsing failed)
         newTimeValue = 15;
         if (timeSelectValue === 'Random') setTimeSelectValue('15');
      }

      // Update countdown state with new random time, but keep it paused
      const newTimeSeconds = newTimeValue * 60;
      setCountdown({
        initialTime: newTimeSeconds,
        timeRemaining: newTimeSeconds,
        isTimerRunning: false, // Ensure timer doesn't auto-start
        paused: false
      });
    }

    // 3. Select and store ideas for other checked constraints
    const selectedTheme = currentSettings.theme ? getRandomItem(themes) : '';
    const selectedArrangement = currentSettings.arrangement ? getRandomItem(arrangementIdeas) : '';
    const selectedSoundDesign = currentSettings.soundDesign ? getRandomItem(soundDesignIdeas) : '';
    const selectedMix = currentSettings.mix ? getRandomItem(mixThemes) : '';

    setDisplayedTheme(selectedTheme);
    setDisplayedArrangement(selectedArrangement);
    setDisplayedSoundDesign(selectedSoundDesign);
    setDisplayedMix(selectedMix);

    // --- Cell Randomization --- 

    // Determine the random preset instrument count *first* if it's not locked
    let presetCount = parseInt(cells.randomPresetInstrumentCount.selected, 10);
    if (isNaN(presetCount)) presetCount = 0; // Default to 0 if not selected or invalid

    let newPresetCount = presetCount;
    if (!cells.randomPresetInstrumentCount.locked) {
        // Note: instrumentCounts might need adjustment if it includes '0' as a string
        const countOptions = instrumentCounts.map(opt => opt.name).filter(n => n !== '0'); // Exclude 0 for random selection if needed
        const randomCountName = getRandomItem(countOptions);
        newPresetCount = parseInt(randomCountName, 10);
        // Update the state for the count cell directly
        setCells(prev => ({
            ...prev,
            randomPresetInstrumentCount: { ...prev.randomPresetInstrumentCount, selected: randomCountName }
        }));
    } else {
        newPresetCount = presetCount; // Use locked value
    }

    const cellsToUpdate = {};

    // Handle randomization for all cells EXCEPT the specific preset instruments
    Object.keys(cells).forEach(cellName => {
        const cell = cells[cellName]; // Get the current cell state

        // Skip locked cells and the specific preset instruments (handled later)
        if (cell.locked || cellName.startsWith('randomPresetInstrument')) {
            return;
        }
 
        let options = [];
        let applyRandomization = false;

        switch(cellName) {
            case 'daw':
            case 'synthInstrument':
            case 'drumInstrument':
                options = cellName === 'daw' ? daws : (cellName === 'synthInstrument' ? synthInstruments : drumInstruments);
                applyRandomization = true; // Always randomize these if unlocked
                break;
            case 'synthEffect':
            case 'drumEffect':
            case 'sendEffect':
                options = cellName === 'synthEffect' ? synthEffects : (cellName === 'drumEffect' ? drumEffects : sendEffects);
                applyRandomization = Math.random() < 0.5; // 50% chance for effects if unlocked
                break;
            // Add other cases if necessary, but they might default to clearing if not handled
        }

        if (applyRandomization && Array.isArray(options) && options.length > 0) {
             const randomOption = getRandomItem(options);
             cellsToUpdate[cellName] = { ...cell, selected: randomOption.name };
          } else if (!cells[cellName].locked) {
            // If not randomized (either by chance or because it's not an applicable cell type), clear it.
            // Ensure we don't clear already locked cells (though they should be skipped earlier)
            cellsToUpdate[cellName] = { ...cell, selected: '' };
          }
      });

    // --- Force Randomization for Preset Instruments based on count ---
    const presetCells = ['randomPresetInstrument0', 'randomPresetInstrument1', 'randomPresetInstrument2'];
    presetCells.forEach((cellName, index) => {
        const cell = cells[cellName];
        if (!cell.locked && index < newPresetCount) {
             // ALWAYS randomize if unlocked and index is within the count
            const randomOption = getRandomItem(randomPresetInstruments);
            cellsToUpdate[cellName] = { ...cell, selected: randomOption.name };
        } else if (!cell.locked && index >= newPresetCount) {
            // Clear if unlocked and index is outside the count
            cellsToUpdate[cellName] = { ...cell, selected: '' };
        } else if (cell.locked && index >= newPresetCount) {
             // If it's locked but outside the new count, keep its locked value (don't clear)
             // No action needed here, it won't be in cellsToUpdate
        } else if (cell.locked && index < newPresetCount) {
             // If it's locked AND inside the count, keep its locked value
             // No action needed here
        }
    });

    // Apply all updates together
    setCells(prevCells => ({ ...prevCells, ...cellsToUpdate }));

    // Get a new Oblique Strategy
    setObliqueStrategy(getRandomItem(quotes));

    // Get a new Tempo
    setTempo(`${Math.floor(Math.random() * (180 - 60 + 1)) + 60} BPM`);

    // Start timer only if constraint is active AND timer isn't already running
    if (currentSettings.timeConstraint && !countdown.isTimerRunning) {
       startTimer(); // Call startTimer logic which uses the (potentially updated) timeSelectValue
    }

  }, [settings, cells, timeSelectValue, countdown.isTimerRunning, startTimer]); // Added dependencies

  // Recalculate displayed count for rendering
  const displayPresetCount = parseInt(cells.randomPresetInstrumentCount.selected, 10);
  const isValidCount = !isNaN(displayPresetCount) && displayPresetCount >= 0 && displayPresetCount <= 3;
  const actualPresetCount = isValidCount ? displayPresetCount : 0;

  // Handler for time input change (Restored)
  const handleTimeSelectChange = useCallback((e) => {
    const selectedValue = e.target.value;
    setTimeSelectValue(selectedValue);
    
    // Update countdown state only if timer is not running and constraint is checked
    if (settings.timeConstraint && !countdown.isTimerRunning) {
      let newMinutes = selectedValue === 'Random' ? 15 : parseInt(selectedValue, 10);
      if (isNaN(newMinutes) || newMinutes <= 0) newMinutes = 15; // Fallback
      const newTimeSeconds = newMinutes * 60;
      setCountdown(prev => ({ 
        ...prev, 
        initialTime: newTimeSeconds, 
        timeRemaining: newTimeSeconds 
      }));
    }
    // If constraint is off, changing dropdown does nothing until it's checked
  }, [countdown.isTimerRunning, settings.timeConstraint]);

  return (
    <div className="App">
      <div id="lights_out"></div>
      <div id="corner-logo"></div>
      
      {settings.timeConstraint && (
        <div id="countdown-container" className={countdown.paused ? 'paused' : ''}>
          <span id="countdown-remaining">Time Remaining:</span>
          <span id="countdown">{formatTime(countdown.timeRemaining)}</span>
          {!countdown.isTimerRunning && !countdown.paused && countdown.timeRemaining === countdown.initialTime && (
             <button onClick={startTimer} disabled={!timeSelectValue || timeSelectValue <= 0}>Start</button>
          )}
          {countdown.isTimerRunning && !countdown.paused && (
             <button onClick={pauseTimer}>Pause</button>
          )}
          {countdown.paused && (
            <button onClick={resumeTimer}>Resume</button>
          )}
          {(countdown.isTimerRunning || countdown.paused || countdown.timeRemaining < countdown.initialTime) && (
            <button onClick={resetTimer}>Reset</button>
          )}
        </div>
      )}
      
      <div id="oblique-strategy">{obliqueStrategy}</div>
      
      <ControlPanel 
        settings={settings}
        setSettings={setSettings}
        onRandomize={randomize}
        onInitialize={() => {
          setCells({
            daw: { locked: false, selected: '' },
            synthInstrument: { locked: false, selected: '' },
            synthEffect: { locked: false, selected: '' },
            drumInstrument: { locked: false, selected: '' },
            drumEffect: { locked: false, selected: '' },
            randomPresetInstrument0: { locked: false, selected: '' },
            randomPresetInstrument1: { locked: false, selected: '' },
            randomPresetInstrument2: { locked: false, selected: '' },
            randomPresetInstrumentCount: { locked: false, selected: '' },
            sendEffect: { locked: false, selected: '' },
          });
          setSettings({
            timeConstraint: false,
            useConstraint: false,
            theme: false,
            arrangement: false,
            soundDesign: false,
            mix: false
          });
          setTimeSelectValue('15'); // Reset select value to default
          resetTimer(); // Reset timer state
          setObliqueStrategy('');
          setTempo('');
          setDisplayedTheme('');
          setDisplayedArrangement('');
          setDisplayedSoundDesign('');
          setDisplayedMix('');
        }}
        tempo={tempo}
        timeSelectValue={timeSelectValue} 
        onTimeInputChange={handleTimeSelectChange} 
      />
 
      {(displayedTheme || displayedArrangement || displayedSoundDesign || displayedMix) && (
        <div className="selected-constraints">
          <h2>Constraints:</h2>
          <ul>
            {displayedTheme && <li>Theme: {displayedTheme}</li>}
            {displayedArrangement && <li>Arrangement: {displayedArrangement}</li>}
            {displayedSoundDesign && <li>Sound Design: {displayedSoundDesign}</li>}
            {displayedMix && <li>Mix: {displayedMix}</li>}
          </ul>
        </div>
      )}
      
      <div className="cells-container">
        <Cell 
          title="DAW"
          name="daw"
          options={daws}
          value={cells.daw.selected}
          locked={cells.daw.locked}
          onLock={() => toggleLock('daw')}
          onChange={(value) => handleCellChange('daw', value)}
        />
        <Cell 
          title="Synth Instrument"
          name="synthInstrument"
          options={synthInstruments}
          value={cells.synthInstrument.selected}
          locked={cells.synthInstrument.locked}
          onLock={() => toggleLock('synthInstrument')}
          onChange={(value) => handleCellChange('synthInstrument', value)}
        />
        <Cell 
          title="Synth Effect"
          name="synthEffect"
          options={synthEffects}
          value={cells.synthEffect.selected}
          locked={cells.synthEffect.locked}
          onLock={() => toggleLock('synthEffect')}
          onChange={(value) => handleCellChange('synthEffect', value)}
        />
        <Cell 
          title="Drum Instrument"
          name="drumInstrument"
          options={drumInstruments}
          value={cells.drumInstrument.selected}
          locked={cells.drumInstrument.locked}
          onLock={() => toggleLock('drumInstrument')}
          onChange={(value) => handleCellChange('drumInstrument', value)}
        />
        <Cell 
          title="Drum Effect"
          name="drumEffect"
          options={drumEffects}
          value={cells.drumEffect.selected}
          locked={cells.drumEffect.locked}
          onLock={() => toggleLock('drumEffect')}
          onChange={(value) => handleCellChange('drumEffect', value)}
        />
        
        <Cell 
          title="# Random Preset Instruments"
          name="randomPresetInstrumentCount"
          options={instrumentCounts} // Use the new constant
          value={cells.randomPresetInstrumentCount.selected}
          locked={cells.randomPresetInstrumentCount.locked}
          onLock={() => toggleLock('randomPresetInstrumentCount')}
          onChange={(value) => handleCellChange('randomPresetInstrumentCount', value)}
          placeholder="COUNT..."
          hideImage={true} // Don't show image for the count selector
        />
        
        {/* Conditionally Render Preset Instrument Cells */}
        {actualPresetCount >= 1 && (
          <Cell 
            title="Random Preset Instrument #1"
            name="randomPresetInstrument0"
            placeholder="INSTRUMENT 1..."
            options={randomPresetInstruments}
            value={cells.randomPresetInstrument0.selected}
            locked={cells.randomPresetInstrument0.locked}
            onLock={() => toggleLock('randomPresetInstrument0')}
            onChange={(value) => handleCellChange('randomPresetInstrument0', value)}
          />
        )}
        {actualPresetCount >= 2 && (
          <Cell 
            title="Random Preset Instrument #2"
            name="randomPresetInstrument1"
            placeholder="INSTRUMENT 2..."
            options={randomPresetInstruments}
            value={cells.randomPresetInstrument1.selected}
            locked={cells.randomPresetInstrument1.locked}
            onLock={() => toggleLock('randomPresetInstrument1')}
            onChange={(value) => handleCellChange('randomPresetInstrument1', value)}
          />       
        )}
        {actualPresetCount >= 3 && (
          <Cell 
            title="Random Preset Instrument #3"
            name="randomPresetInstrument2"
            placeholder="INSTRUMENT 3..."
            options={randomPresetInstruments}
            value={cells.randomPresetInstrument2.selected}
            locked={cells.randomPresetInstrument2.locked}
            onLock={() => toggleLock('randomPresetInstrument2')}
            onChange={(value) => handleCellChange('randomPresetInstrument2', value)}
          />
        )}
        
        <Cell 
          title="Send Effect"
          name="sendEffect"
          options={sendEffects} 
          value={cells.sendEffect.selected}
          locked={cells.sendEffect.locked}
          onLock={() => toggleLock('sendEffect')}
          onChange={(value) => handleCellChange('sendEffect', value)}
        />
      </div>
    </div>
  );
}

export default App;
