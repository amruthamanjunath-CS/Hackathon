import React, { useState, useEffect } from "react";
import { 
  Heart, Shield, Brain, Calendar, Bell, Users, Volume2, 
  Smile, Award, AlertTriangle, CheckCircle2, ArrowLeft, 
  Upload, Settings, TrendingUp, Sparkles, Moon, Sun, Clock
} from "lucide-react";

export default function RemindAndReconnectApp() {
  const [role, setRole] = useState(null); // null, 'patient', 'caregiver'
  
  // Patient State
  const [timeOfDay, setTimeOfDay] = useState("Morning"); // Morning, Afternoon, Evening
  const [medsTaken, setMedsTaken] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // home, games, album, routine
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Morning Tablets", time: "8:30 AM", type: "meds", pending: true },
    { id: 2, title: "Afternoon Walk & Water", time: "2:00 PM", type: "routine", pending: true }
  ]);

  // Game 1 State (Floral Match)
  const [cards, setCards] = useState([
    { id: 1, name: "Sunflower", emoji: "🌻", matched: false },
    { id: 2, name: "Rose", emoji: "🌹", matched: false },
    { id: 3, name: "Sunflower", emoji: "🌻", matched: false },
    { id: 4, name: "Rose", emoji: "🌹", matched: false }
  ]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [gameMessage, setGameMessage] = useState("Tap two cards with the same flower!");

  // Memory Album State
  const [photos, setPhotos] = useState([
    { id: 1, title: "Granddaughter's Wedding", note: "Look at Sarah smiling in her white dress! Do you remember this sunny day?", img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80" },
    { id: 2, title: "Family Vacation in Shimla", note: "Drinking hot tea in the mountains with everyone.", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" }
  ]);

  // Caregiver / Anomaly State
  const [simulatedDay, setSimulatedDay] = useState("Thursday");
  const [weeklyEngagement, setWeeklyEngagement] = useState([
    { day: "Mon", score: 85, meds: "Completed", status: "Normal" },
    { day: "Tue", score: 90, meds: "Completed", status: "Normal" },
    { day: "Wed", score: 88, meds: "Completed", status: "Normal" },
    { day: "Thu", score: 42, meds: "Missed", status: "Anomaly Alert ⚠️" },
    { day: "Fri", score: 78, meds: "Completed", status: "Recovering" },
    { day: "Sat", score: 82, meds: "Completed", status: "Normal" },
    { day: "Sun", score: 86, meds: "Completed", status: "Normal" }
  ]);

  // Voice Speech Helper
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Slower cadence for dementia care
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Card click handler for Floral Match Game
  const handleCardClick = (index) => {
    if (flippedCards.length === 2 || cards[index].matched || flippedCards.includes(index)) return;
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].name === cards[secondIdx].name) {
        setTimeout(() => {
          setCards(cards.map((c, i) => i === firstIdx || i === secondIdx ? { ...c, matched: true } : c));
          setFlippedCards([]);
          setGameMessage("Wonderful matching! Your memory is shining.");
          speak("Wonderful matching! Your memory is shining.");
        }, 600);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
          setGameMessage("Good try! Let's try another pair.");
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 text-slate-800 font-sans flex flex-col">
      {/* Top Header / Role Switcher */}
      <header className="bg-emerald-800 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Heart className="w-8 h-8 text-amber-300 animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold tracking-wide">Remind & Reconnect</h1>
            <p className="text-xs text-emerald-200">A Gentle Companion for Dementia Care</p>
          </div>
        </div>
        <div className="flex space-x-2 bg-emerald-900 p-1 rounded-xl">
          <button 
            onClick={() => { setRole('patient'); speak("Welcome to Remind and Reconnect Arthur. Let's have a wonderful day."); }}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition ${role === 'patient' ? 'bg-amber-400 text-emerald-950 shadow' : 'text-emerald-100 hover:bg-emerald-800'}`}
          >
            👴 Patient View (Arthur)
          </button>
          <button 
            onClick={() => setRole('caregiver')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition ${role === 'caregiver' ? 'bg-amber-400 text-emerald-950 shadow' : 'text-emerald-100 hover:bg-emerald-800'}`}
          >
            🛡️ Caregiver Dashboard
          </button>
        </div>
      </header>

      {/* Landing / Role Choice */}
      {!role && (
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-emerald-100">
            <Sparkles className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-emerald-900 mb-3">Welcome to Remind & Reconnect</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Designed with calming aesthetics, spoken routines, reminiscence memory albums, and intelligent anomaly tracking for family caregivers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => { setRole('patient'); speak("Welcome Arthur. Let's have a wonderful day."); }}
                className="p-6 bg-emerald-700 text-white rounded-2xl font-bold text-xl hover:bg-emerald-800 shadow-lg transition flex flex-col items-center justify-center space-y-2"
              >
                <span>👴 Enter Patient Screen</span>
                <span className="text-sm font-normal text-emerald-200">Large buttons, spoken reminders, gentle games</span>
              </button>
              <button 
                onClick={() => setRole('caregiver')}
                className="p-6 bg-amber-500 text-emerald-950 rounded-2xl font-bold text-xl hover:bg-amber-400 shadow-lg transition flex flex-col items-center justify-center space-y-2"
              >
                <span>🛡️ Enter Caregiver Dashboard</span>
                <span className="text-sm font-normal text-amber-900">Engagement analytics & anomaly alerts</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* PATIENT VIEW */}
      {role === 'patient' && (
        <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 md:p-6">
          {/* Status Banner */}
          <div className="bg-white rounded-3xl p-6 shadow-md border-4 border-emerald-600 mb-6 flex justify-between items-center">
            <div>
              <span className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Current Part of Day</span>
              <h2 className="text-4xl font-black text-emerald-950 flex items-center gap-3">
                <Sun className="w-10 h-10 text-amber-500" /> {timeOfDay}, Arthur
              </h2>
            </div>
            <button 
              onClick={() => speak(`Good ${timeOfDay}, Arthur. Remember to take your morning tablets and drink a glass of water.`)}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-6 py-4 rounded-2xl flex items-center gap-3 text-lg shadow-md transition transform active:scale-95"
            >
              <Volume2 className="w-8 h-8" /> Listen to Reminder
            </button>
          </div>

          {/* Navigation Tabs for Patient */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <button 
              onClick={() => setActiveTab('home')}
              className={`p-4 rounded-2xl font-bold text-lg flex flex-col items-center justify-center gap-1 transition ${activeTab === 'home' ? 'bg-emerald-800 text-white shadow-lg' : 'bg-white text-emerald-900 border-2 border-emerald-200'}`}
            >
              <Calendar className="w-7 h-7" /> Routines
            </button>
            <button 
              onClick={() => setActiveTab('games')}
              className={`p-4 rounded-2xl font-bold text-lg flex flex-col items-center justify-center gap-1 transition ${activeTab === 'games' ? 'bg-emerald-800 text-white shadow-lg' : 'bg-white text-emerald-900 border-2 border-emerald-200'}`}
            >
              <Brain className="w-7 h-7" /> Gentle Games
            </button>
            <button 
              onClick={() => setActiveTab('album')}
              className={`p-4 rounded-2xl font-bold text-lg flex flex-col items-center justify-center gap-1 transition ${activeTab === 'album' ? 'bg-emerald-800 text-white shadow-lg' : 'bg-white text-emerald-900 border-2 border-emerald-200'}`}
            >
              <Smile className="w-7 h-7" /> Memory Album
            </button>
            <button 
              onClick={() => setRole(null)}
              className="p-4 rounded-2xl font-bold text-lg bg-rose-100 text-rose-900 border-2 border-rose-300 flex flex-col items-center justify-center gap-1 hover:bg-rose-200 transition"
            >
              <ArrowLeft className="w-7 h-7" /> Exit Mode
            </button>
          </div>

          {/* Tab 1: Routines & Reminders */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border-2 border-emerald-200 shadow-md">
                <h3 className="text-2xl font-bold text-emerald-950 mb-4 flex items-center gap-2">
                  <Bell className="w-7 h-7 text-amber-500" /> Today's Reminders
                </h3>
                <div className="space-y-4">
                  <div className={`p-5 rounded-2xl border-2 flex items-center justify-between ${medsTaken ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
                    <div>
                      <span className="text-sm font-bold text-slate-500">8:30 AM • Morning Tablets</span>
                      <h4 className="text-xl font-bold text-emerald-950">Take 2 White Tablets with Water</h4>
                    </div>
                    {medsTaken ? (
                      <span className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6" /> Completed
                      </span>
                    ) : (
                      <button 
                        onClick={() => { setMedsTaken(true); speak("Thank you Arthur. Morning tablets recorded successfully."); }}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-md transition"
                      >
                        I Took My Medicine
                      </button>
                    )}
                  </div>

                  <div className="p-5 rounded-2xl border-2 bg-white border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-slate-500">2:00 PM • Afternoon Routine</span>
                      <h4 className="text-xl font-bold text-emerald-950">Glass of Water & Gentle Stroll in Garden</h4>
                    </div>
                    <button 
                      onClick={() => speak("Stay hydrated Arthur! Enjoy your stroll.")}
                      className="bg-amber-400 hover:bg-amber-300 text-emerald-950 px-6 py-3 rounded-xl font-bold text-lg shadow-md transition"
                    >
                      Listen Spoken Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Gentle Games */}
          {activeTab === 'games' && (
            <div className="bg-white p-6 rounded-3xl border-2 border-emerald-200 shadow-md">
              <h3 className="text-2xl font-bold text-emerald-950 mb-2 flex items-center gap-2">
                <Brain className="w-7 h-7 text-amber-500" /> Gentle Floral Match (No Timers or Scores)
              </h3>
              <p className="text-lg text-slate-600 mb-6">{gameMessage}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
                {cards.map((card, index) => {
                  const isFlipped = flippedCards.includes(index) || card.matched;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(index)}
                      className={`h-36 rounded-2xl text-5xl flex items-center justify-center border-4 shadow-md transition transform ${card.matched ? 'bg-emerald-100 border-emerald-400' : isFlipped ? 'bg-amber-50 border-amber-400' : 'bg-emerald-800 border-emerald-900 text-white'}`}
                    >
                      {isFlipped ? card.emoji : "❓"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Memory Album */}
          {activeTab === 'album' && (
            <div className="bg-white p-6 rounded-3xl border-2 border-emerald-200 shadow-md">
              <h3 className="text-2xl font-bold text-emerald-950 mb-4 flex items-center gap-2">
                <Smile className="w-7 h-7 text-amber-500" /> Familiar Family Album
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {photos.map(p => (
                  <div key={p.id} className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 flex flex-col space-y-3">
                    <img src={p.img} alt={p.title} className="w-full h-48 object-cover rounded-xl shadow" />
                    <h4 className="text-xl font-bold text-emerald-950">{p.title}</h4>
                    <p className="text-slate-700 italic">"{p.note}"</p>
                    <button 
                      onClick={() => speak(p.note)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow transition"
                    >
                      <Volume2 className="w-5 h-5" /> Play Voice Note from Sarah
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CAREGIVER DASHBOARD */}
      {role === 'caregiver' && (
        <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 md:p-6 space-y-6">
          {/* Caregiver Header & Anomaly Alert */}
          <div className="bg-gradient-to-r from-rose-900 to-rose-800 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-300 font-bold uppercase text-xs tracking-wider">
                <AlertTriangle className="w-5 h-5" /> Automated Anomaly Detection
              </div>
              <h2 className="text-2xl font-bold">Alert Raised for Thursday (Activity Drop)</h2>
              <p className="text-rose-200 text-sm">
                Arthur's engagement dropped 46% below his 14-day baseline. Morning medication was unconfirmed.
              </p>
            </div>
            <button 
              onClick={() => alert("Calling local care support or sending check-in prompt...")}
              className="bg-amber-400 hover:bg-amber-300 text-rose-950 font-bold px-6 py-3 rounded-xl shadow-lg transition whitespace-nowrap"
            >
              📞 Notify Local Caregiver / Daughter
            </button>
          </div>

          {/* Weekly Engagement Overview */}
          <div className="bg-white p-6 rounded-3xl border-2 border-emerald-200 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-700" /> Arthur's Simulated Week Activity Log
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">Simulate Day:</span>
                <select 
                  value={simulatedDay} 
                  onChange={(e) => setSimulatedDay(e.target.value)}
                  className="bg-emerald-50 border-2 border-emerald-300 rounded-xl px-3 py-2 font-bold text-emerald-950"
                >
                  {weeklyEngagement.map(d => <option key={d.day} value={d.day}>{d.day} ({d.status})</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3">
              {weeklyEngagement.map((item) => (
                <div key={item.day} className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-between text-center ${item.day === simulatedDay ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-slate-200 bg-slate-50'}`}>
                  <span className="font-bold text-emerald-900">{item.day}</span>
                  <div className="my-3">
                    <span className="text-2xl font-black text-emerald-950">{item.score}%</span>
                    <span className="text-xs block text-slate-500">Engagement</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${item.meds === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {item.meds}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration & Uploader */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border-2 border-emerald-200 shadow-md space-y-4">
              <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                <Upload className="w-6 h-6 text-amber-500" /> Add Reminiscence Photo & Voice Note
              </h3>
              <input type="text" placeholder="Title (e.g., Summer Picnic)" className="w-full p-3 rounded-xl border-2 border-slate-200" />
              <textarea placeholder="Voice Note text script for family member..." className="w-full p-3 rounded-xl border-2 border-slate-200" rows={3}></textarea>
              <button 
                onClick={() => alert("Photo and voice note uploaded successfully!")}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl shadow transition"
              >
                Upload to Arthur's Tablet
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-emerald-200 shadow-md space-y-4">
              <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                <Settings className="w-6 h-6 text-emerald-700" /> Routine Scheduler
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-950">Morning Tablets (8:30 AM)</span>
                  <span className="text-emerald-700 font-bold text-sm">Active</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-950">Afternoon Walk (2:00 PM)</span>
                  <span className="text-emerald-700 font-bold text-sm">Active</span>
                </div>
                <button 
                  onClick={() => alert("New routine scheduled!")}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold py-3 rounded-xl shadow transition"
                >
                  + Add Custom Routine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}