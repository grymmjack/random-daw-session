import React, { useState, useEffect, useCallback, useRef } from 'react';

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
  const alarmSound = useRef(new Audio('/audio/alarm-done.wav'));
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

  const [animatingCells, setAnimatingCells] = useState({});

  const handleCellChange = (cellName, option) => {
    setCells(prev => ({
      ...prev,
      [cellName]: { ...prev[cellName], selected: option.name },
    }));
    // Special handling if the count changes, clear higher number instruments if needed
    if (cellName === 'randomPresetInstrumentCount') {
        const count = parseInt(option.name, 10);
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
    // Only reset timer state, don't touch time constraint value
    const initialTimeSeconds = parseInt(timeSelectValue, 10) * 60;
    setCountdown({
      initialTime: initialTimeSeconds,
      timeRemaining: initialTimeSeconds,
      isTimerRunning: false,
      paused: false
    });
    // Stop alarm sound when reset
    alarmSound.current.pause();
    alarmSound.current.currentTime = 0;
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
      // Play alarm sound in loop
      alarmSound.current.loop = true;
      alarmSound.current.play();
    }

    // Cleanup function to clear interval when component unmounts or dependencies change
    return () => clearInterval(intervalId);

  }, [countdown.isTimerRunning, countdown.paused, countdown.timeRemaining]); // Dependencies for the effect

  useEffect(() => {
    const minutes = timeSelectValue === 'Random' ? 15 : parseInt(timeSelectValue, 10);
    const timeInSeconds = minutes * 60;
    setCountdown(prev => ({
      ...prev,
      initialTime: timeInSeconds,
      timeRemaining: timeInSeconds
    }));
  }, [timeSelectValue]);

  // Randomize function update
  const randomize = useCallback(() => {
    // Use existing settings, DO NOT randomize checkboxes
    const currentSettings = settings;

    // Randomize Time Constraint value if checked
    if (currentSettings.timeConstraint) {
      const timeOptions = ['1', '15', '30', '45', '60', '120', '180'];
      const randomTime = getRandomItem(timeOptions);
      setTimeSelectValue(randomTime);
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

    // Get a new Oblique Strategy
    setObliqueStrategy(getRandomItem(quotes));

    // Get a new Tempo
    setTempo(`${Math.floor(Math.random() * (180 - 60 + 1)) + 60} BPM`);

    // Start slot machine animation sequence
    const cellsToUpdate = {};
    const cellsToAnimate = {};

    // First, mark all cells as spinning
    Object.keys(cells).forEach(cellName => {
      const cell = cells[cellName];
      if (!cell.locked) {
        cellsToUpdate[cellName] = { ...cell, selected: cell.selected }; // Keep current value
        cellsToAnimate[cellName] = true;
      }
    });

    // Apply spinning animation
    setCells(prevCells => ({ ...prevCells, ...cellsToUpdate }));
    setAnimatingCells(cellsToAnimate);

    // After initial spin, update values with a delay
    setTimeout(() => {
      // Generate new random values for all cells
      Object.keys(cells).forEach(cellName => {
        const cell = cells[cellName];
        
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
            default:
                break;
        }

        if (applyRandomization && Array.isArray(options) && options.length > 0) {
             const randomOption = getRandomItem(options);
             if (cells[cellName].selected !== randomOption.name) {
                 cellsToUpdate[cellName] = { ...cell, selected: randomOption.name };
             }
          } else if (!cells[cellName].locked) {
            // If not randomized (either by chance or because it's not an applicable cell type), clear it.
            if (cells[cellName].selected !== '') {
                cellsToUpdate[cellName] = { ...cell, selected: '' };
            }
          }
      });

      // Handle randomization for preset instruments
      const presetCells = ['randomPresetInstrument0', 'randomPresetInstrument1', 'randomPresetInstrument2'];
      const presetCount = parseInt(cells.randomPresetInstrumentCount.selected, 10) || 0;

      // Randomize preset count if not locked
      if (!cells.randomPresetInstrumentCount.locked) {
        const countOptions = instrumentCounts.map(opt => opt.name).filter(n => n !== '0');
        const randomCountName = getRandomItem(countOptions);
        const newPresetCount = parseInt(randomCountName, 10);
        cellsToUpdate.randomPresetInstrumentCount = { ...cells.randomPresetInstrumentCount, selected: randomCountName };

        // Update preset instruments based on new count
        presetCells.forEach((cellName, index) => {
          const cell = cells[cellName];
          if (!cell.locked && index < newPresetCount) {
            const randomOption = getRandomItem(randomPresetInstruments);
            cellsToUpdate[cellName] = { ...cell, selected: randomOption.name };
          } else if (!cell.locked && index >= newPresetCount) {
            cellsToUpdate[cellName] = { ...cell, selected: '' };
          }
        });
      } else {
        // If preset count is locked, update instruments based on locked count
        presetCells.forEach((cellName, index) => {
          const cell = cells[cellName];
          if (!cell.locked && index < presetCount) {
            const randomOption = getRandomItem(randomPresetInstruments);
            cellsToUpdate[cellName] = { ...cell, selected: randomOption.name };
          } else if (!cell.locked && index >= presetCount) {
            cellsToUpdate[cellName] = { ...cell, selected: '' };
          }
        });
      }

      // Apply all updates together
      setCells(prevCells => ({ ...prevCells, ...cellsToUpdate }));
      // Reset animation state after applying values
      setAnimatingCells({});
    }, 0);

  }, [settings, cells]); // Removed unnecessary dependencies

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
          onChange={(option) => handleCellChange('daw', option)}
          isAnimating={!!animatingCells.daw}
          hint={daws.find(opt => opt.name === cells.daw.selected)?.hint}
          index={0}
        />
        <Cell 
          title="Synth Instrument"
          name="synthInstrument"
          options={synthInstruments}
          value={cells.synthInstrument.selected}
          locked={cells.synthInstrument.locked}
          onLock={() => toggleLock('synthInstrument')}
          onChange={(option) => handleCellChange('synthInstrument', option)}
          isAnimating={!!animatingCells.synthInstrument}
          hint={synthInstruments.find(opt => opt.name === cells.synthInstrument.selected)?.hint}
          index={1}
        />
        <Cell 
          title="Synth Effect"
          name="synthEffect"
          options={synthEffects}
          value={cells.synthEffect.selected}
          locked={cells.synthEffect.locked}
          onLock={() => toggleLock('synthEffect')}
          onChange={(option) => handleCellChange('synthEffect', option)}
          isAnimating={!!animatingCells.synthEffect}
          hint={synthEffects.find(opt => opt.name === cells.synthEffect.selected)?.hint}
          index={2}
        />
        <Cell 
          title="Drum Instrument"
          name="drumInstrument"
          options={drumInstruments}
          value={cells.drumInstrument.selected}
          locked={cells.drumInstrument.locked}
          onLock={() => toggleLock('drumInstrument')}
          onChange={(option) => handleCellChange('drumInstrument', option)}
          isAnimating={!!animatingCells.drumInstrument}
          hint={drumInstruments.find(opt => opt.name === cells.drumInstrument.selected)?.hint}
          index={3}
        />
        <Cell 
          title="Drum Effect"
          name="drumEffect"
          options={drumEffects}
          value={cells.drumEffect.selected}
          locked={cells.drumEffect.locked}
          onLock={() => toggleLock('drumEffect')}
          onChange={(option) => handleCellChange('drumEffect', option)}
          isAnimating={!!animatingCells.drumEffect}
          hint={drumEffects.find(opt => opt.name === cells.drumEffect.selected)?.hint}
          index={4}
        />
        
        <Cell 
          title="# Random Preset Instruments"
          name="randomPresetInstrumentCount"
          options={instrumentCounts}
          value={cells.randomPresetInstrumentCount.selected}
          locked={cells.randomPresetInstrumentCount.locked}
          onLock={() => toggleLock('randomPresetInstrumentCount')}
          onChange={(option) => handleCellChange('randomPresetInstrumentCount', option)}
          placeholder="COUNT..."
          hideImage={true}
          isAnimating={!!animatingCells.randomPresetInstrumentCount}
          index={5}
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
            onChange={(option) => handleCellChange('randomPresetInstrument0', option)}
            isAnimating={!!animatingCells.randomPresetInstrument0}
            hint={randomPresetInstruments.find(opt => opt.name === cells.randomPresetInstrument0.selected)?.hint}
            index={6}
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
            onChange={(option) => handleCellChange('randomPresetInstrument1', option)}
            isAnimating={!!animatingCells.randomPresetInstrument1}
            hint={randomPresetInstruments.find(opt => opt.name === cells.randomPresetInstrument1.selected)?.hint}
            index={7}
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
            onChange={(option) => handleCellChange('randomPresetInstrument2', option)}
            isAnimating={!!animatingCells.randomPresetInstrument2}
            hint={randomPresetInstruments.find(opt => opt.name === cells.randomPresetInstrument2.selected)?.hint}
            index={8}
          />
        )}
        
        <Cell 
          title="Send Effect"
          name="sendEffect"
          options={sendEffects} 
          value={cells.sendEffect.selected}
          locked={cells.sendEffect.locked}
          onLock={() => toggleLock('sendEffect')}
          onChange={(option) => handleCellChange('sendEffect', option)}
          isAnimating={!!animatingCells.sendEffect}
          hint={sendEffects.find(opt => opt.name === cells.sendEffect.selected)?.hint}
          index={9}
        />
      </div>
    </div>
  );
}

export default App;
