import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu asistente para encontrar eventos. ¿Qué tipo de evento te gustaría buscar?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.message }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error al conectar con el asistente.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="App" style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Asistente de Eventos</h2>
      <div style={{ background: '#f4f4f4', padding: 16, borderRadius: 8, minHeight: 300, marginBottom: 16, overflowY: 'auto', height: 400 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '8px 0' }}>
            <span style={{ background: msg.role === 'user' ? '#d1e7dd' : '#fff', padding: 8, borderRadius: 6, display: 'inline-block', maxWidth: '80%' }}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <div style={{ color: '#888' }}>Escribiendo...</div>}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>Enviar</button>
      </form>
    </div>
  );
}

export default App;
