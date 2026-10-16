import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface KiyoshiState {
  messages: Message[];
  isThinking: boolean;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (text: string) => void;
}

let socket: WebSocket | null = null;

export const useKiyoshi = create<KiyoshiState>((set, get) => ({
  messages: [],
  isThinking: false,
  isConnected: false,

  connect: () => {
    if (socket) return;

    socket = new WebSocket('ws://localhost:8765');

    socket.onopen = () => {
      console.log('[Kiyoshi] WebSocket connected');
      set({ isConnected: true });
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'response') {
        const assistantMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.content,
        };
        set((state) => ({
          messages: [...state.messages, assistantMsg],
          isThinking: false,
        }));
      }
    };

    socket.onerror = (error) => {
      console.error('[Kiyoshi] WebSocket error:', error);
      set({ isConnected: false, isThinking: false });
    };

    socket.onclose = () => {
      console.log('[Kiyoshi] WebSocket disconnected');
      set({ isConnected: false });
      socket = null;
    };
  },

  disconnect: () => {
    if (socket) {
      socket.close();
      socket = null;
      set({ isConnected: false });
    }
  },

  sendMessage: (text: string) => {
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    set((state) => ({
      messages: [...state.messages, newUserMsg],
      isThinking: true,
    }));

    const { connect } = get();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      connect();
    }

    setTimeout(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'message',
          content: text,
        }));
      } else {
        setTimeout(() => {
          const fallbackMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "[Kiyoshi] (Offline) Engine not connected. Running in simulation mode.",
          };
          set((state) => ({
            messages: [...state.messages, fallbackMsg],
            isThinking: false,
          }));
        }, 800);
      }
    }, 300);
  },
}));
