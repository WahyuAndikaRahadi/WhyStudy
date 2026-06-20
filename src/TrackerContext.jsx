import React, { createContext, useContext, useState, useEffect } from 'react';
import { materiData, WAJIB_SUBJECTS, ALL_PILIHAN_SUBJECTS } from './materiData';
export { WAJIB_SUBJECTS, ALL_PILIHAN_SUBJECTS };

const TrackerContext = createContext();

const TOTAL_CHECKBOXES_PER_ROW = 5;

// Helper to count possible checkboxes for a list of subjects
const countTotalPossible = (subjectsList) => {
  let total = 0;
  subjectsList.forEach(subject => {
    if (materiData[subject]) {
      total += materiData[subject].length * TOTAL_CHECKBOXES_PER_ROW;
    }
  });
  return total;
};

export const TrackerProvider = ({ children }) => {
  // 1. Initialize Active Optional Subjects (TKA Pilihan)
  const [activeOptionalSubjects, setActiveOptionalSubjects] = useState(() => {
    const saved = localStorage.getItem('studyTrackerActiveOptionals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(s => ALL_PILIHAN_SUBJECTS.includes(s));
      } catch (e) {
        console.error(e);
      }
    }
    // Default optional subjects
    return ['Matematika Lanjut', 'PKK'];
  });

  // 2. Initialize tracker topics (merge/migrate default and saved)
  const [topics, setTopics] = useState(() => {
    const defaultData = {};
    Object.keys(materiData).forEach(subject => {
      defaultData[subject] = materiData[subject].map(topicName => ({
        topic: topicName,
        understanding: 'Tidak paham',
        catatan: false,
        latsol1: false,
        latsol2: false,
        latsol3: false,
        recall: false
      }));
    });

    const saved = localStorage.getItem('studyTrackerData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge missing subjects (e.g. newly added subjects)
        Object.keys(defaultData).forEach(subject => {
          if (!parsed[subject]) {
            parsed[subject] = defaultData[subject];
          } else {
            // Validate & migrate entries based on topic name matching
            parsed[subject] = defaultData[subject].map((defaultRow) => {
              const savedRow = (parsed[subject] || []).find(r => r.topic === defaultRow.topic) || {};
              const understanding = savedRow.understanding || savedRow.level || 'Tidak paham';
              
              const newRow = {
                topic: defaultRow.topic,
                understanding: (understanding === 'Easy' || understanding === 'Medium' || understanding === 'Hard') ? 'Tidak paham' : understanding,
                catatan: savedRow.catatan !== undefined ? !!savedRow.catatan : false,
                latsol1: savedRow.latsol1 !== undefined ? !!savedRow.latsol1 : (savedRow.soal1 !== undefined ? !!savedRow.soal1 : false),
                latsol2: savedRow.latsol2 !== undefined ? !!savedRow.latsol2 : (savedRow.soal2 !== undefined ? !!savedRow.soal2 : false),
                latsol3: savedRow.latsol3 !== undefined ? !!savedRow.latsol3 : (savedRow.soal3 !== undefined ? !!savedRow.soal3 : false),
                recall: savedRow.recall !== undefined ? !!savedRow.recall : false
              };
              return newRow;
            });
          }
        });
        return parsed;
      } catch (e) {
        console.error('Failed to parse tracker data', e);
      }
    }
    return defaultData;
  });

  // 3. Initialize Tryout Entries
  const [tryoutEntries, setTryoutEntries] = useState(() => {
    const saved = localStorage.getItem('studyTrackerTryoutEntries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tryout entries', e);
      }
    }
    return [];
  });

  // 4. Initialize History
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('studyTrackerHistory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('studyTrackerActiveOptionals', JSON.stringify(activeOptionalSubjects));
  }, [activeOptionalSubjects]);

  useEffect(() => {
    localStorage.setItem('studyTrackerData', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('studyTrackerHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('studyTrackerTryoutEntries', JSON.stringify(tryoutEntries));
  }, [tryoutEntries]);

  const addTryoutEntry = (entry) => {
    setTryoutEntries(prev => [...prev, entry]);
  };

  const deleteTryoutEntry = (id) => {
    setTryoutEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const totalWajibPossible = countTotalPossible(WAJIB_SUBJECTS);

  const getActivePilihanPossible = () => {
    return countTotalPossible(activeOptionalSubjects);
  };

  const getCategoryCompletedCount = (categoryType, currentData = topics, optionals = activeOptionalSubjects) => {
    const subjectsList = categoryType === 'wajib' ? WAJIB_SUBJECTS : optionals;
    let checked = 0;
    subjectsList.forEach(subject => {
      if (currentData[subject]) {
        currentData[subject].forEach(row => {
          if (row.catatan) checked++;
          if (row.latsol1) checked++;
          if (row.latsol2) checked++;
          if (row.latsol3) checked++;
          if (row.recall) checked++;
        });
      }
    });
    return checked;
  };

  const toggleSubjectActivation = (subjectName) => {
    setActiveOptionalSubjects(prev => {
      const isAlreadyActive = prev.includes(subjectName);
      if (isAlreadyActive) {
        if (prev.length <= 1) return prev;
        return prev.filter(s => s !== subjectName);
      } else {
        return [...prev, subjectName];
      }
    });
  };

  const toggleCheck = (subject, index, key) => {
    setTopics(prev => {
      const updatedSubject = [...prev[subject]];
      updatedSubject[index] = {
        ...updatedSubject[index],
        [key]: !updatedSubject[index][key]
      };
      
      const newData = {
        ...prev,
        [subject]: updatedSubject
      };

      const completedWajib = getCategoryCompletedCount('wajib', newData);
      const completedPilihan = getCategoryCompletedCount('pilihan', newData, activeOptionalSubjects);
      const activePilihanPossible = countTotalPossible(activeOptionalSubjects);

      setHistory(prevHistory => {
        const newEntry = {
          timestamp: Date.now(),
          completedWajib,
          completedPilihan,
          activePilihanPossible
        };
        return [...prevHistory, newEntry];
      });

      return newData;
    });
  };

  const setUnderstanding = (subject, index, value) => {
    setTopics(prev => {
      const updatedSubject = [...prev[subject]];
      updatedSubject[index] = {
        ...updatedSubject[index],
        understanding: value
      };
      return {
        ...prev,
        [subject]: updatedSubject
      };
    });
  };

  const getSubjectProgress = (subject) => {
    const rows = topics[subject] || [];
    if (rows.length === 0) return { checkedCount: 0, totalCount: 0, percentage: 0 };
    
    let checkedCount = 0;
    rows.forEach(row => {
      if (row.catatan) checkedCount++;
      if (row.latsol1) checkedCount++;
      if (row.latsol2) checkedCount++;
      if (row.latsol3) checkedCount++;
      if (row.recall) checkedCount++;
    });

    const totalCount = rows.length * TOTAL_CHECKBOXES_PER_ROW;
    const percentage = Math.round((checkedCount / totalCount) * 100);
    return { checkedCount, totalCount, percentage };
  };

  const getCategoryProgress = (categoryType) => {
    if (categoryType === 'wajib') {
      const completed = getCategoryCompletedCount('wajib');
      return {
        completed,
        possible: totalWajibPossible,
        percentage: totalWajibPossible > 0 ? Math.round((completed / totalWajibPossible) * 100) : 0
      };
    } else {
      const completed = getCategoryCompletedCount('pilihan', topics, activeOptionalSubjects);
      const possible = getActivePilihanPossible();
      return {
        completed,
        possible,
        percentage: possible > 0 ? Math.round((completed / possible) * 100) : 0
      };
    }
  };

  const get7DayHistoryData = () => {
    const chartData = [];
    const today = new Date();
    const currentActivePilihanPossible = getActivePilihanPossible();

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - i);
      targetDate.setHours(23, 59, 59, 999);
      
      const targetTimestamp = targetDate.getTime();
      
      let wajibCompleted = 0;
      let pilihanCompleted = 0;
      let historyPilihanPossible = currentActivePilihanPossible;
      let latestMatch = null;
      
      for (const entry of history) {
        if (entry.timestamp <= targetTimestamp) {
          if (!latestMatch || entry.timestamp > latestMatch.timestamp) {
            latestMatch = entry;
          }
        }
      }
      
      if (latestMatch) {
        wajibCompleted = latestMatch.completedWajib || 0;
        pilihanCompleted = latestMatch.completedPilihan || 0;
        if (latestMatch.activePilihanPossible) {
          historyPilihanPossible = latestMatch.activePilihanPossible;
        }
      } else {
        if (i === 0 && history.length === 0) {
          wajibCompleted = getCategoryCompletedCount('wajib');
          pilihanCompleted = getCategoryCompletedCount('pilihan', topics, activeOptionalSubjects);
          historyPilihanPossible = currentActivePilihanPossible;
        }
      }

      const label = targetDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      chartData.push({
        date: label,
        'TKA Wajib (%)': totalWajibPossible > 0 ? parseFloat(((wajibCompleted / totalWajibPossible) * 100).toFixed(1)) : 0,
        'TKA Pilihan (%)': historyPilihanPossible > 0 ? parseFloat(((pilihanCompleted / historyPilihanPossible) * 100).toFixed(1)) : 0
      });
    }
    
    return chartData;
  };

  return (
    <TrackerContext.Provider value={{
      topics,
      activeOptionalSubjects,
      toggleSubjectActivation,
      toggleCheck,
      setUnderstanding,
      getSubjectProgress,
      getCategoryProgress,
      get7DayHistoryData,
      tryoutEntries,
      addTryoutEntry,
      deleteTryoutEntry,
      WAJIB_SUBJECTS,
      ALL_PILIHAN_SUBJECTS
    }}>
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
};
