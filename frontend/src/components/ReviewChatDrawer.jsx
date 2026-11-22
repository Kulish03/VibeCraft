import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquareCode, Sparkles, User, HelpCircle } from 'lucide-react';
import api from '../services/api';

const QUICK_PROMPTS = [
  'Why does this bug occur?',
  'Provide a step-by-step debugging hint',
  'How can I optimize the space complexity?',
  'Explain the security vulnerability in simple terms',
];

const ReviewChatDrawer = ({ review, onUpdateChat }) => {
  const [messages, setMessages] = useState(review?.chatMessages || []);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(review?.chatMessages || []);
  }, [review]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || sending) return;

    const userMsg = { role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await api.post(`/reviews/${review._id}/chat`, { message: text.trim() });
      if (res.data.success) {
        setMessages(res.data.chatMessages);
        if (onUpdateChat) {
          onUpdateChat(res.data.chatMessages);
        }
      }
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: `Error: ${err.response?.data?.message || 'Failed to communicate with AI reviewer.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <MessageSquareCode size={18} color="var(--primary-600)" />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          AI Follow-up Discussion
        </span>
      </div>

      {/* Quick Prompts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            className="filter-pill"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            onClick={() => handleSend(prompt)}
            disabled={sending}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message History List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          padding: '0.5rem',
          background: 'var(--bg-app)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '0.75rem',
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <HelpCircle size={24} style={{ margin: '0 auto 0.35rem', color: 'var(--primary-500)' }} />
            <div>Have a question about this review?</div>
            <div style={{ fontSize: '0.775rem' }}>Ask why an error occurs or request specific debugging hints.</div>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={idx}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  gap: '0.4rem',
                  alignItems: 'flex-start',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                }}
              >
                <div
                  style={{
                    width: '1.6rem',
                    height: '1.6rem',
                    borderRadius: '50%',
                    background: isUser ? 'var(--primary-600)' : '#EEF2FF',
                    color: isUser ? '#FFFFFF' : 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}
                >
                  {isUser ? <User size={12} /> : <Sparkles size={12} />}
                </div>

                <div
                  style={{
                    background: isUser ? 'var(--primary-600)' : 'var(--bg-surface)',
                    color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                    padding: '0.55rem 0.85rem',
                    borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    border: isUser ? 'none' : '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-xs)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}

        {sending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', alignSelf: 'flex-start' }}>
            <div style={{ width: '1.6rem', height: '1.6rem', borderRadius: '50%', background: '#EEF2FF', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={12} />
            </div>
            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem 0.85rem', borderRadius: '12px', fontSize: '0.825rem', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)' }}>
              Thinking and formulating pedagogical hint...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '0.5rem' }}
      >
        <input
          type="text"
          placeholder="Ask a question about this review..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
          style={{
            flex: 1,
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={sending || !input.trim()}
          style={{ padding: '0.55rem 0.95rem' }}
          title="Send message"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};

export default ReviewChatDrawer;
