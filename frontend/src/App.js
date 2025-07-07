import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const PRIORITY_OPTIONS = [
  { key: 'tipo', label: 'Tipo de evento' },
  { key: 'barrio', label: 'Barrio' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'precio', label: 'Precio' },
];

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu asistente para encontrar eventos. ¿Qué tipo de evento te gustaría buscar?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [priority, setPriority] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Detectar si la IA pide prioridad
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]?.content || '';
    if (lastMsg.includes('prioridad') && lastMsg.toLowerCase().includes('elige') && lastMsg.toLowerCase().includes('tipo')) {
      setShowPriority(true);
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e && e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, prioridad: priority.length === 4 ? priority.map(p => p.key) : undefined })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.message }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error al conectar con el asistente.' }]);
    }
    setLoading(false);
  };

  // Drag & drop para prioridad
  const onDragStart = (idx) => (e) => {
    e.dataTransfer.setData('idx', idx);
  };
  const onDrop = (idx) => (e) => {
    const from = parseInt(e.dataTransfer.getData('idx'), 10);
    if (from === idx) return;
    const newPriority = [...priority];
    const [moved] = newPriority.splice(from, 1);
    newPriority.splice(idx, 0, moved);
    setPriority(newPriority);
  };
  const onDragOver = (e) => e.preventDefault();

  const handlePriorityConfirm = async () => {
    setShowPriority(false);
    setLoading(true);
    // Enviar prioridad al backend (opcional, para compatibilidad)
    await fetch('http://localhost:3001/prioridad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prioridad: priority.map(p => p.key) })
    });
    // Simular mensaje del usuario
    const newMessages = [...messages, { role: 'user', content: `Mi prioridad es: ${priority.map(p => p.label).join(', ')}` }];
    setMessages(newMessages);
    // Continuar conversación, enviando la prioridad
    try {
      const res = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, prioridad: priority.map(p => p.key) })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.message }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error al conectar con el asistente.' }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (showPriority && priority.length === 0) {
      setPriority([...PRIORITY_OPTIONS]);
    }
  }, [showPriority]);

  return (
    <div className="App">
      <h2>Asistente de Eventos</h2>
      <div className="chat-container">
        {messages.map((msg, i) => (
          <div key={i} className={`message-row ${msg.role}`}>
            <span className={`bubble ${msg.role}`}>{msg.content}</span>
          </div>
        ))}
        {loading && <div className="message-row assistant"><span className="bubble assistant" style={{ color: '#888' }}>Escribiendo...</span></div>}
        <div ref={chatEndRef} />
      </div>
      {showPriority ? (
        <div style={{ background: '#f8fafc', border: '1.5px solid #e0e7ef', borderRadius: 12, padding: 18, marginBottom: 18 }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Arrastra para ordenar tu prioridad:</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {priority.map((p, idx) => (
              <li
                key={p.key}
                draggable
                onDragStart={onDragStart(idx)}
                onDrop={onDrop(idx)}
                onDragOver={onDragOver}
                style={{
                  background: '#fff',
                  border: '1.5px solid #cfd8dc',
                  borderRadius: 8,
                  padding: '12px 18px',
                  fontSize: '1.08rem',
                  fontWeight: 500,
                  cursor: 'grab',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  userSelect: 'none',
                }}
              >
                {idx + 1}. {p.label}
              </li>
            ))}
          </ul>
          <button style={{ marginTop: 18, width: '100%' }} onClick={handlePriorityConfirm} disabled={loading}>Confirmar prioridad</button>
        </div>
      ) : (
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>Enviar</button>
        </form>
      )}
    </div>
  );
}

export default App;
