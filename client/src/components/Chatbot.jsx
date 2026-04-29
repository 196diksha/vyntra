import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi';

const starterMessage = {
  role: 'assistant',
  content: 'Hi, I am the Vyntra assistant. Ask me about products, sizes, styling, or gift ideas.'
};

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([starterMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    const nextMessages = [...messages, { role: 'user', content: trimmedInput }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await axios.post('/api/chat', {
        messages: nextMessages
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: data.reply }
      ]);
    } catch (error) {
      const fallbackMessage =
        error.response?.data?.message || 'The assistant is unavailable right now.';

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: fallbackMessage }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-4 z-[70] sm:right-6">
      {isOpen && (
        <section className="mb-4 flex h-[34rem] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-4 text-left text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Vyntra Chat</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Shopping assistant</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Ask about sizes, gifting, categories, or style suggestions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/15 p-2 text-white transition hover:bg-white/10"
                aria-label="Close chat"
              >
                <FiX className="text-lg" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-4 text-left">
            {messages.map((message, index) => {
              const isAssistant = message.role === 'assistant';

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      isAssistant
                        ? 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                        : 'rounded-br-md bg-slate-900 text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-3xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-end gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner">
              <textarea
                rows="1"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about products or sizing..."
                className="max-h-28 min-h-[2.5rem] flex-1 resize-none bg-transparent px-1 py-2 text-sm text-slate-700 outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Send message"
              >
                <FiSend className="text-lg" />
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="ml-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_16px_35px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:bg-slate-800"
        aria-label="Open chat assistant"
      >
        <FiMessageCircle className="text-2xl" />
      </button>
    </div>
  );
}

export default Chatbot;
